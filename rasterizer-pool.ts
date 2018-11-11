import Rasterizer from "./rasterizer";

const availablePool = new Set<Rasterizer>();
const inUsePool = new Set<Rasterizer>();
const waiters = [] as ((value: Rasterizer) => void)[];

export async function reserve(): Promise<Rasterizer>
{
	if (availablePool.size)
	{
		const rasterizer = [...availablePool][0];
		availablePool.delete(rasterizer);
		inUsePool.add(rasterizer);
		return rasterizer;
	}
	else
	{
		let r;
		const p = new Promise<Rasterizer>((resolve, reject) =>
		{
			r = resolve;
		});

		waiters.push(r);
		return p;
	}
}

export function release(r: Rasterizer): void
{
	if (availablePool.has(r))
	{
		console.log("Warning: releasing Rasterizer that was not already in use");
		return;
	}

	if (!inUsePool.has(r))
		throw "Error: Tried to release Rasterizer that is not owned by the pool";

	if (waiters.length)
	{
		// If there is already someone waiting in line to grab the next available
		// rasterizer, then don't bother returning the rasterizer to the pool,
		// just pass it to the next waiter.
		const nextWaiter = waiters.shift();
		nextWaiter(r);
	}
	else
	{
		// No one is waiting for a rasterizer, return it to the pool
		inUsePool.delete(r);
		availablePool.add(r);
	}
}

export async function init(size: string)
{
	return Promise.all([...availablePool].map(r => r.init()));
}

export async function dispose(r: Rasterizer)
{
	return Promise.all([...availablePool, ...inUsePool].map(r => r.dispose()));
}
