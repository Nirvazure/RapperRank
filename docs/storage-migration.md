# OSS → Supabase Storage 迁移

目标为 YQYHub 项目的公开 `rapperank` bucket。只迁移当前数据库及厂牌、Art 配置引用的资源，不删除 OSS 对象，不开放客户端上传权限。

图片保留原图，并生成宽度 128、320、800、1200 的 WebP（质量 85、纠正方向、等比缩放、不放大）。音频只上传第 30–45 秒的 15 秒 AAC/M4A 片段，首尾各 0.2 秒淡入淡出；完整音频只下载到本地用于截取，不上传 Supabase。

## 本地运行

需要数据库连接和本地 `SUPABASE_SERVICE_ROLE_KEY`。该密钥不进入清单、Git、客户端或线上环境。`plan` 和公开对象验证无需管理密钥。Windows 已声明可选 FFmpeg/FFprobe 二进制依赖；其他平台可设置 `FFMPEG_PATH`、`FFPROBE_PATH` 为本机可执行文件。

```sh
npm run storage:migrate -- plan
npm run storage:migrate -- copy --sample
npm run storage:migrate -- verify --sample
npm run storage:migrate -- copy
npm run storage:migrate -- verify
npm run storage:migrate -- apply
```

默认使用 `.dev-data/storage-migration/runs/` 下最新的运行；可用 `--run=<运行 ID 或目录>` 指定。该目录已被 Git 忽略，包含清单、原件、生成对象、校验记录和日志。只有全量校验成功才生成供应用使用的 `src/data/storage-assets.json`，其中没有凭据。

目录保持用途清晰，原文件及其缩略图放在一起：

```text
rapper/GAI.jpg
rapper/thumbs/GAI-w128.webp        # 另有 w320、w800、w1200
label/GOSH.jpg
label/thumbs/GOSH-w128.webp
album/art/album (1).jpg
album/art/thumbs/album (1)-w128.webp
music/gai.m4a                    # 仅 15 秒版本
```

`src/data/storage-source-names.json` 固定源 URL 与可读目标 key 的关系。英文原名尽量保留；因 Supabase 文件名限制，中文名改为英文或拼音，如 `rapper/jiang-yun-sheng.jpeg`。所有音频归入 `music/`，包含原 OSS `album/旅行.mp3` 对应的 `music/lv-xing.m4a`。不上传完整音频，不在云端保存清单。SHA-256 仍用于逐对象内容校验。重复执行先验证已有内容，不覆盖冲突对象；内容改变须选择新文件名。并发 4，请求超时 60 秒，网络错误、429、5xx 最多重试 3 次，间隔 1/2/4 秒。

## 切换顺序

1. 复制代表样本并校验，再复制全量并校验全部目标的 SHA-256、字节数、MIME，以及音频时长、编码、Range 206。
2. 将包含静态映射和 `StorageImage` 兼容组件的版本部署成功。浏览器直接读取 WebP 衍生对象，避免服务端图片转换。完整原图 URL 继续存入现有图片字段。
3. 暂停人工修改媒体资料；先运行 `apply` 预览，再执行以下命令。工具会读取部署的 `/api/media/storage-version`，核对部署 ID、资源映射指纹及图片/音频处理版本。操作者还应在部署平台确认生产部署成功。

```sh
npm run storage:migrate -- apply --apply --deployment=https://rapperank.nirvazure.cn --deployment-id=<成功的部署 ID>
```

4. 页面验收评分、排行榜、收藏、评分记录、厂牌、Art 和播放器；确认无媒体继续访问 OSS，音频可播放、暂停和跳转。确认数据库三个媒体字段的 OSS 引用归零，其他业务字段未被迁移修改；验收成功后结束迁移，不设置观察期。

`apply` 默认不写入。写入前必须有当前清单的完整校验证据，重新比对所有艺人及可空媒体引用，并在数据库事务内持有表写锁，只条件更新三个媒体字段。引用变化会拒绝更新；已迁移值可重复执行。部署失败时不更新数据库。

## 运行边界

仅迁移引用中的资源，保留空值，不自动包含导入脚本中待补图片，不迁移历史闲置对象。预览不足 45 秒的源音频会失败，不能静默缩短。源对象版本变化、目标内容冲突、校验失败或引用变化都会阻止切换。

公开资源直接从 Supabase 读取；Vercel 继续承载应用，无需在线上运行迁移工具或配置 Storage 管理密钥。

## 本次执行记录（2026-10-19）

清单包含 75 位艺人的媒体字段及厂牌、Art 静态引用，共 144 个源文件。最终布局包含 117 张原图、468 张 WebP 缩略图和 27 个 15 秒音频片段，共 612 个对象、35,539,029 字节。全部对象的 SHA-256、字节数、MIME 已回下载校验；27 个音频均通过 AAC、15 秒及 Range 206 检查。此前试迁移的 198 个哈希目录对象已精确清理。

定向检查 68 个测试通过，类型检查、改动文件 ESLint 和生产构建通过。全套测试有 115 个通过、2 个既有 viewer mock 隔离问题失败；全局 ESLint 有既有 `RapperMobileDetailTabs.tsx:27` 的 `set-state-in-effect` 错误。相关源文件与迁移前提交一致，两个 viewer 测试单独执行通过。上述既有问题未混入本次修复。

生产兼容版本已部署至 `https://rapperank.nirvazure.cn`，部署 ID 为 `dpl_BrsRhS45gLg9SPew4Xdn38eQQCJn`。部署状态 READY，公开版本接口核对了实际部署 ID、处理版本与映射指纹 `fe5874fb73accc249df547d560e6382962649002fcae001df9d36ffdf070bedf`，随后才执行数据库切换。

北京时间 2026-10-19 16:16 完成 63 位艺人的 137 个媒体字段更新：47 个头像、63 个展示图、27 个背景音频。三个字段的 OSS 引用均归零，原有空值数分别保持 28、12、48。迁移前后艺人非媒体字段、评分、收藏、用户和会话表的行数及内容指纹一致。再次运行 `apply` 预览为 0 位待更新。

最终 bucket 目录数量为：`rapper/` 315、`label/` 60、`album/art/` 210、`music/` 27，无哈希目录或完整音频。线上已检查评分详情、排行榜、厂牌、Art 封面墙及弹窗、收藏与个人评分空状态；所检查的媒体元素均为 Supabase 地址，图片正常加载。GAI 播放器实际音频时长为 15 秒，播放、暂停及跳转至 7.5 秒均通过。当前浏览器为匿名会话，未登录验收已有用户的非空收藏和评分记录；相关组件测试已通过，未新增测试业务数据。

执行清单和审计证据保留在本地忽略目录 `.dev-data/storage-migration/`，运行 ID 为 `2026-10-19T07-46-36-222Z-e6c58eae`。迁移已结束，不设置观察期；源 OSS 对象由用户自行删除。
