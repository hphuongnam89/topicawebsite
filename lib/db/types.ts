export interface UserRecord {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  article_count?: number;
}

export interface ArticleRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  featured_image: string | null;
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  tags: string | null;
  author_name: string | null;
  is_featured: number;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface LeadRecord {
  id: number;
  fullname: string;
  phone: string;
  email: string | null;
  program: string | null;
  notes: string | null;
  status: "new" | "contacted" | "consulted" | "cancelled";
  created_at: string;
}

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  featured_image: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}
