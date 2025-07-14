export function LoadingSkeleton() {
	return (
		<div className="animate-pulse space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-xl p-6 shadow-soft">
						<div className="flex items-center justify-between mb-4">
							<div className="h-4 bg-slate-200 rounded w-20"></div>
							<div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
						</div>
						<div className="h-8 bg-slate-200 rounded w-16"></div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(6)].map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-xl p-6 shadow-soft">
						<div className="space-y-3">
							<div className="h-6 bg-slate-200 rounded w-3/4"></div>
							<div className="space-y-2">
								<div className="h-4 bg-slate-200 rounded"></div>
								<div className="h-4 bg-slate-200 rounded w-5/6"></div>
							</div>
							<div className="flex space-x-2 pt-2">
								<div className="h-6 bg-slate-200 rounded-full w-16"></div>
								<div className="h-6 bg-slate-200 rounded-full w-20"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
