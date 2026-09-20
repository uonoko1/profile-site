/// <reference types="vite/client" />

declare module "virtual:posts" {
  import type { Post } from "@/blog/types";
  export const posts: Post[];
}
