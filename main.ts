import * as dotenv from "dotenv";
dotenv.config();

import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as rasterizer from "./rasterizer";

// Let the process crash on unhandled promises
process.on("unhandledRejection", err => { throw err; });

// Handle requests for the process to shut down
process.on("SIGTERM", async (errCode) => {
	//await chargePointScraper.dispose();
	process.exit(errCode ? errCode as any : 0);
});

if (!checkForEnvVars("PORT"))
	process.exit(-1);

console.log("Starting puppeteer...");
rasterizer.init().then(async () => {
	
	startServer();
});


async function startServer()
{
	const app = express();
	
	app.disable("etag"); // Disable 304 responses

	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(bodyParser.json());



	// app.get('/stationstatus', async (req, res, next) => {
		
	// 	//res.status(200).json();
	// });

	for (let i = 0; i < 10; i++)
		await rasterizer.convert("hithere");
	
	rasterizer.dispose();


	// app.listen(process.env.PORT || 5000, () => {
	// 	console.log("plugnomad server listening on port " + process.env.PORT || 5000);
	// });
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

