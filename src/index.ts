type BatchedJobExecutor<T, K> = (records: T[]) => Promise<K>;
type BatchedJobSuccessCallback<K> = (result: K, progress?: BatchedJobProgressInformation) => void;
type BatchedJobErrorCallback = (err: unknown) => void;
type BatchedJobReducer<K, U> = (result: K, accumulator: U) => U;
type BatchedJobReducerOptions<K, U> = {
  reducer: BatchedJobReducer<K, U>
  accumulator: U
}
type BatchedJobOptions<K> = {
  // Size of chunk for each batch
  transactionSize: number;
  // Function to be called on successful batch transaction
  onBatchSuccess?: BatchedJobSuccessCallback<K>;
  // Function to be called on failed batch transaction
  onBatchError?: BatchedJobErrorCallback
  // Should a failed transaction be retried 
  retry: boolean
}
type BatchedJobProgressInformation = {
  // Number of records remaining to be processed
  remaining: number,
  // Which chunk is being processed
  step: number,
  // Value passed in BatchedJobOptions
  transactionSize: number,
  // Number of records to be processed
  total: number,
}

async function batchJob<T, K, U>(
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
    } catch (err) {
      if (onBatchError) onBatchError
      if (!retry) break;
    }
  }

  return result;
};
