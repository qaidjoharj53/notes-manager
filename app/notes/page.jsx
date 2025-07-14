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
import { Search, Plus, Star, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NotesPage() {
	const [notes, setNotes] = useState([]);
	const [filteredNotes, setFilteredNotes] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTags, setSelectedTags] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		fetchNotes();
	}, []);

	useEffect(() => {
		filterNotes();
	}, [notes, searchTerm, selectedTags]);

	const fetchNotes = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/auth/login");
				return;
			}

			const response = await fetch("/api/notes", {
				headers: { Authorization: `Bearer ${token}` },
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

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-4">
							<Link href="/">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back
								</Button>
							</Link>
							<h1 className="text-2xl font-bold text-gray-900">
								My Notes
							</h1>
						</div>
						<Link href="/notes/new">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New Note
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{error && (
					<Alert variant="destructive" className="mb-6">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Search and Filters */}
				<div className="mb-6 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search notes..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{allTags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							<span className="text-sm font-medium text-gray-700">
								Filter by tags:
							</span>
							{allTags.map((tag) => (
								<Badge
									key={tag}
									variant={
										selectedTags.includes(tag)
											? "default"
											: "outline"
									}
									className="cursor-pointer"
									onClick={() => toggleTag(tag)}>
									{tag}
								</Badge>
							))}
						</div>
					)}
				</div>

				{/* Notes Grid */}
				{filteredNotes.length === 0 ? (
					<Card>
						<CardContent className="text-center py-12">
							<p className="text-gray-500 mb-4">
								{notes.length === 0
									? "No notes yet."
									: "No notes match your search."}
							</p>
							<Link href="/notes/new">
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Create your first note
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredNotes.map((note) => (
							<Card
								key={note._id}
								className="hover:shadow-lg transition-shadow">
								<CardHeader>
									<div className="flex justify-between items-start">
										<Link href={`/notes/${note._id}`}>
											<CardTitle className="text-lg line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
												{note.title}
											</CardTitle>
										</Link>
										<div className="flex space-x-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													toggleFavorite(
														note._id,
														note.isFavorite
													)
												}>
												<Star
													className={`h-4 w-4 ${
														note.isFavorite
															? "fill-yellow-400 text-yellow-400"
															: "text-gray-400"
													}`}
												/>
											</Button>
											<Link
												href={`/notes/${note._id}/edit`}>
												<Button
													variant="ghost"
													size="sm">
													<Edit className="h-4 w-4" />
												</Button>
											</Link>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													deleteNote(note._id)
												}>
												<Trash2 className="h-4 w-4 text-red-500" />
											</Button>
										</div>
									</div>
									<CardDescription className="line-clamp-3">
										{note.content}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{note.tags && note.tags.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-2">
											{note.tags.map((tag) => (
												<Badge
													key={tag}
													variant="secondary"
													className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
									)}
									<p className="text-xs text-gray-500">
										{new Date(
											note.createdAt
										).toLocaleDateString()}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
