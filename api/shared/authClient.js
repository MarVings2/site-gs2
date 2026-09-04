const crypto = require("crypto");

const TOKEN_VALIDADE_HORAS = 8;

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function assinar(dados) {
  const secret = process.env.PORTAL_JWT_SECRET;
  if (!secret) {
    throw new Error("Variável de ambiente PORTAL_JWT_SECRET não está configurada no Azure.");
  }
  return crypto.createHmac("sha256", secret).update(dados).digest("base64url");
}

function gerarToken(payload) {
  const header = { alg: "HS256", typ: "TOKEN" };
  const exp = Date.now() + TOKEN_VALIDADE_HORAS * 60 * 60 * 1000;
  const fullPayload = { ...payload, exp };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const assinatura = assinar(`${headerB64}.${payloadB64}`);

  return `${headerB64}.${payloadB64}.${assinatura}`;
}

function verificarToken(token) {
  if (!token || typeof token !== "string") return null;

  const partes = token.split(".");
  if (partes.length !== 3) return null;

  const [headerB64, payloadB64, assinaturaRecebida] = partes;
  const assinaturaEsperada = assinar(`${headerB64}.${payloadB64}`);

  if (assinaturaRecebida !== assinaturaEsperada) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch (_) {
    return null;
  }

  if (!payload.exp || Date.now() > payload.exp) return null;

  return payload;
}

function validarRequisicao(req) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring("Bearer ".length);
  return verificarToken(token);
}

module.exports = { gerarToken, verificarToken, validarRequisicao };
