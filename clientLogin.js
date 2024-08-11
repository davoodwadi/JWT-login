const urlBase = 'http://127.0.0.1:3000/'
const loginUrl = urlBase+'users/'



export async function signupUser(username, password){
    const res = await fetch(loginUrl+'signup', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password,
        }), 
        headers: { 'Content-Type': 'application/json' },   
    })
    
    if (res.ok) {
        const responseData = await res.json();
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}

export async function loginUser(username, password){
    const res = await fetch(loginUrl+'login', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password,
        }), 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include' // Add this line  
    })
    
    if (res.ok) {
        const responseData = await res.json();
        
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}

export async function getProfile(){
    const res = await fetch(loginUrl+'profile', {
        method: 'GET',
        credentials: 'include' // Add this line
    })
    if (res.ok) {
        const responseData = await res.json();
        
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}
   
export async function logoutUser(){
    const res = await fetch(loginUrl+'logout', {
        method: 'GET',
        credentials: 'include' // Add this line
    })
    if (res.ok) {
        const responseData = await res.json();
        
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}
    
export async function testSession(){
    const res = await fetch(urlBase+'test-session', {
        method: 'GET',
        credentials: 'include' // Add this line
    })
    if (res.ok) {
        const responseData = await res.json();
        
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}

export async function saveSession(username, password, saveContainer){
    const res = await fetch(loginUrl+'save', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password,
            saveContainer: saveContainer,
        }), 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include' // Add this line  
    })
    
    if (res.ok) {
        const responseData = await res.json();
        
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}

export async function loadLatestSession(username, password){
    const res = await fetch(loginUrl+'load', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password,
        }), 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include' // Add this line  
    })
    
    if (res.ok) {
        const responseData = await res.json();
        
        return responseData
    } else {
        console.error('Error:', res.status, res.statusText);
    }
}
