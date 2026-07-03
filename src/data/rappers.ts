import { rappersSchema } from "@/features/rappers/rapper.schema";
import { normalizeRapperImages } from "@/features/rappers/rapper.media";
import type { RapperSeedRecord } from "@/features/rappers/rapper.types";
import { chineseRappers } from "@/data/chinese-rappers";

export const rawRappers: RapperSeedRecord[] = [
  {
    seedKey: "kendrick-lamar",
    name: "Kendrick Lamar",
    aliases: ["K.Dot"],
    region: "Compton, USA",
    avatarUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    bio: "以叙事、概念专辑和强烈现场表达建立标杆的西海岸代表人物。",
    tags: ["Lyricist", "West Coast", "Concept Album", "Pulitzer"],
    representativeWorks: ["HUMBLE.", "Alright", "DNA."],
  },
  {
    seedKey: "drake",
    name: "Drake",
    aliases: [],
    region: "Toronto, Canada",
    avatarUrl: "/rapper/drake.jpeg",
    mediaUrl: "/rapper/drake.jpeg",
    mediaType: "image",
    bio: "把说唱、R&B 和流行旋律融合成全球级传播公式的超级明星。",
    tags: ["Melody Rap", "Pop Rap", "Toronto", "Hitmaker"],
    representativeWorks: ["God's Plan", "Hotline Bling", "Started From the Bottom"],
  },
  {
    seedKey: "j-cole",
    name: "J. Cole",
    aliases: [],
    region: "Fayetteville, USA",
    avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    bio: "兼具自省叙事、制作能力和稳定输出的现代说唱代表。",
    tags: ["Storytelling", "Producer", "Conscious Rap", "Dreamville"],
    representativeWorks: ["No Role Modelz", "MIDDLE CHILD", "Love Yourz"],
  },
  {
    seedKey: "eminem",
    name: "Eminem",
    aliases: ["Slim Shady"],
    region: "Detroit, USA",
    avatarUrl: "/rapper/eminem.jpeg",
    mediaUrl: "/rapper/eminem.jpeg",
    mediaType: "image",
    bio: "以押韵密度、快嘴技巧和角色叙事改变全球说唱传播尺度。",
    tags: ["Battle", "Fast Rap", "Detroit", "Technical"],
    representativeWorks: ["Lose Yourself", "Rap God", "Stan"],
  },
  {
    seedKey: "nicki-minaj",
    name: "Nicki Minaj",
    aliases: [],
    region: "Queens, USA",
    avatarUrl: "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=400&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=1200&q=80",
    mediaType: "image",
    bio: "以多角色声线、流行旋律和强势舞台塑造全球女性说唱符号。",
    tags: ["Queens", "Pop Rap", "Persona", "Icon"],
    representativeWorks: ["Super Bass", "Moment 4 Life", "Anaconda"],
  },
  {
    seedKey: "travis-scott",
    name: "Travis Scott",
    aliases: ["La Flame"],
    region: "Houston, USA",
    avatarUrl: "/rapper/travis.webp",
    mediaUrl: "/rapper/travis.webp",
    mediaType: "image",
    bio: "用氛围化制作、Auto-Tune 声场和现场能量建立沉浸式说唱体验。",
    tags: ["Trap", "Houston", "Psychedelic", "Live Energy"],
    representativeWorks: ["SICKO MODE", "goosebumps", "Antidote"],
  },
  {
    seedKey: "dirtytwinz",
    name: "DirtyTwinz",
    aliases: [],
    region: "Xi'an, China",
    avatarUrl: "/rapper/dt.jpg",
    mediaUrl: "/rapper/dt.jpg",
    mediaType: "image",
    backgroundAudioUrl:
      "https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/%E6%97%85%E8%A1%8C.mp3",
    bio: "来自西安的双人说唱组合，以鲜明的街头叙事、默契配合和强烈地域气质建立辨识度。",
    tags: ["Xi'an", "Chinese Rap", "Duo", "Street"],
    representativeWorks: ["Dirty Talk", "西安脉冲", "Twin Flow"],
  },
  {
    seedKey: "pact",
    name: "Pact",
    aliases: ["派克特"],
    region: "Xi'an, China",
    avatarUrl: "/rapper/pact.jpg",
    mediaUrl: "/rapper/pact.jpg",
    mediaType: "image",
    bio: "西安说唱代表人物之一，兼具成熟的词作组织、稳定的舞台表达和厂牌视野。",
    tags: ["Xi'an", "Chinese Rap", "NOUS", "Lyricist"],
    representativeWorks: ["午夜伤心电台", "冠军情歌", "走起来"],
  },
  {
    seedKey: "pharaoh",
    name: "法老",
    aliases: ["Pharaoh"],
    region: "Shanghai, China",
    avatarUrl: "/rapper/法老.webp",
    mediaUrl: "/rapper/法老.webp",
    mediaType: "image",
    bio: "中文硬核说唱代表人物，擅长高密度表达、情绪推进和极具冲击力的舞台呈现。",
    tags: ["Shanghai", "Chinese Rap", "Hardcore", "Technical"],
    representativeWorks: ["我想", "亲密爱人", "百变酒精"],
  },
  ...chineseRappers,
];

export const rappers = rappersSchema.parse(rawRappers.map(normalizeRapperImages));
