---
author: Pedro Sousa
pubDatetime: 2026-07-06T09:00:00Z
title: "The content store, part 1: stop fetching what you already have"
slug: content-store-part-1
featured: true
draft: false
tags:
  - storyblok
  - architecture
  - content-store
description: "Why we stopped fetching from our CMS on every request and started syncing everything into a local SQLite database instead. Part 1 of a series."
---

TLDR: at EF, where I work, I built a package that stops our sites from asking Storyblok for content over and over. It syncs everything into a local SQLite database once, keeps it fresh incrementally, and every read after that is a local query. Builds got faster, rate limits stopped being a thing, and pages stopped waiting on a remote API to render.

This is part 1 of a series. It covers the problem and the core idea. Later parts get into the sync engine, the read side, and some fun extras like using content analytics to drive code splitting.

## Table of contents

## Some context

EF runs a lot of websites. Marketing pages, blogs, landing pages, in a pile of languages, all powered by Storyblok, a headless CMS. The usual setup for a headless CMS looks like this: your site needs content, so it calls the CMS API. Building a static page? API call. Server rendering? API call. Ten thousand pages in twelve locales? You can see where this goes.

For small sites this is fine. The Storyblok API is fast and has a CDN in front of it. You will not notice a problem until you have enough content, and then you will notice all of the problems at once.

## The problem

Four things start to hurt at scale.

**Builds crawl.** Static generation means paginating through the entire API before you can render anything. With hundreds of thousands of stories across locales, you spend most of your build waiting on HTTP. Add rate limits on top and your build time is now a function of someone else's throttling policy.

**You fetch the same thing forever.** The content did not change since the last build. You fetch all of it anyway, because the API is your only source of truth and you have no cheap way to ask "what changed?"

**Runtime coupling.** If you server render, every request carries an API round trip. Your p95 includes their p95, and your page speed is tied to a service you do not control.

**The API answers fetches, not questions.** This one is sneaky. The CMS API is great at "give me this story" and terrible at anything shaped like a question about the space. Want a sitemap? That is every URL in the space, so you paginate through everything before you can write the first line of XML. And it gets worse with hreflang, the prime example: every single URL entry needs to list its alternates in every other language, so knowing about one page means knowing about all of its siblings across all locales. There is no API call for that. You download the entire site, in every language, then cross-reference it yourself, just to describe pages you already have. Want a blog index filtered by category and author, with counts per tag? The API has no join, so you fetch all the posts, then all the categories, then all the authors, and stitch the relationships together in JavaScript. Every question, no matter how small the answer, starts with "first, download the world."

## Why not just cache?

Fair question, and the first thing everyone tries. Slap a cache in front of the API, done.

The trouble is that a cache in front of an API can only answer questions you already asked. It cannot list every story in a folder unless you cached that exact listing. It cannot tell you which stories reference a given story. Invalidation turns into folklore. And a cold cache still means the same slow crawl through the API.

What we actually wanted was different in kind: a complete, queryable copy of the content that lives with the application. Once you say it out loud, the answer is obviously a database.

## The idea

So that became the design. Sync the whole space into a local SQLite database once, keep it fresh with small incremental updates, and serve every read from local disk.

```
Storyblok API ──▶ sync ──▶ SQLite ──▶ provider ──▶ your app
                    │                    │
              transform pipeline   getStory / getStories
```

The application code barely knows any of this is happening. You ask a provider for content and it comes back in the same shape the CMS would have given you:

```ts
const store = await createContentStore(config);
const provider = await store.getProvider();

const story = await provider.getStory("en", "about-us");
const posts = await provider.getStories({ folder: "blog" });
```

The difference is that these calls read from a SQLite file sitting next to your app. No network, no rate limit, no waiting. A full page render might touch dozens of stories, and it makes no difference, because every one of those lookups is a local index hit.

## Why SQLite

"Sync it somewhere local" does not automatically mean SQLite, and we did look at the alternatives before committing.

Redis was the obvious first candidate, since this smells like a caching problem. But Redis is a key-value store on the other end of a network hop, which quietly reintroduces both problems we were trying to remove: reads go back on the wire, and there is once again a service that has to exist everywhere the app runs. Worse, key-value lookups cannot answer the relationship questions from earlier. "All posts by this author" is not a get by key, and precomputing every listing you might need is just the cache invalidation problem wearing a different hat.

A proper database server like Postgres fixes the query side but doubles down on the operational side. Every environment that renders content now needs a running database: every CI job, every preview deployment, every laptop. For content that is read constantly and written only by a sync process, that is a lot of infrastructure for the write throughput of one very calm writer.

SQLite sits exactly in the gap. It is a real SQL engine, so relationships and filtering and joins all work. It runs in-process, so a read is a function call, not a network request. One writer with many readers matches our sync-writes, everyone-reads shape perfectly. And the entire store is a single file, which sounds mundane but becomes a superpower: copying a file is all it takes to hand a fully synced store to a CI job or a fresh laptop. More on that in part 4.

## Keeping it fresh without refetching the world

The part that makes this practical is incremental sync. Storyblok exposes a version number for the whole space that changes whenever content changes. The sync checks it first, and if nothing moved since last time, it does nothing at all.

When something did change, it asks only for stories published after the last sync watermark:

```ts
const { spaceVersion } = await fetchSpaceInfo();

if (spaceVersion === lastSyncedVersion) {
  return; // nothing to do, and this is the common case
}

const changed = await fetchStories({ publishedAfter: lastSyncWatermark });
await upsertStories(changed);
```

The expensive full crawl happens exactly once, the first time. After that, syncs are small and boring. Moved stories, translations, and content that references other content all need extra care, and that is what part 2 is about.

## What this buys you

A few things fell out of this design that we did not fully appreciate up front.

**Builds stopped depending on the network.** CI pulls a snapshot of the database, verifies it is current, and renders everything from local reads. The network could vanish mid-build and the build would finish.

**Resilience came for free.** If a sync fails for whatever reason, the site keeps serving the content it already has. Stale content beats no content every time.

**Questions became one query.** Remember the "first, download the world" problem? It just disappears. A sitemap is a single select over slugs, and the hreflang alternates that used to require downloading the whole site in every language are a self join on the same table. "All posts by this author in this category, with tag counts, page 3" is one indexed query instead of three full fetches and a pile of JavaScript joins:

```sql
select s.slug, s.title
from stories s
join relations r on r.from_uuid = s.uuid
where s.folder = 'blog'
  and r.to_uuid = :author
order by s.published_at desc
limit 10 offset 20;
```

The relationships were always in the content. SQL just lets you ask about them directly. And it opens questions the API could never answer at all, like "which components appear on which pages?" Part 4 covers the weird places we took that.

## What's next

Part 2 digs into the sync engine: how content hashes stop redundant writes, what happens when two locales disagree, and how syncs survive flaky networks. Part 3 covers the read side, including how story references get resolved from the local database instead of the API. Part 4 is the extras, like ranking components by how often they appear above the fold and generating your import statements from that.

A note on scope: the package itself is internal to EF, so this series shares the ideas and the architecture rather than the source. The code snippets are simplified illustrations, not the real implementation. The concepts are the useful part anyway, and none of them are specific to Storyblok. If your app keeps asking a remote API for content it already saw, you can probably steal most of this.
