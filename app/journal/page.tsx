import Link from "next/link";
import { Heart, Utensils, PawPrint, ArrowUpRight } from "lucide-react";
import { getPosts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export const metadata = { title: "Góc chăm sóc" };
export default async function Page() {
  const posts = await getPosts();
  return (
    <div className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">GÓC NHỎ CÙNG TAILUP</span>
        <h1>
          Hiểu bé thêm một chút.
          <br />
          <em>Thương bé thêm mỗi ngày.</em>
        </h1>
        <p>Chia sẻ những điều gần gũi trong hành trình sống cùng thú cưng.</p>
      </div>
      <div className="journal-grid">
        {posts.map((p, i) => {
          const Icon = [Heart, Utensils, PawPrint][i % 3];
          return (
            <article className="journal-card" key={p.id}>
              <Link href={`/journal/${p.slug}`} className="journal-art">
                <Icon />
                <span>TAILUP JOURNAL / 0{i + 1}</span>
              </Link>
              <div className="journal-card-body">
                <span className="eyebrow">{p.category}</span>
                <Link href={`/journal/${p.slug}`}>
                  <h2>{p.title}</h2>
                </Link>
                <p>{p.excerpt}</p>
                <Link href={`/journal/${p.slug}`} className="text-link">
                  Đọc tiếp <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!posts.length && (
        <div className="empty-state">
          <h2>Góc chăm sóc đang được chuẩn bị.</h2>
          <p>Hẹn gặp bạn trong những bài viết sắp tới.</p>
        </div>
      )}
    </div>
  );
}
