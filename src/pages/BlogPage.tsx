import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchBlogPosts, fetchBlogPostBySlug } from '@/services/api';
import type { BlogPost } from '@/types/types';

export const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBlogPosts(page, 9).then(({ data, count }) => { setPosts(data); setCount(count); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Blog & News</h1>
        <p className="text-muted-foreground text-sm">Security tips, product news, and industry insights</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-muted rounded animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="bg-card border-border hover:border-primary/40 transition-all group overflow-hidden h-full flex flex-col">
                  {post.thumbnail_url && (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img src={post.thumbnail_url} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Calendar size={12} />
                      {new Date(post.published_at ?? post.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{post.title}</h3>
                    {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>}
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                      Read more <ChevronRight size={12} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {Math.ceil(count / 9) > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border border-border">Previous</Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">Page {page} of {Math.ceil(count / 9)}</span>
              <Button variant="ghost" size="sm" disabled={page >= Math.ceil(count / 9)} onClick={() => setPage(p => p + 1)} className="border border-border">Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchBlogPostBySlug(slug).then(setPost).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">Post not found. <Link to="/blog" className="text-primary hover:underline">Back to blog</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={12} />
        <Link to="/blog" className="hover:text-primary">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-foreground line-clamp-1">{post.title}</span>
      </nav>

      {post.thumbnail_url && (
        <div className="aspect-video overflow-hidden rounded bg-muted mb-6">
          <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <Calendar size={12} />
        {new Date(post.published_at ?? post.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>

      <h1 className="text-2xl font-black text-foreground mb-4 text-balance">{post.title}</h1>
      {post.excerpt && <p className="text-muted-foreground text-base mb-6 border-l-2 border-primary pl-4">{post.excerpt}</p>}

      <div className="prose prose-invert max-w-none">
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{post.content}</div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <Link to="/blog">
          <Button variant="ghost" className="border border-border text-sm">← Back to Blog</Button>
        </Link>
      </div>
    </div>
  );
};
