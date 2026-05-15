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
  flow: "Flow律动",
  lyrics: "词作深度",
  voice: "声线特色",
  technique: "技术功底",
  melody: "旋律创作",
  stage: "舞台表现力",
};

export const RATING_DESCRIPTIONS: Record<RadarRatingKey, string> = {
  flow: "切分、卡拍、变速、layback、节奏变化和个人律动风格。",
  lyrics: "歌词立意、叙事、隐喻、真实度和思想深度。",
  voice: "嗓音独特性、音色质感、唱腔风格和记忆点。",
  technique: "押韵、咬字、气息、快嘴、断句控制和稳定性。",
  melody: "Hook抓耳程度、旋律感、音准、旋律说唱适配度和编曲审美。",
  stage: "台风、气场、现场稳定性、氛围感和作品完整度。",
};

export const RATING_LEVEL_DESCRIPTIONS: Record<RadarRatingKey, Record<number, string>> = {
  flow: {
    1: "明显卡拍僵硬，节奏单一，听感容易散。",
    2: "能跟住 beat，但切分和变化少，模板感较重。",
    3: "卡拍稳定，有基本断句和律动，整体合格。",
    4: "节奏变化丰富，layback、反拍、留白处理自然。",
    5: "个人律动标签鲜明，复杂节奏也能丝滑推进。",
  },
  lyrics: {
    1: "内容空洞或尬押明显，缺少真实表达。",
    2: "有主题但表达浅，叙事和文字质感偏弱。",
    3: "立意清楚，表达真实，能完成基本叙事。",
    4: "文笔、隐喻和共情力突出，主题有记忆点。",
    5: "文本有深度和独立观点，能形成作品级表达。",
  },
  voice: {
    1: "声线普通或不耐听，缺少记忆点。",
    2: "音色可辨，但质感和稳定性一般。",
    3: "声音适配作品，有一定辨识度和听感。",
    4: "音色特点鲜明，唱腔和氛围感稳定。",
    5: "一听就能认出，声线本身就是核心标签。",
  },
  technique: {
    1: "押韵、咬字、气息等基本功短板明显。",
    2: "基础技巧可用，但高密度段落容易不稳。",
    3: "押韵、吐字、气息稳定，能完成多数段落。",
    4: "技巧全面，高密度输出和断句控制成熟。",
    5: "硬技术顶级，复杂押韵、快嘴和控制力都稳定。",
  },
  melody: {
    1: "旋律弱或难听，Hook 缺少记忆点。",
    2: "有旋律意识，但走向普通，抓耳度不足。",
    3: "旋律流畅，Hook 和说唱结合基本自然。",
    4: "Hook 抓耳，音准、唱腔和流行适配度好。",
    5: "原创旋律极强，具备稳定出圈和传唱能力。",
  },
  stage: {
    1: "现场气场弱，稳定性和感染力不足。",
    2: "能完成表演，但控场、互动或开麦稳定性一般。",
    3: "现场稳定，台风自然，能撑住完整作品。",
    4: "控场成熟，气场和观众互动有明显优势。",
    5: "炸场级现场，稳定性、感染力和作品呈现都强。",
  },
};

export const PH_ORIENTATION_LABELS: Record<PhOrientation, string> = {
  [-1]: "地下硬核",
  0: "综合均衡",
  1: "主流出圈",
};

export const PH_ORIENTATION_DESCRIPTIONS: Record<PhOrientation, string> = {
  [-1]: "更看重技术、Flow、词作和真实表达。",
  0: "硬核能力、旋律听感、舞台呈现相对均衡。",
  1: "更看重旋律、声线、Hook、舞台感染力。",
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
export const MAX_PH_RATING = 1;
export const MIN_PH_RATING = -1;
export const MOCK_USER_ID = "local-user-001";
