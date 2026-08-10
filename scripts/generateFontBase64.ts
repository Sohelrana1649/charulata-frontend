import fs from 'fs';
import path from 'path';

/**
 * Downloads Hind Siliguri font files (400 and 700 weights, .woff2 format) from Google Fonts,
 * converts them to base64 strings, and exports them to lib/fonts/hindSiliguriBase64.ts
 */
async function generateFontBase64() {
  console.log('🔄 Fetching Hind Siliguri font styles from Google Fonts...');

  const googleFontsCssUrl =
    'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap';

  // Request CSS with modern Chrome User-Agent to get .woff2 URLs
  const cssResponse = await fetch(googleFontsCssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS: ${cssResponse.statusText}`);
  }

  const cssText = await cssResponse.text();

  // Extract woff2 URLs for weight 400 and 700
  const fontBlocks = cssText.split('@font-face');
  let regularUrl = '';
  let boldUrl = '';

  for (const block of fontBlocks) {
    const isWoff2 = block.includes("format('woff2')") || block.includes('format("woff2")') || block.includes('.woff2');
    const urlMatch = block.match(/src:\s*url\((https:\/\/[^)]+)\)/);

    if (urlMatch && isWoff2) {
      const url = urlMatch[1].replace(/['"]/g, '');
      if (block.includes('font-weight: 400') && !regularUrl) {
        regularUrl = url;
      } else if (block.includes('font-weight: 700') && !boldUrl) {
        boldUrl = url;
      }
    }
  }

  // Fallback URLs if parsing varies
  if (!regularUrl) {
    regularUrl = 'https://fonts.gstatic.com/s/hindsiliguri/v14/ljYrRh2vP_g1e427iY7R112c-zKq-mP1.woff2';
  }
  if (!boldUrl) {
    boldUrl = 'https://fonts.gstatic.com/s/hindsiliguri/v14/ljYpRh2vP_g1e427iY7R112c29en42P12aQ.woff2';
  }

  console.log(`📥 Downloading Regular 400 font from: ${regularUrl}`);
  const regRes = await fetch(regularUrl);
  const regBuffer = Buffer.from(await regRes.arrayBuffer());
  const regBase64 = regBuffer.toString('base64');

  console.log(`📥 Downloading Bold 700 font from: ${boldUrl}`);
  const boldRes = await fetch(boldUrl);
  const boldBuffer = Buffer.from(await boldRes.arrayBuffer());
  const boldBase64 = boldBuffer.toString('base64');

  const fileContent = `/**
 * Auto-generated base64 font strings for Hind Siliguri (Bengali font).
 * Generated for PDF/Puppeteer rendering.
 */

export const HIND_SILIGURI_REGULAR_BASE64 = "${regBase64}";

export const HIND_SILIGURI_BOLD_BASE64 = "${boldBase64}";
`;

  // Save to both src/lib/fonts/hindSiliguriBase64.ts AND lib/fonts/hindSiliguriBase64.ts for path flexibility
  const targetDirs = [
    path.join(process.cwd(), 'src', 'lib', 'fonts'),
    path.join(process.cwd(), 'lib', 'fonts'),
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const targetFile = path.join(dir, 'hindSiliguriBase64.ts');
    fs.writeFileSync(targetFile, fileContent, 'utf-8');
    console.log(`✅ Saved generated base64 fonts to: ${targetFile}`);
  }

  console.log('🎉 Hind Siliguri font base64 generation completed successfully!');
}

generateFontBase64().catch((err) => {
  console.error('❌ Error generating font base64:', err);
  process.exit(1);
});
