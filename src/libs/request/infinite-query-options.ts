import { infiniteQueryOptions as infiniteQueryOptionsPrimitive } from '@tanstack/react-query';
import type {
  InfiniteData,
  UseInfiniteQueryOptions as TUseInfiniteQueryOptions,
  DefaultError,
  QueryKey,
} from '@tanstack/react-query';

export interface InfiniteDataWithMeta<TData> {
  data: TData[];
  meta?: {
    totalRows: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export const getNextPageParam = <TData>(lastPage: InfiniteDataWithMeta<TData>) => {
  const meta = lastPage.meta;

  if (!meta || meta.currentPage >= meta.totalPages) {
    return undefined;
  }

  return meta.currentPage + 1;
};

export const flattenInfiniteData = <TData>(
  pages: InfiniteDataWithMeta<TData>[] | undefined,
  target: keyof TData,
): TData[] => {
  if (!pages) {
    return [];
  }

  const seen = new Set<string>();
  const data = [];

  for (const page of pages) {
    for (const item of page.data) {
      const id = String(item[target]);

      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      data.push(item);
    }
  }

  return data;
};

export type UseInfiniteQueryOptions<TData, TError = DefaultError> = TUseInfiniteQueryOptions<
  InfiniteDataWithMeta<TData>,
  TError,
  InfiniteData<InfiniteDataWithMeta<TData>, number>,
  QueryKey,
  number
>;

export const infiniteQueryOptions = <TData, TError = DefaultError>(
  options: Omit<UseInfiniteQueryOptions<TData, TError>, 'initialPageParam' | 'getNextPageParam'>,
) => {
  return infiniteQueryOptionsPrimitive({
    ...options,
    initialPageParam: 1,
    getNextPageParam: getNextPageParam,
  });
};
