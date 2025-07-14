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
import { Navigation } from "@/components/ui/navigation";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
	BookOpen,
	Bookmark,
	Star,
	Search,
	Plus,
	TrendingUp,
	Clock,
	Heart,
} from "lucide-react";

export default function HomePage() {
	const [user, setUser] = useState(null);
	const [stats, setStats] = useState({
		notes: 0,
		bookmarks: 0,
		favorites: 0,
	});
	const [recentItems, setRecentItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/auth/login");
			return;
		}

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

				// Fetch stats and recent items
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

					// Get recent items (last 5)
					const allItems = [
						...notes.map((note) => ({ ...note, type: "note" })),
						...bookmarks.map((bookmark) => ({
							...bookmark,
							type: "bookmark",
						})),
					]
						.sort(
							(a, b) =>
								new Date(b.createdAt) - new Date(a.createdAt)
						)
						.slice(0, 5);

					setRecentItems(allItems);
				}
			} else {
				localStorage.removeItem("token");
				router.push("/auth/login");
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			router.push("/auth/login");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/auth/login");
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<Navigation user={null} onLogout={handleLogout} />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<LoadingSkeleton />
				</main>
			</div>
		);
	}

	const statCards = [
		{
			title: "Total Notes",
			value: stats.notes,
			icon: BookOpen,
			color: "from-blue-500 to-blue-600",
			bgColor: "from-blue-50 to-blue-100",
			href: "/notes",
		},
		{
			title: "Total Bookmarks",
			value: stats.bookmarks,
			icon: Bookmark,
			color: "from-purple-500 to-purple-600",
			bgColor: "from-purple-50 to-purple-100",
			href: "/bookmarks",
		},
		{
			title: "Favorites",
			value: stats.favorites,
			icon: Heart,
			color: "from-pink-500 to-pink-600",
			bgColor: "from-pink-50 to-pink-100",
			href: "/favorites",
		},
	];

	return (
		<div className="min-h-screen">
			<Navigation user={user} onLogout={handleLogout} />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="mb-12 animate-fade-in">
					<div className="text-center mb-8">
						<h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
							Welcome back, {user?.username}!
						</h1>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
							Organize your thoughts and discoveries in one
							beautiful place
						</p>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{statCards.map((stat, index) => (
						<Link key={stat.title} href={stat.href}>
							<Card
								className={`card-hover cursor-pointer bg-gradient-to-br ${stat.bgColor} border-0 shadow-soft animate-fade-in hover:shadow-lg transition-shadow duration-300`}
								style={{ animationDelay: `${index * 100}ms` }}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
									<CardTitle className="text-sm font-medium text-slate-700">
										{stat.title}
									</CardTitle>
									<div
										className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-medium`}>
										<stat.icon className="h-5 w-5 text-white" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-slate-900 mb-1">
										{stat.value}
									</div>
									<div className="flex items-center text-sm text-slate-600">
										<TrendingUp className="w-4 h-4 mr-1" />
										<span>View all</span>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
					<Card className="glass-effect shadow-medium border-0 animate-slide-in hover:transform hover:scale-105 transition-transform duration-300">
						<CardHeader>
							<CardTitle className="flex items-center text-xl">
								<BookOpen className="mr-3 h-6 w-6 text-blue-600" />
								Notes
							</CardTitle>
							<CardDescription className="text-slate-600">
								Capture your thoughts and ideas with rich
								formatting
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col sm:flex-row gap-3">
								<Link href="/notes" className="flex-1">
									<Button
										variant="outline"
										className="w-full justify-start button-hover bg-transparent">
										<Search className="mr-2 h-4 w-4" />
										Browse Notes
									</Button>
								</Link>
								<Link href="/notes/new">
									<Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 button-hover shadow-medium">
										<Plus className="mr-2 h-4 w-4" />
										New Note
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					<Card
						className="glass-effect shadow-medium border-0 animate-slide-in hover:transform hover:scale-105 transition-transform duration-300"
						style={{ animationDelay: "100ms" }}>
						<CardHeader>
							<CardTitle className="flex items-center text-xl">
								<Bookmark className="mr-3 h-6 w-6 text-purple-600" />
								Bookmarks
							</CardTitle>
							<CardDescription className="text-slate-600">
								Save and organize your favorite websites and
								resources
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col sm:flex-row gap-3">
								<Link href="/bookmarks" className="flex-1">
									<Button
										variant="outline"
										className="w-full justify-start button-hover bg-transparent">
										<Search className="mr-2 h-4 w-4" />
										Browse Bookmarks
									</Button>
								</Link>
								<Link href="/bookmarks/new">
									<Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 button-hover shadow-medium">
										<Plus className="mr-2 h-4 w-4" />
										New Bookmark
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recent Activity */}
				{recentItems.length > 0 && (
					<Card
						className="glass-effect shadow-medium border-0 animate-fade-in"
						style={{ animationDelay: "200ms" }}>
						<CardHeader>
							<CardTitle className="flex items-center text-xl">
								<Clock className="mr-3 h-6 w-6 text-slate-600" />
								Recent Activity
							</CardTitle>
							<CardDescription className="text-slate-600">
								Your latest notes and bookmarks
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentItems.map((item, index) => (
									<Link
										key={`${item.type}-${item._id}`}
										href={
											item.type === "note"
												? `/notes/${item._id}`
												: item.url
										}
										target={
											item.type === "bookmark"
												? "_blank"
												: "_self"
										}>
										<div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200 group">
											<div
												className={`w-10 h-10 rounded-lg flex items-center justify-center ${
													item.type === "note"
														? "bg-gradient-to-br from-blue-100 to-blue-200"
														: "bg-gradient-to-br from-purple-100 to-purple-200"
												}`}>
												{item.type === "note" ? (
													<BookOpen className="w-5 h-5 text-blue-600" />
												) : (
													<Bookmark className="w-5 h-5 text-purple-600" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center space-x-2">
													<h4 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
														{item.title}
													</h4>
													{item.isFavorite && (
														<Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
													)}
												</div>
												<p className="text-sm text-slate-500 truncate">
													{item.type === "note"
														? item.content
														: item.description ||
														  item.url}
												</p>
											</div>
											<div className="text-xs text-slate-400 flex-shrink-0">
												{new Date(
													item.createdAt
												).toLocaleDateString()}
											</div>
										</div>
									</Link>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
