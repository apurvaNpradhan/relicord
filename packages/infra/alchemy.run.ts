import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

const app = await alchemy("relicord");

export const web = await Vite("web", {
	cwd: "../../apps/web",
	assets: "dist",
	bindings: {
		VITE_SERVER_URL: "https://relicord.lostsignal.cloud",
		VITE_BASE_URL: "https://relicord.lostsignal.cloud",
		VITE_R2_URL: "https://assets.relicord.lostsignal.cloud",
	},
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
