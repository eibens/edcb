/**
 * Get the Git tag from the official URL of the edcb code repository.
 *
 * @param url is an URL of the edcb code repository.
 * @returns the tag name, or undefined if the URL is not known.
 */
export function getTag(url = import.meta.url): string | undefined {
  // Verify that URL is official.
  const officialUrl = getUrl();
  if (!url.startsWith(officialUrl)) return undefined;

  // Parse version tag.
  const rest = url.substr(officialUrl.length);
  const match = rest.match(/^@([^/]+)(\/.*)?$/);
  if (!match) return undefined;
  return match[1];
}

/**
 * Get the official URL of the edcb code repository.
 *
 * @param tag is the Git tag of a particular edcb version.
 * @returns the URL of the repository root without a trailing slash.
 */
export function getUrl(tag?: string): string {
  return `https://deno.land/x/edcb${tag ? `@${tag}` : ""}`;
}
