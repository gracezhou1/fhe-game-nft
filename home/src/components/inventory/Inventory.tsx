import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import type { Address } from 'viem';
import { sepolia } from 'viem/chains';
import { abi, address as contractAddress } from '../../abi/GameNFT';
import { useZamaInstance } from '../../hooks/useZamaInstance';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import '../../styles/Inventory.css';

type Item = {
  tokenId: bigint;
  rarity: number;
  attackHandle: string;
  defenseHandle: string;
  attack?: bigint;
  defense?: bigint;
};

export function Inventory() {
  const { address } = useAccount();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState<Record<string, boolean>>({});
  const [decryptErrors, setDecryptErrors] = useState<Record<string, string | null>>({});
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const signer = useEthersSigner();

  const client = useMemo(() => createPublicClient({ chain: sepolia, transport: http() }), []);

  useEffect(() => {
    if (!address) { setItems([]); setDecryptErrors({}); setDecrypting({}); return; }
    if (!contractAddress || !abi) { setError('Contract not configured'); return; }
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const tokenIds = await client.readContract({
          address: contractAddress as Address,
          abi: abi as any,
          functionName: 'tokensOfOwner',
          args: [address as Address]
        }) as bigint[];

        const entries: Item[] = [];
        for (const tid of tokenIds) {
          const rarity = await client.readContract({
            address: contractAddress as Address,
            abi: abi as any,
            functionName: 'rarityOf',
            args: [tid]
          }) as number;
          const attackHandle = await client.readContract({
            address: contractAddress as Address,
            abi: abi as any,
            functionName: 'attackOf',
            args: [tid]
          }) as string;
          const defenseHandle = await client.readContract({
            address: contractAddress as Address,
            abi: abi as any,
            functionName: 'defenseOf',
            args: [tid]
          }) as string;
          entries.push({ tokenId: tid, rarity, attackHandle, defenseHandle });
        }
        if (mounted) {
          setItems(entries);
          setDecryptErrors({});
          setDecrypting({});
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load inventory');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [address, client]);

  useEffect(() => {
    if (zamaError) {
      setError(zamaError);
    }
  }, [zamaError]);

  const handleDecrypt = async (item: Item) => {
    if (!instance) {
      setDecryptErrors((prev) => ({ ...prev, [item.tokenId.toString()]: 'Encryption service unavailable' }));
      return;
    }
    const resolvedSigner = await signer;
    if (!resolvedSigner) {
      setDecryptErrors((prev) => ({ ...prev, [item.tokenId.toString()]: 'Connect wallet to decrypt' }));
      return;
    }
    setDecrypting((prev) => ({ ...prev, [item.tokenId.toString()]: true }));
    setDecryptErrors((prev) => ({ ...prev, [item.tokenId.toString()]: null }));
    try {
      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [contractAddress];
      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
      const signature = await resolvedSigner.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );
      const pairs = [
        { handle: item.attackHandle, contractAddress },
        { handle: item.defenseHandle, contractAddress },
      ];
      const result = await instance.userDecrypt(
        pairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x',''),
        contractAddresses,
        await resolvedSigner.getAddress(),
        startTimeStamp,
        durationDays,
      );

      const attackValue = BigInt(result[item.attackHandle]);
      const defenseValue = BigInt(result[item.defenseHandle]);
      setItems((prev) => prev.map((it) => (
        it.tokenId === item.tokenId
          ? { ...it, attack: attackValue, defense: defenseValue }
          : it
      )));
    } catch (err: any) {
      setDecryptErrors((prev) => ({ ...prev, [item.tokenId.toString()]: err?.message || 'Decrypt failed' }));
    } finally {
      setDecrypting((prev) => {
        const next = { ...prev };
        delete next[item.tokenId.toString()];
        return next;
      });
    }
  };

  if (!address) {
    return (
      <div className="inventory-section">
        <div className="inventory-empty">
          Connect your wallet to view your NFTs
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-section">
      <div className="inventory-header">
        <h2 className="inventory-title">
          <span>🎒</span>
          Your Collection
        </h2>
        <p className="inventory-subtitle">
          Your NFTs with FHE-encrypted stats. Only you can decrypt and view your character's true power.
        </p>
      </div>

      {(loading || zamaLoading) && (
        <div className="inventory-loading">
          <div>⏳ Loading your collection...</div>
        </div>
      )}

      {error && (
        <div className="inventory-error">
          ❌ {error}
        </div>
      )}

      {!loading && !zamaLoading && items.length === 0 && (
        <div className="inventory-empty">
          <p>📦 No NFTs yet</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Start hunting monsters above to earn your first NFT!
          </p>
        </div>
      )}

      <div className="inventory-grid">
        {items.map((it) => {
          const rarityInfo = getRarityInfo(it.rarity);
          const isDecrypted = it.attack !== undefined && it.defense !== undefined;

          return (
            <div key={it.tokenId.toString()} className={`nft-card ${rarityInfo.class}`}>
              <div className="nft-header">
                <div className="nft-id">#{it.tokenId.toString()}</div>
                <div className={`nft-rarity-badge ${rarityInfo.class}`}>
                  {rarityInfo.name}
                </div>
              </div>

              <div className="nft-icon">{rarityInfo.icon}</div>

              <div className="nft-stats">
                <div className="nft-stat">
                  <span className="nft-stat-label">
                    <span>⚔️</span>
                    Attack
                  </span>
                  <span className={`nft-stat-value ${!isDecrypted ? 'locked' : ''}`}>
                    {it.attack !== undefined ? it.attack.toString() : '🔒'}
                  </span>
                </div>

                <div className="nft-stat">
                  <span className="nft-stat-label">
                    <span>🛡️</span>
                    Defense
                  </span>
                  <span className={`nft-stat-value ${!isDecrypted ? 'locked' : ''}`}>
                    {it.defense !== undefined ? it.defense.toString() : '🔒'}
                  </span>
                </div>
              </div>

              {!isDecrypted && (
                <button
                  className="decrypt-button"
                  onClick={() => handleDecrypt(it)}
                  disabled={Boolean(decrypting[it.tokenId.toString()]) || zamaLoading || !instance}
                >
                  {decrypting[it.tokenId.toString()] ? (
                    <>
                      <span>⏳</span>
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <span>🔓</span>
                      Reveal Stats
                    </>
                  )}
                </button>
              )}

              {decryptErrors[it.tokenId.toString()] && (
                <div className="decrypt-error">
                  ⚠️ {decryptErrors[it.tokenId.toString()]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRarityInfo(rarity: number) {
  switch (rarity) {
    case 0:
      return { name: 'Common', class: 'common', icon: '🐛' };
    case 1:
      return { name: 'Rare', class: 'rare', icon: '🐉' };
    case 2:
      return { name: 'Legendary', class: 'legendary', icon: '👹' };
    default:
      return { name: 'Unknown', class: 'common', icon: '❓' };
  }
}
