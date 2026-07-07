import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const posts = [
  {
    part: 1,
    slug: "content-store-part-1",
    title: "Stop fetching what you already have",
  },
  {
    part: 2,
    slug: "content-store-part-2",
    title: "Keeping a copy you can trust",
  },
  {
    part: 3,
    slug: "content-store-part-3",
    title: "The read side",
  },
  {
    part: 4,
    slug: "content-store-part-4",
    title: "The fun stuff",
  },
];

for (const post of posts) {
  const html = readFileSync(`dist/posts/${post.slug}/index.html`, "utf8");
  const seriesRail = html.match(
    /<aside[^>]+aria-label="The content store series"[\s\S]*?<\/aside>/
  )?.[0];

  assert.ok(seriesRail, `${post.slug} renders the series rail`);

  for (const seriesPost of posts) {
    assert.match(
      seriesRail,
      new RegExp(`href="/posts/${seriesPost.slug}/"`),
      `${post.slug} links to ${seriesPost.slug} from the series rail`
    );
  }

  const nextPost = posts.find(seriesPost => seriesPost.part === post.part + 1);

  if (!nextPost) {
    assert.doesNotMatch(
      html,
      /Next in series/,
      `${post.slug} does not render a next-series link`
    );
    continue;
  }

  assert.match(
    html,
    new RegExp(`href="/posts/${nextPost.slug}/"`),
    `${post.slug} links to the next series article`
  );
  assert.match(
    html,
    /Next in series/,
    `${post.slug} labels the next series article link`
  );
  assert.match(
    html,
    new RegExp(nextPost.title),
    `${post.slug} names the next series article`
  );
}
