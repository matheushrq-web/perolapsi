import Link from "next/link";
import { redirect } from "next/navigation";
import { authMode, getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const mode = authMode();
  return (
    <main className="a-login">
      <div className="a-login__box">
        <span className="a-login__pearl" aria-hidden="true" />
        <h1>Painel do site</h1>
        <p className="a-login__sub">Pérola Martiniano · área restrita</p>
        {mode === "unconfigured" ? (
          <div className="f-note f-note--warn">
            <p>
              <strong>O acesso ainda não foi configurado.</strong>
            </p>
            <p>
              Defina <code>SESSION_SECRET</code> e as credenciais (<code>ADMIN_EMAIL</code> +{" "}
              <code>ADMIN_PASSWORD_HASH</code>, ou Supabase Auth com <code>ADMIN_EMAILS</code>) nas variáveis de
              ambiente. O passo a passo está no README do projeto.
            </p>
          </div>
        ) : (
          <LoginForm />
        )}
        <Link className="a-login__back" href="/">
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
