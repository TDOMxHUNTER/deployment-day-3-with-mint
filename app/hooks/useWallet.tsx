
'use client';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { useEffect, useState } from 'react';

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, error: connectError, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork, error: switchError } = useSwitchNetwork();
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      setConnectionState('connecting');
    } else if (isConnected) {
      setConnectionState('connected');
    } else if (connectError || switchError) {
      setConnectionState('error');
    } else {
      setConnectionState('idle');
    }
  }, [isConnecting, isReconnecting, isConnected, connectError, switchError]);

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchNetwork = (chainId: number) => {
    if (switchNetwork) {
      switchNetwork(chainId);
    }
  };

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    chain,
    connectors,
    connectionState,
    error: connectError || switchError,
    isLoading,
    pendingConnector,
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchNetwork: handleSwitchNetwork,
  };
}
