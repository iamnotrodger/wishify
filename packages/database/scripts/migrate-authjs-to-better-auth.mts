// One-off: converts Auth.js documents to the Better Auth schema. Safe to re-run.
// Run before `db:push`, because it drops the old unique indexes that block the renames.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CommandResult = Record<string, unknown>;
const run = (command: Record<string, unknown>) =>
  prisma.$runCommandRaw(command as never) as Promise<CommandResult>;

const collectionExists = async (name: string) => {
  const result = await run({ listCollections: 1, filter: { name } });
  const { firstBatch } = result.cursor as { firstBatch: unknown[] };
  return firstBatch.length > 0;
};

const dropIndexesOn = async (collection: string, fields: string[]) => {
  if (!(await collectionExists(collection))) return;
  const result = await run({ listIndexes: collection });
  const { firstBatch } = result.cursor as {
    firstBatch: { name: string; key: Record<string, number> }[];
  };
  for (const index of firstBatch) {
    if (Object.keys(index.key).some((key) => fields.includes(key))) {
      await run({ dropIndexes: collection, index: index.name });
      console.log(`dropped index ${collection}.${index.name}`);
    }
  }
};

const update = async (collection: string, q: object, u: object[]) => {
  const result = await run({
    update: collection,
    updates: [{ q, u, multi: true }],
  });
  console.log(`${collection}: updated ${result.nModified}`);
};

await dropIndexesOn('account', ['provider', 'providerAccountId']);
await dropIndexesOn('session', ['sessionToken']);

await update('user', { emailVerified: { $not: { $type: 'bool' } } }, [
  {
    $set: {
      emailVerified: { $eq: [{ $type: '$emailVerified' }, 'date'] },
      name: { $ifNull: ['$name', ''] },
      createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
      updatedAt: { $ifNull: ['$updatedAt', '$$NOW'] },
    },
  },
]);

await update('account', { provider: { $exists: true } }, [
  {
    $set: {
      providerId: '$provider',
      accountId: '$providerAccountId',
      accessToken: '$access_token',
      refreshToken: '$refresh_token',
      idToken: '$id_token',
      accessTokenExpiresAt: {
        $cond: [
          { $isNumber: '$expires_at' },
          { $toDate: { $multiply: ['$expires_at', 1000] } },
          null,
        ],
      },
    },
  },
  {
    $unset: [
      'provider',
      'providerAccountId',
      'access_token',
      'refresh_token',
      'id_token',
      'expires_at',
      'type',
      'token_type',
      'session_state',
    ],
  },
]);

// Auth.js ran with JWT sessions, so any session documents are stale.
const sessions = await run({
  delete: 'session',
  deletes: [{ q: { sessionToken: { $exists: true } }, limit: 0 }],
});
console.log(`session: deleted ${sessions.n}`);

if (await collectionExists('verificationToken')) {
  await run({ drop: 'verificationToken' });
  console.log('dropped verificationToken');
}

const missingEmail = await run({
  count: 'user',
  query: { $or: [{ email: null }, { email: { $exists: false } }] },
});
if (Number(missingEmail.n) > 0) {
  console.warn(
    `${missingEmail.n} user(s) have no email; Better Auth requires one. Fix these before db:push.`
  );
}

await prisma.$disconnect();
