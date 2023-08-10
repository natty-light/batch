import type { BatchedJobExecutor, BatchedJobOptions, BatchedJobReducerOptions } from './types';

/**
 * Splits records into batches of length specified in batchingOptions.transactionSize, then calls executor on
 * each chunk, calling optional onSuccess or onFail callbacks as approriate, then applies a reducer method
 * provided at reducerOptions.reducer.
 * 
 * Executor must take in a single argument, the results. If the asynchronous function requires multiple static inputs,
 * you must pass in a closure: const executor = (results) => consumer(results, ...staticOptions);
 * @param executor Function or closure to be called on each chunk of records.
 * @param records Input for executor.
 * @param reducerOptions Struct containing reducer and accumulator. Implementation mimics Array.prototype.reduce().
 * @param batchingOptions Struct containing configuration options for batching.
 * @returns Concatenated results of all batched jobs
 */
export async function batchJob<T, K, U>(
  executor: BatchedJobExecutor<T, K>,
  records: T[],
  reducerOptions: BatchedJobReducerOptions<K, U>,
  batchingOptions: BatchedJobOptions<K>
  ): Promise<U> {
  const { reducer, accumulator } = reducerOptions;
  const { transactionSize, onBatchSuccess, onBatchError, retry } = batchingOptions;
  const total = records.length;

  let result: U = accumulator;
  let remaining = total;
  let step = 0;

  while (remaining > 0) {
    const start = step * transactionSize;
    const end = (step + 1) * transactionSize;
    const batch = records.slice(start, end);

    if (batch.length === 0) break;
    try {
      const batchResult = await executor(batch);
      remaining -= batch.length;
      result = reducer(batchResult, result);
      if (onBatchSuccess) onBatchSuccess(batchResult, { remaining, total, step, transactionSize })
      step++
    } catch (err) {
      if (onBatchError) onBatchError
      if (!retry) break;
    }
  }

  return result;
};

