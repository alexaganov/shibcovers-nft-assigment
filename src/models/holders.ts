import mongoose, {
  InferSchemaType,
  Model,
  SchemaDefinitionProperty,
} from "mongoose";
import { Address } from "viem";

const BigIntString: SchemaDefinitionProperty = {
  type: String,
  required: true,
  default: "0",
  validate: {
    validator: (value: unknown) => {
      return typeof value === "string" && /^\d+$/.test(value);
    },
    message: "Must be valid BigInt string",
  },
};

const holderSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  tokens: [
    {
      tokenId: BigIntString,
    },
  ],
});

export type HolderType = InferSchemaType<typeof holderSchema>;

export const getHolderModel = (contractAddress: Address): Model<HolderType> => {
  // Normalize the contract address (remove "0x", lower-case it)
  const normalized = contractAddress.toLowerCase().replace(/^0x/, "");
  // Construct a valid model name. (Mongoose model names should be in PascalCase.)
  const modelName = "Holder_" + normalized.toUpperCase();

  // If the model already exists, return it.
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  // Otherwise, create a new model that uses a specific collection name.
  return mongoose.model(modelName, holderSchema, `holders_${normalized}`);
};
