# Agent Instructions

本项目（AI 视频实时翻译 / video_translation）高度依赖 AI Agent 进行自动化辅助开发。为了确保开发质量、代码安全及稳定性，所有参与本项目的 AI Agent 必须严格遵守以下详尽规范：

## 1. Git 提交规范 (Git Commits)

### 1.1 语言要求
- **绝对要求：所有 Git 提交信息（commit messages）必须完全使用中文编写。** 严禁出现全英文的提交描述。

### 1.2 格式要求
遵循 Angular 提交规范，格式为 `<type>(<scope>): <subject>`。
- **type** 允许的类型：
  - `feat`: 新功能 (feature)
  - `fix`: 修复 bug
  - `docs`: 文档修改 (documentation)
  - `style`: 代码格式修改（不影响代码运行的变动，如空格、格式化等）
  - `refactor`: 重构（既不是新增功能，也不是修改 bug 的代码变动）
  - `perf`: 优化相关，比如提升性能、体验
  - `test`: 增加测试
  - `chore`: 构建过程或辅助工具的变动
- **scope** (可选): 影响的范围，比如 `video`, `subtitle`, `translation`, `cnb` 等。
- **subject**: 简短描述，不超过 50 个字符。

### 1.3 提交示例
- ✅ 正确：`feat(video): 新增支持小红书平台视频解析`
- ✅ 正确：`fix(translation): 修复批量翻译并发限流导致的丢字幕问题`
- ❌ 错误：`fix: update video parser` (使用了英文)
- ❌ 错误：`update App.tsx` (格式错误且无意义)

### 1.4 提交前检查 (Pre-commit Checks)
- 项目中有 `.pre-commit-config.yaml` 文件，必须在执行 `git commit` 前按以下步骤执行：
  1. 安装 pre-commit：`pip install pre-commit`
  2. 手动对所有文件运行检查：`pre-commit run --all-files`
- 当前钩子包含 `gitleaks`（密钥扫描）与通用 hooks（`trailing-whitespace`、`end-of-file-fixer`、`check-yaml`、`check-added-large-files`、`check-toml`）。**提交前必须确保 gitleaks 扫描通过，严禁提交任何疑似密钥/凭据。**

### 1.5 GPG 签名
项目开启了 commit 签名，系统已配置好 GPG。**每次执行 `git commit` 前，必须先执行脚本完成 GPG 签名环境初始化：**

```bash
bash install_gpg_keys.sh
```

- 执行该脚本会自动导入密钥并配置 git 的 `user.signingkey`、`commit.gpgsign` 等签名环境。
- 执行成功后，使用 `git commit -S` 提交即可；提交后需确认签名被平台认可（`git log --show-signature`）。
- **严禁**自行生成新的 GPG 密钥（新密钥公钥未登记到 CNB 平台，平台会因 `unknown_key` 判定未签名）。
- 若脚本执行报错或签名环境未就绪，请如实上报，切勿绕过签名裸提交未签名 commit。

## 2. 编码与代码规范 (Coding Standards)

### 2.1 语言与类型
- 核心代码库使用 **TypeScript** 编写。
- 必须遵守严格的类型检查。禁止滥用 `any` 类型，能推导或定义接口的地方必须明确类型。

### 2.2 框架与命名
- 项目使用 **Next.js 16 + React 19 + Tailwind CSS 4 + Shadcn UI + Zustand + AI SDK(@ai-sdk/openai) + next-intl**。组件按既有目录组织（`app/`、`components/`、`util/` 等），遵循项目现有的命名习惯。
- 变量和函数命名必须具备明确语义（驼峰命名法）。
- **必须提供中文注释**。特别是在以下场景：
  - 核心逻辑（如字幕翻译的分批、并发限流、API 调用）。
  - 视频平台解析的黑科技或特殊补丁逻辑（Bilibili / Douyin / TikTok / Xiaohongshu / YouTube）。
  - 正则表达式、SSRF 防护和复杂的网络请求。

### 2.3 错误处理与日志
- 所有的异步调用必须有妥善的 `try/catch` 或者 `.catch()` 处理。
- 对于异常，必须在日志中保留完整的堆栈和上下文信息，便于后续诊断。
- 视频解析与翻译等关键链路必须优雅处理接口失败（如 `429` 限流、超时），并调用 `useErrorStore` 记录错误码，避免用户侧直接看见裸异常。

### 2.4 文档注释规范 (Documentation & Comments)
> 本节补充面向 TypeScript 项目的统一文档注释规范。**所有代码注释与文档字符串必须使用中文编写**，专有名词、变量名与关键字保持英文原文。

#### 2.4.1 文件级文档字符串
每个新文件必须在文件头（导入语句之前、`"use server"` 之后视情况）添加文件级文档字符串，简要说明该文件的核心职责与包含的主要类/函数。

**格式要求**：使用 JSDoc 格式 `/** 描述内容 */`，置于文件最顶部。

**示例**：
```typescript
/**
 * 视频字幕翻译服务模块。
 *
 * 该文件负责处理视频字幕的翻译逻辑，包括分批翻译、并发限流与进度回调。
 * 导出的主要函数包括 translateSubtitles、createBatches、processTranslatedBatch。
 */
```

#### 2.4.2 函数/方法级文档字符串
所有公共函数、方法与接口**必须**包含标准 JSDoc 文档字符串，并清晰列出**输入参数**、**输出参数**与抛出的**异常**。

**格式要求**：
- **功能描述**：简要说明函数的作用。
- **@param**：描述每个输入参数，格式为 `@param {类型} 参数名 - 描述`。
- **@returns**：描述输出参数，格式为 `@returns {类型} 描述`。若无需返回值，写 `@returns {void} 描述`。
- **@throws**：描述可能抛出的异常，格式为 `@throws {异常类型} 描述`。

**示例**：
```typescript
/**
 * 获取指定 URL 的直链视频地址。
 *
 * @param {string} url - 视频分享链接。
 * @param {string} type - 视频平台类型（youtube/tiktok/bilibili/douyin/xiaohongshu）。
 * @returns {Promise<string>} 返回解密后的真实视频直链地址。
 * @throws {Error} 当链接解析失败或平台不支持时抛出此异常。
 */
async function getRealUrlForVideo(url: string, type: string): Promise<string> {
  // 函数实现
}
```

#### 2.4.3 通用注释原则
- **解释"为什么"而非"做了什么"**：代码命名应自解释，注释侧重于说明设计决策、复杂逻辑或业务背景。
- **避免冗余**：不要为语义清晰的简单代码添加废话注释，严禁逐行翻译代码。
- **行内注释位置**：通常放置在目标代码的**上方另起一行**，禁止在代码行末尾添加长注释。

#### 2.4.4 必加注释场景
遇到以下情况必须添加注释：
1. 复杂的算法实现、非显而易见的业务逻辑（如 `deepl-translation` 的批量拆分与 `p-limit` 并发限流）。
2. 异常处理逻辑（说明捕获了什么异常以及为什么这样处理）。
3. 代码修改处（说明修改原因或修复的 Bug）。

#### 2.4.5 与既有要求的衔接
- 本节不替代 `2.2` 中列出的核心逻辑/黑科技/正则等**必须**注释的场景，二者叠加生效。
- 对新增源文件，除补全 `2.4.1` 文件级注释外，其中导出的公共函数/接口还应遵循 `2.4.2` 的 `@param/@returns/@throws` 约定。

### 2.5 许可证与文件头规范 (License & File Header)
> 本项目为 AI 视频实时翻译 **video_translation**（302.AI 开源前端，TypeScript/Next.js），许可证为 **AGPL-3.0**。本仓库既有源码未统一强制 JSDoc 文件头，但新增文件建议遵循下述规范以提升可溯源性；修改现有文件时遵循 2.5.4 保留规则，**不得擅自大规模改动既有文件头**。

#### 2.5.1 许可证声明
仓库根目录使用 **GNU Affero General Public License v3.0（AGPL-3.0）**。无需在每份文件中手写整段许可证全文，但新增源文件可在文件头 JSDoc 中以 `@LICENSE AGPL-3.0 license` 标明许可证归属。

#### 2.5.2 文件头模板（JSDoc 风格，供新增源文件采用）
新增源文件可放置以下文件级 JSDoc 注释块（与既有源码风格兼容）：

```typescript
/**
 * @fileoverview <一句话说明该文件/模块的核心职责>
 * @author 祁筱欣
 * @date <YYYY-MM-DD>
 * @since <YYYY-MM-DD>
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 补充说明：可列点详述本文件实现的主要功能与技术要点。
 */
```

**字段填充规则**：
- `@fileoverview`：简要说明文件职责，与 `2.4.1 文件级文档字符串` 一致。
- `@author`：固定为 `祁筱欣`。
- `@date` / `@since`：采用 `YYYY-MM-DD` 格式；新文件两者均取当前日期。
- `@contact`：固定为 `qixiaoxin@stu.sqxy.edu.cn`。
- `@LICENSE`：固定写 `AGPL-3.0 license`（本项目真实许可证）。
- `@remark`（可选）：列出本模块实现的主要功能与技术栈要点。

#### 2.5.3 内部项目标识（本项目专属拼接规则，沿用 MZAPI 格式，仅项目名不同）
为保留代码文件的可溯源能力，每个源文件在 JSDoc 文件头 `@remark` 之外，还可选用一条**本项目专属的内部项目标识**。其**拼接规则与既有 MZAPI 规则完全一致，仅项目名不同**（本项目为 `video_translation`）。

**拼接格式**（与 MZAPI 相同的通式，仅替换项目名）：
```
<内部标识变量> = "<项目名小写>-<功能模块>-<年份>-<作者姓名首字母小写>"
```
- `<内部标识变量>`：`_<项目名大写蛇形>_ORIGIN`，本项目即 `_VIDEO_TRANSLATION_ORIGIN`。
- `<项目名小写>`：本项目使用 `video_translation`（MZAPI 系通式中的项目名位，此处由 `mzapi` 换成 `video_translation`）。
- `<功能模块>`：根据当前生成代码的功能，用简短英文单词或词组描述（如 `subtitle-translation`、`video-parser`）。
- `<年份>`：当前年份（如 `2026`）。
- `<作者姓名首字母小写>`：固定为 `qxx`（祁筱欣）。

**示例**（为 `subtitle-translation` 模块生成代码时）：
```javascript
// 内部项目标识（请勿修改）
_VIDEO_TRANSLATION_ORIGIN = "video_translation-subtitle-translation-2026-qxx"
```

**规则说明**：
- 本项目标识沿用了 MZAPI 的标识拼接语义，仅把其中的项目名 `mzapi` 换成 `video_translation`，以区分项目归属并保留溯源能力。
- 该标识仅在需要源码溯源场景使用，属可选项；文件头仍以 2.5.2 的 JSDoc 注释块为准。

#### 2.5.4 修改现有文件规则

当修改现有文件时：
- **保留**文件顶部已有的文件头及其中所有注释字段（若存在）。
- 若文件头缺失 `@author`、`@date`、`@contact`、`@LICENSE` 等关键字段，可选择性按 `2.5.2` 模板补齐；**不得引入 MPL-2.0 或 MZAPI 相关内容**。
- 本项目仅允许使用 2.5.3 定义的专属内部项目标识 `_VIDEO_TRANSLATION_ORIGIN`；**严禁**在本项目代码中写入 MZAPI 等其他无关项目的归属标识（如 `_MZAPI_ORIGIN`）或与其技术栈/许可证不符的项目归属声明。

## 3. 工作流与文件操作行为准则 (Workflow Guidelines)

### 3.1 阅读先于修改（禁止盲猜代码）
- 在编辑任何文件之前，**必须先使用专用工具（如 `view_file`、`cat`、`grep` 等）读取文件的真实内容**。
- 严禁凭记忆或通用经验盲猜代码结构。

### 3.2 局部精准修改
- 在修改配置或代码时，**必须进行局部精准的正则或行号匹配**。
- **绝对禁止全量覆盖**或意外替换无关内容，避免破坏其他已稳定的逻辑。

### 3.3 修改验证与闭环
- 修改代码后，必须通过 `git diff` 检查实际的变更内容是否符合预期。
- 确认没有混入无关修改后，方可进行 `git add` 和 `git commit` 操作。
- 每次完成任务后，必须确保所有修改已成功推送并提交 PR 到远程仓库的主分支（通过 PR 合并）。

### 3.4 主分支推送约束
- **除非用户明确要求直接推送到主分支**（如"推到主分支""直接合并到主分支""直接 push main"等），否则**禁止直接推送到主分支**。
- 所有代码变更一律通过创建 PR 将代码合并到主分支，确保变更可审查、可追溯。

### 3.5 Github 镜像仓库同步 PR（强制性提示词）
- **判定标准：只要 `.cnb.yml` 中存在将代码同步到 Github 的配置，即属于"同步到 Github 镜像仓库"的情况**（常见形式为在 `main: push` 事件下使用 `git-sync` 镜像同步 stage，目标指向 `github.com/...`）。**只要 `.cnb.yml` 里有这类配置，就必须在对应的 Github 镜像仓库创建一模一样的 PR**（同名、同分支、同变更内容）。
- 本仓库 `.cnb.yml` 在 `main: push` 事件下配置了 `git-sync` stage，目标为 `https://github.com/xiaomizhoubaobei/video_translation.git`，**属于"同步到 Github 镜像仓库"的情形**，因此必须在 Github 镜像仓库同步创建完全一致的 PR。
- 这是**强制性要求**，不得遗漏，确保 CNB 与 Github 镜像仓库的代码变更保持同步、可追踪。

### 3.6 GH_TOKEN 环境变量（Github Token）
- 在执行与 **Github 镜像仓库**相关的同步/推送/创建 PR 等操作时，需要用到 Github 的访问令牌，其对应的环境变量名为 **`GH_TOKEN`**（即 Github Personal Access Token）。
- **用途**：用于对 `github.com/xiaomizhoubaobei/video_translation` 镜像仓库的鉴权，支持向该镜像仓库同步代码、推送分支以及通过 Github API 创建一模一样的 PR。
- **安全要求**：
  - `GH_TOKEN` 属于敏感凭据，**严禁**将其硬编码写入源码、AGENTS.md 或其他任何被提交到仓库的文件中。
  - 必须通过 CI/CD 流水线的密钥/环境注入机制（如 CNB 的密钥管理或 `.cnb.yml` 中声明）安全注入到运行环境，供 Agent 在运行时读取。
  - 提交前 gitleaks 密钥扫描会拦截疑似泄漏的令牌，若扫描未通过需检查是否误将 `GH_TOKEN` 值写入文件。

## 4. 持续集成与部署规范 (CI/CD - .cnb.yml)

### 4.1 配置文件规范
- 本项目使用 CNB (Cloud Native Build) 构建流水线（基于 `.cnb.yml`）。
- 在修改 `.cnb.yml` 时，必须严格遵守 YAML 的缩进规范（通常为 2 个空格）。
- `.cnb.yml` 中存在 `vscode` 与 `main` 两段流水线配置：`vscode` 用于安装 CLI/kimi/qwen 等智能体与依赖；`main: push` 事件下配置了 `git-sync` 将代码同步到 Github 镜像仓库。

### 4.2 环境依赖
- 如果在流水线的某一个 stage 中引入了需要构建或运行容器镜像的操作（如 `docker build`、`docker run`、基于其他镜像执行脚本等），**必须在该事件或作业级别明确声明 `services: - docker`**，否则会导致流水线无法正常挂载 Docker 守护进程。

## 5. 特定业务逻辑指导 (Domain Specifics)

### 5.1 字幕翻译与服务流程 (Subtitle Translation)
- 本项目核心链路为：读取视频链接 → 解析平台直链（`app/actions/video/`）→ 调用 302 API 获取字幕（`api/transcript.ts`）→ 翻译字幕（`util/ai/`）→ 前端渲染并下载字幕文件。
- **字幕翻译支持**：(1) DeepL 批量翻译（`util/ai/deepl-translation.ts`，按 `maxBatchSize` 分批 + `p-limit` 并发限流）；(2) AI 大模型翻译（`util/ai/translation.ts`，`subtitleTranslationService`，使用 `TRANSLATION_SYSTEM_PROMPT` 模板）。
- 修改翻译逻辑时，必须保持字幕的**索引（index）一一对应**，严禁合并或拆分字幕行，否则会导致字幕时间轴错乱。
- 翻译结果需校验行数（`createBatchContent` 与 `processTranslatedBatch`），确保解析出的字幕行数与输入一致。
- 支持多语言（中文/English/日本語/Deutsch/Français/한국어/Español），改动 UI 文案或语言列表时需同步维护 `README.md`、`README_zh.md`、`README_ja.md` 及 `i18n.ts`/`middleware.ts` 中的 `locales` 一致性。

### 5.2 视频平台解析 (Video Platform Parsing)
- 本项目支持 **YouTube、TikTok、Bilibili、抖音、小红书** 等平台（见 `app/actions/video/`）。
- 处理视频链接时**必须防范 SSRF**（`util/video.ts` 中的 `isPrivateHost`/`isValidIPv4Octets` 等校验），严禁放过内网地址/回环地址，避免被利用发起内网探测。
- 各平台解析逻辑独立，改动时保持模块隔离，避免平台间串扰。

### 5.3 AI 模型调用与接口 (AI & API)
- **限流与降级**：必须优雅地处理 `429 Too Many Requests`，触发限流时应有清晰的日志和合理的快速阻断/重试机制（参考 `api/api.ts` 中的 `apiKy`，以及 `util/ai/translation.ts` 的 `MAX_RETRIES` 重试）。
- API 请求应遵循 `.env.example` 中的配置约定（`NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_API_KEY`、`NEXT_PUBLIC_REGION` 等），严禁将密钥硬编码到源码或提交到仓库。
- 前端调用 `apiKy`（`ky` 实例）统一走 `prefixUrl` 与鉴权头注入，错误码通过 `useErrorStore` 记录并翻译为用户可读文案。

## 6. CNB OpenAPI 操作规范 (CNB OpenAPI Operations)

- **使用 curl 调用 API**：在执行任何与 CNB (Cloud Native Build) 相关的操作时，通过 shell 执行 curl 命令直接调用 CNB OpenAPI。
- **从 swagger.json 获取 API 信息**：调用接口前，先从 https://api.cnb.cool/swagger.json 获取最新 API 定义（含接口路径、请求方法、请求参数与鉴权要求），确保参数结构准确后再用 curl 执行。
- **强制查看帮助文档**：在调用 API 之前，请通过 OpenAPI 文档确认参数结构。

## 7. 多语言与环境变量注意事项

### 7.1 环境变量
- 运行时必须依赖 `.env.example` 中声明的变量，缺失时参考 `api/api.ts` 的做法（抛出明确错误），严禁静默跳过。
- `NEXT_PUBLIC_*` 前缀变量会被注入到前端 bundle，**严禁在其中放置任何敏感凭据/密钥**。

### 7.2 国际化 (i18n)
- 本项目使用 `next-intl`，`locales` 列表集中定义在 `i18n.ts` 与 `middleware.ts` 的 `supportedLocales` 中。
- 新增语言时，需在 `message/{locale}.json` 补齐对应文案，并同步更新 `locales` 数组、`middleware` 的 matcher 以及 README 语言列表。
