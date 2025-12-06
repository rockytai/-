import { Unit } from './types';

const RAW_UNIT_DATA = [
  { title: "新的开始", chars: "天太阳上学了一走门口小鸟早来去" },
  { title: "走进教室", chars: "书儿习长知写手心也不" },
  { title: "我爱我的家", chars: "开回哥姐声妈爸中三亲" },
  { title: "当我们同在一起", chars: "饭有瓜鱼喜妹木校乐" },
  { title: "亲近大自然", chars: "双片羊大舌又月亮见家雨更山青曲" },
  { title: "数一数，比一比", chars: "个只边多少群虫重四五六七" },
  { title: "动物乐园", chars: "要画牙齿裁以你飞香才时" },
  { title: "植物真有趣", chars: "黄爬下坐机快唱在里爱从风" },
  { title: "心爱的东西", chars: "对说闹安空放夜色衣的蓝森用发地白文本" },
  { title: "欢乐时光", chars: "金工单是身后来公头带起刀子" },
  { title: "我做得到", chars: "同面师助点人车存半年十再" },
  { title: "童话天地", chars: "马孩左右父接到几别久得名" },
  { title: "我爱爸爸妈妈", chars: "养羽毛虹找物晚光比东西为出么着们干净" },
  { title: "想象的世界", chars: "跳和玩成力士前花弟分看话" },
  { title: "友谊花朵处处开", chars: "球高生朋友脸变很窝朵美丽" },
  { title: "做情绪的小主人", chars: "电外狗道升火可笑最关做" },
  { title: "我想知道为什么", chars: "包足水食奶叫云什都题追方见因海顺他呼" },
  { title: "我爱我的国家", chars: "九八日今目男女农田米果土共" },
  { title: "设备完善生活好", chars: "那桥平各害彩星灯姨立" },
  { title: "带来快乐的地方", chars: "自己二尺已眉收动鼻象牛正谈奇" },
  { title: "读故事，懂道理", chars: "常老爷办易吞耳问吃肉条两气" },
  { title: "我长大了", chars: "没午采弄谁巴百齐皮张等扫周" }
];

export const UNITS: Unit[] = RAW_UNIT_DATA.map((unit, index) => ({
  id: index + 1,
  title: unit.title,
  content: unit.chars.split('')
}));