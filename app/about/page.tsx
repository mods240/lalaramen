export default function AboutPage() {
  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'24px 16px 64px', fontFamily:'-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif', color:'#333' }}>

      {/* ヘッダー */}
      <div style={{ background:'linear-gradient(135deg,#DC2626,#EF4444)', borderRadius:16, padding:'20px 16px', textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:36 }}>🍜</div>
        <h1 style={{ color:'white', fontSize:20, fontWeight:'bold', margin:'8px 0 4px' }}>ラ・ラ・ラーメン</h1>
        <p style={{ color:'rgba(255,255,255,0.9)', fontSize:13, margin:0 }}>ラーメン店ナビ</p>
      </div>

      {/* このアプリについて */}
      <section style={{ background:'#f9f9f9', borderRadius:12, padding:'16px', marginBottom:20, border:'1px solid #eee' }}>
        <h2 style={{ fontSize:16, fontWeight:'bold', color:'#DC2626', marginBottom:8 }}>📖 このアプリについて</h2>
        <p style={{ fontSize:14, lineHeight:1.8, margin:'0 0 10px', color:'#555' }}>ラーメン食べたい気持ちは、ほぼいつも心にありますよね。そんな「今すぐラーメン」な気持ちに応えるため、近くのラーメン店をすぐ探せるアプリを作りました。</p>
        <p style={{ fontSize:14, lineHeight:1.8, margin:0, color:'#555' }}>全国のラーメン・つけ麺・担々麺・町中華などの麺料理店をOpenStreetMapのデータをもとに地図上に表示します。</p>
      </section>

      {/* みんなで作るマップ */}
      <section style={{ background:'#f0f9ff', borderRadius:12, padding:'16px', marginBottom:20, border:'1px solid #bae6fd' }}>
        <h2 style={{ fontSize:16, fontWeight:'bold', color:'#DC2626', marginBottom:8 }}>🗺️ みんなで育てるマップ</h2>
        <p style={{ fontSize:14, lineHeight:1.7, margin:'0 0 12px', color:'#555' }}>
          このアプリの店舗データは <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color:'#DC2626' }}>OpenStreetMap（OSM）</a> を使用しています。OSMは世界中のボランティアが作る無料の地図データベースです。
        </p>
        <p style={{ fontSize:14, lineHeight:1.7, margin:'0 0 12px', color:'#555' }}>
          近くのお店が載っていない場合、OSMに追加していただくと次回のデータ更新時に反映されます。正確な情報をお持ちの方はぜひご協力ください！
        </p>
        <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-block', padding:'8px 20px', background:'#DC2626', color:'white', borderRadius:20, fontSize:13, fontWeight:'bold', textDecoration:'none' }}>
          OSMで店舗を追加する →
        </a>
      </section>

      {/* 関連アプリ */}
      <section style={{ background:'white', borderRadius:12, padding:'16px', marginBottom:20, border:'1px solid #eee' }}>
        <h2 style={{ fontSize:16, fontWeight:'bold', color:'#333', marginBottom:12 }}>🔗 関連アプリ</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <a key="https://fishtime-eight.vercel.app" href="https://fishtime-eight.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f9f9f9', borderRadius:10, textDecoration:'none', color:'#333' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'bold', fontSize:14 }}>🐟 フィッシュタイム</div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>近くの海鮮・寿司店を探す</div>
            </div>
            <span style={{ color:'#ccc' }}>→</span>
          </a>
          <a key="https://gopan.vercel.app" href="https://gopan.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f9f9f9', borderRadius:10, textDecoration:'none', color:'#333' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'bold', fontSize:14 }}>🥐 ゴパン</div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>近くのパン屋さんを探す</div>
            </div>
            <span style={{ color:'#ccc' }}>→</span>
          </a>
          <a key="https://earlybird-yakitori.vercel.app" href="https://earlybird-yakitori.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f9f9f9', borderRadius:10, textDecoration:'none', color:'#333' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'bold', fontSize:14 }}>🍢 アーリーバード</div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>近くの焼き鳥店を探す</div>
            </div>
            <span style={{ color:'#ccc' }}>→</span>
          </a>
          <a key="https://toilet-kakekomi.vercel.app" href="https://toilet-kakekomi.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f9f9f9', borderRadius:10, textDecoration:'none', color:'#333' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'bold', fontSize:14 }}>🚻 トイレの駆け込み寺</div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>近くの公衆トイレを探す</div>
            </div>
            <span style={{ color:'#ccc' }}>→</span>
          </a>
          <a key="https://puchi-pla.vercel.app" href="https://puchi-pla.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#f9f9f9', borderRadius:10, textDecoration:'none', color:'#333' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'bold', fontSize:14 }}>🛍️ プチプラプラプラ</div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>近くの100均・プチプラを探す</div>
            </div>
            <span style={{ color:'#ccc' }}>→</span>
          </a>
        </div>
      </section>

      {/* プライバシーポリシー */}
      <section style={{ background:'white', borderRadius:12, padding:'16px', marginBottom:20, border:'1px solid #eee' }}>
        <h2 style={{ fontSize:16, fontWeight:'bold', color:'#333', marginBottom:12 }}>📋 プライバシーポリシー</h2>
        <div style={{ fontSize:13, lineHeight:1.8, color:'#555' }}>
          <p><strong>収集する情報</strong></p>
          <p>本アプリは、地図表示のために位置情報の取得を行います。位置情報はお客様の端末内でのみ使用され、外部サーバーへの送信は行いません。</p>
          <p style={{ marginTop:12 }}><strong>広告について</strong></p>
          <p>本アプリはGoogle AdSenseによる広告を掲載する場合があります。Googleは広告配信のためにCookieを使用することがあります。詳細は<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color:'#DC2626' }}>Googleのプライバシーポリシー</a>をご確認ください。</p>
          <p style={{ marginTop:12 }}><strong>アクセス解析</strong></p>
          <p>本アプリはサービス改善のためアクセス解析ツールを使用する場合があります。</p>
        </div>
      </section>

      {/* 免責事項 */}
      <section style={{ background:'white', borderRadius:12, padding:'16px', marginBottom:20, border:'1px solid #eee' }}>
        <h2 style={{ fontSize:16, fontWeight:'bold', color:'#333', marginBottom:12 }}>⚠️ 免責事項</h2>
        <div style={{ fontSize:13, lineHeight:1.8, color:'#555' }}>
          <p>本アプリの店舗情報はOpenStreetMapのデータを使用しており、情報が古い・不正確・未掲載の場合があります。</p>
          <p style={{ marginTop:8 }}>営業時間・店舗の存在については必ず事前にご確認ください。本アプリの情報を利用したことによる損害について、開発者は一切の責任を負いません。</p>
          <p style={{ marginTop:8 }}>店舗情報の著作権はOpenStreetMap contributors に帰属します（<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color:'#DC2626' }}>ODbL</a>）。</p>
        </div>
      </section>

      {/* 戻るボタン */}
      <div style={{ textAlign:'center' }}>
        <a href="/" style={{ display:'inline-block', padding:'12px 32px', background:'linear-gradient(135deg,#DC2626,#EF4444)', color:'white', borderRadius:20, fontSize:14, fontWeight:'bold', textDecoration:'none' }}>
          ← 地図に戻る
        </a>
      </div>
    </div>
  )
}
