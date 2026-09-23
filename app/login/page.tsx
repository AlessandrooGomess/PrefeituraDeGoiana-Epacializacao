"use client";

import { FormEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, EyeOff, Eye, LogIn } from "lucide-react";

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
    <main 
      className="min-h-[100dvh] md:h-screen w-full relative flex items-center justify-center bg-[#F9F9FF] p-4 sm:p-6 lg:p-12 md:overflow-hidden"
    >
      {/* Top blue bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#00346F]" />

      <div className="flex w-full max-w-[1024px] h-auto md:h-full max-h-none md:max-h-[600px] bg-white overflow-hidden border border-[#C2C6D3] shadow-sm rounded-sm">
        
        {/* Left Side */}
        <div className="relative flex-1 p-8 lg:p-[48px] bg-[#EDEDF5] border-r border-[#C2C6D3] hidden md:flex flex-col justify-between items-start">
          {/* Background pattern image */}
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/placeholder.png" 
              alt="" 
              className="w-full h-full object-cover opacity-20" 
              aria-hidden="true" 
            />
          </div>

          <div className="relative z-10 flex flex-col gap-1 w-full">
            <div className="inline-flex items-center justify-start gap-2 text-[#1170D6] mb-4">
              <div className="inline-flex flex-col items-start justify-start">
                <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M0 24V0H13.3333V5.33333H26.6667V24H0ZM2.66667 21.3333H5.33333V18.6667H2.66667V21.3333ZM2.66667 16H5.33333V13.3333H2.66667V16ZM2.66667 10.6667H5.33333V8H2.66667V10.6667ZM2.66667 5.33333H5.33333V2.66667H2.66667V5.33333ZM8 21.3333H10.6667V18.6667H8V21.3333ZM8 16H10.6667V13.3333H8V16ZM8 10.6667H10.6667V8H8V10.6667ZM8 5.33333H10.6667V2.66667H8V5.33333ZM13.3333 21.3333H24V8H13.3333V10.6667H16V13.3333H13.3333V16H16V18.6667H13.3333V21.3333ZM18.6667 13.3333V10.6667H21.3333V13.3333H18.6667ZM18.6667 18.6667V16H21.3333V18.6667H18.6667Z" fill="#1170D6"/>
                </svg>
              </div>
              <div className="inline-flex flex-col justify-center">
                <h1 className="text-[32px] font-bold leading-[40px] font-sans">Prefeitura de Goiana</h1>
              </div>
            </div>
            
            <h2 className="text-[#191C21] text-[24px] font-semibold leading-8 mt-1 font-sans">
              Portal de Infraestrutura
            </h2>
            
            <p className="text-[#121C2C] text-[18px] leading-7 max-w-[448px] mt-4 font-sans">
              Sistema centralizado para gestão, monitoramento<br />e transparência de obras públicas e infraestrutura.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-6 sm:p-8 lg:p-[48px] bg-white flex flex-col justify-center items-start w-full">
          <div className="mb-6 lg:mb-[32px] w-full">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src="/logo-goiana.png" alt="Goiana Logo" className="h-[76px] w-auto object-contain mb-6" />
             <h3 className="text-[#191C21] text-[32px] font-semibold leading-8 mb-1 font-sans">Acesso ao Sistema</h3>
             <p className="text-[#121C2C] text-[16px] font-sans">Insira suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-[415px] flex flex-col gap-3">
            
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#121C2C] text-[13px] font-medium uppercase tracking-[0.6px] font-sans">
                USUÁRIO / CPF
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#737783]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                  placeholder="Digite seu usuário"
                  className="w-full bg-[#F3F3FA] border border-[#C2C6D3] text-[#6B7280] text-[16px] py-3 pl-[44px] pr-3 focus:outline-none focus:ring-1 focus:ring-[#1170D6] focus:border-[#1170D6] transition-colors font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#424751] text-[12px] font-medium uppercase tracking-[0.6px] font-sans">
                SENHA
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#737783]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#F3F3FA] border border-[#C2C6D3] text-[#6B7280] text-[16px] py-3 pl-[44px] pr-12 focus:outline-none focus:ring-1 focus:ring-[#1170D6] focus:border-[#1170D6] transition-colors font-sans"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#737783] hover:text-[#424751] transition-colors focus:outline-none flex items-center justify-center"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between mt-1 mb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#1170D6] border-[#1170D6]' : 'bg-[#F3F3FA] border-[#C2C6D3]'}`}>
                  {rememberMe && <div className="w-2 h-2 bg-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-[#424751] text-[14px] group-hover:text-[#121C2C] transition-colors font-sans">
                  Lembrar acesso
                </span>
              </label>

              <a href="#" className="text-[#121C2C] text-[12px] font-medium uppercase tracking-[0.6px] hover:underline focus:outline-none font-sans">
                Recuperar senha
              </a>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200 font-sans">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-[#1170D6] hover:bg-[#0E5CA8] transition-colors shadow-sm rounded-[5px] flex justify-center items-center gap-2 py-[12px] text-white text-[15px] font-semibold uppercase tracking-[0.6px] disabled:opacity-70 disabled:cursor-not-allowed font-sans"
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <LogIn className="w-[18px] h-[18px]" />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
