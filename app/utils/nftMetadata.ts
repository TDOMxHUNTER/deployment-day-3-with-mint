
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  animation_url?: string;
}

export function generateProfileMetadata(profileData: {
  name: string;
  title: string;
  handle: string;
  avatarUrl: string;
  status?: string;
}): NFTMetadata {
  const metadata: NFTMetadata = {
    name: `${profileData.name} - Monad Profile Card`,
    description: `A unique Monad Profile Card NFT for ${profileData.name} (@${profileData.handle}). This NFT represents a verified profile on the Monad ecosystem.`,
    image: profileData.avatarUrl,
    attributes: [
      {
        trait_type: "Name",
        value: profileData.name
      },
      {
        trait_type: "Title",
        value: profileData.title
      },
      {
        trait_type: "Handle",
        value: profileData.handle
      },
      {
        trait_type: "Status",
        value: profileData.status || "Active"
      },
      {
        trait_type: "Chain",
        value: "Monad Testnet"
      },
      {
        trait_type: "Minted Date",
        value: new Date().toISOString()
      }
    ]
  };

  return metadata;
}

export async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  try {
    // For now, we'll use a simple JSON storage approach
    // In production, you'd want to use IPFS or another decentralized storage
    const jsonData = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Use project ID as part of the metadata URI
    const projectId = "2a3cb8da4f7f897a2306f192152dfa98";
    const timestamp = Date.now();
    
    // Return a mock URI for demonstration with project ID
    return `ipfs://Qm${projectId.slice(0, 20)}/${timestamp}.json`;
  } catch (error) {
    console.error('Failed to upload metadata:', error);
    // Return a fallback URI
    return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
  }
}
