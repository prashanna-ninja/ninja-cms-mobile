package expo.modules.ninjaappicon

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android per-org launcher icons (docs/08-APP-ICONS.md §6).
 *
 * The manifest (plugins/with-android-icon-aliases.js) has:
 *  - `.MainActivity`: the real activity, deep links, NO launcher entry, and it is never disabled;
 *  - `.MainActivityDefault`: the launcher alias for the default icon (enabled in the manifest);
 *  - `.MainActivity<Name>`: one launcher alias per org icon (disabled in the manifest).
 *
 * Switching enables one alias and disables the other aliases. It never touches `.MainActivity`,
 * unlike expo-alternate-app-icons, which disabled it and broke explicit launches.
 */
class NinjaAppIconModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private fun alias(name: String) = ComponentName(context.packageName, "${context.packageName}.MainActivity$name")

  override fun definition() = ModuleDefinition {
    Name("NinjaAppIcon")

    OnCreate {
      // An older build (expo-alternate-app-icons) may have disabled the real activity. Put it back.
      runCatching {
        val main = ComponentName(context.packageName, "${context.packageName}.MainActivity")
        if (context.packageManager.getComponentEnabledSetting(main) == PackageManager.COMPONENT_ENABLED_STATE_DISABLED) {
          context.packageManager.setComponentEnabledSetting(main, PackageManager.COMPONENT_ENABLED_STATE_DEFAULT, PackageManager.DONT_KILL_APP)
        }
      }
    }

    /** The org icon on the home screen, or null for the default. `names` = every org icon name. */
    Function("getIcon") { names: List<String> ->
      val pm = context.packageManager
      names.firstOrNull { name ->
        runCatching { pm.getComponentEnabledSetting(alias(name)) == PackageManager.COMPONENT_ENABLED_STATE_ENABLED }.getOrDefault(false)
      }
    }

    /** Show `name` (null = default). Enables the new alias first so the app always has a launcher entry. */
    Function("setIcon") { name: String?, names: List<String> ->
      val pm = context.packageManager
      val target = name ?: "Default"
      pm.setComponentEnabledSetting(alias(target), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
      for (other in names + "Default") {
        if (other == target) continue
        runCatching {
          pm.setComponentEnabledSetting(alias(other), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
        }
      }
    }
  }
}
