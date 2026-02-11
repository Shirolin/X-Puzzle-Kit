/**
 * Cloudflare Pages Function - iOS Shortcuts Multi-language Update API
 * 根据请求头自动匹配并返回对应语言的更新提示
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const dataUrl = `${url.origin}/shortcuts-update.json`;

  try {
    // 1. 获取静态生成的全量数据
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch shortcuts-update.json");
    }
    const fullData = await response.json();

    // 2. 解析 Accept-Language 请求头
    const acceptLanguage = request.headers.get("Accept-Language") || "";
    
    // 提取首选语言 (如 zh-CN, en-US, ja)
    // Accept-Language 格式通常为: zh-CN,zh;q=0.9,en;q=0.8
    const preferredLanguages = acceptLanguage
      .split(",")
      .map(lang => lang.split(";")[0].trim());

    // 3. 智能匹配逻辑
    let selectedNote = fullData.notes_en; // 默认英文兜底
    
    for (const lang of preferredLanguages) {
      // 完全匹配 (如 notes_zh-CN)
      if (fullData[`notes_${lang}`]) {
        selectedNote = fullData[`notes_${lang}`];
        break;
      }
      
      // 基础语言匹配 (如 zh-CN -> zh)
      const baseLang = lang.split("-")[0];
      if (fullData[`notes_${baseLang}`]) {
        selectedNote = fullData[`notes_${baseLang}`];
        break;
      }
    }

    // 4. 组装精简结果
    const result = {
      version: fullData.version,
      versionCode: fullData.versionCode,
      url: fullData.url,
      note: selectedNote
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
