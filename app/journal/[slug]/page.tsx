import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <div className="container page-space">
      <article className="article">
        <Link href="/journal" className="back-link">
          ← Góc chăm sóc
        </Link>
        <span className="eyebrow">{post.category}</span>
        <h1>{post.title}</h1>
        <p className="article-byline">Biên soạn: {post.author.name}</p>
        <div className="article-body">{post.content}</div>
        <p className="article-notice">
          Thông tin tham khảo về chăm sóc hằng ngày. Với vấn đề sức khỏe cụ thể,
          hãy trao đổi trực tiếp với bác sĩ thú y.
        </p>
      </article>
    </div>
  );
}
