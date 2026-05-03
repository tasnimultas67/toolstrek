import React from "react";

const HeroSkeleton = () => {
  return (
    <div className="bg-white h-dvh overflow-hidden animate-pulse">
      <div className="relative isolate px-6 lg:px-8">
        <div className="mx-auto max-w-2xl relative top-0 py-24 md:py-32">
          <div className="text-center space-y-6">
            {/* Title Skeleton */}
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto sm:h-16"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-1/2 mx-auto mt-4 sm:h-16"></div>
            </div>

            {/* Text Skeleton */}
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-3/6 mx-auto"></div>
            </div>

            {/* Buttons Skeleton */}
            <div className="animate-pulse flex justify-center gap-x-6 pt-4">
              <div className="h-10 bg-gray-200 rounded-md w-32"></div>
              <div className="h-10 bg-gray-200 rounded-md w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSkeleton;
