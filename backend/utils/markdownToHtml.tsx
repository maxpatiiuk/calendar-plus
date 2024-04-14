import { githubRepository } from '../const/siteConfig';
import { marked } from 'marked';
import fs from 'node:fs/promises';

import 'github-markdown-css';

// Make relative URLs be relative to the GitHub repository
marked.use({
  renderer: {
    image(href, title, text) {
      const url = new URL(
        href,
        `https://github.com/${githubRepository}/raw/main/`,
      );
      return `<img src="${url}" alt="${text}" title="${title}">`;
    },
    link(href, title, text) {
      const url = new URL(
        href,
        `https://github.com/${githubRepository}/tree/main/`,
      );
      return `<a href="${url}" title="${title}">${text}</a>`;
    },
  },
});

export async function markdownToHtml(path: string): Promise<string> {
  const content = await fs.readFile(path, 'utf8');
  return marked(content, { gfm: true, breaks: false });
}

export async function markdownToJsx(path: string): Promise<JSX.Element> {
  const content = await markdownToHtml(path);
  return (
    <div
      className="markdown-body"
      style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}
    >
      <main
        id="content"
        style={{ maxWidth: '50rem' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
