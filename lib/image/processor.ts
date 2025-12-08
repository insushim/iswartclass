interface OptimizeOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { width = 2480, height = 3508, format = 'png', quality = 95 } = options;

  let pipeline = sharp(buffer);

  // Resize to A4 at 300 DPI
  pipeline = pipeline.resize(width, height, {
    fit: 'inside',
    withoutEnlargement: true,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  });

  // Convert format
  switch (format) {
    case 'png':
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
}

export async function addWatermark(
  buffer: Buffer,
  text: string,
  options: { opacity?: number; position?: string } = {}
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { opacity = 0.3 } = options;

  const image = sharp(buffer);
  const metadata = await image.metadata();
  const { width = 2480, height = 3508 } = metadata;

  // Create SVG watermark
  const fontSize = Math.floor(width * 0.02);
  const watermarkSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          fill: rgba(128, 128, 128, ${opacity});
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
        }
      </style>
      <text x="${width - 20}" y="${height - 20}"
            text-anchor="end" class="watermark">
        ${text}
      </text>
    </svg>
  `;

  return image
    .composite([{
      input: Buffer.from(watermarkSvg),
      blend: 'over'
    }])
    .toBuffer();
}

export async function convertToGrayscale(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buffer)
    .grayscale()
    .toBuffer();
}

export async function adjustContrast(
  buffer: Buffer,
  contrast: number = 1.2
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buffer)
    .linear(contrast, -(128 * contrast) + 128)
    .toBuffer();
}

export async function removeBackground(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buffer)
    .threshold(200)
    .toBuffer();
}

export async function getImageMetadata(buffer: Buffer) {
  const sharp = (await import('sharp')).default;
  return sharp(buffer).metadata();
}

export async function createPrintableSheet(
  buffer: Buffer,
  options: {
    paperSize?: 'A4' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    margins?: number;
  } = {}
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { paperSize = 'A4', orientation = 'portrait', margins = 50 } = options;

  const sizes = {
    A4: { portrait: { width: 2480, height: 3508 }, landscape: { width: 3508, height: 2480 } },
    Letter: { portrait: { width: 2550, height: 3300 }, landscape: { width: 3300, height: 2550 } }
  };

  const { width, height } = sizes[paperSize][orientation];
  const contentWidth = width - (margins * 2);
  const contentHeight = height - (margins * 2);

  const image = sharp(buffer);
  const resized = await image
    .resize(contentWidth, contentHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();

  // Create white background and center the image
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: resized,
      gravity: 'center'
    }])
    .png()
    .toBuffer();
}

export async function generateThumbnail(
  buffer: Buffer,
  size: number = 400
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buffer)
    .resize(size, size, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
}

export async function combineImages(
  images: Buffer[],
  layout: 'grid' | 'vertical' | 'horizontal' = 'grid',
  columns: number = 2
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  if (images.length === 0) {
    throw new Error('No images to combine');
  }

  // Get dimensions of first image
  const firstMeta = await sharp(images[0]).metadata();
  const imgWidth = firstMeta.width || 400;
  const imgHeight = firstMeta.height || 400;

  let composites: Array<{ input: Buffer; left: number; top: number }> = [];
  let totalWidth: number;
  let totalHeight: number;

  switch (layout) {
    case 'horizontal':
      totalWidth = imgWidth * images.length;
      totalHeight = imgHeight;
      composites = images.map((img, i) => ({
        input: img,
        left: i * imgWidth,
        top: 0
      }));
      break;

    case 'vertical':
      totalWidth = imgWidth;
      totalHeight = imgHeight * images.length;
      composites = images.map((img, i) => ({
        input: img,
        left: 0,
        top: i * imgHeight
      }));
      break;

    case 'grid':
    default:
      const rows = Math.ceil(images.length / columns);
      totalWidth = imgWidth * columns;
      totalHeight = imgHeight * rows;
      composites = images.map((img, i) => ({
        input: img,
        left: (i % columns) * imgWidth,
        top: Math.floor(i / columns) * imgHeight
      }));
      break;
  }

  return sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer();
}

export async function addBorder(
  buffer: Buffer,
  borderWidth: number = 10,
  borderColor: string = '#000000'
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  const metadata = await sharp(buffer).metadata();
  const { width = 400, height = 400 } = metadata;

  // Parse hex color
  const r = parseInt(borderColor.slice(1, 3), 16);
  const g = parseInt(borderColor.slice(3, 5), 16);
  const b = parseInt(borderColor.slice(5, 7), 16);

  const newWidth = width + (borderWidth * 2);
  const newHeight = height + (borderWidth * 2);

  return sharp({
    create: {
      width: newWidth,
      height: newHeight,
      channels: 4,
      background: { r, g, b, alpha: 1 }
    }
  })
    .composite([{
      input: buffer,
      left: borderWidth,
      top: borderWidth
    }])
    .png()
    .toBuffer();
}
