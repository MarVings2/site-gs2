const { gerarToken } = require("../shared/authClient");

module.exports = async function (context, req) {
  const loginEsperado = process.env.PORTAL_LOGIN;
  const senhaEsperada = process.env.PORTAL_SENHA;

  if (!loginEsperado || !senhaEsperada) {
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: "Variáveis PORTAL_LOGIN/PORTAL_SENHA não configuradas no Azure." } };
    return;
  }

  const { login, senha } = req.body || {};

  if (!login || !senha) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: "Informe 'login' e 'senha' no corpo da requisição." } };
    return;
  }

  if (login !== loginEsperado || senha !== senhaEsperada) {
    context.res = { status: 401, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: "Usuário ou senha incorretos." } };
    return;
  }

  try {
    const token = gerarToken({ usuario: login });
    context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { sucesso: true, token, expiraEmHoras: 8 } };
  } catch (erro) {
    context.log.error("Erro ao gerar token:", erro.message);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: erro.message } };
  }
};
