import { createPublicClient, http } from 'viem'
import { sepolia } from './sepolia'

const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/86f028d2d3ef4078bbbfc83e062f6106';

export const publicClient = createPublicClient({
  chain: sepolia,  // Utilisez la configuration pour Sepolia
  transport: http({
    url: SEPOLIA_RPC_URL  // Correctement passé l'URL
  })
})
