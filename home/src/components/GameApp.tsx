import { useState } from 'react';
import { Header } from './Header';
import { AttackPanel } from './attack/AttackPanel';
import { Inventory } from './inventory/Inventory';

export function GameApp() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px' }}>
      <Header />
      <h1 style={{ marginTop: 16, fontSize: 24 }}>FHE Game: Hunt Monsters</h1>
      <p style={{ color: '#555' }}>Win and mint an NFT. Rarity is public; stats are private (FHE encrypted).</p>
      <AttackPanel onComplete={() => setRefreshKey((x) => x + 1)} />
      <Inventory key={refreshKey} />
    </div>
  );
}

