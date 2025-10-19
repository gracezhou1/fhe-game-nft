import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { abi, address as contractAddress } from '../../abi/GameNFT';

type Props = { onComplete: () => void };

export function AttackPanel({ onComplete }: Props) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const attack = async (difficulty: 0 | 1 | 2) => {
    if (!window.ethereum) { setMessage('No wallet'); return; }
    if (!contractAddress || !abi || abi.length === 0) { setMessage('Contract not configured'); return; }
    setLoading(true); setMessage(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(contractAddress, abi as any, signer);
      const tx = await c.attackMonster(difficulty);
      await tx.wait();
      setMessage('Attack submitted. Check inventory.');
      onComplete();
    } catch (e: any) {
      setMessage(e?.message || 'Attack failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16, padding: 12, background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button disabled={loading || !address} onClick={() => attack(0)} style={btnStyle}>Attack Easy (80%)</button>
        <button disabled={loading || !address} onClick={() => attack(1)} style={btnStyle}>Attack Hard (20%)</button>
        <button disabled={loading || !address} onClick={() => attack(2)} style={btnStyle}>Attack Hell (5%)</button>
        {!address && <span style={{ color: '#666' }}>Connect wallet to play</span>}
        {message && <span style={{ color: '#333' }}>{message}</span>}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#1f2937',
  color: '#fff',
  cursor: 'pointer'
};

