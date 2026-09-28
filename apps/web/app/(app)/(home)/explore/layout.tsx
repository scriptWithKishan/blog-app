import { UserSearch } from "@/components/user-search";
import React from "react";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* Top Header & Search Bar Section */}
      <div className="max-w-4xl w-full flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Search users by username, discover content, and manage your subscriptions.
          </p>
        </div>

        {/* User Search Component */}
        <UserSearch />
      </div>

      {/* Main Explore Content */}
      <div className="max-w-4xl w-full">{children}</div>
    </div>
  );
}
