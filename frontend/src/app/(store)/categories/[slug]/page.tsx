import { notFound, permanentRedirect } from "next/navigation";
import { DIVISIONS } from "@/lib/catalog-data";

export function generateStaticParams() {
  return Object.keys(DIVISIONS).map((slug) => ({ slug }));
}

// Keep the original category URLs useful without maintaining duplicate product pages.
export default async function CategoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!Object.prototype.hasOwnProperty.call(DIVISIONS, slug)) notFound();
  permanentRedirect(`/products/${slug}`);
}
