"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	ArrowLeft,
	Edit,
	Star,
	Trash2,
	Calendar,
	Clock,
	BookOpen,
} from "lucide-react";

export default function ViewNotePage() {
	const [user, setUser] = useState(null);
	const [note, setNote] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const params = useParams();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/auth/login");
			return;
		}
		fetchUser(token);
		fetchNote(token);
	}, [router, params.id]);

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

	const fetchNote = async (token) => {
		try {
			const response = await fetch(`/api/notes/${params.id}`, {
				headers: {
					Authorization: `Bearer ${
						token || localStorage.getItem("token")
					}`,
				},
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

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/auth/login");
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<Navigation user={user} onLogout={handleLogout} />
				<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="animate-pulse space-y-6">
						<div className="h-8 bg-slate-200 rounded w-1/3"></div>
						<div className="bg-white rounded-xl p-8 shadow-soft">
							<div className="space-y-4">
								<div className="h-8 bg-slate-200 rounded w-3/4"></div>
								<div className="space-y-2">
									<div className="h-4 bg-slate-200 rounded"></div>
									<div className="h-4 bg-slate-200 rounded w-5/6"></div>
									<div className="h-4 bg-slate-200 rounded w-4/5"></div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen">
				<Navigation user={user} onLogout={handleLogout} />
				<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
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
					<Alert variant="destructive" className="animate-fade-in">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</main>
			</div>
		);
	}

	return (
		<>
			<Navigation user={user} onLogout={handleLogout} />
			<div className="min-h-screen bg-slate-50 shadow-inner">
				<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<Link href="/notes">
						<Button
							variant="ghost"
							size="sm"
							className="button-hover">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Notes
						</Button>
					</Link>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
						<div className="flex items-center space-x-4">
							<div>
								<h1 className="text-2xl font-bold text-slate-900">
									Note Details
								</h1>
								<p className="text-slate-600">
									View and manage your note
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-2 mt-4 sm:mt-0">
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleFavorite}
								className="button-hover">
								<Star
									className={`h-4 w-4 mr-2 ${
										note.isFavorite
											? "fill-yellow-400 text-yellow-400"
											: "text-slate-400"
									}`}
								/>
								{note.isFavorite ? "Unfavorite" : "Favorite"}
							</Button>
							<Link href={`/notes/${note._id}/edit`}>
								<Button
									variant="outline"
									size="sm"
									className="button-hover bg-transparent">
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							</Link>
							<Button
								variant="outline"
								size="sm"
								onClick={deleteNote}
								className="button-hover text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent">
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</Button>
						</div>
					</div>

					{/* Note Content */}
					<Card className="glass-effect shadow-large border-0 animate-scale-in">
						<CardHeader className="pb-6">
							<div className="flex justify-between items-start mb-4">
								<CardTitle className="text-3xl font-bold text-slate-900 leading-tight pr-4">
									{note.title}
								</CardTitle>
								{note.isFavorite && (
									<div className="flex-shrink-0">
										<div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
											<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
										</div>
									</div>
								)}
							</div>

							{/* Metadata */}
							<div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-6">
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									<span>
										Created{" "}
										{new Date(
											note.createdAt
										).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
								{note.updatedAt !== note.createdAt && (
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-2" />
										<span>
											Updated{" "}
											{new Date(
												note.updatedAt
											).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</span>
									</div>
								)}
							</div>

							{/* Tags */}
							{note.tags && note.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{note.tags.map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-200">
											{tag}
										</Badge>
									))}
								</div>
							)}
						</CardHeader>

						<CardContent>
							<div className="prose max-w-none">
								<div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base font-normal">
									{note.content}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<div
						className="mt-8 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in"
						style={{ animationDelay: "200ms" }}>
						<Link href={`/notes/${note._id}/edit`}>
							<Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-hover shadow-medium">
								<Edit className="h-4 w-4 mr-2" />
								Edit Note
							</Button>
						</Link>
						<Link href="/notes/new">
							<Button
								variant="outline"
								className="w-full sm:w-auto button-hover bg-transparent">
								<BookOpen className="h-4 w-4 mr-2" />
								Create New Note
							</Button>
						</Link>
					</div>
				</main>
			</div>
		</>
	);
}
