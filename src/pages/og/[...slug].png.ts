import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html } from 'satori-html';
import fs from 'fs';
import path from 'path';

// Load font file
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'atkinson-bold.woff');
let fontData: ArrayBuffer;

try {
  fontData = fs.readFileSync(fontPath);
} catch {
  // Fallback: if font not found, we'll handle it in the route
  fontData = new ArrayBuffer(0);
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, description: post.data.description },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props;

  const markup = html`
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px;">
      <div style="display: flex; flex-direction: column; justify-content: center; flex: 1; color: white;">
        <h1 style="font-size: 64px; font-weight: bold; margin: 0; line-height: 1.2; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
          ${title}
        </h1>
        <p style="font-size: 28px; margin-top: 24px; opacity: 0.9; line-height: 1.4;">
          ${description}
        </p>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 24px; font-weight: bold;">Kulius Blog</span>
        <span style="font-size: 20px; opacity: 0.8;">kulius.github.io</span>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: fontData.byteLength > 0 ? [
      {
        name: 'Atkinson',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ] : [],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
