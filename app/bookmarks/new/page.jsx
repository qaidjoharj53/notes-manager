"use client";

import { CardDescription } from "@/components/ui/card";

import { useEffect } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, X, LinkIcon, Bookmark } from "lucide-react";

export default function NewBookmarkPage() {
	const [user, setUser] = useState(null); // Added user state for Navigation
	const [formData, setFormData] = useState({
		title: "",
		url: "",
		description: "",
		tags: [],
	});
	const [tagInput, setTagInput] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [fetchingTitle, setFetchingTitle] = useState(false);
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

			const response = await fetch("/api/bookmarks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				router.push("/bookmarks");
			} else if (response.status === 401) {
				localStorage.removeItem("token");
				router.push("/auth/login");
			} else {
				const data = await response.json();
				setError(data.message || "Failed to create bookmark");
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

	const fetchTitle = async () => {
		if (!formData.url || formData.title) return;

		setFetchingTitle(true);
		try {
			const response = await fetch("/api/fetch-title", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url: formData.url }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.title) {
					setFormData((prev) => ({ ...prev, title: data.title }));
				}
			}
		} catch (error) {
			console.error("Error fetching title:", error);
		} finally {
			setFetchingTitle(false);
		}
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
						<Link href="/bookmarks">
							<Button
								variant="ghost"
								size="sm"
								className="button-hover">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Bookmarks
							</Button>
						</Link>
					</div>

					<Card className="glass-effect shadow-large border-0 animate-scale-in">
						<CardHeader>
							<CardTitle className="text-2xl font-bold text-gradient flex items-center">
								<Bookmark className="mr-3 h-6 w-6 text-purple-600" />
								Create New Bookmark
							</CardTitle>
							<CardDescription className="text-slate-600">
								Add a new website or resource to your
								collection.
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
										htmlFor="url"
										className="text-slate-700">
										URL
									</Label>
									<div className="flex flex-col sm:items-center sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
										<Input
											id="url"
											name="url"
											type="url"
											required
											value={formData.url}
											onChange={handleChange}
											placeholder="https://example.com"
											className="flex-1 h-11 text-base border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
										/>
										<Button
											type="button"
											onClick={fetchTitle}
											disabled={
												fetchingTitle || !formData.url
											}
											variant="outline"
											className="button-hover bg-transparent">
											<LinkIcon className="h-4 w-4 mr-2" />
											{fetchingTitle
												? "Fetching..."
												: "Fetch Title"}
										</Button>
									</div>
								</div>

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
										placeholder="Enter bookmark title"
										className="h-11 text-base border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="description"
										className="text-slate-700">
										Description (Optional)
									</Label>
									<Textarea
										id="description"
										name="description"
										value={formData.description}
										onChange={handleChange}
										placeholder="Add a description for this bookmark..."
										rows={4}
										className="text-base border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
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
											className="flex-1 h-11 text-base border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
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
										className="w-full sm:w-auto h-11 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 button-hover shadow-medium">
										{loading
											? "Creating..."
											: "Create Bookmark"}
									</Button>
									<Link
										href="/bookmarks"
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
