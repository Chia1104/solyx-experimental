import * as z from 'zod';

export const SignInRequest = z.object({
  state: z.string(),
  redirectUrl: z.string(),
  code: z.string(),
});

export type SignInRequest = z.infer<typeof SignInRequest>;

export const CefiAuthTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type CefiAuthTokens = z.infer<typeof CefiAuthTokens>;

export const RefreshTokenRequest = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequest>;
