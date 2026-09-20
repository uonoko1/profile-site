import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { loadPosts } from "./src/blog/loader";

const VIRTUAL_ID = "virtual:posts";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * 記事をビルド時に読み込み、仮想モジュールとして配る。
 * 実行時の fetch もサーバーも持たない。
 */
function postsPlugin() {
  return {
    name: "posts",
    resolveId(id: string) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    async load(id: string) {
      if (id !== RESOLVED_ID) return null;
      const posts = await loadPosts();
      return `export const posts = ${JSON.stringify(posts)};`;
    },
    // 記事を編集したら即座に反映させる
    configureServer(server: {
      watcher: { add: (p: string) => void; on: (e: string, cb: (f: string) => void) => void };
      moduleGraph: { getModuleById: (id: string) => unknown };
      ws: { send: (p: { type: string }) => void };
    }) {
      const dir = path.resolve(process.cwd(), "content/posts");
      server.watcher.add(dir);
      server.watcher.on("change", (file: string) => {
        if (file.startsWith(dir)) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    postsPlugin(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: isSsrBuild ? "dist/server" : "dist",
    emptyOutDir: !isSsrBuild,
    ...(isSsrBuild && {
      ssr: "src/entry-server.tsx",
      rolldownOptions: { output: { entryFileNames: "entry-server.js" } },
    }),
    // three.js は初期バンドルから外す。LCP は DOM のテキストが担う
    ...(!isSsrBuild && {
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("node_modules/three") || id.includes("@react-three")) {
              return "three";
            }
          },
        },
      },
    }),
  },
}));
