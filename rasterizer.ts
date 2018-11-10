import * as puppeteer from "puppeteer";
import * as utils from "./utils";

let browser: puppeteer.Browser;
let page: puppeteer.Page;

export async function init(html: string)
{
	if (browser)
		throw "Puppeteer already initialized";
	
	browser = await puppeteer.launch({
		headless: true
	});

	page = await browser.newPage();
	page.setViewport({width: 800, height: 600});

	await page.setContent(html);
}

export async function dispose()
{
	await browser.close();
}

export async function screenshot(updateFunction: string, updateData: any, cropHeight: number, cropWidth: number): Promise<Buffer>
{
	console.time("runscript");

	await page.evaluate((updateFunction, updateData) => {
		if (typeof window[updateFunction] !== "function")
			throw "updateFunction must be the name of a function in window";
		
		window[updateFunction](updateData);
	}, updateFunction, updateData);

	console.timeEnd("runscript");
	
	
	console.time("screenshotting");
	const imageBuffer = await page.screenshot({
		type: "png",
		encoding: "binary",
		clip: { x: 0, y: 0, width: cropWidth, height: cropHeight },
		//path: `./${utils.guid()}.png`
	});
	console.timeEnd("screenshotting");

	return imageBuffer;
}