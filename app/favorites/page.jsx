"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
	Star,
	Edit,
	Trash2,
	ExternalLink,
	Calendar,
	Heart,
	ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FavoritesPage() {
	const [user, setUser] = useState(null);
	const [favoriteItems, setFavoriteItems] = useState({
		notes: [],
		bookmarks: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/auth/login");
			return;
		}
		fetchUser(token);
		fetchFavorites(token);
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

	const fetchFavorites = async (token) => {
		try {
			const [notesRes, bookmarksRes] = await Promise.all([
				fetch("/api/notes", {
					headers: { Authorization: `Bearer ${token}` },
				}),
				fetch("/api/bookmarks", {
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);

			if (notesRes.ok && bookmarksRes.ok) {
				const notes = await notesRes.json();
				const bookmarks = await bookmarksRes.json();

				const favoritedNotes = notes
					.filter((note) => note.isFavorite)
					.map((note) => ({ ...note, type: "note" }))
					.sort(
						(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
					);
				const favoritedBookmarks = bookmarks
					.filter((bookmark) => bookmark.isFavorite)
					.map((bookmark) => ({ ...bookmark, type: "bookmark" }))
					.sort(
						(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
					);

				setFavoriteItems({
					notes: favoritedNotes,
					bookmarks: favoritedBookmarks,
				});
			} else if (notesRes.status === 401 || bookmarksRes.status === 401) {
				localStorage.removeItem("token");
				router.push("/auth/login");
			} else {
				setError("Failed to fetch favorite items");
			}
		} catch (error) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const toggleFavorite = async (itemId, itemType, currentStatus) => {
		try {
			const token = localStorage.getItem("token");
			const endpoint =
				itemType === "note"
					? `/api/notes/${itemId}`
					: `/api/bookmarks/${itemId}`;
			const response = await fetch(endpoint, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ isFavorite: !currentStatus }),
			});

			if (response.ok) {
				fetchFavorites(token); // Re-fetch to update the list
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const deleteItem = async (itemId, itemType) => {
		if (!confirm(`Are you sure you want to delete this ${itemType}?`))
			return;

		try {
			const token = localStorage.getItem("token");
			const endpoint =
				itemType === "note"
					? `/api/notes/${itemId}`
					: `/api/bookmarks/${itemId}`;
			const response = await fetch(endpoint, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				fetchFavorites(token); // Re-fetch to update the list
			}
		} catch (error) {
			console.error(`Error deleting ${itemType}:`, error);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/auth/login");
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<Navigation user={user} onLogout={handleLogout} />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<LoadingSkeleton />
				</main>
			</div>
		);
	}

	return (
		<>
			<Navigation user={user} onLogout={handleLogout} />
			<div className="min-h-screen bg-slate-50 shadow-inner">
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<Link href="/">
						<Button
							variant="ghost"
							size="sm"
							className="button-hover">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Dashboard
						</Button>
					</Link>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
						<div>
							<h1 className="text-3xl font-bold text-gradient mb-2">
								My Favorites
							</h1>
							<p className="text-slate-600">
								{favoriteItems.notes.length +
									favoriteItems.bookmarks.length}{" "}
								{favoriteItems.notes.length +
									favoriteItems.bookmarks.length ===
								1
									? "item"
									: "items"}{" "}
								marked as favorite
							</p>
						</div>
					</div>

					{error && (
						<Alert
							variant="destructive"
							className="mb-6 animate-fade-in">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Favorites Grid */}
					{favoriteItems.notes.length === 0 &&
					favoriteItems.bookmarks.length === 0 ? (
						<EmptyState
							icon={Heart}
							title="No favorites yet"
							description="Mark notes or bookmarks as favorite to see them here."
							className="animate-fade-in"
						/>
					) : (
						<div className="space-y-8">
							{/* Favorite Notes Section */}
							{favoriteItems.notes.length > 0 && (
								<div>
									<h2 className="text-2xl font-semibold mb-4 text-slate-700">
										Notes ({favoriteItems.notes.length})
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{favoriteItems.notes.map(
											(item, index) => (
												<Card
													key={`note-${item._id}`}
													className="glass-effect shadow-soft border-0 card-hover animate-scale-in hover:shadow-lg transform hover:scale-105 transition-shadow-transform duration-300"
													style={{
														animationDelay: `${
															index * 50
														}ms`,
													}}>
													<CardHeader className="pb-3">
														<div className="flex justify-between items-start mb-2">
															<Link
																href={`/notes/${item._id}`}
																className="flex-1 min-w-0">
																<CardTitle className="text-lg line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors duration-200">
																	{item.title}
																</CardTitle>
															</Link>
															<div className="flex space-x-1 ml-2">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		toggleFavorite(
																			item._id,
																			item.type,
																			item.isFavorite
																		)
																	}
																	className="button-hover">
																	<Star
																		className={`h-4 w-4 transition-colors ${
																			item.isFavorite
																				? "fill-yellow-400 text-yellow-400"
																				: "text-slate-400 hover:text-yellow-400"
																		}`}
																	/>
																</Button>
																<Link
																	href={`/notes/${item._id}/edit`}>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="button-hover">
																		<Edit className="h-4 w-4 text-slate-400 hover:text-blue-500" />
																	</Button>
																</Link>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		deleteItem(
																			item._id,
																			item.type
																		)
																	}
																	className="button-hover">
																	<Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
																</Button>
															</div>
														</div>
														<CardDescription className="line-clamp-3 text-slate-600 leading-relaxed">
															{item.content}
														</CardDescription>
													</CardHeader>
													<CardContent className="pt-0">
														{item.tags &&
															item.tags.length >
																0 && (
																<div className="flex flex-wrap gap-1 mb-3">
																	{item.tags
																		.slice(
																			0,
																			3
																		)
																		.map(
																			(
																				tag
																			) => (
																				<Badge
																					key={
																						tag
																					}
																					variant="secondary"
																					className="text-xs bg-slate-100 text-slate-600">
																					{
																						tag
																					}
																				</Badge>
																			)
																		)}
																	{item.tags
																		.length >
																		3 && (
																		<Badge
																			variant="secondary"
																			className="text-xs bg-slate-100 text-slate-600">
																			+
																			{item
																				.tags
																				.length -
																				3}
																		</Badge>
																	)}
																</div>
															)}
														<div className="flex items-center text-xs text-slate-500">
															<Calendar className="w-3 h-3 mr-1" />
															{new Date(
																item.createdAt
															).toLocaleDateString(
																"en-US",
																{
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																}
															)}
														</div>
													</CardContent>
												</Card>
											)
										)}
									</div>
								</div>
							)}

							{/* Favorite Bookmarks Section */}
							{favoriteItems.bookmarks.length > 0 && (
								<div>
									<h2 className="text-2xl font-semibold mb-4 text-slate-700">
										Bookmarks (
										{favoriteItems.bookmarks.length})
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{favoriteItems.bookmarks.map(
											(item, index) => (
												<Card
													key={`bookmark-${item._id}`}
													className="glass-effect shadow-soft border-0 card-hover animate-scale-in"
													style={{
														animationDelay: `${
															index * 50
														}ms`,
													}}>
													<CardHeader className="pb-3">
														<div className="flex justify-between items-start mb-2">
															<a
																href={item.url}
																target="_blank"
																rel="noopener noreferrer"
																className="flex-1 min-w-0">
																<CardTitle className="text-lg line-clamp-2 hover:text-purple-600 cursor-pointer transition-colors duration-200">
																	{item.title}
																</CardTitle>
															</a>
															<div className="flex space-x-1 ml-2">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		toggleFavorite(
																			item._id,
																			item.type,
																			item.isFavorite
																		)
																	}
																	className="button-hover">
																	<Star
																		className={`h-4 w-4 transition-colors ${
																			item.isFavorite
																				? "fill-yellow-400 text-yellow-400"
																				: "text-slate-400 hover:text-yellow-400"
																		}`}
																	/>
																</Button>
																<a
																	href={
																		item.url
																	}
																	target="_blank"
																	rel="noopener noreferrer">
																	<Button
																		variant="ghost"
																		size="sm"
																		className="button-hover">
																		<ExternalLink className="h-4 w-4 text-slate-400 hover:text-purple-500" />
																	</Button>
																</a>
																<Link
																	href={`/bookmarks/${item._id}/edit`}>
																	<Button
																		variant="ghost"
																		size="sm"
																		className="button-hover">
																		<Edit className="h-4 w-4 text-slate-400 hover:text-blue-500" />
																	</Button>
																</Link>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() =>
																		deleteItem(
																			item._id,
																			item.type
																		)
																	}
																	className="button-hover">
																	<Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
																</Button>
															</div>
														</div>
														<CardDescription className="line-clamp-3 text-slate-600 leading-relaxed">
															{item.description ||
																item.url}
														</CardDescription>
													</CardHeader>
													<CardContent className="pt-0">
														{item.tags &&
															item.tags.length >
																0 && (
																<div className="flex flex-wrap gap-1 mb-3">
																	{item.tags
																		.slice(
																			0,
																			3
																		)
																		.map(
																			(
																				tag
																			) => (
																				<Badge
																					key={
																						tag
																					}
																					variant="secondary"
																					className="text-xs bg-slate-100 text-slate-600">
																					{
																						tag
																					}
																				</Badge>
																			)
																		)}
																	{item.tags
																		.length >
																		3 && (
																		<Badge
																			variant="secondary"
																			className="text-xs bg-slate-100 text-slate-600">
																			+
																			{item
																				.tags
																				.length -
																				3}
																		</Badge>
																	)}
																</div>
															)}
														<div className="flex items-center text-xs text-slate-500">
															<Calendar className="w-3 h-3 mr-1" />
															{new Date(
																item.createdAt
															).toLocaleDateString(
																"en-US",
																{
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																}
															)}
														</div>
													</CardContent>
												</Card>
											)
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</main>
			</div>
		</>
	);
}
