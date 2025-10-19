import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">
              <span className="header-icon">⚔️</span>
              FHE Monster Hunter
              <span className="header-badge">Beta</span>
            </h1>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}