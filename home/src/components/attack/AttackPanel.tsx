import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { abi, address as contractAddress } from '../../abi/GameNFT';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import '../../styles/AttackPanel.css';

type Props = { onComplete: () => void };

type DifficultyInfo = {
  difficulty: 0 | 1 | 2;
  name: string;
  icon: string;
  successRate: string;
  rarity: string;
  rarityClass: string;
  badgeClass: string;
  stats: string;
};

const difficulties: DifficultyInfo[] = [
  {
    difficulty: 0,
    name: 'Easy',
    icon: '🐛',
    successRate: '80%',
    rarity: 'Common',
    rarityClass: 'rarity-common',
    badgeClass: 'easy',
    stats: '10-20'
  },
  {
    difficulty: 1,
    name: 'Hard',
    icon: '🐉',
    successRate: '20%',
    rarity: 'Rare',
    rarityClass: 'rarity-rare',
    badgeClass: 'hard',
    stats: '30-50'
  },
  {
    difficulty: 2,
    name: 'Hell',
    icon: '👹',
    successRate: '5%',
    rarity: 'Legendary',
    rarityClass: 'rarity-legendary',
    badgeClass: 'hell',
    stats: '60-100'
  }
];

export function AttackPanel({ onComplete }: Props) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const signer = useEthersSigner();

  const attack = async (difficulty: 0 | 1 | 2) => {
    if (!window.ethereum) {
      setMessage({ text: 'No wallet detected', type: 'error' });
      return;
    }
    if (!contractAddress || !abi) {
      setMessage({ text: 'Contract not configured', type: 'error' });
      return;
    }
    if (!signer) {
      setMessage({ text: 'No signer available', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const resolvedSigner = await signer;
      if (!resolvedSigner) {
        throw new Error('Wallet not connected');
      }

      const c = new ethers.Contract(contractAddress, abi as any, resolvedSigner);
      const tx = await c.attackMonster(difficulty);

      setMessage({ text: 'Battle in progress... ⚔️', type: 'info' });
      await tx.wait();

      setMessage({ text: '🎉 Victory! NFT minted. Check your inventory below.', type: 'success' });
      onComplete();
    } catch (e: any) {
      const errorMsg = e?.message || 'Attack failed';
      setMessage({ text: errorMsg.includes('user rejected') ? 'Transaction cancelled' : errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="attack-panel">
        <div className="connect-message">
          <p>🔐 Connect your wallet to start hunting monsters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attack-panel">
      <div className="attack-panel-header">
        <h2 className="attack-panel-title">
          <span>⚔️</span>
          Choose Your Battle
        </h2>
        <p className="attack-panel-subtitle">
          Select a difficulty level and hunt monsters to earn NFTs with encrypted stats
        </p>
      </div>

      <div className="attack-panel-grid">
        {difficulties.map((diff) => (
          <div
            key={diff.difficulty}
            className={`difficulty-card ${loading ? 'disabled' : ''}`}
            onClick={() => !loading && attack(diff.difficulty)}
          >
            <div className="difficulty-header">
              <div className="difficulty-name">
                <span>{diff.icon}</span>
                {diff.name}
              </div>
              <span className={`difficulty-badge ${diff.badgeClass}`}>
                {diff.successRate}
              </span>
            </div>

            <div className="difficulty-stats">
              <div className="difficulty-stat">
                <span className="stat-label">Success Rate</span>
                <span className="stat-value success-rate">{diff.successRate}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Rarity</span>
                <span className={`stat-value ${diff.rarityClass}`}>{diff.rarity}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Stats Range</span>
                <span className="stat-value">{diff.stats}</span>
              </div>
            </div>

            <button className="attack-button" disabled={loading}>
              {loading ? 'Battling...' : `Attack ${diff.name}`}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div className={`attack-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
