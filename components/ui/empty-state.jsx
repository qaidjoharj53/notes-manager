import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	actionHref,
	className = "",
}) {
	return (
		<div className={`text-center py-16 px-6 ${className}`}>
			<div className="max-w-md mx-auto">
				<div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
					<Icon className="w-8 h-8 text-slate-400" />
				</div>
				<h3 className="text-xl font-semibold text-slate-900 mb-2">
					{title}
				</h3>
				<p className="text-slate-600 mb-8 leading-relaxed">
					{description}
				</p>
				{actionLabel && actionHref && (
					<Link href={actionHref}>
						<Button className="button-hover bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-medium">
							{actionLabel}
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}
