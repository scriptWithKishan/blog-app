"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import axios from "axios";
import Cookies from "js-cookie";
import { Search, Loader2, User, UserPlus, UserCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface UserSuggestion {
  _id: string;
  username: string;
  bio?: string;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [subscribedUserIds, setSubscribedUserIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user's subscribed bloggers list on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${backendUrl}/user`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        setSubscribedUserIds(response.data.user?.subscribedBloggers || []);
      } catch (err) {
        console.error("Error fetching current user info:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Debounced user search effect
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    const timer = setTimeout(async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(
          `${backendUrl}/user/search?query=${encodeURIComponent(query.trim())}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        setSuggestions(response.data.users || []);
      } catch (err: any) {
        console.error("Error searching users:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle subscribe action
  const handleToggleSubscribe = async (bloggerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${backendUrl}/user/subscribe/${bloggerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const isSubscribed = response.data.isSubscribed;

      setSubscribedUserIds((prev) =>
        isSubscribed ? [...prev, bloggerId] : prev.filter((id) => id !== bloggerId)
      );

      toast.add({
        type: "success",
        description: response.data.message,
      });
    } catch (err: any) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to update subscription";

      toast.add({
        type: "error",
        description: errorMessage,
      });
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder="Search users by username..."
          className="pl-10 pr-10 py-2.5 h-11 rounded-xl shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <Card className="absolute left-0 right-0 top-12 z-50 mt-1 shadow-lg border rounded-xl overflow-hidden bg-popover text-popover-foreground">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Searching users...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found matching &quot;{query}&quot;
              </div>
            ) : (
              <ul className="divide-y max-h-72 overflow-y-auto">
                {suggestions.map((user) => {
                  const isSubscribed = subscribedUserIds.includes(user._id);

                  return (
                    <li
                      key={user._id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary shrink-0 font-medium">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm truncate">
                            @{user.username}
                          </span>
                          {user.bio && (
                            <span className="text-xs text-muted-foreground truncate max-w-xs">
                              {user.bio}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isSubscribed ? "outline" : "default"}
                        onClick={(e) => handleToggleSubscribe(user._id, e)}
                        className="shrink-0 h-8 text-xs gap-1.5 px-3"
                      >
                        {isSubscribed ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            Subscribed
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            Subscribe
                          </>
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
