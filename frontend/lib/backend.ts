export function backendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_BASE_URL;
  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not defined");
  }
  return baseUrl.replace(/\/$/, "");
}
