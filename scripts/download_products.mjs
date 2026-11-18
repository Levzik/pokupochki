import fs from 'fs';
import path from 'path';

const PRODUCTS = [
  // Бакалея и крупы
  { id: 'rice', photo: 'photo-1586201375761-83865001e31c' },
  { id: 'buckwheat', photo: 'photo-1607672632458-9eb56696346b' },
  { id: 'pasta', photo: 'photo-1551462147-ff29053bfc14' },
  { id: 'oats', photo: 'photo-1517093157656-b9ec81640a2f' },
  { id: 'flour', photo: 'photo-1627485937980-221c88ac04f9' },
  { id: 'sugar', photo: 'photo-1581441363689-1f3c3c414635' },
  { id: 'salt', photo: 'photo-1518110925495-5fe2f3df5ea7' },
  { id: 'spices', photo: 'photo-1596040033229-a9821ebd058d' },
  { id: 'oil', photo: 'photo-1474979266404-7eaacbcd87c5' },
  { id: 'beans', photo: 'photo-1551462147-37885acc36f1' },
  { id: 'canned', photo: 'photo-1534483509719-3feaee7c30da' },

  // Молочные продукты и яйца
  { id: 'milk', photo: 'photo-1550583724-b2692b85b150' },
  { id: 'kefir', photo: 'photo-1563636619-e9143da7973b' },
  { id: 'yogurt', photo: 'photo-1488477181946-6428a0291777' },
  { id: 'cottage_cheese', photo: 'photo-1589301760014-d929f3979dbc' },
  { id: 'cheese', photo: 'photo-1486297678162-eb2a19b0a32d' },
  { id: 'butter', photo: 'photo-1589985270826-4b7bb135bc9d' },
  { id: 'eggs', photo: 'photo-1516448620398-c5f44bf9f441' },

  // Мясо, птица и рыба
  { id: 'chicken', photo: 'photo-1604503468506-a8da13d82791' },
  { id: 'turkey', photo: 'photo-1587593810167-a84920ea0781' },
  { id: 'meat', photo: 'photo-1603048588665-791ca8aea617' },
  { id: 'minced_meat', photo: 'photo-1588168333986-5078d3ae3976' },
  { id: 'fish', photo: 'photo-1519708227418-c8fd9a32b7a2' },

  // Овощи, фрукты и зелень
  { id: 'potatoes', photo: 'photo-1518977676601-b53f82aba655' },
  { id: 'onion', photo: 'photo-1618512496248-a07fe83aa8cb' },
  { id: 'carrots', photo: 'photo-1598170845058-32b9d6a5da37' },
  { id: 'cucumbers', photo: 'photo-1449339854873-750e6913301b' },
  { id: 'tomatoes', photo: 'photo-1592924357228-91a4daadcfea' },
  { id: 'cabbage', photo: 'photo-1594282486552-05b4d80fbb9f' },
  { id: 'greens', photo: 'photo-1540420773420-3366772f4999' },
  { id: 'apples', photo: 'photo-1560806887-1e4cd0b6cbd6' },
  { id: 'bananas', photo: 'photo-1571771894821-ce9b6c11b08e' },
  { id: 'citrus', photo: 'photo-1582979512210-99b6a53386f9' },
  { id: 'berries', photo: 'photo-1464965911861-746a04b4bca6' },

  // Хлеб и выпечка
  { id: 'bread', photo: 'photo-1509440159596-0249088772ff' },
  { id: 'baguette', photo: 'photo-1589367920969-ab8e050bbb04' },
  { id: 'buns', photo: 'photo-1555507036-ab1f4038808a' },

  // Заморозка и напитки
  { id: 'frozen_veg', photo: 'photo-1546069901-ba9599a7e63c' },
  { id: 'dumplings', photo: 'photo-1541696432-82c6da8ce7bf' },
  { id: 'water', photo: 'photo-1548839140-29a749e1bc4e' },
  { id: 'tea', photo: 'photo-1576092768241-dec231879fc3' },
  { id: 'coffee', photo: 'photo-1509042239860-f550ce710b93' },
  { id: 'energy_drink', photo: 'photo-1622543925917-763c34d1a86e' },

  // Базовые бытовые товары
  { id: 'dish_soap', photo: 'photo-1585421514738-01798e348b17' },
  { id: 'detergent', photo: 'photo-1582735689369-4fe89db7114c' },
  { id: 'toilet_paper', photo: 'photo-1584556812952-905ffd0c611a' },
  { id: 'paper_towels', photo: 'photo-1583947215259-38e31be8751f' },
  { id: 'trash_bags', photo: 'photo-1618477247222-acbdb0e159b3' },
];

const outDir = path.resolve('public/products');
const androidDir = path.resolve('android/app/src/main/assets/products');

async function downloadAll() {
  console.log(`Starting download of ${PRODUCTS.length} staple product photos...`);
  for (const item of PRODUCTS) {
    const filename = `${item.id}.jpg`;
    const dest = path.join(outDir, filename);
    const androidDest = path.join(androidDir, filename);
    
    // Request compressed crisp 280x280 image from Unsplash CDN
    const url = `https://images.unsplash.com/${item.photo}?w=280&h=280&auto=format&fit=crop&q=82`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Failed ${item.id}: status ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      fs.writeFileSync(androidDest, buffer);
      console.log(`Saved ${filename} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${item.id}:`, e.message);
    }
  }
  console.log('Finished downloading staple product photos!');
}

downloadAll();
