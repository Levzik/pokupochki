export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  image: string;
}

export const PRODUCT_CATALOG: ProductInfo[] = [
  // Бакалея и крупы
  {
    id: 'rice',
    name: 'Рис',
    category: 'Бакалея и крупы',
    keywords: ['рис', 'рисом', 'басмати', 'жасмин', 'пропаренный'],
    image: './products/rice.jpg',
  },
  {
    id: 'buckwheat',
    name: 'Гречка',
    category: 'Бакалея и крупы',
    keywords: ['гречк', 'греч', 'гречневая', 'ядрица'],
    image: './products/buckwheat.jpg',
  },
  {
    id: 'pasta',
    name: 'Макароны',
    category: 'Бакалея и крупы',
    keywords: ['макарон', 'паста', 'спагетти', 'пенне', 'рожки', 'лапша', 'вермишель'],
    image: './products/pasta.jpg',
  },
  {
    id: 'oats',
    name: 'Овсянка',
    category: 'Бакалея и крупы',
    keywords: ['овсян', 'геркулес', 'хлопья'],
    image: './products/oats.jpg',
  },
  {
    id: 'flour',
    name: 'Мука',
    category: 'Бакалея и крупы',
    keywords: ['мука', 'муки', 'муку'],
    image: './products/flour.jpg',
  },
  {
    id: 'sugar',
    name: 'Сахар',
    category: 'Бакалея и крупы',
    keywords: ['сахар', 'рафинад', 'сахарок'],
    image: './products/sugar.jpg',
  },
  {
    id: 'salt',
    name: 'Соль',
    category: 'Бакалея и крупы',
    keywords: ['соль', 'соли', 'морская соль'],
    image: './products/salt.jpg',
  },
  {
    id: 'spices',
    name: 'Специи',
    category: 'Бакалея и крупы',
    keywords: ['специ', 'приправ', 'перец', 'паприк', 'куркум', 'лавровый'],
    image: './products/spices.jpg',
  },
  {
    id: 'oil',
    name: 'Растительное масло',
    category: 'Бакалея и крупы',
    keywords: ['масло растительное', 'масло подсолнечное', 'масло оливковое', 'подсолнечное масло', 'оливковое масло', 'масло'],
    image: './products/oil.jpg',
  },
  {
    id: 'beans',
    name: 'Бобовые',
    category: 'Бакалея и крупы',
    keywords: ['фасол', 'нут', 'чечевиц', 'горох', 'бобы'],
    image: './products/beans.jpg',
  },
  {
    id: 'canned',
    name: 'Консервы',
    category: 'Бакалея и крупы',
    keywords: ['консерв', 'тунец', 'томаты в собственном', 'шпроты', 'кукуруз', 'горошек'],
    image: './products/canned.jpg',
  },

  // Молочные продукты и яйца
  {
    id: 'milk',
    name: 'Молоко',
    category: 'Молочные продукты и яйца',
    keywords: ['молок', 'молочко', 'сливки'],
    image: './products/milk.jpg',
  },
  {
    id: 'kefir',
    name: 'Кефир',
    category: 'Молочные продукты и яйца',
    keywords: ['кефир', 'ряженк', 'простокваш', 'снежок'],
    image: './products/kefir.jpg',
  },
  {
    id: 'yogurt',
    name: 'Йогурт',
    category: 'Молочные продукты и яйца',
    keywords: ['йогурт', 'йогурта', 'биойогурт', 'активиа'],
    image: './products/yogurt.jpg',
  },
  {
    id: 'cottage_cheese',
    name: 'Творог',
    category: 'Молочные продукты и яйца',
    keywords: ['творог', 'сырник', 'творож'],
    image: './products/cottage_cheese.jpg',
  },
  {
    id: 'cheese',
    name: 'Сыр',
    category: 'Молочные продукты и яйца',
    keywords: ['сыр', 'сыра', 'моцарелл', 'пармезан', 'сулугуни', 'чеддер', 'гауда', 'маасдам'],
    image: './products/cheese.jpg',
  },
  {
    id: 'butter',
    name: 'Сливочное масло',
    category: 'Молочные продукты и яйца',
    keywords: ['сливочное масло', 'масло сливочное'],
    image: './products/butter.jpg',
  },
  {
    id: 'eggs',
    name: 'Яйца',
    category: 'Молочные продукты и яйца',
    keywords: ['яйц', 'яйца', 'яички', 'деревенские яйца', 'десяток яиц'],
    image: './products/eggs.jpg',
  },

  // Мясо, птица и рыба
  {
    id: 'chicken',
    name: 'Курица',
    category: 'Мясо, птица и рыба',
    keywords: ['куриц', 'куриное', 'куриные', 'филе куриное', 'бедра', 'голени', 'крылья', 'цыпленок'],
    image: './products/chicken.jpg',
  },
  {
    id: 'turkey',
    name: 'Индейка',
    category: 'Мясо, птица и рыба',
    keywords: ['индейк', 'индейки', 'индоутка'],
    image: './products/turkey.jpg',
  },
  {
    id: 'meat',
    name: 'Мясо',
    category: 'Мясо, птица и рыба',
    keywords: ['говядин', 'свинин', 'мясо', 'стейк', 'вырезка', 'гуляш', 'ребрышки'],
    image: './products/meat.jpg',
  },
  {
    id: 'minced_meat',
    name: 'Фарш',
    category: 'Мясо, птица и рыба',
    keywords: ['фарш', 'фарша'],
    image: './products/minced_meat.jpg',
  },
  {
    id: 'fish',
    name: 'Рыба',
    category: 'Мясо, птица и рыба',
    keywords: ['рыб', 'лосос', 'семг', 'форел', 'треск', 'минтай', 'скумбри', 'хек', 'горбуш'],
    image: './products/fish.jpg',
  },

  // Овощи, фрукты и зелень
  {
    id: 'potatoes',
    name: 'Картофель',
    category: 'Овощи, фрукты и зелень',
    keywords: ['картошк', 'картофел', 'картох'],
    image: './products/potatoes.jpg',
  },
  {
    id: 'onion',
    name: 'Лук',
    category: 'Овощи, фрукты и зелень',
    keywords: ['лук', 'репчатый', 'шалот'],
    image: './products/onion.jpg',
  },
  {
    id: 'carrots',
    name: 'Морковь',
    category: 'Овощи, фрукты и зелень',
    keywords: ['морков', 'морковка'],
    image: './products/carrots.jpg',
  },
  {
    id: 'cucumbers',
    name: 'Огурцы',
    category: 'Овощи, фрукты и зелень',
    keywords: ['огур', 'огурчик'],
    image: './products/cucumbers.jpg',
  },
  {
    id: 'tomatoes',
    name: 'Помидоры',
    category: 'Овощи, фрукты и зелень',
    keywords: ['помидор', 'томат', 'черри'],
    image: './products/tomatoes.jpg',
  },
  {
    id: 'cabbage',
    name: 'Капуста',
    category: 'Овощи, фрукты и зелень',
    keywords: ['капуст', 'брокколи', 'цветная капуста'],
    image: './products/cabbage.jpg',
  },
  {
    id: 'greens',
    name: 'Зелень',
    category: 'Овощи, фрукты и зелень',
    keywords: ['зелен', 'укроп', 'петрушк', 'салат', 'шпинат', 'кинз', 'рукол', 'базилик'],
    image: './products/greens.jpg',
  },
  {
    id: 'apples',
    name: 'Яблоки',
    category: 'Овощи, фрукты и зелень',
    keywords: ['яблок', 'яблочк'],
    image: './products/apples.jpg',
  },
  {
    id: 'bananas',
    name: 'Бананы',
    category: 'Овощи, фрукты и зелень',
    keywords: ['банан'],
    image: './products/bananas.jpg',
  },
  {
    id: 'citrus',
    name: 'Цитрусовые',
    category: 'Овощи, фрукты и зелень',
    keywords: ['апельсин', 'лимон', 'мандарин', 'грейпфрут', 'лайм'],
    image: './products/citrus.jpg',
  },
  {
    id: 'berries',
    name: 'Ягоды',
    category: 'Овощи, фрукты и зелень',
    keywords: ['ягод', 'клубник', 'малин', 'черник', 'голубик', 'вишн', 'черешн'],
    image: './products/berries.jpg',
  },

  // Хлеб и выпечка
  {
    id: 'bread',
    name: 'Хлеб',
    category: 'Хлеб и выпечка',
    keywords: ['хлеб', 'хлебушек', 'бородинский', 'ржаной', 'дарницкий'],
    image: './products/bread.jpg',
  },
  {
    id: 'baguette',
    name: 'Батон',
    category: 'Хлеб и выпечка',
    keywords: ['батон', 'багет', 'нарезной'],
    image: './products/baguette.jpg',
  },
  {
    id: 'buns',
    name: 'Булочки и выпечка',
    category: 'Хлеб и выпечка',
    keywords: ['булочк', 'булк', 'лаваш', 'тортиль', 'круассан', 'пирожок', 'лепешк'],
    image: './products/buns.jpg',
  },

  // Заморозка и напитки
  {
    id: 'frozen_veg',
    name: 'Заморозка',
    category: 'Заморозка и напитки',
    keywords: ['заморозк', 'смесь овощная', 'замороженные'],
    image: './products/frozen_veg.jpg',
  },
  {
    id: 'dumplings',
    name: 'Полуфабрикаты',
    category: 'Заморозка и напитки',
    keywords: ['пельмен', 'вареник', 'котлет', 'наггетс', 'блинчик'],
    image: './products/dumplings.jpg',
  },
  {
    id: 'water',
    name: 'Вода',
    category: 'Заморозка и напитки',
    keywords: ['вода', 'водичка', 'минералк', 'боржоми', 'святой источник'],
    image: './products/water.jpg',
  },
  {
    id: 'tea',
    name: 'Чай',
    category: 'Заморозка и напитки',
    keywords: ['чай', 'чаек', 'гринфилд', 'greenfield', 'липтон', 'эрл грей'],
    image: './products/tea.jpg',
  },
  {
    id: 'coffee',
    name: 'Кофе',
    category: 'Заморозка и напитки',
    keywords: ['кофе', 'капучино', 'латте', 'эспрессо', 'зерновой кофе', 'молотый кофе'],
    image: './products/coffee.jpg',
  },
  {
    id: 'energy_drink',
    name: 'Энергетики',
    category: 'Заморозка и напитки',
    keywords: ['энергетик', 'энергетики', 'energy', 'red bull', 'ред булл', 'редбулл', 'monster', 'монстр', 'adrenalin', 'адреналин', 'burn', 'торнадо', 'tornado', 'flash', 'флеш', 'drive'],
    image: './products/energy_drink.jpg',
  },

  // Базовые бытовые товары
  {
    id: 'dish_soap',
    name: 'Средство для посуды',
    category: 'Бытовые товары',
    keywords: ['посуд', 'fairy', 'фейри', 'для мытья посуды', 'средство для посуды', 'таблетки для посудомойки'],
    image: './products/dish_soap.jpg',
  },
  {
    id: 'detergent',
    name: 'Стиральный порошок',
    category: 'Бытовые товары',
    keywords: ['порошок', 'стиральн', 'гель для стирки', 'капсулы для стирки', 'ариэль', 'тайд', 'персил', 'кондиционер для белья'],
    image: './products/detergent.jpg',
  },
  {
    id: 'toilet_paper',
    name: 'Туалетная бумага',
    category: 'Бытовые товары',
    keywords: ['туалетная бумага', 'зева', 'zeva', 'бумага туалетная'],
    image: './products/toilet_paper.jpg',
  },
  {
    id: 'paper_towels',
    name: 'Бумажные полотенца',
    category: 'Бытовые товары',
    keywords: ['бумажные полотенца', 'салфетки', 'полотенца бумажные'],
    image: './products/paper_towels.jpg',
  },
  {
    id: 'trash_bags',
    name: 'Мешки для мусора',
    category: 'Бытовые товары',
    keywords: ['пакеты для мусора', 'мешки для мусора', 'мусорные пакеты', 'мешки мусорные'],
    image: './products/trash_bags.jpg',
  },
];

/**
 * Searches the catalog for the best product match given an item title.
 */
export function matchProduct(title: string): ProductInfo | null {
  if (!title) return null;
  const clean = title.toLowerCase().trim();

  // 1. Try exact or multi-word matches first
  for (const prod of PRODUCT_CATALOG) {
    for (const kw of prod.keywords) {
      if (kw.includes(' ') && clean.includes(kw)) {
        return prod;
      }
    }
  }

  // 2. Try word stem / substring matches
  for (const prod of PRODUCT_CATALOG) {
    for (const kw of prod.keywords) {
      // Check if keyword is part of clean title
      const regex = new RegExp(`(^|\\s|[.,!?-])${kw}`, 'i');
      if (regex.test(clean) || clean.includes(kw)) {
        return prod;
      }
    }
  }

  return null;
}
