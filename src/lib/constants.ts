import type { RatingKey } from "@/features/ratings/rating.types";

export const RATING_KEYS = [
  "flow",
  "lyrics",
  "voice",
  "technique",
  "melody",
  "stage",
] as const satisfies readonly RatingKey[];

export const RATING_LABELS: Record<RatingKey, string> = {
  flow: "Flow律动",
  lyrics: "词作深度",
  voice: "声线特色",
  technique: "技术功底",
  melody: "旋律创作",
  stage: "舞台表现力",
};

export const RATING_DESCRIPTIONS: Record<RatingKey, string> = {
  flow: "切分、卡拍、变速、layback、节奏变化和个人律动风格。",
  lyrics: "歌词立意、叙事、隐喻、真实度和思想深度。",
  voice: "嗓音独特性、音色质感、唱腔风格和记忆点。",
  technique: "押韵、咬字、气息、快嘴、断句控制和稳定性。",
  melody: "Hook抓耳程度、旋律感、音准、旋律说唱适配度和编曲审美。",
  stage: "台风、气场、现场稳定性、氛围感和作品完整度。",
};

export const MAX_RATING = 5;
export const MIN_RATING = 1;
export const MOCK_USER_ID = "local-user-001";
