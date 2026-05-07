import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thedropzone.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login'],
      disallow: ['/dashboard/', '/room/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
