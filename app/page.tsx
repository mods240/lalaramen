"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const Map = dynamic(() => import("@/components/RamenMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-red-50">
      <p className="text-red-800">🍜 地図を読み込み中...</p>
    </div>
  ),
});

interface Restaurant {
  id: number;
  name: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  cuisine: string | null;
  opening_hours: string | null;
  website: string | null;
  region: string | null;
  distance?: number;
}

const ALL_REGIONS = [
  { name: '関東',     emoji: '🗼', desc: '東京・神奈川・埼玉・千葉など' },
  { name: '関西',     emoji: '🏯', desc: '大阪・京都・兵庫・奈良など' },
  { name: '中京',     emoji: '🏙️', desc: '愛知・岐阜・三重・静岡' },
  { name: '北海道',   emoji: '🐻', desc: '北海道全域' },
  { name: '東北',     emoji: '⛄', desc: '宮城・福島・青森・岩手など' },
  { name: '北陸・信越', emoji: '🦀', desc: '新潟・長野・富山・石川・福井' },
  { name: '中国・四国', emoji: '🍋', desc: '広島・岡山・香川・愛媛など' },
  { name: '九州',     emoji: '🌋', desc: '福岡・熊本・鹿児島・長崎など' },
  { name: '沖縄',     emoji: '🌺', desc: '沖縄全島' },
];

const REGION_CENTERS: Record<string, [number, number]> = {
  '関東':       [35.68, 139.69],
  '関西':       [34.69, 135.50],
  '中京':       [35.18, 136.91],
  '北海道':     [43.06, 141.35],
  '東北':       [38.27, 140.87],
  '北陸・信越': [36.69, 137.21],
  '中国・四国': [34.40, 132.46],
  '九州':       [33.59, 130.42],
  '沖縄':       [26.21, 127.68],
};

function sortRegionsByLocation(lat: number, lng: number) {
  return [...ALL_REGIONS].sort((a, b) => {
    const [aLat, aLng] = REGION_CENTERS[a.name] || [35, 135];
    const [bLat, bLng] = REGION_CENTERS[b.name] || [35, 135];
    const distA = Math.sqrt((lat - aLat) ** 2 + (lng - aLng) ** 2);
    const distB = Math.sqrt((lat - bLat) ** 2 + (lng - bLng) ** 2);
    return distA - distB;
  });
}

const STORAGE_KEY = 'ramen_selected_regions';
const BOOKMARK_KEY = 'ramen_bookmarks';
const INTERESTED_KEY = 'ramen_interested';
const DEFAULT_CENTER: [number, number] = [34.7, 135.5];

type ViewType = "map" | "list" | "bookmarks";

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function cuisineLabel(cuisine: string | null): string {
  if (!cuisine) return '';
  const map: Record<string, string> = {
    ramen: '🍜 ラーメン',
    noodle: '🍝 麺料理',
    japanese: '🍱 和食',
    chinese: '🥢 中華',
    tsukemen: '🍜 つけ麺',
  };
  return map[cuisine] || cuisine;
}


function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (!isMobile) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShow(false));
    if (ios) setTimeout(() => setShow(true), 2000);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => { setDeferredPrompt(null); setShow(false); });
    } else if (isIOS) {
      alert('① SafariでこのページのURLを開く\n② 下部の共有ボタン（四角に矢印）をタップ\n③「ホーム画面に追加」を選ぶ\n\n※ Chrome・Firefoxでは追加できません');
    } else {
      alert('Chromeのメニュー（右上の ⋮）をタップして\n「アプリをインストール」または\n「ホーム画面に追加」を選んでください');
    }
  }

  function handleClose() {
    setShow(false);
  }

  if (!show) return null;
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'2px solid #dc2626', padding:'12px 16px 28px', display:'flex', alignItems:'center', gap:12, zIndex:9999, boxShadow:'0 -4px 20px rgba(220,38,38,0.15)', pointerEvents:'all' }}>
      <span style={{ fontSize:'1.8rem', flexShrink:0 }}>📲</span>
      <div style={{ flex:1 }}>
        <p style={{ margin:'0 0 2px', fontWeight:800, fontSize:14, color:'#7f1d1d' }}>ホーム画面に追加する</p>
        <p style={{ margin:0, fontSize:11, color:'#dc2626' }}>
          {isIOS ? 'Safariで開く → 共有 → ホーム画面に追加' : 'アプリとしてインストール'}
        </p>
      </div>
      <button onClick={handleInstall} style={{ background:'linear-gradient(90deg,#dc2626,#b91c1c)', color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontWeight:800, fontSize:13, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
        {isIOS ? '方法を見る' : '追加'}
      </button>
      <button onClick={handleClose} style={{ background:'none', border:'none', color:'#bbb', fontSize:'1rem', cursor:'pointer', padding:4, flexShrink:0 }}>✕</button>
    </div>
  );
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [sortedRegions, setSortedRegions] = useState(ALL_REGIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [interested, setInterested] = useState<Set<number>>(new Set());
  const [showRegionSelect, setShowRegionSelect] = useState(false);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [view, setView] = useState<ViewType>("map");
  const [initialized, setInitialized] = useState(false);
  const currentPosRef = useRef<[number, number] | null>(null);

  const [nearbyAlert, setNearbyAlert] = useState<Restaurant | null>(null);
  const notifiedRef = useRef<Record<number, number>>({});
  const restaurantsRef = useRef<Restaurant[]>([]);
  const interestedRef = useRef<Set<number>>(new Set());
  const bookmarksRef = useRef<Set<number>>(new Set());

  useEffect(() => { restaurantsRef.current = restaurants; }, [restaurants]);
  useEffect(() => { interestedRef.current = interested; }, [interested]);
  useEffect(() => { bookmarksRef.current = bookmarks; }, [bookmarks]);

  useEffect(() => {
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(coords);
        setHasLocation(true);
        setLocating(false);
        currentPosRef.current = coords;
        setSortedRegions(sortRegionsByLocation(coords[0], coords[1]));
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 60000 }
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const prev = currentPosRef.current;
        const moved = !prev || calcDistance(prev[0], prev[1], coords[0], coords[1]) > 0.02;
        if (moved) {
          setCenter(coords);
        }
        currentPosRef.current = coords;

        const now = Date.now();
        const ALERT_RADIUS_KM = 0.5;
        const COOLDOWN_MS = 3 * 60 * 1000;

        for (const restaurant of restaurantsRef.current) {
          const isInterested = interestedRef.current.has(restaurant.id);
          const isBookmarked = bookmarksRef.current.has(restaurant.id);
          if (!isInterested && !isBookmarked) continue;
          const dist = calcDistance(coords[0], coords[1], restaurant.latitude, restaurant.longitude);
          if (dist <= ALERT_RADIUS_KM) {
            const lastNotified = notifiedRef.current[restaurant.id] || 0;
            if (now - lastNotified > COOLDOWN_MS) {
              notifiedRef.current[restaurant.id] = now;
              setNearbyAlert({ ...restaurant, distance: dist });
              break;
            }
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setSelectedRegions(JSON.parse(saved)); }
    else { setShowRegionSelect(true); }
    const savedBookmarks = localStorage.getItem(BOOKMARK_KEY);
    if (savedBookmarks) { setBookmarks(new Set(JSON.parse(savedBookmarks))); }
    const savedInterested = localStorage.getItem(INTERESTED_KEY);
    if (savedInterested) { setInterested(new Set(JSON.parse(savedInterested))); }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || selectedRegions.length === 0) return;
    fetchRestaurants(selectedRegions);
  }, [selectedRegions, initialized]);

  useEffect(() => {
    if (!hasLocation || restaurants.length === 0) return;
    const [lat, lng] = center;
    setRestaurants(prev => prev.map(r => ({
      ...r,
      distance: calcDistance(lat, lng, r.latitude, r.longitude)
    })));
  }, [hasLocation]);

  async function fetchRestaurants(regions: string[]) {
    setLoading(true);
    const { data, error } = await supabase
      .from("ramen_restaurants")
      .select("id, name, latitude, longitude, address, cuisine, opening_hours, website, region")
      .in("region", regions);
    if (error) console.error("Supabase error:", error);
    const raw = data || [];
    const pos = currentPosRef.current;
    if (pos) {
      const [lat, lng] = pos;
      setRestaurants(raw.map(r => ({ ...r, distance: calcDistance(lat, lng, r.latitude, r.longitude) })));
    } else {
      setRestaurants(raw);
    }
    setLoading(false);
  }

  const toggleBookmark = useCallback((id: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleInterested = useCallback((id: number) => {
    setInterested(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      localStorage.setItem(INTERESTED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  function handleRegionToggle(region: string) {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  }

  function handleRegionConfirm() {
    if (selectedRegions.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedRegions));
    setShowRegionSelect(false);
  }

  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    if (a.distance != null) return -1;
    if (b.distance != null) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  const searchedRestaurants = searchQuery.trim()
    ? sortedRestaurants.filter(r =>
        (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.address || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedRestaurants;

  const bookmarkedRestaurants = sortedRestaurants.filter(r => bookmarks.has(r.id));

  if (showRegionSelect) {
    return (
      <div className="flex flex-col min-h-screen bg-red-50">
        <header className="bg-red-900 text-white px-4 py-4 text-center">
          <h1 className="text-2xl font-bold">🍜 ラ・ラ・ラーメン</h1>
          <p className="text-sm text-red-200 mt-1">使うエリアを選んでください</p>
        </header>
        <div className="flex-1 px-4 py-4">
          <p className="text-xs text-gray-500 mb-4 text-center">複数選択できます。後から変更も可能です。</p>
          <div className="bg-red-100 rounded-lg px-4 py-3 mb-4 text-center">
            <a href="/about" className="text-red-700 text-xs underline font-medium">
              📋 プライバシーポリシー・免責事項・ご注意
            </a>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {sortedRegions.map(region => {
              const isSelected = selectedRegions.includes(region.name);
              return (
                <button key={region.name} onClick={() => handleRegionToggle(region.name)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected ? "bg-red-700 border-red-700 text-white" : "bg-white border-red-200 text-red-900"
                  }`}
                >
                  <span className="text-2xl">{region.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{region.name}</p>
                    <p className={`text-xs mt-0.5 ${isSelected ? "text-red-200" : "text-gray-500"}`}>{region.desc}</p>
                  </div>
                  {isSelected && <span className="ml-auto text-white text-lg">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sticky bottom-0 p-4 bg-red-50 border-t border-red-200">
          <button onClick={handleRegionConfirm} disabled={selectedRegions.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              selectedRegions.length > 0 ? "bg-red-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selectedRegions.length > 0 ? `${selectedRegions.join("・")}で始める 🍜` : "エリアを選んでください"}
          </button>
        </div>
      </div>
    );
  }

  const RestaurantListItem = ({ restaurant }: { restaurant: Restaurant }) => {
    const isBookmarked = bookmarks.has(restaurant.id);
    const isInterested = interested.has(restaurant.id);
    return (
      <li className={`px-4 py-3 ${isInterested ? "bg-red-50" : "bg-white"} hover:bg-red-50`}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p
              className="font-medium text-red-900 text-sm truncate cursor-pointer underline decoration-red-300"
              onClick={() => {
                setView("map");
                setTimeout(() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const map = (window as any)._ramenMap;
                  if (map) map.setView([restaurant.latitude, restaurant.longitude], 17);
                }, 100);
              }}
              title="地図で見る"
            >
              🍜 {restaurant.name || "名称不明"}
            </p>
            {restaurant.distance != null && (
              <p className="text-xs text-red-600 mt-0.5 font-medium">
                📍 {formatDistance(restaurant.distance)}
              </p>
            )}
            {restaurant.cuisine && (
              <p className="text-xs text-red-400 mt-0.5">{cuisineLabel(restaurant.cuisine)}</p>
            )}
            {restaurant.address && <p className="text-xs text-gray-500 mt-0.5 truncate">{restaurant.address}</p>}
            {restaurant.opening_hours && <p className="text-xs text-gray-400 mt-0.5 truncate">🕐 {restaurant.opening_hours}</p>}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <button
              onClick={() => toggleInterested(restaurant.id)}
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                border: `2px solid ${isInterested ? "#dc2626" : "#d1d5db"}`,
                background: isInterested ? "#dc2626" : "white",
                color: isInterested ? "white" : "#d1d5db",
                fontSize: "14px", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}
              title="気になる"
            >♥</button>
            <button
              onClick={() => toggleBookmark(restaurant.id)}
              className={`text-xl ${isBookmarked ? "text-red-400" : "text-gray-300"}`}
            >
              {isBookmarked ? "⭐" : "☆"}
            </button>
            <a
              href={"https://line.me/R/share?text=" + encodeURIComponent("🍜 " + (restaurant.name || "") + "\n" + (restaurant.address || "") + "\nhttps://ramen.vercel.app")}
              target="_blank" rel="noopener noreferrer"
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                border: "2px solid #06C755", background: "white",
                color: "#06C755", fontSize: "13px", display: "flex",
                alignItems: "center", justifyContent: "center", textDecoration: "none",
              }}
              title="LINEで共有"
            >L</a>
            <a
              href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("🍜 " + (restaurant.name || "") + " でラーメン！\n" + (restaurant.address || "") + "\n#ラ・ラ・ラーメン #ラーメン\nhttps://ramen.vercel.app")}
              target="_blank" rel="noopener noreferrer"
              style={{
                width: "28px", height: "28px", borderRadius: "50%",
                border: "2px solid #000", background: "white",
                color: "#000", fontSize: "11px", fontWeight: "bold",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
              }}
              title="Xに投稿"
            >X</a>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-red-50">
      <header className="bg-red-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <button onClick={() => setShowRegionSelect(true)} className="text-left">
          <h1 className="text-xl font-bold">🍜 ラ・ラ・ラーメン</h1>
          <p className="text-xs text-red-300">タップでエリア変更</p>
        </button>
        <p className="text-xs text-red-200">
          {loading ? "読込中..." : `${restaurants.length}件`}
        </p>
      </header>

      {nearbyAlert && (
        <div
          className="bg-red-500 text-white px-4 py-3 flex items-center justify-between cursor-pointer shadow-lg"
          onClick={() => {
            setNearbyAlert(null);
            setView("map");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const map = (window as any)._ramenMap;
            if (map) map.setView([nearbyAlert.latitude, nearbyAlert.longitude], 16);
          }}
        >
          <div className="flex-1">
            <p className="font-bold text-sm">🍜 近くに気になるお店があります!</p>
            <p className="text-xs mt-0.5 text-red-100">
              {nearbyAlert.name} — {nearbyAlert.distance != null ? formatDistance(nearbyAlert.distance) : ""}
            </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setNearbyAlert(null); }} className="text-red-200 text-lg ml-3">✕</button>
        </div>
      )}

      <div className="flex bg-white border-b border-red-100">
        <button onClick={() => setView("map")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${view === "map" ? "text-red-800 border-b-2 border-red-700" : "text-gray-400"}`}
        >🗺️ 地図</button>
        <button onClick={() => setView("list")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${view === "list" ? "text-red-800 border-b-2 border-red-700" : "text-gray-400"}`}
        >📋 リスト</button>
        <button onClick={() => setView("bookmarks")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${view === "bookmarks" ? "text-red-800 border-b-2 border-red-700" : "text-gray-400"}`}
        >⭐ {bookmarks.size > 0 ? bookmarks.size : ""}</button>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading || locating ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-red-800">🍜 読み込み中...</p>
          </div>
        ) : view === "map" ? (
          <div className="h-full">
            <Map
              restaurants={restaurants}
              center={center}
              bookmarks={bookmarks}
              interested={interested}
              onToggleBookmark={toggleBookmark}
              onToggleInterested={toggleInterested}
            />
          </div>
        ) : view === "bookmarks" ? (
          <div className="h-full overflow-y-auto">
            {bookmarkedRestaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <p className="text-gray-500 text-sm">お気に入りはまだありません</p>
                <p className="text-gray-400 text-xs">リストの ☆ から登録できます</p>
              </div>
            ) : (
              <ul className="divide-y divide-red-100">
                {bookmarkedRestaurants.map(r => <RestaurantListItem key={r.id} restaurant={r} />)}
              </ul>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-white border-b border-red-100">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="店舗名・住所で検索..."
                  className="w-full pl-8 pr-8 py-2 text-sm border border-red-200 rounded-full bg-red-50 focus:outline-none focus:border-red-500 text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✕</button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {searchedRestaurants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? `「${searchQuery}」は見つかりませんでした` : "お店が見つかりません"}
                  </p>
                </div>
              ) : (
                <>
                  {!searchQuery && hasLocation && (
                    <p className="text-xs text-red-700 text-center py-2 bg-red-50 border-b border-red-100">
                      📍 現在地から近い順　♥気になる　☆お気に入り
                    </p>
                  )}
                  {searchQuery && (
                    <p className="text-xs text-red-700 text-center py-2 bg-red-50 border-b border-red-100">
                      🔍 「{searchQuery}」の検索結果 {searchedRestaurants.length}件
                    </p>
                  )}
                  <ul className="divide-y divide-red-100">
                    {searchedRestaurants.map(r => <RestaurantListItem key={r.id} restaurant={r} />)}
                  </ul>
                  <p className="text-xs text-gray-400 text-center py-4 px-4">
                    位置情報は <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> のデータを使用。<br/>
                    <a href="/about" className="text-red-600 underline mt-1 inline-block">📋 プライバシーポリシー・免責事項</a>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <InstallBanner />
    </div>
  );
}
