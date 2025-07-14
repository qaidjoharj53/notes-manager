"use client";

import { useEffect, useState } from "react";
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
import { BookOpen, Bookmark, Star, Search, Plus } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
	const [user, setUser] = useState(null);
	const [stats, setStats] = useState({
		notes: 0,
		bookmarks: 0,
		favorites: 0,
	});
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/auth/login");
			return;
		}

		// Fetch user info and stats
		fetchUserData(token);
	}, [router]);

	const fetchUserData = async (token) => {
		try {
			const response = await fetch("/api/auth/me", {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				const userData = await response.json();
				setUser(userData);

				// Fetch stats
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

					setStats({
						notes: notes.length,
						bookmarks: bookmarks.length,
						favorites: [...notes, ...bookmarks].filter(
							(item) => item.isFavorite
						).length,
					});
				}
			} else {
				localStorage.removeItem("token");
				router.push("/auth/login");
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			router.push("/auth/login");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/auth/login");
	};

	if (!user) {
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
						<div className="flex items-center">
							<Image
								src="/logo.png"
								alt="Logo"
								width={25}
								height={50}
							/>
							<h1 className="text-2xl font-bold text-gray-900 ml-2">
								Notes & Bookmarks
							</h1>
						</div>

						<div className="flex items-center space-x-4">
							<span className="text-gray-600">
								Welcome, {user.username}!
							</span>
							<Button onClick={handleLogout} variant="outline">
								Logout
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Notes
							</CardTitle>
							<BookOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.notes}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Bookmarks
							</CardTitle>
							<Bookmark className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.bookmarks}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Favorites
							</CardTitle>
							<Star className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.favorites}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<BookOpen className="mr-2 h-5 w-5" />
								Notes
							</CardTitle>
							<CardDescription>
								Create and manage your personal notes with tags
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex space-x-2">
								<Link href="/notes" className="flex-1">
									<Button
										className="w-full bg-transparent"
										variant="outline">
										<Search className="mr-2 h-4 w-4" />
										View All Notes
									</Button>
								</Link>
								<Link href="/notes/new">
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										New Note
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Bookmark className="mr-2 h-5 w-5" />
								Bookmarks
							</CardTitle>
							<CardDescription>
								Save and organize your favorite websites
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex space-x-2">
								<Link href="/bookmarks" className="flex-1">
									<Button
										className="w-full bg-transparent"
										variant="outline">
										<Search className="mr-2 h-4 w-4" />
										View All Bookmarks
									</Button>
								</Link>
								<Link href="/bookmarks/new">
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										New Bookmark
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
