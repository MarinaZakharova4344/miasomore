/*
 * Данные меню и каталога.
 *
 * Меню ресторана — реальные цены.
 *   price — цена; либо variants: [{ label, price }] — если у блюда несколько вариантов
 *   (1/6/12 шт, добавка, регион). weight, desc, img — необязательны.
 *   Фото — подборка с Pexels до съёмки своих блюд; без img блюдо показывается строкой, как в печатном меню.
 * tags: meat | fish | spicy | hit
 */
const P = 'assets/photos/menu/';
const OYS = (a, b, c) => [{ label: '1 шт.', price: a }, { label: '6 шт.', price: b }, { label: '12 шт.', price: c }];

window.MM_MENU = [
  { id: 'breakfast', title: 'Завтраки', items: [
    { id: 'b1', name: 'Завтрак с креветкой', price: 890, tags: ['fish'] },
    { id: 'b2', name: 'Завтрак с лососем', price: 950, tags: ['fish'] },
    { id: 'b3', name: 'Круассан с лососем', price: 540, tags: ['fish'] },
    { id: 'b4', name: 'Омлет с авокадо', price: 550 },
    { id: 'b5', name: 'Омлет с беконом', price: 650, tags: ['meat'] },
    { id: 'b6', name: 'Омлет с лососем', price: 890, tags: ['fish'] },
    { id: 'b7', name: 'Творожный мусс в вишнёвом компоте', price: 460 },
    { id: 'b8', name: 'Сырники', price: 490 },
  ]},
  { id: 'starters', title: 'Закуски и салаты', items: [
    { id: 'a1', name: 'Тартар из лосося', price: 990, tags: ['fish'] },
    { id: 'a2', name: 'Тартар из говядины', price: 1050, tags: ['meat'], img: P + 'tartare.webp' },
    { id: 'a3', name: 'Нисуаз с тунцом', price: 850, tags: ['fish'] },
    { id: 'a4', name: 'Тыквенный хумус', price: 450 },
    { id: 'a5', name: 'Цезарь с креветкой', price: 890, tags: ['fish'] },
    { id: 'a6', name: 'Цезарь с курицей', price: 790, tags: ['meat'] },
    { id: 'a7', name: 'Антипасти', price: 1550, tags: ['meat'], img: P + 'meat-platter.webp' },
    { id: 'a8', name: 'Наггетсы', price: 250, tags: ['meat'] },
  ]},
  { id: 'soups', title: 'Супы', items: [
    { id: 'c1', name: 'Рамен с курицей', price: 690, tags: ['meat'] },
    { id: 'c2', name: 'Том ям', variants: [{ label: 'Классический', price: 990 }, { label: 'С фалангой краба', price: 1480 }], tags: ['fish', 'spicy'], img: P + 'tom-yum.webp' },
    { id: 'c3', name: 'Уха сливочная', price: 850, tags: ['fish'], img: P + 'ukha.webp' },
  ]},
  { id: 'hot', title: 'Горячее', items: [
    { id: 'h1', name: 'Утиное филе', price: 870, tags: ['meat'] },
    { id: 'h2', name: 'Треска су-вид', price: 950, tags: ['fish'] },
    { id: 'h3', name: 'Лосось су-вид', price: 1250, tags: ['fish'], img: P + 'salmon.webp' },
    { id: 'h4', name: 'Куриные крылышки', price: 650, tags: ['meat'] },
    { id: 'h5', name: 'Рёбра свиные', price: 890, tags: ['meat'], img: P + 'ribs.webp' },
    { id: 'h6', name: 'Запечённая фаланга краба', price: 3300, tags: ['fish'] },
    { id: 'h7', name: 'Шаверма', price: 890, tags: ['meat'] },
  ]},
  { id: 'sides', title: 'Гарниры', items: [
    { id: 'g1', name: 'Батат фри', price: 290 },
    { id: 'g2', name: 'Картофель фри', price: 250 },
    { id: 'g3', name: 'Цветная капуста', price: 280 },
    { id: 'g4', name: 'Картофель отварной', price: 150, img: P + 'potatoes.webp' },
  ]},
  { id: 'live', title: 'Живые морепродукты', items: [
    { id: 'l1', name: 'Сет «Дары моря»', price: 6990, tags: ['fish'], img: P + 'oysters.webp' },
    { id: 'l2', name: 'Сет морские ежи', variants: [{ label: '1 шт.', price: 490 }, { label: '6 шт.', price: 2940 }], tags: ['fish'] },
    { id: 'l3', name: 'Сет устрицы × морские ежи', weight: '6 + 6 шт.', price: 4900, tags: ['fish'] },
    { id: 'l4', name: 'Сет устриц «Вокруг света»', variants: [{ label: '6 шт.', price: 5300 }, { label: '12 шт.', price: 10600 }], tags: ['fish'] },
    { id: 'l5', name: 'Сет Анадара', price: 790, tags: ['fish'] },
    { id: 'l6', name: 'Сет Спизула', price: 790, tags: ['fish'] },
    { id: 'l7', name: 'Сет морской гребешок', variants: [{ label: 'Мурманск', price: 790 }, { label: 'Приморск', price: 1090 }], tags: ['fish'] },
    { id: 'l8', name: 'Дальневосточные устрицы 60/100', variants: OYS(450, 2700, 5400), tags: ['fish'] },
    { id: 'l9', name: 'Дальневосточные устрицы 100–200', variants: OYS(490, 2940, 5880), tags: ['fish'] },
    { id: 'l10', name: 'Устрицы «Розовая Джоли» (Намибия)', variants: OYS(750, 4500, 9000), tags: ['fish'] },
    { id: 'l11', name: 'Устрицы «Касабланка» (Марокко)', variants: OYS(810, 4860, 9720), tags: ['fish'] },
    { id: 'l12', name: 'Устрицы «Муроцу» (Япония)', variants: OYS(990, 5940, 11880), tags: ['fish'] },
    { id: 'l13', name: 'Устрицы «Маори» (Южная Корея)', variants: OYS(720, 4320, 8640), tags: ['fish'] },
    { id: 'l14', name: 'Устрицы «Жилардо» (Франция)', variants: OYS(1400, 8400, 16800), tags: ['fish'] },
    { id: 'l15', name: 'Устрицы «Остра Регал Голд» (Тунис)', variants: OYS(1475, 8850, 17700), tags: ['fish'] },
    { id: 'l16', name: 'Устрицы «Лунная жемчужина» (Тунис)', variants: OYS(1100, 6600, 13200), tags: ['fish'] },
    { id: 'l17', name: 'Устрицы «Тёмная жемчужина» (Тунис)', variants: OYS(1300, 7800, 15600), tags: ['fish'] },
    { id: 'l18', name: 'Устрицы «Элизабет» (ЮАР)', variants: OYS(720, 4320, 8640), tags: ['fish'] },
    { id: 'l19', name: 'Краб камчатский живой', variants: [{ label: 'за 100 г', price: 1100 }], desc: 'Цена за 100 г, вес уточнит официант', tags: ['fish'] },
    { id: 'l20', name: 'Лобстер живой', variants: [{ label: 'за 100 г', price: 1950 }], desc: 'Цена за 100 г, вес уточнит официант', tags: ['fish'] },
    { id: 'l21', name: 'Гуидак', variants: [{ label: 'за 100 г', price: 690 }], desc: 'Цена за 100 г, вес уточнит официант', tags: ['fish'] },
  ]},
  { id: 'rolls', title: 'Роллы', items: [
    { id: 'r1', name: 'Филадельфия', price: 1100, tags: ['fish'] },
    { id: 'r2', name: 'Унаги', price: 990, tags: ['fish'] },
    { id: 'r3', name: 'Магуро', price: 890, tags: ['fish'] },
    { id: 'r4', name: 'Калифорния со снежным крабом', price: 850, tags: ['fish'] },
    { id: 'r5', name: 'Калифорния с камчатским крабом', price: 1550, tags: ['fish'] },
    { id: 'r6', name: 'Запечённый ролл со снежным крабом', price: 850, tags: ['fish'] },
    { id: 'r7', name: 'Запечённый ролл с угрём', price: 990, tags: ['fish'] },
    { id: 'r8', name: 'Запечённый ролл с тунцом', price: 860, tags: ['fish'] },
    { id: 'r9', name: 'Запечённый ролл с лососем', price: 1050, tags: ['fish'] },
    { id: 'r10', name: 'Запечённый ролл с креветкой', price: 890, tags: ['fish'] },
    { id: 'r11', name: 'Запечённый ролл с камчатским крабом', price: 1350, tags: ['fish'] },
  ]},
  { id: 'sushi', title: 'Суши и гунканы', items: [
    { id: 's1', name: 'Суши с угрём', price: 240, tags: ['fish'] },
    { id: 's2', name: 'Суши с тунцом', price: 240, tags: ['fish'] },
    { id: 's3', name: 'Суши с лососем', price: 290, tags: ['fish'] },
    { id: 's4', name: 'Гункан со снежным крабом', price: 250, tags: ['fish'] },
    { id: 's5', name: 'Гункан с угрём', price: 240, tags: ['fish'] },
    { id: 's6', name: 'Гункан с тунцом', price: 210, tags: ['fish'] },
    { id: 's7', name: 'Гункан с лососем', price: 290, tags: ['fish'] },
    { id: 's8', name: 'Гункан с креветкой', price: 250, tags: ['fish'] },
    { id: 's9', name: 'Гункан с камчатским крабом', price: 850, tags: ['fish'] },
  ]},
  { id: 'sets', title: 'Сеты на компанию', items: [
    { id: 't1', name: 'Сет «Камчатский краб»', price: 10900, tags: ['fish'] },
    { id: 't2', name: 'Сет «Дальневосточные креветки»', price: 8900, tags: ['fish'], img: P + 'prawns.webp' },
    { id: 't3', name: 'Сет «Камчатский краб × Северная креветка»', price: 9900, tags: ['fish'] },
  ]},
  { id: 'desserts', title: 'Десерты', items: [
    { id: 'd1', name: 'Баскский чизкейк', price: 450, img: P + 'cheesecake.webp' },
    { id: 'd2', name: 'Шоколадный чизкейк', price: 590, img: P + 'chocolate.webp' },
    { id: 'd3', name: 'Мороженое', weight: '50 г', price: 180 },
  ]},
  { id: 'extras', title: 'Соусы и добавки', items: [
    { id: 'x1', name: 'Соус винный', price: 79 },
    { id: 'x2', name: 'Соус понзу', price: 79 },
    { id: 'x3', name: 'Соус ореховый', price: 79 },
    { id: 'x4', name: 'Соус спайси', price: 79, tags: ['spicy'] },
    { id: 'x5', name: 'Соус сырный', price: 79 },
    { id: 'x6', name: 'Лимон', weight: '30 г', price: 49 },
    { id: 'x7', name: 'Багет', weight: '60 г', price: 90 },
    { id: 'x8', name: 'Перепелиные желтки', weight: '6 шт.', price: 190 },
  ]},
];

/*
 * Каталог магазина — реальные цены.
 *
 * Два вида товаров:
 *   Весовой:  unit: 'kg', priceKg — цена за кг; per — за сколько грамм показывать цену
 *             на ценнике (100 или 500). Покупатель выбирает примерный вес.
 *   Упаковка: unit: 'pack', variants: [{ label, price }] — фасовка и цена за упаковку.
 *             Если вариантов несколько, покупатель выбирает фасовку.
 * badge: frozen (в/м, с/м) | chilled | new
 * img: фото; без него показывается аккуратная заглушка.
 */
const S = 'assets/photos/shop/';

window.MM_SHOP_CATS = [
  { id: 'shrimp', title: 'Креветки' },
  { id: 'fish', title: 'Рыба' },
  { id: 'crab', title: 'Краб' },
  { id: 'caviar', title: 'Икра' },
  { id: 'shellfish', title: 'Мидии и гребешок' },
  { id: 'octopus', title: 'Осьминоги и кальмары' },
  { id: 'deli', title: 'Деликатесы' },
];

window.MM_SHOP = [
  // Креветки
  { id: 'sh1', cat: 'shrimp', name: 'Креветки ванамей очищенные 200/300', unit: 'pack', variants: [{ label: '0,5 кг', price: 960 }], img: S + 'shrimp-raw.webp' },
  { id: 'sh2', cat: 'shrimp', name: 'Креветки ванамей 31/40 на хвосте', unit: 'pack', variants: [{ label: 'упак.', price: 1990 }], img: S + 'shrimp-pan.webp' },
  { id: 'sh3', cat: 'shrimp', name: 'Креветки королевские очищенные', unit: 'pack', variants: [{ label: '300 г', price: 840 }], img: S + 'shrimp-raw.webp' },
  { id: 'sh4', cat: 'shrimp', name: 'Креветка ванамей 21/25 в панцире', unit: 'pack', variants: [{ label: '1 кг', price: 1690 }], img: S + 'shrimp-pan.webp' },
  { id: 'sh5', cat: 'shrimp', name: 'Креветка тигровая 13/15 с головой', unit: 'pack', variants: [{ label: '1 кг', price: 1820 }], img: S + 'shrimp-peeled.webp' },
  { id: 'sh6', cat: 'shrimp', name: 'Креветка тигровая 16/20 с головой', unit: 'pack', variants: [{ label: '1 кг', price: 1700 }], img: S + 'shrimp-pan.webp' },
  { id: 'sh7', cat: 'shrimp', name: 'Креветка аргентинская (Langostino) L1', unit: 'pack', variants: [{ label: '2 кг', price: 3400 }], img: S + 'shrimp-raw.webp' },
  { id: 'sh8', cat: 'shrimp', name: 'Креветка аргентинская (Langostino) без головы C1', unit: 'pack', variants: [{ label: '2 кг', price: 3900 }], img: S + 'shrimp-peeled.webp' },
  { id: 'sh9', cat: 'shrimp', name: 'Креветка северная', unit: 'pack', badge: 'frozen', variants: [{ label: '0,5 кг', price: 1425 }, { label: '1 кг', price: 2850 }], img: S + 'shrimp-raw.webp' },
  { id: 'sh10', cat: 'shrimp', name: 'Креветка северная AMA EBI', unit: 'pack', variants: [{ label: '1 кг', price: 4180 }], img: S + 'shrimp-raw.webp' },
  { id: 'sh11', cat: 'shrimp', name: 'Креветка Ботан (гребенчатая)', unit: 'pack', variants: [{ label: '1 кг', price: 6900 }], img: S + 'shrimp-peeled.webp' },
  { id: 'sh12', cat: 'shrimp', name: 'Креветка шримс-козырьковый 60/100', unit: 'pack', variants: [{ label: '1 кг', price: 2800 }], img: S + 'shrimp-raw.webp' },

  // Рыба
  { id: 'fi1', cat: 'fish', name: 'Тунец саку', unit: 'kg', priceKg: 2550, per: 100, img: S + 'tuna-crudo.webp' },
  { id: 'fi2', cat: 'fish', name: 'Угорь в соусе унаги', unit: 'kg', priceKg: 2950, per: 100, img: S + 'fish-fillet.webp' },
  { id: 'fi3', cat: 'fish', name: 'Дорадо', unit: 'kg', priceKg: 1850, per: 100, badge: 'frozen', img: S + 'fish-dorado.webp' },
  { id: 'fi4', cat: 'fish', name: 'Сибас', unit: 'kg', priceKg: 1980, per: 100, badge: 'frozen', img: S + 'fish-ice.webp' },
  { id: 'fi5', cat: 'fish', name: 'Стейк тунца', unit: 'kg', priceKg: 1400, per: 100, badge: 'frozen', img: S + 'tuna-raw.webp' },
  { id: 'fi6', cat: 'fish', name: 'Стейк форели', unit: 'kg', priceKg: 2090, per: 100, badge: 'frozen', img: S + 'fish-trout.webp' },
  { id: 'fi7', cat: 'fish', name: 'Треска, спинки', unit: 'kg', priceKg: 2780, per: 100, img: S + 'fish-fillet.webp' },
  { id: 'fi8', cat: 'fish', name: 'Набор суповой из форели', unit: 'pack', variants: [{ label: '1 кг', price: 295 }], img: S + 'fish-red.webp' },

  // Краб
  { id: 'cr1', cat: 'crab', name: 'Краб, конечности', unit: 'kg', priceKg: 6840, per: 100, badge: 'frozen', img: S + 'crab-legs.webp' },
  { id: 'cr2', cat: 'crab', name: 'Краб, первая фаланга', unit: 'kg', priceKg: 15390, per: 100, badge: 'frozen', img: S + 'crab-legs.webp' },
  { id: 'cr3', cat: 'crab', name: 'Мясо краба, вторая фаланга', unit: 'kg', priceKg: 10450, per: 100, badge: 'frozen', img: S + 'crab.webp' },
  { id: 'cr4', cat: 'crab', name: 'Краб «Роза»', unit: 'kg', priceKg: 8930, per: 100, badge: 'frozen', img: S + 'crab.webp' },
  { id: 'cr5', cat: 'crab', name: 'Краб, колено', unit: 'kg', priceKg: 8930, per: 100, badge: 'frozen', img: S + 'crab-legs.webp' },
  { id: 'cr6', cat: 'crab', name: 'Мясо краба салатное', unit: 'kg', priceKg: 7900, per: 100, badge: 'frozen', img: S + 'crab.webp' },
  { id: 'cr7', cat: 'crab', name: 'Краб, кулак в хитине', unit: 'kg', priceKg: 7900, per: 100, badge: 'frozen', img: S + 'crab-legs.webp' },
  { id: 'cr8', cat: 'crab', name: 'Мясо краба, ж/б', unit: 'pack', variants: [{ label: '240 г', price: 3960 }, { label: '550 г', price: 8100 }] },
  { id: 'cr9', cat: 'crab', name: 'Мясо краба опилио, ж/б', unit: 'pack', variants: [{ label: '400 г', price: 6300 }] },

  // Икра
  { id: 'ca1', cat: 'caviar', name: 'Икра горбуши', unit: 'pack', variants: [{ label: '200 г', price: 6120 }, { label: '500 г', price: 15300 }], img: S + 'caviar-bread.webp' },
  { id: 'ca2', cat: 'caviar', name: 'Икра кеты', unit: 'pack', variants: [{ label: '200 г', price: 6400 }, { label: '500 г', price: 15900 }], img: S + 'caviar-knife.webp' },
  { id: 'ca3', cat: 'caviar', name: 'Икра кижуча', unit: 'pack', variants: [{ label: '200 г', price: 6400 }, { label: '500 г', price: 15900 }], img: S + 'caviar-jar.webp' },
  { id: 'ca4', cat: 'caviar', name: 'Икра нерки', unit: 'pack', variants: [{ label: '200 г', price: 6120 }, { label: '500 г', price: 15300 }], img: S + 'caviar-bread.webp' },
  { id: 'ca5', cat: 'caviar', name: 'Икра форели', unit: 'pack', variants: [{ label: '250 г', price: 6100 }], img: S + 'caviar-jar.webp' },
  { id: 'ca6', cat: 'caviar', name: 'Икра щуки', unit: 'pack', variants: [{ label: '112 г', price: 1620 }], img: S + 'caviar-knife.webp' },

  // Мидии, вонголе, гребешок
  { id: 'se1', cat: 'shellfish', name: 'Мидии чилийские в раковине в сливочно-чесночном соусе', unit: 'pack', variants: [{ label: 'упак.', price: 880 }], img: S + 'mussels.webp' },
  { id: 'se2', cat: 'shellfish', name: 'Мидии Чили в раковине', unit: 'pack', badge: 'frozen', variants: [{ label: '1 кг', price: 1025 }], img: S + 'mussels.webp' },
  { id: 'se3', cat: 'shellfish', name: 'Мидии «Гигант» на створке', unit: 'pack', badge: 'frozen', variants: [{ label: '1 кг', price: 720 }], img: S + 'mussels.webp' },
  { id: 'se4', cat: 'shellfish', name: 'Мясо мидий', unit: 'pack', badge: 'frozen', variants: [{ label: '1 кг', price: 660 }], img: S + 'mussels.webp' },
  { id: 'se5', cat: 'shellfish', name: 'Вонголе в раковине', unit: 'pack', badge: 'frozen', variants: [{ label: '0,5 кг', price: 290 }], img: S + 'clams.webp' },
  { id: 'se6', cat: 'shellfish', name: 'Гребешок сахалинский', note: 'Вес упаковки разный, сумма — по факту', unit: 'kg', priceKg: 7790, per: 500, badge: 'frozen', img: S + 'scallops.webp' },
  { id: 'se7', cat: 'shellfish', name: 'Гребешок северо-курильский', unit: 'pack', badge: 'frozen', variants: [{ label: '0,5 кг', price: 2200 }], img: S + 'scallops.webp' },
  { id: 'se8', cat: 'shellfish', name: 'Улитки в чесночном соусе «по-бургундски»', unit: 'pack', variants: [{ label: '170 г', price: 640 }] },

  // Осьминоги и кальмары
  { id: 'oc1', cat: 'octopus', name: 'Осьминог Марокко', unit: 'kg', priceKg: 4650, per: 100, badge: 'frozen', img: S + 'octopus.webp' },
  { id: 'oc2', cat: 'octopus', name: 'Осьминог Индонезия', unit: 'kg', priceKg: 1900, per: 100, badge: 'frozen', img: S + 'octopus.webp' },
  { id: 'oc3', cat: 'octopus', name: 'Осьминоги мини', unit: 'pack', badge: 'frozen', variants: [{ label: '1 кг', price: 1820 }], img: S + 'octopus.webp' },
  { id: 'oc4', cat: 'octopus', name: 'Кальмар командорский', unit: 'pack', variants: [{ label: '1 кг', price: 1460 }] },
  { id: 'oc5', cat: 'octopus', name: 'Морской коктейль', unit: 'pack', variants: [{ label: 'упак.', price: 720 }], img: S + 'seafood-mix.webp' },

  // Деликатесы
  { id: 'de1', cat: 'deli', name: 'Салат чука', unit: 'pack', variants: [{ label: '1 кг', price: 470 }] },
  { id: 'de2', cat: 'deli', name: 'Печень минтая, ж/б', unit: 'pack', variants: [{ label: '185 г', price: 580 }] },
];
