import { Skeleton } from "primereact/skeleton";

export function CartItemSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151e22] rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-[#e8dccf] dark:border-[#243440]">
      <div className="flex gap-3 sm:gap-4 md:gap-6">
        {/* Image Skeleton */}
        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
          <Skeleton 
            width="100%" 
            height="100%" 
            borderRadius="12px" 
            className="bg-gray-200 dark:bg-[#243440] w-full h-full"
          />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div className="space-y-2 flex-1 w-full min-w-0">
              <Skeleton width="70%" height="20px" className="bg-gray-200 dark:bg-[#243440]" />
              <Skeleton width="45%" height="14px" className="bg-gray-200 dark:bg-[#243440]" />
            </div>
            <Skeleton width="60px" height="20px" className="bg-gray-200 dark:bg-[#243440]" />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton width="50px" height="20px" borderRadius="4px" className="bg-gray-200 dark:bg-[#243440]" />
            <Skeleton width="70px" height="20px" borderRadius="4px" className="bg-gray-200 dark:bg-[#243440]" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-[#243440] w-full">
            <div className="flex items-center gap-2">
              <Skeleton width="80px" height="32px" borderRadius="8px" className="bg-gray-200 dark:bg-[#243440]" />
            </div>
            <Skeleton width="70px" height="32px" borderRadius="8px" className="bg-gray-200 dark:bg-[#243440]" />
          </div>
        </div>
      </div>
    </div>
  );
}

