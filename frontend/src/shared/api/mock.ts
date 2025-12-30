import type { POI, Category, SearchResult, ChatResponse, RouteResponse, Coordinate, TransportMode } from '../types';

// Реалистичные POI Москвы и области
export const mockPOIs: POI[] = [
  {
    id: 'poi-1',
    name: 'Храм Христа Спасителя',
    description: 'Кафедральный собор Русской православной церкви, расположенный в Москве на улице Волхонка. Существующее сооружение — воссоздание одноимённого храма, созданного в XIX веке по проекту архитектора Константина Тона. Оригинал был разрушен в 1931 году.',
    short_description: 'Главный кафедральный собор Москвы',
    lat: 55.7446,
    lng: 37.6054,
    address: 'ул. Волхонка, 15, Москва',
    category: 'religious',
    subcategory: 'church',
    tags: ['собор', 'православие', 'XIX век', 'восстановленный'],
    historical_period: 'XIX век',
    year_built: 1883,
    source: 'OpenStreetMap',
    osm_id: 123456,
    popularity_score: 98,
  },
  {
    id: 'poi-2',
    name: 'Усадьба Кусково',
    description: 'Усадебный ансамбль XVIII века, бывшее имение графов Шереметевых. Включает дворец, церковь, павильоны и регулярный французский парк. Один из немногих полностью сохранившихся усадебных комплексов.',
    short_description: 'Летняя резиденция Шереметевых XVIII века',
    lat: 55.7356,
    lng: 37.8094,
    address: 'ул. Юности, 2, Москва',
    category: 'architecture',
    subcategory: 'manor',
    tags: ['усадьба', 'Шереметевы', 'XVIII век', 'музей'],
    historical_period: 'XVIII век',
    year_built: 1769,
    source: 'OpenStreetMap',
    osm_id: 234567,
    popularity_score: 92,
  },
  {
    id: 'poi-3',
    name: 'Бункер Сталина на Таганке',
    description: 'Секретный командный пункт времён Холодной войны, расположенный на глубине 65 метров. Был построен в 1950-х годах и рассекречен только в 2006 году. Сейчас функционирует как музей.',
    short_description: 'Рассекреченный командный пункт времён Холодной войны',
    lat: 55.7417,
    lng: 37.6503,
    address: '5-й Котельнический пер., 11, Москва',
    category: 'military',
    subcategory: 'bunker',
    tags: ['бункер', 'холодная война', 'музей', 'подземелье'],
    historical_period: 'XX век',
    year_built: 1956,
    source: 'OpenStreetMap',
    osm_id: 345678,
    popularity_score: 88,
  },
  {
    id: 'poi-4',
    name: 'Новодевичий монастырь',
    description: 'Православный женский монастырь, основанный в 1524 году великим князем Василием III. Входит в список объектов Всемирного наследия ЮНЕСКО. Архитектурный ансамбль — выдающийся образец московского барокко.',
    short_description: 'Монастырь XVI века, объект ЮНЕСКО',
    lat: 55.7263,
    lng: 37.5564,
    address: 'Новодевичий пр., 1, Москва',
    category: 'religious',
    subcategory: 'monastery',
    tags: ['монастырь', 'ЮНЕСКО', 'XVI век', 'барокко'],
    historical_period: 'XVI век',
    year_built: 1524,
    source: 'OpenStreetMap',
    osm_id: 456789,
    popularity_score: 95,
  },
  {
    id: 'poi-5',
    name: 'Мемориал Победы на Поклонной горе',
    description: 'Мемориальный комплекс, посвящённый победе в Великой Отечественной войне. Включает Центральный музей, обелиск высотой 141,8 метров и храм Георгия Победоносца.',
    short_description: 'Мемориальный комплекс Победы',
    lat: 55.7318,
    lng: 37.5050,
    address: 'площадь Победы, 3, Москва',
    category: 'memorial',
    tags: ['ВОВ', 'мемориал', 'музей', 'XX век'],
    historical_period: 'XX век',
    year_built: 1995,
    source: 'OpenStreetMap',
    osm_id: 567890,
    popularity_score: 90,
  },
  {
    id: 'poi-6',
    name: 'Усадьба Архангельское',
    description: 'Дворцово-парковый ансамбль конца XVIII века. Принадлежал князьям Голицыным, затем Юсуповым. Называется "подмосковным Версалем" за масштаб и красоту.',
    short_description: 'Подмосковный Версаль князей Юсуповых',
    lat: 55.7847,
    lng: 37.2839,
    address: 'Московская область, Красногорский район',
    category: 'architecture',
    subcategory: 'manor',
    tags: ['усадьба', 'Юсуповы', 'XVIII век', 'парк'],
    historical_period: 'XVIII век',
    year_built: 1780,
    source: 'OpenStreetMap',
    osm_id: 678901,
    popularity_score: 89,
  },
  {
    id: 'poi-7',
    name: 'Линия обороны Москвы (ДОТ у Химок)',
    description: 'Сохранившийся долговременный огневой точка времён Великой Отечественной войны. Часть Можайской линии обороны столицы в 1941 году.',
    short_description: 'ДОТ 1941 года на подступах к Москве',
    lat: 55.8969,
    lng: 37.4453,
    address: 'Химки, Московская область',
    category: 'military',
    subcategory: 'fortification',
    tags: ['ВОВ', 'фортификация', '1941', 'ДОТ'],
    historical_period: 'XX век',
    year_built: 1941,
    source: 'OpenStreetMap',
    osm_id: 789012,
    popularity_score: 72,
  },
  {
    id: 'poi-8',
    name: 'Церковь Покрова в Филях',
    description: 'Православный храм конца XVII века, выдающийся образец нарышкинского барокко. Построен боярином Львом Нарышкиным, дядей Петра I.',
    short_description: 'Шедевр нарышкинского барокко XVII века',
    lat: 55.7461,
    lng: 37.4783,
    address: 'Новозаводская ул., 6, Москва',
    category: 'religious',
    subcategory: 'church',
    tags: ['барокко', 'XVII век', 'Нарышкины'],
    historical_period: 'XVII век',
    year_built: 1694,
    source: 'OpenStreetMap',
    osm_id: 890123,
    popularity_score: 85,
  },
  {
    id: 'poi-9',
    name: 'Коломенское',
    description: 'Бывшая царская резиденция, расположенная к югу от центра Москвы. Включает церковь Вознесения (ЮНЕСКО), деревянный дворец Алексея Михайловича и исторический парк.',
    short_description: 'Царская резиденция с храмом XVI века (ЮНЕСКО)',
    lat: 55.6672,
    lng: 37.6706,
    address: 'просп. Андропова, 39, Москва',
    category: 'architecture',
    subcategory: 'manor',
    tags: ['царская резиденция', 'ЮНЕСКО', 'XVI век', 'парк'],
    historical_period: 'XVI век',
    year_built: 1532,
    source: 'OpenStreetMap',
    osm_id: 901234,
    popularity_score: 94,
  },
  {
    id: 'poi-10',
    name: 'Донской монастырь',
    description: 'Ставропигиальный мужской монастырь, основанный в 1591 году в память избавления Москвы от нашествия крымского хана Казы-Гирея.',
    short_description: 'Монастырь-крепость XVI века',
    lat: 55.7147,
    lng: 37.5928,
    address: 'Донская пл., 1-3, Москва',
    category: 'religious',
    subcategory: 'monastery',
    tags: ['монастырь', 'некрополь', 'XVI век'],
    historical_period: 'XVI век',
    year_built: 1591,
    source: 'OpenStreetMap',
    osm_id: 112345,
    popularity_score: 82,
  },
  {
    id: 'poi-11',
    name: 'Бородинское поле',
    description: 'Место Бородинского сражения 1812 года — крупнейшей битвы Отечественной войны. Сейчас — музей-заповедник с памятниками, редутами и экспозициями.',
    short_description: 'Поле Бородинской битвы 1812 года',
    lat: 55.5175,
    lng: 35.8228,
    address: 'Можайский район, Московская область',
    category: 'military',
    subcategory: 'battlefield',
    tags: ['1812', 'Наполеон', 'Кутузов', 'музей-заповедник'],
    historical_period: 'XIX век',
    year_built: 1812,
    source: 'OpenStreetMap',
    osm_id: 223456,
    popularity_score: 91,
  },
  {
    id: 'poi-12',
    name: 'Усадьба Царицыно',
    description: 'Дворцово-парковый ансамбль на юге Москвы, заложенный по приказу Екатерины II. Архитектор — Василий Баженов, затем Матвей Казаков. Псевдоготический стиль.',
    short_description: 'Готическая резиденция Екатерины II',
    lat: 55.6161,
    lng: 37.6850,
    address: 'ул. Дольская, 1, Москва',
    category: 'architecture',
    subcategory: 'manor',
    tags: ['Екатерина II', 'готика', 'XVIII век', 'парк'],
    historical_period: 'XVIII век',
    year_built: 1776,
    source: 'OpenStreetMap',
    osm_id: 334567,
    popularity_score: 93,
  },
  {
    id: 'poi-13',
    name: 'Симонов монастырь',
    description: 'Мужской монастырь, основанный в 1370 году преподобным Фёдором. Большая часть разрушена в 1930-х, сохранились крепостные стены и башни.',
    short_description: 'Остатки монастыря-крепости XIV века',
    lat: 55.7133,
    lng: 37.6569,
    address: 'Восточная ул., 4, Москва',
    category: 'religious',
    subcategory: 'monastery',
    tags: ['монастырь', 'XIV век', 'руины', 'крепость'],
    historical_period: 'XIV век',
    year_built: 1370,
    source: 'OpenStreetMap',
    osm_id: 445678,
    popularity_score: 68,
  },
  {
    id: 'poi-14',
    name: 'Музей техники Вадима Задорожного',
    description: 'Крупнейший в России частный музей техники. Коллекция включает ретро-автомобили, мотоциклы, военную технику, самолёты.',
    short_description: 'Крупнейший частный музей техники',
    lat: 55.7892,
    lng: 37.2742,
    address: 'Ильинское шоссе, 4-й км, Красногорский район',
    category: 'military',
    subcategory: 'museum',
    tags: ['музей', 'техника', 'танки', 'самолёты'],
    historical_period: 'XX век',
    year_built: 2008,
    source: 'OpenStreetMap',
    osm_id: 556789,
    popularity_score: 87,
  },
  {
    id: 'poi-15',
    name: 'Экотропа "Серебряный бор"',
    description: 'Природный заказник на западе Москвы. Экологическая тропа проходит через сосновый бор, вдоль озёр и болот с редкими видами птиц.',
    short_description: 'Экотропа в сосновом бору Москвы',
    lat: 55.7778,
    lng: 37.4294,
    address: 'Серебряный Бор, Москва',
    category: 'trails',
    tags: ['экотропа', 'природа', 'сосны', 'озёра'],
    historical_period: 'XXI век',
    source: 'OpenStreetMap',
    osm_id: 667890,
    popularity_score: 76,
  },
  {
    id: 'poi-16',
    name: 'Церковь Вознесения в Коломенском',
    description: 'Шатровый храм 1532 года — первый каменный шатровый храм в России. Объект Всемирного наследия ЮНЕСКО. Построен в честь рождения Ивана Грозного.',
    short_description: 'Первый каменный шатровый храм (ЮНЕСКО)',
    lat: 55.6697,
    lng: 37.6711,
    address: 'просп. Андропова, 39, Москва',
    category: 'religious',
    subcategory: 'church',
    tags: ['ЮНЕСКО', 'XVI век', 'шатровый храм', 'Иван Грозный'],
    historical_period: 'XVI век',
    year_built: 1532,
    source: 'OpenStreetMap',
    osm_id: 778901,
    popularity_score: 96,
  },
  {
    id: 'poi-17',
    name: 'Крутицкое подворье',
    description: 'Историко-архитектурный памятник XIII-XVII веков, бывшая резиденция епископов Сарских и Подонских. Сохранились теремок, переходы и храмы.',
    short_description: 'Древнее архиерейское подворье',
    lat: 55.7278,
    lng: 37.6606,
    address: 'Крутицкая ул., 11, Москва',
    category: 'religious',
    subcategory: 'church',
    tags: ['XVII век', 'подворье', 'теремок', 'изразцы'],
    historical_period: 'XVII век',
    year_built: 1694,
    source: 'OpenStreetMap',
    osm_id: 889012,
    popularity_score: 79,
  },
  {
    id: 'poi-18',
    name: 'Усадьба Абрамцево',
    description: 'Усадьба, принадлежавшая писателю С.Т. Аксакову, затем меценату С.И. Мамонтову. Центр художественной жизни России XIX века, здесь работали Репин, Васнецов, Врубель.',
    short_description: 'Усадьба художников и писателей',
    lat: 56.2347,
    lng: 37.9653,
    address: 'Сергиево-Посадский район, Московская область',
    category: 'architecture',
    subcategory: 'manor',
    tags: ['усадьба', 'Мамонтов', 'художники', 'XIX век'],
    historical_period: 'XIX век',
    year_built: 1843,
    source: 'OpenStreetMap',
    osm_id: 990123,
    popularity_score: 84,
  },
];

// Категории
export const mockCategories: Category[] = [
  {
    id: 'religious',
    name_ru: 'Религиозные',
    name_en: 'Religious',
    icon: 'church',
    children: [
      { id: 'church', name_ru: 'Церкви', name_en: 'Churches', parent_id: 'religious' },
      { id: 'monastery', name_ru: 'Монастыри', name_en: 'Monasteries', parent_id: 'religious' },
    ],
  },
  {
    id: 'military',
    name_ru: 'Военные объекты',
    name_en: 'Military',
    icon: 'shield',
    children: [
      { id: 'fortification', name_ru: 'Укрепления', name_en: 'Fortifications', parent_id: 'military' },
      { id: 'bunker', name_ru: 'Бункеры', name_en: 'Bunkers', parent_id: 'military' },
      { id: 'battlefield', name_ru: 'Поля сражений', name_en: 'Battlefields', parent_id: 'military' },
      { id: 'museum', name_ru: 'Военные музеи', name_en: 'Military Museums', parent_id: 'military' },
    ],
  },
  {
    id: 'architecture',
    name_ru: 'Архитектура',
    name_en: 'Architecture',
    icon: 'building',
    children: [
      { id: 'manor', name_ru: 'Усадьбы', name_en: 'Manors', parent_id: 'architecture' },
    ],
  },
  {
    id: 'memorial',
    name_ru: 'Мемориалы',
    name_en: 'Memorials',
    icon: 'flag',
  },
  {
    id: 'trails',
    name_ru: 'Тропы',
    name_en: 'Trails',
    icon: 'map',
  },
];

// Готовые тематические маршруты
export interface PresetRoute {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_hours: number;
  distance_km: number;
  difficulty: 'easy' | 'medium' | 'hard';
  poi_ids: string[];
  image?: string;
  tags: string[];
}

export const mockPresetRoutes: PresetRoute[] = [
  {
    id: 'route-1',
    name: 'Православные святыни Москвы',
    description: 'Маршрут по главным храмам и монастырям столицы. От Храма Христа Спасителя до древних монастырей.',
    category: 'religious',
    duration_hours: 4,
    distance_km: 12,
    difficulty: 'easy',
    poi_ids: ['poi-1', 'poi-4', 'poi-10', 'poi-17'],
    tags: ['православие', 'храмы', 'монастыри'],
  },
  {
    id: 'route-2',
    name: 'Дворянские усадьбы Подмосковья',
    description: 'Путешествие по великолепным усадьбам XVIII-XIX веков. Архангельское, Кусково, Царицыно.',
    category: 'architecture',
    duration_hours: 8,
    distance_km: 45,
    difficulty: 'medium',
    poi_ids: ['poi-2', 'poi-6', 'poi-12', 'poi-9'],
    tags: ['усадьбы', 'дворцы', 'парки'],
  },
  {
    id: 'route-3',
    name: 'По следам Великой Отечественной',
    description: 'Маршрут по местам боевой славы: от линии обороны Москвы до Поклонной горы.',
    category: 'military',
    duration_hours: 6,
    distance_km: 25,
    difficulty: 'medium',
    poi_ids: ['poi-7', 'poi-5', 'poi-14'],
    tags: ['ВОВ', '1941', 'память'],
  },
  {
    id: 'route-4',
    name: 'Объекты ЮНЕСКО в Москве',
    description: 'Уникальный маршрут по объектам Всемирного наследия ЮНЕСКО в Москве и области.',
    category: 'architecture',
    duration_hours: 5,
    distance_km: 18,
    difficulty: 'easy',
    poi_ids: ['poi-4', 'poi-16', 'poi-9'],
    tags: ['ЮНЕСКО', 'наследие', 'архитектура'],
  },
  {
    id: 'route-5',
    name: 'Тайны подземной Москвы',
    description: 'Загадочный мир бункеров и подземелий столицы.',
    category: 'military',
    duration_hours: 3,
    distance_km: 8,
    difficulty: 'easy',
    poi_ids: ['poi-3'],
    tags: ['бункеры', 'подземелья', 'холодная война'],
  },
  {
    id: 'route-6',
    name: 'Нарышкинское барокко',
    description: 'Архитектурный маршрут по лучшим образцам московского барокко XVII века.',
    category: 'religious',
    duration_hours: 4,
    distance_km: 15,
    difficulty: 'easy',
    poi_ids: ['poi-8', 'poi-4', 'poi-17'],
    tags: ['барокко', 'XVII век', 'архитектура'],
  },
];

// Mock чат-ответы
const chatResponses: Record<string, { message: string; poiIds?: string[] }> = {
  default: {
    message: 'Я могу помочь вам найти интересные исторические места в Москве и области. Спросите о храмах, усадьбах, военных объектах или попросите построить маршрут!',
  },
  церкви: {
    message: 'Вот самые интересные церкви Москвы — от древних шатровых храмов до величественных соборов:',
    poiIds: ['poi-1', 'poi-8', 'poi-16', 'poi-17'],
  },
  монастыри: {
    message: 'Московские монастыри — это настоящие крепости веры и истории:',
    poiIds: ['poi-4', 'poi-10', 'poi-13'],
  },
  усадьбы: {
    message: 'Дворянские усадьбы Подмосковья — жемчужины русской архитектуры:',
    poiIds: ['poi-2', 'poi-6', 'poi-9', 'poi-12', 'poi-18'],
  },
  военные: {
    message: 'Военная история Москвы и области — от Бородино до Холодной войны:',
    poiIds: ['poi-3', 'poi-5', 'poi-7', 'poi-11', 'poi-14'],
  },
  юнеско: {
    message: 'Объекты Всемирного наследия ЮНЕСКО в Москве:',
    poiIds: ['poi-4', 'poi-16', 'poi-9'],
  },
  маршрут: {
    message: 'Я подготовил для вас интересный маршрут по историческим местам. Хотите построить его?',
    poiIds: ['poi-1', 'poi-4', 'poi-9', 'poi-12'],
  },
};

// Функция для генерации mock-ответа чата
export function getMockChatResponse(query: string): ChatResponse {
  const lowerQuery = query.toLowerCase();
  
  let response = chatResponses.default;
  
  if (lowerQuery.includes('церк') || lowerQuery.includes('храм') || lowerQuery.includes('собор')) {
    response = chatResponses.церкви;
  } else if (lowerQuery.includes('монастыр')) {
    response = chatResponses.монастыри;
  } else if (lowerQuery.includes('усадьб') || lowerQuery.includes('дворц') || lowerQuery.includes('парк')) {
    response = chatResponses.усадьбы;
  } else if (lowerQuery.includes('военн') || lowerQuery.includes('бункер') || lowerQuery.includes('война') || lowerQuery.includes('бород')) {
    response = chatResponses.военные;
  } else if (lowerQuery.includes('юнеско') || lowerQuery.includes('наследи')) {
    response = chatResponses.юнеско;
  } else if (lowerQuery.includes('маршрут') || lowerQuery.includes('постро') || lowerQuery.includes('покаж')) {
    response = chatResponses.маршрут;
  }

  const pois = response.poiIds 
    ? mockPOIs.filter(p => response.poiIds!.includes(p.id))
    : [];

  return {
    intent: pois.length > 0 ? 'search' : 'info',
    message: response.message,
    data: pois.length > 0 ? { pois, total: pois.length, query, took_ms: 42 } : undefined,
  };
}

// Функция поиска
export function mockSearch(params: {
  query: string;
  categories?: string[];
  limit?: number;
}): SearchResult {
  let results = [...mockPOIs];
  
  // Фильтр по категориям
  if (params.categories && params.categories.length > 0) {
    results = results.filter(poi => 
      params.categories!.includes(poi.category) || 
      (poi.subcategory && params.categories!.includes(poi.subcategory))
    );
  }
  
  // Поиск по запросу
  if (params.query) {
    const lowerQuery = params.query.toLowerCase();
    results = results.filter(poi =>
      poi.name.toLowerCase().includes(lowerQuery) ||
      poi.description?.toLowerCase().includes(lowerQuery) ||
      poi.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      poi.category.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Сортировка по популярности
  results.sort((a, b) => b.popularity_score - a.popularity_score);
  
  // Лимит
  if (params.limit) {
    results = results.slice(0, params.limit);
  }

  return {
    pois: results,
    total: results.length,
    query: params.query,
    took_ms: 35,
  };
}

// Функция получения POI по ID
export function mockGetPOI(id: string): POI | null {
  return mockPOIs.find(p => p.id === id) || null;
}

// Генерация mock-маршрута
export function mockBuildRoute(params: {
  poi_ids: string[];
  start?: Coordinate;
  mode?: TransportMode;
}): RouteResponse {
  const pois = params.poi_ids
    .map(id => mockPOIs.find(p => p.id === id))
    .filter((p): p is POI => p !== null);

  // Простой расчёт расстояния (приблизительно)
  let totalDistance = 0;
  for (let i = 0; i < pois.length - 1; i++) {
    const lat1 = pois[i].lat;
    const lng1 = pois[i].lng;
    const lat2 = pois[i + 1].lat;
    const lng2 = pois[i + 1].lng;
    totalDistance += Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111;
  }

  const speedKmH = params.mode === 'driving' ? 40 : params.mode === 'cycling' ? 15 : 5;
  const durationMin = (totalDistance / speedKmH) * 60;

  return {
    route: {
      distance_km: Math.round(totalDistance * 10) / 10,
      duration_min: Math.round(durationMin),
      geometry: '', // Пустой для mock
      waypoints: pois.map((poi, index) => ({
        poi,
        location: { lat: poi.lat, lng: poi.lng },
        name: poi.name,
        order: index,
      })),
      mode: params.mode || 'walking',
    },
    message: `Маршрут построен: ${pois.length} точек, ${Math.round(totalDistance * 10) / 10} км`,
    pois,
  };
}

// Отзывы для HomePage
export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  text: string;
  rating: number;
  date: string;
}

export const mockTestimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Алексей К.',
    text: 'Отличный сервис! Нашёл заброшенные доты под Москвой, о которых даже не подозревал. Теперь каждые выходные — новое приключение.',
    rating: 5,
    date: '2024-12-15',
  },
  {
    id: 't2',
    name: 'Мария С.',
    text: 'Благодаря MapBot открыла для себя потрясающие усадьбы Подмосковья. Маршруты продуманы до мелочей!',
    rating: 5,
    date: '2024-12-10',
  },
  {
    id: 't3',
    name: 'Дмитрий П.',
    text: 'Как историк, впечатлён точностью информации. Координаты ведут прямо к объекту, а не в ближайший лес.',
    rating: 4,
    date: '2024-12-08',
  },
  {
    id: 't4',
    name: 'Елена В.',
    text: 'Идеально для семейных поездок! Дети в восторге от "охоты за сокровищами" по историческим местам.',
    rating: 5,
    date: '2024-12-05',
  },
];

// Статистика
export const mockStats = {
  totalPOIs: 1247,
  totalRoutes: 89,
  totalCategories: 12,
  totalUsers: 15420,
};

