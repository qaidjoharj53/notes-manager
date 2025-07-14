"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	Search,
	Plus,
	Star,
	Edit,
	Trash2,
	BookOpen,
	Filter,
	Calendar,
	ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NotesPage() {
	const [user, setUser] = useState(null);
	const [notes, setNotes] = useState([]);
	const [filteredNotes, setFilteredNotes] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTags, setSelectedTags] = useState([]);
	const [allTags, setAllTags] = useState([]);
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
		fetchNotes(token);
	}, [router]);

	useEffect(() => {
		filterNotes();
	}, [notes, searchTerm, selectedTags]);

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

	const fetchNotes = async (token) => {
		try {
			const response = await fetch("/api/notes", {
				headers: {
					Authorization: `Bearer ${
						token || localStorage.getItem("token")
					}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setNotes(data);

				// Extract all unique tags
				const tags = [
					...new Set(data.flatMap((note) => note.tags || [])),
				];
				setAllTags(tags);
			} else if (response.status === 401) {
				localStorage.removeItem("token");
				router.push("/auth/login");
			} else {
				setError("Failed to fetch notes");
			}
		} catch (error) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const filterNotes = () => {
		let filtered = notes;

		if (searchTerm) {
			filtered = filtered.filter(
				(note) =>
					note.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					note.content
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			);
		}

		if (selectedTags.length > 0) {
			filtered = filtered.filter((note) =>
				selectedTags.every((tag) => note.tags?.includes(tag))
			);
		}

		setFilteredNotes(filtered);
	};

	const toggleFavorite = async (noteId, currentStatus) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`/api/notes/${noteId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ isFavorite: !currentStatus }),
			});

			if (response.ok) {
				fetchNotes();
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const deleteNote = async (noteId) => {
		if (!confirm("Are you sure you want to delete this note?")) return;

		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`/api/notes/${noteId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				fetchNotes();
			}
		} catch (error) {
			console.error("Error deleting note:", error);
		}
	};

	const toggleTag = (tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
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
			<div className="min-h-screen bg-slate-50 rounded-lg shadow-inner">
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<Link href="/">
						<Button
							variant="ghost"
							size="sm"
							className="button-hover mb-2">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Dashboard
						</Button>
					</Link>

					{error && (
						<Alert
							variant="destructive"
							className="mb-6 animate-fade-in">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Search and Filters */}
					<Card className="glass-effect shadow-soft border-0 mb-8 animate-slide-in">
						<CardContent className="p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
								<div className="flex items-center space-x-4">
									<div>
										<h1 className="text-3xl font-bold text-gradient mb-2">
											My Notes
										</h1>
										<p className="text-slate-600">
											{notes.length}{" "}
											{notes.length === 1
												? "note"
												: "notes"}{" "}
											in your collection
										</p>
									</div>
								</div>
								<Link href="/notes/new">
									<Button className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-hover shadow-medium">
										<Plus className="mr-2 h-4 w-4" />
										New Note
									</Button>
								</Link>
							</div>
							<div className="space-y-4">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
									<Input
										placeholder="Search your notes..."
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className="pl-11 h-12 text-base border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
									/>
								</div>

								{allTags.length > 0 && (
									<div className="space-y-3">
										<div className="flex items-center space-x-2">
											<Filter className="h-4 w-4 text-slate-500" />
											<span className="text-sm font-medium text-slate-700">
												Filter by tags:
											</span>
										</div>
										<div className="flex flex-wrap gap-2">
											{allTags.map((tag) => (
												<Badge
													key={tag}
													variant={
														selectedTags.includes(
															tag
														)
															? "default"
															: "outline"
													}
													className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
														selectedTags.includes(
															tag
														)
															? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-medium"
															: "hover:bg-slate-100"
													}`}
													onClick={() =>
														toggleTag(tag)
													}>
													{tag}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Notes Grid */}
					{filteredNotes.length === 0 ? (
						<EmptyState
							icon={BookOpen}
							title={
								notes.length === 0
									? "No notes yet"
									: "No notes match your search"
							}
							description={
								notes.length === 0
									? "Start capturing your thoughts and ideas by creating your first note."
									: "Try adjusting your search terms or filters to find what you're looking for."
							}
							actionLabel={
								notes.length === 0
									? "Create your first note"
									: undefined
							}
							actionHref={
								notes.length === 0 ? "/notes/new" : undefined
							}
							className="animate-fade-in"
						/>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredNotes.map((note, index) => (
								<Card
									key={note._id}
									className="glass-effect shadow-soft border-0 card-hover animate-scale-in hover:shadow-lg transform hover:scale-105 transition-shadow-transform duration-300"
									style={{
										animationDelay: `${index * 50}ms`,
									}}>
									<CardHeader className="pb-3">
										<div className="flex justify-between items-start mb-2">
											<Link
												href={`/notes/${note._id}`}
												className="flex-1 min-w-0">
												<CardTitle className="text-lg line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors duration-200">
													{note.title}
												</CardTitle>
											</Link>
											<div className="flex space-x-1 ml-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														toggleFavorite(
															note._id,
															note.isFavorite
														)
													}
													className="button-hover">
													<Star
														className={`h-4 w-4 transition-colors ${
															note.isFavorite
																? "fill-yellow-400 text-yellow-400"
																: "text-slate-400 hover:text-yellow-400"
														}`}
													/>
												</Button>
												<Link
													href={`/notes/${note._id}/edit`}>
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
														deleteNote(note._id)
													}
													className="button-hover">
													<Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
												</Button>
											</div>
										</div>
										<CardDescription className="line-clamp-3 text-slate-600 leading-relaxed">
											{note.content}
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										{note.tags && note.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mb-3">
												{note.tags
													.slice(0, 3)
													.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="text-xs bg-slate-100 text-slate-600">
															{tag}
														</Badge>
													))}
												{note.tags.length > 3 && (
													<Badge
														variant="secondary"
														className="text-xs bg-slate-100 text-slate-600">
														+{note.tags.length - 3}
													</Badge>
												)}
											</div>
										)}
										<div className="flex items-center text-xs text-slate-500">
											<Calendar className="w-3 h-3 mr-1" />
											{new Date(
												note.createdAt
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</main>
			</div>
		</>
	);
}
