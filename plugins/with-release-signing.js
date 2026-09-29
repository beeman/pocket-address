// Adds a `release` signingConfig to android/app/build.gradle and makes the release build type use it,
// so the config survives `expo prebuild --clean`. Credentials are never stored in the repo: Gradle reads
// them from ~/.gradle/gradle.properties or from environment variables of the same name.
const { withAppBuildGradle } = require('expo/config-plugins')

const MARKER = '// @generated with-release-signing'

const SIGNING_CONFIG = `
        release {
            ${MARKER}
            def signingValue = { String name -> findProperty(name) ?: System.getenv(name) }
            def storeFilePath = signingValue('POCKET_ADDRESS_UPLOAD_STORE_FILE')
            if (storeFilePath) {
                storeFile file(storeFilePath)
                storePassword signingValue('POCKET_ADDRESS_UPLOAD_STORE_PASSWORD')
                keyAlias signingValue('POCKET_ADDRESS_UPLOAD_KEY_ALIAS')
                keyPassword signingValue('POCKET_ADDRESS_UPLOAD_KEY_PASSWORD')
            }
        }`

const GUARD = `
${MARKER}
// Refuse to produce a release APK without the release key, instead of silently signing it with the debug key.
gradle.taskGraph.whenReady { graph ->
    def wantsRelease = graph.allTasks.any { it.project == project && it.name.toLowerCase().contains('release') }
    if (wantsRelease && !android.signingConfigs.release.storeFile) {
        throw new GradleException('Release signing is not configured. Set POCKET_ADDRESS_UPLOAD_STORE_FILE and friends in ~/.gradle/gradle.properties or the environment (see README.md).')
    }
}
`

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents
    if (gradle.includes(MARKER)) {
      return config
    }
    const signingConfigs = /signingConfigs\s*\{/
    const releaseBuildType = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/
    if (!signingConfigs.test(gradle) || !releaseBuildType.test(gradle)) {
      throw new Error('with-release-signing: android/app/build.gradle does not have the expected shape')
    }
    gradle = gradle.replace(signingConfigs, (match) => match + SIGNING_CONFIG)
    gradle = gradle.replace(releaseBuildType, '$1signingConfig signingConfigs.release')
    config.modResults.contents = gradle + GUARD
    return config
  })
}
