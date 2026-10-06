import { AuthPage } from "@/components/auth/AuthPage";
export const metadata = { title: "Recuperar acceso", robots: { index: false } };
export default function Page() {
  return <AuthPage mode="forgot" />;
}
