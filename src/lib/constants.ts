import type { PhOrientation, RadarRatingKey } from "@/features/ratings/rating.types";

export const RATING_KEYS = [
  "flow",
  "lyrics",
  "voice",
  "technique",
  "melody",
  "stage",
] as const satisfies readonly RadarRatingKey[];

export const RATING_LABELS: Record<RadarRatingKey, string> = {
  flow: "Flow",
  lyrics: "歌词",
  voice: "声线",
  technique: "技巧",
  melody: "旋律",
  stage: "舞台",
};

export const RATING_DESCRIPTIONS: Record<RadarRatingKey, string> = {
  flow: "节奏切分、律动变化和个人风格。",
  lyrics: "文本深度、叙事能力和表达完成度。",
  voice: "音色辨识度、质感和记忆点。",
  technique: "咬字、换气、押韵和控制力。",
  melody: "Hook 记忆度、旋律创作和听感。",
  stage: "现场稳定性、感染力和控场能力。",
};

export const RATING_LEVEL_DESCRIPTIONS: Record<RadarRatingKey, Record<number, string>> = {
  flow: {
    1: "律动单一，节奏控制明显不足。",
    2: "能跟住节拍，但变化不多。",
    3: "基础稳定，整体达到合格线。",
    4: "变化丰富，处理自然，听感成熟。",
    5: "个人风格鲜明，复杂节奏依然稳定。",
  },
  lyrics: {
    1: "表达空泛，缺少真实内容。",
    2: "有主题，但文本深度偏弱。",
    3: "立意清晰，叙事完成度合格。",
    4: "文本有细节，主题有记忆点。",
    5: "观点和写作都具备强烈个人性。",
  },
  voice: {
    1: "音色普通，辨识度偏低。",
    2: "能听出特点，但不够稳定。",
    3: "适配作品，听感合格。",
    4: "音色清晰，质感稳定。",
    5: "一耳可辨，声线本身就是标签。",
  },
  technique: {
    1: "基础技术明显薄弱。",
    2: "基础可用，但高强度段落不稳。",
    3: "技术稳定，能完成大多数段落。",
    4: "技术全面，复杂段落控制成熟。",
    5: "硬技术顶级，密度与稳定性兼备。",
  },
  melody: {
    1: "旋律弱，Hook 记忆点不足。",
    2: "有旋律意识，但抓耳度有限。",
    3: "旋律流畅，整体自然。",
    4: "Hook 抓耳，完成度高。",
    5: "旋律创作极强，传播力明显。",
  },
  stage: {
    1: "现场感染力不足。",
    2: "能完成演出，但不够有压迫感。",
    3: "舞台稳定，发挥合格。",
    4: "控场成熟，感染力强。",
    5: "现场爆发力和统治力都很强。",
  },
};

export const PH_ORIENTATION_LABELS: Record<PhOrientation, string> = {
  [-1]: "地下硬核",
  0: "综合均衡",
  1: "主流出圈",
};

export const PH_ORIENTATION_DESCRIPTIONS: Record<PhOrientation, string> = {
  [-1]: "更强调技术、Flow、歌词和表达密度。",
  0: "六维能力分布均衡，没有明显偏科。",
  1: "更强调旋律、声线、Hook 和舞台感染力。",
};

export const PH_ORIENTATION_VALUES = [-1, 0, 1] as const satisfies readonly PhOrientation[];

export const RATING_SCORE_WEIGHTS: Record<PhOrientation, Record<RadarRatingKey, number>> = {
  [-1]: {
    technique: 0.24,
    flow: 0.22,
    lyrics: 0.22,
    stage: 0.12,
    voice: 0.1,
    melody: 0.1,
  },
  0: {
    flow: 0.18,
    lyrics: 0.18,
    technique: 0.18,
    melody: 0.16,
    voice: 0.15,
    stage: 0.15,
  },
  1: {
    melody: 0.24,
    voice: 0.22,
    stage: 0.2,
    flow: 0.13,
    technique: 0.11,
    lyrics: 0.1,
  },
};

export const MAX_RATING = 5;
export const MIN_RATING = 1;
export const MAX_FONDNESS = 5;
export const MIN_FONDNESS = 1;
export const MAX_PH_RATING = 1;
export const MIN_PH_RATING = -1;
