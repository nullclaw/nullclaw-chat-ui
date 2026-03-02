const TOKEN_QUERY_PARAM = 'token';

export function withWebSocketAuthToken(url: string, authToken?: string): string {
  const trimmedUrl = url.trim();
  const trimmedToken = authToken?.trim();

  if (!trimmedToken) {
    return trimmedUrl;
  }

  try {
    const parsed = new URL(trimmedUrl);

    if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
      return trimmedUrl;
    }

    const existingToken = parsed.searchParams.get(TOKEN_QUERY_PARAM);
    if (!existingToken) {
      parsed.searchParams.set(TOKEN_QUERY_PARAM, trimmedToken);
    }

    return parsed.toString();
  } catch {
    return trimmedUrl;
  }
}

export function redactWebSocketAuthToken(url?: string): string | undefined {
  if (!url) return url;

  try {
    const parsed = new URL(url);

    if (!parsed.searchParams.has(TOKEN_QUERY_PARAM)) {
      return url;
    }

    parsed.searchParams.set(TOKEN_QUERY_PARAM, '***');
    return parsed.toString();
  } catch {
    return url;
  }
}
