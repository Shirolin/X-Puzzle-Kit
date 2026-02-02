# 推特多图拼接功能 - 深度优化与完善指南 (Refinement Roadmap)

本文档旨在从用户体验、性能、健壮性及工程化四个维度，对当前的“推特多图拼接”功能提出深度完善建议。

## 1. 当前架构回顾 (Current Architecture)

- **入口**: PWA Share Target (`share_target`) 或 URL 参数 (`?url=...`).
- **核心 (Core)**: `src/core/twitter.ts` 负责 URL 识别、清洗、重试逻辑。
- **后端 (Worker)**: Cloudflare Worker 负责调用 FxTwitter API 解析元数据，并代理下载图片（解决跨域与防盗链）。
- **UI**: `App.tsx` 负责状态展示 (Loading) 和结果渲染。

---

## 2. 全方位完善方向

### A. 用户体验 (User Experience)

1.  **手动粘贴入口 (Manual Input UI)**
    - **现状**: 仅支持通过系统分享菜单跳转。
    - **问题**: iOS 上 PWA 的 Share Target 支持不稳定；部分用户习惯“复制链接”后打开 App。
    - **方案**: 在 Sidebar 增加一个 "🔗 导入网络图片" 按钮，点击弹出输入框，支持粘贴 URL。
    - **进阶**: App 获得焦点 (`window.onfocus`) 时，自动读取剪贴板，如果是推特链接，弹出 Toast 询问是否导入（需权限）。

2.  **国际化错误提示 (i18n Errors)**
    - **现状**: 错误提示主要依靠 `alert` 和硬编码的英文/简单翻译。
    - **方案**: 将所有错误状态码映射到 `src/core/i18n` 的翻译文件中。
      - `404`: "找不到该推文，可能已被删除或设为私密。"
      - `429`: "请求太频繁，请稍后再试。"
      - `5xx`: "解析服务暂时不可用。"

3.  **iOS 快捷指令支持 (Shortcuts Support)**
    - **现状**: iOS 无法像 Android 一样完美支持 PWA Share Target。
    - **方案**: 提供一个 iOS 快捷指令 (`.shortcut`) 文件下载。用户在推特点击分享 -> 快捷指令 -> 自动唤起 PWA 并传入参数。
    - **URL Scheme**: 注册 Custom URL Scheme (如 `xpuzzle://stitch?url=...`)，但这需要打包为原生 App；Web 版只能靠 `https://.../?url=...`。

### B. 性能与流量 (Performance & Bandwidth)

1.  **Worker 端图片压缩 (Server-side Compression)**
    - **现状**: Worker 直接透传 Twitter 的原始图片流 (通常是高质量 JPEG/PNG)。
    - **问题**: 用户在移动数据下流量消耗大；Canvas 处理超大图片容易 Crash。
    - **方案**: 在 Worker 中引入 `@cf/wasm/image-optimization` (Cloudflare Images) 或简单的流式处理，将图片转换为 WebP 并适当压缩质量 (如 85%) 再返回给前端。

2.  **流式加载与取消 (AbortController)**
    - **现状**: 下载是并行的，但如果用户在下载中途点击“取消”或关闭页面，请求可能仍在继续。
    - **方案**: 在 `useStitchManager` 或 `twitter.ts` 中引入 `AbortController`，支持中途取消下载任务。

### C. 健壮性与安全 (Robustness & Security)

1.  **多源解析回退 (Fallback Strategy)**
    - **现状**: 强依赖 `api.fxtwitter.com`。
    - **风险**: 如果 FxTwitter 宕机，功能完全瘫痪。
    - **方案**: 实现故障转移。
      - Priority 1: `api.fxtwitter.com`
      - Priority 2: `api.vxtwitter.com` (另一个开源解析服务)
      - Priority 3: 正则表达式直接提取 (仅适用于简单情况，不稳定)

2.  **Worker 鉴权 (Worker Auth)**
    - **现状**: `ALLOWED_ORIGIN = "*"`，任何人都可以盗用你的 Worker 消耗你的额度。
    - **方案**:
      - **Origin 限制**: 生产环境严格限制为 `your-domain.com`。
      - **简单 Token**: 前端请求带一个混淆的 Header，Worker 验证该 Header。虽然源码可见，但能防小白。

3.  **异常监控 (Error Monitoring)**
    - **方案**: 接入 Sentry 或简单的日志上报。当解析失败时，将失败的 URL 上报给开发者，分析是否是推特 API 变动导致的。

### D. 代码工程化 (Engineering)

1.  **类型共享 (Shared Types)**
    - **方案**: 将 `ParsedTwitterData` 等接口定义提取到 `src/types/shared.ts`，如果未来使用全栈框架 (如 Next.js)，前后端可直接复用。

2.  **单元测试 (Unit Testing)**
    - **方案**: `src/core/twitter.ts` 中的 `extractTwitterUrl` 和 `cleanTwitterUrl` 是纯函数，非常适合编写单元测试，确保各种变种链接 (e.g., `x.com`, `twitter.com`, `mobile.twitter.com`) 都能正确识别。

---

## 3. 建议实施优先级 (Priority)

1.  **P0 (高)**: **手动粘贴入口**。解决 Share Target 兼容性问题的最直接手段。
2.  **P1 (中)**: **国际化错误提示**。提升产品质感。
3.  **P1 (中)**: **Origin 限制**。防止 Worker 被盗刷。
4.  **P2 (低)**: **多源解析回退**。作为长期维护的保险。
5.  **P3 (低)**: **Worker 图片压缩**。视服务器成本和用户反馈而定。
