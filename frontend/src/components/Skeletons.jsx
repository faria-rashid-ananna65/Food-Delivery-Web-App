const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-2 animate-pulse">
    <div className="w-20 h-20 rounded-full bg-gray-200" />
    <div className="h-3 bg-gray-200 rounded w-16" />
  </div>
);

export { CardSkeleton, CategorySkeleton };
