import type { PluginRuntime } from "openclaw/plugin-sdk";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";

const {
  setRuntime: setOctoRuntime,
  tryGetRuntime: getOptionalOctoRuntime,
  getRuntime: getOctoRuntime,
} = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "octo",
  errorMessage: "Octo runtime not initialized",
});

export { getOctoRuntime, getOptionalOctoRuntime, setOctoRuntime };
