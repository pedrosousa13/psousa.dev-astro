import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo, type ChangeEvent } from "react";
import Card from "@components/Card";
import type { CollectionEntry } from "astro:content";

export type SearchItem = {
  title: string;
  description: string;
  data: CollectionEntry<"blog">["data"];
  id: string;
};

interface Props {
  searchList: SearchItem[];
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ["title", "description"],
        includeMatches: true,
        minMatchCharLength: 1,
        threshold: 0.5,
      }),
    [searchList]
  );

  const visiblePosts = useMemo(
    () =>
      inputVal.length > 0
        ? fuse.search(inputVal).map(({ item }) => item)
        : searchList,
    [fuse, inputVal, searchList]
  );

  useEffect(() => {
    // if URL has search query,
    // insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // put focus cursor at the end of the string
    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(history.state, "", newRelativePathQuery);
    } else {
      history.replaceState(history.state, "", window.location.pathname);
    }
  }, [inputVal]);

  return (
    <>
      <label className="border-skin-line focus-within:border-skin-accent block border-b pb-2 transition-colors duration-[120ms]">
        <span className="text-skin-dim mb-2 block text-sm">
          where title or description contains
        </span>
        <input
          className="text-skin-base placeholder:text-skin-dim w-full min-w-0 bg-transparent focus:outline-none"
          placeholder="type query..."
          type="text"
          name="search"
          aria-label="Search articles"
          value={inputVal}
          onChange={handleChange}
          autoComplete="off"
          // autoFocus
          ref={inputRef}
        />
      </label>

      {inputVal.length > 0 && (
        <p className="text-skin-dim mt-6 font-sans text-sm">
          Found {visiblePosts.length}
          {visiblePosts.length === 1 ? " result" : " results"} for '{inputVal}'
        </p>
      )}

      <ul className="border-skin-line mt-4 border-t">
        {visiblePosts.map(item => (
          <Card
            href={`/posts/${item.id}`}
            frontmatter={item.data}
            key={item.id}
          />
        ))}
      </ul>
    </>
  );
}
