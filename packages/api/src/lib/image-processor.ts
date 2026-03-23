import sharp from "sharp";

export interface ImageProcessingOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: "webp" | "avif" | "jpeg";
}

export async function processImage(
	buffer: Buffer,
	options: ImageProcessingOptions = {},
) {
	const { width = 512, height = 512, quality = 80, format = "webp" } = options;

	let processor = sharp(buffer)
		.resize(width, height, {
			fit: "cover",
			position: "center",
			withoutEnlargement: true,
		})
		.rotate();

	if (format === "webp") {
		processor = processor.webp({ quality, effort: 6 });
	} else if (format === "avif") {
		processor = processor.avif({ quality, effort: 6 });
	} else {
		processor = processor.jpeg({ quality, mozjpeg: true });
	}

	const optimizedBuffer = await processor.toBuffer();
	const metadata = await sharp(optimizedBuffer).metadata();

	return {
		buffer: optimizedBuffer,
		format,
		width: metadata.width,
		height: metadata.height,
		size: optimizedBuffer.length,
		mimeType: `image/${format}`,
	};
}

export async function createAvatar(buffer: Buffer) {
	return processImage(buffer, {
		width: 256,
		height: 256,
		quality: 85,
		format: "webp",
	});
}
