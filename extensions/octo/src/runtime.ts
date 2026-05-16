import type { PluginRuntime } from "openclaw/plugin-sdk";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";

const {
  setRuntime: setDmworkRuntime,
  tryGetRuntime: getOptionalDmworkRuntime,
  getRuntime: getDmworkRuntime,
} = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "octo",
  errorMessage: "Octo runtime not initialized",
});

export { getDmworkRuntime, getOptionalDmworkRuntime, setDmworkRuntime };
