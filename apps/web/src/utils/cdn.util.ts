export const getCdnUrl = (
  ctx: {
    PUBLIC_CDN_URL: string;
  },
  key: string,
) => {
  if (!key) {
    return "";
  }
  if (!ctx.PUBLIC_CDN_URL) {
    return `/cdn/${key}`;
  }
  return new URL(key, ctx.PUBLIC_CDN_URL).toString();
};
