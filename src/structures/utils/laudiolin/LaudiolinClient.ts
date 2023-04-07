import axios, { Axios, AxiosError } from "axios";

export namespace LaudiolinClient {
	export interface LaudiolinResponse {
		onlineUsers: LaudiolinUser[];
		recentUsers?: LaudiolinPartialUser[];
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

	export interface LaudiolinPartialUser extends Omit<LaudiolinUser, "listeningTo"> {
		/** The UNIX timestamp (in seconds) that this user was last seen. */
		lastSeen: number;
		lastListeningTo: ListeningInfo;
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

export class LaudiolinClient {
	public restClient: Axios;

	constructor(restURL: string) {
		this.restClient = new Axios({ baseURL: restURL, responseType: "json" });
	}

	private async get(): Promise<LaudiolinClient.LaudiolinResponse> {
		return await this.restClient.get("/social/available")
		.then((response) => {
			if ("data" in response && response.data) {
				if (typeof response.data === "string") {
					const serverResponse: LaudiolinClient.LaudiolinResponse = JSON.parse(response.data);
					const laudiolinUsers = serverResponse.onlineUsers.map((user) => {
						user.discordTag = `${user.username}#${user.discriminator}`;
						return user;
					});

					return {
						...serverResponse,
						onlineUsers: laudiolinUsers
					} as LaudiolinClient.LaudiolinResponse;
				} else {
					const serverResponse: LaudiolinClient.LaudiolinResponse = response.data;
					const laudiolinUsers = serverResponse.onlineUsers.map((user) => {
						user.discordTag = `${user.username}#${user.discriminator}`;
						return user;
					});

					return {
						...serverResponse,
						onlineUsers: laudiolinUsers
					} as LaudiolinClient.LaudiolinResponse;
				}
			}
		})
		.catch((error) => {
			if (error instanceof AxiosError) {
				return {
					code: error.status, message: error.message,
					timestamp: Date.now(), onlineUsers: []
				} as LaudiolinClient.LaudiolinResponse;
			} else {
				return {
					code: 500, message: error.message,
					timestamp: Date.now(), onlineUsers: []
				} as LaudiolinClient.LaudiolinResponse;
			}
		});
	}

	private async recent(): Promise<LaudiolinClient.LaudiolinResponse> {
		return await this.restClient.get("/social/recent")
		.then((response) => {
			if ("data" in response && response.data) {
				if (typeof response.data === "string") {
					const serverResponse: LaudiolinClient.LaudiolinResponse = JSON.parse(response.data);
					const laudiolinUsers = serverResponse.recentUsers.map((user) => {
						user.discordTag = `${user.username}#${user.discriminator}`;
						return user;
					});

					return {
						...serverResponse,
						recentUsers: laudiolinUsers,
					} as LaudiolinClient.LaudiolinResponse;
				} else {
					const serverResponse: LaudiolinClient.LaudiolinResponse = response.data;
					const laudiolinUsers = serverResponse.recentUsers.map((user) => {
						user.discordTag = `${user.username}#${user.discriminator}`;
						return user;
					});

					return {
						...serverResponse,
						recentUsers: laudiolinUsers,
					} as LaudiolinClient.LaudiolinResponse;
				}
			}
		})
		.catch((error) => {
			if (error instanceof AxiosError) {
				return {
					code: error.status, message: error.message,
					timestamp: Date.now(), recentUsers: []
				} as LaudiolinClient.LaudiolinResponse;
			} else {
				return {
					code: 500, message: error.message,
					timestamp: Date.now(), recentUsers: []
				} as LaudiolinClient.LaudiolinResponse;
			}
		});
	}

	public async getUser(userId: string): Promise<LaudiolinClient.LaudiolinUser> {
		const response = await this.get();
		const userMap = new Map<string, LaudiolinClient.LaudiolinUser>();
		response.onlineUsers.reduce((map, obj) => map.set(obj.userId, obj), userMap);

		return userMap.get(userId);
	}

	public async getPartials(userId: string): Promise<LaudiolinClient.LaudiolinPartialUser> {
		const response = await this.recent();
		const userMap = new Map<string, LaudiolinClient.LaudiolinPartialUser>();
		response.recentUsers.reduce((map, obj) => map.set(obj.userId, obj), userMap);

		return userMap.get(userId);
	}
}