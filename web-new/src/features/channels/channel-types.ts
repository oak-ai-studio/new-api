export type ChannelTypeMeta = {
  label: string
  className: string
}

const CHANNEL_TYPE_MAP: Record<number, ChannelTypeMeta> = {
  1: { label: "OpenAI", className: "bg-emerald-100 text-emerald-800" },
  2: { label: "Midjourney Proxy", className: "bg-sky-100 text-sky-800" },
  3: { label: "Azure OpenAI", className: "bg-teal-100 text-teal-800" },
  4: { label: "Ollama", className: "bg-slate-100 text-slate-800" },
  5: { label: "Midjourney Proxy Plus", className: "bg-blue-100 text-blue-800" },
  8: { label: "自定义渠道", className: "bg-pink-100 text-pink-800" },
  14: { label: "Anthropic Claude", className: "bg-indigo-100 text-indigo-800" },
  15: { label: "百度文心千帆", className: "bg-blue-100 text-blue-800" },
  17: { label: "阿里通义千问", className: "bg-orange-100 text-orange-800" },
  18: { label: "讯飞星火认知", className: "bg-blue-100 text-blue-800" },
  20: { label: "OpenRouter", className: "bg-emerald-100 text-emerald-800" },
  23: { label: "腾讯混元", className: "bg-teal-100 text-teal-800" },
  24: { label: "Google Gemini", className: "bg-orange-100 text-orange-800" },
  25: { label: "Moonshot", className: "bg-emerald-100 text-emerald-800" },
  26: { label: "智谱 GLM-4V", className: "bg-purple-100 text-purple-800" },
  27: { label: "Perplexity", className: "bg-blue-100 text-blue-800" },
  33: { label: "AWS Claude", className: "bg-indigo-100 text-indigo-800" },
  34: { label: "Cohere", className: "bg-purple-100 text-purple-800" },
  40: { label: "SiliconCloud", className: "bg-purple-100 text-purple-800" },
  41: { label: "Vertex AI", className: "bg-blue-100 text-blue-800" },
  42: { label: "Mistral AI", className: "bg-blue-100 text-blue-800" },
  43: { label: "DeepSeek", className: "bg-blue-100 text-blue-800" },
  47: { label: "Xinference", className: "bg-blue-100 text-blue-800" },
  48: { label: "xAI", className: "bg-blue-100 text-blue-800" },
  57: { label: "Codex (OpenAI OAuth)", className: "bg-blue-100 text-blue-800" },
}

export function getChannelTypeMeta(type: number): ChannelTypeMeta {
  return CHANNEL_TYPE_MAP[type] || {
    label: `未知类型 (${type})`,
    className: "bg-slate-100 text-slate-700",
  }
}

export const CHANNEL_TYPE_OPTIONS = Object.entries(CHANNEL_TYPE_MAP)
  .map(([value, meta]) => ({ value: Number(value), label: meta.label }))
  .sort((a, b) => a.value - b.value)
