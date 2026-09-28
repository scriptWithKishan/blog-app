"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import { Heart, Eye, TrendingUp, UserCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PopularBlog {
  _id: string;
  head: string;
  body: string;
  createdAt: string;
  likesCount?: number;
  viewsCount?: number;
  popularityScore?: number;
  likes?: string[];
  user: {
    _id: string;
    username: string;
  };
}

export default function ExplorePage() {
  const [blogs, setBlogs] = useState<PopularBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribedUserIds, setSubscribedUserIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = Cookies.get("token");

        // Fetch User Info to get subscribed bloggers
        const userRes = await axios.get(`${backendUrl}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUserId(userRes.data.user?._id || "");
        setSubscribedUserIds(userRes.data.user?.subscribedBloggers || []);

        // Fetch Popular Blogs
        const blogsRes = await axios.get(`${backendUrl}/blog/popular`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBlogs(blogsRes.data.blogs || []);
      } catch (err: any) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : "Failed to load popular blogs";

        toast.add({
          type: "error",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle Like on a blog
  const handleLikeBlog = async (blogId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(
        `${backendUrl}/blog/${blogId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );

      setBlogs((prev) =>
        prev.map((b) => {
          if (b._id === blogId) {
            const isLiked = res.data.isLiked;
            return {
              ...b,
              likesCount: res.data.likesCount,
              likes: isLiked
                ? [...(b.likes || []), currentUserId]
                : (b.likes || []).filter((id) => id !== currentUserId),
            };
          }
          return b;
        })
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Toggle Subscribe to author
  const handleToggleSubscribe = async (bloggerId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(
        `${backendUrl}/user/subscribe/${bloggerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );

      const isSubscribed = res.data.isSubscribed;
      setSubscribedUserIds((prev) =>
        isSubscribed ? [...prev, bloggerId] : prev.filter((id) => id !== bloggerId)
      );

      toast.add({
        type: "success",
        description: res.data.message,
      });
    } catch (err) {
      console.error("Error toggling subscribe:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Popular Posts
        </CardTitle>
      </CardHeader>

      <CardContent>
        {blogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No popular posts found yet. Be the first to create one!
          </p>
        ) : (
          <div className="space-y-6 py-2">
            {blogs.map((blog) => {
              const isLiked = blog.likes?.includes(currentUserId);
              const isSubscribed = subscribedUserIds.includes(blog.user._id);
              const isOwnPost = blog.user._id === currentUserId;

              return (
                <div
                  key={blog._id}
                  className="border-b pb-5 pt-2 flex flex-col gap-3 last:border-b-0"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        @{blog.user?.username || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(blog.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {!isOwnPost && (
                      <Button
                        size="sm"
                        variant={isSubscribed ? "outline" : "secondary"}
                        onClick={() => handleToggleSubscribe(blog.user._id)}
                        className="h-7 text-xs px-2.5 gap-1"
                      >
                        {isSubscribed ? (
                          <>
                            <UserCheck className="h-3 w-3" />
                            Subscribed
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3" />
                            Subscribe
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Blog Title & Content */}
                  <div>
                    <Link href={`/blog/${blog._id}`}>
                      <h2 className="font-bold text-lg hover:text-primary transition-colors">
                        {blog.head}
                      </h2>
                    </Link>
                    <div
                      className="text-sm text-muted-foreground ProseMirror line-clamp-3 mt-1"
                      dangerouslySetInnerHTML={{ __html: blog.body }}
                    />
                    <Link href={`/blog/${blog._id}`}>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        Show Blog
                      </Button>
                    </Link>
                  </div>

                  {/* Blog Footer - Likes & Views Counter */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <button
                      type="button"
                      onClick={() => handleLikeBlog(blog._id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        isLiked
                          ? "text-red-500 font-medium"
                          : "hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      <span>{blog.likesCount || 0} Likes</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>{blog.viewsCount || 0} Views</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
