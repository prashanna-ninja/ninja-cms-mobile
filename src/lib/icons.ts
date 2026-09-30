/**
 * The app's icon set — import icons from HERE, never from "lucide-react-native".
 *
 * ⚠️ `import { X } from "lucide-react-native"` pulls in the package barrel, which
 * Metro does not tree-shake — ~1600 icons, ~3MB extra on Android (measured on
 * Ninja PRM mobile). The `lucide-react-native/icons/<kebab-name>` subpath (in
 * the package `exports` map) bundles only what we use.
 *
 * Adding an icon: find its kebab-case name at lucide.dev, add a line below.
 */

/* auth */
export { default as ArrowLeft } from "lucide-react-native/icons/arrow-left";
export { default as Eye } from "lucide-react-native/icons/eye";
export { default as EyeOff } from "lucide-react-native/icons/eye-off";
export { default as Lock } from "lucide-react-native/icons/lock";
export { default as LogOut } from "lucide-react-native/icons/log-out";
export { default as Mail } from "lucide-react-native/icons/mail";
export { default as MailCheck } from "lucide-react-native/icons/mail-check";
export { default as ShieldCheck } from "lucide-react-native/icons/shield-check";
