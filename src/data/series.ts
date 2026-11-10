// Multi-part posts. A post's page shows its series rail and a link to the
// next part once that part is published.
export const SERIES = [
  {
    name: "The content store",
    posts: [
      {
        slug: "content-store-part-1",
        title: "Stop fetching what you already have",
      },
      { slug: "content-store-part-2", title: "Keeping a copy you can trust" },
      { slug: "content-store-part-3", title: "The read side" },
      { slug: "content-store-part-4", title: "The fun stuff" },
    ],
  },
  {
    name: "deck.cool",
    posts: [
      { slug: "deck-cool", title: "Let the browser do the work" },
      {
        slug: "carouseldeck",
        title: "A carousel that lets the browser scroll",
      },
      { slug: "drawerdeck", title: "A drawer that lets the browser drag" },
      { slug: "playdeck", title: "A video player that hides what it can't do" },
      { slug: "pagedeck", title: "Astro, if it were built for React" },
    ],
  },
];
