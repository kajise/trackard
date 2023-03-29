import express from "express";
import filesystem from "fs";
import path from "path";
const server = express();

import { LaudiolinREST } from "./structures/rest/LaudiolinREST";
const Laudiolin = new LaudiolinREST("https://your.laudiolin.rest");

server.get('/status', async (req, res) => {
	const userId = req.query.user;
	if (!userId) return res.status(500).json({ code: 500, message: "Target user query is missing from the URL." });
	res.setHeader("Content-type", "image/svg+xml");

	const user = await Laudiolin.getUser(userId as string);
	const offline = filesystem.readFileSync(path.join(process.cwd(), "assets", "trackard-missing.svg"));
	if (!user || !user.listeningTo || typeof user.listeningTo !== "object") return res.status(500).send(offline);

	const thumbnail = await Laudiolin.getThumbnailBuffer(user.listeningTo);
	const vector = filesystem.readFileSync(path.join(process.cwd(), "assets", "trackard.svg"), { encoding: "utf-8" });
	const finalVector: string = Laudiolin.generateDetails(Buffer.from(vector.replace(/<\s*trackThumb\s*>/, thumbnail.toString("base64")), "utf-8"), user);

	return res.status(200).send(Buffer.from(finalVector, "utf-8"));
});

server.listen(3000);