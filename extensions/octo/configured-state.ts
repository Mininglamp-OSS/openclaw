// Octo uses config-based auth (botToken in config), not env vars.
export function hasOctoConfiguredState(_params: { env?: NodeJS.ProcessEnv }): boolean {
  return false;
}
