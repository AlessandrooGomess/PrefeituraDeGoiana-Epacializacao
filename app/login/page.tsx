"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes initial state with browser storage.
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    router.push("/area-do-servidor");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#F9F9FF] p-4 sm:p-6 lg:p-12">
      <div className="absolute top-0 left-0 h-2 w-full bg-[#00346F]" />

      <div className="flex h-auto w-full max-w-5xl overflow-hidden rounded-sm border border-[#C2C6D3] bg-white shadow-sm md:h-full md:max-h-150">
        <div className="relative hidden flex-1 flex-col items-start justify-between border-r border-[#C2C6D3] bg-[#EDEDF5] p-8 md:flex lg:p-12">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder.png"
              alt=""
              className="h-full w-full object-cover opacity-20"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 flex w-full flex-col gap-1">
            <div className="mb-4 inline-flex items-center justify-start gap-2 text-[#1170D6]">
              <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
                <path d="M0 24V0H13.3333V5.33333H26.6667V24H0ZM2.66667 21.3333H5.33333V18.6667H2.66667V21.3333ZM2.66667 16H5.33333V13.3333H2.66667V16ZM2.66667 10.6667H5.33333V8H2.66667V10.6667ZM2.66667 5.33333H5.33333V2.66667H2.66667V5.33333ZM8 21.3333H10.6667V18.6667H8V21.3333ZM8 16H10.6667V13.3333H8V16ZM8 10.6667H10.6667V8H8V10.6667ZM8 5.33333H10.6667V2.66667H8V5.33333ZM13.3333 21.3333H24V8H13.3333V10.6667H16V13.3333H13.3333V16H16V18.6667H13.3333V21.3333ZM18.6667 13.3333V10H21.3333V13.3333H18.6667ZM18.6667 18.6667V16H21.3333V18.6667H18.6667Z" fill="#1170D6" />
              </svg>
              <h1 className="font-sans text-[32px] leading-10 font-bold">Prefeitura de Goiana</h1>
            </div>

            <h2 className="mt-1 font-sans text-[24px] leading-8 font-semibold text-[#191C21]">
              Portal de Infraestrutura
            </h2>

            <p className="mt-4 max-w-md font-sans text-[18px] leading-7 text-[#121C2C]">
              Sistema centralizado para gestão, monitoramento e transparência de obras públicas e infraestrutura.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-start justify-center bg-white p-6 sm:p-8 lg:p-12">
          <div className="mb-6 w-full lg:mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-goiana.png" alt="Logo de Goiana" className="mb-6 h-19 w-auto object-contain" />
            <h2 className="mb-1 font-sans text-[32px] leading-8 font-semibold text-[#191C21]">Acesso ao Sistema</h2>
            <p className="font-sans text-[16px] text-[#121C2C]">Insira suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full max-w-103.75 flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-sans text-[13px] font-medium tracking-[0.6px] text-[#121C2C] uppercase">E-mail</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-5 w-5 text-[#737783]" aria-hidden="true" />
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required placeholder="Digite seu e-mail" className="w-full border border-[#C2C6D3] bg-[#F3F3FA] py-3 pr-3 pl-11 font-sans text-[16px] text-[#191C21] transition-colors focus:border-[#1170D6] focus:ring-1 focus:ring-[#1170D6] focus:outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-sans text-[13px] font-medium tracking-[0.6px] text-[#121C2C] uppercase">Senha</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-[#737783]" aria-hidden="true" />
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="••••••••" className="w-full border border-[#C2C6D3] bg-[#F3F3FA] py-3 pr-12 pl-11 font-sans text-[16px] text-[#191C21] transition-colors focus:border-[#1170D6] focus:ring-1 focus:ring-[#1170D6] focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 flex items-center justify-center text-[#737783] transition-colors hover:text-[#424751] focus:outline-none" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="mt-1 flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-[#1170D6]" />
              <span className="font-sans text-[14px] text-[#424751]">Lembrar acesso</span>
            </label>

            {error && <div className="border border-red-200 bg-red-50 p-2 font-sans text-sm text-red-500" role="alert">{error}</div>}

            <button type="submit" disabled={loading} className="mt-1 flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#1170D6] py-3 font-sans text-[15px] font-semibold tracking-[0.6px] text-white uppercase shadow-sm transition-colors hover:bg-[#0E5CA8] focus:ring-2 focus:ring-[#1170D6] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <LogIn className="h-4 w-4" aria-hidden="true" />}
            </button>

            <Link href="/" className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[5px] border border-[#C2C6D3] bg-white py-[11px] font-sans text-[15px] font-semibold tracking-[0.6px] text-[#424751] uppercase transition-colors hover:border-[#1170D6] hover:bg-[#F3F7FC] hover:text-[#1170D6] focus:ring-2 focus:ring-[#1170D6] focus:ring-offset-2 focus:outline-none">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar ao mapa
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}
