# Supabase Migration Todo

RapperRank 首版使用静态数据和本地模拟用户。后续迁移 Supabase 时，保持现有 service/query/store 边界，只替换数据来源和持久化方式。

## Tables

- `profiles`: 真实用户资料，对应 Supabase Auth 用户。
- `rappers`: Rapper 基础信息、视觉素材、简介、短评、评分人数缓存。
- `rapper_works`: Rapper 代表作。
- `rapper_tags`: Rapper 标签。
- `ratings`: 用户对单个 Rapper 的六维 1-5 分评分。
- `favorites`: 用户收藏的 Rapper。

## Rules

- 每个用户对每个 Rapper 只能保留一条评分记录。
- 用户可以更新自己的评分。
- 收藏需要按用户同步。
- 全网平均分可以由数据库视图、RPC 或服务端聚合生成。
- 前端继续通过 `rapper.service.ts` 和 `rapper.queries.ts` 获取数据。

## Deferred Features

- Supabase Auth 登录/注册。
- 评分提交到数据库。
- 收藏同步到数据库。
- RLS 权限策略。
- 排行榜从数据库平均分生成。
