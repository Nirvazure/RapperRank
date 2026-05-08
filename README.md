# RapperRank

RapperRank 是一个欧美街头音乐风格的 Rapper 六维评分展示应用。首版使用静态数据和本地模拟用户，支持 Rapper 切换、雷达图、六维 5 分制评分、Top 10 排行榜和本地收藏。

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- ECharts
- GSAP + ScrollTrigger
- Zustand
- TanStack Query
- Zod
- Vitest + Testing Library
- Vercel Analytics

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Pages

- `/`: Rapper 主视觉、详情、雷达图、评分弹窗和 Rapper 选择器。
- `/ranking`: Top 10 排行榜。
- `/favorites`: 本地用户收藏。

## Vercel Deployment

This project is ready for Vercel deployment without required environment variables.

1. Import the repository into Vercel.
2. Keep the default framework preset as Next.js.
3. Use the default install command: `npm install`.
4. Use the default build command: `npm run build`.
5. Deploy.

Vercel Analytics is already mounted in `src/app/layout.tsx`.

## Supabase Later

The MVP does not require Supabase. Future migration notes are tracked in `docs/supabase-migration-todo.md`.
