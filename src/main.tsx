import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource-variable/dm-sans";
import "@fontsource/mrs-saint-delafield/400.css";
import "./styles/index.css";

import App from "./App";
import { isPreview } from "./content";
import { resolvePreviewMedia } from "./content/previewMedia";

function start() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {/* basename lets the site live under a sub-path such as GitHub Pages' /1stOctober/ */}
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

// Admin previews first pick up unpublished photos/videos from this browser.
if (isPreview) resolvePreviewMedia().catch(() => undefined).finally(start);
else start();
