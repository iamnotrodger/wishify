import { SiteHeader } from '@/components/site-header';
import { Ban, Check, List, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

const CONTACT_EMAIL = 'rodger.retanal24@gmail.com';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What Wishify and its browser extension collect, and why.',
};

const GLANCE: {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  points: string[];
}[] = [
  {
    title: 'What we collect',
    icon: List,
    iconClassName: 'text-foreground',
    points: [
      'Your Google name, email and photo',
      'Products you choose to save',
      'Sign-in session details',
    ],
  },
  {
    title: 'What we never do',
    icon: Ban,
    iconClassName: 'text-red-700',
    points: [
      'Sell or rent your data',
      'Track your browsing',
      'Show ads or use analytics',
    ],
  },
  {
    title: 'What you control',
    icon: Check,
    iconClassName: 'text-green-700',
    points: [
      'Edit details before you save',
      'Change or remove any item',
      'Delete your account any time',
    ],
  },
];

// Order sets the section numbers.
const SECTIONS = {
  who: 'Who we are',
  collect: 'What we collect',
  extension: 'What the extension can see',
  use: 'How we use it',
  share: 'Who we share it with',
  google: 'Google user data',
  keep: 'How long we keep it',
  rights: 'Your choices and rights',
  contact: 'Changes and contact',
};

const COLLECTED = [
  {
    data: 'Account',
    source:
      'Google sign-in: name, email, profile photo and the sign-in tokens Google issues',
    why: 'To create your account and keep you signed in',
  },
  {
    data: 'Saved products',
    source:
      'The extension or the web app: link, name, brand, description, product codes, price, availability, images, categories, notes and dates you set',
    why: 'To show your wishlist',
  },
  {
    data: 'Sessions',
    source: 'Your browser: a session cookie, IP address and browser type',
    why: 'To keep your account secure',
  },
];

const ContactLink = () => (
  <a
    href={`mailto:${CONTACT_EMAIL}`}
    className='text-foreground underline underline-offset-[3px]'
  >
    {CONTACT_EMAIL}
  </a>
);

export default function Privacy() {
  return (
    <div className='bg-background min-h-svh leading-relaxed'>
      <SiteHeader />

      <main className='mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pt-16 pb-24'>
        <div className='flex max-w-[720px] flex-col gap-3'>
          <span className='text-muted-foreground text-[13px] font-medium'>
            Legal
          </span>
          <h1 className='text-[clamp(36px,5vw,56px)] leading-[1.05] font-semibold tracking-[-0.04em]'>
            Privacy policy
          </h1>
          <p className='text-muted-foreground text-lg'>
            What Wishify collects, why, and how to get rid of it.
          </p>
          <span className='text-muted-foreground text-sm'>
            Last updated October 30, 2026
          </span>
        </div>

        <section
          aria-labelledby='glance'
          className='grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4'
        >
          <h2 id='glance' className='sr-only'>
            At a glance
          </h2>
          {GLANCE.map(({ title, icon: Icon, iconClassName, points }) => (
            <div
              key={title}
              className='bg-muted/50 flex flex-col gap-3 rounded-2xl border p-6'
            >
              <span className='bg-background flex size-9 items-center justify-center rounded-[10px] border'>
                <Icon className={`size-[17px] ${iconClassName}`} />
              </span>
              <h3 className='text-[17px] font-semibold tracking-tight'>
                {title}
              </h3>
              <ul className='text-muted-foreground flex list-disc flex-col gap-1 pl-[18px] text-[15px]'>
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <div className='flex flex-wrap items-start gap-14'>
          <nav
            aria-label='On this page'
            className='flex max-w-[260px] flex-[1_1_220px] flex-col gap-0.5 text-sm'
          >
            <span className='text-muted-foreground px-2.5 pb-2 text-xs font-medium'>
              On this page
            </span>
            {Object.entries(SECTIONS).map(([id, title]) => (
              <a
                key={id}
                href={`#${id}`}
                className='hover:bg-muted rounded-[7px] px-2.5 py-1.5'
              >
                {title}
              </a>
            ))}
          </nav>

          <article className='flex max-w-[720px] min-w-0 flex-[999_1_560px] flex-col gap-10'>
            <Section id='who'>
              <p>
                Wishify is a wishlist service made of a web app and a Chrome
                extension. When this policy says &ldquo;we&rdquo;, it means the
                people who run it. You can reach us at <ContactLink />.
              </p>
            </Section>

            <Section id='collect'>
              <div className='overflow-hidden rounded-xl border'>
                <div className='overflow-x-auto'>
                  <table className='w-full min-w-[520px] border-collapse text-[15px]'>
                    <thead>
                      <tr className='bg-muted/50 text-left'>
                        {['Data', 'Where it comes from', 'Why'].map(
                          (heading) => (
                            <th
                              key={heading}
                              scope='col'
                              className='text-muted-foreground border-b px-4 py-3 text-[13px] font-medium'
                            >
                              {heading}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {COLLECTED.map(({ data, source, why }) => (
                        <tr key={data} className='border-b last:border-b-0'>
                          <td className='text-foreground px-4 py-3.5 align-top font-medium'>
                            {data}
                          </td>
                          <td className='px-4 py-3.5 align-top'>{source}</td>
                          <td className='px-4 py-3.5 align-top'>{why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p>
                We don&apos;t collect bank, card or payment details. Wishify
                never connects to your bank.
              </p>
            </Section>

            <Section id='extension'>
              <p>
                The extension reads a page only when you open it on that page.
                It reads the page&apos;s address and content and picks out the
                product&apos;s name, price, images, brand and identifiers on
                your device. Nothing is sent until you press save, and then only
                the details in the form, which you can edit first.
              </p>
              <div className='flex gap-3 rounded-xl bg-green-50 px-5 py-4 text-[15px] text-green-900'>
                <ShieldCheck className='mt-1 size-[18px] flex-none' />
                <span>
                  The extension does not record your browsing history, read
                  other tabs, or run on pages you didn&apos;t open it on.
                </span>
              </div>
            </Section>

            <Section id='use'>
              <ul className='flex list-disc flex-col gap-1.5 pl-5'>
                <li>To sign you in and keep your account secure.</li>
                <li>To store and show your wishlist.</li>
              </ul>
              <p>
                We don&apos;t sell your data, show ads, use analytics or
                tracking tools, or use your wishlist to profile you for anyone
                else.
              </p>
            </Section>

            <Section id='share'>
              <p>Only the services that run Wishify for us:</p>
              <ul className='flex list-disc flex-col gap-1.5 pl-5'>
                <li>
                  <Strong>Google</Strong>, for sign-in.
                </li>
                <li>
                  <Strong>Vercel</Strong>, for hosting the app.
                </li>
                <li>
                  <Strong>Our database host</Strong>, for storing your data.
                </li>
              </ul>
              <p>We may also disclose data if the law requires it.</p>
            </Section>

            <Section id='google'>
              <p>
                With Google sign-in we receive your name, email address and
                profile picture, plus the tokens that keep you signed in. We use
                them to create, identify and sign in to your account, and for
                nothing else. Our use of information received from Google APIs
                follows the Google API Services User Data Policy, and our use of
                information received from the extension follows the{' '}
                <a
                  href='https://developer.chrome.com/docs/webstore/program-policies/limited-use'
                  className='text-foreground underline underline-offset-[3px]'
                >
                  Chrome Web Store User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </Section>

            <Section id='keep'>
              <p>
                We keep your data while your account is open. When we delete
                your account, we delete your saved products, categories and
                sessions with it.
              </p>
            </Section>

            <Section id='rights'>
              <ul className='flex list-disc flex-col gap-1.5 pl-5'>
                <li>
                  <Strong>Edit:</Strong> change or remove any saved product in
                  the app at any time.
                </li>
                <li>
                  <Strong>Copy:</Strong> email us for a copy of your data.
                </li>
                <li>
                  <Strong>Delete:</Strong> email us from the address you sign in
                  with, and we&apos;ll delete your account.
                </li>
                <li>
                  <Strong>Extension:</Strong> remove it from Chrome at any time.
                  Your saved items stay in your account.
                </li>
              </ul>
              <p>
                Depending on where you live, you may have more rights, such as
                access, correction and objection. Email us at <ContactLink />.
              </p>
            </Section>

            <Section id='contact'>
              <p>
                If this policy changes, we&apos;ll update this page and its
                date. Questions go to <ContactLink />.
              </p>
            </Section>
          </article>
        </div>
      </main>

      <footer className='border-t'>
        <div className='text-muted-foreground mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-7 text-sm'>
          <span>© 2026 Wishify</span>
          <nav aria-label='Footer' className='flex gap-5'>
            <Link
              href='/privacy'
              aria-current='page'
              className='text-foreground font-medium'
            >
              Privacy
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

const Section = ({
  id,
  children,
}: {
  id: keyof typeof SECTIONS;
  children: React.ReactNode;
}) => {
  const number = Object.keys(SECTIONS).indexOf(id) + 1;

  return (
    <section
      id={id}
      aria-labelledby={`h-${id}`}
      className='text-foreground/80 flex scroll-mt-6 flex-col gap-3'
    >
      <h2
        id={`h-${id}`}
        className='text-foreground text-[22px] font-semibold tracking-[-0.02em]'
      >
        {number}. {SECTIONS[id]}
      </h2>
      {children}
    </section>
  );
};

const Strong = ({ children }: { children: React.ReactNode }) => (
  <span className='text-foreground font-medium'>{children}</span>
);
