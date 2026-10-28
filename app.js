/* App do Mestre — painel demo. Os dados ficam no localStorage do navegador. */
(function () {
  "use strict";

  const KEY = "adm-data-v1";
  const CFG = window.APP_CONFIG || {};
  const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const BELT_COLORS = {
    branca: "#f4f1ea", cinza: "#9a9a9a", amarela: "#f2c400", laranja: "#f07d00", verde: "#2e8b3d",
    azul: "#1d4fa8", roxa: "#6a2c91", marrom: "#6b3d1f", preta: "#111111", vermelha: "#c0141f", coral: "#e0603a"
  };

  // ---------- utilidades ----------
  const $ = s => document.querySelector(s);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
  const hoje = () => iso(new Date());
  const mesAtual = () => hoje().slice(0, 7);
  const fmtData = s => s ? s.split("-").reverse().join("/") : "—";
  const fmtMes = m => { const [y, mo] = m.split("-"); return MESES[+mo - 1] + "/" + y.slice(2); };
  const addDias = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const addMeses = (m, n) => { const d = new Date(m + "-15T12:00:00"); d.setMonth(d.getMonth() + n); return iso(d).slice(0, 7); };
  const mesesEntre = (a, b) => { const x = new Date(a + "T12:00:00"), y = new Date(b + "T12:00:00"); return (y.getFullYear() - x.getFullYear()) * 12 + (y.getMonth() - x.getMonth()) - (y.getDate() < x.getDate() ? 1 : 0); };
  const idade = n => n ? Math.max(0, mesesEntre(n, hoje()) / 12 | 0) : "";
  const soNum = s => String(s || "").replace(/\D/g, "");
  const waLink = (tel, msg) => { let n = soNum(tel); if (n && n.length <= 11) n = "55" + n; return "https://wa.me/" + n + "?text=" + encodeURIComponent(msg); };
  const fill = (tpl, o) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => o[k] ?? m);

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  // ---------- estado ----------
  let S = null;
  function load() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Não foi possível salvar neste navegador."); } }

  function base(academia, professor) {
    return {
      academia: { nome: academia || "Minha Academia", professor: professor || "", telefone: "", cidade: "" },
      faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"],
      regra: { aulas: 40, meses: 12 },
      mensagens: {
        vencendo: "Olá, {nome}! Passando para lembrar que a mensalidade de {valor} da {academia} vence em {venc}. Oss!",
        atrasado: "Olá, {nome}! A mensalidade de {valor} da {academia}, vencida em {venc}, ainda está em aberto. Qualquer dúvida, fale com a gente.",
        aniversario: "Parabéns, {nome}! 🥋 Toda a equipe da {academia} deseja um ótimo aniversário. Nos vemos no tatame!",
        sumido: "Oi, {nome}! Sentimos sua falta nos treinos da {academia}. Está tudo bem? Te esperamos no tatame!"
      },
      contratoModelo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\n{academia}, doravante CONTRATADA, e {aluno}{responsavel_txt}, doravante CONTRATANTE, ajustam:\n\n1. Objeto: aulas de artes marciais na turma {turma}.\n2. Valor: mensalidade de {valor}, com vencimento todo dia {vencDia}.\n3. Vigência: 12 meses a partir de {data}, renovável automaticamente.\n4. Cancelamento: pode ser solicitado a qualquer tempo com 30 dias de aviso.\n5. O CONTRATANTE declara estar apto à prática esportiva.\n\n{cidade}, {data}.\n\n_____________________________\n{aluno}\n\n_____________________________\n{academia}",
      turmas: [], alunos: [], presencas: [], cobrancas: [], despesas: [], produtos: [], vendas: [], contratos: [], graduacoes: [],
      criadoEm: hoje()
    };
  }

  function seed() {
    let r = 7;
    const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const s = base("Academia Exemplo", "Mestre Rafael");
    s.demo = true;
    s.academia.cidade = "Rio de Janeiro";
    s.academia.telefone = CFG.whatsapp || "";
    s.turmas = [
      { id: uid(), nome: "Jiu-Jitsu Adulto", modalidade: "Jiu-Jitsu", dias: [1, 3, 5], hora: "19:00", professor: "Mestre Rafael", capacidade: 30 },
      { id: uid(), nome: "Jiu-Jitsu Kids", modalidade: "Jiu-Jitsu", dias: [2, 4], hora: "17:30", professor: "Prof. Lívia", capacidade: 20 },
      { id: uid(), nome: "Muay Thai", modalidade: "Muay Thai", dias: [2, 4, 6], hora: "07:00", professor: "Prof. Diego", capacidade: 25 }
    ];
    const nomes = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Daniel Rocha", "Eduarda Alves", "Felipe Costa", "Gabriela Nunes", "Henrique Dias", "Isabela Pires", "João Pedro Melo", "Karen Araújo", "Lucas Ferreira", "Mariana Lopes", "Nicolas Ramos", "Olívia Teixeira", "Paulo Cardoso", "Rafaela Moura", "Samuel Barros", "Tainá Correia", "Vitor Gomes", "Yasmin Freitas", "Arthur Vieira", "Beatriz Castro", "Caio Martins", "Laura Ribeiro", "Miguel Azevedo"];
    const t = hoje();
    nomes.forEach((nome, i) => {
      const turma = s.turmas[i < 15 ? 0 : i < 21 ? 1 : 2];
      const kids = turma.nome.includes("Kids");
      const nasc = addDias(t, -Math.floor((kids ? 7 + rnd() * 6 : 18 + rnd() * 25) * 365));
      const faixaIdx = kids ? 0 : Math.min(4, Math.floor(rnd() * rnd() * 5));
      const desde = addDias(t, -Math.floor(60 + rnd() * 420));
      s.alunos.push({
        id: uid(), codigo: String(1001 + i), nome, nasc: i === 2 ? nasc.slice(0, 4) + t.slice(4) : nasc,
        telefone: "21 9" + String(Math.floor(10000000 + rnd() * 89999999)), email: nome.split(" ")[0].toLowerCase() + "@email.com",
        responsavel: kids ? "Responsável de " + nome.split(" ")[0] : "", telResponsavel: "",
        turmaId: turma.id, faixa: s.faixas[faixaIdx], graus: Math.floor(rnd() * 4), desdeFaixa: desde,
        mensalidade: kids ? 150 : turma.modalidade === "Muay Thai" ? 170 : 190, vencDia: pick([5, 10, 15]),
        ativo: i !== 25, obs: "", criadoEm: addDias(desde, -30)
      });
    });
    // presenças dos últimos 150 dias
    for (let d = 150; d >= 0; d--) {
      const dia = addDias(t, -d), wd = new Date(dia + "T12:00:00").getDay();
      s.turmas.forEach(tu => {
        if (!tu.dias.includes(wd)) return;
        s.alunos.filter(a => a.turmaId === tu.id && a.ativo).forEach((a, k) => {
          const freq = k % 5 === 4 && d < 20 ? 0 : 0.55 + (k % 3) * 0.15;
          if (rnd() < freq) s.presencas.push({ id: uid(), alunoId: a.id, turmaId: tu.id, data: dia });
        });
      });
    }
    // mensalidades dos últimos 6 meses
    for (let m = 5; m >= 0; m--) {
      const comp = addMeses(mesAtual(), -m);
      s.alunos.filter(a => a.ativo).forEach(a => {
        const c = novaCobranca(a, comp);
        const pago = m > 0 ? rnd() < 0.96 : c.venc < t && rnd() < 0.75;
        if (pago) { const pg = addDias(c.venc, Math.floor(rnd() * 4) - 2); c.pagoEm = pg > t ? t : pg; }
        if (c.pagoEm) c.forma = pick(["Pix", "Pix", "Cartão", "Dinheiro"]);
        s.cobrancas.push(c);
      });
      s.despesas.push({ id: uid(), desc: "Aluguel", categoria: "Estrutura", valor: 2800, data: comp + "-05" });
      s.despesas.push({ id: uid(), desc: "Energia e água", categoria: "Estrutura", valor: 420 + Math.round(rnd() * 120), data: comp + "-12" });
    }
    s.produtos = [
      { id: uid(), nome: "Kimono A1 branco", preco: 389, estoque: 6 },
      { id: uid(), nome: "Faixa (qualquer cor)", preco: 59, estoque: 25 },
      { id: uid(), nome: "Rashguard da academia", preco: 149, estoque: 3 },
      { id: uid(), nome: "Luva de Muay Thai 12oz", preco: 229, estoque: 8 },
      { id: uid(), nome: "Protetor bucal", preco: 35, estoque: 40 }
    ];
    for (let k = 0; k < 14; k++) {
      const p = pick(s.produtos), qtd = 1;
      s.vendas.push({ id: uid(), produtoId: p.id, produto: p.nome, alunoId: pick(s.alunos).id, qtd, valor: p.preco * qtd, data: addDias(t, -Math.floor(rnd() * 150)), forma: "Pix" });
    }
    s.alunos.slice(0, 3).forEach((a, i) => s.contratos.push({ id: uid(), alunoId: a.id, titulo: "Contrato anual", texto: textoContrato(s, a), status: i === 0 ? "Assinado" : "Enviado", criadoEm: addDias(t, -20 + i), assinadoEm: i === 0 ? addDias(t, -18) : null }));
    return s;
  }

  function novaCobranca(a, comp) {
    const d = Math.min(28, +a.vencDia || 10);
    return { id: uid(), alunoId: a.id, competencia: comp, valor: +a.mensalidade || 0, venc: comp + "-" + String(d).padStart(2, "0"), pagoEm: null, forma: "" };
  }

  // ---------- consultas ----------
  const aluno = id => S.alunos.find(a => a.id === id);
  const turma = id => S.turmas.find(t => t.id === id);
  const ativos = () => S.alunos.filter(a => a.ativo);
  const statusCob = c => c.pagoEm ? "pago" : c.venc < hoje() ? "atrasado" : "aberto";
  const ultimaPresenca = id => S.presencas.reduce((m, p) => p.alunoId === id && p.data > m ? p.data : m, "");
  function progresso(a) {
    const aulas = S.presencas.filter(p => p.alunoId === a.id && p.data >= (a.desdeFaixa || "")).length;
    const meses = a.desdeFaixa ? mesesEntre(a.desdeFaixa, hoje()) : 0;
    const pa = Math.min(1, aulas / (S.regra.aulas || 1)), pm = Math.min(1, meses / (S.regra.meses || 1));
    const ultima = S.faixas.indexOf(a.faixa) >= S.faixas.length - 1;
    return { aulas, meses, pct: Math.round(Math.min(pa, pm) * 100), apto: !ultima && pa >= 1 && pm >= 1, ultima };
  }
  function beltHTML(f, graus) {
    const c = BELT_COLORS[String(f || "").toLowerCase().split(/[\s-]/)[0]] || "#888";
    return `<span class="belt"><i style="background:${c}"></i>${esc(f)}${graus ? ` <span class="muted">· ${graus}º grau</span>` : ""}</span>`;
  }
  function recebidoMes(m) {
    return S.cobrancas.filter(c => c.pagoEm && c.pagoEm.startsWith(m)).reduce((s, c) => s + c.valor, 0)
      + S.vendas.filter(v => v.data.startsWith(m)).reduce((s, v) => s + v.valor, 0);
  }
  function textoContrato(s, a) {
    const t = s.turmas.find(x => x.id === a.turmaId);
    return fill(s.contratoModelo, {
      academia: s.academia.nome, aluno: a.nome, responsavel_txt: a.responsavel ? `, representado(a) por ${a.responsavel}` : "",
      turma: t ? t.nome : "—", valor: brl(a.mensalidade), vencDia: a.vencDia, data: fmtData(hoje()), cidade: s.academia.cidade || "________"
    });
  }

  // ---------- diálogo ----------
  const dlg = $("#dlg");
  let dlgSubmit = null;
  function openDlg(title, body, { onSave, saveLabel = "Salvar", wide = false, foot } = {}) {
    dlg.style.width = wide ? "min(860px, calc(100% - 24px))" : "";
    dlg.innerHTML = `<form method="dialog" id="dlgForm">
      <div class="dlg-head"><h2>${esc(title)}</h2><button type="button" class="btn btn-sm btn-ghost" data-act="closeDlg">✕</button></div>
      <div class="dlg-body">${body}</div>
      <div class="dlg-foot">${foot ?? `<button type="button" class="btn btn-sm" data-act="closeDlg">Cancelar</button>${onSave ? `<button class="btn btn-sm btn-primary" type="submit">${saveLabel}</button>` : ""}`}</div>
    </form>`;
    dlgSubmit = onSave || null;
    dlg.showModal();
  }
  function closeDlg() { stopScanner(); if (dlg.open) dlg.close(); }
  dlg.addEventListener("submit", e => {
    e.preventDefault();
    if (!dlgSubmit) return closeDlg();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data._all = new FormData(e.target);
    if (dlgSubmit(data) !== false) { closeDlg(); save(); render(); }
  });
  dlg.addEventListener("close", stopScanner);

  // ---------- navegação ----------
  const ICON = {
    painel: "M3 12l9-8 9 8M5 10v10h14V10", alunos: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0",
    turmas: "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4", presenca: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2z",
    graduacoes: "M2 12h20M8 8v8M16 8v8", financeiro: "M3 7h18v10H3zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
    loja: "M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0", contratos: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
    whatsapp: "M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z", config: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2M17 7l1.5-1.5M5.5 18.5L7 17M17 17l1.5 1.5M5.5 5.5L7 7"
  };
  const ROUTES = [
    ["painel", "Painel"], ["alunos", "Alunos"], ["turmas", "Turmas"], ["presenca", "Presença"], ["graduacoes", "Graduações"],
    ["financeiro", "Financeiro"], ["loja", "Loja"], ["contratos", "Contratos"], ["whatsapp", "WhatsApp"], ["config", "Configurações"]
  ];
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${p}"/></svg>`;
  const route = () => (location.hash.replace(/^#\/?/, "").split("?")[0] || "painel");
  const UI = { busca: "", filtroTurma: "", filtroStatus: "ativos", comp: null, presTurma: null, presData: null };

  function render() {
    if (!S) return renderLogin();
    const r = ROUTES.some(x => x[0] === route()) ? route() : "painel";
    const view = VIEWS[r]();
    $("#root").innerHTML = `
      ${S.demo ? `<div class="demo-bar">Modo demonstração — dados fictícios salvos só neste navegador. <a href="#/config">Começar do zero</a></div>` : ""}
      <div class="layout">
        <aside class="side" id="side">
          <a class="brand" href="index.html"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none"><rect x="1" y="9" width="22" height="6" rx="2" fill="#fff" opacity=".35"/><rect x="8" y="6" width="8" height="12" rx="2" fill="#fff"/></svg></span>App do Mestre</a>
          ${ROUTES.map(([k, l]) => `<a class="nav-item${k === r ? " on" : ""}" href="#/${k}">${svg(ICON[k])}${l}</a>`).join("")}
          <div class="side-foot">${esc(S.academia.nome)}<br>${esc(S.academia.professor)}</div>
        </aside>
        <main class="main">
          <div class="topbar">
            <button class="btn btn-sm menu-btn" data-act="menu">☰</button>
            <h1>${view.title}</h1>
            <div class="actions">${view.actions || ""}<button class="theme-toggle" data-act="theme" aria-label="Alternar tema">◐</button></div>
          </div>
          ${view.html}
        </main>
      </div>`;
    view.after && view.after();
  }
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

  function renderLogin() {
    $("#root").innerHTML = `<div class="login"><div class="card">
      <a class="brand" href="index.html" style="margin-bottom:24px"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none"><rect x="1" y="9" width="22" height="6" rx="2" fill="#b3121f"/><rect x="8" y="6" width="8" height="12" rx="2" fill="#fff"/></svg></span>App do Mestre</a>
      <h1>Monte sua academia</h1>
      <p class="muted">Esta é uma versão de demonstração: os dados ficam salvos apenas neste navegador.</p>
      <form id="loginForm" style="display:grid;gap:14px;margin-top:18px">
        <label>Nome da academia<input name="academia" required placeholder="Ex.: Equipe Leão"></label>
        <label>Seu nome<input name="professor" placeholder="Ex.: Mestre Carlos"></label>
        <button class="btn btn-primary" type="submit">Criar academia</button>
        <button class="btn" type="button" data-act="seed">Explorar com dados de exemplo</button>
      </form></div></div>`;
    $("#loginForm").addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(e.target);
      S = base(f.get("academia"), f.get("professor"));
      save(); location.hash = "#/turmas"; render();
    });
  }

  // ---------- views ----------
  const VIEWS = {};

  VIEWS.painel = () => {
    const m = mesAtual(), t = hoje(), wd = new Date().getDay();
    const cobM = S.cobrancas.filter(c => c.competencia === m);
    const aberto = cobM.filter(c => !c.pagoEm).reduce((s, c) => s + c.valor, 0);
    const atrasados = S.cobrancas.filter(c => statusCob(c) === "atrasado");
    const pres7 = S.presencas.filter(p => p.data > addDias(t, -7)).length;
    const meses = Array.from({ length: 6 }, (_, i) => addMeses(m, i - 5));
    const vals = meses.map(recebidoMes), max = Math.max(1, ...vals);
    const aulasHoje = S.turmas.filter(x => x.dias.includes(wd)).sort((a, b) => a.hora.localeCompare(b.hora));
    const sumidos = ativos().map(a => ({ a, u: ultimaPresenca(a.id) })).filter(x => !x.u || x.u < addDias(t, -14)).slice(0, 6);
    const aptos = ativos().filter(a => progresso(a).apto);
    const niver = ativos().filter(a => a.nasc && a.nasc.slice(5, 7) === m.slice(5)).sort((a, b) => a.nasc.slice(8).localeCompare(b.nasc.slice(8)));
    return {
      title: "Painel",
      actions: `<a class="btn btn-sm btn-primary" href="#/presenca">Fazer chamada</a>`,
      html: `
      <div class="kpis">
        <div class="kpi"><small>Alunos ativos</small><strong>${ativos().length}</strong><span class="sub">${S.turmas.length} turmas</span></div>
        <div class="kpi"><small>Recebido em ${fmtMes(m)}</small><strong>${brl(recebidoMes(m))}</strong><span class="sub">mensalidades + loja</span></div>
        <div class="kpi"><small>Em aberto no mês</small><strong>${brl(aberto)}</strong><span class="sub">${atrasados.length} cobranças atrasadas</span></div>
        <div class="kpi"><small>Presenças (7 dias)</small><strong>${pres7}</strong><span class="sub">check-ins registrados</span></div>
      </div>
      <div class="cols-2">
        <div class="panel"><h2>Recebimentos</h2>
          <div class="bars">${meses.map((mm, i) => `<div class="bar"><b>${vals[i] ? (vals[i] / 1000).toFixed(1) + "k" : ""}</b><i style="height:${(vals[i] / max) * 100}%"></i><small>${fmtMes(mm)}</small></div>`).join("")}</div>
        </div>
        <div class="panel"><h2>Aulas de hoje · ${DIAS[wd]}</h2>
          <div class="list">${aulasHoje.length ? aulasHoje.map(x => {
            const n = S.presencas.filter(p => p.turmaId === x.id && p.data === t).length;
            return `<div class="list-item"><b>${esc(x.hora)}</b><span class="grow">${esc(x.nome)} <span class="muted">· ${esc(x.professor)}</span></span><span class="badge${n ? " ok" : ""}">${n} presentes</span><a class="btn btn-sm" href="#/presenca" data-act="goChamada" data-id="${x.id}">Chamada</a></div>`;
          }).join("") : `<div class="empty">Nenhuma turma hoje.</div>`}</div>
        </div>
        <div class="panel"><h2>Aptos à próxima faixa</h2>
          <div class="list">${aptos.length ? aptos.slice(0, 6).map(a => `<div class="list-item"><span class="grow">${esc(a.nome)}</span>${beltHTML(a.faixa)}<a class="btn btn-sm" href="#/graduacoes">Ver</a></div>`).join("") : `<div class="empty">Ninguém atingiu a regra ainda.</div>`}</div>
        </div>
        <div class="panel"><h2>Sem treinar há 14+ dias</h2>
          <div class="list">${sumidos.length ? sumidos.map(({ a, u }) => `<div class="list-item"><span class="grow">${esc(a.nome)} <span class="muted">· último: ${fmtData(u)}</span></span><a class="btn btn-sm" target="_blank" rel="noopener" href="${waLink(a.telefone, fill(S.mensagens.sumido, { nome: a.nome.split(" ")[0], academia: S.academia.nome }))}">WhatsApp</a></div>`).join("") : `<div class="empty">Todos treinando. 💪</div>`}</div>
        </div>
        <div class="panel"><h2>Aniversariantes do mês</h2>
          <div class="list">${niver.length ? niver.map(a => `<div class="list-item"><b>${a.nasc.slice(8)}/${a.nasc.slice(5, 7)}</b><span class="grow">${esc(a.nome)}</span>${a.nasc.slice(5) === t.slice(5) ? '<span class="badge ok">Hoje!</span>' : ""}</div>`).join("") : `<div class="empty">Nenhum aniversariante este mês.</div>`}</div>
        </div>
        <div class="panel"><h2>Cobranças atrasadas</h2>
          <div class="list">${atrasados.length ? atrasados.slice(0, 6).map(c => { const a = aluno(c.alunoId); return `<div class="list-item"><span class="grow">${esc(a?.nome)} <span class="muted">· venc. ${fmtData(c.venc)}</span></span><b>${brl(c.valor)}</b><button class="btn btn-sm" data-act="receber" data-id="${c.id}">Receber</button></div>`; }).join("") : `<div class="empty">Nenhuma cobrança atrasada.</div>`}</div>
        </div>
      </div>`
    };
  };

  VIEWS.alunos = () => {
    const q = UI.busca.toLowerCase();
    const lista = S.alunos.filter(a =>
      (!q || a.nome.toLowerCase().includes(q) || a.codigo.includes(q)) &&
      (!UI.filtroTurma || a.turmaId === UI.filtroTurma) &&
      (UI.filtroStatus === "todos" || (UI.filtroStatus === "ativos") === a.ativo)
    ).sort((a, b) => a.nome.localeCompare(b.nome));
    return {
      title: "Alunos",
      actions: `<button class="btn btn-sm btn-primary" data-act="alunoForm">+ Novo aluno</button>`,
      html: `<div class="panel">
        <div class="toolbar">
          <input id="busca" placeholder="Buscar por nome ou código" value="${esc(UI.busca)}">
          <select id="fTurma"><option value="">Todas as turmas</option>${S.turmas.map(t => `<option value="${t.id}"${UI.filtroTurma === t.id ? " selected" : ""}>${esc(t.nome)}</option>`).join("")}</select>
          <select id="fStatus">${[["ativos", "Ativos"], ["inativos", "Inativos"], ["todos", "Todos"]].map(([v, l]) => `<option value="${v}"${UI.filtroStatus === v ? " selected" : ""}>${l}</option>`).join("")}</select>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Cód.</th><th>Nome</th><th>Turma</th><th>Faixa</th><th>Idade</th><th class="num">Mensalidade</th><th>Último treino</th><th></th></tr></thead>
          <tbody>${lista.length ? lista.map(a => `<tr>
            <td class="muted">${esc(a.codigo)}</td>
            <td><b>${esc(a.nome)}</b>${a.ativo ? "" : ' <span class="badge">inativo</span>'}${a.responsavel ? `<div class="muted" style="font-size:12px">Resp.: ${esc(a.responsavel)}</div>` : ""}</td>
            <td>${esc(turma(a.turmaId)?.nome || "—")}</td>
            <td>${beltHTML(a.faixa, a.graus)}</td>
            <td>${idade(a.nasc)}</td>
            <td class="num">${brl(a.mensalidade)}</td>
            <td>${fmtData(ultimaPresenca(a.id))}</td>
            <td><div class="row-actions">
              <button class="btn btn-sm" data-act="alunoFicha" data-id="${a.id}">Ficha</button>
              <button class="btn btn-sm" data-act="alunoForm" data-id="${a.id}">Editar</button>
            </div></td></tr>`).join("") : `<tr><td colspan="8" class="empty">Nenhum aluno encontrado.</td></tr>`}</tbody>
        </table></div>
        <p class="muted" style="margin:12px 0 0;font-size:13px">${lista.length} aluno(s)</p>
      </div>`,
      after() {
        const b = $("#busca");
        b.addEventListener("input", () => { UI.busca = b.value; const pos = b.selectionStart; render(); const nb = $("#busca"); nb.focus(); nb.setSelectionRange(pos, pos); });
        $("#fTurma").addEventListener("change", e => { UI.filtroTurma = e.target.value; render(); });
        $("#fStatus").addEventListener("change", e => { UI.filtroStatus = e.target.value; render(); });
      }
    };
  };

  VIEWS.turmas = () => ({
    title: "Turmas",
    actions: `<button class="btn btn-sm btn-primary" data-act="turmaForm">+ Nova turma</button>`,
    html: S.turmas.length ? `<div class="grid-3">${S.turmas.map(t => {
      const n = S.alunos.filter(a => a.turmaId === t.id && a.ativo).length;
      const pct = t.capacidade ? Math.min(100, Math.round(n / t.capacidade * 100)) : 0;
      return `<div class="card">
        <div class="panel-head"><h2 style="font-size:22px">${esc(t.nome)}</h2><span class="badge" style="margin-left:auto">${esc(t.modalidade)}</span></div>
        <p style="margin:0 0 6px"><b>${t.dias.map(d => DIAS[d]).join(", ")}</b> · ${esc(t.hora)}</p>
        <p class="muted" style="margin:0 0 14px">${esc(t.professor || "Sem professor definido")}</p>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>${n} alunos</span><span class="muted">capacidade ${t.capacidade || "—"}</span></div>
        <div class="progress${pct >= 100 ? " done" : ""}"><i style="width:${pct}%"></i></div>
        <div class="row-actions" style="margin-top:16px;justify-content:flex-start">
          <a class="btn btn-sm btn-primary" href="#/presenca" data-act="goChamada" data-id="${t.id}">Chamada</a>
          <button class="btn btn-sm" data-act="turmaForm" data-id="${t.id}">Editar</button>
        </div></div>`;
    }).join("")}</div>` : `<div class="panel empty">Crie a primeira turma para começar a cadastrar alunos.<br><br><button class="btn btn-primary" data-act="turmaForm">+ Nova turma</button></div>`
  });

  VIEWS.presenca = () => {
    if (!UI.presTurma || !turma(UI.presTurma)) {
      const wd = new Date().getDay();
      UI.presTurma = (S.turmas.find(t => t.dias.includes(wd)) || S.turmas[0] || {}).id || null;
    }
    UI.presData = UI.presData || hoje();
    const t = turma(UI.presTurma);
    const alunosT = t ? S.alunos.filter(a => a.ativo && a.turmaId === t.id).sort((a, b) => a.nome.localeCompare(b.nome)) : [];
    const presentes = new Set(S.presencas.filter(p => p.turmaId === UI.presTurma && p.data === UI.presData).map(p => p.alunoId));
    const hist = S.presencas.slice().sort((a, b) => b.data.localeCompare(a.data));
    const ultimas = [];
    for (const p of hist) { const k = p.turmaId + p.data; if (!ultimas.find(u => u.k === k)) ultimas.push({ k, turmaId: p.turmaId, data: p.data, n: hist.filter(h => h.turmaId === p.turmaId && h.data === p.data).length }); if (ultimas.length >= 8) break; }
    return {
      title: "Presença",
      actions: `<button class="btn btn-sm btn-primary" data-act="checkin">Check-in por QR / código</button>`,
      html: !t ? `<div class="panel empty">Cadastre uma turma primeiro. <a href="#/turmas">Ir para turmas</a></div>` : `
      <div class="panel">
        <div class="toolbar">
          <select id="pTurma">${S.turmas.map(x => `<option value="${x.id}"${x.id === UI.presTurma ? " selected" : ""}>${esc(x.nome)} · ${x.hora}</option>`).join("")}</select>
          <input type="date" id="pData" value="${UI.presData}" max="${hoje()}">
        </div>
        <div class="panel-head"><h2>Chamada · ${fmtData(UI.presData)}</h2><span class="badge ok" id="pCount">${presentes.size} de ${alunosT.length}</span>
          <div class="actions"><button class="btn btn-sm" data-act="marcarTodos">Marcar todos</button><button class="btn btn-sm btn-primary" data-act="salvarChamada">Salvar chamada</button></div></div>
        <div class="attend" id="attend">${alunosT.length ? alunosT.map(a => `<label class="${presentes.has(a.id) ? "on" : ""}"><input type="checkbox" value="${a.id}"${presentes.has(a.id) ? " checked" : ""}><span>${esc(a.nome)}<br><span class="muted" style="font-size:12px">${esc(a.faixa)}</span></span></label>`).join("") : `<div class="empty">Nenhum aluno ativo nesta turma.</div>`}</div>
      </div>
      <div class="panel"><h2>Últimas chamadas</h2>
        <div class="table-wrap"><table><thead><tr><th>Data</th><th>Turma</th><th class="num">Presentes</th><th></th></tr></thead>
        <tbody>${ultimas.map(u => `<tr><td>${fmtData(u.data)}</td><td>${esc(turma(u.turmaId)?.nome || "—")}</td><td class="num">${u.n}</td><td><div class="row-actions"><button class="btn btn-sm" data-act="abrirChamada" data-id="${u.turmaId}|${u.data}">Abrir</button></div></td></tr>`).join("") || `<tr><td colspan="4" class="empty">Sem registros.</td></tr>`}</tbody></table></div>
      </div>`,
      after() {
        if (!t) return;
        $("#pTurma").addEventListener("change", e => { UI.presTurma = e.target.value; render(); });
        $("#pData").addEventListener("change", e => { UI.presData = e.target.value || hoje(); render(); });
        $("#attend").addEventListener("change", e => {
          e.target.closest("label")?.classList.toggle("on", e.target.checked);
          const n = $("#attend").querySelectorAll("input:checked").length;
          $("#pCount").textContent = `${n} de ${alunosT.length}`;
        });
      }
    };
  };

  VIEWS.graduacoes = () => {
    const lista = ativos().map(a => ({ a, p: progresso(a) })).sort((x, y) => (y.p.apto - x.p.apto) || (y.p.pct - x.p.pct));
    return {
      title: "Graduações",
      actions: `<a class="btn btn-sm" href="#/config">Regra: ${S.regra.aulas} aulas e ${S.regra.meses} meses</a>`,
      html: `<div class="panel">
        <p class="muted" style="margin-top:0">O sistema compara aulas e tempo na faixa com a regra da academia. A decisão final é sempre do professor.</p>
        <div class="table-wrap"><table>
          <thead><tr><th>Aluno</th><th>Faixa atual</th><th>Desde</th><th class="num">Aulas</th><th class="num">Meses</th><th>Progresso</th><th></th></tr></thead>
          <tbody>${lista.map(({ a, p }) => `<tr>
            <td><b>${esc(a.nome)}</b></td><td>${beltHTML(a.faixa, a.graus)}</td><td>${fmtData(a.desdeFaixa)}</td>
            <td class="num">${p.aulas}/${S.regra.aulas}</td><td class="num">${p.meses}/${S.regra.meses}</td>
            <td style="min-width:140px">${p.ultima ? '<span class="badge">Faixa máxima</span>' : p.apto ? '<span class="badge ok">Apto</span>' : `<div class="progress"><i style="width:${p.pct}%"></i></div>`}</td>
            <td><div class="row-actions"><button class="btn btn-sm" data-act="grau" data-id="${a.id}">+ Grau</button><button class="btn btn-sm${p.apto ? " btn-primary" : ""}" data-act="graduar" data-id="${a.id}">Graduar</button></div></td>
          </tr>`).join("") || `<tr><td colspan="7" class="empty">Sem alunos ativos.</td></tr>`}</tbody>
        </table></div></div>
        <div class="panel"><h2>Histórico de graduações</h2>
        <div class="list">${S.graduacoes.slice().reverse().slice(0, 15).map(g => `<div class="list-item"><b>${fmtData(g.data)}</b><span class="grow">${esc(aluno(g.alunoId)?.nome)}</span>${beltHTML(g.de)} → ${beltHTML(g.para)}</div>`).join("") || `<div class="empty">Nenhuma graduação registrada ainda.</div>`}</div></div>`
    };
  };

  VIEWS.financeiro = () => {
    const m = UI.comp || mesAtual();
    const ordem = { atrasado: 0, aberto: 1, pago: 2 };
    const cobs = S.cobrancas.filter(c => c.competencia === m).sort((a, b) => ordem[statusCob(a)] - ordem[statusCob(b)] || a.venc.localeCompare(b.venc));
    const recebido = cobs.filter(c => c.pagoEm).reduce((s, c) => s + c.valor, 0);
    const aberto = cobs.filter(c => !c.pagoEm).reduce((s, c) => s + c.valor, 0);
    const desp = S.despesas.filter(d => d.data.startsWith(m));
    const totalDesp = desp.reduce((s, d) => s + d.valor, 0);
    const loja = S.vendas.filter(v => v.data.startsWith(m)).reduce((s, v) => s + v.valor, 0);
    const opts = Array.from({ length: 12 }, (_, i) => addMeses(mesAtual(), 1 - i));
    const faltam = ativos().filter(a => !S.cobrancas.some(c => c.alunoId === a.id && c.competencia === m)).length;
    const badge = c => ({ pago: '<span class="badge ok">Pago</span>', atrasado: '<span class="badge bad">Atrasado</span>', aberto: '<span class="badge warn">A vencer</span>' })[statusCob(c)];
    return {
      title: "Financeiro",
      actions: `<select id="comp" style="width:auto">${opts.map(o => `<option value="${o}"${o === m ? " selected" : ""}>${fmtMes(o)}</option>`).join("")}</select>
        <button class="btn btn-sm btn-primary" data-act="gerarMens"${faltam ? "" : " disabled"}>Gerar mensalidades${faltam ? ` (${faltam})` : ""}</button>`,
      html: `
      <div class="kpis">
        <div class="kpi"><small>Mensalidades recebidas</small><strong>${brl(recebido)}</strong><span class="sub">${cobs.filter(c => c.pagoEm).length} de ${cobs.length}</span></div>
        <div class="kpi"><small>A receber</small><strong>${brl(aberto)}</strong><span class="sub">${cobs.filter(c => statusCob(c) === "atrasado").length} atrasadas</span></div>
        <div class="kpi"><small>Vendas da loja</small><strong>${brl(loja)}</strong></div>
        <div class="kpi"><small>Resultado do mês</small><strong style="color:${recebido + loja - totalDesp >= 0 ? "var(--ok)" : "var(--red)"}">${brl(recebido + loja - totalDesp)}</strong><span class="sub">despesas ${brl(totalDesp)}</span></div>
      </div>
      <div class="panel"><div class="panel-head"><h2>Mensalidades · ${fmtMes(m)}</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Aluno</th><th>Vencimento</th><th class="num">Valor</th><th>Status</th><th>Pago em</th><th></th></tr></thead>
          <tbody>${cobs.map(c => { const a = aluno(c.alunoId); return `<tr>
            <td><b>${esc(a?.nome || "(removido)")}</b></td><td>${fmtData(c.venc)}</td><td class="num">${brl(c.valor)}</td><td>${badge(c)}</td>
            <td>${c.pagoEm ? fmtData(c.pagoEm) + ` <span class="muted">· ${esc(c.forma)}</span>` : "—"}</td>
            <td><div class="row-actions">${c.pagoEm ? `<button class="btn btn-sm btn-ghost" data-act="estornar" data-id="${c.id}">Desfazer</button>` : `${a ? `<a class="btn btn-sm" target="_blank" rel="noopener" href="${waLink(a.telResponsavel || a.telefone, fill(S.mensagens[statusCob(c) === "atrasado" ? "atrasado" : "vencendo"], { nome: (a.responsavel || a.nome).split(" ")[0], valor: brl(c.valor), venc: fmtData(c.venc), academia: S.academia.nome }))}">Cobrar</a>` : ""}<button class="btn btn-sm btn-primary" data-act="receber" data-id="${c.id}">Receber</button>`}</div></td>
          </tr>`; }).join("") || `<tr><td colspan="6" class="empty">Nenhuma mensalidade gerada para ${fmtMes(m)}. Use "Gerar mensalidades".</td></tr>`}</tbody>
        </table></div></div>
      <div class="panel"><div class="panel-head"><h2>Despesas · ${fmtMes(m)}</h2><div class="actions"><button class="btn btn-sm" data-act="despesaForm">+ Despesa</button></div></div>
        <div class="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th class="num">Valor</th><th></th></tr></thead>
        <tbody>${desp.map(d => `<tr><td>${fmtData(d.data)}</td><td>${esc(d.desc)}</td><td>${esc(d.categoria)}</td><td class="num">${brl(d.valor)}</td><td><div class="row-actions"><button class="btn btn-sm btn-ghost btn-danger" data-act="delDespesa" data-id="${d.id}">Excluir</button></div></td></tr>`).join("") || `<tr><td colspan="5" class="empty">Sem despesas no mês.</td></tr>`}</tbody></table></div>
      </div>`,
      after() { $("#comp").addEventListener("change", e => { UI.comp = e.target.value; render(); }); }
    };
  };

  VIEWS.loja = () => ({
    title: "Loja",
    actions: `<button class="btn btn-sm" data-act="produtoForm">+ Produto</button><button class="btn btn-sm btn-primary" data-act="vendaForm"${S.produtos.length ? "" : " disabled"}>Registrar venda</button>`,
    html: `<div class="cols-2">
      <div class="panel"><h2>Produtos</h2>
        <div class="table-wrap"><table><thead><tr><th>Produto</th><th class="num">Preço</th><th class="num">Estoque</th><th></th></tr></thead>
        <tbody>${S.produtos.map(p => `<tr><td><b>${esc(p.nome)}</b></td><td class="num">${brl(p.preco)}</td><td class="num">${p.estoque <= 3 ? `<span class="badge ${p.estoque ? "warn" : "bad"}">${p.estoque}</span>` : p.estoque}</td><td><div class="row-actions"><button class="btn btn-sm" data-act="produtoForm" data-id="${p.id}">Editar</button></div></td></tr>`).join("") || `<tr><td colspan="4" class="empty">Cadastre kimonos, faixas e equipamentos.</td></tr>`}</tbody></table></div>
      </div>
      <div class="panel"><h2>Últimas vendas</h2>
        <div class="table-wrap"><table><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th class="num">Valor</th></tr></thead>
        <tbody>${S.vendas.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 20).map(v => `<tr><td>${fmtData(v.data)}</td><td>${v.qtd}× ${esc(v.produto)}</td><td>${esc(aluno(v.alunoId)?.nome || "Avulso")}</td><td class="num">${brl(v.valor)}</td></tr>`).join("") || `<tr><td colspan="4" class="empty">Nenhuma venda.</td></tr>`}</tbody></table></div>
      </div></div>`
  });

  VIEWS.contratos = () => ({
    title: "Contratos",
    actions: `<button class="btn btn-sm" data-act="modeloContrato">Editar modelo</button><button class="btn btn-sm btn-primary" data-act="contratoForm">+ Novo contrato</button>`,
    html: `<div class="panel"><div class="table-wrap"><table>
      <thead><tr><th>Aluno</th><th>Título</th><th>Criado</th><th>Status</th><th></th></tr></thead>
      <tbody>${S.contratos.slice().reverse().map(c => { const a = aluno(c.alunoId); return `<tr>
        <td><b>${esc(a?.nome || "(removido)")}</b></td><td>${esc(c.titulo)}</td><td>${fmtData(c.criadoEm)}</td>
        <td>${c.status === "Assinado" ? `<span class="badge ok">Assinado ${fmtData(c.assinadoEm)}</span>` : '<span class="badge warn">Aguardando assinatura</span>'}</td>
        <td><div class="row-actions"><button class="btn btn-sm" data-act="verContrato" data-id="${c.id}">Ver</button>${c.status !== "Assinado" ? `${a ? `<a class="btn btn-sm" target="_blank" rel="noopener" href="${waLink(a.telResponsavel || a.telefone, `Olá, ${(a.responsavel || a.nome).split(" ")[0]}! Segue o contrato da ${S.academia.nome} para leitura e assinatura.`)}">Enviar</a>` : ""}<button class="btn btn-sm btn-primary" data-act="assinar" data-id="${c.id}">Marcar assinado</button>` : ""}</div></td>
      </tr>`; }).join("") || `<tr><td colspan="5" class="empty">Nenhum contrato. Crie a partir do modelo da academia.</td></tr>`}</tbody>
    </table></div></div>`
  });

  VIEWS.whatsapp = () => {
    const t = hoje(), lim = addDias(t, 3);
    const venc = S.cobrancas.filter(c => !c.pagoEm && c.venc >= t && c.venc <= lim);
    const atras = S.cobrancas.filter(c => statusCob(c) === "atrasado");
    const niver = ativos().filter(a => a.nasc && a.nasc.slice(5) === t.slice(5));
    const sumidos = ativos().filter(a => { const u = ultimaPresenca(a.id); return !u || u < addDias(t, -14); });
    const item = (a, tipo, extra = {}) => {
      if (!a) return "";
      const nomeMsg = (["vencendo", "atrasado"].includes(tipo) ? (a.responsavel || a.nome) : a.nome).split(" ")[0];
      const tel = ["vencendo", "atrasado"].includes(tipo) ? (a.telResponsavel || a.telefone) : a.telefone;
      const msg = fill(S.mensagens[tipo], { nome: nomeMsg, academia: S.academia.nome, ...extra });
      return `<div class="list-item"><span class="grow"><b>${esc(a.nome)}</b><br><span class="muted" style="font-size:12px">${esc(msg.slice(0, 90))}…</span></span><a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${waLink(tel, msg)}">Enviar</a></div>`;
    };
    const bloco = (titulo, itens, vazio) => `<div class="panel"><div class="panel-head"><h2>${titulo}</h2><span class="badge">${itens.length}</span></div><div class="list">${itens.join("") || `<div class="empty">${vazio}</div>`}</div></div>`;
    return {
      title: "WhatsApp",
      actions: `<a class="btn btn-sm" href="#/config">Editar mensagens</a>`,
      html: `<p class="muted" style="margin-top:-8px">Mensagens prontas para enviar pelo WhatsApp. No plano Faixa Preta, o envio é automático.</p>
      <div class="cols-2">
        ${bloco("Vencem nos próximos 3 dias", venc.map(c => item(aluno(c.alunoId), "vencendo", { valor: brl(c.valor), venc: fmtData(c.venc) })), "Nada vencendo.")}
        ${bloco("Mensalidades atrasadas", atras.map(c => item(aluno(c.alunoId), "atrasado", { valor: brl(c.valor), venc: fmtData(c.venc) })), "Nenhum atraso. 🎉")}
        ${bloco("Aniversariantes de hoje", niver.map(a => item(a, "aniversario")), "Ninguém faz aniversário hoje.")}
        ${bloco("Sem treinar há 14+ dias", sumidos.map(a => item(a, "sumido")), "Todos em dia com os treinos.")}
      </div>`
    };
  };

  VIEWS.config = () => ({
    title: "Configurações",
    html: `<form id="cfgForm">
      <div class="panel"><h2>Academia</h2><div class="form-grid">
        <label>Nome<input name="nome" value="${esc(S.academia.nome)}" required></label>
        <label>Professor responsável<input name="professor" value="${esc(S.academia.professor)}"></label>
        <label>Cidade<input name="cidade" value="${esc(S.academia.cidade)}"></label>
        <label>WhatsApp da academia<input name="telefone" value="${esc(S.academia.telefone)}"></label>
      </div></div>
      <div class="panel"><h2>Faixas e graduação</h2><div class="form-grid">
        <label class="full">Faixas, em ordem (separadas por vírgula)<input name="faixas" value="${esc(S.faixas.join(", "))}"></label>
        <label>Aulas mínimas na faixa<input name="aulas" type="number" min="1" value="${S.regra.aulas}"></label>
        <label>Meses mínimos na faixa<input name="meses" type="number" min="0" value="${S.regra.meses}"></label>
      </div></div>
      <div class="panel"><h2>Mensagens de WhatsApp</h2><p class="muted" style="font-size:13px">Use {nome}, {valor}, {venc} e {academia}.</p><div class="form-grid">
        ${[["vencendo", "Lembrete de vencimento"], ["atrasado", "Cobrança em atraso"], ["aniversario", "Aniversário"], ["sumido", "Aluno ausente"]].map(([k, l]) => `<label class="full">${l}<textarea name="msg_${k}" style="min-height:70px">${esc(S.mensagens[k])}</textarea></label>`).join("")}
      </div></div>
      <div style="margin-bottom:20px"><button class="btn btn-primary" type="submit">Salvar configurações</button></div>
    </form>
    <div class="panel"><h2>Dados</h2>
      <p class="muted">Seus dados ficam neste navegador. Exporte um backup para levar a outro aparelho.</p>
      <div class="row-actions" style="justify-content:flex-start;flex-wrap:wrap">
        <button class="btn btn-sm" data-act="exportar">Exportar backup (.json)</button>
        <label class="btn btn-sm" style="display:inline-flex">Importar backup<input type="file" id="importFile" accept="application/json" hidden></label>
        <button class="btn btn-sm" data-act="seed">Recarregar dados de exemplo</button>
        <button class="btn btn-sm btn-danger" data-act="zerar">Apagar tudo e começar do zero</button>
      </div></div>`,
    after() {
      $("#cfgForm").addEventListener("submit", e => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target).entries());
        Object.assign(S.academia, { nome: f.nome, professor: f.professor, cidade: f.cidade, telefone: f.telefone });
        const fx = f.faixas.split(",").map(x => x.trim()).filter(Boolean);
        if (fx.length) S.faixas = fx;
        S.regra = { aulas: Math.max(1, +f.aulas || 1), meses: Math.max(0, +f.meses || 0) };
        ["vencendo", "atrasado", "aniversario", "sumido"].forEach(k => S.mensagens[k] = f["msg_" + k]);
        save(); toast("Configurações salvas."); render();
      });
      $("#importFile").addEventListener("change", e => {
        const file = e.target.files[0]; if (!file) return;
        file.text().then(txt => {
          try { const d = JSON.parse(txt); if (!d.alunos || !d.academia) throw 0; S = d; save(); toast("Backup importado."); render(); }
          catch (_) { toast("Arquivo inválido."); }
        });
      });
    }
  });

  // ---------- formulários ----------
  function alunoForm(id) {
    const a = id ? aluno(id) : { nome: "", nasc: "", telefone: "", email: "", responsavel: "", telResponsavel: "", turmaId: S.turmas[0]?.id || "", faixa: S.faixas[0], graus: 0, desdeFaixa: hoje(), mensalidade: 150, vencDia: 10, ativo: true, obs: "" };
    openDlg(id ? "Editar aluno" : "Novo aluno", `<div class="form-grid">
      <label class="full">Nome completo<input name="nome" required value="${esc(a.nome)}"></label>
      <label>Nascimento<input name="nasc" type="date" value="${esc(a.nasc)}"></label>
      <label>Telefone / WhatsApp<input name="telefone" value="${esc(a.telefone)}"></label>
      <label>E-mail<input name="email" type="email" value="${esc(a.email)}"></label>
      <label>Turma<select name="turmaId">${S.turmas.map(t => `<option value="${t.id}"${t.id === a.turmaId ? " selected" : ""}>${esc(t.nome)}</option>`).join("")}<option value=""${a.turmaId ? "" : " selected"}>Sem turma</option></select></label>
      <label>Responsável (menores)<input name="responsavel" value="${esc(a.responsavel)}"></label>
      <label>Telefone do responsável<input name="telResponsavel" value="${esc(a.telResponsavel)}"></label>
      <label>Faixa<select name="faixa">${S.faixas.map(f => `<option${f === a.faixa ? " selected" : ""}>${esc(f)}</option>`).join("")}</select></label>
      <label>Graus<input name="graus" type="number" min="0" max="10" value="${a.graus}"></label>
      <label>Na faixa desde<input name="desdeFaixa" type="date" value="${esc(a.desdeFaixa)}"></label>
      <label>Mensalidade (R$)<input name="mensalidade" type="number" step="0.01" min="0" value="${a.mensalidade}"></label>
      <label>Dia de vencimento<input name="vencDia" type="number" min="1" max="28" value="${a.vencDia}"></label>
      <label>Situação<select name="ativo"><option value="1"${a.ativo ? " selected" : ""}>Ativo</option><option value="0"${a.ativo ? "" : " selected"}>Inativo</option></select></label>
      <label class="full">Observações<textarea name="obs" style="min-height:70px">${esc(a.obs)}</textarea></label>
    </div>${id ? `<p style="margin:16px 0 0"><button type="button" class="btn btn-sm btn-ghost btn-danger" data-act="delAluno" data-id="${id}">Excluir aluno</button></p>` : ""}`, {
      onSave(d) {
        const v = { nome: d.nome.trim(), nasc: d.nasc, telefone: d.telefone, email: d.email, responsavel: d.responsavel, telResponsavel: d.telResponsavel, turmaId: d.turmaId, faixa: d.faixa, graus: +d.graus || 0, desdeFaixa: d.desdeFaixa || hoje(), mensalidade: +d.mensalidade || 0, vencDia: Math.min(28, Math.max(1, +d.vencDia || 10)), ativo: d.ativo === "1", obs: d.obs };
        if (id) Object.assign(a, v);
        else {
          const cod = String(Math.max(1000, ...S.alunos.map(x => +x.codigo || 0)) + 1);
          S.alunos.push({ id: uid(), codigo: cod, criadoEm: hoje(), ...v });
        }
        toast(id ? "Aluno atualizado." : "Aluno cadastrado.");
      }
    });
  }

  function alunoFicha(id) {
    const a = aluno(id), p = progresso(a);
    const cobs = S.cobrancas.filter(c => c.alunoId === id).sort((x, y) => y.competencia.localeCompare(x.competencia)).slice(0, 6);
    const pres = S.presencas.filter(x => x.alunoId === id);
    const p30 = pres.filter(x => x.data > addDias(hoje(), -30)).length;
    openDlg(a.nome, `
      <div class="cols-2" style="gap:16px">
        <div>
          <p style="margin:0 0 6px">${beltHTML(a.faixa, a.graus)}</p>
          <p class="muted" style="margin:0 0 4px">${esc(turma(a.turmaId)?.nome || "Sem turma")} · código <b>${esc(a.codigo)}</b></p>
          <p class="muted" style="margin:0 0 4px">${a.nasc ? `${idade(a.nasc)} anos · nasc. ${fmtData(a.nasc)}` : ""}</p>
          <p class="muted" style="margin:0 0 4px">${esc(a.telefone)} ${a.email ? "· " + esc(a.email) : ""}</p>
          ${a.responsavel ? `<p class="muted" style="margin:0 0 4px">Responsável: ${esc(a.responsavel)} ${esc(a.telResponsavel)}</p>` : ""}
          <div class="kpis" style="grid-template-columns:1fr 1fr;margin-top:14px">
            <div class="kpi"><small>Treinos (30 dias)</small><strong>${p30}</strong></div>
            <div class="kpi"><small>Na faixa</small><strong>${p.aulas} aulas</strong><span class="sub">${p.meses} meses</span></div>
          </div>
        </div>
        <div class="qr-card"><div id="qr"></div><div class="muted" style="font-size:13px">QR Code de check-in</div><div class="code-big">${esc(a.codigo)}</div></div>
      </div>
      <h3 style="font-size:16px;margin:18px 0 8px">Mensalidades</h3>
      <div class="list">${cobs.map(c => `<div class="list-item"><span class="grow">${fmtMes(c.competencia)} · venc. ${fmtData(c.venc)}</span><b>${brl(c.valor)}</b>${c.pagoEm ? '<span class="badge ok">Pago</span>' : statusCob(c) === "atrasado" ? '<span class="badge bad">Atrasado</span>' : '<span class="badge warn">A vencer</span>'}</div>`).join("") || '<div class="empty">Sem cobranças.</div>'}</div>
      ${a.obs ? `<h3 style="font-size:16px;margin:18px 0 8px">Observações</h3><p>${esc(a.obs)}</p>` : ""}`,
      { foot: `<button type="button" class="btn btn-sm" data-act="alunoForm" data-id="${id}">Editar</button><button type="button" class="btn btn-sm btn-primary" data-act="closeDlg">Fechar</button>` });
    if (window.QRCode) new QRCode($("#qr"), { text: "ADM:" + a.codigo, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
  }

  function turmaForm(id) {
    const t = id ? turma(id) : { nome: "", modalidade: "Jiu-Jitsu", dias: [1, 3, 5], hora: "19:00", professor: S.academia.professor, capacidade: 25 };
    openDlg(id ? "Editar turma" : "Nova turma", `<div class="form-grid">
      <label class="full">Nome da turma<input name="nome" required value="${esc(t.nome)}" placeholder="Ex.: Jiu-Jitsu Adulto"></label>
      <label>Modalidade<input name="modalidade" value="${esc(t.modalidade)}" list="mods"><datalist id="mods">${["Jiu-Jitsu", "Judô", "Karatê", "Muay Thai", "Taekwondo", "Capoeira", "Kung Fu", "MMA", "Boxe"].map(m => `<option>${m}</option>`).join("")}</datalist></label>
      <label>Horário<input name="hora" type="time" value="${esc(t.hora)}"></label>
      <label>Professor<input name="professor" value="${esc(t.professor)}"></label>
      <label>Capacidade<input name="capacidade" type="number" min="0" value="${t.capacidade}"></label>
      <div class="full"><label style="margin-bottom:8px">Dias da semana</label><div style="display:flex;gap:8px;flex-wrap:wrap">${DIAS.map((d, i) => `<label style="display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid var(--line);border-radius:999px;color:var(--ink)"><input type="checkbox" name="dia" value="${i}" style="width:auto"${t.dias.includes(i) ? " checked" : ""}>${d}</label>`).join("")}</div></div>
    </div>${id ? `<p style="margin:16px 0 0"><button type="button" class="btn btn-sm btn-ghost btn-danger" data-act="delTurma" data-id="${id}">Excluir turma</button></p>` : ""}`, {
      onSave(d) {
        const v = { nome: d.nome.trim(), modalidade: d.modalidade, hora: d.hora, professor: d.professor, capacidade: +d.capacidade || 0, dias: d._all.getAll("dia").map(Number) };
        if (id) Object.assign(t, v); else S.turmas.push({ id: uid(), ...v });
        toast("Turma salva.");
      }
    });
  }

  function receber(id) {
    const c = S.cobrancas.find(x => x.id === id), a = aluno(c.alunoId);
    openDlg("Registrar pagamento", `<p><b>${esc(a?.nome)}</b> · ${fmtMes(c.competencia)}</p><div class="form-grid">
      <label>Valor (R$)<input name="valor" type="number" step="0.01" value="${c.valor}"></label>
      <label>Data<input name="data" type="date" value="${hoje()}"></label>
      <label class="full">Forma de pagamento<select name="forma"><option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Boleto</option><option>Transferência</option></select></label>
    </div>`, { saveLabel: "Confirmar recebimento", onSave(d) { c.valor = +d.valor || c.valor; c.pagoEm = d.data || hoje(); c.forma = d.forma; toast("Pagamento registrado."); } });
  }

  function graduar(id) {
    const a = aluno(id), i = S.faixas.indexOf(a.faixa);
    const prox = S.faixas[Math.min(S.faixas.length - 1, i + 1)];
    openDlg("Graduar " + a.nome.split(" ")[0], `<div class="form-grid">
      <label>Faixa atual<input value="${esc(a.faixa)}" disabled></label>
      <label>Nova faixa<select name="faixa">${S.faixas.map(f => `<option${f === prox ? " selected" : ""}>${esc(f)}</option>`).join("")}</select></label>
      <label class="full">Data da graduação<input name="data" type="date" value="${hoje()}"></label>
    </div>`, {
      saveLabel: "Confirmar graduação",
      onSave(d) {
        S.graduacoes.push({ id: uid(), alunoId: id, de: a.faixa + (a.graus ? ` ${a.graus}º` : ""), para: d.faixa, data: d.data || hoje() });
        a.faixa = d.faixa; a.graus = 0; a.desdeFaixa = d.data || hoje();
        toast("Oss! Graduação registrada.");
      }
    });
  }

  function despesaForm() {
    openDlg("Nova despesa", `<div class="form-grid">
      <label class="full">Descrição<input name="desc" required></label>
      <label>Categoria<input name="categoria" list="cats" value="Estrutura"><datalist id="cats"><option>Estrutura</option><option>Professores</option><option>Material</option><option>Marketing</option><option>Impostos</option></datalist></label>
      <label>Valor (R$)<input name="valor" type="number" step="0.01" min="0" required></label>
      <label>Data<input name="data" type="date" value="${(UI.comp && UI.comp !== mesAtual()) ? UI.comp + "-01" : hoje()}"></label>
    </div>`, { onSave(d) { S.despesas.push({ id: uid(), desc: d.desc, categoria: d.categoria, valor: +d.valor || 0, data: d.data || hoje() }); } });
  }

  function produtoForm(id) {
    const p = id ? S.produtos.find(x => x.id === id) : { nome: "", preco: 0, estoque: 0 };
    openDlg(id ? "Editar produto" : "Novo produto", `<div class="form-grid">
      <label class="full">Nome<input name="nome" required value="${esc(p.nome)}"></label>
      <label>Preço (R$)<input name="preco" type="number" step="0.01" min="0" value="${p.preco}"></label>
      <label>Estoque<input name="estoque" type="number" min="0" value="${p.estoque}"></label>
    </div>${id ? `<p style="margin:16px 0 0"><button type="button" class="btn btn-sm btn-ghost btn-danger" data-act="delProduto" data-id="${id}">Excluir produto</button></p>` : ""}`, {
      onSave(d) { const v = { nome: d.nome, preco: +d.preco || 0, estoque: +d.estoque || 0 }; if (id) Object.assign(p, v); else S.produtos.push({ id: uid(), ...v }); }
    });
  }

  function vendaForm() {
    openDlg("Registrar venda", `<div class="form-grid">
      <label class="full">Produto<select name="produtoId">${S.produtos.map(p => `<option value="${p.id}">${esc(p.nome)} — ${brl(p.preco)} (${p.estoque} em estoque)</option>`).join("")}</select></label>
      <label>Quantidade<input name="qtd" type="number" min="1" value="1"></label>
      <label>Forma de pagamento<select name="forma"><option>Pix</option><option>Dinheiro</option><option>Cartão</option></select></label>
      <label class="full">Aluno (opcional)<select name="alunoId"><option value="">Venda avulsa</option>${ativos().sort((a, b) => a.nome.localeCompare(b.nome)).map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join("")}</select></label>
    </div>`, {
      saveLabel: "Registrar",
      onSave(d) {
        const p = S.produtos.find(x => x.id === d.produtoId), q = Math.max(1, +d.qtd || 1);
        if (p.estoque < q) { toast(`Estoque insuficiente (${p.estoque}).`); return false; }
        p.estoque -= q;
        S.vendas.push({ id: uid(), produtoId: p.id, produto: p.nome, alunoId: d.alunoId || null, qtd: q, valor: p.preco * q, data: hoje(), forma: d.forma });
        toast("Venda registrada.");
      }
    });
  }

  function contratoForm() {
    openDlg("Novo contrato", `<div class="form-grid">
      <label class="full">Aluno<select name="alunoId" required>${ativos().sort((a, b) => a.nome.localeCompare(b.nome)).map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join("")}</select></label>
      <label class="full">Título<input name="titulo" value="Contrato de matrícula"></label>
    </div><p class="muted" style="font-size:13px;margin:12px 0 0">O texto é gerado a partir do modelo da academia, com os dados do aluno.</p>`, {
      saveLabel: "Gerar contrato",
      onSave(d) { const a = aluno(d.alunoId); if (!a) return false; S.contratos.push({ id: uid(), alunoId: a.id, titulo: d.titulo, texto: textoContrato(S, a), status: "Enviado", criadoEm: hoje(), assinadoEm: null }); toast("Contrato gerado."); }
    });
  }

  function verContrato(id) {
    const c = S.contratos.find(x => x.id === id);
    openDlg(c.titulo, `<div class="contract-text" id="ctext">${esc(c.texto)}</div>`, {
      wide: true, foot: `<button type="button" class="btn btn-sm" data-act="imprimirContrato">Imprimir / PDF</button><button type="button" class="btn btn-sm btn-primary" data-act="closeDlg">Fechar</button>`
    });
  }

  // ---------- check-in ----------
  let scanner = null;
  function stopScanner() { if (scanner) { const s = scanner; scanner = null; s.stop().catch(() => {}).finally(() => { try { s.clear(); } catch (e) {} }); } }
  function registrarCheckin(codigo) {
    const cod = String(codigo).replace(/^ADM:/, "").trim();
    const a = S.alunos.find(x => x.codigo === cod && x.ativo);
    const out = $("#checkinMsg");
    if (!a) { if (out) out.innerHTML = `<span class="badge bad">Código ${esc(cod)} não encontrado</span>`; return; }
    const t = hoje();
    if (S.presencas.some(p => p.alunoId === a.id && p.data === t && p.turmaId === a.turmaId)) {
      if (out) out.innerHTML = `<span class="badge warn">${esc(a.nome)} já fez check-in hoje</span>`; return;
    }
    S.presencas.push({ id: uid(), alunoId: a.id, turmaId: a.turmaId, data: t });
    save();
    if (out) out.innerHTML = `<span class="badge ok" style="font-size:15px;padding:8px 14px">✓ ${esc(a.nome)} · ${esc(a.faixa)}</span>`;
    if (navigator.vibrate) navigator.vibrate(80);
  }
  function abrirCheckin() {
    openDlg("Check-in", `
      <p class="muted" style="margin-top:0">Aponte a câmera para o QR Code do aluno (fica na ficha dele) ou digite o código.</p>
      <div id="reader"></div>
      <div style="display:flex;gap:8px;margin-top:14px"><input id="codigoIn" inputmode="numeric" placeholder="Código do aluno (ex.: 1001)"><button type="button" class="btn btn-primary" data-act="checkinCodigo">OK</button></div>
      <div id="checkinMsg" style="margin-top:14px;min-height:30px;text-align:center"></div>`, {
      foot: `<button type="button" class="btn btn-sm" data-act="iniciarCamera">Usar câmera</button><button type="button" class="btn btn-sm btn-primary" data-act="closeDlg">Concluir</button>`
    });
    $("#codigoIn").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); registrarCheckin(e.target.value); e.target.value = ""; } });
    $("#codigoIn").focus();
  }
  function iniciarCamera() {
    if (!window.Html5Qrcode) return toast("Leitor de QR indisponível.");
    if (scanner) return;
    scanner = new Html5Qrcode("reader");
    let ultimo = "", quando = 0;
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, txt => {
      const agora = Date.now();
      if (txt === ultimo && agora - quando < 3000) return;
      ultimo = txt; quando = agora; registrarCheckin(txt);
    }).catch(() => { scanner = null; toast("Não foi possível abrir a câmera."); });
  }

  // ---------- ações ----------
  const ACTIONS = {
    closeDlg, menu: () => $("#side").classList.toggle("open"),
    theme() {
      const root = document.documentElement;
      const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("adm-theme", root.dataset.theme); } catch (e) {}
    },
    seed() { if (S && !confirmar("Substituir os dados atuais pelos dados de exemplo?")) return; S = seed(); save(); location.hash = "#/painel"; render(); },
    zerar() { if (!confirmar("Apagar todos os dados deste navegador?")) return; try { localStorage.removeItem(KEY); } catch (e) {} S = null; location.hash = ""; render(); },
    exportar() {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `app-do-mestre-${hoje()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    alunoForm: id => { closeDlg(); alunoForm(id); }, alunoFicha, turmaForm,
    delAluno(id) { if (!confirmar("Excluir este aluno? Presenças e cobranças dele também serão apagadas.")) return; S.alunos = S.alunos.filter(a => a.id !== id); S.presencas = S.presencas.filter(p => p.alunoId !== id); S.cobrancas = S.cobrancas.filter(c => c.alunoId !== id); closeDlg(); save(); render(); },
    delTurma(id) { if (S.alunos.some(a => a.turmaId === id) && !confirmar("Há alunos nesta turma. Eles ficarão sem turma. Continuar?")) return; S.turmas = S.turmas.filter(t => t.id !== id); S.alunos.forEach(a => { if (a.turmaId === id) a.turmaId = ""; }); closeDlg(); save(); render(); },
    goChamada(id) { UI.presTurma = id; UI.presData = hoje(); },
    abrirChamada(v) { const [t, d] = v.split("|"); UI.presTurma = t; UI.presData = d; render(); window.scrollTo(0, 0); },
    marcarTodos() { $("#attend").querySelectorAll("input").forEach(i => { i.checked = true; i.closest("label").classList.add("on"); }); $("#attend").dispatchEvent(new Event("change")); },
    salvarChamada() {
      const ids = [...$("#attend").querySelectorAll("input:checked")].map(i => i.value);
      S.presencas = S.presencas.filter(p => !(p.turmaId === UI.presTurma && p.data === UI.presData));
      ids.forEach(alunoId => S.presencas.push({ id: uid(), alunoId, turmaId: UI.presTurma, data: UI.presData }));
      save(); toast(`Chamada salva: ${ids.length} presentes.`); render();
    },
    checkin: abrirCheckin, iniciarCamera,
    checkinCodigo() { const i = $("#codigoIn"); registrarCheckin(i.value); i.value = ""; i.focus(); },
    graduar,
    grau(id) { const a = aluno(id); a.graus = (a.graus || 0) + 1; save(); toast(`${a.nome.split(" ")[0]}: ${a.graus}º grau.`); render(); },
    gerarMens() {
      const m = UI.comp || mesAtual(); let n = 0;
      ativos().forEach(a => { if (!S.cobrancas.some(c => c.alunoId === a.id && c.competencia === m)) { S.cobrancas.push(novaCobranca(a, m)); n++; } });
      save(); toast(`${n} mensalidades geradas.`); render();
    },
    receber,
    estornar(id) { const c = S.cobrancas.find(x => x.id === id); c.pagoEm = null; c.forma = ""; save(); render(); },
    despesaForm, delDespesa(id) { S.despesas = S.despesas.filter(d => d.id !== id); save(); render(); },
    produtoForm, vendaForm,
    delProduto(id) { if (!confirmar("Excluir este produto?")) return; S.produtos = S.produtos.filter(p => p.id !== id); closeDlg(); save(); render(); },
    contratoForm, verContrato,
    assinar(id) { const c = S.contratos.find(x => x.id === id); c.status = "Assinado"; c.assinadoEm = hoje(); save(); render(); },
    imprimirContrato() {
      const w = window.open("", "_blank");
      if (!w) return toast("Permita pop-ups para imprimir.");
      w.document.write(`<!doctype html><meta charset="utf-8"><title>Contrato</title><body style="font:15px/1.6 Georgia,serif;max-width:720px;margin:40px auto;white-space:pre-wrap">${$("#ctext").innerHTML}</body>`);
      w.document.close(); w.focus(); w.print();
    },
    modeloContrato() {
      openDlg("Modelo de contrato", `<p class="muted" style="margin-top:0;font-size:13px">Campos: {academia}, {aluno}, {responsavel_txt}, {turma}, {valor}, {vencDia}, {data}, {cidade}</p><textarea name="modelo" style="min-height:360px">${esc(S.contratoModelo)}</textarea>`, {
        wide: true, onSave(d) { S.contratoModelo = d.modelo; toast("Modelo salvo."); }
      });
    }
  };
  function confirmar(msg) { return window.confirm(msg); }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el) { if (!e.target.closest("#side") && !e.target.closest(".menu-btn")) $("#side")?.classList.remove("open"); return; }
    const fn = ACTIONS[el.dataset.act];
    if (!fn) return;
    if (el.tagName === "BUTTON") e.preventDefault();
    fn(el.dataset.id, el);
  });

  // ---------- início ----------
  S = load();
  if (!S && new URLSearchParams(location.search).get("demo")) { S = seed(); save(); }
  if (S && S.demo === undefined) S.demo = false;
  if (S) {
    // gera mensalidades do mês corrente automaticamente
    const m = mesAtual();
    ativos().forEach(a => { if (!S.cobrancas.some(c => c.alunoId === a.id && c.competencia === m)) S.cobrancas.push(novaCobranca(a, m)); });
    save();
  }
  render();

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
