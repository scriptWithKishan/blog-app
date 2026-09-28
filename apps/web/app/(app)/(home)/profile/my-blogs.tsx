"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Blog {
  _id?: string;
  head: string;
  body: string;
  createdAt?: string;
}

export default function MyBlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${backendUrl}/blog?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        setBlogs(response.data.blogs || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalBlogs(response.data.totalBlogs || 0);
        setLoading(false);
      } catch (err: unknown) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred";

        setLoading(false);
        toast.add({
          type: "error",
          description: errorMessage,
        });
      }
    };

    fetchBlogs();
  }, [page]);

  if (loading && blogs.length === 0) {
    return (
      <div className="max-w-4xl w-full flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl w-full">
      <CardContent>
        {blogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            No blogs found. Create your first blog!
          </p>
        ) : (
          <div className="space-y-4 py-4">
            {blogs.map((blog) => (
              <div key={blog._id || blog.head} className="border-b pb-4 pt-2">
                <h3 className="font-bold text-xl mb-2">{blog.head}</h3>
                {blog._id ? (
                  <Link href={`/blog/${blog._id}`}>
                    <Button variant="link" className="p-0 h-auto">Show Full Blog</Button>
                  </Link>
                ) : (
                  <Button variant="link" className="p-0 h-auto">Show Full Blog</Button>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1 || loading}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground font-medium">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages || loading}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
