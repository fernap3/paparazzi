import Rasterizer from "./rasterizer";

const availablePool = new Set<Rasterizer>();
const inUsePool = new Set<Rasterizer>();
const operationQueue = [] as QueueItem[];

export async function init(size: string)
{
	return Promise.all([...availablePool].map(r => r.init()));
}

export async function setHtml(html: string)
{
	if (inUsePool.size)
		throw "setHtml not yet supported while pool operations still pending.  Try calling setHtml when there are no pending requests.";
	
	return Promise.all([...availablePool].map(r => r.setHtml(html)));
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
	return Promise.all([...availablePool, ...inUsePool].map(r => r.dispose()));
}

function tryDequeue()
{
	if (operationQueue.length === 0)
		return; // Nothing to do

	if (availablePool.size === 0)
		return; // No rasterizers available

	const rasterizer = [...availablePool][0];
	availablePool.delete(rasterizer);
	inUsePool.add(rasterizer);

	const op = operationQueue.shift();
	op.f(rasterizer).then(() => {
		inUsePool.delete(rasterizer);
		availablePool.add(rasterizer);
		tryDequeue();
	});
}

interface QueueItem
{
	f: (r: Rasterizer) => Promise<void>;
}

