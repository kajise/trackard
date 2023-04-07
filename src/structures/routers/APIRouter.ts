import express from "express";
const router = express.Router();
import { LaudiolinClient } from "../utils/laudiolin/LaudiolinClient";
import { LaudiolinVector } from "../utils/laudiolin/LaudiolinVector";

export default (rest: LaudiolinClient) => {
	router.get('/isListening', async (req, res) => {
		const userId = req.query.user;
		if (!userId) return res.json({ status: 500, code: "missing_user_notify", message: "Target user query is missing from the URL." });
	
		const user: LaudiolinClient.LaudiolinUser = await rest.getUser(userId as string);
		if (!user || !user.listeningTo || typeof user.listeningTo !== "object") return res.json({ status: 500, code: "laudiolin_state_notify", message: "The user queried is not using rest at the moment." });
	
		return res.json({ status: 200, code: "laudiolin_state_notify", message: user.listeningTo });
	});

	router.get('/render', async (req, res) => {
		const userId = req.query.user;
		const themeId = req.query.theme;

		if (!userId) return res.status(500).json({ code: 500, message: "Target user query is missing from the URL." });
		if (themeId && !['dark', 'light'].includes((themeId as string).toLowerCase())) return res.status(500).json({ code: 500, message: `${themeId as string} isn't a part of the default color palettes (dark/light).` });
	
		const user = await rest.getUser(userId as string);
		const vector = new LaudiolinVector(themeId as string, user);
		const renderedVector = await vector.render();
		let etag = (await import('crypto')).createHash('md5').update(`${Date.now().toString()}-rf6`).digest('hex');

		res.set("Etag", etag);
		res.setHeader("Content-type", "image/svg+xml");
		res.set("Cache-Control", "no-cache, no-store");
		res.set("Expire", (new Date(Date.now() + 60000)).toUTCString());
		return res.send(Buffer.from(renderedVector, "utf-8"));
	});

	return router;
}