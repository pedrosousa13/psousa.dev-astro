// Lists posts whose publish time passed in the last day, so the scheduled
// workflow rebuilds the site only when a post is due. postFilter hides a post
// until its pubDatetime, and a static site only changes on a rebuild.
import { readdirSync, readFileSync } from "node:fs";

const DIR = "src/content/blog";
const WINDOW_MS = 26 * 60 * 60 * 1000; // a day, plus slack for a late cron run
const MARGIN_MS = 15 * 60 * 1000; // SITE.scheduledPostMargin

const now = Date.now();
const due = [];

for (const file of readdirSync(DIR)) {
  if (!/\.mdx?$/.test(file)) continue;
  const frontmatter = readFileSync(`${DIR}/${file}`, "utf8").match(
    /^---\n([\s\S]*?)\n---/
  )?.[1];
  if (!frontmatter || /^draft:\s*true\s*$/m.test(frontmatter)) continue;
  const date = frontmatter.match(/^pubDatetime:\s*(\S+)\s*$/m)?.[1];
  const at = date ? Date.parse(date) : NaN;
  if (at - MARGIN_MS <= now && now - at < WINDOW_MS) due.push(file);
}

console.log(due.join("\n"));
