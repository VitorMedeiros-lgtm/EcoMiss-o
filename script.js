// ========================================
// ECOMISSÃO — JOGO EDUCATIVO
// 4 FASES: RECICLAGEM, MEMÓRIA, QUEBRA-CABEÇA E QUIZ
// ========================================


// ========================================
// ELEMENTOS DAS TELAS
// ========================================

const telaInicial = document.getElementById("tela-inicial");
const telaRegras = document.getElementById("tela-regras");
const telaRanking = document.getElementById("tela-ranking");
const telaJogo = document.getElementById("tela-jogo");
const telaFinal = document.getElementById("tela-final");

const campoNome = document.getElementById("nome-jogador");
const erroNome = document.getElementById("erro-nome");

const areaQueda = document.getElementById("area-queda");

const pontuacaoElemento = document.getElementById("pontuacao");
const tempoElemento = document.getElementById("tempo");
const jogadorAtualElemento = document.getElementById("jogador-atual");

const fases = [
    document.getElementById("fase-1"),
    document.getElementById("fase-2"),
    document.getElementById("fase-3"),
    document.getElementById("fase-4")
];


// ========================================
// DADOS DO JOGADOR
// ========================================

let nomeJogador = "";
let pontuacao = 0;
let tempo = 50;
let faseAtual = 1;

let intervaloTempo = null;
let intervaloQueda = null;
let timeoutTransicao = null;

let jogoAtivo = false;
let faseTerminando = false;
let resultadoSalvo = false;

let residuosCriados = 0;
let residuosResolvidos = 0;

let primeiraCarta = null;
let segundaCarta = null;
let bloqueioCartas = false;
let paresEncontrados = 0;

let perguntaAtual = 0;
let quizRespondido = false;

let pecasPuzzle = [];
let pecaSelecionada = null;


// ========================================
// CONTROLE DAS TELAS
// ========================================

function mostrarTela(telaEscolhida) {

    const todasAsTelas = [
        telaInicial,
        telaRegras,
        telaRanking,
        telaJogo,
        telaFinal
    ];

    todasAsTelas.forEach(tela => {

        if (tela) {
            tela.classList.add("escondida");
        }

    });

    if (telaEscolhida) {
        telaEscolhida.classList.remove("escondida");
    }

}


function mostrarFase(numero) {

    fases.forEach(fase => {

        if (fase) {
            fase.classList.add("escondida");
        }

    });

    if (!fases[numero - 1]) {

        console.error("A fase " + numero + " não foi encontrada no HTML.");

        return;

    }

    fases[numero - 1].classList.remove("escondida");

    faseAtual = numero;

}


// ========================================
// BOTÕES DO MENU
// ========================================

document.getElementById("botao-regras").addEventListener("click", () => {

    mostrarTela(telaRegras);

});


document.getElementById("voltar-inicial").addEventListener("click", () => {

    mostrarTela(telaInicial);

});


document.getElementById("botao-ranking").addEventListener("click", () => {

    mostrarRanking();

    mostrarTela(telaRanking);

});


document.getElementById("voltar-ranking").addEventListener("click", () => {

    mostrarTela(telaInicial);

});


document.getElementById("botao-jogar").addEventListener("click", iniciarJogo);


document.getElementById("jogar-novamente").addEventListener("click", iniciarJogo);


document.getElementById("voltar-menu").addEventListener("click", () => {

    limparJogoAnterior();

    mostrarTela(telaInicial);

});


// ========================================
// LIMPEZA DOS TEMPORIZADORES
// ========================================

function pararTemporizadores() {

    clearInterval(intervaloTempo);
    clearInterval(intervaloQueda);
    clearTimeout(timeoutTransicao);

    intervaloTempo = null;
    intervaloQueda = null;
    timeoutTransicao = null;

}


function encerrarIntervalos() {

    pararTemporizadores();

    jogoAtivo = false;

}


// ========================================
// LIMPAR JOGO ANTERIOR
// ========================================

function limparJogoAnterior() {

    encerrarIntervalos();

    faseTerminando = false;

    residuosCriados = 0;
    residuosResolvidos = 0;

    primeiraCarta = null;
    segundaCarta = null;
    bloqueioCartas = false;
    paresEncontrados = 0;

    perguntaAtual = 0;
    quizRespondido = false;

    pecasPuzzle = [];
    pecaSelecionada = null;

    if (areaQueda) {
        areaQueda.innerHTML = "";
    }

    const tabuleiroMemoria = document.getElementById("tabuleiro-memoria");

    if (tabuleiroMemoria) {
        tabuleiroMemoria.innerHTML = "";
    }

    const tabuleiroPuzzle = document.getElementById("tabuleiro-quebra-cabeca");

    if (tabuleiroPuzzle) {
        tabuleiroPuzzle.innerHTML = "";
    }

    const alternativas = document.getElementById("alternativas");

    if (alternativas) {
        alternativas.innerHTML = "";
    }

    const feedback = document.getElementById("feedback-quiz");

    if (feedback) {
        feedback.textContent = "";
    }

    const proximaPergunta = document.getElementById("proxima-pergunta");

    if (proximaPergunta) {
        proximaPergunta.classList.add("escondida");
    }

    const mensagemPuzzle = document.getElementById("mensagem-quebra-cabeca");

    if (mensagemPuzzle) {
        mensagemPuzzle.textContent = "";
    }

    const contadorPuzzle = document.getElementById("pecas-corretas");

    if (contadorPuzzle) {
        contadorPuzzle.textContent = "";
    }

    const mensagemJogo = document.getElementById("mensagem-jogo");

    if (mensagemJogo) {
        mensagemJogo.textContent = "";
    }

}


// ========================================
// INICIAR O JOGO
// ========================================

function iniciarJogo() {

    nomeJogador = campoNome.value.trim();

    if (nomeJogador === "") {

        erroNome.textContent = "Digite seu nome antes de jogar!";

        campoNome.focus();

        return;

    }

    erroNome.textContent = "";

    limparJogoAnterior();

    pontuacao = 0;
    tempo = 50;
    faseAtual = 1;

    resultadoSalvo = false;

    pontuacaoElemento.textContent = pontuacao;
    tempoElemento.textContent = tempo;

    jogadorAtualElemento.textContent = nomeJogador;

    mostrarTela(telaJogo);

    iniciarFase1();

}


// ========================================
// PONTUAÇÃO
// ========================================

function adicionarPontos(valor) {

    pontuacao = Math.max(0, pontuacao + valor);

    pontuacaoElemento.textContent = pontuacao;

}


// ========================================
// CRONÔMETRO
// ========================================

function iniciarRelogio(duracao, aoTerminar) {

    clearInterval(intervaloTempo);

    tempo = duracao;

    tempoElemento.textContent = tempo;

    intervaloTempo = setInterval(() => {

        if (!jogoAtivo) {
            return;
        }

        tempo--;

        tempoElemento.textContent = tempo;

        if (tempo <= 0) {

            clearInterval(intervaloTempo);

            intervaloTempo = null;

            aoTerminar();

        }

    }, 1000);

}


// ========================================
// MENSAGENS DO JOGO
// ========================================

function mostrarMensagem(texto) {

    let mensagem = document.getElementById("mensagem-jogo");

    if (!mensagem) {

        mensagem = document.createElement("div");

        mensagem.id = "mensagem-jogo";

        mensagem.style.position = "absolute";
        mensagem.style.top = "100px";
        mensagem.style.left = "50%";
        mensagem.style.transform = "translateX(-50%)";
        mensagem.style.zIndex = "20";
        mensagem.style.padding = "12px 20px";
        mensagem.style.borderRadius = "12px";
        mensagem.style.background = "rgba(255,255,255,0.95)";
        mensagem.style.fontWeight = "bold";
        mensagem.style.textAlign = "center";
        mensagem.style.maxWidth = "90%";

        telaJogo.appendChild(mensagem);

    }

    mensagem.textContent = texto;

    clearTimeout(mensagem.timer);

    mensagem.timer = setTimeout(() => {

        mensagem.textContent = "";

    }, 1200);

}


// ========================================
// PASSAR PARA A PRÓXIMA FASE
// ========================================

function passarParaFase(numero) {

    encerrarIntervalos();

    timeoutTransicao = setTimeout(() => {

        if (numero === 2) {
            iniciarFase2();
        }

        if (numero === 3) {
            iniciarFase3();
        }

        if (numero === 4) {
            iniciarFase4();
        }

    }, 800);

}


// ========================================
// FASE 1 — RESÍDUOS CAINDO
// ========================================

const tiposResiduos = [

    { emoji: "🍎", tipo: "food" },
    { emoji: "🍌", tipo: "food" },
    { emoji: "🥕", tipo: "food" },
    { emoji: "🍂", tipo: "food" },

    { emoji: "🧴", tipo: "plastic" },
    { emoji: "🥤", tipo: "plastic" },
    { emoji: "🛍️", tipo: "plastic" },
    { emoji: "🧃", tipo: "plastic" },

    { emoji: "📰", tipo: "paper" },
    { emoji: "📦", tipo: "paper" },
    { emoji: "📄", tipo: "paper" },
    { emoji: "📚", tipo: "paper" },

    { emoji: "🍾", tipo: "glass" },
    { emoji: "🫙", tipo: "glass" },
    { emoji: "🥛", tipo: "glass" },

    { emoji: "🥫", tipo: "metal" },
    { emoji: "🔩", tipo: "metal" },
    { emoji: "🥄", tipo: "metal" }

];


function iniciarFase1() {

    limparPreparacaoFase();

    mostrarTela(telaJogo);
    mostrarFase(1);

    jogoAtivo = true;
    faseTerminando = false;

    residuosCriados = 0;
    residuosResolvidos = 0;

    criarResiduo();

    intervaloQueda = setInterval(() => {

        if (!jogoAtivo || faseTerminando) {
            return;
        }

        if (residuosCriados < 20) {
            criarResiduo();
        }

    }, 1400);

    iniciarRelogio(50, terminarFase1);

}


function limparPreparacaoFase() {

    pararTemporizadores();

    jogoAtivo = false;
    faseTerminando = false;

    if (areaQueda) {
        areaQueda.innerHTML = "";
    }

}


// ========================================
// CRIAR RESÍDUO
// ========================================

function criarResiduo() {

    if (!jogoAtivo || residuosCriados >= 20) {
        return;
    }

    const objeto = tiposResiduos[
        Math.floor(Math.random() * tiposResiduos.length)
    ];

    const residuo = document.createElement("div");

    residuo.className = "residuo";

    residuo.textContent = objeto.emoji;

    residuo.dataset.tipo = objeto.tipo;
    residuo.dataset.arrastando = "nao";

    const limiteX = Math.max(0, areaQueda.clientWidth - 60);

    const posicaoX = Math.random() * limiteX;

    residuo.style.left = `${posicaoX}px`;
    residuo.style.top = "0px";

    areaQueda.appendChild(residuo);

    residuosCriados++;

    configurarArraste(residuo);

    animarQueda(residuo);

}


// ========================================
// ANIMAÇÃO DOS RESÍDUOS
// ========================================

function animarQueda(residuo) {

    let posicaoY = 0;

    const velocidade = 1.3 + Math.random() * 1.2;

    function mover() {

        if (!jogoAtivo || !residuo.isConnected) {
            return;
        }

        if (residuo.dataset.arrastando === "sim") {

            requestAnimationFrame(mover);

            return;

        }

        posicaoY = parseFloat(residuo.style.top) || posicaoY;

        posicaoY += velocidade;

        residuo.style.top = `${posicaoY}px`;

        if (posicaoY >= areaQueda.clientHeight - 55) {

            residuo.remove();

            residuosResolvidos++;

            verificarFimFase1();

            return;

        }

        requestAnimationFrame(mover);

    }

    requestAnimationFrame(mover);

}


// ========================================
// ARRASTAR OS RESÍDUOS
// ========================================

function configurarArraste(residuo) {

    let deslocamentoX = 0;
    let deslocamentoY = 0;

    let posicaoOriginal = null;

    residuo.addEventListener("pointerdown", evento => {

        if (!jogoAtivo || faseTerminando) {
            return;
        }

        evento.preventDefault();

        residuo.dataset.arrastando = "sim";

        const caixa = residuo.getBoundingClientRect();

        posicaoOriginal = {
            left: residuo.style.left,
            top: residuo.style.top
        };

        deslocamentoX = evento.clientX - caixa.left;
        deslocamentoY = evento.clientY - caixa.top;

        residuo.style.position = "fixed";
        residuo.style.left = `${caixa.left}px`;
        residuo.style.top = `${caixa.top}px`;
        residuo.style.zIndex = "1000";

        residuo.setPointerCapture(evento.pointerId);

    });


    residuo.addEventListener("pointermove", evento => {

        if (residuo.dataset.arrastando !== "sim") {
            return;
        }

        residuo.style.left = `${evento.clientX - deslocamentoX}px`;
        residuo.style.top = `${evento.clientY - deslocamentoY}px`;

    });


    residuo.addEventListener("pointerup", () => {

        if (residuo.dataset.arrastando !== "sim") {
            return;
        }

        residuo.dataset.arrastando = "nao";

        residuo.style.zIndex = "";

        verificarLixeira(residuo, posicaoOriginal);

    });


    residuo.addEventListener("pointercancel", () => {

        if (residuo.dataset.arrastando !== "sim") {
            return;
        }

        residuo.dataset.arrastando = "nao";

        devolverResiduo(residuo, posicaoOriginal);

    });

}


// ========================================
// DEVOLVER RESÍDUO À ÁREA DE QUEDA
// ========================================

function devolverResiduo(residuo, posicaoOriginal) {

    const area = areaQueda.getBoundingClientRect();

    const caixa = residuo.getBoundingClientRect();

    residuo.style.position = "absolute";

    residuo.style.left = `${caixa.left - area.left}px`;
    residuo.style.top = `${caixa.top - area.top}px`;

    residuo.style.zIndex = "";

    if (posicaoOriginal) {

        // Mantém a posição alcançada durante a queda.
        residuo.dataset.arrastando = "nao";

    }

}


// ========================================
// VERIFICAR A LIXEIRA
// ========================================

function verificarLixeira(residuo, posicaoOriginal) {

    const caixaResiduo = residuo.getBoundingClientRect();

    const centroX = caixaResiduo.left + caixaResiduo.width / 2;
    const centroY = caixaResiduo.top + caixaResiduo.height / 2;

    const lixeiras = document.querySelectorAll("#fase-1 .lixeira");

    let lixeiraEscolhida = null;

    lixeiras.forEach(lixeira => {

        const caixa = lixeira.getBoundingClientRect();

        const dentro =
            centroX >= caixa.left &&
            centroX <= caixa.right &&
            centroY >= caixa.top &&
            centroY <= caixa.bottom;

        if (dentro) {
            lixeiraEscolhida = lixeira;
        }

    });


    if (!lixeiraEscolhida) {

        devolverResiduo(residuo, posicaoOriginal);

        return;

    }


    if (residuo.dataset.tipo === lixeiraEscolhida.dataset.tipo) {

        adicionarPontos(10);

        mostrarMensagem("Muito bem! +10 pontos!");

    } else {

        adicionarPontos(-5);

        mostrarMensagem("Lixeira incorreta! -5 pontos!");

    }

    residuo.remove();

    residuosResolvidos++;

    verificarFimFase1();

}


// ========================================
// FINAL DA FASE 1
// ========================================

function verificarFimFase1() {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    if (residuosResolvidos >= 20) {
        terminarFase1();
    }

}


function terminarFase1() {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    faseTerminando = true;

    encerrarIntervalos();

    areaQueda.innerHTML = "";

    mostrarMensagem("Fase 1 concluída! Vamos para a memória!");

    passarParaFase(2);

}


// ========================================
// FASE 2 — JOGO DA MEMÓRIA
// ========================================

const cartasMemoria = [

    "📰", "📰",
    "🧴", "🧴",
    "🍾", "🍾",
    "🥫", "🥫",
    "🍌", "🍌",
    "📦", "📦"

];


function iniciarFase2() {

    limparPreparacaoFase();

    mostrarTela(telaJogo);
    mostrarFase(2);

    jogoAtivo = true;
    faseTerminando = false;

    primeiraCarta = null;
    segundaCarta = null;
    bloqueioCartas = false;
    paresEncontrados = 0;

    const tabuleiro = document.getElementById("tabuleiro-memoria");

    tabuleiro.innerHTML = "";

    const embaralhadas = [...cartasMemoria].sort(
        () => Math.random() - 0.5
    );

    embaralhadas.forEach((emoji, indice) => {

        const carta = document.createElement("button");

        carta.className = "carta";

        carta.textContent = "❔";

        carta.dataset.valor = emoji;
        carta.dataset.indice = indice;

        carta.addEventListener("click", () => {

            virarCarta(carta);

        });

        tabuleiro.appendChild(carta);

    });

    iniciarRelogio(60, terminarFase2);

}


// ========================================
// VIRAR CARTAS
// ========================================

function virarCarta(carta) {

    if (
        !jogoAtivo ||
        faseTerminando ||
        bloqueioCartas ||
        carta.classList.contains("revelada") ||
        carta.classList.contains("encontrada")
    ) {
        return;
    }

    carta.textContent = carta.dataset.valor;

    carta.classList.add("revelada");

    if (!primeiraCarta) {

        primeiraCarta = carta;

        return;

    }

    segundaCarta = carta;

    bloqueioCartas = true;

    if (primeiraCarta.dataset.valor === segundaCarta.dataset.valor) {

        primeiraCarta.classList.add("encontrada");
        segundaCarta.classList.add("encontrada");

        primeiraCarta.classList.remove("revelada");
        segundaCarta.classList.remove("revelada");

        adicionarPontos(10);

        paresEncontrados++;

        primeiraCarta = null;
        segundaCarta = null;

        bloqueioCartas = false;

        if (paresEncontrados === cartasMemoria.length / 2) {

            terminarFase2();

        }

    } else {

        setTimeout(() => {

            if (!jogoAtivo || faseAtual !== 2) {
                return;
            }

            primeiraCarta.textContent = "❔";
            segundaCarta.textContent = "❔";

            primeiraCarta.classList.remove("revelada");
            segundaCarta.classList.remove("revelada");

            primeiraCarta = null;
            segundaCarta = null;

            bloqueioCartas = false;

        }, 900);

    }

}


// ========================================
// FINAL DA FASE 2
// ========================================

function terminarFase2() {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    faseTerminando = true;

    encerrarIntervalos();

    mostrarMensagem("Memória concluída! Prepare-se para o quebra-cabeça!");

    passarParaFase(3);

}


// ========================================
// FASE 3 — QUEBRA-CABEÇA
// ========================================

// Imagem original criada dentro do próprio jogo.
// Não precisa baixar outra imagem.

const desenhoPuzzle = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
        <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#79d5f0"/>
            <stop offset="100%" stop-color="#d6f5c2"/>
        </linearGradient>
    </defs>

    <rect width="800" height="800" fill="url(#ceu)"/>

    <circle cx="110" cy="115" r="48" fill="#fff4a3"/>
    <circle cx="640" cy="125" r="35" fill="#ffffff"/>
    <circle cx="675" cy="115" r="48" fill="#ffffff"/>
    <circle cx="710" cy="132" r="32" fill="#ffffff"/>

    <path d="M0 570 Q150 460 300 560 T600 540 T800 550 V800 H0 Z" fill="#70c75c"/>
    <path d="M0 655 Q190 560 370 650 T800 625 V800 H0 Z" fill="#319b49"/>

    <circle cx="400" cy="310" r="145" fill="#188fd0"/>

    <path d="M310 190 L370 200 L390 245 L360 275 L330 260 L295 225 Z" fill="#4fba63"/>
    <path d="M430 200 L490 215 L520 260 L485 285 L460 270 L435 300 L400 275 Z" fill="#4fba63"/>
    <path d="M320 325 L370 310 L405 350 L390 400 L350 420 L325 380 Z" fill="#4fba63"/>
    <path d="M445 340 L495 325 L520 365 L490 405 L455 395 L430 365 Z" fill="#4fba63"/>

    <text x="400" y="330" text-anchor="middle" font-size="90" fill="#ffffff">♻</text>

    <g transform="translate(75 485)">
        <rect x="0" y="25" width="125" height="190" rx="15" fill="#2678c8" stroke="#ffffff" stroke-width="7"/>
        <rect x="-8" y="12" width="141" height="25" rx="8" fill="#17599b"/>
        <text x="62" y="135" text-anchor="middle" font-size="62" fill="#ffffff">♻</text>
        <text x="62" y="172" text-anchor="middle" font-family="Arial" font-size="23" font-weight="bold" fill="#ffffff">PAPEL</text>
    </g>

    <g transform="translate(250 520)">
        <rect x="0" y="25" width="125" height="155" rx="15" fill="#e53935" stroke="#ffffff" stroke-width="7"/>
        <rect x="-8" y="12" width="141" height="25" rx="8" fill="#a51f22"/>
        <text x="62" y="112" text-anchor="middle" font-size="54" fill="#ffffff">♻</text>
        <text x="62" y="145" text-anchor="middle" font-family="Arial" font-size="19" font-weight="bold" fill="#ffffff">PLÁSTICO</text>
    </g>

    <g transform="translate(425 520)">
        <rect x="0" y="25" width="125" height="155" rx="15" fill="#e5ce27" stroke="#ffffff" stroke-width="7"/>
        <rect x="-8" y="12" width="141" height="25" rx="8" fill="#b59e0b"/>
        <text x="62" y="112" text-anchor="middle" font-size="54" fill="#ffffff">♻</text>
        <text x="62" y="145" text-anchor="middle" font-family="Arial" font-size="19" font-weight="bold" fill="#ffffff">METAL</text>
    </g>

    <g transform="translate(600 485)">
        <rect x="0" y="25" width="125" height="190" rx="15" fill="#299b48" stroke="#ffffff" stroke-width="7"/>
        <rect x="-8" y="12" width="141" height="25" rx="8" fill="#176c31"/>
        <text x="62" y="135" text-anchor="middle" font-size="62" fill="#ffffff">♻</text>
        <text x="62" y="172" text-anchor="middle" font-family="Arial" font-size="23" font-weight="bold" fill="#ffffff">VIDRO</text>
    </g>

    <text x="400" y="755" text-anchor="middle" font-family="Arial" font-size="42" font-weight="bold" fill="#ffffff">CUIDE DO PLANETA!</text>
</svg>
`;

const imagemPuzzle =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(desenhoPuzzle);


// ========================================
// INICIAR QUEBRA-CABEÇA
// ========================================

function iniciarFase3() {

    limparPreparacaoFase();

    mostrarTela(telaJogo);
    mostrarFase(3);

    jogoAtivo = true;
    faseTerminando = false;

    pecaSelecionada = null;

    const tabuleiro = document.getElementById("tabuleiro-quebra-cabeca");

    if (!tabuleiro) {

        console.error(
            "Não encontrei #tabuleiro-quebra-cabeca no HTML."
        );

        return;

    }

    tabuleiro.innerHTML = "";

    const mensagem = document.getElementById("mensagem-quebra-cabeca");

    if (mensagem) {
        mensagem.textContent = "Arraste as peças ou clique em duas para trocar.";
    }

    pecasPuzzle = Array.from(
        { length: 16 },
        (_, indice) => indice
    );

    // Embaralhar as peças.
    do {

        pecasPuzzle.sort(() => Math.random() - 0.5);

    } while (
        pecasPuzzle.every((peca, indice) => peca === indice)
    );

    criarTabuleiroPuzzle();

    atualizarContadorPuzzle();

    iniciarRelogio(120, terminarFase3);

}


// ========================================
// CRIAR PEÇAS DO QUEBRA-CABEÇA
// ========================================

function criarTabuleiroPuzzle() {

    const tabuleiro = document.getElementById("tabuleiro-quebra-cabeca");

    tabuleiro.innerHTML = "";

    pecasPuzzle.forEach((numeroPeca, posicao) => {

        const peca = document.createElement("button");

        peca.type = "button";

        peca.className = "peca-puzzle";

        peca.dataset.peca = numeroPeca;
        peca.dataset.posicao = posicao;

        const coluna = numeroPeca % 4;
        const linha = Math.floor(numeroPeca / 4);

        const posX = coluna * (100 / 3);
        const posY = linha * (100 / 3);

        peca.style.backgroundImage = `url("${imagemPuzzle}")`;

        peca.style.backgroundPosition =
            `${posX}% ${posY}%`;

        peca.setAttribute(
            "aria-label",
            "Peça " + (numeroPeca + 1)
        );

        // Arrastar com o mouse.
        peca.draggable = true;

        peca.addEventListener("dragstart", evento => {

            evento.dataTransfer.setData(
                "text/plain",
                String(posicao)
            );

            pecaSelecionada = posicao;

        });

        peca.addEventListener("dragover", evento => {

            evento.preventDefault();

        });

        peca.addEventListener("drop", evento => {

            evento.preventDefault();

            const origem = Number(
                evento.dataTransfer.getData("text/plain")
            );

            trocarPecas(origem, posicao);

        });

        // Também permite clicar em duas peças para trocá-las.
        peca.addEventListener("click", () => {

            selecionarPeca(posicao);

        });

        tabuleiro.appendChild(peca);

    });

    atualizarPecasCorretas();

}


// ========================================
// SELECIONAR PEÇAS
// ========================================

function selecionarPeca(posicao) {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    if (pecaSelecionada === null) {

        pecaSelecionada = posicao;

        const pecas = document.querySelectorAll(".peca-puzzle");

        pecas.forEach(peca => {

            peca.classList.remove("selecionada");

        });

        const primeira = pecas[posicao];

        if (primeira) {
            primeira.classList.add("selecionada");
        }

        return;

    }

    if (pecaSelecionada === posicao) {

        pecaSelecionada = null;

        document.querySelectorAll(".peca-puzzle").forEach(peca => {

            peca.classList.remove("selecionada");

        });

        return;

    }

    trocarPecas(pecaSelecionada, posicao);

    pecaSelecionada = null;

}


// ========================================
// TROCAR PEÇAS DE LUGAR
// ========================================

function trocarPecas(origem, destino) {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    if (
        !Number.isInteger(origem) ||
        !Number.isInteger(destino) ||
        origem < 0 ||
        destino < 0 ||
        origem >= 16 ||
        destino >= 16
    ) {
        return;
    }

    if (origem === destino) {
        return;
    }

    const temporaria = pecasPuzzle[origem];

    pecasPuzzle[origem] = pecasPuzzle[destino];

    pecasPuzzle[destino] = temporaria;

    pecaSelecionada = null;

    criarTabuleiroPuzzle();

    atualizarContadorPuzzle();

    if (pecasPuzzle.every((peca, indice) => peca === indice)) {

        terminarFase3();

    }

}


// ========================================
// ATUALIZAR CONTADOR DO QUEBRA-CABEÇA
// ========================================

function atualizarContadorPuzzle() {

    const contador = document.getElementById("pecas-corretas");

    if (!contador) {
        return;
    }

    const corretas = pecasPuzzle.filter(
        (peca, indice) => peca === indice
    ).length;

    contador.textContent = "Peças corretas: " + corretas + " de 16";

}


function atualizarPecasCorretas() {

    const pecas = document.querySelectorAll(".peca-puzzle");

    pecas.forEach((peca, indice) => {

        const numeroPeca = Number(peca.dataset.peca);

        if (numeroPeca === indice) {

            peca.classList.add("correta");

        } else {

            peca.classList.remove("correta");

        }

    });

}


// ========================================
// FINAL DA FASE 3
// ========================================

function terminarFase3() {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    faseTerminando = true;

    encerrarIntervalos();

    adicionarPontos(20);

    const mensagem = document.getElementById("mensagem-quebra-cabeca");

    if (mensagem) {
        mensagem.textContent = "Parabéns! Quebra-cabeça completo! +20 pontos!";
    }

    timeoutTransicao = setTimeout(() => {

        iniciarFase4();

    }, 1500);

}


// ========================================
// FASE 4 — QUIZ AMBIENTAL
// ========================================

const perguntas = [

    {
        pergunta: "Qual é a cor da lixeira destinada ao papel?",
        alternativas: ["Verde", "Azul", "Vermelha", "Amarela"],
        correta: 1,
        explicacao: "A lixeira azul é destinada ao papel."
    },

    {
        pergunta: "Qual destes materiais pode ser reciclado?",
        alternativas: [
            "Garrafa plástica",
            "Poeira",
            "Lixo misturado",
            "Restos contaminados"
        ],
        correta: 0,
        explicacao: "Garrafas plásticas podem ser recicladas quando destinadas corretamente."
    },

    {
        pergunta: "Qual atitude ajuda a economizar água?",
        alternativas: [
            "Deixar a torneira aberta",
            "Lavar a calçada com mangueira",
            "Fechar a torneira ao escovar os dentes",
            "Demorar mais no banho"
        ],
        correta: 2,
        explicacao: "Fechar a torneira durante a escovação ajuda a economizar água."
    },

    {
        pergunta: "Qual atitude ajuda a proteger o planeta?",
        alternativas: [
            "Jogar lixo no rio",
            "Separar os resíduos",
            "Queimar plástico",
            "Desperdiçar água"
        ],
        correta: 1,
        explicacao: "Separar os resíduos facilita a reciclagem e reduz a poluição."
    },

    {
        pergunta: "Onde devemos descartar uma garrafa de vidro vazia?",
        alternativas: [
            "Na lixeira de papel",
            "Na lixeira de metal",
            "Na lixeira de vidro",
            "Na lixeira de plástico"
        ],
        correta: 2,
        explicacao: "O vidro deve ser encaminhado para a coleta apropriada."
    }
    ,
{
    pergunta: "6. Qual é a principal vantagem da reciclagem?",
    alternativas: [
        "Aumentar a quantidade de lixo",
        "Economizar recursos naturais",
        "Poluir os rios",
        "Destruir as florestas"
    ],
    correta: 1,
    explicacao: "A reciclagem economiza recursos naturais e ajuda a preservar o meio ambiente."
},
{
    pergunta: "7. Onde devemos descartar as pilhas usadas?",
    alternativas: [
        "No lixo orgânico",
        "Em qualquer lixeira",
        "Em pontos de coleta específicos",
        "No vaso sanitário"
    ],
    correta: 2,
    explicacao: "As pilhas podem liberar substâncias tóxicas que contaminam o solo e a água."
},
{
    pergunta: "8. Qual destes materiais demora mais tempo para se decompor na natureza?",
    alternativas: [
        "Casca de banana",
        "Papel",
        "Folhas secas",
        "Garrafa de plástico"
    ],
    correta: 3,
    explicacao: "A garrafa plástica demora centenas de anos para se decompor, causando poluição e prejudicando o meio ambiente."
},
{
    pergunta: "9. O que devemos fazer com uma garrafa plástica vazia?",
    alternativas: [
        "Descartá-la em um local adequado para reciclagem",
        "Jogá-la em um rio",
        "Enterrá-la no quintal",
        "Queimá-la"
    ],
    correta: 0,
    explicacao: "O descarte correto permite reciclar a garrafa e reduzir a poluíção."
},
{
    pergunta: "10. Qual destas atitudes ajuda a reduzir a produção de lixo?",
    alternativas: [
        "Usar copos descartáveis sempre",
        "Comprar produtos com muitas embalagens",
        "Utilizar sacolas reutilizáveis",
        "Jogar objetos fora sem necessidade"
    ],
    correta: 2,
    explicacao: "As sacolas reutilizáveis reduzem o uso de sacolas plásticas descartáveis."
}

];


// ========================================
// INICIAR FASE 4
// ========================================

function iniciarFase4() {

    limparPreparacaoFase();

    mostrarTela(telaJogo);
    mostrarFase(4);

    jogoAtivo = true;
    faseTerminando = false;

    perguntaAtual = 0;
    quizRespondido = false;

    mostrarPergunta();

    iniciarRelogio(180, terminarFase4);

}


// ========================================
// MOSTRAR PERGUNTA
// ========================================

function mostrarPergunta() {

    const dados = perguntas[perguntaAtual];

    quizRespondido = false;

    document.getElementById("numero-pergunta").textContent =
        "Pergunta " + (perguntaAtual + 1) + " de " + perguntas.length;

    document.getElementById("pergunta").textContent = dados.pergunta;

    document.getElementById("feedback-quiz").textContent = "";

    document.getElementById("proxima-pergunta").classList.add("escondida");

    const alternativas = document.getElementById("alternativas");

    alternativas.innerHTML = "";

    dados.alternativas.forEach((texto, indice) => {

        const botao = document.createElement("button");

        botao.type = "button";
        botao.textContent = texto;

        botao.addEventListener("click", () => {

            responderPergunta(indice);

        });

        alternativas.appendChild(botao);

    });

}


// ========================================
// RESPONDER AO QUIZ
// ========================================

function responderPergunta(indice) {

    if (!jogoAtivo || faseTerminando || quizRespondido) {
        return;
    }

    quizRespondido = true;

    const dados = perguntas[perguntaAtual];

    const botoes = document.querySelectorAll("#alternativas button");

    botoes.forEach(botao => {

        botao.disabled = true;

    });

    const feedback = document.getElementById("feedback-quiz");

    if (indice === dados.correta) {

        adicionarPontos(10);

        feedback.textContent =
            "Correto! +10 pontos. " + dados.explicacao;

        feedback.style.color = "#168b42";

    } else {

        feedback.textContent =
            "Resposta incorreta. " + dados.explicacao;

        feedback.style.color = "#b51f1f";

    }

    document.getElementById("proxima-pergunta").classList.remove("escondida");

}


// ========================================
// BOTÃO PRÓXIMA PERGUNTA
// ========================================

document.getElementById("proxima-pergunta").addEventListener("click", () => {

    if (!jogoAtivo || faseTerminando || !quizRespondido) {
        return;
    }

    perguntaAtual++;

    if (perguntaAtual >= perguntas.length) {

        terminarFase4();

    } else {

        mostrarPergunta();

    }

});


// ========================================
// FINAL DA FASE 4
// ========================================

function terminarFase4() {

    if (!jogoAtivo || faseTerminando) {
        return;
    }

    faseTerminando = true;

    encerrarIntervalos();

    mostrarResultado();

}


// ========================================
// RESULTADO FINAL
// ========================================

function mostrarResultado() {

    encerrarIntervalos();

    const resultado = document.getElementById("resultado-final");

    resultado.innerHTML =
        "Jogador: <strong></strong><br>" +
        "Pontuação: <strong></strong><br>" +
        "Parabéns por participar da EcoMissão!";

    const destaques = resultado.querySelectorAll("strong");

    destaques[0].textContent = nomeJogador;

    destaques[1].textContent = pontuacao + " pontos";

    if (!resultadoSalvo) {

        salvarRanking();

        resultadoSalvo = true;

    }

    mostrarTela(telaFinal);

}


// ========================================
// SALVAR RANKING
// ========================================

function salvarRanking() {

    let ranking = [];

    try {

        ranking = JSON.parse(
            localStorage.getItem("rankingEcoMissao")
        ) || [];

    } catch (erro) {

        ranking = [];

    }

    ranking.push({
        nome: nomeJogador,
        pontos: pontuacao
    });

    ranking.sort((a, b) => b.pontos - a.pontos);

    ranking = ranking.slice(0, 10);

    try {

        localStorage.setItem(
            "rankingEcoMissao",
            JSON.stringify(ranking)
        );

    } catch (erro) {

        console.error("Não foi possível salvar o ranking.", erro);

    }

}


// ========================================
// MOSTRAR RANKING
// ========================================

function mostrarRanking() {

    const lista = document.getElementById("lista-ranking");

    lista.innerHTML = "";

    let ranking = [];

    try {

        ranking = JSON.parse(
            localStorage.getItem("rankingEcoMissao")
        ) || [];

    } catch (erro) {

        ranking = [];

    }

    if (ranking.length === 0) {

        const item = document.createElement("li");

        item.textContent = "Ainda não existem jogadores no ranking.";

        lista.appendChild(item);

        return;

    }

    ranking.forEach((jogador, indice) => {

        const item = document.createElement("li");

        item.textContent =
            (indice + 1) + "º lugar — " +
            jogador.nome + " — " +
            jogador.pontos + " pontos";

        lista.appendChild(item);

    });

}