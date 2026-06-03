export type Option = { id: string; label: string };

export const Q1_OPTIONS: Option[] = [
  { id: 'A', label: 'A. AI 做信息处理，HR 做判断决策' },
  { id: 'B', label: 'B. AI 提升效率，HR 聚焦人与沟通' },
  { id: 'C', label: 'C. AI 提供建议，HR 负责个性化落地' },
  { id: 'D', label: 'D. AI 是"协作助手"，不是"替代者"' },
  { id: 'E', label: 'E. HR 需要先学会"提问"，才能更好用 AI' },
];

export const Q2_OPTIONS: Option[] = [
  { id: 'A', label: 'A. 能，而且已经在帮助我了' },
  { id: 'B', label: 'B. 能，但我还在探索怎么真正用起来' },
  { id: 'C', label: 'C. 可能能，但我还没有找到适合自己的场景' },
  { id: 'D', label: 'D. 暂时感受不明显，还需要更多实践验证' },
];

export const TRAIT_MAP: Record<string, string> = {
  A: '理性', B: '共情', C: '创造', D: '平衡', E: '好奇', F: '不羁',
};

export const STANCE_MAP: Record<string, string> = {
  A: '先锋派', B: '实践派', C: '观察派', D: '审慎派',
};

export type Persona = {
  name: string;
  emoji: string;
  desc: string;
  tip: string;
  gradient: string;
  top2?: string[];
  stance?: string;
};

export const PERSONAS: Record<string, Persona> = {
  '理性+先锋派': { name: '数据领航员', emoji: '🧭', desc: '你让 AI 当望远镜，自己当船长。', tip: '把判断标准写成 prompt，让 AI 帮你跑得更远。', gradient: 'from-blue-500 to-cyan-500' },
  '理性+实践派': { name: '严谨工程师', emoji: '📐', desc: '你不急着上头，先把规则定清楚。', tip: '用 AI 做 A/B 对比，让数据替你拍板。', gradient: 'from-slate-500 to-blue-500' },
  '理性+观察派': { name: '冷静侦察兵', emoji: '🔍', desc: '你在围观这场革命，伺机而动。', tip: '找一个低风险场景试水，胜过看 100 篇案例。', gradient: 'from-zinc-500 to-blue-400' },
  '理性+审慎派': { name: '理性守门员', emoji: '⚖️', desc: '你相信数据，但更相信验证。', tip: '从一个可量化的小任务开始，让 AI 自证。', gradient: 'from-gray-500 to-slate-600' },
  '共情+先锋派': { name: '暖心先行者', emoji: '🌟', desc: '你已经在用 AI 帮同事腾出时间聊天了。', tip: '把 AI 当 1v1 准备助手，沟通质量再上一层。', gradient: 'from-pink-500 to-rose-500' },
  '共情+实践派': { name: '暖心引路人', emoji: '🫂', desc: 'AI 处理流程，你负责让每个人被看见。', tip: '用 AI 写初稿，你来加温度。', gradient: 'from-rose-400 to-pink-500' },
  '共情+观察派': { name: '体贴观察家', emoji: '💗', desc: '你怕 AI 让人变冷，所以你格外用心。', tip: '让 AI 处理 80% 的事务性回复，把 20% 关键对话留给自己。', gradient: 'from-pink-400 to-fuchsia-400' },
  '共情+审慎派': { name: '守护派 HR', emoji: '🤲', desc: '人比效率更重要，是你的底线。', tip: '在敏感场景设"人工最后一关"，AI 协助你不替代你。', gradient: 'from-rose-500 to-red-400' },
  '创造+先锋派': { name: '灵感冲浪者', emoji: '🎨', desc: '你已经在玩 AI 的边界了。', tip: '把怪点子直接喂给 AI，让它当你的脑暴搭子。', gradient: 'from-purple-500 to-pink-500' },
  '创造+实践派': { name: '点子实干家', emoji: '✏️', desc: '想法多，落地也快。', tip: '建一个自己的 prompt 工具箱，每周加一个。', gradient: 'from-violet-500 to-purple-500' },
  '创造+观察派': { name: '灵感策展人', emoji: '🎨', desc: '你在等一个能配合你脑洞的 AI。', tip: '从一个小场景开始，先让 AI 当你的草稿纸。', gradient: 'from-fuchsia-400 to-purple-400' },
  '创造+审慎派': { name: '慢工创作者', emoji: '🖌', desc: '灵感重要，但成品质量更重要。', tip: '让 AI 出 3 版你选 1 版，最后一步你来润色。', gradient: 'from-purple-400 to-indigo-400' },
  '平衡+先锋派': { name: '黄金搭档', emoji: '⚡', desc: '你心里早就给 AI 划好了边界。', tip: '把"AI 该做/不该做"列成清单，团队对齐更快。', gradient: 'from-amber-500 to-orange-500' },
  '平衡+实践派': { name: '协作工程师', emoji: '🤝', desc: '你在搭一套人机配合的工作流。', tip: '画一张人机分工图，下周就贴墙上。', gradient: 'from-yellow-500 to-amber-500' },
  '平衡+观察派': { name: '稳健调和派', emoji: '⚖', desc: '你不偏不倚，等一个合适的切入点。', tip: '选一个边界清晰的环节做试点，比想清楚再做更快。', gradient: 'from-amber-400 to-yellow-400' },
  '平衡+审慎派': { name: '边界守护者', emoji: '🛡', desc: '你信协作，但更信清晰的边界。', tip: '写一份团队的 AI 使用守则，分工就清楚了。', gradient: 'from-orange-400 to-amber-500' },
  '好奇+先锋派': { name: 'AI 玩家一号', emoji: '🚀', desc: '你已经把 AI 玩出花了。', tip: '把你的 prompt 库整理出来分享，团队都能受益。', gradient: 'from-cyan-500 to-blue-500' },
  '好奇+实践派': { name: '提问实验家', emoji: '🧪', desc: '你相信，问得对比答得对更重要。', tip: '每周记 3 条让 AI 出彩的 prompt，积累成你的武器库。', gradient: 'from-teal-500 to-cyan-500' },
  '好奇+观察派': { name: '好奇瞭望者', emoji: '🔭', desc: '你在看，但还没动手。', tip: '从今天起，每天问 AI 一个工作里的真问题。', gradient: 'from-sky-400 to-cyan-400' },
  '好奇+审慎派': { name: '求证派探员', emoji: '🧐', desc: '好奇心强，但凡事爱核实。', tip: '让 AI 给你两种答案+理由，你来判断。', gradient: 'from-blue-400 to-sky-500' },
  '不羁+先锋派': { name: '自由派老炮儿', emoji: '🌪', desc: '你有自己的一套，AI 只是众多工具之一。', tip: '挑一件最烦的事，让 AI 帮你干掉它。', gradient: 'from-red-500 to-orange-500' },
  '不羁+实践派': { name: '野路子选手', emoji: '🔥', desc: '你不按套路出牌，但确实出活。', tip: '把你的"野招式"写成 prompt 模板，留给团队。', gradient: 'from-orange-500 to-red-500' },
  '不羁+观察派': { name: '局外观察者', emoji: '👁', desc: '你看着这一切，保持距离。', tip: '不必全信，挑一个"AI 干不好"的小事自己试试看。', gradient: 'from-stone-500 to-orange-400' },
  '不羁+审慎派': { name: '孤胆智者', emoji: '🦉', desc: '你信经验，更信自己的判断。', tip: 'AI 可以是你的资料员，决策权永远在你这。', gradient: 'from-stone-600 to-zinc-600' },
};
