# RapperRank

RapperRank 是一个基于 Next.js 16 的说唱歌手评分应用。当前版本已经从“静态数据 + 浏览器本地持久化”切换到“Prisma + PostgreSQL + 匿名 session + Route Handlers”架构。

数据库托管在公用 Supabase 项目上，RapperRank 使用独立的 `rapperank` schema，与其他应用隔离。

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL (Supabase)
- Zod
- ECharts
- GSAP
- Vitest + Testing Library

## Local Development

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

从公用 Supabase 项目的 **Settings → Database** 获取连接串，复制模板后填入真实值：

```powershell
Copy-Item .env.example .env
```

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | 应用运行时，使用 Transaction Pooler（端口 6543） |
| `DIRECT_DATABASE_URL` | Prisma migration，使用 Direct connection（端口 5432） |

两条连接串均需带 `?schema=rapperank`（或等效的 schema 参数），确保表落在 `rapperank` schema 而非 `public`。

3. 准备数据库

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

本地开发若需新建 migration，使用 `npm run db:migrate`（`prisma migrate dev`）。

4. 启动开发服务器

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Runtime Notes

- 用户体系当前为匿名 session。
- 同一匿名用户对同一 Rapper 只保留一条最新评分。
- 排行榜和详情页分数读取 `Rapper` 聚合字段，评分写入时会同步重算。
- 种子数据来自现有 rapper 数据集，缺失文案会在 seed 清洗时替换为明确占位文本。
