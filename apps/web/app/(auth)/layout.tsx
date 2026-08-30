import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // If user is already logged in, redirect them away from auth pages to home
  if (token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {children}
    </div>
  );
}