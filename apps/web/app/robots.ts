import type { MetadataRoute } from 'next';

// The app and API are private to each signed-in user.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/app', '/api'] },
  };
}
