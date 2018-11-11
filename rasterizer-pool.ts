import Rasterizer from "./rasterizer";

const pool = [] as Rasterizer[];
const operationQueue = [] as QueueItem[];

export async function init(size: string)
{
	return Promise.all(pool.map(r => r.init()));
}

export async function setHtml(html: string)
{
	if (operationQueue.length)
		throw "setHtml not yet supported while pool operations still pending.  Try calling setHtml when there are no pending requests.";
	
	return Promise.all(pool.map(r => r.setHtml(html)));
}

export async function screenshot(updateFunction: string, updateData: any, cropHeight: number, cropWidth: number): Promise<Buffer>
{
	let resolver;
	const p = new Promise<Buffer>((resolve, reject) => {
		resolver = resolve;
	});
	
	operationQueue.push({
		f: async (r) => {
			resolver(await r.screenshot(updateFunction, updateData, cropHeight, cropWidth));
		}
	});

	tryDequeue();

	return p;
}

export async function dispose()
{
	return Promise.all(pool.map(r => r.dispose()));
}

function tryDequeue()
{
	
}

interface QueueItem
{
	f: (r: Rasterizer) => void;
}