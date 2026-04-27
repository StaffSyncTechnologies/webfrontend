const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Patches the Podfile to add modular_headers => true for Firebase Swift pods.
 * This fixes: "FirebaseCoreInternal depends upon GoogleUtilities, which does not define modules"
 * WITHOUT using use_frameworks! (which breaks React Native Obj-C headers).
 */
function withFirebasePodfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      const patch = [
        "  # Firebase Swift pods require modular headers (do not use use_frameworks!)",
        "  pod 'GoogleUtilities', :modular_headers => true",
        "  pod 'FirebaseCoreInternal', :modular_headers => true",
        "",
      ].join('\n');

      const insertBefore = '  use_react_native!(';

      if (!contents.includes("pod 'GoogleUtilities', :modular_headers => true")) {
        contents = contents.replace(insertBefore, patch + insertBefore);
        fs.writeFileSync(podfilePath, contents);
        console.log('[withFirebasePodfile] Patched Podfile with Firebase modular headers.');
      }

      return config;
    },
  ]);
}

module.exports = withFirebasePodfile;
