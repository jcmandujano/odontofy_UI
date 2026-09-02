import { routes, type VercelConfig } from '@vercel/config/v1';

const apiOrigin = process.env.ODONTOFY_API_ORIGIN?.replace(/\/$/, '');

if (!apiOrigin) {
  throw new Error(
    'ODONTOFY_API_ORIGIN must be set to the public API origin, without /api/v1.'
  );
}

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/v1/:path*', `${apiOrigin}/api/v1/:path*`),
  ],
};
