import { auth, isAuthenticated } from '@/auth';
import {
  invalidRequestResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { FolderSchema } from '@repo/api';
import { ObjectId } from 'bson';
import { NextResponse } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export const GET = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const { id } = req.auth!.user!;
  const [user, error] = await safeAsync(
    prisma.user.findUnique({
      where: { id },
      select: {
        folders: true,
      },
    })
  );

  if (error) {
    console.log(error);
    return unknownErrorResponse(new Error('unable to process request'));
  }

  return NextResponse.json(user?.folders || []);
});

export const POST = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const user = req.auth!.user!;
  const data = await req.json();

  const folderValidation = FolderSchema.safeParse(data);
  if (!folderValidation.success) {
    const validationError = fromZodError(folderValidation.error);
    return invalidRequestResponse(validationError);
  }

  const folder = { ...folderValidation.data, id: new ObjectId().toString() };
  const [, error] = await safeAsync(
    prisma.user.update({
      where: { id: user.id },
      data: {
        folders: {
          push: folder,
        },
      },
    })
  );

  if (error) {
    console.log(error);
    return unknownErrorResponse(new Error('failed to add folder'));
  }

  return NextResponse.json(folder);
});
