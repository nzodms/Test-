import type { MetadataRoute } from "next";
import { routes } from "@/config/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths: Array<[string, number]> = [
    [routes.home, 1],
    [routes.privacy, 0.3],
    [routes.terms, 0.3],
    [routes.contentPolicy, 0.3],
    [routes.takedownPolicy, 0.3],
  ];

  return publicPaths.map(([path, priority]) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency: path === routes.home ? "weekly" : "yearly",
    priority,
  }));
}
