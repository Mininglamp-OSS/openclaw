/**
 * Octo uses config-file-based auth (botToken in channels.octo.accounts.*),
 * not env vars. The runtime cannot detect configured state from env at boot time.
 * The gateway will start Octo only when explicitly configured (onStartup: false).
 */
export function hasOctoConfiguredState(_params: { env?: NodeJS.ProcessEnv }): boolean {
  return false;
}
