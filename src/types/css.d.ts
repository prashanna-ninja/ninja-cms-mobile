// TS 6 checks side-effect imports (noUncheckedSideEffectImports) — declare CSS so
// `import "../global.css"` (NativeWind entry) typechecks.
declare module "*.css";
