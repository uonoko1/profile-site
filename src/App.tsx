import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { BlogIndexPage } from "@/pages/BlogIndexPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogIndexPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
