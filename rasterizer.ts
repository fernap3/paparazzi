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
	//page.setViewport({width: 800, height: 600});
}

export async function dispose()
{
	await browser.close();
}

export async function convert(html: string)
{
	await page.setContent(html);
	console.time("getting image");
	const imageBuffer = await page.screenshot({
		type: "png",
		encoding: "binary",
		clip: {x: 0, y: 0, width: 10, height: 10},
		path: `./${utils.guid()}.png`
	});
	console.timeEnd("getting image");
}