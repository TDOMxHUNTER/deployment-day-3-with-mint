
import { ethers } from 'ethers';
import { generateProfileMetadata, uploadMetadata } from './nftMetadata';

// Contract ABI (simplified for the main functions we need)
const CONTRACT_ABI = [
  "function mintProfile(string memory _name, string memory _title, string memory _handle, string memory _avatarUrl, string memory _metadataURI) public payable",
  "function getUserTokens(address user) public view returns (uint256[])",
  "function getProfileData(uint256 tokenId) public view returns (tuple(string name, string title, string handle, string avatarUrl, uint256 timestamp, address minter))",
  "function totalSupply() public view returns (uint256)",
  "function isHandleAvailable(string memory _handle) public view returns (bool)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event ProfileMinted(uint256 indexed tokenId, address indexed minter, string name, string handle, string metadataURI)"
];

// Contract address for Monad testnet
const CONTRACT_ADDRESS = "0x" + "2a3cb8da4f7f897a2306f192152dfa98".slice(0, 40);

export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;

  async initialize(ethereum: any) {
    try {
      if (!ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      this.provider = new ethers.providers.Web3Provider(ethereum);
      const signer = this.provider.getSigner();
      
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.length < 42) {
        throw new Error('Contract not deployed yet');
      }
      
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Test connection
      await this.provider.getNetwork();
    } catch (error) {
      console.error('Contract initialization failed:', error);
      throw error;
    }
  }

  async mintProfileNFT(profileData: {
    name: string;
    title: string;
    handle: string;
    avatarUrl: string;
    status?: string;
  }) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    // Check if handle is available
    const isAvailable = await this.contract.isHandleAvailable(profileData.handle);
    if (!isAvailable) {
      throw new Error('Handle already exists');
    }

    // Generate metadata
    const metadata = generateProfileMetadata(profileData);
    const metadataURI = await uploadMetadata(metadata);

    // Calculate mint price (0.01 ETH)
    const mintPrice = ethers.utils.parseEther("0.01");

    // Execute mint transaction
    const tx = await this.contract.mintProfile(
      profileData.name,
      profileData.title,
      profileData.handle,
      profileData.avatarUrl,
      metadataURI,
      { value: mintPrice }
    );

    return tx;
  }

  async getUserTokens(address: string) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getUserTokens(address);
    } catch (error) {
      console.error('Failed to get user tokens:', error);
      return [];
    }
  }

  async getProfileData(tokenId: number) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getProfileData(tokenId);
    } catch (error) {
      console.error('Failed to get profile data:', error);
      return null;
    }
  }

  async getTotalSupply() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.totalSupply();
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }

  async isHandleAvailable(handle: string) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.isHandleAvailable(handle);
    } catch (error) {
      console.error('Failed to check handle availability:', error);
      return false;
    }
  }
}

export const contractService = new ContractService();
