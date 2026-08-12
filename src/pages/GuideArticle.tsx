import { useParams } from "react-router-dom";
import ArticleLayout from "@/components/guides/ArticleLayout";
import NotFound from "./NotFound";
import { getArticle } from "@/content/guides";

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticle(slug);
  if (!article) return <NotFound />;
  return <ArticleLayout article={article} />;
}
