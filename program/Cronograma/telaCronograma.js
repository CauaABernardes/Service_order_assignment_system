// Function to redirect to the home page
function mudarPG() {
    window.location.href = '../Home/telaInicial.html';  // Redirects to the home page
}

// Retrieves data from localStorage that will be used for the schedule
const centro = localStorage.getItem("cronogramaVizualizar");  // Distribution center ID
const nomeDoCentro = localStorage.getItem("nomeCronogramaVizualizar");  // Distribution center name
const dataDoCronograma = localStorage.getItem("dataCronogramaVizualizar");  // Schedule date

// Variables to store mechanic and service order data
let mecAUX = [];
let odsAUX = [];
let ods = [];
let horarioN = '08:15';  // Default initial time

// Asynchronous function to fetch data from APIs
async function pegarDados() {
    try {
        // Fetch data for mechanics from the API
        const urlMEC = "https://cenoura.glitch.me/mecanicos";
        const respMEC = await fetch(urlMEC);  // Connects to the mechanics API
        const dadosMEC = await respMEC.json();  // Mechanics data in JSON format

        // Fetch data for service orders from the API
        const urlODS = "https://cenoura.glitch.me/ordensservico";
        const respODS = await fetch(urlODS);  // Connects to the service orders API
        const dadosODS = await respODS.json();  // Service orders data in JSON format

        // Filters and adds mechanics to 'mecAUX' array if the center code matches
        for (let i = 0; i < dadosMEC.length; i++) {
            if (dadosMEC[i].codigoCentroDistribuicao == centro) {
                // Checks if the mechanic has already been added to avoid duplicates
                if (!mecAUX.some(mecanico => mecanico.codigoMecanico === dadosMEC[i].codigoMecanico)) {
                    mecAUX.push({
                        codigoMecanico: dadosMEC[i].codigoMecanico,
                        nome: dadosMEC[i].nome
                    });
                }
            }
        }

        // Filters and adds corrective maintenance service orders to the 'odsAUX' array
        for (let i = 0; i < dadosODS.length; i++) {
            if (dadosODS[i].codigoCentroDistribuicao == centro) {
                // Checks if the service order has already been added
                if (!odsAUX.some(ods => ods.numeroOrdemServico === dadosODS[i].numeroOrdemServico)) {
                    if (dadosODS[i].tipoManutencao == "Manutenção corretiva") {
                        odsAUX.push({
                            numeroOrdemServico: dadosODS[i].numeroOrdemServico,
                            codigoVeiculo: dadosODS[i].codigoVeiculo,
                            tipoManutencao: dadosODS[i].tipoManutencao,
                            tempoEstimado: dadosODS[i].tempoEstimado
                        });
                    }
                }
            }
        }

        // Filters and adds non-corrective maintenance service orders to the 'odsAUX' array
        for (let i = 0; i < dadosODS.length; i++) {
            if (dadosODS[i].codigoCentroDistribuicao == centro) {
                if (!odsAUX.some(ods => ods.numeroOrdemServico === dadosODS[i].numeroOrdemServico)) {
                    if (dadosODS[i].tipoManutencao != "Manutenção corretiva") {
                        odsAUX.push({
                            numeroOrdemServico: dadosODS[i].numeroOrdemServico,
                            codigoVeiculo: dadosODS[i].codigoVeiculo,
                            tipoManutencao: dadosODS[i].tipoManutencao,
                            tempoEstimado: dadosODS[i].tempoEstimado
                        });
                    }
                }
            }
        }
        console.log(odsAUX);
    } catch (error) {
        // If an error occurs while fetching data, redirects to the home page after 3 seconds
        setTimeout(() => {
            window.location.href = "../Home/telaInicial.html"; 
        }, 3000);
        console.error("Error fetching data", error);
    }
}

// Asynchronous function to organize the data and generate the schedule
async function organizarDados() {
    try {
        await pegarDados();  // Calls the function to fetch data

        const conteudo = document.getElementById("conteudo");  // Element where the schedule will be displayed

        let posicao = 0;  // Index for mechanics array
        let horario = [];  // Array to store mechanics' schedules
        let naoAlmocou = [];  // Tracks whether the mechanic has had lunch or not
        let horasTrab = [];   // Array to store the total worked hours

        // Organizes the data and populates the schedule
        for (item in odsAUX) {
            
            let horarioN = (horario[posicao] || "08:15");  // If no schedule, use default time
            let almocou = (naoAlmocou[posicao] || 'true');  // Checks if the mechanic has had lunch
            let carga = (horasTrab[posicao] || 0);  // Total worked hours for the mechanic

            if (carga >= 10) {
                posicao++;  // Moves to the next mechanic
            }

            let card = document.getElementById(`mecanico-${posicao}`);
            if (!card) {
                // Creates a new card for the mechanic if it doesn't exist yet
                card = document.createElement("table");
                card.setAttribute("id", "tabela");
                card.setAttribute("class", "mecs");
                card.setAttribute("id", `mecanico-${posicao}`);
                card.innerHTML += `<tr>
                                    <th colspan="3">${mecAUX[posicao].nome}</th>
                                </tr>
                                <tr>
                                    <th class="cabecalho"> Start Time </th>
                                    <th class="cabecalho"> End Time </th>
                                    <th class="cabecalho"> Service Order </th>
                                </tr>
                                <tr>
                                    <td class="linha"> 08:00 </td>
                                    <td class="linha"> 08:15 </td>
                                    <td class="linha"> PREPARATION </td>
                                </tr>`;
            }

            let horaIn = horarioN.substring(0, 2);  // Initial hour for the mechanic
            let minutoIn = horarioN.substring(3, 5);  // Initial minute

            let horarioSomar = odsAUX[item].tempoEstimado;  // Estimated time for the service order
            let horaS = horarioSomar.substring(0, 2);  // Estimated hours
            let minutoS = horarioSomar.substring(3, 5);  // Estimated minutes

            // Adds initial time to estimated time
            let somaH = (parseInt(horaIn) + parseInt(horaS));
            let somaM = (parseInt(minutoIn) + parseInt(minutoS));

            let horaF = String(somaH).padStart(2, '0');  // Final hour (formatted)
            let minutoF = String(somaM).padStart(2, '0'); // Final minute (formatted)

            let horarioF = `${horaF}:${minutoF}`;  // Final time (formatted)
            horario[posicao] = horarioF;  // Updates the final time for the mechanic

            // Converts estimated time to hours and updates total worked hours
            let tempEst = (parseInt(horaS) + (parseInt(minutoS) / 60));
            carga += tempEst;  // Updates total worked hours
            horasTrab[posicao] = carga;  // Saves in the array of worked hours

            // Adds the row with the start time, end time, and service order number to the card
            card.innerHTML += `<tr>
                                <td class="linha">${horarioN}</td>
                                <td class="linha">${horarioF}</td>
                                <td class="linha">${odsAUX[item].numeroOrdemServico}</td>
                                </tr>`;

            // If the final time is greater than or equal to 12 (lunch time), adds a lunch break
            if (parseInt(horaF) >= 12 && almocou == 'true') {
                horaF = parseInt(horaF) + 2;  // Adds 2 hours for lunch break
                horarioF = `${horaF}:${minutoF}`;

                card.innerHTML += `<tr>
                            <td class="linha">${horario[posicao]}</td>
                            <td class="linha">${horarioF}</td>
                            <td class="linha">LUNCH</td>
                            </tr>`;
                
                naoAlmocou[posicao] = 'false';  // Marks that the mechanic has had lunch
                horario[posicao] = horarioF;  // Updates lunch break time

                posicao++;  // Moves to the next mechanic

                if (posicao >= mecAUX.length) {
                    posicao = 0;
                    conteudo.appendChild(card);  // Adds the card to the content
                }

                if (conteudo.contains(card)) {
                }
                conteudo.appendChild(card);
            }

            posicao++;
            
            // If all mechanics have been processed, resets the index and adds the card
            if (posicao >= mecAUX.length) {
                posicao = 0;
                conteudo.appendChild(card);
            }

            if (conteudo.contains(card)) {
            }
            conteudo.appendChild(card);
        }
    } catch (error) {
        // If an error occurs while organizing data, displays a message and redirects after 3 seconds
        document.getElementById("resp").innerHTML = "Failed to create the schedule";
        setTimeout(() => {
            window.location.href = "../Home/telaInicial.html";
        }, 3000);
        console.error("Error organizing the data", error);
    }
}

// Function to update the schedule title on the page
function tituloCronograma() {
    const titulo = document.getElementById("cronograma");  // Schedule title
    const dataTitulo = document.getElementById("dataCronograma");  // Schedule date

    // Updates the content of the schedule title and date
    titulo.innerHTML = ` <p>SCHEDULE: ${nomeDoCentro}</p>`;
    dataTitulo.innerHTML = `<p>${dataDoCronograma}</p>`;
}
