"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Eye, Heart, Calendar, User as UserIcon } from "lucide-react";

interface BlogDetail {
  _id: string;
  head: string;
  body: string;
  createdAt: string;
  likesCount?: number;
  viewsCount?: number;
  isLiked?: boolean;
  user?: {
    _id: string;
    username: string;
    email?: string;
  };
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const blogId = resolvedParams?.id || (routeParams?.id as string);

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;

    const fetchBlogData = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = Cookies.get("token");

        // Record view first
        axios.post(
          `${backendUrl}/blog/${blogId}/view`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {});

        // Fetch blog detail
        const response = await axios.get(`${backendUrl}/blog/${blogId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBlog(response.data.blog);
        setLoading(false);
      } catch (err: unknown) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "Failed to load blog";

        setLoading(false);
        toast.add({
          type: "error",
          description: errorMessage,
        });
      }
    };

    fetchBlogData();
  }, [blogId]);

  const handleLike = async () => {
    if (!blog) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(
        `${backendUrl}/blog/${blog._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );

      setBlog((prev) =>
        prev
          ? {
              ...prev,
              isLiked: res.data.isLiked,
              likesCount: res.data.likesCount,
            }
          : null
      );
    } catch (err: unknown) {
      console.error("Error liking blog:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground text-lg">Blog post not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-6 w-full max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="self-start mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="w-full">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold font-heading">
            {blog.head}
          </CardTitle>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                @{blog.user?.username || "Anonymous"}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(blog.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  blog.isLiked ? "text-red-500 font-medium" : "hover:text-red-500"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    blog.isLiked ? "fill-red-500 text-red-500" : ""
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
        </CardHeader>

        <CardContent>
          <div
            className="ProseMirror text-foreground text-base leading-relaxed py-2"
            dangerouslySetInnerHTML={{ __html: blog.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
