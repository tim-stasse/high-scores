import { Cursors } from '@schema/generated';

export type ListData<TData> = {
  data: TData[];
  cursors: Cursors;
};
