import { useParams } from "react-router-dom";
import FormPublicPage from "./FormPublicPage";

export default function FormPublicPageRoute() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;
  return <FormPublicPage slug={slug} />;
}
