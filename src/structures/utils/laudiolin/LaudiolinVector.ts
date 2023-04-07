import path from "path";
import axios from "axios";
import filesystem from "fs";
import { LaudiolinClient } from "./LaudiolinClient";

export type LaudiolinVectorTheme = "dark" | "light";

/**
 * Creates a new LaudiolinVector instance which takes in two parameters, the first one being the theme to use for the vector to be rendered and the second one being the LaudiolinUser.
 * @class
 */
export class LaudiolinVector {
	private vectorBuffer: Buffer;

	constructor(readonly theme: LaudiolinVectorTheme | string = "dark", private user: LaudiolinClient.LaudiolinUser | null) {
		switch (theme) {
			case "dark":
				if (!user || !user.listeningTo || typeof user.listeningTo !== "object") {
					this.vectorBuffer = filesystem.readFileSync(path.join(process.cwd(), "assets", "trackard-dark-missing.svg"));
				} else {
					this.vectorBuffer = filesystem.readFileSync(path.join(process.cwd(), "assets", "trackard-dark-display.svg"));
				}
			break;

			default:
				if (!user || !user.listeningTo || typeof user.listeningTo !== "object") {
					this.vectorBuffer = filesystem.readFileSync(path.join(process.cwd(), "assets", "trackard-light-missing.svg"));
				} else {
					this.vectorBuffer = filesystem.readFileSync(path.join(process.cwd(), "assets", "trackard-light-display.svg"));
				}
			break;
		}
	}

	/**
	 * @private
	 * @deprecated Method has been deprecated on 1.0.5, a workaround has been applied to vector-related text overflow.
	 * @param text 
	 * @param threshold 
	 * @returns {string}
	 */
	private trimText(text: string, threshold: number) {
		if (text.length <= threshold) return text;
		return text.substring(0, threshold).concat("...");
	}

	private formatSeconds(seconds: number): string {
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	/**
	 * 
	 * @param listeningInfo 
	 * @returns {Buffer}
	 */
	private async getThumbnailBuffer(listeningInfo: LaudiolinClient.ListeningInfo): Promise<Buffer> {
		const iconURL = listeningInfo.icon.replace(/=w\d+-h\d+-l\d+-rj\?from=cart/, "=w512-h512?from=cart")

		return await axios.get(iconURL, { responseType: 'arraybuffer' })
		.then((response) => {
			return Buffer.from(response.data);
		})
		.catch((_error) => {
			return Buffer.from("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", "base64");
		});
	}

	/**
	 * Renders an SVG code with all the provided data, returns placeholder if Laudiolin user isn't found or not listening to anything.
	 * @returns {Promise<string>}
	 */
	public async render(): Promise<string> {
		if (!this.user || !this.user.listeningTo || typeof this.user.listeningTo !== "object") {
			return this.vectorBuffer.toString("utf-8");
		} else {
			const vector = this.vectorBuffer.toString("utf-8");
			const nonLatinRegex = /^[^\u0000-\u007F]*$/;
			const artistEscaped = this.user.listeningTo.artist.split('').map((char) => nonLatinRegex.test(char) ? encodeURI(char) : char).join('');
			const titleEscaped = this.user.listeningTo.title.split('').map((char) => nonLatinRegex.test(char) ? encodeURI(char) : char).join('');
			const thumbnail = await this.getThumbnailBuffer(this.user.listeningTo);

			return vector
				.replace(/<\s*laudiolinURI\s*>/, `https://laudiolin.seikimo.moe/track/${this.user.listeningTo.id}`)
				.replace(/<\s*listenURL\s*>/, `https://laudiolin.seikimo.moe/listen/${this.user.userId}`)
				.replace(/<\s*trackThumb\s*>/, thumbnail.toString('base64'))
				.replace(/\{artist\}/, this.user.listeningTo.artist).replace(/\{title\}/, this.user.listeningTo.title)
				.replace(/\{userTag\}/, this.user.discordTag).replace(/\{duration\}/, this.formatSeconds(this.user.listeningTo.duration))
				.replace(/\{current\}/, this.formatSeconds(Math.round(this.user.progress)))
				.replace(/&/g, "&amp;");
		}
	}
}