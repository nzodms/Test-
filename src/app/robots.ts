import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The workspace is a private surface, not a public index.
      disallow: ["/dashboard", "/onboarding", "/sign-in"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
