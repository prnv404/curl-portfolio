import fs from "fs/promises";
import { Readable } from "stream";
import http from "http";
import path from "path";

const streamer = async (stream: Readable) => {
	const text = (await fs.readFile(path.resolve("src/text.txt"))).toString("utf8");
	let index = 0;

	const interval = setInterval(() => {
		if (index < text.length) {
			stream.push(text[index].toString());
			index++;
		} else {
			stream.push(null);
			clearInterval(interval);
		}
	}, 50);
	return interval;
};

const server = http.createServer(async (req, res) => {
	if (req.url === "/healthcheck") {
		res.writeHead(200, { "Content-Type": "application/json" });
		return res.end(JSON.stringify({ status: "ok" }));
	}
	if (req.headers && req.headers["user-agent"] && !req.headers["user-agent"].includes("curl")) {
		res.writeHead(302, { Location: "https://github.com/prnv404" });
		return res.end();
	}

	const stream = new Readable({
		read() {}
	});

	stream.pipe(res);

	await streamer(stream);

	req.on("close", () => {
		stream.destroy();
	});
});

server.listen(3001, () => {
	console.log(`server is listening on port 3000`);
});
