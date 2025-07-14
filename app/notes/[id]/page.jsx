"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Edit, Star, Trash2, Calendar } from "lucide-react";

export default function ViewNotePage() {
	const [note, setNote] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const params = useParams();

	useEffect(() => {
		fetchNote();
	}, []);

	const fetchNote = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/auth/login");
				return;
			}

			const response = await fetch(`/api/notes/${params.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				const noteData = await response.json();
				setNote(noteData);
			} else if (response.status === 401) {
				localStorage.removeItem("token");
				router.push("/auth/login");
			} else if (response.status === 404) {
				setError("Note not found");
			} else {
				setError("Failed to fetch note");
			}
		} catch (error) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const toggleFavorite = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`/api/notes/${params.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ isFavorite: !note.isFavorite }),
			});

			if (response.ok) {
				const updatedNote = await response.json();
				setNote(updatedNote);
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const deleteNote = async () => {
		if (!confirm("Are you sure you want to delete this note?")) return;

		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`/api/notes/${params.id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				router.push("/notes");
			}
		} catch (error) {
			console.error("Error deleting note:", error);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50">
				<header className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center py-4">
							<Link href="/notes">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Notes
								</Button>
							</Link>
							<h1 className="text-2xl font-bold text-gray-900 ml-4">
								Note Not Found
							</h1>
						</div>
					</div>
				</header>

				<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-4">
							<Link href="/notes">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Notes
								</Button>
							</Link>
							<h1 className="text-2xl font-bold text-gray-900">
								View Note
							</h1>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleFavorite}>
								<Star
									className={`h-4 w-4 ${
										note.isFavorite
											? "fill-yellow-400 text-yellow-400"
											: "text-gray-400"
									}`}
								/>
								{note.isFavorite ? "Unfavorite" : "Favorite"}
							</Button>
							<Link href={`/notes/${note._id}/edit`}>
								<Button variant="outline" size="sm">
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							</Link>
							<Button
								variant="outline"
								size="sm"
								onClick={deleteNote}>
								<Trash2 className="h-4 w-4 mr-2 text-red-500" />
								Delete
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Card>
					<CardHeader>
						<div className="flex justify-between items-start">
							<CardTitle className="text-3xl font-bold text-gray-900 mb-4">
								{note.title}
							</CardTitle>
							{note.isFavorite && (
								<Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
							)}
						</div>

						<div className="flex items-center space-x-4 text-sm text-gray-500">
							<div className="flex items-center">
								<Calendar className="h-4 w-4 mr-1" />
								Created:{" "}
								{new Date(note.createdAt).toLocaleDateString(
									"en-US",
									{
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									}
								)}
							</div>
							{note.updatedAt !== note.createdAt && (
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-1" />
									Updated:{" "}
									{new Date(
										note.updatedAt
									).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							)}
						</div>

						{note.tags && note.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-4">
								{note.tags.map((tag) => (
									<Badge key={tag} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
						)}
					</CardHeader>

					<CardContent>
						<div className="prose max-w-none">
							<div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
								{note.content}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<div className="mt-6 flex justify-center space-x-4">
					<Link href={`/notes/${note._id}/edit`}>
						<Button>
							<Edit className="h-4 w-4 mr-2" />
							Edit Note
						</Button>
					</Link>
					<Link href="/notes/new">
						<Button variant="outline">Create New Note</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
