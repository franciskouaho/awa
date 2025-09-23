/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: 'widget',
  name: 'Prayer Widget',
  icon: '../../assets/images/icon.png',
  colors: {
    $accent: '#F09458',
    $widgetBackground: '#DB739C',
  },
  bundleIdentifier: `${config.ios.bundleIdentifier}.widget`, // Widget needs different bundle ID
  entitlements: {
    // Use the same app groups as the main app:
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
