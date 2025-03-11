let veiAUX = []; // Auxiliary array to store vehicle data.
let paginaAtual = 1; // Current page, starting at 1.
const itensPorPag = 15; // Number of items per page.

async function pegarDados() {
    try {
        const apiURL = "https://cenoura.glitch.me/veiculos"; // URL for vehicle API
        const resposta = await fetch(apiURL);  // Fetch request to get vehicle data
        const dados = await resposta.json();  // Convert response to JSON

        const apiCentro = "https://cenoura.glitch.me/centrosdistribuicao";  // URL for distribution centers
        const respostaCentro = await fetch(apiCentro);  // Fetch request for distribution centers data
        const dadosCentro = await respostaCentro.json();  // Convert response to JSON

        // Updates vehicle data with the name of the distribution center
        for (let i = 0; i < dados.length; i++) {
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

        // Processes the vehicle data and stores it in 'veiAUX'
        veiAUX = dados.map(item => ({
            codigoVeiculo: item.codigoVeiculo,
            placa: item.placa,
            ano: item.ano,
            modelo: item.modelo,
            codigoCentroDistribuicao: item.codigoCentroDistribuicao
        }));

        // Displays data for the first page when loaded
        paginacaoVeic(veiAUX, 1, itensPorPag);
    } catch (error) {
        console.error("Error fetching data", error); // Logs error if the request fails
    }
}

function paginacaoVeic(itens, pagAtual, qtdPorPag) {
    const totalPag = Math.ceil(itens.length / qtdPorPag); // Calculates the total number of pages
    let contador = (pagAtual - 1) * qtdPorPag; // Calculates the starting index for the current page
    let delimitador = contador + qtdPorPag; // Ending index of the items to be displayed

    if (pagAtual < 1) pagAtual = 1; // Ensures the page number is not less than 1
    if (pagAtual > totalPag) pagAtual = totalPag; // Ensures the page number does not exceed total pages

    // Selects a portion of the items array corresponding to the current page
    const result = itens.slice(contador, delimitador);

    // Calls the function to position and display filtered items on the page
    posicionarVeiculosfiltro(result);
    
    // Calls the function to generate page navigation controls
    gerarPaginacao(itens, pagAtual, totalPag);
}

function gerarPaginacao(itens, pagAtual, totalPag) {
    const paginacao = document.querySelector(".paginacao"); // Selects the element where navigation controls will be added
    paginacao.innerHTML = ""; // Clears the previous navigation

    // Creates the navigation button for the previous page
    const botaoPagAnt = document.createElement("a");
    botaoPagAnt.href = "#";
    botaoPagAnt.innerText = "«";
    botaoPagAnt.classList.add("pagina-nav");
    botaoPagAnt.onclick = () => paginacaoVeic(itens, pagAtual - 1, itensPorPag);
    if (pagAtual === 1) botaoPagAnt.classList.add("disabled"); // Disables the "previous" button if on the first page
    paginacao.appendChild(botaoPagAnt);

    // Creates page number buttons
    for (let i = 1; i <= totalPag; i++) {
        const botao = document.createElement("a");
        botao.href = "#";
        botao.innerText = i;
        botao.classList.add("pagina-num");
        if (i === pagAtual) botao.classList.add("active"); // Highlights the current page
        botao.onclick = () => paginacaoVeic(itens, i, itensPorPag);
        paginacao.appendChild(botao);
    }

    // Creates the navigation button for the next page
    const botaoPagSeg = document.createElement("a");
    botaoPagSeg.href = "#";
    botaoPagSeg.innerText = "»";
    botaoPagSeg.classList.add("pagina-nav");
    botaoPagSeg.onclick = () => paginacaoVeic(itens, pagAtual + 1, itensPorPag);
    if (pagAtual === totalPag) botaoPagSeg.classList.add("disabled"); // Disables the "next" button if on the last page
    paginacao.appendChild(botaoPagSeg);
}

function filtrarVeic() {
    const input = document.getElementById("pesquisar").value.toUpperCase(); // Gets the search value and converts it to uppercase

    // Filters vehicles that have the search term in any of the properties
    const filtro = veiAUX.filter(veicPesquisado => {
        return (
            veicPesquisado.codigoVeiculo.toString().includes(input) ||
            veicPesquisado.placa.toUpperCase().includes(input) ||
            veicPesquisado.codigoCentroDistribuicao.toUpperCase().includes(input) ||
            veicPesquisado.modelo.toString().includes(input) ||
            veicPesquisado.ano.toString().includes(input)
        );
    });

    // Displays the filtered results on the page
    paginacaoVeic(filtro, 1, itensPorPag);
}

function posicionarVeiculosfiltro(filtragem) {
    let cont = ""; // Variable to store the generated HTML content

    // Generates table rows for filtered vehicles
    for (let i = 0; i < filtragem.length; i++) {
        cont += "<tr>";
        cont += "<td>" + filtragem[i].codigoVeiculo + "</td>";
        cont += "<td>" + filtragem[i].placa + "</td>";
        cont += "<td>" + filtragem[i].ano + "</td>";
        cont += "<td>" + filtragem[i].modelo + "</td>";
        cont += "<td>" + filtragem[i].codigoCentroDistribuicao + "</td>";
        cont += "</tr>";
    }

    // Displays the filtered data in the table
    document.querySelector("#conteudo").innerHTML = cont;
}

function atualizarPG() {
    location.reload(); // Reloads the page to refresh the displayed data
}

function mudarPG() {
    window.location.href = '../Home/telaInicial.html'; // Redirects to the home page
}
