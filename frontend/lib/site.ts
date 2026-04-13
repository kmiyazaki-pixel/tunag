export function siteBaseUrl(): string {
  const url = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
}
