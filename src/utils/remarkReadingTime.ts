import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

type ReadingTime = () => (tree: any, { data }: any) => void;

export const remarkReadingTime: ReadingTime = () => {
  return (tree, { data }) => {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.readingTime = readingTime.text;
  };
}