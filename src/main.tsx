import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles/globals.css";

const root = document.getElementById("root")!;
const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// プリレンダリング済みの HTML があれば、そこに乗せる
if (root.hasChildNodes()) hydrateRoot(root, tree);
else createRoot(root).render(tree);
