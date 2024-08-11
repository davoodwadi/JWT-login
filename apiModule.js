// const apiRequest = {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         messages: [
//             { role: "system", content: "You are a helpful assistant." },
//             { role: "user", content: 'Hello!!!!'},
//         ],
//         model: "gpt-4o-mini",
//         max_tokens: 100
//     })
// };
// let newTextRomantic = `
// <|start_header_id|>system<|end_header_id|>
// You are my romantic partner. You respond with utmost love and affection.
// <|eot_id|>

// <|start_header_id|>user<|end_header_id|>
// \`\`\`Hello\`\`\`<|eot_id|>

// <|start_header_id|>assistant<|end_header_id|>
// Hello my love! 😍<|eot_id|>

// <|start_header_id|>user<|end_header_id|>
// \`\`\`${text}\`\`\`<|eot_id|>

// <|start_header_id|>assistant<|end_header_id|>
// `.trim();

// const apiUrl = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";
const apiUrlHF8b = 'http://localhost:4000/api/hf/8b/completions'; // API endpoint on your server
// const apiUrl = 'http://192.168.1.44:4000/api/hf/completions'; // API endpoint on your server
// const apiUrl = 'https://jschatapi.onrender.com/api/hf/completions'
// const apiUrl = 'https://pathology-tires-references-gerald.trycloudflare.com/api/hf/completions'


export async function getResponseServer(text){
    console.log(apiUrlHF8b);
    try {
        
        const response = await fetch(
            apiUrlHF8b,
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" // Correct content type for JSON 
                },
                body: JSON.stringify({ 
                    inputs: text,
        
                    parameters: {
                        // temperature: 0.0001,
                        max_new_tokens: 1000,
                        return_full_text: false,
                    }

                }),
            }
        );
        const result = await response.json();
        console.log(result)
        return result[0]['generated_text'];
    }
    catch (error){
        // console.log('Errrorrrr')
        console.error(`Error: ${error}`)
    }
};


export async function getResponse(text){
    let newTextTranslate = `
<|start_header_id|>system<|end_header_id|>
You are a helpful English to French translator. 
You should translate the text in triple backticks to French.
Only output the French translation.
<|eot_id|>

<|start_header_id|>user<|end_header_id|>
\`\`\`Hello\`\`\`<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
Bonjour<|eot_id|>

<|start_header_id|>user<|end_header_id|>
\`\`\`${text}\`\`\`<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
`.trim()
    let newTextRomantic = `
<|start_header_id|>system<|end_header_id|>
You are my romantic partner. You respond with utmost love and affection.
<|eot_id|>

<|start_header_id|>user<|end_header_id|>
\`\`\`Hello\`\`\`<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
Hello my love! 😍<|eot_id|>

<|start_header_id|>user<|end_header_id|>
\`\`\`${text}\`\`\`<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
`.trim()
    console.log(newTextRomantic)
    try{
        const response = await fetch(
            apiUrl,
            {
                headers: { 
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json" // Correct content type for JSON 
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: newTextRomantic,
        
                    parameters: {
                        temperature: 0.1,
                        max_new_tokens: 100,
                        return_full_text: false,
                    }

                }),
            }
        );
        const result = await response.json();
        return result;
    }
    catch (error){
        // console.log('Errrorrrr')
        console.error(`Error: ${error}`)
    }
};




// export async function makeApiCall(userMessage) {
//     try {
//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 messages: [
//                     { role: "system", content: "You are a helpful assistant." },
//                     { role: "user", content: userMessage},
//                 ],
//                 model: "gpt-4o-mini",
//                 max_tokens: 100
//             })
//         });
    
//         const data = await response.json();
//         console.log(data);
//         return data
//     } catch (error) {
//         console.error('Error:', error);
//         console.error(error);
//     }
// };
