/** @type {import('@kingstinct/expo-apple-targets/build/config-plugin').Config} */
const withTargetsDir = require("@kingstinct/expo-apple-targets/build/config-plugin");
const { createRunOncePlugin } = require("expo/config-plugins");

const withCopyTargetFolder = require("./config-plugin/withCopyTargetFolder");
const withEntitlementsPlugin = require("./config-plugin/withEntitlements");
const pkg = require("./package.json");

/** @type {import('@expo/config-plugins').ConfigPlugin<{ appleTeamId: string; match?: string; appGroup: string; copyToTargetFolder?: boolean }>} */
const withActivityMonitorExtensionPlugin = (config, props) => {
  if (!props || !props.appGroup || typeof props.appleTeamId !== "string") {
    throw Error(
      "'appGroup' and 'appleTeamId' props are required for react-native-device-activity config plugin",
    );
  }

  return withTargetsDir(
    withEntitlementsPlugin(withCopyTargetFolder(config, props), props),
    props,
  );
};

module.exports = createRunOncePlugin(
  withActivityMonitorExtensionPlugin,
  pkg.name,
  pkg.version,
);
