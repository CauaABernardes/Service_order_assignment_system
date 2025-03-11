// Selects the HTML elements to be manipulated to display the progress and counter.
const contador = document.querySelector('.contador');  // Element to display the progress counter
const progresso = document.querySelector('.progresso');  // Progress bar element
const caminhao = document.querySelector('.caminhaoCarregamento');  // Truck element that moves during loading
const loading = setInterval(load, 50);  // Interval for the loading animation (runs every 50ms)
const conteudoL = document.getElementById("conteudoL");  // Element where content is displayed during loading
const conteudoB = document.getElementById("areaBotao");  // Area where the "back" button will be added

// Creating the "back" button to go to the previous page
botaoVoltar = document.createElement("button");
botaoVoltar.setAttribute("type", "button");
botaoVoltar.setAttribute("onclick", "mudarPG()");  // Function to redirect to the home page
botaoVoltar.setAttribute("id", "botaoVoltar");
botaoVoltar.innerHTML += `<span class = "material-symbols-outlined">arrow_back</span>`;  // Button icon

// Function to redirect to the home page.
function mudarPG() {
    window.location.href = '../Home/telaInicial.html';  // Redirects to the home page
}

// Retrieves the stored center of distribution value from localStorage.
const centro = parseInt(window.localStorage.getItem("Centro"));

// Auxiliary arrays to store mechanic and service order data.
let mecAUX = [];
let odsAUX = [];
let ods = [];
let horaTrab = [];
let horarioN = '08:15';  // Default initial time

// Asynchronous function to fetch data from the API about mechanics and service orders.
async function pegarDados() {
    try {
        // API connections to fetch data for mechanics and service orders
        const urlMEC = "https://cenoura.glitch.me/mecanicos";
        const respMEC = await fetch(urlMEC);
        const dadosMEC = await respMEC.json();

        const urlODS = "https://cenoura.glitch.me/ordensservico";
        const respODS = await fetch(urlODS);
        const dadosODS = await respODS.json();

        // Filters and organizes mechanic data based on the distribution center
        for (let i = 0; i < dadosMEC.length; i++) {
            if (dadosMEC[i].codigoCentroDistribuicao == centro) {
                if (!mecAUX.some(mecanico => mecanico.codigoMecanico === dadosMEC[i].codigoMecanico)) {
                    mecAUX.push({
                        codigoMecanico: dadosMEC[i].codigoMecanico,
                        nome: dadosMEC[i].nome
                    });
                }
            }
        }

        // Filters and organizes service orders based on distribution center and maintenance type
        for (let i = 0; i < dadosODS.length; i++) {
            if (dadosODS[i].codigoCentroDistribuicao == centro) {
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

        // Organizes non-corrective service orders
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

    } catch (error) {
        // If there’s an error fetching the data, stop the loading animation and redirect to the home page
        clearInterval(loading);
        document.getElementById("titulo").innerHTML = "Failed to create schedule";
        setTimeout(() => {
            window.location.href = "../Home/telaInicial.html";
        }, 3000);
        console.error("Error fetching the data", error);
    }
}

// Asynchronous function to organize the fetched data and display the work schedule.
async function organizarDados() {
    try {
        // Calls the function to fetch data from APIs
        await pegarDados();

        const conteudo = document.getElementById("conteudoP");  // Element to display the schedule

        let posicao = 0;  // Position index for mechanics array
        let horario = [];  // Array to store mechanics’ schedules
        let naoAlmocou = [];  // Tracks whether a mechanic has taken a lunch break
        let horasTrab = [];

        // Organizes the data and populates the work schedule
        for (item in odsAUX) {

            let horarioN = (horario[posicao] || "08:15");  // Default time if no schedule is assigned
            let almocou = (naoAlmocou[posicao] || 'true');  // Checks if the mechanic has taken a lunch break
            let carga = (horasTrab[posicao] || 0);

            let card = document.getElementById(`mecanico-${posicao}`);

            if (!card) {
                // Creates a new card for the mechanic if it doesn’t exist
                card = document.createElement("table");

                card.setAttribute("id", "tabela");
                card.setAttribute("class", "mecs");
                card.setAttribute("id", `mecanico-${posicao}`);
                card.innerHTML += `<tr>
                                    <th colspan="3">${mecAUX[posicao].nome}</th>
                                </tr>
                                <tr>
                                    <th class="cabecalho"> Initial Time </th>
                                    <th class="cabecalho"> Final Time </th>
                                    <th class="cabecalho"> Service Order </th>
                                </tr>
                                <tr>
                                    <td class="linha"> 08:00 </td>
                                    <td class="linha"> 08:15 </td>
                                    <td class="linha"> PREPARATION </td>
                                </tr>`;
            }

            let horaIn = horarioN.substring(0, 2);  // Initial hour of the mechanic’s schedule
            let minutoIn = horarioN.substring(3, 5);  // Initial minute of the schedule

            let horarioSomar = odsAUX[item].tempoEstimado;  // Estimated time for the service order

            let horaS = horarioSomar.substring(0, 2);  // Estimated hour
            let minutoS = horarioSomar.substring(3, 5);  // Estimated minute

            // Adds the initial time to the estimated time to calculate the final time
            let somaH = (parseInt(horaIn) + parseInt(horaS));
            let somaM = (parseInt(minutoIn) + parseInt(minutoS));

            let horaF = String(somaH).padStart(2, '0');  // Formatted final hour
            let minutoF = String(somaM).padStart(2, '0'); // Formatted final minute

            let horarioF = `${horaF}:${minutoF}`;  // Formatted final time
            horario[posicao] = horarioF;  // Updates the final time for the mechanic

            let tempEst = (parseInt(horaS) + (parseInt(minutoS) / 60));  // Converts estimated time to hours
            carga += tempEst;  // Updates total working hours
            horasTrab[posicao] = carga;  // Saves in the working hours array

            // Adds the row with the schedule times and service order number to the card
            card.innerHTML += `<tr>
                                <td class="linha">${horarioN}</td>
                                <td class="linha">${horarioF}</td>
                                <td class="linha">${odsAUX[item].numeroOrdemServico}</td>
                                </tr>`;

            if (carga >= 10) {
                posicao++;  // Moves to the next mechanic
                if (posicao >= mecAUX.length) {
                    posicao = 0;
                    conteudo.appendChild(card);  // Adds the card to the content
                }
            }

            // If the final time is greater than or equal to 12 (lunch time), adds the lunch break
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

                if (conteudo.contains(card)) { }
                conteudo.appendChild(card);
            }

            posicao++;

            // If all mechanics have been processed, resets the counter and adds the card
            if (posicao >= mecAUX.length) {
                posicao = 0;
                conteudo.appendChild(card);
            }

            if (conteudo.contains(card)) { }
            conteudo.appendChild(card);
        }

        // Adds the back button to the content
        conteudoB.appendChild(botaoVoltar);

    } catch (error) {
        // If an error occurs while organizing the data, stops the loading animation and redirects to the home page
        clearInterval(loading);
        document.getElementById("resp").innerHTML = "Failed to create schedule";
        setTimeout(() => {
            window.location.href = "../Home/telaInicial.html";
        }, 3000);

        console.error("Error organizing the data", error);
    }
}

// Loading function with a progress animation.
var conta = 4;  // Progress counter
var progress = 16;  // Progress bar width
var statu = 0;  // Loading status

// Function that updates the counter and progress bar.
function load() {

    if (conta == 100 && progress == 400) {
        // When progress reaches 100%, stops the loading animation and starts displaying the data.
        clearInterval(loading)
        contador.classList.add('efeitoTxt')  // Applies text effect to the counter
        progresso.classList.add('efeitoTxt')  // Applies effect to the progress bar
        progresso.classList.add('active')  // Makes the progress bar active
        
        // After 1 second, changes the background and displays the content
        setTimeout(() => {
            document.body.style.backgroundImage = "url('../imagensDaRoca/backgroundProgramacao.png')";
            conteudoL.remove();  // Removes the loading content
            organizarDados();  // Organizes the data
        }, 1000);

    } else {
        // Updates the counter and progress bar incrementally
        progresso.style.width = progress + 'px';  // Updates progress bar width
        contador.innerHTML = conta + '%';  // Updates the counter value
        conta++;  // Increments the counter
        progress += 4;  // Increments the progress bar width
    }
}
