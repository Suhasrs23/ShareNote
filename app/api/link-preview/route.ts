import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const maxDuration = 10 // Set maximum execution time

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Try to act like a normal browser to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch url' }, { status: response.status })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      ''

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    let image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      ''

    // If image is a relative path, make it absolute
    if (image && !image.startsWith('http')) {
      try {
        const urlObj = new URL(url)
        image = new URL(image, urlObj.origin).toString()
      } catch (e) {
        // ignore invalid urls
      }
    }

    // Get site name
    const siteName =
      $('meta[property="og:site_name"]').attr('content') ||
      new URL(url).hostname

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      siteName: siteName.trim(),
      url
    })
  } catch (error) {
    console.error('Error fetching link preview:', error)
    return NextResponse.json({ error: 'Failed to generate link preview' }, { status: 500 })
  }
}
