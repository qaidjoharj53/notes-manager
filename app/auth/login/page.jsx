"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("token", data.token);
				router.push("/");
			} else {
				setError(data.message || "Login failed");
			}
		} catch (error) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md glass-effect shadow-large border-0 animate-fade-in">
				<CardHeader className="space-y-1 text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-medium">
						<Lock className="w-8 h-8 text-white" />
					</div>
					<CardTitle className="text-3xl font-bold text-gradient">
						Welcome Back!
					</CardTitle>
					<CardDescription className="text-slate-600">
						Sign in to access your personal notes and bookmarks.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label
								htmlFor="username"
								className="text-slate-700">
								Username or Email
							</Label>
							<Input
								id="username"
								name="username"
								type="text"
								required
								value={formData.username}
								onChange={handleChange}
								placeholder="Enter your username or email"
								className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-slate-700">
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									required
									value={formData.password}
									onChange={handleChange}
									placeholder="Enter your password"
									className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 pr-10"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<Alert
								variant="destructive"
								className="animate-fade-in">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button
							type="submit"
							className="w-full h-11 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 button-hover shadow-medium"
							disabled={loading}>
							{loading ? "Signing in..." : "Sign In"}
						</Button>
					</form>

					<div className="mt-6 text-center text-sm text-slate-600">
						{"Don't have an account? "}
						<Link
							href="/auth/register"
							className="text-blue-600 hover:underline font-medium">
							Sign Up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
