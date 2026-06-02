// sync-restaurants.mjs
// 全国の寿司・和食・海鮮レストランをOpenStreetMapから取得してSupabaseに保存
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REGION_BBOXES = [
  { name: '関東',       bbox: '35.0,138.8,36.2,140.9' },
  { name: '関西',       bbox: '34.2,134.9,35.1,136.0' },
  { name: '中京',       bbox: '34.5,136.5,35.5,137.8' },
  { name: '北海道',     bbox: '41.4,140.0,45.6,145.9' },
  { name: '東北',       bbox: '36.8,139.5,41.5,141.8' },
  { name: '北陸・信越', bbox: '35.5,136.0,37.7,138.9' },
  { name: '中国・四国', bbox: '32.9,130.5,35.0,134.5' },
  { name: '九州',       bbox: '31.0,129.5,34.0,132.0' },
  { name: '沖縄',       bbox: '24.0,122.9,26.9,128.3' },
];

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

async function fetchWithFallback(query) {
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      console.log(`  📡 ${url} を試行中...`);
      const response = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(90000),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      console.warn(`  ⚠️ ${url} → ${response.status}`);
    } catch (e) {
      console.warn(`  ⚠️ ${url} → ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('全エンドポイントが失敗');
}

async function fetchRestaurants(bbox, region) {
  const query = `
    [out:json][timeout:90];
    (
      node["amenity"="restaurant"]["cuisine"="sushi"](${bbox});
      node["amenity"="restaurant"]["cuisine"="japanese"](${bbox});
      node["amenity"="restaurant"]["cuisine"="seafood"](${bbox});
      node["amenity"="restaurant"]["cuisine"="fish"](${bbox});
    );
    out body;
  `;
  const data = await fetchWithFallback(query);
  return data.elements.map(el => ({
    id: el.id,
    name: el.tags?.name || el.tags?.['name:ja'] || null,
    latitude: el.lat,
    longitude: el.lon,
    address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || null,
    cuisine: el.tags?.cuisine || null,
    opening_hours: el.tags?.opening_hours || null,
    website: el.tags?.website || el.tags?.['contact:website'] || null,
    region: region,
  }));
}

async function main() {
  console.log('🐟 フィッシュタイム データ同期開始');

  const { error: deleteError } = await supabase
    .from('restaurants')
    .delete()
    .neq('id', 0);
  if (deleteError) console.warn('Delete warning:', deleteError.message);

  let total = 0;
  for (const region of REGION_BBOXES) {
    console.log(`📍 ${region.name} を取得中...`);
    try {
      const restaurants = await fetchRestaurants(region.bbox, region.name);
      console.log(`  → ${restaurants.length}件取得`);

      for (let i = 0; i < restaurants.length; i += 1000) {
        const chunk = restaurants.slice(i, i + 1000);
        const { error } = await supabase.from('restaurants').upsert(chunk);
        if (error) console.error('Insert error:', error.message);
      }
      total += restaurants.length;
      await new Promise(r => setTimeout(r, 8000));
    } catch (e) {
      console.error(`  ❌ ${region.name} エラー:`, e.message);
    }
  }
  console.log(`✅ 完了! 合計 ${total}件`);
}

main();
