module.exports = function (api) {
  api.cache(true);
  return {
    // NativeWind v4: className support via the jsx runtime + its babel plugin.
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
  };
};
