# Frame

A responsive, browser-only photography gallery for collecting, browsing, searching, and managing images.

## Run & Operate

- `npm run dev` — run the Frame gallery
- `pnpm --filter @workspace/frame-gallery run dev` — run the Frame gallery directly
- `pnpm --filter @workspace/api-server run dev` — run the shared API server (not used by Frame)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- React, Vite, and JavaScript JSX in the Frame artifact
- pnpm workspace; app preview is served from the root path
- Gallery sample data and CRUD operations live in `src/services/galleryService.js`
- No backend or persistent storage; uploaded images use browser object URLs

## Where things live

- `artifacts/frame-gallery/src/App.jsx` — gallery interface and interactions
- `artifacts/frame-gallery/src/services/galleryService.js` — replaceable local mock data layer
- `artifacts/frame-gallery/src/index.css` — gallery styling and responsive layout

## Architecture decisions

- The first version stores gallery operations in a browser-only service so a future AWS-backed service can replace it without moving data logic into UI components.
- Image previews use temporary object URLs; they are not durable storage.

## Product

Frame provides a searchable, filterable personal image gallery with local upload previews, image details, and confirmed deletion.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The gallery is intentionally local-only: reloading restores the sample set, not uploaded image files.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
