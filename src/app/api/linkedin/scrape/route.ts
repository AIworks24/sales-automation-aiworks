import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { createScrapingDogClient } from '@/lib/scrapingdog/client';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { linkedinUrl } = body;

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL format
    if (!linkedinUrl.includes('linkedin.com/in/')) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn profile URL' },
        { status: 400 }
      );
    }

    const scrapingdog = createScrapingDogClient();
    const profileData = await scrapingdog.scrapeLinkedInProfile(linkedinUrl);

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    console.error('Error scraping LinkedIn profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape LinkedIn profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
