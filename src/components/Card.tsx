import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, description, tags } = frontmatter;
  const date = new Date(pubDatetime).toISOString().slice(0, 10);

  const titleLink = (
    <a
      href={href}
      style={{ viewTransitionName: slugifyStr(title) }}
      className="text-skin-base hover:text-skin-accent font-mono text-[1rem] font-semibold transition-colors duration-[120ms] sm:text-[1.05rem]"
    >
      {title}
    </a>
  );

  return (
    <li className="border-skin-line hover:bg-skin-card grid grid-cols-1 gap-x-5 gap-y-1 border-b py-4 transition-colors duration-[120ms] sm:grid-cols-[8rem_1fr]">
      <span className="text-skin-dim pt-[0.15rem] text-[0.8rem] tabular-nums sm:text-base">
        {date}
      </span>
      <div className="min-w-0">
        <div className="mb-1.5 leading-snug">
          {secHeading ? (
            <h2 className="inline">{titleLink}</h2>
          ) : (
            <h3 className="inline">{titleLink}</h3>
          )}
          {tags.length > 0 && (
            <span className="text-skin-dim text-[0.8rem] font-normal sm:text-[0.85rem]">
              {" "}
              · {tags.join(" · ")}
            </span>
          )}
        </div>
        <p className="text-skin-dim line-clamp-2 font-sans text-[0.88rem] leading-relaxed">
          {description}
        </p>
      </div>
    </li>
  );
}
