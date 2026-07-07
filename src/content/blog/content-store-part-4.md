---
author: Pedro Sousa
pubDatetime: 2026-07-07T09:10:00Z
title: "The content store, part 4: the fun stuff"
slug: content-store-part-4
featured: false
draft: false
tags:
  - storyblok
  - architecture
  - content-store
description: "Once your CMS content lives in a real database, weird doors open: ranking components by fold position, generating your imports from usage data, and CI builds that never sync. Final part of the series."
---

TLDR: final part. Parts [1](/posts/content-store-part-1) through [3](/posts/content-store-part-3) covered syncing Storyblok content into SQLite at EF and reading it back out. This one is about the unplanned wins: things that became possible only because the content sits in a real database. Component usage analytics that decide which imports are eager and which are lazy, and database snapshots that let CI skip syncing entirely.

## Table of contents

## Content as a dataset

The series so far treated the database as a faster way to serve content. But a database full of content is also a dataset about your content, and you can ask it things the CMS never could.

During sync, the store already walks every story to transform it and extract relations. Walking it anyway means observing it is nearly free, so the sync records, for every component type: how many times it appears, in how many distinct stories, and where in each story it appears. That last one deserves explanation.

## The fold score

Storyblok stories are trees of components, and a page renders them roughly top to bottom. A component's position in the tree traversal is a decent proxy for where it lands on the screen: components near the start of the traversal tend to render above the fold, components near the end tend to render below it.

So each component occurrence gets a normalized position, and averaging those across every story gives each component type a fold score: roughly "when this component appears, how close to the top does it usually sit?" Heroes and navigation blocks score near the top. Footers, newsletter signups, and cookie disclaimers live at the bottom. None of this required annotating anything. It falls out of data the sync was already touching.

You also get dead component detection for free: a component type registered in code but appearing in zero stories is a delete candidate, and now you have the receipts.

## Generating imports from usage data

Here is where the fold score stops being trivia. Component-based sites have a file somewhere that maps component names to implementations, and it usually imports everything eagerly. Every component in the registry lands in the main bundle, including that one carousel used below the fold on three pages.

The usual fix is a developer guessing which imports to make dynamic, once, three redesigns ago. The ranking data replaces the guess. A codegen step reads the fold scores and rewrites the component registry: components that consistently render above the fold stay as static imports so they hydrate immediately, everything else becomes a dynamic import that loads when it approaches the viewport:

```ts
// generated from component ranking data
import Hero from "./sections/hero";
import Navigation from "./sections/navigation";

const registry = {
  hero: Hero,
  navigation: Navigation,
  carousel: dynamic(() => import("./sections/carousel")),
  newsletter: dynamic(() => import("./sections/newsletter")),
};
```

The threshold is configurable, a pinned list exists for components that must stay eager no matter what the data says, and the generator refuses to run on stale ranking data. Editors move content around, the next sync updates the scores, the next codegen run updates the split. Bundle decisions that used to be tribal knowledge are now derived from how content is actually arranged.

## CI that never syncs

Part 1 promised builds that stopped depending on the network, and here is the mechanism. The whole store is one SQLite file, and files can be snapshotted.

After a sync, the store can compress the database and upload it to object storage. A build starts by downloading that snapshot instead of talking to the CMS at all:

```ts
snapshot: {
  strategy: "if-missing", // or "always", or ttl-based
  fromObjectStore: true,
}
```

Then the usual freshness check from part 2 runs: if the space version moved since the snapshot, a small incremental sync tops it up. In the common case, content did not change between deploys and the build does zero content fetching. Worst case, it does a tiny top-up. The full crawl exists only in origin stories.

This composes nicely with ephemeral environments. Preview deployments, PR builds, and local onboarding all hydrate from the same snapshot in seconds, instead of each one rediscovering two hundred thousand stories one page at a time.

## Honorable mentions

Things that did not get their own section but fall out of the same architecture: the object store can also serve individual stories as compressed JSON straight from a CDN, the blog layer answers category, author, and pagination queries as plain SQL like part 1 hinted, live editing in the visual editor pipes draft content through the same transform pipeline so previews match production rendering, and consumers can extend the database schema with their own tables that sync alongside ours.

Any of those could be a post. If one sounds interesting, tell me and it probably will be.

## Wrapping up

The whole series in three sentences. Fetching content from a CMS API on every request or build stops scaling long before the content does, and caching only papers over it. Syncing everything into a local SQLite database gives you zero-latency reads, builds that survive network trouble, and a copy you keep honest with watermarks, hashes, and careful handling of the ways syncs lie to you. And once the content is a database, it stops being just something you serve and becomes something you can ask questions of, which is where the unexpected wins live.

Built at EF, ideas free to steal, snippets simplified throughout. If you got this far and your app still asks a remote API for content it already saw, you know what to do.
