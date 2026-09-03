module.exports = async function (context, req) {
  const apiKey = process.env.SIEG_API_KEY;
  const cnpj = req.query.cnpj;
  const dias = parseInt(req.query.dias || "90", 10);
  const xmlType = parseInt(req.query.xmlType || "1", 10);
  const take = parseInt(req.query.take || "50", 10);
  const skip = parseInt(req.query.skip || "0", 10);

  if (!apiKey) {
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: "Variável de ambiente SIEG_API_KEY não está configurada no Azure." } };
    return;
  }

  if (!cnpj) {
    context.res = { status: 400, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: "Informe 'cnpj' na URL. Ex: /api/ConsultarSieg?cnpj=00000000000000&dias=90" } };
    return;
  }

  const dataFim = new Date();
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  const url = `https://api.sieg.com/BaixarXmls?api_key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    XmlType: xmlType,
    Take: take,
    Skip: skip,
    DataEmissaoInicio: dataInicio.toISOString(),
    DataEmissaoFim: dataFim.toISOString(),
    CnpjEmit: cnpj,
    Downloadevent: false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const bodyText = await response.text();
    let parsedBody = bodyText;
    try { parsedBody = JSON.parse(bodyText); } catch (_) {}

    if (!response.ok) {
      throw new Error(`Falha ao consultar SIEG (status ${response.status}): ${bodyText}`);
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        sucesso: true,
        filtro: { cnpj, dataInicio: dataInicio.toISOString(), dataFim: dataFim.toISOString(), xmlType, take, skip },
        totalRetornado: Array.isArray(parsedBody) ? parsedBody.length : 0,
        notas: parsedBody,
      },
    };
  } catch (erro) {
    context.log.error("Erro ao consultar SIEG:", erro.message);
    context.res = { status: 500, headers: { "Content-Type": "application/json" }, body: { sucesso: false, mensagem: erro.message } };
  }
};
