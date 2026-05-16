// Keep bundled setup entry imports narrow so setup loads do not pull the
// broader Octo channel plugin surface.
export { dmworkPlugin as octoSetupPlugin } from "./src/channel.js";
