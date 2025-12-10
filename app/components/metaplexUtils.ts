"use client";

import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import {
  createCreateMetadataAccountV3Instruction,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

/**
 * Build small JSON metadata and encode as data: URI
 */
export function buildDataUriMetadata(obj: {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
}) {
  const meta = {
    name: obj.name,
    symbol: obj.symbol,
    description: obj.description ?? "",
    image: obj.image ?? ""
  };

  const json = JSON.stringify(meta);
  const b64 = Buffer.from(json).toString("base64");

  return `data:application/json;base64,${b64}`;
}

/**
 * Create Metaplex metadata account for a mint — using V3 instruction.
 */
export async function createOnChainMetadata(
  connection: Connection,
  payerPubkey: PublicKey,
  mintPubkey: PublicKey,
  mintAuthorityPubkey: PublicKey,
  updateAuthorityPubkey: PublicKey,
  dataUri: string,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>
) {
  // Metadata PDA
  const [metadataPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // Metadata schema
  const data: DataV2 = {
    name: "NAME",
    symbol: "SYM",
    uri: dataUri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  // Build instruction using V3
  const ix = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPda,
      mint: mintPubkey,
      mintAuthority: mintAuthorityPubkey,
      payer: payerPubkey,
      updateAuthority: updateAuthorityPubkey,
    },
    {
      createMetadataAccountArgsV3: {
        data,
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  const tx = new Transaction().add(ix);

  const { blockhash } = await connection.getLatestBlockhash("finalized");
  tx.recentBlockhash = blockhash;
  tx.feePayer = payerPubkey;

  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");

  return { metadataPda, sig };
}
