"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { name: "Explore", href: "/explore" },
  { name: "Communities", href: "/communities" },
  { name: "Write", href: "/write" },
  { name: "Settings", href: "/settings" },
  { name: "Profile", href: "/profile" }
];

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    Cookies.remove("token");
    router.push("/sign-in");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-between border-b">
      <Link href="/" className="font-heading text-2xl font-bold ml-2">
        BlogBase
      </Link>
      <div className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link key={link.name} href={link.href} className="group">
            {link.name}
            <div className="bg-foreground h-[2px] w-0 group-hover:w-full transition-all duration-500" />
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={logout} variant={"destructive"} className="h-14 w-24 rounded-none">
          Logout
        </Button>
      </div>
    </nav>
  );
}


