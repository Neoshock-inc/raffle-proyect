export default function RaffleCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                </div>
                <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                    </div>
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14" />
                    </div>
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>
                </div>
                <div className="mb-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
