// Builds native code for arm64-v8a only. Every device the dApp Store serves (and Apple silicon emulators) is
// arm64, and shipping four ABIs roughly triples the APK size.
const { withGradleProperties } = require('expo/config-plugins')

module.exports = function withArm64Only(config) {
  return withGradleProperties(config, (config) => {
    const properties = config.modResults.filter((item) => item.key !== 'reactNativeArchitectures')
    properties.push({ key: 'reactNativeArchitectures', type: 'property', value: 'arm64-v8a' })
    config.modResults = properties
    return config
  })
}
