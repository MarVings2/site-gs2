const { chamarUauAutenticado } = require("../shared/uauClient");
const { validarRequisicao } = require("../shared/authClient");

module.exports = async function (context, req) {
  const sessao = validarRequisicao(req);
if (!sessao) {
  context.res = {
    status: 401,
    headers: { "Content-Type": "application/json" },
    body: { sucesso: false, mensagem: "Não autenticado. Faça login em /api/Login e envie o token no header Authorization: Bearer <token>." },
  };
  return;
}
  const empresa = req.query.empresa;
  const obra = req.query.obra;
  const dias = parseInt(req.query.dias || "90", 10);

  if (!empresa || !obra) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: {
        sucesso: false,
        mensagem: "Informe 'empresa' e 'obra' na URL. Ex: /api/ConsultarProcessos?empresa=1&obra=001",
      },
    };
    return;
  }

  const periodoFinal = new Date();
  const periodoInicial = new Date();
  periodoInicial.setDate(periodoInicial.getDate() - dias);

  const requestBody = {
    EmpresaObraPeriodo: {
      EmpresaObra: [{ Empresa: parseInt(empresa, 10), Obra: obra }],
      PeriodoInicial: periodoInicial.toISOString(),
      PeriodoFinal: periodoFinal.toISOString(),
    },
  };

  try {
    const resultado = await chamarUauAutenticado("ProcessoPagamento/ConsultarProcessos", requestBody);

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        sucesso: true,
        filtro: { empresa, obra, periodoInicial: periodoInicial.toISOString(), periodoFinal: periodoFinal.toISOString() },
        totalProcessos: Array.isArray(resultado) ? resultado.length : 0,
        processos: resultado,
      },
    };
  } catch (erro) {
    context.log.error("Erro ao consultar processos no UAU:", erro.message);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: erro.message } };
  }
};
