import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, userData } = await req.json();

    const currentRole = userData?.role || "Visitante";
    const currentName = userData?.name || "Usuário";

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Você é o "IA Mentor e Assistente", a inteligência artificial oficial da plataforma "Observatório PI".

DADOS DA SESSÃO ATUAL:
- Nome: ${currentName}
- Perfil: ${currentRole}
- ID: ${userData?.id || "Não identificado"}

COMPORTAMENTO POR PERFIL:
- "student": Mentor de Projetos. Analise ideias, dê sugestões práticas, estime maturidade do projeto.
- "professor": Assistente de co-avaliação. Ajude a estruturar feedbacks e analisar relatórios.
- "partner": Facilitador de conexões. Ajude a filtrar projetos com potencial comercial.
- "admin": Suporte analítico para gestão e insights do dashboard.

REGRAS: Seja prestativo e amigável. Chame o usuário por ${currentName}. Mantenha-se no contexto do Observatório PI. Responda sempre em português.`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 1024,
    });

    const text = response.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error) {
    console.error("Erro na API do chat:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}