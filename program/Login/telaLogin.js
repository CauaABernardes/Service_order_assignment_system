// Auxiliary array to store user data
let usuariosAUX = [];

// Asynchronous function to fetch user data from the API
async function pegarDados() {
    try {
        const apiURL = "https://cenoura.glitch.me/usuarios";  // API URL
        const resposta = await fetch(apiURL);  // Makes the request to the API
        const dados = await resposta.json();  // Converts the response to JSON format

        // Iterates over the user data and stores it in 'usuariosAUX'
        dados.forEach(item => {
            usuariosAUX.push({
                login: item.login,   // Stores the user's login
                senha: item.senha,   // Stores the user's password
                nome: item.nome      // Stores the user's name
            });
        });

    } catch (error) {
        console.error("Error fetching data", error);  // Logs an error if the request fails
    }
}

// Function to validate the user's login and password
function validacaoUsuario() {
    const inputLogin = document.getElementById("login").value;  // Retrieves the login input value
    const inputSenha = document.getElementById("senha").value;  // Retrieves the password input value

    let Validacao = false;  // Control variable that defines if the validation was successful

    // Iterates over the users stored in 'usuariosAUX'
    usuariosAUX.forEach(usuario => {
        // Checks if the entered login and password match any of the users
        if (inputLogin == usuario.login && inputSenha == usuario.senha) {
            // If the data is correct, stores the login and name in localStorage
            window.localStorage.setItem("Usuario", inputLogin);
            window.localStorage.setItem("NomeUsuario", usuario.nome);

            // Redirects the user to the home screen
            window.location.href = "../Home/telaInicial.html";
            Validacao = true;  // Marks the validation as successful
        }
    });

    // If the validation was not successful, displays an error message
    if (!Validacao) {
        document.getElementById("respostaValidacao").innerHTML = "Incorrect username and/or password";
    }
}
