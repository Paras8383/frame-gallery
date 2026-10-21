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
- Gallery API operations live in `src/services/galleryService.js`
- Image metadata and upload/delete operations use the existing AWS API Gateway service

## Where things live

- `artifacts/frame-gallery/src/App.jsx` — gallery interface and interactions
- `artifacts/frame-gallery/src/authConfig.ts` — Cognito OIDC settings and hosted sign-out URL
- `artifacts/frame-gallery/src/services/galleryService.js` — AWS API Gateway adapter
- `artifacts/frame-gallery/src/index.css` — gallery styling and responsive layout

## Architecture decisions

- Cognito authorization-code sign-in gates the gallery interface, but the existing AWS API is not yet authenticated or owner-isolated.
- Gallery operations continue through the existing API Gateway service; Phase 1 does not modify backend authorization.

## Product

Frame provides a searchable, filterable image gallery with AWS-backed uploads, image details, editing, deletion, refresh, and Cognito-managed sign-in.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Cognito callback and sign-out URLs must exactly match the app origin and be allowlisted in the user-pool app client. Cognito login does not by itself secure or isolate gallery records.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
