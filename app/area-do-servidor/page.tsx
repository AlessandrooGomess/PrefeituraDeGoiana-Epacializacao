import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AreaDoServidor() {
  const session = await auth();
  const allowedRoles: Role[] = [
    Role.SUPER_ADMIN,
    Role.GESTAO,
    Role.ADM_SECRETARIA,
    Role.ENGENHEIRO,
  ];

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Área do servidor</h1>
      <p>Usuário autenticado: {session.user.name ?? session.user.email}</p>
      
      <div style={{ marginTop: '2rem' }}>
        <p>Você já está logado! Para ver a tela de login novamente, clique abaixo:</p>
        <a 
          href="/api/auth/signout"
          style={{ 
            display: 'inline-block',
            padding: '10px 20px', 
            background: '#1170D6', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          Sair / Logout
        </a>
      </div>
    </main>
  );
}