"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import MyBlogList from "./my-blogs";

interface User {
  _id?: string;
  username: string;
  email: string;
  bio?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${backendUrl}/user`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        
        setUser(response.data.user);
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
    }

    fetchUser();
  }, [])


  return (
    <div className="flex flex-col items-center gap-2">
      <Card className="mt-10 p-2 w-full max-w-4xl bg-card">
        {
          loading ? 
          <div className="flex justify-center m-10">
            <Spinner /> 
          </div> :
          <div className="flex justify-between p-2">
            <div>
              <CardHeader >
                <CardTitle className="text-4xl font-bold font-heading">{user?.username}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="max-w-50">{user?.bio}</p>
              </CardContent>
            </div>
            <div className="flex item-center gap-4">
              <div className="self-center flex flex-col items-center">
                <p className="text-muted-foreground text-xs">SUBSCRIBED</p>
                <p className="text-7xl font-bold">0</p>
                <p className="text-muted-foreground text-xs">BLOGGERS</p>
              </div>
              <div className="self-center flex flex-col items-center">
                <p className="text-muted-foreground text-xs">SUBSCRIBED</p>
                <p className="text-7xl font-bold">0</p>
                <p className="text-muted-foreground text-xs">COMMUNITIES</p>
              </div>
            </div>
          </div>
        }
      </Card>
      
      <div className="mt-10 p-2 w-full max-w-4xl">
        <h1 className="font-heading text-2xl font-bold self-start ">Blogs</h1>
      </div>

      <MyBlogList />
    </div>
  )
}