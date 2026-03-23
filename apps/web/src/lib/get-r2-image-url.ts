import { env } from "@relicord/env/web";

export function getImageUrl(path: string) {
	if (!path) return "";
	if (path.startsWith("http")) {
		return path;
	}
	return `${env.VITE_R2_URL}/${path}`;
}
