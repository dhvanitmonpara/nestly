import { Skeleton } from "./ui/skeleton";

function ChannelSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 3 }).map((_, i) =>
        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-800 animate-pulse">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-5 h-5 bg-zinc-700 rounded-full" /> {/* icon */}
            <Skeleton className="w-24 h-5 bg-zinc-700 rounded-md" /> {/* channel name */}
          </div>

          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-5 bg-zinc-700 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChannelSkeleton;