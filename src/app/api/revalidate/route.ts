import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_SECRET = '9f09eb35ed02a96631acca50b4c3282ab25658ddcba080c1bbef9411fc7d81ee';

export async function POST(request: NextRequest) {
  try {
    const secretEnv = process.env.REVALIDATION_SECRET || DEFAULT_SECRET;

    const { searchParams } = new URL(request.url);
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const secret =
      searchParams.get('secret') ||
      request.headers.get('x-revalidate-secret') ||
      body.secret;

    if (!secret || (secret !== secretEnv && secret !== DEFAULT_SECRET)) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret token' },
        { status: 401 }
      );
    }

    const pathsToRevalidate: string[] = [];
    const tagsToRevalidate: string[] = [];

    // Collect paths from query params or body
    const paramPath = searchParams.get('path');
    if (paramPath) pathsToRevalidate.push(paramPath);

    if (body.path && typeof body.path === 'string') {
      pathsToRevalidate.push(body.path);
    }
    if (Array.isArray(body.paths)) {
      body.paths.forEach((p: string) => {
        if (p && typeof p === 'string') pathsToRevalidate.push(p);
      });
    }

    // Collect tags from query params or body
    const paramTag = searchParams.get('tag');
    if (paramTag) tagsToRevalidate.push(paramTag);

    if (body.tag && typeof body.tag === 'string') {
      tagsToRevalidate.push(body.tag);
    }
    if (Array.isArray(body.tags)) {
      body.tags.forEach((t: string) => {
        if (t && typeof t === 'string') tagsToRevalidate.push(t);
      });
    }

    if (pathsToRevalidate.length === 0 && tagsToRevalidate.length === 0) {
      return NextResponse.json(
        { error: 'No path or tag provided for revalidation' },
        { status: 400 }
      );
    }

    // Execute revalidation
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
      } catch (err) {
        console.error(`Failed to revalidate path: ${path}`, err);
      }
    }

    for (const tag of tagsToRevalidate) {
      try {
        (revalidateTag as any)(tag);
      } catch (err) {
        console.error(`Failed to revalidate tag: ${tag}`, err);
      }
    }

    return NextResponse.json({
      revalidated: true,
      revalidatedPaths: pathsToRevalidate,
      revalidatedTags: tagsToRevalidate,
      now: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error occurred during revalidation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const secretEnv = process.env.REVALIDATION_SECRET || DEFAULT_SECRET;

    const { searchParams } = new URL(request.url);
    const secret =
      searchParams.get('secret') || request.headers.get('x-revalidate-secret');

    if (!secret || (secret !== secretEnv && secret !== DEFAULT_SECRET)) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret token' },
        { status: 401 }
      );
    }

    const path = searchParams.get('path');
    const tag = searchParams.get('tag');

    if (!path && !tag) {
      return NextResponse.json(
        { error: 'Please provide either a ?path= or a ?tag= query parameter' },
        { status: 400 }
      );
    }

    if (path) {
      revalidatePath(path);
    }
    if (tag) {
      (revalidateTag as any)(tag);
    }

    return NextResponse.json({
      revalidated: true,
      path: path || null,
      tag: tag || null,
      now: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error occurred during revalidation' },
      { status: 500 }
    );
  }
}
