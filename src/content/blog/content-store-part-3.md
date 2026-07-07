---
author: Pedro Sousa
pubDatetime: 2026-07-07T09:05:00Z
title: "The content store, part 3: the read side"
slug: content-store-part-3
featured: false
draft: false
tags:
  - storyblok
  - architecture
  - content-store
description: "Serving CMS content from a local database sounds trivial until stories start referencing each other. Relations, cycles, and why dev mode reads differently than production. Part 3 of a series."
---

TLDR: parts [1](/posts/content-store-part-1) and [2](/posts/content-store-part-2) covered why we sync Storyblok content into SQLite at EF and how the sync stays trustworthy. This part is about reading it back out, which sounds like the boring half until you remember that content references other content. Resolving those references locally, breaking reference cycles, and giving editors fresh reads in dev without slowing production is where the read side earns its keep.

## Table of contents

## Reads are an interface, not a database

Application code never touches the database directly. It talks to a provider:

```ts
const story = await provider.getStory("en", "about-us");
const posts = await provider.getStories({ folder: "blog" });
```

That indirection is load bearing. Behind the same interface live a local SQLite reader, a plain API client, and a composed provider that decides which one answers. Production and development get very different behavior out of identical application code, which is the whole trick of the last section of this post.

## The relation problem

CMS content is a graph. An article references an author. A page embeds a "related articles" block that references three other pages. In Storyblok, those references are stored as UUIDs, and when you fetch from the API you can ask it to resolve them, so instead of a bare UUID you get the whole referenced story inlined.

Our reads never hit the API. So resolution is now our job.

The tempting shortcut is to resolve at sync time: when a story comes in, look up everything it references and bake the copies into the stored document. We went the other way, resolving at read time, and the reason is staleness. A baked-in author copy goes stale the moment the author story changes, and now one edit means rewriting every story that references it. At read time there is no copy to go stale. The resolver walks the references when you ask for the story and pulls each referenced story fresh from the local database:

```ts
async function resolveRelations(content, depth) {
  if (depth >= maxDepth) return content;

  for (const [key, value] of Object.entries(content)) {
    if (isStoryUuid(value)) {
      const related = await store.getByUuid(value);
      if (related) {
        content[key] = await resolveRelations(related, depth + 1);
      }
    }
  }
  return content;
}
```

This would be an unforgivable N+1 pattern against a remote API. Against a local SQLite file it is a handful of index lookups, and the laziness buys correctness: the resolved story is always as fresh as the store itself.

## Look like the API, exactly

There is a trap in rolling your own resolution: the inlined story has to be shaped exactly like what the CMS would have returned. Consumer code does things like `story.author.content.name` and `article.tag_list.map(...)`, written against the API's shape. If your locally resolved story is missing a field the API includes, some page crashes at midnight with an error that looks nothing like "your resolver is incomplete."

So the store deliberately persists every field the API includes with a resolved story, even ones nothing seems to use, and the resolver reproduces the API's output shape byte for byte. Boring, pedantic, and the reason nobody has to know the resolver exists.

There is also a decision to make when a reference points at a story that does not exist locally, say one that was excluded from sync. Leaving the raw UUID in place matches what the API does. But some teams prefer dropping it to null so downstream `.map()` calls skip it instead of choking on a string. We made it configurable and defaulted to matching the API, because "behaves exactly like the thing it replaced" is the least surprising option.

## Cycles, because content is written by humans

Author pages reference their articles. Articles reference their author. Follow the references naively and you resolve forever.

A depth cap alone technically saves you, but it spends the whole depth budget going in circles. The store handles cycles at sync time instead: after a full sync it builds the relation graph, finds the edges that close cycles, and records them. At read time the resolver checks each hop against that list and simply declines to follow a cycle-closing edge. Cheap at read time, because the expensive graph walk already happened during sync, where nobody is waiting on the response.

## Dev reads and prod reads want opposite things

Production wants reads that never wait on the network. Development wants the opposite: an editor changes content in the CMS and expects the next page refresh to show it, sync schedules be damned.

The composed provider gives each what it wants. In production it reads SQLite first, and only if the local store somehow cannot answer does it fall back to the API, persisting whatever it fetched so the same miss cannot happen twice. In development it flips the order: before reading, it checks how stale the local copy is, and past a small threshold it pulls fresh content from the API and writes it into the store first. The page still renders from the database, through the same relation resolver production uses.

That last detail matters more than it looks. Dev mode could just proxy the API directly, but then development would exercise a completely different read path than production, and resolver bugs would ship silently. Syncing first and reading from the store means every dev page load is also a small test of the production path.

## Reading a lot without eating your memory

One more read-side detail worth stealing: listing endpoints paginate with a cursor on the slug rather than offsets. OFFSET pagination re-scans everything it skips, which hurts at hundreds of thousands of rows. A keyset cursor makes each page a cheap indexed seek, and an async generator on top lets things like sitemap generation stream the entire space with constant memory:

```ts
for await (const story of provider.iterateStories({ locale: "en" })) {
  addToSitemap(story);
}
```

## What's next

Part 4 is the fun one: what falls out of having your content in a real database. Ranking components by how often they land above the fold, generating eager versus lazy imports from that ranking, and snapshotting the whole database so CI never syncs from scratch. Usual disclaimer applies: internal EF package, simplified snippets, ideas over code.
