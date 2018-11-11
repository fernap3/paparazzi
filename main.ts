import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as bodyParser from "body-parser";
import Rasterizer from "./rasterizer";
import RasterizerPool from "./pool";

// Let the process crash on unhandled promises
process.on("unhandledRejection", err => { throw err; });

// Handle requests for the process to shut down
process.on("SIGTERM", async (errCode) => {
	//await chargePointScraper.dispose();
	process.exit(errCode ? errCode as any : 0);
});

if (!checkForEnvVars("PORT", "POOL_SIZE"))
	process.exit(-1);

const pool = new RasterizerPool<Rasterizer>();

startServer();

async function startServer()
{
	const poolSize = parseInt(process.env.POOL_SIZE);

	if (isNaN(poolSize) || poolSize <= 0)
		throw "POOL_SIZE env variable must be > 0";

	console.log(`Starting ${poolSize} Puppeteer instance${poolSize > 1 ? "S" : ""}`);

	for (let i = 0; i < poolSize; i++)
	{
		const r = new Rasterizer();
		await r.init();
		pool.add(r);
	}
	
	const app = express();
	
	app.disable("etag"); // Disable 304 responses

	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(bodyParser.json({limit: "50mb"}));

	app.post("/html", async (req, res, next) =>
	{
		const html = req.body.html;
		
		if (!html)
		{
			res.status(400).json({
				error: "Request body must have the following schema: { html: string }"
			} as ConvertErrorResponse);

			return;
		}

		const r = await pool.reserve();

		try {
			await r.setHtml(html);
		}
		finally	{
			pool.release(r);
		}

		res.status(200).send();
	});

	app.post("/image", async (req, res, next) =>
	{
		const updateFunction = req.body.updateFunction;
		const updateData = req.body.updateData;
		const height = req.body.height;
		const width = req.body.width;
		if (!updateFunction || !updateData || !height || !width)
		{
			res.status(400).json({
				error: "Request body must have the following schema: { updateFunction: string, updateData: any, height: number, width: number }"
			} as ConvertErrorResponse);

			return;
		}

		const r = await pool.reserve();
		let imageBuffer: Buffer;
		try {
			imageBuffer = await r.screenshot(updateFunction, updateData, height, width);
		}
		finally	{
			pool.release(r);
		}

		res.writeHead(200, {
			"Content-Type": "image/png",
			"Content-disposition": `attachment;filename=export.png`,
			"Content-Length": imageBuffer.length
		});

		res.end(imageBuffer);
	});


	app.listen(process.env.PORT || 5000, () => {
		console.log("plugnomad server listening on port " + process.env.PORT || 5000);
	});
}

function checkForEnvVars(...varNames: string[]): boolean
{
	const missingVars = [] as string[];

	for (let varName of varNames)
	{
		if (process.env[varName] === undefined)
			missingVars.push(varName);
	}

	if (missingVars.length > 0)
	{
		console.error(`The following required application variables are undefined: ${missingVars.join(", ")}\n\nMake sure a file called ".env" exists in this application's root directory with the following format:\n\nVARNAME1=VARNAME1_VALUE\nVARNAME2=VARNAME2_VALUE\netc...`);
		return false;
	}

	return true;
}

interface ConvertErrorResponse
{
	error: string;
}