// Dados comerciais do App do Mestre — edite aqui (placeholders).
window.APP_CONFIG = {
  nome: "App do Mestre",
  slogan: "Menos planilha. Mais tatame.",
  whatsapp: "5521900000000", // só números, com DDI + DDD
  email: "contato@appdomestre.com.br",
  cnpj: "00.000.000/0001-00",
  testeDias: 7,
  testeAlunos: 10,
  garantiaDias: 7,
  planos: [
    {
      id: "faixa-branca", nome: "Faixa Branca", preco: 39.9, de: 49.9, periodo: "mês",
      itens: ["Até 25 alunos", "1 professor", "Chamada por QR Code", "Financeiro básico"],
      checkout: "#"
    },
    {
      id: "faixa-azul", nome: "Faixa Azul", preco: 79.9, de: 99.9, periodo: "mês",
      itens: ["Alunos ilimitados", "Até 5 professores", "Graduações e turmas", "Loja e contratos", "Suporte por e-mail"],
      checkout: "#"
    },
    {
      id: "faixa-preta", nome: "Faixa Preta", preco: 109.9, de: 139.9, periodo: "mês", destaque: true,
      itens: ["Tudo do Faixa Azul", "Lembretes automáticos no WhatsApp", "Cobrança automática", "App do aluno", "Suporte prioritário"],
      checkout: "#"
    },
    {
      id: "anual", nome: "Mestre Anual", preco: 997, de: 1318.8, periodo: "ano", parcelas: "12x de R$ 97,90",
      itens: ["Tudo do Faixa Preta", "Até 2 unidades", "Implantação assistida", "Suporte VIP"],
      checkout: "#"
    }
  ]
};
