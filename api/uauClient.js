const BASE_URL = process.env.UAU_API_BASE_URL || "https://gamma-api.seniorcloud.com.br:50350/uauAPI";
const API_VERSION = "1.0";

async function autenticarUau() {
  const login = process.env.UAU_LOGIN;
  const senha = process.env.UAU_SENHA;
  const tokenIntegracao = process.env.UAU_TOKEN_INTEGRACAO;

  if (!login || !senha || !tokenIntegracao) {
    throw new Error("Variáveis de ambiente UAU_LOGIN, UAU_SENHA ou UAU_TOKEN_INTEGRACAO não estão configuradas no Azure.");
  }

  const url = `${BASE_URL}/api/v${API_VERSION}/Autenticador/AutenticarUsuario`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-INTEGRATION-Authorization": tokenIntegracao,
    },
    body: JSON.stringify({ login: login, senha: senha }),
  });

  const bodyText = await response.text();

  if (!response.ok) {
    let detalhe = bodyText;
    try {
      const parsed = JSON.parse(bodyText);
      detalhe = parsed.Mensagem || parsed.Descricao || bodyText;
    } catch (_) {}
    throw new Error(`Falha ao autenticar no UAU (status ${response.status}): ${detalhe}`);
  }

  let token = bodyText;
  try {
    token = JSON.parse(bodyText);
  } catch (_) {}

  return {
    token,
    expiraEm: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };
}

module.exports = { autenticarUau };
