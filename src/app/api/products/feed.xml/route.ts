import { GET as getMetaProductFeed } from '../../meta-product-feed/route';

export async function GET() {
  return getMetaProductFeed();
}
