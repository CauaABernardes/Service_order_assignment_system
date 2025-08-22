// Retrieves the stored user and name from localStorage.
const usuario = window.localStorage.getItem("Usuario");
const NomeUsuario = window.localStorage.getItem("NomeUsuario");

let pagAtual = 1;  // Current page of the view
const itensPorPag = 15;  // Number of items displayed per page

// Navigation functions to redirect to other pages
function irMecanico() {
    window.location.href = '../Mecânicos/telaMecanicos.html';  // Redirect to the Mechanics page
}

function irVeiculo() {
    window.location.href = '../Veículos/telaVeiculos.html';  // Redirect to the Vehicles page
}

function atualizarPG() {
    location.reload();  // Reload the current page
}

function voltarLG() {
    window.location.href = '../Login/telaLogin.html';  // Redirect to the Login page
}

// Function to load distribution centers from the API
async function selectCentro() {
    try {
        const apiCentro = "https://cenoura.glitch.me/centrosdistribuicao";  // API URL for distribution centers
        const respostaCentro = await fetch(apiCentro);
        const dadosCentro = await respostaCentro.json();

        const centros = document.getElementById("CentroDistribuição");

        // Fills the dropdown options with distribution centers
        for (i = 0; i < dadosCentro.length; i++) {
            centros.innerHTML += `<option value = ${dadosCentro[i].codigoCentroDistribuicao}> ${dadosCentro[i].cidade} </option>`;
        }
    } catch (error) {
        console.log("Error fetching distribution center information");
    }
}

// Deletion modal, initially hidden
const modalExclusao = document.getElementById("containerModalAviso");
modalExclusao.style.display = "none";

// Main modal and its interaction buttons
const modal = document.getElementById("containerModal");
const botaoCriar = document.getElementById("botaoEditarCriar");
const botaoFechar = document.getElementsByClassName("fechar")[0];
const botaoFecharExlusao = document.getElementsByClassName("fechar")[1];

// Open and close modals
botaoCriar.onclick = function () {
    modal.style.display = "block";  // Show the creation modal
}
botaoFechar.onclick = function () {
    modal.style.display = "none";  // Close the creation modal
}
botaoFecharExlusao.onclick = function () {
    modalExclusao.style.display = "none";  // Close the deletion modal
}

// Function to create a new schedule
async function criarProg() {
    try {
        const API = "https://cenoura.glitch.me/centrosdistribuicao";  // API URL for distribution centers
        const resp = await fetch(API);
        const dadosC = await resp.json();

        const data = document.getElementById("data").value;
        const valorCentro = document.getElementById("CentroDistribuição").value;
        window.localStorage.setItem("Centro", valorCentro);  // Stores the selected center value

        if (data.length > 0) {
            let hoje = new Date();
            let anoMax = new Date();
            anoMax.setFullYear(hoje.getFullYear() + 1);

            const dataS = new Date(data);
            hoje.setHours(0, 0, 0, 0);
            anoMax.setHours(0, 0, 0, 0);
            dataS.setHours(0, 0, 0, 0);

            if ((dataS >= hoje) && (dataS <= anoMax)) {
                document.getElementById("retorno").innerHTML = "";

                let cidadeCentro = '';
                for (let i = 0; i < dadosC.length; i++) {
                    if (dadosC[i].codigoCentroDistribuicao == valorCentro) {
                        cidadeCentro = dadosC[i].cidade;
                        break;
                    }
                }

                const centro = cidadeCentro;

                // Creates an object with the schedule data
                const cronograma = {
                    usuario: usuario,
                    data: data,
                    centroDistribuicao: valorCentro,
                    nomeCentro: centro
                };

                // Retrieves existing schedules from localStorage or creates an empty array
                let cronogramas = JSON.parse(localStorage.getItem("cronogramas")) || [];

                // Checks if there is already a schedule for the same date and center
                for (i = 0; i < cronogramas.length; i++) {
                    if (cronograma.data == cronogramas[i].data && cronograma.nomeCentro == cronogramas[i].nomeCentro) {
                        return document.getElementById("retorno").innerHTML = "Please enter a valid date";
                    }
                }

                // Adds the new schedule to the existing schedules
                cronogramas.push(cronograma);
                localStorage.setItem("cronogramas", JSON.stringify(cronogramas));  // Updates localStorage

                window.location.href = "../Carregamento/telaCarregamento.html";  // Redirects to the loading page

            } else {
                document.getElementById("retorno").innerHTML = "Please enter a valid date";
            }

        } else {
            document.getElementById("retorno").innerHTML = "Please enter a valid date";
        }
    } catch (error) {
        console.log("Error creating schedule", error);
    }
}

// Function to update the schedule table
function atualizarTab() {
    const conteudo = document.querySelector("#tabela tbody");

    // Retrieves schedules stored in localStorage
    const cronogramas = JSON.parse(localStorage.getItem("cronogramas"));

    if (cronogramas && cronogramas.length > 0) {
        // For each schedule, creates a new row in the table
        cronogramas.forEach((item, numCrono) => {
            const linha = document.createElement("tr");
            linha.innerHTML = `<td>${item.usuario}</td>
                               <td>${item.data}</td>
                               <td>${item.centroDistribuicao} / ${item.nomeCentro}</td>
                               <td><a onclick = "verProg(${numCrono})"><span class="material-symbols-outlined">grid_view</span></a></td>
                               <td><button id="iconDelete" onclick="deletarProg(${numCrono})"><span class="material-symbols-outlined">delete_forever</span></button></td>`;
            conteudo.appendChild(linha);  // Adds the row to the table
        });
    }

    // Executes the pagination function for the table
    paginacaoHome(cronogramas, 1, itensPorPag);
}

// Function to delete a schedule
function deletarProg(numCrono) {
    let cronogramas = JSON.parse(localStorage.getItem("cronogramas"));  // Retrieves schedules

    if (cronogramas && cronogramas.length > 0) {
        // Checks if the user has permission to delete the schedule
        if (cronogramas[numCrono].usuario == usuario) {
            cronogramas.splice(numCrono, 1);  // Removes the schedule
            localStorage.setItem("cronogramas", JSON.stringify(cronogramas));  // Updates localStorage
            window.location.reload();  // Reloads the page
        } else {
            const aviso = document.getElementById("aviso");
            aviso.innerHTML = `<h2>User "${usuario}" does not have permission to delete this schedule</h2>`;
            modalExclusao.style.display = "block";  // Shows the warning modal
        }
    }
}

// Function to view the details of a schedule
function verProg(numCrono) {
    let cronogramas = JSON.parse(localStorage.getItem("cronogramas"));  // Retrieves schedules

    const cronogramaVisu = cronogramas[numCrono].centroDistribuicao;
    const nomeCronogramaVisu = cronogramas[numCrono].nomeCentro;
    const dataCronogramaVisu = cronogramas[numCrono].data;

    // Stores the schedule information for viewing
    localStorage.setItem("cronogramaVizualizar", cronogramaVisu);
    localStorage.setItem("nomeCronogramaVizualizar", nomeCronogramaVisu);
    localStorage.setItem("dataCronogramaVizualizar", dataCronogramaVisu);

    window.location.href = "../Cronograma/telaCronograma.html";  // Redirects to the schedule viewing page
}

// Function to filter schedules by text
function filtrarCrono() {
    const input = document.getElementById("pesquisarInicio").value.toUpperCase();
    const cronogramasFiltro = JSON.parse(localStorage.getItem("cronogramas"));

    // Filters the schedules that contain the searched text
    const filtro = cronogramasFiltro.filter(cronoPesq => {
        return (
            cronoPesq.usuario.toUpperCase().includes(input) ||
            cronoPesq.centroDistribuicao.toString().includes(input) ||
            cronoPesq.nomeCentro.toUpperCase().includes(input)
        );
    });

    paginacaoHome(filtro, 1, itensPorPag);  // Updates the page with the filtered results
}

// Function to filter schedules by date
function filtrarCronoData() {
    const input = document.getElementById("pesquisarData").value;
    const cronogramasFiltro = JSON.parse(localStorage.getItem("cronogramas"));

    // Filters the schedules that contain the searched date
    const filtro = cronogramasFiltro.filter(cronoPesq => {
        return (
            cronoPesq.data.includes(input)
        );
    });

    paginacaoHome(filtro, 1, itensPorPag);  // Updates the page with the filtered results
}

// Function to update the table with the filter results
function posicionarProgFiltro(filtro) {
    let cont = '';
    filtro.forEach((item, numCrono) => {
        cont += `
            <tr>
                <td>${item.usuario}</td>
                <td>${item.data}</td>
                <td>${item.centroDistribuicao} / ${item.nomeCentro}</td>
                <td><a id="iconGridView" onclick="verProg(${numCrono})"><span class="material-symbols-outlined">grid_view</span></a></td>
                <td><button id="iconDelete" onclick="deletarProg(${numCrono})"><span class="material-symbols-outlined">delete_forever</span></button></td>
            </tr>
        `;
    });
    document.querySelector("#tabela tbody").innerHTML = cont;
}

// Pagination functions

// Function that controls the pagination of schedules
function paginacaoHome(itens, pagAtual, qtdPorPag) {
    const totalPag = Math.ceil(itens.length / qtdPorPag);
    let contador = (pagAtual - 1) * qtdPorPag;
    let delimitador = contador + qtdPorPag;

    if (pagAtual < 1) pagAtual = 1;
    if (pagAtual > totalPag) pagAtual = totalPag;

    const result = itens.slice(contador, delimitador);

    posicionarProgFiltro(result);  // Updates the table with the current page items
    gerarPaginacao(itens, pagAtual, totalPag);  // Generates the page navigation
}

// Function that creates the page navigation
function gerarPaginacao(itens, pagAtual, totalPag) {
    const paginacao = document.querySelector(".paginacao");
    paginacao.innerHTML = "";

    // Navigation button for the previous page
    if (pagAtual > 1) {
        paginacao.innerHTML += `<a class="paginacao__anterior" onclick="paginacaoHome(itens, ${pagAtual - 1}, ${itensPorPag})">Anterior</a>`;
    }

    // Navigation buttons for each page
    for (let i = 1; i <= totalPag; i++) {
        if (i == pagAtual) {
            paginacao.innerHTML += `<a class="paginacao__pagina--ativo" onclick="paginacaoHome(itens, ${i}, ${itensPorPag})">${i}</a>`;
        } else {
            paginacao.innerHTML += `<a onclick="paginacaoHome(itens, ${i}, ${itensPorPag})">${i}</a>`;
        }
    }

    // Navigation button for the next page
    if (pagAtual < totalPag) {
        paginacao.innerHTML += `<a class="paginacao__proximo" onclick="paginacaoHome(itens, ${pagAtual + 1}, ${itensPorPag})">Próximo</a>`;
    }
}