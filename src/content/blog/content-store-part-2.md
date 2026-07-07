---
author: Pedro Sousa
pubDatetime: 2026-07-07T09:00:00Z
title: "The content store, part 2: keeping a copy you can trust"
slug: content-store-part-2
featured: false
draft: false
tags:
  - storyblok
  - architecture
  - content-store
description: "Syncing content into SQLite is easy. Keeping that copy honest is the hard part: redundant writes, locales that disagree, and syncs that fail halfway. Part 2 of a series."
---

TLDR: part 1 covered why we sync Storyblok content into a local SQLite database at EF. This part covers the sync engine, which is where all the actual difficulty lives. Copying data is easy. Keeping the copy trustworthy while content gets moved, translated, and edited by people who owe you nothing is the real work.

If you have not read [part 1](/posts/content-store-part-1), the short version: instead of asking the CMS API for content on every request or build, we sync everything into SQLite once and keep it fresh incrementally. Every read after that is a local query.

## Table of contents

## The easy part

The happy path is genuinely simple. The CMS exposes a version number for the whole space. If it matches what we saw last time, nothing changed and the sync exits immediately. If it moved, we fetch only stories published after our last watermark and upsert them. Small, fast, boring.

Everything in the rest of this post is about the ways that happy path lies to you.

## Don't write what didn't change

Incremental fetches still return stories whose content is byte-for-byte identical to what we already have. Writing them again seems harmless until you notice everything downstream that treats "this row was written" as a signal: cache invalidation, locale refreshes, index rebuilds. Redundant writes turn into redundant everything.

So every write is gated on a content hash:

```ts
const incomingHash = hashContent(story);
const existingHash = await store.getContentHash(story.uuid, locale);

if (incomingHash === existingHash) {
  return { changed: false }; // nothing happened, tell no one
}

await store.upsertStory(story);
return { changed: true };
```

The important property is that the same hash function guards every write path, the normal sync and the locale refresh below. Comparisons can never drift into a loop where two code paths keep rewriting the same row and triggering each other. "Did anything actually change" has exactly one answer, computed one way.

## When locales disagree

Translated content is where sync engines go to suffer. With field-level translation, a story is one document wearing twelve outfits: each locale is a different projection of the same story, with untranslated fields falling back to the default language.

Now an editor changes the default-language version. Every locale that falls back to those fields is now stale, but the API only told us about the one story that changed. So when a story changes in one locale, the sync re-fetches its siblings in the other locales and runs them through the same hash gate. Fully translated siblings come back identical and the hash gate discards them silently. Siblings that inherit the changed fields come back different and get written. The hash does the deciding, not us guessing which fields fall back.

That hash gate is what makes this affordable. Without it, one edit would fan out into writes across every locale on every sync, and the fan-out itself would trigger more refreshes. With it, the fan-out costs a few reads and writes exactly what changed.

## Trust issues

Two more lies are worth catching, and both are about identity rather than content.

First: is this database even a copy of the right thing? The store fingerprints its source, the space, the tokens, the relation-resolution settings, and refuses to mix. If any of it changes, the store clears itself and does a full resync. A database that is 98 percent one space and 2 percent another is worse than an empty one, because it looks fine.

Second: is the copy shaped the way the code expects? The sync writes a schema version into the database. On mismatch, reads throw instead of guessing. An error at startup is annoying. Silently serving rows the current code misreads is a production incident with a delay timer.

## Syncs fail halfway, plan for it

A sync over a few hundred thousand stories in a dozen locales is thousands of HTTP requests, usually from a CI runner with unremarkable network luck. Some of those requests will fail. The engine works in two phases: first probe each locale for its page count, then fetch the remaining pages in bounded batches where each page retries independently a few times before giving up.

The interesting decision is what happens when fetching gives up entirely. The store keeps serving what it already has. The previous copy is intact because writes happen transactionally, and content that is a few hours behind is a far smaller problem than a site with no content at all. The sync logs loudly and tries again next time.

## What's next

Part 3 moves to the read side: how story references get resolved from the local database instead of the API, what to do about circular references, and how dev mode keeps live editing snappy while production never waits on the network. Same disclaimer as before: this is an internal EF package, snippets are simplified illustrations, and the ideas travel further than the code.
