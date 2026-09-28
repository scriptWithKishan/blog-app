"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Spinner } from "@/components/ui/spinner";
export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${backendUrl}/blog/subscribed-bloggers-blog-list`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        setBlogs(response.data.blogs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);


  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <Spinner />
    </div>;
  }

  if (blogs.length === 0) {
    return <div>No blogs found</div>;
  }

  return (
    <div>
      <h1>Blog List</h1>
    </div>
  );
}