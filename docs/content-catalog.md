# 中文档案与可播放作品

## 已实施范围（2026-10-21）

首批 GAI、王以太、Jony J、法老、马思唯。每位 200–400 字中文简介、3 条经历及官方资料来源；沿用评分、收藏、登录和旧媒体字段。新增表均在 `rapperank` schema，浏览器角色无直接读写权限，通过 Prisma 服务端查询已审核内容。

用户流程为：阅读中文档案、查看代表作身份和版本、点击官方试听、打开完整播放页面、展开符合条件的专辑，再评分或收藏。切换艺人或音源时停止前一播放器；页面不会自动播放或循环。官方嵌入地址不进入原生 audio。

首批导入 75 条录音（含专辑曲目）、4 张专辑候选、154 条播放来源。15 条旧代表作候选里，12 条已关联明确平台录音；其中节目/现场版本明确标记。Jony J《套路》、法老《我想》《亲密爱人》缺少足够身份依据，未建立猜测关联。马思唯《花花公子》在海外目录名为 Crush On You，Toban Djan 保留平台英文名，Made In China 保留团体署名。

7 个官方 US 区试听通过无 Apple 登录的浏览器播放与暂停验证：GAI《华夏》、王以太《危险派对》《Wake Up》、Jony J《不用去猜》《My Man》、法老《百变酒精》、马思唯《Crush On You》。片段均约 90 秒。HTTP 200 仅作为链接探测，不作为播放证据；中国大陆 IP 路由未独立确认，不能据此声称国内全网可用。

4 张专辑为王以太 Love Me Later、Jony J《喜新恋旧》、法老《科幻小说》、马思唯 Prince Charming。GAI 本期没有纳入专辑。服务端每次查询检查至少一首已核验的试听和官方专辑完整播放入口；来源核验超过 30 天后隐藏试听按钮和不符合条件的专辑，等待重新验证。

新图集为马思唯相关的 Higher Brothers 合照，作者 Moyopoyo，来源 Wikimedia Commons，CC BY-SA 4.0，有 VRT 许可标记。数据库保存原始来源、署名、许可、校验值和对象路径。Storage 保存未修改原图和四档缩放/转码 WebP；网页链接来源和许可并说明处理方式。没有下载或缓存 Apple 音频及封面。

## 数据和发布规则

- `Track`、`RapperTrack`：稳定录音 ID、实际署名、版本和艺人角色。合作、现场、混音或不同发行不凭名称自动合并。
- `Album`、`AlbumTrack`：按 disc/position 保存完整曲序。专辑曲目可有其他艺人，不能自动视为该艺人的个人代表作。
- `PlaybackSource`：官方外跳、官方嵌入、本站片段、本站完整音频分别建行；记录地区、条件、审核和核验时间。
- `ContentSource`：具体字段来源和审核人，与单个艺人、录音或专辑关联。
- `MediaAsset`：单个内容归属、来源、bucket/path、MIME、尺寸或时长、SHA-256、使用依据和审核状态。

迁移 `202610201000_content_catalog` 为增量迁移，增加外键、索引、单一归属、审核依据及正曲序约束。公开 bucket 不能隐藏草稿，故仅允许受控导入脚本在文件审核通过后上传。Service role key 只读服务器环境；不写入 NEXT_PUBLIC 或数据清单。

## 操作方式

```bash
# 搜索候选，只写本地忽略目录，不在页面请求里调用搜索
npm run content:discover

# 审核 data/content/pilot.json 后先检查，再写入
npm run content:import
npm run content:import -- --apply

# HTTP 探测及本地报告（不会因 HTTP 200 自动批准试听）
npm run content:verify
npm run content:verify -- --all

# 新的浏览器证据须为 24 小时内，包含实际播放进度、时长、暂停和精确 URL
npm run content:verify -- --evidence=reviewed-playback.json --apply

# 本地审核文件；默认 dry run，校验文件 SHA-256、实际格式、授权和所有者
npm run content:upload -- --file=reviewed-asset.json
npm run content:upload -- --file=reviewed-asset.json --apply
```

`pilot.json` 是审核后的可导入清单；`profiles.json` 保存中文编辑稿；`playback-verification.json` 保留首批播放观察；`album-playback-evidence.json` 是本轮专辑补充证据，过期后不能直接重新批准。不要更改时间冒充新验证。清单生成器依赖本地发现原始数据，不适合在没有原始证据时重新运行。

外跳来源重新核验使用同一个 `--evidence` 命令，但必须设置 `checkType: "external_page"` 和 `officialPageObserved: true`，在 note 内记录已观察的作品身份、地区和登录条件；`observedSeconds: 0`、`durationSeconds: null`、`pausedObserved: false`。该类型只允许匹配 external 行，不能批准嵌入或音频。试听证据默认 `checkType: "playback"`，仍须播放进度、时长和暂停。

导入在事务内对内容表加锁，先校验身份及旧简介，再批量写入。重复导入跳过已有记录，不更新已审核内容；冲突录音、来源、播放身份和专辑曲序直接报错。审核后的修改通过单独的人工编辑流程处理，不能靠重跑覆盖。

素材导入仅接受本地文件，不代下载平台资源。图片验证格式，生成原图及四档 WebP，逐个验证公开对象的 MIME 和 SHA-256；已有对象冲突时拒绝覆盖。音频只支持 AAC/MP4；preview 不超过 90 秒，full 必须额外确认完整录音授权。音频校验时长和 Range 后仍保持 pending，直到真实浏览器证据通过。许可清单例子：`data/content/higher-brothers-image.json`；其本地下载文件在 `.dev-data/`，不提交 Git。

数据库迁移须使用支持会话的连接（Supabase session pooler 5432 或直连）。事务 pooler 6543 适合应用查询，本轮通过它运行迁移状态查询曾挂起；使用会话连接池后迁移成功。

## 来源与剩余缺口

[Apple 官方嵌入说明](https://artists.apple.com/support/1117-apple-music-marketing-tools)、[Apple Search API 条件](https://performance-partners.apple.com/search-api)、[合照作者与许可](https://commons.wikimedia.org/wiki/File:Higher_Brothers_Icebox_2019.jpg?oldid=1168060343)、[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。单条录音及档案来源在导入清单和数据库 ContentSource 内。

AnySearch 在前期用于官方资料发现；临时凭据不保存。后续匿名凭据引导未返回可用凭据，补充图片检索使用网页搜索，再直接核对 Commons 原始许可页。

剩余事项：大陆网络与国内平台入口的独立验收；3 首身份未确定的旧代表作；68 条录音的试听还未实际验证，页面不提供试听按钮；其余艺人的中文档案与可授权图片；完整音频授权。已有 art wall 的未知封面继续作为视觉素材，不猜测专辑信息。没有新录音授权，因此本轮没有向 Storage 上传歌曲音频。

本地开发服务用于页面联调；线上部署需后续发布代码。数据库已应用本次迁移和首批数据，旧生产代码仍可读取原字段。

## 验证记录

- 全量 Vitest：31 个文件、132 项测试通过；TypeScript 和全仓 ESLint 通过；Next.js 16.2.6 生产构建通过。构建需要联网下载既有 Google Geist 字体。
- 导入实际重复执行，最终仍为 75 条 Track、4 条 Album、154 条 PlaybackSource；已审核档案和来源不被重写。7 个试听核验保持可用；4 张专辑各有至少一首可试听曲目。
- 浏览器桌面 1280×720：档案展开、已验证试听、官方嵌入加载/播放/暂停、原生片段与嵌入互斥、切换艺人停止前一音源、15 秒片段结束停止、原生进度调节均已检查；图集已显示作者和许可链接。已尝试设置手机视口，但浏览器仍报告 1280×720，因此本轮不宣称完成真实移动断点验收。
- 图片 5 个 Storage 对象逐个校验公开访问、MIME 与 SHA-256。对象身份冲突拒绝覆盖；重复运行上传工具不会覆盖相同对象。
- Storage `objects` 只存在其他项目的 RESTRICTIVE 客户端策略，没有针对本 bucket 的 permissive 客户端写入策略；当前客户端不能上传、更新或删除，公开 bucket 的读取仍然公开。
- `code-review` 两轴审查：Standards 无明确问题；Spec 发现官方外跳来源无法续验，已补充 `external_page` 证据流程并复核解决。
