export const PRIME_POOL = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53,
] as const;

export type Prime = (typeof PRIME_POOL)[number];
