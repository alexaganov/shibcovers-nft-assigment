import mongoose from "mongoose";

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { connection: null, promise: null };
}

export const connectDatabase = async ({ uri }: { uri: string }) => {
  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: "top-nft-holders",
      })
      .then((mongoose) => {
        console.log("Db connected");
        return mongoose;
      });
  }

  try {
    cached.connection = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.connection;
};
