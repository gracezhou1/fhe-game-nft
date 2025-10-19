import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import type { Address } from 'viem';
import { sepolia } from 'viem/chains';
import { abi, address as contractAddress } from '../../abi/GameNFT';
import { useZamaInstance } from '../../hooks/useZamaInstance';
import { useEthersSigner } from '../../hooks/useEthersSigner';

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

  if (!address) return <div style={{ marginTop: 16 }}>Connect wallet to view your NFTs.</div>;
  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 18 }}>Your Inventory</h2>
      {(loading || zamaLoading) && <div>Loading...</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {items.map((it) => (
          <div key={it.tokenId.toString()} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>Token #{it.tokenId.toString()}</div>
            <div>Rarity: {renderRarity(it.rarity)}</div>
            <div>Attack: {it.attack !== undefined ? it.attack.toString() : '🔒'}</div>
            <div>Defense: {it.defense !== undefined ? it.defense.toString() : '🔒'}</div>
            {(it.attack === undefined || it.defense === undefined) && (
              <button
                onClick={() => handleDecrypt(it)}
                disabled={Boolean(decrypting[it.tokenId.toString()]) || zamaLoading || !instance}
                style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
              >
                {decrypting[it.tokenId.toString()] ? 'Decrypting...' : 'Decrypt Stats'}
              </button>
            )}
            {decryptErrors[it.tokenId.toString()] && (
              <div style={{ marginTop: 6, color: 'crimson' }}>{decryptErrors[it.tokenId.toString()]}</div>
            )}
          </div>
        ))}
        {items.length === 0 && !loading && !zamaLoading && <div>No NFTs yet. Try attacking!</div>}
      </div>
    </div>
  );
}

function renderRarity(r: number) {
  if (r === 0) return 'Common';
  if (r === 1) return 'Rare';
  if (r === 2) return 'Legendary';
  return String(r);
}
