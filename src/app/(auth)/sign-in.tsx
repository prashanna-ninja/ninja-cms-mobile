import { AuthScreen } from "@/components/login/auth-screen";
import { LoginForm } from "@/components/login/login-form";

/** Email + password sign-in. Thin route: the shell + the form. */
export default function SignInScreen() {
  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Your adviser portal — notices, content and client tools, in your pocket."
    >
      <LoginForm />
    </AuthScreen>
  );
}
