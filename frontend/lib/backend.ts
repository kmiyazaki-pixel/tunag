export function backendBaseUrl(): string {
  const hostport = process.env.BACKEND_HOSTPORT;
  if (!hostport) {
    throw new Error("BACKEND_HOSTPORT is not defined");
  }

  // 既に http:// または https:// が付いていたらそのまま使う
  if (hostport.startsWith("http://") || hostport.startsWith("https://")) {
    return hostport;
  }

  // Render の内部接続想定ではまず http を使う
  return `http://${hostport}`;
}
