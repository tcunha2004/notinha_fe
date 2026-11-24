# Notinha · frontend

Web app where you photograph a grocery receipt (Brazilian NFC-e), an AI reads the store and every line item,
and the app keeps your purchase and price history. This repo is **only the frontend**; the backend
(`notinha_api`, FastAPI + LangGraph) lives elsewhere.

> **Current scope: visual only.** No API, auth, camera or persistence yet. All data is mocked behind
> `src/services/purchases.ts`. Swap that module for real API calls; components never import mocks directly.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit (strict)
pnpm test         # Vitest: route smoke tests + money/formatting checks
pnpm build        # production build in dist/
```

Stack: React 19, TypeScript (strict), Vite, React Router (data router), Tailwind CSS v4, lucide-react.

## Structure

```
src/
  app/          router.tsx (routes), loaders.ts (route data), AppShell (tab bar / sidebar)
  pages/        one component per screen (Home, Scan, Processing, Review, EditItemSheet, Purchases, PurchaseDetail)
  components/
    ui/         generic iOS-style primitives (GlassButton, Button, Card, ListRow, Sheet, SegmentedControl…)
    domain/     Notinha-specific pieces (PurchaseRow, ItemRow, SummaryCard, MockReceipt, TabBar, Sidebar…)
  services/     data access (mocked today, API tomorrow)
  mocks/        mock purchases
  types/        API types (snake_case, mirroring the backend schema)
  lib/          formatting (pt-BR currency/dates), money math in cents, cn()
  styles/       Tailwind + design tokens (@theme) + glass utilities
```

## Routes

| Route                                 | Screen                                             |
| ------------------------------------- | -------------------------------------------------- |
| `/`                                   | Início                                             |
| `/scan`                               | Enviar nota (camera; drag-and-drop on desktop)     |
| `/scan/processing`                    | Lendo a nota (auto-advances after 2.5s)            |
| `/purchases/:id/review`               | Nota lida                                          |
| `/purchases/:id/review/items/:itemId` | Editar item (sheet over the review)                |
| `/purchases`                          | Compras                                            |
| `/purchases/:id`                      | Detalhe da compra (items also open the edit sheet) |

## Design notes

- Every color, font size and radius is a token in `src/styles/index.css` (Tailwind's default palette is
  disabled on purpose). Dark mode = redefine the tokens.
- Breakpoints: < 768px phone layout (matches Figma), 768px+ centered 640px column, 1024px+ glass sidebar,
  two-column detail/review and a centered edit dialog.
- TypeScript is pinned to 6.0: `typescript-eslint` doesn't support the TS 7 native compiler yet.
