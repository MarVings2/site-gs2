const { autenticarUau } = require("../shared/uauClient");

module.exports = async function (context, req) {
  try {
    const resultado = await autenticarUau();
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        sucesso: true,
        mensagem: "Autenticação no UAU realizada com sucesso.",
        tokenRecebido: !!resultado.token,
        expiraEm: resultado.expiraEm,
      },
    };
  } catch (erro) {
    context.log.error("Erro ao autenticar no UAU:", erro.message);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { sucesso: false, mensagem: erro.message },
    };
  }
};
