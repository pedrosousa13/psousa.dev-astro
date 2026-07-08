import { SITE } from "@config";
import getPageNumbers from "./getPageNumbers";

interface GetPaginationProps<T> {
  posts: T;
  page: string | number;
  isIndex?: boolean;
  postsPerPage?: number;
}

const getPagination = <T>({
  posts,
  page,
  isIndex = false,
  postsPerPage = SITE.postPerPage,
}: GetPaginationProps<T[]>) => {
  const totalPagesArray = getPageNumbers(posts.length, postsPerPage);
  const totalPages = totalPagesArray.length;

  const currentPage = isIndex
    ? 1
    : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
      ? Number(page)
      : 0;

  const lastPost = isIndex ? postsPerPage : currentPage * postsPerPage;
  const startPost = isIndex ? 0 : lastPost - postsPerPage;
  const paginatedPosts = posts.slice(startPost, lastPost);

  return {
    totalPages,
    currentPage,
    paginatedPosts,
  };
};

export default getPagination;
