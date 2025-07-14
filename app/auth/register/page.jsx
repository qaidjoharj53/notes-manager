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
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: formData.username,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem("token", data.token);
				router.push("/");
			} else {
				setError(data.message || "Registration failed");
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
						<UserPlus className="w-8 h-8 text-white" />
					</div>
					<CardTitle className="text-3xl font-bold text-gradient">
						Create Your Account
					</CardTitle>
					<CardDescription className="text-slate-600">
						Sign up to start managing your notes and bookmarks.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<Alert
								variant="destructive"
								className="animate-fade-in">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label
								htmlFor="username"
								className="text-slate-700">
								Username
							</Label>
							<Input
								id="username"
								name="username"
								type="text"
								required
								value={formData.username}
								onChange={handleChange}
								placeholder="Choose a username"
								className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="text-slate-700">
								Email
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
								className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-slate-700">
								Password
							</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								value={formData.password}
								onChange={handleChange}
								placeholder="Create a password"
								className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="text-slate-700">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder="Confirm your password"
								className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-11 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 button-hover shadow-medium"
							disabled={loading}>
							{loading ? "Creating account..." : "Create Account"}
						</Button>
					</form>

					<div className="mt-6 text-center text-sm text-slate-600">
						Already have an account?{" "}
						<Link
							href="/auth/login"
							className="text-blue-600 hover:underline font-medium">
							Sign In
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
