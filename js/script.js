// =============================================
// Portal CONTERC - Sistema Completo com Login
// =============================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Portal CONTERC - Sistema Jurídico Iniciado");
    
    // --- CONFIGURAÇÕES ---
    const CONFIG = {
        API_BASE_URL: 'https://script.google.com/macros/s/AKfycbx7VF0DMIJ4DL9ZSXQwTUZ1FuU_AGb-8QXwccPNMcYuBJn8jl3eG9-PowE27TogeF3S/exec',
        CHAVE_SECRETA: 'CONTERC-BNB-SECRET-2024',
        USE_CORS_PROXY: true
    };

    // --- ELEMENTOS DO DOM ---
    const loginContainer = document.getElementById("login-container");
    const mainContent = document.getElementById("main-content");
    const formLogin = document.getElementById("form-login");
    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
    const msgLogin = document.getElementById("msg-login");
    
    const formCriar = document.getElementById("form-criar-processo");
    const formConsultar = document.getElementById("form-consultar-processo");
    const btnSubmitCriar = document.getElementById("btn-submit-criar");
    const btnSubmitConsultar = document.getElementById("btn-submit-consultar");
    const msgCriar = document.getElementById("msg-criar");
    const msgConsulta = document.getElementById("msg-consulta");

    // --- ESTADO DO USUÁRIO ---
    let usuarioLogado = null;

    // --- SISTEMA DE SEGURANÇA ---
    function gerarTokenFrontend(timestamp) {
        const dados = CONFIG.CHAVE_SECRETA + timestamp;
        let hash = 0;
        for (let i = 0; i < dados.length; i++) {
            const char = dados.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).substring(0, 16);
    }

    function obterCredenciaisSeguras() {
        const timestamp = Date.now().toString();
        const token = gerarTokenFrontend(timestamp);
        return { token, timestamp };
    }

    async function fetchCONTERC(url, options = {}) {
        if (CONFIG.USE_CORS_PROXY) {
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
            try {
                const response = await fetch(proxyUrl, options);
                return response;
            } catch (proxyError) {
                return await fetch(url, options);
            }
        } else {
            return await fetch(url, options);
        }
    }

    async function fetchSeguro(params = {}) {
        const credenciais = obterCredenciaisSeguras();
        const paramsComSeguranca = new URLSearchParams({
            ...params,
            token: credenciais.token,
            timestamp: credenciais.timestamp
        });
        const urlCompleta = `${CONFIG.API_BASE_URL}?${paramsComSeguranca.toString()}`;
        return await fetchCONTERC(urlCompleta);
    }

    // --- SISTEMA DE LOGIN ---
    async function fazerLogin(email, senha) {
        try {
            btnLogin.disabled = true;
            btnLogin.innerHTML = "Verificando...";
            exibirMensagem(msgLogin, "Verificando credenciais...", "info");

            const resposta = await fetchSeguro({
                acao: 'login',
                email: email,
                senha: senha
            });

            const resultado = await resposta.json();

            if (resposta.ok && resultado.success) {
                usuarioLogado = resultado.usuario;
                localStorage.setItem('usuarioCONTERC', JSON.stringify(usuarioLogado));
                
                loginContainer.style.display = 'none';
                mainContent.style.display = 'block';
                
                exibirMensagem(msgLogin, "Login realizado com sucesso!", "sucesso");
                console.log("Usuario logado:", usuarioLogado);
                
            } else {
                exibirMensagem(msgLogin, resultado.error || "Credenciais invalidas", "erro");
            }

        } catch (error) {
            console.error("Erro no login:", error);
            exibirMensagem(msgLogin, "Erro de conexao. Tente novamente.", "erro");
        } finally {
            btnLogin.disabled = false;
            btnLogin.innerHTML = "Acessar Sistema";
        }
    }

    function fazerLogout() {
        usuarioLogado = null;
        localStorage.removeItem('usuarioCONTERC');
        mainContent.style.display = 'none';
        loginContainer.style.display = 'flex';
        formLogin.reset();
        exibirMensagem(msgLogin, "", "info");
    }

    function verificarLoginSalvo() {
        const usuarioSalvo = localStorage.getItem('usuarioCONTERC');
        if (usuarioSalvo) {
            usuarioLogado = JSON.parse(usuarioSalvo);
            loginContainer.style.display = 'none';
            mainContent.style.display = 'block';
            console.log("Login restaurado:", usuarioLogado);
        }
    }

    // --- EVENTOS DE LOGIN ---
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const senha = document.getElementById("login-senha").value.trim();
        
        if (!email || !senha) {
            exibirMensagem(msgLogin, "Preencha email e senha", "erro");
            return;
        }
        
        await fazerLogin(email, senha);
    });

    btnLogout.addEventListener("click", fazerLogout);

    // --- VALIDAÇÕES ---
    class ValidadorProcessos {
        static formatoProcesso = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
        
        static validarProcesso(numero) {
            return this.formatoProcesso.test(numero);
        }

        static validarEmail(email) {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regexEmail.test(email);
        }

        static validarData(data) {
            return !isNaN(Date.parse(data));
        }

        static formatarProcesso(input) {
            let valor = input.value.replace(/\D/g, '');
            
            if (valor.length <= 7) {
                input.value = valor;
            } else if (valor.length <= 9) {
                input.value = valor.slice(0, 7) + '-' + valor.slice(7);
            } else if (valor.length <= 13) {
                input.value = valor.slice(0, 7) + '-' + valor.slice(7, 9) + '.' + valor.slice(9);
            } else if (valor.length <= 14) {
                input.value = valor.slice(0, 7) + '-' + valor.slice(7, 9) + '.' + valor.slice(9, 13) + '.' + valor.slice(13);
            } else if (valor.length <= 16) {
                input.value = valor.slice(0, 7) + '-' + valor.slice(7, 9) + '.' + valor.slice(9, 13) + '.' + valor.slice(13, 14) + '.' + valor.slice(14, 16);
            } else {
                input.value = valor.slice(0, 7) + '-' + valor.slice(7, 9) + '.' + valor.slice(9, 13) + '.' + valor.slice(13, 14) + '.' + valor.slice(14, 16) + '.' + valor.slice(16, 20);
            }
        }
    }

    // --- FORMULÁRIOS PRINCIPAIS ---
    formCriar.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!usuarioLogado) {
            exibirMensagem(msgCriar, "Usuario nao autenticado", "erro");
            return;
        }
        
        btnSubmitCriar.disabled = true;
        btnSubmitCriar.innerHTML = "Enviando...";
        exibirMensagem(msgCriar, "Salvando dados...", "info");

        try {
            const dadosProcesso = {
                escritorio: document.getElementById("escritorio").value.trim(),
                emailSolicitante: usuarioLogado.email, // Usa email do usuario logado
                dataAto: document.getElementById("dataAto").value,
                processo: document.getElementById("processo").value,
                processoOrigem: document.getElementById("processoOrigem").value,
                parte: document.getElementById("parte").value.trim()
            };

            const erros = validarDadosCriacao(dadosProcesso);
            if (erros.length > 0) {
                exibirMensagem(msgCriar, `Erros:<br>• ${erros.join('<br>• ')}`, "erro");
                return;
            }

            const params = {
                acao: 'criar',
                escritorio: dadosProcesso.escritorio,
                emailSolicitante: dadosProcesso.emailSolicitante,
                dataAto: dadosProcesso.dataAto,
                processo: dadosProcesso.processo,
                processoOrigem: dadosProcesso.processoOrigem,
                parte: dadosProcesso.parte
            };

            const resposta = await fetchSeguro(params);
            const resultado = await resposta.json();
            
            if (resposta.ok) {
                exibirMensagem(
                    msgCriar, 
                    `<strong>Processo cadastrado com sucesso!</strong><br>
                    <strong>ID:</strong> ${resultado.idItem}<br>
                    <strong>Data:</strong> ${new Date(resultado.timestamp).toLocaleString('pt-BR')}`, 
                    "sucesso"
                );
                formCriar.reset();
            } else {
                exibirMensagem(msgCriar, resultado.error || "Erro ao salvar", "erro");
            }

        } catch (error) {
            exibirMensagem(msgCriar, "Erro de conexao", "erro");
        } finally {
            btnSubmitCriar.disabled = false;
            btnSubmitCriar.innerHTML = "Enviar Solicitacao";
        }
    });

    formConsultar.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        btnSubmitConsultar.disabled = true;
        btnSubmitConsultar.innerHTML = "Consultando...";
        exibirMensagem(msgConsulta, "Buscando dados...", "info");

        try {
            const numProcesso = document.getElementById("numProcessoConsulta").value;

            if (!ValidadorProcessos.validarProcesso(numProcesso)) {
                exibirMensagem(msgConsulta, "Formato invalido", "erro");
                return;
            }

            const resposta = await fetchSeguro({ numProcesso: numProcesso });
            const resultado = await resposta.json();

            if (resposta.ok && !resultado.error) {
                const html = `
                    <strong>Processo:</strong> ${resultado.processo}<br>
                    <strong>Status:</strong> <span style="color: var(--cor-primaria)">${resultado.status}</span><br>
                    <strong>Parte:</strong> ${resultado.parte}<br>
                    <strong>Escritorio:</strong> ${resultado.escritorio}<br>
                    <strong>Data do Ato:</strong> ${new Date(resultado.dataAto).toLocaleDateString('pt-BR')}
                `;
                exibirMensagem(msgConsulta, html, "sucesso");
            } else {
                exibirMensagem(msgConsulta, resultado.error || "Nao encontrado", "erro");
            }

        } catch (error) {
            exibirMensagem(msgConsulta, "Erro na consulta", "erro");
        } finally {
            btnSubmitConsultar.disabled = false;
            btnSubmitConsultar.innerHTML = "Consultar Processo";
        }
    });

    // --- FUNÇÕES AUXILIARES ---
    function validarDadosCriacao(dados) {
        const erros = [];
        if (!dados.escritorio || dados.escritorio.length < 3) erros.push("Escritorio (3+ caracteres)");
        if (!dados.dataAto) erros.push("Data invalida");
        if (!ValidadorProcessos.validarProcesso(dados.processo)) erros.push("Processo principal invalido");
        if (!ValidadorProcessos.validarProcesso(dados.processoOrigem)) erros.push("Processo origem invalido");
        if (!dados.parte || dados.parte.length < 5) erros.push("Parte (5+ caracteres)");
        return erros;
    }

    function exibirMensagem(elemento, texto, tipo) {
        if (!elemento) return;
        elemento.innerHTML = texto;
        elemento.className = "form-message";
        elemento.classList.add(`form-message--${tipo}`);
    }

    // --- INICIALIZAÇÃO ---
    verificarLoginSalvo();
    document.getElementById('processo')?.addEventListener('input', (e) => ValidadorProcessos.formatarProcesso(e.target));
    document.getElementById('processoOrigem')?.addEventListener('input', (e) => ValidadorProcessos.formatarProcesso(e.target));
    document.getElementById('numProcessoConsulta')?.addEventListener('input', (e) => ValidadorProcessos.formatarProcesso(e.target));
    
    console.log("Sistema CONTERC com login carregado!");
});