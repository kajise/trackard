import axios, { Axios, AxiosError } from "axios";

export namespace LaudiolinREST {
	export interface LaudiolinResponse {
		onlineUsers: LaudiolinUser[];
		timestamp: number; code: number;
		message: string;
	}
	
	export interface LaudiolinUser {
		socialStatus: string;
		username: string;
		discriminator: string;
		discordTag: string;
		userId: string;
		avatar: string;
		progress: number;
		listeningTo: ListeningInfo
	}
	
	export interface ListeningInfo {
		duration: number;
		artist: string;
		title: string;
		icon: string;
		uri: string;
		id: string;
	}
}

export class LaudiolinREST {
	public restClient: Axios;

	constructor(restURL: string) {
		this.restClient = new Axios({ baseURL: restURL, responseType: "json" });
	}

	private async get(): Promise<LaudiolinREST.LaudiolinResponse> {
		return await this.restClient.get("/social/available")
		.then((response) => {
			if ("data" in response && response.data) {
				if (typeof response.data === "string") {
					const serverResponse: LaudiolinREST.LaudiolinResponse = JSON.parse(response.data);
					const laudiolinUsers = serverResponse.onlineUsers.map((user) => {
						user.discordTag = `${user.username}#${user.discriminator}`;
						return user;
					});

					return {
						...serverResponse,
						onlineUsers: laudiolinUsers
					} as LaudiolinREST.LaudiolinResponse;
				} else {
					const serverResponse: LaudiolinREST.LaudiolinResponse = response.data;
					const laudiolinUsers = serverResponse.onlineUsers.map((user) => {
						user.discordTag = `${user.username}#${user.discriminator}`;
						return user;
					});

					return {
						...serverResponse,
						onlineUsers: laudiolinUsers
					} as LaudiolinREST.LaudiolinResponse;
				}
			}
		})
		.catch((error) => {
			if (error instanceof AxiosError) {
				return {
					code: error.status, message: error.message,
					timestamp: Date.now(), onlineUsers: []
				} as LaudiolinREST.LaudiolinResponse;
			} else {
				return {
					code: 500, message: error.message,
					timestamp: Date.now(), onlineUsers: []
				} as LaudiolinREST.LaudiolinResponse;
			}
		});
	}

	private trimText(text: string, threshold: number) {
		if (text.length <= threshold) return text;
		return text.substring(0, threshold).concat("...");
	}

	private formatSeconds(seconds: number): string {
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	public async getUser(userId: string): Promise<LaudiolinREST.LaudiolinUser> {
		const response = await this.get();
		const userMap = new Map<string, LaudiolinREST.LaudiolinUser>();
		response.onlineUsers.reduce((map, obj) => map.set(obj.userId, obj), userMap);

		return userMap.get(userId);
	}

	public async getThumbnailBuffer(listeningInfo: LaudiolinREST.ListeningInfo) {
		const iconURL = listeningInfo.icon.replace(/=w\d+-h\d+-l\d+-rj\?from=cart/, "=w512-h512?from=cart")

		return await axios.get(iconURL, { responseType: 'arraybuffer' })
		.then((response) => {
			return Buffer.from(response.data);
		})
		.catch((_error) => {
			return Buffer.from("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", "base64");
		});
	}

	public generateDetails(svgBuffer: Buffer, user: LaudiolinREST.LaudiolinUser) {
		const vector = svgBuffer.toString("utf-8");
		const laudiolinURI = vector.replace(/<\s*laudiolinURI\s*>/, `https://laudiolin.seikimo.moe/track/${user.listeningTo.id}`);
		const inviteURI = laudiolinURI.replace(/<\s*listenURL\s*>/, `https://laudiolin.seikimo.moe/listen/${user.userId}`);
		return inviteURI.replace(/\{artist\}/, user.listeningTo.artist)
			.replace(/\{title\}/, this.trimText(user.listeningTo.title, 20)).replace(/\{userTag\}/, user.discordTag)
			.replace(/\{duration\}/, this.formatSeconds(user.listeningTo.duration))
			.replace(/\{current\}/, this.formatSeconds(Math.round(user.progress)));
	}
}