import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'
import { getResponseServer } from "./apiModule.js";
import { mdToHTML } from './md.js';
import { signupUser, loginUser, logoutUser, getProfile, testSession, saveSession, loadLatestSession } from './clientLogin.js';

// const apiUrlGPT = 'https://jschatapi.onrender.com/api/gpt/completions/stream' 
const apiUrlGPT = 'http://localhost:3000/api/gpt/completions/stream' 
const decoder = new TextDecoder();
let bot_default_message = `To load a CSV file using Python, you can use the \`pandas\` library, which is a powerful tool for data manipulation and analysis. Here's a basic example:

\`\`\`python
import pandas as pd

# Load the CSV file
df = pd.read_csv('your_file.csv')

# Display the first few rows of the DataFrame
print(df.head())
\`\`\`

In this code:
- \`pandas\` is imported and abbreviated as \`pd\`.
- The \`pd.read_csv()\` function is used to read the CSV file. You need to replace \`'your_file.csv'\` with the actual path to your CSV file.
- \`df.head()\` shows the first five rows of the DataFrame by default.

Make sure you have the \`pandas\` library installed. You can install it using pip if you haven't already:

\`\`\`bash
pip install pandas
\`\`\`

Let me know if you need help with anything else!`
const systemTemplate = `<|start_header_id|>system<|end_header_id|>\n{text}<|eot_id|>\n\n`;
// const systemMessage = `You are a helpful assistant. You respond to my questions with brief, to the point, and useful responses. My questions are in triple backtics`;
const systemMessage = ""
const systemPrompt = systemTemplate.replace('{text}', systemMessage);
const userTemplateWithTicks = `<|start_header_id|>user<|end_header_id|>\n\`\`\`{text}\`\`\`<|eot_id|>\n\n`;
const userTemplateNoTicks = `<|start_header_id|>user<|end_header_id|>\n{text}<|eot_id|>\n\n`;
const assistantTag = `<|start_header_id|>assistant<|end_header_id|>\n`
const assistantEOT = `<|eot_id|>\n\n`
const assistantPrompt = `${assistantTag}{text}${assistantEOT}`
const log = console.log

const dots = createDots();

const gpt = true;
const max_tokens = 2000;
// test different prompts:
const systemMessageFull = `You are a helpful assistant. You respond to my questions with brief, to the point, and useful responses.`;
let idCounter = 0;

const md = markdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre><code class="hljs">' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>';
        } catch (__) {}
      }
  
      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  });

const removeChildren = (elem) => {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}



async function saveDOM(){
    const allMessages = document.getElementById('messages')
    const profile = await getProfile()
    const saveContainer = allMessages.innerHTML
    log('*'.repeat(50))
    const saveResp = await saveSession(profile.username, profile.password, saveContainer)
    console.log('saved session...')
    // const response = await saveAsJSON(saveContainer);
    log('*'.repeat(50))
}
async function loadDOM() {
    // get latest message
    const profile = await getProfile()
    const latestSession = await loadLatestSession(profile.username, profile.password) // time and saveContainer attribute
    if (!latestSession.saveContainer) {
        console.warn('No saved container found. Please save first.');
        return; // Exit if nothing is saved to avoid issues
    }
    log('*'.repeat(50))
    console.log('loading');
    const allMessages = document.getElementById('messages');
    allMessages.innerHTML = latestSession.saveContainer; // Load saved content
    console.log('loaded snapshot');
    log('*'.repeat(50))

    // Reattach event listeners
    const messageElements = allMessages.getElementsByClassName('user');
    for (const messageElement of messageElements) {
        // Clear any existing listeners (if using removeEventListener)
        messageElement.removeEventListener('keydown', handleKeydown); // Clear previous listeners
        // Reattach the listener
        messageElement.addEventListener('keydown', handleKeydown);
    }
}
function resetInterface(){
    const initialHtml = `
    <div class="branch-container">
                    <div class="branch">
                        <div id="first-message" class="editable message user" role="user" old="no" contenteditable="true" data-placeholder="New message"></div>
                    </div> 
    </div>
    `
    const allMessages = document.getElementById('messages');
    allMessages.innerHTML = initialHtml; // Load saved content
    console.log('reset interface');
    // Reattach event listeners
    const messageElements = allMessages.getElementsByClassName('user');
    for (const messageElement of messageElements) {
        // Clear any existing listeners (if using removeEventListener)
        messageElement.removeEventListener('keydown', handleKeydown); // Clear previous listeners
        // Reattach the listener
        messageElement.addEventListener('keydown', handleKeydown);
    }
}


const spinner = document.createElement('div')
spinner.classList.add('spinner')

const createLoadSave = () => {
    const loadSaveContainer = document.createElement('div')
    loadSaveContainer.classList.add('button-box')
    loadSaveContainer.id = 'loadSaveContainer'

    const loadButton = document.createElement('button')
    loadButton.id = 'loadButton'
    loadButton.textContent = 'Load'
    loadButton.onclick = async () => {
        // add spinner
        loadButton.textContent = ''
        loadButton.appendChild(spinner)
        //
        await loadDOM();
        loadButton.textContent = 'Load'
    }

    const saveButton = document.createElement('button')
    saveButton.id = 'saveButton'
    saveButton.textContent = 'Save'

    saveButton.onclick = async () => {
        // add spinner
        saveButton.textContent = ''
        saveButton.appendChild(spinner)
        //
        await saveDOM();
        saveButton.textContent = 'Save'
    }

    const resetButton = document.createElement('button')
    resetButton.id = 'resetButton'
    resetButton.textContent = 'Reset'

    resetButton.onclick = () => {
        // add spinner
        resetButton.textContent = ''
        resetButton.appendChild(spinner)
        //
        resetInterface();
        resetButton.textContent = 'Reset'
    }

    loadSaveContainer.appendChild(loadButton)
    loadSaveContainer.appendChild(saveButton)
    loadSaveContainer.appendChild(resetButton)
    return loadSaveContainer
}
const createProfileSection = (profile) => {
    let lastLogin = ''
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
        const rawDate = new Date(profile.lastLogin)
        lastLogin = rawDate.toLocaleDateString('en-US', options);
    } catch(error){
        console.log('never logged in before', error)
    }

    const profileSection = document.createElement('div');  
    profileSection.innerHTML = `
    <div class="profile-section">
        <div>
            <h2 class="profile-title">Welcome, <span id="profileUsername">${profile.username}</span></h2>
        </div>
        <div class="profile-box">
            <span class="profile-label">Last login: <span><i>${lastLogin}</i></span></span>
        </div>
    </div>
`
    profileSection.id = 'profileSection'
    profileSection.classList.add('authentication-box')
    return profileSection
}


async function handleDOMContentLoaded() {
    
    // signup/signin 
    // 
    const authenticateButtons = document.querySelector('#authenticateButtons')
    const signupButton = document.getElementById('signupButton')
    const loginButton = document.getElementById('loginButton')
    // const authenticateSignup = document.getElementById('authenticateSignup')
    const authenticateSignup = document.createElement('div')
    authenticateSignup.innerHTML = `
                <div class="auth-box">
                    <input type="text" id="signUsername" class="input-text" placeholder="Username" />
                    <input type="password" id="signPassword" class="input-text" placeholder="Password" />
                </div>
                <div class="button-box">
                    <button id="signupButtonSubmit">Signup</button>
                </div>
    `
    authenticateSignup.id = 'authenticateSignup'
    authenticateSignup.classList.add('authentication-box')
    
    // const authenticateLogin = document.getElementById('authenticateLogin')
    const authenticateLogin = document.createElement('div')
    authenticateLogin.innerHTML = `
                <div class="auth-box">
                    <input type="text" id="logUsername" class="input-text" placeholder="Username" />
                    <input type="password" id="logPassword" class="input-text" placeholder="Password" />
                </div>
                <div class="button-box">
                    <button id="loginButtonSubmit">Login</button>
                </div>
    `
    authenticateLogin.id = 'authenticateLogin'
    authenticateLogin.classList.add('authentication-box')

    const authenticateLogout = document.createElement('div')
    authenticateLogout.innerHTML = `
    <button id="logoutButton">Logout</button>
    `
    authenticateLogout.id = 'authenticateLogout'
    authenticateLogout.classList.add('button-box')



    const authenticate = document.getElementById('authenticate')
    // check if already logged in
    try {
        const profile = await getProfile()
        
        if (!profile){
            throw new Error('not logged in');   
        }
        // redirect
        // create profile
        const profileSection = createProfileSection(profile)
        // remove children
        removeChildren(authenticate)
        authenticate.appendChild(profileSection)
        // // create logoutButton
        authenticate.appendChild(authenticateLogout)
        const logoutButton = document.querySelector('#logoutButton')
        logoutButton.onclick = async () => {
            const resp = await logoutUser()
            console.log('logged out', resp)
            removeChildren(authenticate)
            authenticate.appendChild(authenticateButtons) 
            // if loadSaveContainer remove it
            const loadSaveContainer = document.querySelector('#loadSaveContainer')
            if (loadSaveContainer){
                const chatBoxContainer = document.querySelector('#chat-box')
                chatBoxContainer.removeChild(loadSaveContainer)
            }  
        }
        // add load and save buttons
        const chatBoxContainer = document.querySelector('#chat-box')
        const loadSaveContainer = createLoadSave()
        chatBoxContainer.appendChild(loadSaveContainer)
    } catch(error){
        console.log('Not logged in')
    }
    //
    const inlineLoginButton = document.createElement('button')
    inlineLoginButton.textContent = 'Login instead'
    inlineLoginButton.id = 'instead'
    inlineLoginButton.onclick = () => {
        loginButton.onclick()
    }
    const inlineSignupButton = document.createElement('button')
    inlineSignupButton.textContent = 'Signup instead'
    inlineSignupButton.id = 'instead'
    inlineSignupButton.onclick = () => {
        signupButton.onclick()
    }
    

    signupButton.onclick = () => {
        log('signing up')
        removeChildren(authenticate)
        
        authenticate.appendChild(authenticateSignup)
        
        //
        const signupButtonSubmit = document.getElementById('signupButtonSubmit')
        signupButtonSubmit.onclick = async () => {
            // add spinner
            signupButtonSubmit.textContent = ''
            signupButtonSubmit.appendChild(spinner)
            //
            // remove notes
            const successNoteElement = authenticateSignup.querySelector('.success-note')
            if (successNoteElement){
                authenticateSignup.removeChild(successNoteElement)
            }
            const failureNoteElement = authenticateSignup.querySelector('.failure-note')
            if (failureNoteElement){
                authenticateSignup.removeChild(failureNoteElement)
            }
            //
            const signUsername = document.getElementById('signUsername').value.toLowerCase()
            const signPassword = document.getElementById('signPassword').value.toLowerCase()
            log(signUsername)
            log(signPassword)
            const res = await signupUser(signUsername, signPassword)
            console.log(res)
            if (res.includes('the username already exists.')){
                const failureNote = document.createElement('div')
                failureNote.classList.add('failure-note')
                failureNote.textContent = 'Username already exists'
    
                authenticateSignup.appendChild(failureNote)
                const insteadExists = authenticate.querySelector('#instead')
                console.log('insteadExists')
                console.log(insteadExists)
                if (!insteadExists){
                    authenticateSignup.appendChild(inlineLoginButton)
                }

            } else { // signup successful
                const successNote = document.createElement('div')
                successNote.classList.add('success-note')
                successNote.textContent = 'Signed up.'
                
                authenticateSignup.appendChild(successNote)
                
                // login automatically
                const loginRes = await loginUser(signUsername, signPassword)

                // store session id
                const responseTest = await testSession();
                // console.log('responseTest')
                // console.log(responseTest)
                const profile = await getProfile()
                // redirect
                // create profile
                const profileSection = createProfileSection(profile)
                // remove children
                removeChildren(authenticate)
                authenticate.appendChild(profileSection)
                // // create logoutButton
                authenticate.appendChild(authenticateLogout)
                const logoutButton = document.querySelector('#logoutButton')
                logoutButton.onclick = async () => {
                    const resp = await logoutUser()
                    console.log('logged out', resp)
                    removeChildren(authenticate)
                    authenticate.appendChild(authenticateButtons)
                    // if loadSaveContainer remove it
                    const loadSaveContainer = document.querySelector('#loadSaveContainer')
                    if (loadSaveContainer){
                        const chatBoxContainer = document.querySelector('#chat-box')
                        chatBoxContainer.removeChild(loadSaveContainer)
                    }
                    
                }
                // add load save 
                const chatBoxContainer = document.querySelector('#chat-box')
                const loadSaveContainer = createLoadSave()
                chatBoxContainer.appendChild(loadSaveContainer)
            }
            // remove spinner
            signupButtonSubmit.textContent = 'Signup'
            //
        }
    }
    loginButton.onclick = () => {
        removeChildren(authenticate)
        
        authenticate.append(authenticateLogin)
        log('logging in')
        const loginButtonSubmit = document.getElementById('loginButtonSubmit')
        
        loginButtonSubmit.onclick = async () => {
            // add spinner
            loginButtonSubmit.textContent = ''
            loginButtonSubmit.appendChild(spinner)
            //
            // remove notes
            const successNoteElement = authenticateLogin.querySelector('.success-note')
            if (successNoteElement){
                authenticateLogin.removeChild(successNoteElement)
            }
            const failureNoteElement = authenticateLogin.querySelector('.failure-note')
            if (failureNoteElement){
                authenticateLogin.removeChild(failureNoteElement)
            }
            //

            const logUsername = document.getElementById('logUsername').value.toLowerCase()
            const logPassword = document.getElementById('logPassword').value.toLowerCase()
            // log(logUsername)
            // log(logPassword)
            const loginRes = await loginUser(logUsername, logPassword)
            // console.log('loginRes')
            // console.log(loginRes)
            if (loginRes.includes('Not allowed')){
                const failureNote = document.createElement('div')
                failureNote.classList.add('failure-note')
                failureNote.textContent = 'Password is incorrect.'
                authenticateLogin.appendChild(failureNote)
                const insteadExists = authenticate.querySelector('#instead')
                console.log('insteadExists')
                console.log(insteadExists)
                if (!insteadExists){
                    authenticateLogin.appendChild(inlineSignupButton)
                }
            } else if (loginRes.includes('User not found.')) {
                const failureNote = document.createElement('div')
                failureNote.classList.add('failure-note')
                failureNote.textContent = 'Username not found.'
                authenticateLogin.appendChild(failureNote)
                const insteadExists = authenticate.querySelector('#instead')
                console.log('insteadExists')
                console.log(insteadExists)
                if (!insteadExists){
                    authenticateLogin.appendChild(inlineSignupButton)
                }
            } else { //login successful
                console.log('login successful')
                console.log('loginRes client')
                console.log(loginRes)
                const successNote = document.createElement('div')
                successNote.classList.add('success-note')
                successNote.textContent = 'Logged in.'
                authenticateLogin.appendChild(successNote)
                // store session id
                const responseTest = await testSession();
                console.log('responseTest')
                console.log(responseTest)
                const profile = await getProfile()
                
                // redirect
                // create profile
                const profileSection = createProfileSection(profile)
                // remove children
                removeChildren(authenticate)
                authenticate.appendChild(profileSection)
                // // create logoutButton
                authenticate.appendChild(authenticateLogout)
                const logoutButton = document.querySelector('#logoutButton')
                logoutButton.onclick = async () => {
                    const resp = await logoutUser()
                    console.log('logged out', resp)
                    removeChildren(authenticate)
                    authenticate.appendChild(authenticateButtons)
                    // if loadSaveContainer remove it
                    const loadSaveContainer = document.querySelector('#loadSaveContainer')
                    if (loadSaveContainer){
                        const chatBoxContainer = document.querySelector('#chat-box')
                        chatBoxContainer.removeChild(loadSaveContainer)
                    }

                }
                // add load save buttons
                const chatBoxContainer = document.querySelector('#chat-box')
                const loadSaveContainer = createLoadSave()
                chatBoxContainer.appendChild(loadSaveContainer)
            }
            // remove spinner
            loginButtonSubmit.textContent = 'Login'
            //   
        }
    }
    
    // login/signup end
    //

    let messageElements = document.getElementsByClassName('message')

    // branch-container logic:
    // branch
    //  user
    //  bot
    //  branch-container
    //      branch
    //          user
    //          bot        
    // event listener for first-message  
    for (const messageElement of messageElements){
        if (messageElement.classList.contains('user')){
            messageElement.role = 'user'
            const old = messageElement.textContent==='' ?  'no' : 'yes'
            messageElement.setAttribute('old', old)
            // log(messageElement.old)
            messageElement.addEventListener('keydown', handleKeydown);
        } else {
            messageElement.role = 'bot'
        }
        log(messageElement.role)

    }
    //
    // save the intial layout
    // saveDOM();
    
    // if (saveButton){
    //     saveButton.onclick = saveDOM
    // }
    // if (loadButton){
    //     loadButton.onclick = loadDOMnew
    // }
    
    async function saveAsJSON(container){
        const saveBody = {
            'username': 'davoodwadi',
            'saveContainer': container
        }
        try {
            // Making the POST request
            const response = await fetch('http://127.0.0.1:4000/api/redis/save', {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json', // Indicates the body format
            },
            body: JSON.stringify(saveBody), // Converting the JavaScript object to a JSON string
            });

            // Check if the response was successful
            if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
            }
            // Parse the JSON response
            const data = await response.json();
            console.log(data)
            // console.log('Response data:', data); // Handling the response data
        } catch (error) {
            // Handling any errors
            console.error('There was a problem with the fetch operation:', error);
        }
        };

    // const loadButton = document.getElementById('load')
    
    async function loadDOMnew() {
        const loadBody = {'username': username}
        try {
            // Making the POST request
            const response = await fetch('http://127.0.0.1:4000/api/redis/load', {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json', // Indicates the body format
            },
            body: JSON.stringify(loadBody), // Converting the JavaScript object to a JSON string
            });
            // Check if the response was successful
            if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
            }
            // Parse the JSON response
            const data = await response.json();
            console.log(data)
            const html = data['saveContainer']
            if (!html){
                console.log(`No entry found for ${username}`)
            } else {
                log('*'.repeat(50))
                console.log(`loading ${username}...`);
                const allMessages = document.getElementById('messages');
                allMessages.innerHTML = html; // Load saved content
                console.log('loaded snapshot');
                log(allMessages.innerHTML)
                log('*'.repeat(50))
                // Reattach event listeners
                const messageElements = allMessages.getElementsByClassName('user');
                for (const messageElement of messageElements) {
                    // Clear any existing listeners (if using removeEventListener)
                    messageElement.removeEventListener('keydown', handleKeydown); // Clear previous listeners
                    // Reattach the listener
                    messageElement.addEventListener('keydown', handleKeydown);
                }


            }
            
            // console.log('Response data:', data); // Handling the response data
        } catch (error) {
            // Handling any errors
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    // new load



};
// Add event listener for DOMContentLoaded and call the async function
document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

async function logEvent(event){
    let target = event.target
    let branch = target.parentElement
    let branchContainer = branch.parentElement
    let elementToFocus
    let messageElement
    
    // const oldContent = target.oldContent
    const oldContent = target.getAttribute('oldContent')
    log('oldContent')
    log(oldContent)

    if ((target.getAttribute('old')==='yes') && target.role==='user'){//old and user
        log('old message')
        // add new branch
        branch = document.createElement('div')
        branch.classList.add('branch')
        branchContainer.appendChild(branch)
        // add modified target
        messageElement = await createMessageElement('user');
        messageElement.textContent = target.textContent;
        // messageElement.oldContent = messageElement.textContent
        messageElement.setAttribute('oldContent', messageElement.textContent) 
        messageElement.setAttribute('old', 'yes')
        // messageElement.triggeredBefore = true;
        branch.appendChild(messageElement);
        // set element to focus to
        elementToFocus = messageElement;
        elementToFocus.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'center'})
        // set the old content
        target.textContent = oldContent


        // add dots
        branch.appendChild(dots)

        // get llm messages
        const elementArray = createElementArray(messageElement)
        
        if (gpt){
            let messages = createMessageChainGPT(elementArray)
            console.log(JSON.stringify(messages))
            messageElement = await createMessageElement('bot', messages, branch);
            
        } else {
            let messages = createMessageChain(elementArray)
            messages += assistantTag
            // console.log(messages)

            // add bot and empty user 
            messageElement = await createMessageElement('bot', messages);
            branch.replaceChild(messageElement, dots)
        }
        
        
        // create branch-container within branch.        
        let newBranchContainer = document.createElement('div');
        newBranchContainer.classList.add('branch-container');
        branch.appendChild(newBranchContainer);
        // create branch within newcontainer
        let newBranch = document.createElement('div');
        newBranch.classList.add('branch');
        newBranchContainer.appendChild(newBranch)

        messageElement = await createMessageElement('user');
        messageElement.setAttribute('old', 'no')
        newBranch.appendChild(messageElement);

        
    } else if ( target.role==='user') { // latest and user
        log('new message')
        
        // add branch
        // branch = document.createElement('div')
        // branch.classList.add('branch')
        // branchContainer.appendChild(branch)
        //
        // branch.appendChild(target)
        // add dots to the branch
        branch.appendChild(dots)
        
        // get llm messages
        const elementArray = createElementArray(target)
        
        if (gpt){
            let messages = createMessageChainGPT(elementArray)
            console.log(JSON.stringify(messages))
            messageElement = await createMessageElement('bot', messages, branch);
            
        } else {
            let messages = createMessageChain(elementArray)
            messages += assistantTag
            // console.log(messages)

            // add bot message and followup user message
            messageElement = await createMessageElement('bot');
            branch.replaceChild(messageElement, dots)
        }
        
        // set element to focus to
        elementToFocus = messageElement;


        // create branch-container within branch.        
        let newBranchContainer = document.createElement('div');
        newBranchContainer.classList.add('branch-container');
        branch.appendChild(newBranchContainer);
        // create branch within newcontainer
        let newBranch = document.createElement('div');
        newBranch.classList.add('branch');
        newBranchContainer.appendChild(newBranch)

        messageElement = await createMessageElement('user');
        messageElement.setAttribute('old', 'no')
        newBranch.appendChild(messageElement);

    }
    // target.triggeredBefore = true
    target.setAttribute('old', 'yes')
    
    if(elementToFocus.role==='bot'){
        elementToFocus.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'center'})
    } else {
        elementToFocus.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'center'})
    }

};
// Function to handle keydown events
function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent the default behavior of adding a new line
        logEvent(event); // Assuming this function exists to log events
        log('event.target.textContent')
        log(event.target.textContent)
        event.target.setAttribute('oldContent', event.target.textContent); // Store old content
        event.target.blur(); // Lose focus
    }
}

function getBranchContainer(el){
    for (let child of el.children){
        if (child.classList.contains('branch-container')){
            return child
        }
    }
    return false
}

async function createMessageElement(role, pretext, branch){
    let messageElement = document.createElement('div');
    if (role==='bot'){
        messageElement.classList.add('editable', 'message', role);
        messageElement.contentEditable = true;
        // messageElement.textContent = pretext + '\n\n' + (await getDummyMessage())
        if (gpt){
            // let textDecoded = '' 
            console.log(`await fetch(apiUrlGPT`)
            const res = await fetch(apiUrlGPT, {
                method: 'POST',
                body: JSON.stringify({
                    messages: pretext,
                    max_tokens: max_tokens,
                }), 
                headers: { 'Content-Type': 'application/json' },   
            })

            if (!res.ok) {
                console.error('API call failed with status:', res.status);
                return; // Handle the error accordingly
            }            
            
            messageElement.textContent = '' 
            messageElement.oldOutput = undefined
            messageElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'center'})
            messageElement.text = ''
            
            console.log('got stream response => reading it chunk by chunk.')
            try {
                // const textDecoded  = await getDummyMessage()
                // mdToHTML(textDecoded, messageElement);
                branch.replaceChild(messageElement, dots)
                const reader = res.body.getReader();
                let result;
                while (!(result = await reader.read()).done) {      
                    // replace dots
                    if (branch.contains(dots)){
                        branch.replaceChild(messageElement, dots)
                    } 
                    const chunk = result.value; // This is a Uint8Array   
                    const textDecoded = new TextDecoder("utf-8").decode(chunk); // Decode chunk to text
                    messageElement.text = messageElement.text + textDecoded;

                    mdToHTML(messageElement.text, messageElement);
                    messageElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'center'})
                }
                reader.releaseLock();
            }
            catch (error) {
                console.error('Error reading stream:', error)
            }

        } else {
            const llmResponse = await getResponseServer(pretext)
            log(llmResponse)
            mdToHTML(llmResponse, messageElement);
        }
        
        // parse llmResponse from md to html 
        // const html = md.render(llmResponse);
        // const cleanHTML = DOMPurify.sanitize(html);
        // log(cleanHTML)
        // //
        // messageElement.innerHTML = cleanHTML


    } else {
        messageElement.classList.add('editable', 'message', role);
        messageElement.contentEditable = true;
        messageElement.setAttribute('data-placeholder', 'New message')
        // event listener
        messageElement.addEventListener('keydown', handleKeydown);
        //
    }
    messageElement.role = role;
    messageElement.name = `${messageElement.role}-${idCounter}`
    messageElement.counter = idCounter;
    idCounter++
    
    return messageElement
}


async function getDummyMessage() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(bot_default_message);
        }, 1000); // 0.5 second delay
    });
}

function createDots(){
    const dots = document.createElement('div');
    dots.classList.add('message', 'bot', 'dots-message');
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('dots-container');
    
    const singleDot1 = document.createElement('div')
    singleDot1.classList.add('dot')
    const singleDot2 = document.createElement('div')
    singleDot2.classList.add('dot')
    const singleDot3 = document.createElement('div')
    singleDot3.classList.add('dot')
    
    //connect them together
    dots.appendChild(dotsContainer)
    dotsContainer.appendChild(singleDot1)
    dotsContainer.appendChild(singleDot2)
    dotsContainer.appendChild(singleDot3)    
    return dots
};



function addMessageElementToArrayReverse(el, messageElementArray){
    for (let i = el.children.length - 1; i >= 0; i--) {
        const child = el.children[i];
        if (child.classList.contains('message') && (!child.classList.contains('dots-message'))){
            messageElementArray.push(child)
        }
        
}};

function createElementArray(lastElement){
    let messageElementArray = []
    let element = lastElement;
    while (element.id!=="chat-container"){
        
        addMessageElementToArrayReverse(element, messageElementArray);
        element = element.parentElement;
    }
    messageElementArray = messageElementArray.reverse()
    // each element from top to bottom
    
    return messageElementArray
}



// create message from chain elements 
function createMessageChainGPT(messageElementArray){
    // let chainMessages = systemPrompt
    let chainMessages = [{
        role:'system', content:systemMessageFull
    }]
    for (let el of messageElementArray){
        if (el.classList.contains('user')){
            chainMessages.push({
                role : 'user', 
                content : el.textContent
            })
            
        } else {
            chainMessages.push({
                role : 'assistant',
                content : el.textContent
            })
        
    }}
    return chainMessages
}
function createMessageChain(messageElementArray){
    // let chainMessages = systemPrompt
    let chainMessages = ''
    for (let el of messageElementArray){
        if (el.classList.contains('user')){
            
            chainMessages += userTemplateNoTicks.replace('{text}', el.textContent);
        } else {
            
            chainMessages += assistantPrompt.replace('{text}', el.textContent);
    }}
    return chainMessages
}
