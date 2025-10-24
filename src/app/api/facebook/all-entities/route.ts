import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';
import { createFacebookBusinessClient } from '@/lib/facebook-business-client';

export async function GET(request: NextRequest) {
  try {
    console.log('[Facebook API][all-entities] Fetching all Facebook entities (campaigns, adsets, ads)');

    const db = await getDb();
    const settings = db.data.settings?.facebook;

    if (!settings?.accessToken) {
      return NextResponse.json({ success: false, error: 'Facebook não configurado. Salve o Access Token em Configurações.' }, { status: 400 });
    }

    const accountId = settings.accounts?.[0]?.account_id || '2086645648498466';
    const accessToken = settings.accessToken;

    const facebookClient = createFacebookBusinessClient({
      accessToken,
      accountId,
      appId: settings.appId || '1500646467976405',
      appSecret: settings.appSecret || 'b3cb0095c94e42c9f2f21d4c2d1a1fa2',
    });

    const [campaigns, adSets, ads] = await Promise.all([
      facebookClient.getCampaigns(),
      facebookClient.getAdSets(),
      facebookClient.getAds(),
    ]);

    console.log(`[Facebook API][all-entities] Successfully fetched ${campaigns.length} campaigns, ${adSets.length} ad sets, ${ads.length} ads.`);

    return NextResponse.json({
      success: true,
      data: { campaigns, adSets, ads },
    });
  } catch (e) {
    console.error('[Facebook API][all-entities] Failed to fetch all entities:', e);
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}