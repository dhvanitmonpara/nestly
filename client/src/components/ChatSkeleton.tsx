import { Skeleton } from "./ui/skeleton";

function ChannelMessagesSkeleton() {
  // Render 6 placeholder messages for loading effect
  const placeholders = Array.from({ length: 6 });

  return (
    <div className="px-4 pt-10 pb-60">
      {/* Header */}
      <div className="sm:px-6 pb-4 text-lg font-semibold text-zinc-200">
        <Skeleton className="h-6 w-48 rounded-md" />
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {placeholders.map((_, idx) => (
          <MessageSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex space-x-2 py-2 sm:mx-6 animate-pulse">
      {/* Avatar */}
      <Skeleton className="h-8 w-8 rounded-full" />

      {/* Message body */}
      <div className="w-full space-y-1">
        {/* Username */}
        <Skeleton className="h-3 w-24 rounded-md" />

        {/* Message content */}
        <Skeleton className="h-4 w-32 rounded-md" />
      </div>
    </div>
  );
}

export default ChannelMessagesSkeleton;