import * as puppeteer from "puppeteer";
import * as utils from "./utils";

export default class Rasterizer
{
	private browser: puppeteer.Browser;
	private page: puppeteer.Page;
	
	constructor()
	{
	}

	public async init()
	{
		if (this.browser)
			throw "This Rasterizer instance has already been initialized";
		
		this.browser = await puppeteer.launch({
			headless: true
		});

		this.page = await this.browser.newPage();
		await this.page.setViewport({width: 800, height: 600});
	}

	public async setHtml(html: string)
	{
		await this.page.setContent(html);
	}

	public async dispose()
	{
		await this.browser.close();
	}

	public async screenshot(updateFunction: string, updateData: any, cropHeight: number, cropWidth: number): Promise<Buffer>
	{
		console.time("runscript");

		await this.page.evaluate((updateFunction, updateData) => {
			if (typeof window[updateFunction] !== "function")
				throw "updateFunction must be the name of a function in window";
			
			return window[updateFunction](updateData);
		}, updateFunction, updateData);

		console.timeEnd("runscript");
		
		
		console.time("screenshotting");
		const imageBuffer = await this.page.screenshot({
			type: "png",
			encoding: "binary",
			clip: { x: 0, y: 0, width: cropWidth, height: cropHeight },
			//path: `./${utils.guid()}.png`
		});
		console.timeEnd("screenshotting");

		return imageBuffer;
	}
}
