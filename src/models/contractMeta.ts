import mongoose, { InferSchemaType, Model } from "mongoose";

const contractMetaSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  isProcessing: { type: Boolean, required: true, default: false },
  startedProcessingAt: { type: Date, required: true, default: Date.now },
  lastIndexedBlock: {
    type: String,
    required: true,
    validate: {
      validator: (value: unknown) => {
        return typeof value === "string" && /^\d+$/.test(value);
      },
      message: "Must be valid BigInt string",
    },
  },
});

export type ContractMetaType = InferSchemaType<typeof contractMetaSchema>;

export const ContractMetaModel: Model<ContractMetaType> =
  mongoose.models.ContractMeta ||
  mongoose.model("ContractMeta", contractMetaSchema);
