export const SsoMode = {
  Login: 'login',
  SignUp: 'signUp',
} as const;

export type SsoMode = (typeof SsoMode)[keyof typeof SsoMode];
