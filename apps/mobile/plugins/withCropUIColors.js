const { withAndroidColors, AndroidConfig } = require('@expo/config-plugins');

// The expo-image-picker crop activity reads these named color resources.
// The library ships with expoCropToolbarColor = #00000000 (transparent), which
// makes the back/rotate/crop buttons invisible against the photo. Override them
// here so the toolbar is white with dark icons.
module.exports = (config) => {
  return withAndroidColors(config, (modConfig) => {
    const colors = [
      { name: 'expoCropToolbarColor',           value: '#FFFFFF' },
      { name: 'expoCropToolbarIconColor',        value: '#1a1c23' },
      { name: 'expoCropToolbarActionTextColor',  value: '#1a1c23' },
      { name: 'expoCropBackButtonIconColor',     value: '#1a1c23' },
      { name: 'expoCropBackgroundColor',         value: '#FFFFFF' },
    ];

    for (const { name, value } of colors) {
      modConfig.modResults = AndroidConfig.Colors.assignColorValue(
        modConfig.modResults,
        { name, value }
      );
    }

    return modConfig;
  });
};
