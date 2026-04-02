import { NextRequest, NextResponse } from 'next/server';

// 카테고리 타입 → 카카오 카테고리 코드 매핑
const CATEGORY_MAP: Record<string, string> = {
  restaurant: 'FD6',
  cafe: 'CE7',
  shopping: 'MT1',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '1000';
  const query = searchParams.get('query');

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let url: string;

  if (query) {
    // 키워드 검색
    url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${lng}&y=${lat}&radius=${radius}&size=15`;
  } else if (type && CATEGORY_MAP[type]) {
    // 카테고리 검색
    url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${CATEGORY_MAP[type]}&x=${lng}&y=${lat}&radius=${radius}&size=15`;
  } else {
    return NextResponse.json({ error: 'type or query required' }, { status: 400 });
  }

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Kakao API error' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
