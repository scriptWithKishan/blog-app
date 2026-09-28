import BlogList from "./blog-list";
import BlogPost from "./blog-post";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <BlogPost />
      <BlogList />
    </div>
  );
}
