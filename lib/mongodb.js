import mongoose from "mongoose";

const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/notes-bookmarks";

if (!MONGODB_URI) {
	throw new Error("Mongodb URI is not defined");
}

// Global is used here to maintain a cached connection across hot reloads in development. This prevents connections from growing exponentially during API Route usage
let cached = global.mongoose;
if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
	// Check if the connection is already established
	if (cached.conn) {
		return cached.conn;
	}
	// If not, check if a connection promise is already in progress
	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};
		// Create a new connection promise
		cached.promise = mongoose
			.connect(MONGODB_URI, opts)
			.then((mongoose) => {
				return mongoose;
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}
