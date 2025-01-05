'use client';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http} from 'wagmi';
import { sepolia } from 'wagmi/chains';  // Garder seulement sepolia ici
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Remplacez par l'URL RPC de Sepolia (exemple avec Infura)
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/86f028d2d3ef4078bbbfc83e062f6106';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '66836973d0e7ca63cb5f21c0f0fc984b', 
  chains: [
    sepolia, 
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_URL),
  },
  ssr: true, 
});

const queryClient = new QueryClient();

const MyRainbowKitProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default MyRainbowKitProvider;
