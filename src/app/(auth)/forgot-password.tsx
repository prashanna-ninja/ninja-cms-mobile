import { AuthScreen } from "@/components/login/auth-screen";
import { ForgotPasswordForm } from "@/components/login/forgot-password-form";

/** Request a password-reset email (the reset itself finishes on the web). */
export default function ForgotPasswordScreen() {
  return (
    <AuthScreen
      title="Forgot your password?"
      subtitle="It happens. We'll email you a secure link to set a new one."
    >
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
