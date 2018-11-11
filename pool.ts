export default class Pool<T>
{
	private availablePool = new Set<T>();
	private inUsePool = new Set<T>();
	private waiters = [] as ((value: T) => void)[];

	public async reserve(): Promise<T>
	{
		if (this.availablePool.size)
		{
			const T = [...this.availablePool][0];
			this.availablePool.delete(T);
			this.inUsePool.add(T);
			return T;
		}
		else
		{
			let r;
			const p = new Promise<T>((resolve, reject) =>
			{
				r = resolve;
			});

			this.waiters.push(r);
			return p;
		}
	}

	public release(o: T): void
	{
		if (this.availablePool.has(o))
		{
			console.log("Warning: releasing pool object that was not already in use");
			return;
		}

		if (!this.inUsePool.has(o))
			throw "Error: Tried to release pool object that is not owned by the pool";

		if (this.waiters.length)
		{
			// If there is already someone waiting in line to grab the next available
			// pool object, then don't bother returning the object to the pool,
			// just pass it to the next waiter.
			const nextWaiter = this.waiters.shift();
			nextWaiter(o);
		}
		else
		{
			// No one is waiting for a pool object, return it to the pool
			this.inUsePool.delete(o);
			this.availablePool.add(o);
		}
	}

	public add(o: T): void
	{
		this.availablePool.add(o);
	}

	public all(): T[]
	{
		return [...this.availablePool, ...this.inUsePool];
	}
}

