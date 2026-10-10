import { createGetUrl } from 'fumadocs-core/source';
export const appName = 'MetaTrace';
export const docsRoute = '/';
export const docsContentRoute = '/llms.mdx/docs';
export const gitConfig = { user: '18794-group12', repo: '18794-group12.github.io', branch: 'main' };
const getContentUrl = createGetUrl(docsContentRoute);
export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];
  return { segments, url: getContentUrl(segments, page.locale) };
}
