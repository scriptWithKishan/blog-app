import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({children}: {children: React.ReactNode}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

    // If user is not logged in, redirect them away from home pages to auth
    if (!token) {
      redirect("/sign-in");
    }

    return (
      <div>
        {children}
      </div>
    )
}