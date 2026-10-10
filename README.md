# 18-794 Group 12

MetaTrace is the working title of our AI image attribution project. The site introduces the research question, method, and initial experiment plan.

Target site: <https://18794-group12.github.io/>.

## Content

- `content/docs/index.mdx`: project overview and motivation.
- `content/docs/method.mdx`: controlled comparisons and proposed method.
- `content/docs/experiments.mdx`: initial experiment groups and evaluation.

The brief draws on the submitted proposal, its LaTeX roadmap, and the group's project ideas document. It describes planned experiments, not completed results.

## Local use

Use Node.js 24 or later.

```sh
npm ci
npm run check
npm run build
npm run verify
npm start
```

Open <http://127.0.0.1:3104/>. Run `npm run dev` for live editing.

## Template

The site uses the official [Fumadocs Spacious layout](https://www.fumadocs.dev/docs/ui/layouts/spacious), Next.js, and MDX. It uses system fonts, a light theme, and a purple accent.

## Publishing and search

The public repository publishes `out/` through GitHub Actions to the organization's root site. Public source files remain accessible on GitHub.

Every HTML page requests `noindex, nofollow, nosnippet, noimageindex`. The domain-root `robots.txt` requests no crawling. Sitemap and bulk text exports are absent; site search and single-page Markdown remain available.

These requests do not provide access control or guarantee exclusion from search. Crawlers blocked by robots.txt may not read noindex. GitHub source indexing is separate.

Run `npm run verify -- --live` after publication to check the deployed pages and root crawler policy.

See [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing) and [GitHub Pages access rules](https://docs.github.com/en/organizations/managing-organization-settings/managing-the-publication-of-github-pages-sites-for-your-organization).
