import * as puppeteer from "puppeteer";
import * as utils from "./utils";

let browser: puppeteer.Browser;
let page: puppeteer.Page;

export async function init()
{
	browser = await puppeteer.launch({
		headless: true
	});

	page = await browser.newPage();
	page.setViewport({width: 800, height: 600});
}

export async function dispose()
{
	await browser.close();
}

export async function convert(html: string, cropHeight: number, cropWidth: number): Promise<Buffer>
{
	await page.setContent(html);
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