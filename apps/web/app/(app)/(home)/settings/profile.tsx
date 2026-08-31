"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import axios from "axios";
import Cookies from "js-cookie";
import { FormEvent, useEffect, useState } from "react";

interface User {
  _id?: string;
  username: string;
  email: string;
  bio?: string;
}

export default function Profile(){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = Cookies.get("token");
  
        const response = await axios.get(`${backendUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const fetchedUser: User = response.data.user;
        setUser(fetchedUser);
        setUsername(fetchedUser?.username || "");
        setBio(fetchedUser?.bio || "");
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
    
    fetchUserData();
  }, []);
  
  const isUnchanged =
    username.trim() === (user?.username || "") &&
    bio.trim() === (user?.bio || "");
  const isInvalid = !username.trim();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.patch(`${backendUrl}/user`, {
        username,
        bio,
      }, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`
        }
      });

      setSaving(false);
      setUser(response.data.user);
      toast.add({
        type: "success",
        description: response.data.message,
      });
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred";
  
        setSaving(false);
        toast.add({
          type: "error",
          description: errorMessage,
        });
    }
  }

  return (
    <Card className="mt-10 p-2 w-full max-w-xl bg-card">
        <CardHeader className="font-heading text-2xl font-bold">Profile</CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center m-10">
              <Spinner className="" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field orientation="horizontal">
                  <FieldLabel className="w-24 shrink-0">Email: </FieldLabel>
                  <Input disabled value={user?.email || ""} placeholder="Email" />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel className="w-24 shrink-0">Username: </FieldLabel>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel className="w-24 shrink-0">Bio: </FieldLabel>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Bio"
                  />
                </Field>
              </FieldGroup>
              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isUnchanged || isInvalid || saving}>
                  {saving && <Spinner />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
  )
}