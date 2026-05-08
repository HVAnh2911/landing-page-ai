# TrangDich.vn — AI Landing Page Builder

Nuxt 4 + Vue 3 + TypeScript + TailwindCSS + Pinia + Groq (LLM) + Supabase.

## Default Behavior

Mindset **Senior Full-Stack Engineer** khi làm việc trong project này:

- Ưu tiên MVP, tránh over-engineer
- Stack cố định: đừng đề xuất thay đổi framework
- Viết code tiếng Anh, comment/string UI tiếng Việt
- Mọi server route nằm trong `server/api/`, mọi component feature trong `app/features/`

## Claude Model

Mặc định dùng **`claude-opus-4-7`** cho mọi tác vụ AI trong project.  
Key: `ANTHROPIC_API_KEY` trong `.env`.

```ts
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: config.anthropicApiKey })
const response = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 4096,
  thinking: { type: 'adaptive' },
  messages: [{ role: 'user', content: '...' }],
})
```

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Nuxt 4 (`future.compatibilityVersion: 4`), thư mục `app/` |
| UI | Vue 3 `<script setup>`, TailwindCSS v3 |
| State | Pinia (`shallowRef` cho object lớn) |
| AI | Groq `llama-3.3-70b-versatile` (hiện tại) → Claude `claude-opus-4-7` (tương lai) |
| DB | Supabase (Postgres + RLS) |
| Image | Unsplash API (optional) |

## Cấu trúc thư mục

```
trangdich/
├── app/
│   ├── composables/
│   │   └── useHtmlExport.ts        # HTML export & download
│   ├── features/
│   │   └── generator/
│   │       ├── GeneratorForm.vue   # Multi-step form
│   │       └── LandingPreview.vue  # Responsive preview
│   ├── pages/                      # index, preview, dashboard, p/[slug]
│   ├── stores/
│   │   └── modules/
│   │       ├── index.ts            # Re-export tất cả stores
│   │       └── generator/
│   │           ├── store.ts        # Pinia store
│   │           └── types.ts        # TypeScript interfaces
│   ├── layouts/
│   │   └── default.vue
│   └── app.vue
├── server/
│   └── api/
│       ├── generate.post.ts        # AI content generation
│       ├── publish.post.ts         # Lưu page lên Supabase
│       ├── pages.get.ts            # Dashboard list
│       └── page/[slug].get.ts      # Public page fetch
└── supabase/
    └── schema.sql
```

## Biến môi trường

```env
GROQ_API_KEY=...
ANTHROPIC_API_KEY=...        # cho Claude
SUPABASE_URL=...
SUPABASE_KEY=...             # anon key (public)
SUPABASE_SERVICE_KEY=...     # service role key (server-only)
NUXT_PUBLIC_SITE_URL=http://localhost:3000
UNSPLASH_ACCESS_KEY=...      # optional
```

## Dev Commands

```bash
npm run dev          # dev server :3000
npm run build        # production build
npm run typecheck    # TS check
```

## Available Commands

- `/plan <request>` — Execution plan với Features, Tasks, Timeline
- `/frontend <component>` — Production-ready Vue/Nuxt component
- `/review <code>` — Code review: bugs, security, performance
- `use debug` — Root cause analysis, safe fix
- `use qa` — Test case generation, edge cases
- `use vue-nuxt` — Vue 3 + Nuxt 4 specialist
- `use vue3-skill` — Vue 3 reactivity internals
- `use nuxt-skill` — Nuxt 4 SSR/Nitro/hydration

## Quy ước code

- Server route: luôn gọi `useRuntimeConfig()` **bên trong** `defineEventHandler` (không ở module level)
- Pinia: dùng `shallowRef` cho `currentPage` và `history` để tránh deep reactive overhead
- TailwindCSS: `tailwind.config.ts` scan `./app/**/*.{vue,ts}` (bao gồm features + stores)
- Import alias: dùng `~` (trỏ tới `app/`) cho mọi app-side import, tránh relative path dài
- Store import: `import { useGeneratorStore } from '~/stores/modules'`
- Device preview: dùng Vue prop `device` thay vì CSS breakpoints (container ≠ viewport)
- Layout: sticky header = `height:100dvh + flex-col + overflow:hidden` trên outer, `min-height:0` trên `<main>`
