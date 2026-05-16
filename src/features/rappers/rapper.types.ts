import type { RatingDimension } from "@/features/ratings/rating.types";

export type RapperMediaType = "image" | "gif" | "video";

export type Rapper = {
  id: string;
  name: string;
  chineseName?: string;
  alias?: string;
  labels?: string[];
  region: string;
  avatarUrl?: string;
  mediaUrl?: string;
  mediaType: RapperMediaType;
  /** 可选：艺人详情页后台循环播放的音频（跨域资源需在存储端配置 CORS） */
  backgroundAudioUrl?: string;
  bio: string;
  shortReview: string;
  tags: string[];
  representativeWorks: string[];
  ratingCount: number;
  averageRatings: RatingDimension;
};
