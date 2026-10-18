/*
 * Данные меню и каталога.
 *
 * Меню ресторана: цены (price) и выход (weight) — заглушки, price: 0 выводится как «000 ₽».
 * Названия блюд — примеры, замените на реальное меню. Фото — подборка с Pexels до съёмки своих блюд.
 * tags: meat | fish | spicy | hit
 */
const P = 'assets/photos/menu/';

window.MM_MENU = [
  { id: 'starters', title: 'Закуски', items: [
    { id: 'm1', name: 'Тартар из говядины', desc: 'Вырезка, каперсы, шалот, желток, гренки', weight: '000 г', price: 0, tags: ['meat', 'hit'], img: P + 'tartare.webp' },
    { id: 'm2', name: 'Устрицы', desc: 'Лимон, соус миньонет', weight: '000 г', price: 0, tags: ['fish'], img: P + 'oysters.webp' },
    { id: 'm3', name: 'Мясная тарелка', desc: 'Колбаски гриль, рёбрышки, бастурма', weight: '000 г', price: 0, tags: ['meat'], img: P + 'meat-platter.webp' },
    { id: 'm4', name: 'Креветки в чесночном масле', desc: 'Чеснок, чили, петрушка, хлеб на закваске', weight: '000 г', price: 0, tags: ['fish', 'spicy'], img: P + 'garlic-shrimp.webp' },
  ]},
  { id: 'salads', title: 'Салаты', items: [
    { id: 'm5', name: 'Салат с ростбифом', desc: 'Ростбиф, руккола, вяленые томаты, пармезан', weight: '000 г', price: 0, tags: ['meat'], img: P + 'roastbeef-salad.webp' },
    { id: 'm6', name: 'Тунец крудо', desc: 'Тунец, цитрусовый соус, зелёный лук', weight: '000 г', price: 0, tags: ['fish'], img: P + 'tuna.webp' },
    { id: 'm7', name: 'Тёплый салат с кальмаром', desc: 'Кальмар, печёный перец, кинза, соус терияки', weight: '000 г', price: 0, tags: ['fish', 'spicy'] },
  ]},
  { id: 'soups', title: 'Супы', items: [
    { id: 'm8', name: 'Уха по-царски', desc: 'Три вида рыбы, картофель, зелень', weight: '000 г', price: 0, tags: ['fish', 'hit'], img: P + 'ukha.webp' },
    { id: 'm9', name: 'Бульон из говядины', desc: 'Томлёная говядина, корнеплоды, яичная лапша', weight: '000 г', price: 0, tags: ['meat'] },
    { id: 'm10', name: 'Том ям с морепродуктами', desc: 'Креветки, мидии, кальмар, кокосовое молоко', weight: '000 г', price: 0, tags: ['fish', 'spicy'], img: P + 'tom-yum.webp' },
  ]},
  { id: 'grill', title: 'Мясо и гриль', items: [
    { id: 'm11', name: 'Стейк рибай', desc: 'Мраморная говядина, соус на выбор', weight: '000 г', price: 0, tags: ['meat', 'hit'], img: P + 'ribeye.webp' },
    { id: 'm12', name: 'Стейк из вырезки', desc: 'Говяжья вырезка, перечный соус', weight: '000 г', price: 0, tags: ['meat'], img: P + 'tenderloin.webp' },
    { id: 'm13', name: 'Каре ягнёнка', desc: 'Розмарин, чеснок, мятный соус', weight: '000 г', price: 0, tags: ['meat'], img: P + 'lamb.webp' },
    { id: 'm14', name: 'Рёбра на гриле', desc: 'Глазурь барбекю с копчёным перцем', weight: '000 г', price: 0, tags: ['meat', 'spicy'], img: P + 'ribs.webp' },
  ]},
  { id: 'seafood', title: 'Рыба и морепродукты', items: [
    { id: 'm15', name: 'Дорадо на гриле', desc: 'Целиком, лимон, овощи гриль', weight: '000 г', price: 0, tags: ['fish', 'hit'], img: P + 'seabass.webp' },
    { id: 'm16', name: 'Стейк из лосося', desc: 'Сливочный соус, свежие овощи', weight: '000 г', price: 0, tags: ['fish'], img: P + 'salmon.webp' },
    { id: 'm17', name: 'Вонголе в белом вине', desc: 'Сливки, чеснок, тимьян, гренки', weight: '000 г', price: 0, tags: ['fish'], img: P + 'clams.webp' },
    { id: 'm18', name: 'Королевские креветки', desc: 'Гриль, острый соус', weight: '000 г', price: 0, tags: ['fish', 'spicy'], img: P + 'prawns.webp' },
  ]},
  { id: 'sides', title: 'Гарниры', items: [
    { id: 'm19', name: 'Молодой картофель', desc: 'Розмарин, морская соль', weight: '000 г', price: 0, tags: [], img: P + 'potatoes.webp' },
    { id: 'm20', name: 'Овощи на гриле', desc: 'Цукини, перец, баклажан, томаты', weight: '000 г', price: 0, tags: [] },
    { id: 'm21', name: 'Картофельное пюре', desc: 'Сливочное масло, мускатный орех', weight: '000 г', price: 0, tags: [], img: P + 'mash.webp' },
  ]},
  { id: 'desserts', title: 'Десерты', items: [
    { id: 'm22', name: 'Наполеон', desc: 'Домашний, с заварным кремом', weight: '000 г', price: 0, tags: ['hit'] },
    { id: 'm23', name: 'Шоколадный торт', desc: 'Горький шоколад, ганаш', weight: '000 г', price: 0, tags: [], img: P + 'chocolate.webp' },
    { id: 'm24', name: 'Чизкейк', desc: 'Классический, ягодный соус', weight: '000 г', price: 0, tags: [], img: P + 'cheesecake.webp' },
  ]},
  { id: 'drinks', title: 'Напитки', items: [
    { id: 'm25', name: 'Морс', desc: 'Клюква или брусника', weight: '000 мл', price: 0, tags: [] },
    { id: 'm26', name: 'Лимонад', desc: 'Цитрусовый или ягодный', weight: '000 мл', price: 0, tags: [], img: P + 'lemonade.webp' },
    { id: 'm27', name: 'Чай', desc: 'Чёрный, зелёный, травяной', weight: '000 мл', price: 0, tags: [], img: P + 'tea.webp' },
    { id: 'm28', name: 'Кофе', desc: 'Эспрессо, американо, капучино', weight: '000 мл', price: 0, tags: [], img: P + 'coffee.webp' },
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
