import { ValueTransformer } from 'typeorm';

/** Converts Postgres decimal strings back to JS numbers on read. */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null | undefined) =>
    value == null ? null : parseFloat(String(value)),
};
