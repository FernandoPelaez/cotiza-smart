import { AuthPage } from "@/components/auth/AuthPage";
export const metadata = {
  title: "Cambiar contraseña",
  robots: { index: false },
};
export default function Page() {
  return <AuthPage mode="reset" />;
}
