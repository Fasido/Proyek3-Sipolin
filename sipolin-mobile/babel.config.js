module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... plugin lain kalau ada (misal tailwind/nativewind)
      'react-native-reanimated/plugin', // WAJIB DI BARIS TERAKHIR PLUGIN
    ],
  };
};