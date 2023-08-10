export type BatchedJobExecutor<T, K> = (records: T[]) => Promise<BatchedJobReturn<K, unknown>>;
export type BatchedJobReturn<K, E = undefined> = { ok: true, result: K } | {ok: false, error?: E}
export type BatchedJobSuccessCallback<K> = (result: K, progress?: BatchedJobProgressInformation) => void;
export type BatchedJobErrorCallback = (err: unknown) => void;
export type BatchedJobReducer<K, U> = (result: K, accumulator: U) => U;
export type BatchedJobReducerOptions<K, U> = {
  reducer: BatchedJobReducer<K, U>
  accumulator: U
}
export type BatchedJobOptions<K> = {
  // Size of chunk for each batch
  transactionSize: number;
  // Function to be called on successful batch transaction
  onBatchSuccess?: BatchedJobSuccessCallback<K>;
  // Function to be called on failed batch transaction
  onBatchError?: BatchedJobErrorCallback
  // Should a failed transaction be retried 
  retry: boolean
}
export type BatchedJobProgressInformation = {
  // Number of records remaining to be processed
  remaining: number,
  // Which chunk is being processed
  step: number,
  // Value passed in BatchedJobOptions
  transactionSize: number,
  // Number of records to be processed
  total: number,
}

