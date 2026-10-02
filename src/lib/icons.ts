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

/* orgs / portal */
export { default as ArrowLeftRight } from "lucide-react-native/icons/arrow-left-right";
export { default as ArrowRight } from "lucide-react-native/icons/arrow-right";
// lucide 1.x renamed `building-2` → `building` (web CMS uses Building2).
export { default as Building } from "lucide-react-native/icons/building";
export { default as RefreshCw } from "lucide-react-native/icons/refresh-cw";

/* notices / content */
export { default as ArrowUpDown } from "lucide-react-native/icons/arrow-up-down";
export { default as Bell } from "lucide-react-native/icons/bell";
export { default as Calendar } from "lucide-react-native/icons/calendar";
export { default as ChevronDown } from "lucide-react-native/icons/chevron-down";
export { default as ChevronUp } from "lucide-react-native/icons/chevron-up";
export { default as CirclePlay } from "lucide-react-native/icons/circle-play";
export { default as ClipboardList } from "lucide-react-native/icons/clipboard-list";
export { default as ExternalLink } from "lucide-react-native/icons/external-link";
export { default as FileText } from "lucide-react-native/icons/file-text";
export { default as ImageIcon } from "lucide-react-native/icons/image";
export { default as Inbox } from "lucide-react-native/icons/inbox";
export { default as Paperclip } from "lucide-react-native/icons/paperclip";
