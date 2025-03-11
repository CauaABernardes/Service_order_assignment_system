
let mecAUX = []; // Array auxiliar para armazenar os dados dos mecânicos.
let pagAtual = 1; // Página atual.
const qtdPorPag = 15; // Quantidade de itens por página.

async function pegarDados() {
    try {

        const apiURL = "https://cenoura.glitch.me/mecanicos"; // URL da API de mecânicos
        const resposta = await fetch(apiURL);  // Realiza a requisição para obter os dados
        const dados = await resposta.json();  // Converte a resposta para JSON

        const apiCentro = "https://cenoura.glitch.me/centrosdistribuicao";  // URL dos centros de distribuição
        const respostaCentro = await fetch(apiCentro);  // Requisição para obter dados dos centros de distribuição
        const dadosCentro = await respostaCentro.json();  // Converte a resposta para JSON

        // Atualiza os dados dos mecânicos com o nome do centro de distribuição
        for (i = 0; i < dados.length; i++) {
            if (dados[i].codigoCentroDistribuicao == 1) {
                dados[i].codigoCentroDistribuicao = dadosCentro[0].cidade;
            }
            else if (dados[i].codigoCentroDistribuicao == 2) {
                dados[i].codigoCentroDistribuicao = dadosCentro[1].cidade;
            } 
            else {
                dados[i].codigoCentroDistribuicao = dadosCentro[2].cidade;
            }
        }

        // Processa os dados dos mecânicos e os armazena no 'mecAUX'
        mecAUX = dados.map(item => ({
            codigoMecanico: item.codigoMecanico,
            nome: item.nome,
            nomeCentro: item.codigoCentroDistribuicao
        }));

        // Chama a função de paginação para exibir os primeiros 15 mecânicos
        paginacaoMec(mecAUX, 1, qtdPorPag);

    } catch (error) {
        console.error("Erro ao pegar os dados", error); // Exibe erro caso a requisição falhe
    }
}

function paginacaoMec(itens, pagAtual, qtdPorPag) {

    const totalPag = Math.ceil(itens.length / qtdPorPag); // Calcula o número total de páginas
    let contador = (pagAtual - 1) * qtdPorPag; // Calcula o índice inicial para a página atual
    let delimitador = contador + qtdPorPag; // Índice final dos itens a serem exibidos

    if (pagAtual < 1) pagAtual = 1; // Garante que a página não seja menor que 1
    if (pagAtual > totalPag) pagAtual = totalPag; // Garante que a página não ultrapasse o total de páginas

    // Seleciona uma parte do array de itens correspondente à página atual
    const result = itens.slice(contador, delimitador);

    // Chama a função para posicionar e exibir os itens filtrados na página
    posicionarMecanicosfiltro(result);
    
    // Chama a função que gera os controles de navegação de página
    gerarPaginacao(itens, pagAtual, totalPag);
}

function gerarPaginacao(itens, pagAtual, totalPag) {

    const paginacao = document.querySelector(".paginacao"); // Seleciona o elemento onde os controles de navegação serão adicionados
    paginacao.innerHTML = ''; // Limpa a área de navegação anterior

    // Cria o botão de navegação para a página anterior
    const botaoPagAnt = document.createElement("a");
    botaoPagAnt.href = "#";
    botaoPagAnt.innerText = "«";
    botaoPagAnt.classList.add("pagina-nav");
    botaoPagAnt.onclick = () => paginacaoMec(itens, pagAtual - 1, qtdPorPag);
    if (pagAtual === 1) botaoPagAnt.classList.add("disabled"); // Desativa o botão de "anterior" se já estiver na primeira página
    paginacao.appendChild(botaoPagAnt);

    // Cria os botões de número de página
    for (let i = 1; i <= totalPag; i++) {
        const botao = document.createElement("a");
        botao.href = "#";
        botao.innerText = i;
        botao.classList.add("pagina-num");
        if (i === pagAtual) botao.classList.add("active"); // Destaca a página atual
        botao.onclick = () => paginacaoMec(itens, i, qtdPorPag);
        paginacao.appendChild(botao);
    }

    // Cria o botão de navegação para a próxima página
    const botaoPagSeg = document.createElement("a");
    botaoPagSeg.href = "#";
    botaoPagSeg.innerText = "»";
    botaoPagSeg.classList.add("pagina-nav");
    botaoPagSeg.onclick = () => paginacaoMec(itens, pagAtual + 1, qtdPorPag);
    if (pagAtual === totalPag) botaoPagSeg.classList.add("disabled"); // Desativa o botão de "próxima" se já estiver na última página
    paginacao.appendChild(botaoPagSeg);
}

function filtrarMec() {
    const input = document.getElementById("pesquisar").value.toUpperCase(); // Obtém o valor da pesquisa e converte para maiúsculas

    // Filtra os mecânicos que possuem o valor de pesquisa em qualquer uma das propriedades
    const filtro = mecAUX.filter(mecAUX => {
        return (
            mecAUX.codigoMecanico.toString().includes(input) || // verifica se o que foi digitado se enquadra com o "codigoMecanico" convertido em string
            mecAUX.nome.toUpperCase().includes(input) ||        // verifica se o que foi digitado se enquadra com o "nome" convertido para maiusculo
            mecAUX.nomeCentro.toUpperCase().includes(input)     // verifica se o que foi digitado se enquadra com o "nomeCentro" convertido para maiusculo
        );
    });

    // Exibe os resultados filtrados na página
    paginacaoMec(filtro, 1, qtdPorPag);
}

function posicionarMecanicosfiltro(filtragem) {

    let cont = ""; // Variável para armazenar o conteúdo HTML gerado

    // Gera as linhas da tabela para os mecânicos filtrados
    for (let i = 0; i < filtragem.length; i++) {
        cont += "<tr>";
        cont += "<td>" + filtragem[i].codigoMecanico + "</td>";
        cont += "<td>" + filtragem[i].nome + "</td>";
        cont += "<td>" + filtragem[i].nomeCentro + "</td>";
        cont += "</tr>";
    }

    // Exibe os dados filtrados na tabela
    document.querySelector("#conteudo").innerHTML = cont;
}

function atualizarPG() {
    location.reload() // Recarrega a página para atualizar os dados exibidos
}

function mudarPG() {
    window.location.href = '../Home/telaInicial.html' // Redireciona para a página inicial
}
