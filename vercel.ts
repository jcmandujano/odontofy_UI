const apiOrigin = process.env.ODONTOFY_API_ORIGIN?.replace(/\/$/, '');

if (!apiOrigin) {
  throw new Error(
    'ODONTOFY_API_ORIGIN must be set to the public API origin, without /api/v1.'
  );
}

export const config = {
  rewrites: [
    {
      source: '/api/v1/:path*',
      destination: `${apiOrigin}/api/v1/:path*`,
    },
  ],
};
