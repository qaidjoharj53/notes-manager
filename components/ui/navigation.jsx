"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Home,
	BookOpen,
	Bookmark,
	Plus,
	Menu,
	X,
	Heart,
	LogOut,
} from "lucide-react";
import Image from "next/image";

export function Navigation({ user, onLogout }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	const navItems = [
		{ href: "/", label: "Dashboard", icon: Home },
		{ href: "/notes", label: "Notes", icon: BookOpen },
		{ href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
		{ href: "/favorites", label: "Favorites", icon: Heart },
	];

	const quickActions = [
		{
			href: "/notes/new",
			label: "New Note",
			icon: Plus,
			variant: "default",
		},
		{
			href: "/bookmarks/new",
			label: "New Bookmark",
			icon: Plus,
			variant: "outline",
		},
	];

	const isActive = (href) => {
		if (href === "/") return pathname === "/";
		return pathname.startsWith(href);
	};

	return (
		<>
			{/* Desktop Navigation */}
			<nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-6 w-full">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center space-x-3 group">
							<Image
								src="/logo.png"
								alt="Logo"
								width={25}
								height={40}
							/>
							<span className="text-xl font-bold text-gradient">
								NotesKeeper
							</span>
						</Link>

						{/* Main Navigation */}
						<div className="flex items-center space-x-1">
							{navItems.map((item) => (
								<Link key={item.href} href={item.href}>
									<Button
										variant={
											isActive(item.href)
												? "default"
												: "ghost"
										}
										size="sm"
										className={`flex items-center space-x-2 transition-all duration-200 ${
											isActive(item.href)
												? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-medium"
												: "hover:bg-slate-100 hover:scale-105"
										}`}>
										<item.icon className="w-4 h-4" />
										<span className="hidden sm:inline">
											{item.label}
										</span>
									</Button>
								</Link>
							))}
						</div>

						{/* Quick Actions & User Menu */}
						<div className="flex items-center">
							{quickActions.map((action) => (
								<Link key={action.href} href={action.href}>
									<Button
										variant={action.variant}
										size="sm"
										className="button-hover hidden sm:flex items-center mr-2">
										<action.icon className="w-4 h-4" />
										<span>{action.label}</span>
									</Button>
								</Link>
							))}

							{user && (
								<div className="flex items-center space-x-3 pl-1 border-l border-slate-200">
									<Button
										variant="ghost"
										size="sm"
										onClick={onLogout}
										className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200">
										<LogOut className="w-4 h-4" />
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Navigation */}
			<nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
				<div className="px-4">
					<div className="flex items-center justify-between h-16">
						<Link href="/" className="flex items-center space-x-2">
							<Image
								src="/logo.png"
								alt="Logo"
								width={25}
								height={40}
							/>
							<span className="text-lg font-bold text-gradient">
								NotesKeeper
							</span>
						</Link>

						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								setIsMobileMenuOpen(!isMobileMenuOpen)
							}
							className="button-hover">
							{isMobileMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="absolute top-16 left-0 right-0 bg-white shadow-md border-b border-slate-200 animate-fade-in">
						<div className="px-4 py-4 space-y-3">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}>
									<Button
										variant={
											isActive(item.href)
												? "default"
												: "ghost"
										}
										size="sm"
										className={`w-full justify-start space-x-3 ${
											isActive(item.href)
												? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
												: ""
										}`}>
										<item.icon className="w-4 h-4" />
										<span>{item.label}</span>
									</Button>
								</Link>
							))}

							<div className="flex flex-col border-t border-slate-200 pt-3 space-y-2">
								{quickActions.map((action) => (
									<Link
										key={action.href}
										href={action.href}
										onClick={() =>
											setIsMobileMenuOpen(false)
										}>
										<Button
											variant={action.variant}
											size="sm"
											className="w-full justify-start space-x-3">
											<action.icon className="w-4 h-4" />
											<span>{action.label}</span>
										</Button>
									</Link>
								))}
							</div>

							{user && (
								<div className="border-t border-slate-200 pt-3">
									<div className="flex items-center justify-between">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												onLogout();
												setIsMobileMenuOpen(false);
											}}
											className="text-slate-600 hover:text-red-600 hover:bg-red-50">
											<LogOut className="w-4 h-4" />
											Logout
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</nav>

			{/* Spacer for fixed navigation */}
			<div className="h-16" />
		</>
	);
}
