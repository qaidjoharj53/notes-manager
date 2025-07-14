import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
	try {
		const { username, password } = await request.json();

		// Validation
		if (!username || !password) {
			return NextResponse.json(
				{ message: "Username/Email and password are required" },
				{ status: 400 }
			);
		}

		await connectDB();

		// Find user by username or email
		const user = await User.findOne({
			$or: [{ username }, { email: username }],
		});
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 401 }
			);
		}

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ message: "Incorrect password" },
				{ status: 401 }
			);
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || "fallback-secret",
			{ expiresIn: "7d" }
		);

		return NextResponse.json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
