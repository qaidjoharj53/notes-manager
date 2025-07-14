"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation"; // Import Navigation
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, X, BookOpen } from "lucide-react";

export default function NewNotePage() {
	const [user, setUser] = useState(null); // Added user state for Navigation
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		tags: [],
	});
	const [tagInput, setTagInput] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	// Fetch user for Navigation component
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/auth/login");
			return;
		}
		fetchUser(token);
	}, [router]);

	const fetchUser = async (token) => {
		try {
			const response = await fetch("/api/auth/me", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const userData = await response.json();
				setUser(userData);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/auth/login");
				return;
			}

			const response = await fetch("/api/notes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				router.push("/notes");
			} else if (response.status === 401) {
				localStorage.removeItem("token");
				router.push("/auth/login");
			} else {
				const data = await response.json();
				setError(data.message || "Failed to create note");
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

	const addTag = (e) => {
		e.preventDefault();
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, tagInput.trim()],
			});
			setTagInput("");
		}
	};

	const removeTag = (tagToRemove) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/auth/login");
	};

	return (
		<>
			<Navigation user={user} onLogout={handleLogout} />
			<div className="min-h-screen bg-slate-50 shadow-inner">
				<main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="flex items-center mb-2 animate-fade-in">
						<Link href="/notes">
							<Button
								variant="ghost"
								size="sm"
								className="button-hover">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Notes
							</Button>
						</Link>
					</div>

					<Card className="glass-effect shadow-large border-0 animate-scale-in">
						<CardHeader>
							<CardTitle className="text-2xl font-bold text-gradient flex items-center">
								<BookOpen className="mr-3 h-6 w-6 text-blue-600" />
								Create New Note
							</CardTitle>
							<CardDescription className="text-slate-600">
								Start capturing your thoughts and ideas.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								{error && (
									<Alert
										variant="destructive"
										className="animate-fade-in">
										<AlertDescription>
											{error}
										</AlertDescription>
									</Alert>
								)}

								<div className="space-y-2">
									<Label
										htmlFor="title"
										className="text-slate-700">
										Title
									</Label>
									<Input
										id="title"
										name="title"
										type="text"
										required
										value={formData.title}
										onChange={handleChange}
										placeholder="Enter note title"
										className="h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="content"
										className="text-slate-700">
										Content
									</Label>
									<Textarea
										id="content"
										name="content"
										required
										value={formData.content}
										onChange={handleChange}
										placeholder="Write your note content here..."
										rows={10}
										className="text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="tags"
										className="text-slate-700">
										Tags
									</Label>
									<div className="flex space-x-2 items-center">
										<Input
											id="tags"
											type="text"
											value={tagInput}
											onChange={(e) =>
												setTagInput(e.target.value)
											}
											placeholder="Add a tag"
											onKeyPress={(e) =>
												e.key === "Enter" && addTag(e)
											}
											className="flex-1 h-11 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
										/>
										<Button
											type="button"
											onClick={addTag}
											variant="outline"
											className="button-hover bg-transparent">
											Add Tag
										</Button>
									</div>
									{formData.tags.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{formData.tags.map((tag) => (
												<Badge
													key={tag}
													variant="secondary"
													className="flex items-center gap-1 bg-slate-100 text-slate-600">
													{tag}
													<X
														className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
														onClick={() =>
															removeTag(tag)
														}
													/>
												</Badge>
											))}
										</div>
									)}
								</div>

								<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
									<Button
										type="submit"
										disabled={loading}
										className="w-full sm:w-auto h-11 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-hover shadow-medium">
										{loading
											? "Creating..."
											: "Create Note"}
									</Button>
									<Link
										href="/notes"
										className="w-full sm:w-auto">
										<Button
											type="button"
											variant="outline"
											className="w-full button-hover bg-transparent h-11 text-lg">
											Cancel
										</Button>
									</Link>
								</div>
							</form>
						</CardContent>
					</Card>
				</main>
			</div>
		</>
	);
}
