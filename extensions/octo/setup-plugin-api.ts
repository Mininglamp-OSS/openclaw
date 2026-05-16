// Keep bundled setup entry imports narrow so setup loads do not pull the
// broader Octo channel plugin surface.
export { octoSetupPlugin } from "./src/channel.setup.js";
