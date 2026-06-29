# Supabase Migration Todo

RapperRank 已从静态数据迁移到 Prisma + PostgreSQL（`rapperank` schema），并接入 YQYHub 公用 Supabase Auth。

## Tables

- `User`: 匿名与认证用户（`auth_user_id` 桥接 `auth.users`）
- `rappers` / `Rating` / `Favorite`: 已实现持久化
- `rapper_works` / `rapper_tags`: 仍待拆分（可选）

## Rules

- 每个用户对每个 Rapper 只能保留一条评分记录。
- 用户可以更新自己的评分。
- 收藏需要按用户同步。
- 全网平均分可以由数据库视图、RPC 或服务端聚合生成。
- 前端继续通过 Route Handler 获取数据。

## Completed

- [x] Supabase Auth 登录（GitHub OAuth）
- [x] 评分提交到数据库
- [x] 收藏同步到数据库
- [x] 排行榜从数据库平均分生成
- [x] 匿名数据登录后合并

## Deferred Features

- RLS 权限策略（当前 Prisma 服务端鉴权为主）
- 废弃匿名 session 体系
- `rapper_works` / `rapper_tags` 表拆分
