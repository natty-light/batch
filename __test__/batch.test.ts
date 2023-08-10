import { batchJob, concurrentBatchJob } from '../src/main';
import type { BatchedJobExecutor, BatchedJobOptions, BatchedJobReducerOptions } from '../src/types'

describe('batch', () => {
  const executor: BatchedJobExecutor<number, number> = async (records: number[]) => {
    return new Promise((resolve) => {
      let initialVal = 0;
      setTimeout(() => resolve({
        ok: true,
        result: records.reduce((val, acc) => val + acc, initialVal)
      }),10)
    })
  };

  const records: number[] = Array.from({length: 2_000_000}, (_, i) => i);

  const reducerOptions: BatchedJobReducerOptions<number, number> = {
    reducer: (val, acc) => val + acc,
    accumulator: 0,
  };

  const onSuccess = jest.fn((res) => res);
  const onError = jest.fn((err) => err);
  
  const jobOptions: BatchedJobOptions<number> = {
    transactionSize: 50_000,
    retry: false,
    onBatchSuccess: onSuccess,
    onBatchError: onError
  }

  it('Successful writes', async () => {
      const result = await batchJob(executor, records, reducerOptions, jobOptions)
      expect(result).toBe(1999999000000);
      expect(onSuccess).toBeCalledTimes(40);
      expect(onError).not.toBeCalled();
  })
})



describe('concurrent batch', () => {
  const executor: BatchedJobExecutor<number, number> = async (records: number[]) => {
    return new Promise((resolve) => {
      let initialVal = 0;
      setTimeout(() => resolve({
        ok: true,
        result: records.reduce((val, acc) => val + acc, initialVal)
      }),10)
    })
  };

  const records: number[] = Array.from({length: 2_000_000}, (_, i) => i);

  const reducerOptions: BatchedJobReducerOptions<number, number> = {
    reducer: (val, acc) => val + acc,
    accumulator: 0,
  };

  const onSuccess = jest.fn((res) => res);
  const onError = jest.fn((err) => err);
  
  const jobOptions: BatchedJobOptions<number> = {
    transactionSize: 50_000,
    retry: false,
    onBatchSuccess: onSuccess,
    onBatchError: onError
  }

  it('Successful writes', async () => {
      const result = await concurrentBatchJob(executor, records, reducerOptions, jobOptions)
      expect(result).toBe(1999999000000);
      expect(onSuccess).toBeCalledTimes(40);
      expect(onError).not.toBeCalled();
  })
})