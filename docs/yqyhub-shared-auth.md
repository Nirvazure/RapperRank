# YQYHub 多项目公用 Auth 接入规范

本文档定义在 **YQYHub**（公用 Supabase 项目）上，多个应用如何按**同一套逻辑**接入认证与数据隔离。新应用上线前请通读并按 [接入检查清单](#接入检查清单) 逐项确认。

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| **一个项目，一套用户** | 所有应用共用 YQYHub 的 `auth.users`，不在各应用单独维护登录体系 |
| **一应用一 Schema** | 业务表放在独立 Postgres schema（如 `rapperank`、`myapp`），禁止与其他应用混用 `public` |
| **Auth 与业务分离** | 身份在 `auth` schema；资料、订单、内容在各应用 schema |
| **密钥分级** | 浏览器只用 Publishable / Anon Key；`service_role` 仅服务端 |
| **权限显式建模** | 用 RLS 或服务端鉴权二选一（或组合），禁止「裸连库且无校验」 |

### 架构示意

```mermaid
flowchart TB
  subgraph Clients["各应用前端"]
    A1["RapperRank"]
    A2["应用 B"]
    A3["应用 C"]
  end

  subgraph YQYHub["Supabase · YQYHub"]
  direction TB
    Auth["auth.users / auth.sessions\n（全局唯一用户池）"]
    S1["rapperank schema"]
    S2["app_b schema"]
    S3["app_c schema"]
  end

  A1 --> Auth
  A2 --> Auth
  A3 --> Auth
  A1 --> S1
  A2 --> S2
  A3 --> S3
```

### YQYHub 项目信息（固定）

| 项 | 值 |
|----|-----|
| 项目名 | YQYHub |
| Project Ref | `tfvzcuksahcofooqqezx` |
| Region | `ap-southeast-1` |
| Pooler Host | `aws-1-ap-southeast-1.pooler.supabase.com`（注意是 **aws-1**，不是 aws-0） |

从 Dashboard → **Project Settings → API** 获取：

- `Project URL` → `SUPABASE_URL`（Next.js 项目通过 `next.config` `env` 暴露；亦可用 `NEXT_PUBLIC_SUPABASE_URL`）
- `anon` / `publishable` key → `SUPABASE_KEY`（亦可用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- `service_role` key → **仅服务端** `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. 命名与 Schema 规范

### 2.1 Schema 命名

- 使用**小写英文 + 连字符转下划线**：`rapperank`、`note_hub`、`shop_api`
- 与仓库名或产品 slug 一致，便于记忆
- **禁止**在 `public` 建业务表（`public` 仅允许 `_prisma_migrations` 等工具表）

### 2.2 创建 Schema

在 YQYHub SQL Editor 执行（将 `myapp` 替换为你的 schema 名）：

```sql
CREATE SCHEMA IF NOT EXISTS myapp;
GRANT USAGE ON SCHEMA myapp TO postgres, anon, authenticated, service_role;
```

Prisma 项目在 `schema.prisma` 中声明：

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
  schemas   = ["myapp"]
}

model Profile {
  id           String @id @default(cuid())
  authUserId   String @unique @map("auth_user_id") // auth.users.id (UUID)
  displayName  String?
  // ...

  @@map("profiles")
  @@schema("myapp")
}
```

### 2.3 用户身份字段约定

| 字段 | 类型 | 含义 |
|------|------|------|
| `auth_user_id` | `uuid` 或 `text` | 对应 `auth.users.id`，**登录用户的唯一关联键** |
| 应用内 `id` | `cuid` / `uuid` | 本 schema 业务主键（可选，与 auth 分离） |

**规则：**

- 需要登录的功能，`userId` 一律存 `auth.users.id`（或映射表的 `auth_user_id`）
- **不要**用邮箱、手机号做主键关联
- 授权决策用 `app_metadata`，**禁止**用 `user_metadata` 做 RLS / 权限判断（用户可自改）

---

## 3. 环境变量标准

每个应用仓库的 `.env.example` 应包含以下变量（值从 YQYHub 复制，**密码不要用方括号包裹**）。

### 3.1 Auth（所有应用相同）

```env
# YQYHub Auth（与 Artmind 等 Nuxt 项目命名一致）
SUPABASE_URL=https://tfvzcuksahcofooqqezx.supabase.co
SUPABASE_KEY=

# Next.js（RapperRank）：`next.config` 启动时将 `SUPABASE_*` 镜像为 `NEXT_PUBLIC_SUPABASE_*`（Turbopack 客户端需要）

# 仅服务端（Route Handler / Server Action / 后台脚本）
SUPABASE_SERVICE_ROLE_KEY=
```

### 3.2 Database（按应用 schema 区分）

**本地开发** — Session Pooler `5432`，`DATABASE_URL` 与 `DIRECT_DATABASE_URL` **相同**：

```env
DATABASE_URL=postgresql://postgres.tfvzcuksahcofooqqezx:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&schema=myapp
DIRECT_DATABASE_URL=postgresql://postgres.tfvzcuksahcofooqqezx:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&schema=myapp
```

**Vercel 生产** — 运行时与迁移分离：

```env
# 运行时：Transaction Pooler 6543，必须 pgbouncer=true
DATABASE_URL=postgresql://postgres.tfvzcuksahcofooqqezx:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&schema=myapp

# 迁移：Session Pooler 5432
DIRECT_DATABASE_URL=postgresql://postgres.tfvzcuksahcofooqqezx:[password]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&schema=myapp
```

将 `myapp` 替换为本应用的 schema 名（RapperRank 为 `rapperank`）。

### 3.3 Vercel 配置注意

- 每个 Vercel 项目都要单独配置上述变量；**只有 schema 名不同**，Supabase URL / Key 相同
- 修改环境变量后必须 **Redeploy**
- 不要把 `.env` 提交到 Git

---

## 4. Supabase Dashboard 配置（一次性 + 每上新应用追加）

路径：**Authentication → URL Configuration**

### 4.1 Site URL

主站填生产默认回调域，例如：

```
https://rapperank.nirvazure.cn
```

### 4.2 Redirect URLs（每上一个新应用追加）

```
http://localhost:3000/**
https://rapperank.nirvazure.cn/**
https://other-app.nirvazure.cn/**
```

本地端口、预览域、生产域都要加，否则 OAuth / Magic Link 会失败。

### 4.3 Providers

邮箱、Google、GitHub 等在 YQYHub **全局共用**；新应用无需重复创建 Provider，只需加 Redirect URL。

---

## 5. 应用侧接入模式

根据技术栈选择 **A** 或 **B**，全组织内同类项目应统一，避免混用多套 session 逻辑。

### 模式 A：Supabase Client + SSR（推荐新项目）

适用：Next.js / Nuxt / SvelteKit 等，前端或 RSC 需要直接调 Supabase API。

**依赖：**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**目录约定：**

```
src/lib/supabase/
  client.ts      # 浏览器 createBrowserClient
  server.ts      # RSC / Route Handler createServerClient
  middleware.ts  # 刷新 session（若使用 middleware）
```

**服务端获取当前用户（RSC / API）：**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}
```

**要点：**

- 使用 `getUser()` 校验 JWT，**不要**单独信任 `getSession()` 的缓存 session（易被伪造）
- Cookie 由 `@supabase/ssr` 管理，应用不要自造第二套 auth cookie 名

---

### 模式 B：Prisma + 服务端鉴权（RapperRank 类项目）

适用：已用 Prisma 访问自有 schema、通过 Route Handler 暴露 API。

**流程：**

1. 请求进入 Route Handler / Server Action
2. 用模式 A 的 `getAuthUser()` 或 `supabase.auth.getUser()` 得到 `auth.users.id`
3. 未登录 → `401`；已登录 → Prisma 用 `authUserId` 读写 `{schema}` 下的表
4. Prisma 使用 `DATABASE_URL`（postgres 角色），**不经过** Supabase Data API

**API 鉴权模板：**

```ts
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authUserId = user.id;
  // prisma.xxx.findMany({ where: { authUserId } })
}
```

**要点：**

- Prisma 直连默认**不启用 RLS**（绕过 JWT 角色），必须在应用层校验 `authUserId`
- 若未来要对部分表开放 `supabase-js` 直连，再为该表单独加 RLS

---

### 模式 C：匿名 + 登录并存（迁移期）

RapperRank 当前为匿名 `User` + 自研 cookie。迁移步骤建议：

1. 接入 Supabase Auth，登录用户写入 `auth_user_id`
2. 新数据：登录用户用 `auth.users.id`；游客继续匿名 `userId`
3. 提供「合并」：登录后将匿名 `ratings` / `favorites` 迁到 `auth_user_id`（一次性事务）
4. 稳定后废弃匿名表或标记 `kind = ANONYMOUS`

---

## 6. 业务 Profile 表（推荐模板）

每个应用在**自己的 schema** 建 profile，与 `auth.users` 1:1：

```sql
CREATE TABLE myapp.profiles (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  auth_user_id  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_auth_user_id_idx ON myapp.profiles (auth_user_id);
```

**首次登录钩子：**

- 在应用内：`getUser()` 成功后 `upsert` profile
- 或 Database Trigger：`auth.users` INSERT 后写入 `myapp.profiles`（适合多应用统一）

---

## 7. 数据访问与 RLS

### 7.1 何时用 RLS

| 场景 | 建议 |
|------|------|
| 浏览器通过 `supabase-js` 直连表 | **必须** RLS + `auth.uid()` |
| 仅 Prisma / 服务端 postgres 连接 | 应用层鉴权为主；可选 RLS 作纵深防御 |
| `service_role` 脚本 | 绕过 RLS，仅限受信环境 |

### 7.2 RLS 策略示例

```sql
ALTER TABLE myapp.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_own"
  ON myapp.posts FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "posts_insert_own"
  ON myapp.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);
```

**注意：** `UPDATE` 需要同时有 `SELECT` policy，否则更新会静默影响 0 行。

### 7.3 在 Dashboard 查看数据

Table Editor 默认显示 `public`。业务数据在自定义 schema 时：

- SQL Editor：`SELECT * FROM myapp.profiles LIMIT 10;`
- 或 Table Editor 切换 **schema** 为 `myapp`（若 UI 支持）

---

## 8. 跨应用与「单点登录」预期

| 场景 | 行为 |
|------|------|
| 同一 Supabase 项目、同一邮箱注册 | **同一 `auth.users` 记录**，各应用共用账号 |
| 不同子域 `*.nirvazure.cn` | 可配置 cookie `domain=.nirvazure.cn` 改善体验 |
| 完全不同顶级域 | **各站独立 session**；账号密码相同，但通常需各站分别登录 |
| 一次登录全站免登 | Supabase **不内置**跨顶级域 SSO，需自建门户或统一 IdP |

---

## 9. 安全清单（必做）

- [ ] 前端绝不使用 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] RLS：凡暴露给 `anon` / `authenticated` 的表必须启用并写清 policy
- [ ] 权限字段放 `app_metadata`，不用 `user_metadata` 做授权
- [ ] 删除用户前先 `signOut` / 吊销 session；删除 `auth.users` 不会立即使旧 JWT 失效
- [ ] Storage bucket 单独配置 policy；`upsert` 需 INSERT + SELECT + UPDATE
- [ ] 各应用 schema 之间**不做跨 schema 外键**（除引用 `auth.users`）

---

## 10. 接入检查清单

新应用上线前，负责人勾选：

### Dashboard（YQYHub）

- [ ] 已创建独立 schema（如 `myapp`）
- [ ] Authentication → Redirect URLs 已加入本地 + 预览 + 生产地址
- [ ] 所需 Provider（Email / OAuth）已启用

### 仓库

- [ ] `.env.example` 含 Auth + DB 变量模板，`schema=` 已改为本应用名
- [ ] `.gitignore` 包含 `.env`，且未提交密钥
- [ ] Prisma / migration 中所有 model 带 `@@schema("myapp")`
- [ ] 业务表含 `auth_user_id`（若需登录）或文档说明仍处匿名阶段

### 运行时

- [ ] 本地 `5432` 可 migrate + seed
- [ ] Vercel 生产 `DATABASE_URL` 为 `6543` + `pgbouncer=true&schema=myapp`
- [ ] Vercel `DIRECT_DATABASE_URL` 为 `5432` + `schema=myapp`
- [ ] Redeploy 后登录 / 回调 / 受保护 API 冒烟通过

### 鉴权

- [ ] 受保护路由使用 `getUser()`，非仅 `getSession()`
- [ ] API 对未登录返回 `401`，越权返回 `403`
- [ ] 若用 Prisma：所有写操作绑定当前 `auth.users.id`

---

## 11. 应用注册表（维护）

| 应用 | Schema | 生产域名 | Auth 模式 | 备注 |
|------|--------|----------|-----------|------|
| RapperRank | `rapperank` | rapperank.nirvazure.cn | B + Supabase Auth（GitHub） | 匿名与登录并存，登录后合并数据 |
| ArtMind | `artmind` | artmind.nirvazure.cn | Supabase Client + RLS | GitHub OAuth |

每新增应用请在本表登记一行，并在 Redirect URLs 中追加域名。

---

## 12. 参考链接

- [Supabase Auth — Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Prisma — Multi-schema](https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema)
- 本仓库数据库说明：[README.md](../README.md)
- RapperRank 迁移备忘：[supabase-migration-todo.md](./supabase-migration-todo.md)

---

## 13. 常见问题

**Q：为什么在 Supabase 里看不到表？**  
A：表在 `myapp` schema，不在 `public`。用 SQL Editor 查询或切换 schema。

**Q：生产报 `prepared statement does not exist`？**  
A：`DATABASE_URL` 用了 6543 但缺少 `pgbouncer=true`。

**Q：生产报 Server Components 渲染失败？**  
A：检查 Vercel 是否仍指向旧 Supabase 项目、是否缺少 `schema=rapperank`（或你的 schema 名）。

**Q：多个应用会互相删数据吗？**  
A：不会，只要 schema 隔离且 migration 带正确 `@@schema`，各应用只动自己的 schema。

**Q：能否每个应用一个 Supabase 项目再共享用户？**  
A：不推荐。跨项目同步 `auth.users` 成本高；**一个 YQYHub + 多 schema** 是既定方案。
