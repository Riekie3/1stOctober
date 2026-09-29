/**
 * Turns "/assets/photos/x.jpg" into a URL that works wherever the site is
 * hosted — at a domain's root, or under a sub-path like GitHub Pages'
 * "/1stOctober/". Full URLs (https://…) are left alone.
 */
export function assetUrl(path: string | undefined): string | undefined {
  if (!path || /^(https?:|data:|blob:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL; // always ends with "/"
  if (path.startsWith(base)) return path;
  return base + path.replace(/^\//, "");
}
