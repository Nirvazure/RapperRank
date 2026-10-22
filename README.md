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
| `SUPABASE_URL` | Auth 地址；Vercel 关联同名 Shared 变量 |
| `SUPABASE_PUBLISHABLE_KEY` | Auth 公开 Key；Vercel 关联同名 Shared 变量，服务端读取 |
| `DATABASE_URL` | 应用运行时，使用 Transaction Pooler（端口 6543） |

DATABASE_URL 连接串需带 `?schema=rapperank`（或等效的 schema 参数），确保表落在 `rapperank` schema 而非 `public`。

3. 准备数据库

```bash
npm run db:generate
```

艺人数据仅在 Supabase `rapperank.Rapper` 表维护，**不要**使用已移除的 seed 脚本写回艺人。

数据库已初始化；构建只生成 Prisma Client，不执行迁移。迁移命令、图片导入及资源上传和 Storage 迁移工具已移除，历史 SQL 保留在 `prisma/migrations` 作为结构记录。

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
npm run db:reset-ratings
```

## Vercel 环境变量

- Shared：关联 `SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`，检查所需环境。
- Project：保留现有 `DATABASE_URL`，值不变。
- 发布本次代码时切换公开 Key 名称，清理旧项目级 Auth 配置，避免同名变量覆盖 Shared。
- 不再读取独立迁移连接或服务端管理 Key；本地也无需保留。
- 修改环境变量后重新部署，验证登录、回调、评分、收藏和排行榜。

## Runtime Notes

- 用户体系支持 **GitHub OAuth（YQYHub 公用 Auth）** 与 **匿名 session** 并存。
- 登录后会将当前匿名会话的评分与收藏合并到认证账号。
- 同一用户对同一 Rapper 只保留一条最新评分。
- 排行榜和详情页分数读取 `Rapper` 聚合字段，评分写入时会同步重算。
- 艺人资料以 Supabase 数据库为准；厂牌元数据来自 `src/features/labels/label.data.ts`。
