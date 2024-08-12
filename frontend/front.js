// Example data to send in the POST request
const loginData = {
    user: 'yourUsername',
    pass: 'yourPassword',
};

const userInput = document.querySelector('#user')
const passInput = document.querySelector('#pass')
const submitButton = document.querySelector('#submit')

submitButton.onclick = async () => {
    await login(userInput.value, passInput.value)
}

const logoutButton = document.querySelector('#logout')
logoutButton.onclick = async () => {
    await logout()
}

const checkButton = document.querySelector('#check')
checkButton.onclick = async () => {
    await check()
}

async function logout(){
    const response = await fetch('/logout', {
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    console.log(response)
    
}

async function check(){
    const response = await fetch('/check', {
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    console.log(response) 
    // Assuming user is sent as plain text or simple JSON
    const user = await response.text(); // Use response.json() if the server sends JSON
    console.log(user); // This will log the value of user  
}


// Function to make the POST request
async function login(user, pass) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({user:user, pass:pass})
    })
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    console.log(response)
    // const responseJson = await response.json(); // Parse the JSON from the response
    // console.log(responseJson)
}

