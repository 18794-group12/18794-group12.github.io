import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root = path.resolve('out');
const requiredRobots = ['noindex', 'nofollow', 'nosnippet', 'noimageindex'];
function verifyRobots(html, label) {
  const tags = [...html.matchAll(/<meta\s+name="robots"\s+content="([^"]+)"/g)];
  const rules = tags.flatMap((tag) => tag[1].split(',').map((value) => value.trim()));
  for (const rule of requiredRobots) assert(rules.includes(rule), `Missing ${rule}: ${label}`);
  assert(!rules.includes('index') && !rules.includes('follow'), `Conflicting robots: ${label}`);
}
const slugs = ['', 'method', 'experiments'];
for (const slug of slugs) {
  const file = path.join(root, slug, 'index.html');
  const html = await readFile(file, 'utf8');
  verifyRobots(html, file);
  assert.match(html, /class="light"/);
  assert(!html.includes('Toggle Theme'), `Theme toggle in ${slug}`);
  assert(!html.includes('katex-error'), `Formula error in ${slug}`);
  const markdown = await readFile(path.join(root, 'llms.mdx/docs', slug, 'content.md'), 'utf8');
  assert(markdown.startsWith('# '), `Markdown export missing in ${slug}`);
  for (const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*?(?:href|src)="([^"<>]+)"[^>]*>/g)) {
    if (/rel="(?:preconnect|dns-prefetch)"/.test(match[0])) continue;
    const parsed = new URL(match[1].replaceAll('&amp;', '&'), `https://local.test/${slug ? `${slug}/` : ''}`);
    if (parsed.origin !== 'https://local.test') continue;
    const url = decodeURIComponent(parsed.pathname);
    let target = path.join(root, url.slice(1));
    if (url.endsWith('/')) target = path.join(target, 'index.html');
    try { await stat(target); } catch {
      try { await stat(path.join(target, 'index.html')); } catch { throw new Error(`Broken local link: ${slug} -> ${url}`); }
    }
  }
}
const search = JSON.parse(await readFile(path.join(root, 'search-index.json'), 'utf8'));
assert(search.type, 'Missing static search index');
async function checkPublished(dir) {
  for (const name of await readdir(dir)) {
    const file = path.join(dir, name);
    if ((await stat(file)).isDirectory()) await checkPublished(file);
    else {
      assert(!/\.(eml|mbox|pdf|pt|pth|zip)$/i.test(name), `Unexpected source material: ${file}`);
      assert(!/^(sitemap.*\.xml|llms(?:-full)?\.txt)$/.test(name), `Unexpected discovery export: ${file}`);
      if (/\.(html|md|json|txt)$/.test(name)) {
        const text = await readFile(file, 'utf8');
        if (name.endsWith('.html')) verifyRobots(text, file);
        assert(!/aespielberg@gmail|shuaixic@andrew|Message-ID:|Delivered-To:/.test(text), `Email metadata in ${file}`);
      }
    }
  }
}
await checkPublished(root);
assert.equal(await readFile(path.join(root, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n');
console.log(`Verified ${slugs.length} pages, local links, Markdown exports, static search, and light-only output.`);

if (process.argv.includes('--live')) {
  const origin = 'https://18794-group12.github.io';
  const policy = await fetch(`${origin}/robots.txt`);
  assert.equal(policy.status, 200, 'Domain-root robots.txt is unavailable');
  assert(policy.headers.get('content-type')?.includes('text/plain'), 'robots.txt must be plain text');
  const text = await policy.text();
  const groups = text.split(/\n\s*\n/).filter((group) => /^User-agent:/im.test(group));
  assert(groups.some((group) => /^User-agent:\s*\*\s*$/im.test(group)), 'Missing wildcard crawler group');
  for (const group of groups) {
    assert(!/^Allow:/im.test(group), 'Review crawler Allow overrides before claiming exclusion');
    const blocked = group.match(/^Disallow:\s*(\S+)\s*$/gim)?.map((line) => line.split(':')[1].trim()) ?? [];
    assert(blocked.includes('/'), 'A crawler group does not exclude the project');
  }
  for (const slug of ['', 'method/', 'experiments/']) {
    const url = `${origin}/${slug}`;
    const response = await fetch(url);
    assert.equal(response.status, 200, `Published page unavailable: ${url}`);
    verifyRobots(await response.text(), url);
  }
  for (const file of ['llms.txt', 'llms-full.txt', 'sitemap.xml']) {
    const response = await fetch(`${origin}/${file}`);
    assert.equal(response.status, 404, `Unexpected public discovery export: ${file}`);
  }
  console.log('Verified live domain-root crawler exclusions, HTML robots metadata, and removed bulk exports. This does not prove deindexing or authentication.');
}
