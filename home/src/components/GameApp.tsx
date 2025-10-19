import { useState } from 'react';
import { Header } from './Header';
import { AttackPanel } from './attack/AttackPanel';
import { Inventory } from './inventory/Inventory';
import '../styles/GameApp.css';

export function GameApp() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <Header />
      <div className="game-container">
        <div className="game-hero">
          <h1 className="game-title">
            Hunt Monsters, Earn Encrypted NFTs
          </h1>
          <p className="game-description">
            Battle monsters at different difficulty levels to earn NFTs with <strong>FHE-encrypted stats</strong>.
            Your character's true power remains private on-chain, visible only to you.
          </p>
          <div className="game-features">
            <div className="feature-badge">
              <span className="feature-icon">🔐</span>
              <span>Fully Encrypted Stats</span>
            </div>
            <div className="feature-badge">
              <span className="feature-icon">⚔️</span>
              <span>3 Difficulty Levels</span>
            </div>
            <div className="feature-badge">
              <span className="feature-icon">🎯</span>
              <span>Rare & Legendary Drops</span>
            </div>
          </div>
        </div>

        <div className="game-content">
          <AttackPanel onComplete={() => setRefreshKey((x) => x + 1)} />
          <div className="divider"></div>
          <Inventory key={refreshKey} />
        </div>
      </div>
    </>
  );
}

