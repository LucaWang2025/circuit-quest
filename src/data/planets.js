export const PLANETS = [
  { id: 'sun', name: '太阳', en: 'Sun · Sol', color: 0xffcc33, emissive: 0xffaa00, size: 8, dist: 0, speed: 0, desc: 'G型主序星，光和热的源泉。太阳系中心恒星，占系统总质量的 99.86%。', radius: '696,340 km', orbit: '—', moons: '—' },
  { id: 'mercury', name: '水星', en: 'Mercury', color: 0x9ca3af, size: 0.5, dist: 14, speed: 4.15, desc: '距太阳最近的行星，昼夜温差极大。', radius: '2,439 km', orbit: '88 天', moons: '0' },
  { id: 'venus', name: '金星', en: 'Venus', color: 0xe8cda0, size: 0.9, dist: 18, speed: 1.62, desc: '厚密大气，强烈的温室效应。', radius: '6,052 km', orbit: '225 天', moons: '0' },
  { id: 'earth', name: '地球', en: 'Earth', color: 0x4a9eff, size: 1, dist: 24, speed: 1, desc: '目前已知唯一存在生命的行星，拥有液态水。', radius: '6,371 km', orbit: '365 天', moons: '1' },
  { id: 'mars', name: '火星', en: 'Mars', color: 0xc1440e, size: 0.7, dist: 30, speed: 0.53, desc: '红色行星，拥有太阳系最高山峰奥林帕斯山。', radius: '3,390 km', orbit: '687 天', moons: '2' },
  { id: 'jupiter', name: '木星', en: 'Jupiter', color: 0xd4a574, size: 3.5, dist: 42, speed: 0.084, desc: '太阳系最大行星，著名大红斑风暴。', radius: '69,911 km', orbit: '12 年', moons: '95+' },
  { id: 'saturn', name: '土星', en: 'Saturn', color: 0xf4d59e, size: 3, dist: 54, speed: 0.034, desc: '壮丽的行星环由冰与岩石碎屑构成。', radius: '58,232 km', orbit: '29 年', moons: '146+' },
  { id: 'uranus', name: '天王星', en: 'Uranus', color: 0x7de3f4, size: 1.8, dist: 66, speed: 0.012, desc: '自转轴近乎「躺着」公转的冰巨星。', radius: '25,362 km', orbit: '84 年', moons: '28' },
  { id: 'neptune', name: '海王星', en: 'Neptune', color: 0x3b5bdb, size: 1.7, dist: 78, speed: 0.006, desc: '最远的大行星，风速可达超音速。', radius: '24,622 km', orbit: '165 年', moons: '16' },
];

export const TEX_FILES = [
  'sunmap.jpg', 'mercurymap.jpg', 'mercurybump.jpg', 'venusmap.jpg', 'venusbump.jpg',
  'earthmap1k.jpg', 'earthbump1k.jpg', 'earthspec1k.jpg', 'earthcloudmap.jpg',
  'marsmap1k.jpg', 'marsbump1k.jpg', 'jupitermap.jpg', 'saturnmap.jpg', 'saturnringcolor.jpg',
  'uranusmap.jpg', 'neptunemap.jpg', 'moonmap1k.jpg', 'moonbump1k.jpg',
];

export const TEX_BASE = '/textures/planets/';
