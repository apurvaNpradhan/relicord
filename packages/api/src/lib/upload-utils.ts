import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@relicord/env/server";
import crypto from "crypto";
import path from "path";
import { R2_BUCKET_NAME, r2Client } from "./r2-client";

export interface UploadedFile {
	filename: string;
	mimetype: string;
	size: number;
	key: string;
	url: string;
}

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export function generateUniqueFilename(originalFilename: string): string {
	const ext = path.extname(originalFilename);
	const timestamp = Date.now();
	const randomString = crypto.randomBytes(8).toString("hex");
	return `${timestamp}-${randomString}${ext}`;
}

export function getPublicUrl(key: string): string {
	return `https://${R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.dev/${key}`;
}

export function validateFile(
	mimetype: string,
	size: number,
	type: "image" | "video",
): void {
	if (type === "image") {
		if (!ALLOWED_IMAGE_TYPES.includes(mimetype)) {
			throw new Error("Invalid image type. Allowed: JPEG, PNG, WebP, GIF");
		}
		if (size > MAX_IMAGE_SIZE) {
			throw new Error("Image too large. Max size: 10MB");
		}
	} else {
		if (!ALLOWED_VIDEO_TYPES.includes(mimetype)) {
			throw new Error("Invalid video type. Allowed: MP4, WebM, MOV");
		}
		if (size > MAX_VIDEO_SIZE) {
			throw new Error("Video too large. Max size: 100MB");
		}
	}
}

export async function uploadToR2(
	buffer: Buffer,
	filename: string,
	mimetype: string,
	folder = "uploads",
): Promise<UploadedFile> {
	const key = `${folder}/${filename}`;

	await r2Client.send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: mimetype,
		}),
	);

	const url = getPublicUrl(key);

	return {
		filename,
		mimetype,
		size: buffer.length,
		key,
		url,
	};
}
