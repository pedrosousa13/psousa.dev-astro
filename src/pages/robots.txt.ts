import type { APIRoute } from "astro";
import { SITE } from "@config";

const robots = `
User-agent: Googlebot
Disallow: /nogooglebot/

# Content usage preferences for automated crawlers.
# search: indexing for search results.
# ai-input: grounding an AI answer with this content (RAG), with attribution.
# ai-train: use as training data for AI models.
# See https://contentsignals.org

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

Sitemap: ${new URL("sitemap-index.xml", SITE.website).href}
`.trim();

export const GET: APIRoute = () =>
  new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
