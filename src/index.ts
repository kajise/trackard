import express from "express";
import filesystem from "fs";
import path from "path";
const server = express();
const port = process.env.PORT || 3000;

import { LaudiolinClient } from "./structures/utils/laudiolin/LaudiolinClient";
const Laudiolin = new LaudiolinClient("https://your.laudiolin.rest");
import APIRouter from "./structures/routers/APIRouter";

server.get('/', (req, res) => {
	const homepage = filesystem.readFileSync(path.join(process.cwd(), "assets", "homepage.html"));
	return res.status(200).setHeader("Content-type", "text/html").send(homepage);
});

server.use('/api/v1/', APIRouter(Laudiolin));
server.listen(port);