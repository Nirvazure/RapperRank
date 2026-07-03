# RapperRank

RapperRank 是一个基于 Next.js 16 的说唱歌手评分应用。当前版本已经从“静态数据 + 浏览器本地持久化”切换到“Prisma + PostgreSQL + 匿名 session + Route Handlers”架构。

数据库托管在公用 Supabase 项目上，RapperRank 使用独立的 `rapperank` schema，与其他应用隔离。

多应用公用 Auth / Schema 规范见 [docs/yqyhub-shared-auth.md](./docs/yqyhub-shared-auth.md)。

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
| `SUPABASE_URL` | YQYHub 项目 URL（`.env` 中配置；启动时镜像为 `NEXT_PUBLIC_SUPABASE_URL` 供客户端） |
| `SUPABASE_KEY` | YQYHub anon / publishable key（镜像为 `NEXT_PUBLIC_SUPABASE_KEY`） |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端（可选脚本） |
| `DATABASE_URL` | 应用运行时，使用 Transaction Pooler（端口 6543） |
| `DIRECT_DATABASE_URL` | Prisma migration，使用 Direct connection（端口 5432） |

两条连接串均需带 `?schema=rapperank`（或等效的 schema 参数），确保表落在 `rapperank` schema 而非 `public`。

3. 准备数据库

```bash
npm run db:generate
npx prisma migrate deploy
```

艺人数据仅在 Supabase `rapperank.Rapper` 表维护，**不要**使用已移除的 seed 脚本写回艺人。

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
npm run db:reset-ratings
```

## Runtime Notes

- 用户体系支持 **GitHub OAuth（YQYHub 公用 Auth）** 与 **匿名 session** 并存。
- 登录后会将当前匿名会话的评分与收藏合并到认证账号。
- 同一用户对同一 Rapper 只保留一条最新评分。
- 排行榜和详情页分数读取 `Rapper` 聚合字段，评分写入时会同步重算。
- 艺人资料以 Supabase 数据库为准；厂牌元数据来自 `src/features/labels/label.data.ts`。
