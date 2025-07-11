'use client';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ProfileCard from './ProfileCard';
import SearchAndLeaderboard from './SearchAndLeaderboard';
import { saveProfile } from './utils/profileStorage';
import { SecurityManager } from './utils/security';
import { useAccount } from 'wagmi';

// NFT Mint Panel Component
const NFTMintPanel = ({ profileData }: { profileData: any }) => {
  const { isConnected, address } = useAccount();
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');
  const [mintError, setMintError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [userTokenCount, setUserTokenCount] = useState<number>(0);

  useEffect(() => {
    if (isConnected && address) {
      loadUserTokens();
    }
  }, [isConnected, address]);

  const loadUserTokens = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum && address) {
        const { contractService } = await import('./utils/contractInteraction');
        await contractService.initialize(window.ethereum);
        const tokens = await contractService.getUserTokens(address);
        setUserTokenCount(tokens.length);
      }
    } catch (error) {
      console.error('Failed to load user tokens:', error);
      setUserTokenCount(0);
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      setMintError('Please connect your wallet first');
      return;
    }

    if (!profileData.name || !profileData.handle) {
      setMintError('Please fill in profile name and handle');
      return;
    }

    setMintingStatus('minting');
    setMintError(null);
    setTxHash(null);

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const { contractService } = await import('./utils/contractInteraction');
        await contractService.initialize(window.ethereum);
        
        // Check if handle is available
        const isAvailable = await contractService.isHandleAvailable(profileData.handle);
        if (!isAvailable) {
          throw new Error('Handle already exists. Please choose a different handle.');
        }

        const tx = await contractService.mintProfileNFT({
          name: profileData.name,
          title: profileData.title,
          handle: profileData.handle,
          avatarUrl: profileData.avatarUrl,
          status: profileData.status
        });

        setTxHash(tx.hash);
        
        // Wait for transaction confirmation
        await tx.wait();
        
        setMintingStatus('success');
        setUserTokenCount(prev => prev + 1);
        setTimeout(() => setMintingStatus('idle'), 5000);
      } else {
        throw new Error('Web3 wallet not found');
      }
    } catch (error: any) {
      console.error('Minting error:', error);
      setMintingStatus('error');
      setMintError(error.message || 'Minting failed. Please try again.');
      setTimeout(() => {
        setMintingStatus('idle');
        setMintError(null);
      }, 5000);
    }
  };

  return (
    <div className="nft-mint-panel">
      <div className="nft-mint-content">
        <h3 className="nft-mint-title">Mint Profile NFT</h3>
        <p className="nft-mint-description">
          Transform your profile card into an exclusive NFT on Monad
        </p>
        
        <div className="nft-preview">
          <div className="nft-preview-card">
            <img 
              src="https://docs.monad.xyz/img/monad_logo.png" 
              alt="NFT Preview" 
              className="nft-preview-image"
            />
            <div className="nft-preview-overlay">
              <span>Profile NFT</span>
            </div>
          </div>
        </div>

        <div className="nft-details">
          <div className="nft-detail-item">
            <span className="nft-detail-label">Price:</span>
            <span className="nft-detail-value">0.01 ETH</span>
          </div>
          <div className="nft-detail-item">
            <span className="nft-detail-label">Network:</span>
            <span className="nft-detail-value">Monad Testnet</span>
          </div>
          <div className="nft-detail-item">
            <span className="nft-detail-label">Standard:</span>
            <span className="nft-detail-value">ERC-721</span>
          </div>
          {userTokenCount > 0 && (
            <div className="nft-detail-item">
              <span className="nft-detail-label">Your NFTs:</span>
              <span className="nft-detail-value">{userTokenCount}</span>
            </div>
          )}
        </div>

        {mintError && (
          <div className="nft-mint-error">
            {mintError}
          </div>
        )}

        {txHash && (
          <div className="nft-tx-hash">
            <span className="nft-detail-label">Transaction:</span>
            <a 
              href={`https://testnet1.monad.xyz/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nft-tx-link"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)}
            </a>
          </div>
        )}

        <button 
          className={`nft-mint-button ${mintingStatus}`}
          onClick={handleMint}
          disabled={mintingStatus === 'minting' || !isConnected}
        >
          {mintingStatus === 'idle' && (isConnected ? 'Mint Profile NFT' : 'Connect Wallet')}
          {mintingStatus === 'minting' && 'Minting...'}
          {mintingStatus === 'success' && 'Minted Successfully!'}
          {mintingStatus === 'error' && 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "MONAD",
    title: "Currently Testnet",
    handle: "monad_xyz",
    status: "Online",
    avatarUrl: "https://docs.monad.xyz/img/monad_logo.png",
    projectId: "2a3cb8da4f7f897a2306f192152dfa98"
  });

  // Clear all saved data on mount - run only once
  useEffect(() => {
    const hasCleared = sessionStorage.getItem('dataCleared');
    if (!hasCleared) {
      localStorage.removeItem('profileData');
      localStorage.removeItem('profileSearchCounts');
      localStorage.removeItem('userProfiles');
      localStorage.removeItem('savedAvatars');
      localStorage.removeItem('profileSettings');
      sessionStorage.setItem('dataCleared', 'true');
    }
  }, []);

  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Add global error handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      // Only prevent default for non-critical errors
      if (!event.reason?.toString().includes('Contract not initialized')) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.warn('Global error:', event.error);
      if (event.error && event.error.message !== 'config is not defined') {
        setError(event.error);
        setTimeout(() => setError(null), 5000);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Initialize security
    if (typeof window !== 'undefined') {
      try {
        SecurityManager.getInstance();

        // Load saved profile data
        const savedProfileData = localStorage.getItem('currentProfileData');
        if (savedProfileData) {
          const parsed = JSON.parse(savedProfileData);
          setProfileData(parsed);
        }
      } catch (error) {
        console.warn('Failed to load saved profile data:', error);
        setError(error as Error);
      }
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleProfileSelect = (profile: any) => {
    const newProfileData = {
      name: profile.name,
      title: profile.title,
      handle: profile.handle,
      status: profile.status || "Online",
      avatarUrl: profile.avatarUrl
    };

    setProfileData(newProfileData);

    // Save as current profile
    localStorage.setItem('currentProfileData', JSON.stringify(newProfileData));
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    const newProfileData = {
      name: updatedProfile.name,
      title: updatedProfile.title,
      handle: updatedProfile.handle,
      status: updatedProfile.status || "Online",
      avatarUrl: updatedProfile.avatarUrl
    };

    setProfileData(newProfileData);

    // Save to localStorage
    try {
      // Get existing profiles to preserve search count
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
      const existingProfile = profiles.find((p: any) => p.handle === updatedProfile.handle);

      // Only save to profiles list if it's not the default MONAD profile
      if (updatedProfile.handle !== 'monad_xyz' || updatedProfile.name !== 'MONAD') {
        saveProfile({
          name: updatedProfile.name,
          title: updatedProfile.title,
          handle: updatedProfile.handle,
          avatarUrl: updatedProfile.avatarUrl,
          status: updatedProfile.status || "Online",
          searchCount: existingProfile ? existingProfile.searchCount : 0
        });
      }

      // Always save as current profile
      localStorage.setItem('currentProfileData', JSON.stringify(newProfileData));
    } catch (error) {
      console.warn('Failed to save profile:', error);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8"
          style={{ 
            background: '#000000',
            minHeight: '100vh',
            height: '100%',
            width: '100%',
            position: 'relative'
          }}>

      {/* Connect Wallet Button */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <ConnectButton 
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
        />
        {error && (
          <div style={{ 
            position: 'absolute', 
            top: '50px', 
            right: '0px', 
            background: 'rgba(239, 68, 68, 0.9)', 
            color: 'white', 
            padding: '8px 12px', 
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '200px',
            zIndex: 1001
          }}>
            Connection failed: {error.message}
          </div>
        )}
      </div>

      {/* Search and Leaderboard */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}>
        <SearchAndLeaderboard onProfileSelect={handleProfileSelect} />
      </div>

      {/* Floating Monad Logo - Above heading */}
      <div className="floating-monad">
        <img 
          src="https://docs.monad.xyz/img/monad_logo.png" 
          alt="Monad Logo" 
          className="monad-logo"
        />
      </div>

      {/* Main Heading */}
      <div className="text-center mb-8">
        <h1 className="monad-heading text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider">
          MONAD PROFILE CARD
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Create and customize your unique Monad profile card with holographic effects
        </p>
      </div>

      {/* Main Content */}
      <div className="main-content-wrapper">
        <div className="profile-section">
          <ProfileCard
            avatarUrl={profileData.avatarUrl}
            name={profileData.name}
            title={profileData.title}
            handle={profileData.handle}
            status={profileData.status}
            onProfileUpdate={handleProfileUpdate}
            showSettings={showSettings}
            onToggleSettings={() => setShowSettings(!showSettings)}
            onContactClick={() => {
              window.open(`https://x.com/${profileData.handle}`, '_blank');
            }}
          />
        </div>
        
        <div className="nft-section">
          <NFTMintPanel profileData={profileData} />
        </div>
      </div>
    </main>
  );
}