import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm'
const log = console.log
const mdWrapped = markdownIt({
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

function putInCodeContainer(highlightedCode, rawCode, language){
  // message bot
    // div: text markdown
    // code-container; highlighted code
  const codeContainer = document.createElement('div');
  codeContainer.classList.add('code-container');

  const header = document.createElement('div');
  header.classList.add('header');

  const part1 = document.createElement('div');
  part1.innerHTML = `${language}`;
  

  // const part2 = document.createElement('div');
  // part2.classList.add('clipboard', 'non-editable');
  // part2.innerHTML = '<i class="fa-duotone fa-solid fa-copy"></i> Copy code';
  const part2 = document.createElement('button');
  part2.classList.add('clipboard');
  part2.innerHTML = '<i class="fa-duotone fa-solid fa-copy"></i> Copy code';
 
  header.appendChild(part1);
  header.appendChild(part2);

  const codeBlock = document.createElement('pre');
  
  codeBlock.innerHTML = `<code class="hljs">${highlightedCode}</code>`;

  codeContainer.appendChild(header);
  codeContainer.appendChild(codeBlock);
  
  // Add the copy functionality
  part2.addEventListener('click', () => {
    navigator.clipboard.writeText(rawCode).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  });
  return codeContainer
};

function parseTextBlocks(text) {
  const blocks = [];
  const regex = /```(\w+)?\n([\s\S]*?)```|([\s\S]+?)(?=```|$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        log(match[1])
        log('match[1]')
          // Code block
          blocks.push({
              language: match[1],
              text: match[2].trim()
          });
      } else {
          // Text block
          log('match[3]')
          log(match[3])
          blocks.push({
              language: null,
              text: match[3].trim()
          });
      }
  }
  return blocks;
};

function parseTextBlocksResilient(text) {
  const blocks = [];
  
  let match;


  return blocks;
};

if( typeof Element.prototype.clearChildren === 'undefined' ) {
  Object.defineProperty(Element.prototype, 'clearChildren', {
    configurable: true,
    enumerable: false,
    value: function() {
      while(this.firstChild) this.removeChild(this.lastChild);
    }
  });
}

export function mdToHTML(fileText, botMessage){
  // remove botMessage children each time's children
  // botMessage.clearChildren()
  while (botMessage.firstChild) {
    botMessage.removeChild(botMessage.lastChild);
  }
  // botMessage.replaceChildren()
  // botMessage.innerHTML = '';
  // console.log('botMessage.children')
  // console.log(botMessage.children)
  // to prevent uncaught errors
  if (!botMessage){
    return
  }
  // log('fileText')
  // log(fileText)

  // Regular expression to match triple backticks
  const regex = /```/;
  
  // Find all occurrences of the triple backticks
  const textNLines = fileText.split('\n')
  let chunks = []
  let text = ''
  let hasTicks
  let language = null
  let numBackTicks=0
  for (const tex of textNLines){
    hasTicks = regex.test(tex)
    if (hasTicks){
      // add to numBackTicks
      numBackTicks+=1
      // add previous text to chunk
      chunks.push({'text': text.trim(), 'language': language})
      // get language
      language = tex.split('```')[1]
      if (language==='' && numBackTicks%2===1){
        language = 'quote'
      } else if (language==='') {
        language = null
      }

      // get text
      text = ''
    } else {
      text += "\n" + tex
    };
    
    // log(tex)
    // log(hasTicks)
    // log('*'.repeat(50))
  }
  chunks.push({'text': text.trim(), 'language': language})
  
  // remove empty or \n
  chunks = chunks.filter(chunk => chunk.text.trim()!=='')

  // console.log('chunks')
  // console.log(chunks)

  // let cleans = []
  let output
  let temp
  for (const item of chunks){
    // console.log('item')
    // console.log(item)
    if (item.language==='quote'){
      item.text = item.text.split('\n').map(line => '> ' + line).join('\n')
      temp = md.render(item.text)
      output = document.createElement('div')
      // output.classList.add('code-container')
      output.innerHTML = temp.trim()
    } else if (item.language===null) {
      temp = md.render(item.text)
      output = document.createElement('div')
      output.innerHTML = temp.trim()
    } else {
      try {
        // code
        output = putInCodeContainer(hljs.highlight(item.text, {language:item.language, ignoreIllegals: true}).value, item.text, item.language)
      } catch (error) {
        // not code
        // unknown lang
        output = putInCodeContainer(md.utils.escapeHtml(item.text), item.text, item.language)
      }
    }

    // cleans.push(output)
    // console.log(botMessage.oldOutput)
    // console.log('botMessage.oldOutput')
    // console.log('output')
    // console.log(output)
    // console.log('botMessage.children')
    // console.log(botMessage.children)
    
    // if (botMessage.oldOutput!==undefined){
    //   botMessage.replaceChild(output, botMessage.oldOutput)
    // } else {
    //   botMessage.appendChild(output)
    // }
    // botMessage.oldOutput = output
    botMessage.appendChild(output)
  
  
  };
  // return botMessage
};



// const md = markdownIt()
// enable everything
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const textJsPyth = `
The \`MLPClassifier\` from the \`scikit-learn\` library.
\`\`\`python
import numpy as np
from sklearn.datasets import make_classification

def train_mlp(hidden_layer_sizes=(100,), activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=0.001, max_iter=200):
    
    # Split the dataset into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardize the features
    scaler = StandardScaler()
    
    # Print the results
    print(f'Accuracy: {accuracy}')
    
    return mlp

# Example usage
trained_mlp = train_mlp()
\`\`\`

1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.

\`\`\`javascript
async function handleDOMContentLoaded() {
    
    const log = console.log
    const textBox1 = document.getElementById('bot-message1');
    const textBox2 = document.getElementById('bot-message2');
    const textBox3 = document.getElementById('bot-message3');
}
\`\`\`


### Explanation:
1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.
3. **Data Standardization**: Standardizes the features to have zero mean and unit variance.
4. **Model Creation**: Creates an instance of \`MLPClassifier\` with specified hyperparameters.
5. **Model Training**: Fits the MLP model to the training data.
6. **Prediction and Evaluation**: Predicts the labels for the test data and evaluates the performance using accuracy and classification report.

You can customize the parameters of the \`MLPClassifier\` to suit your specific needs. The function returns the trained MLP model for further use or evaluation.

`.trim()

const textTicks = `
The \`MLPClassifier\` from the \`scikit-learn\` library.
\`\`\`dfgdfg
import numpy as np
from sklearn.datasets import make_classification

def train_mlp(hidden_layer_sizes=(100,), activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=0.001, max_iter=200):
    
    # Split the dataset into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardize the features
    scaler = StandardScaler()
    
    # Print the results
    print(f'Accuracy: {accuracy}')
    
    return mlp

# Example usage
trained_mlp = train_mlp()
\`\`\`

1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.

\`\`\`c++
async function handleDOMContentLoaded() {
    
    const log = console.log
    const textBox1 = document.getElementById('bot-message1');
    const textBox2 = document.getElementById('bot-message2');
    const textBox3 = document.getElementById('bot-message3');
}
\`\`\`


### Explanation:
1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.
3. **Data Standardization**: Standardizes the features to have zero mean and unit variance.
4. **Model Creation**: Creates an instance of \`MLPClassifier\` with specified hyperparameters.
5. **Model Training**: Fits the MLP model to the training data.
6. **Prediction and Evaluation**: Predicts the labels for the test data and evaluates the performance using accuracy and classification report.

You can customize the parameters of the \`MLPClassifier\` to suit your specific needs. The function returns the trained MLP model for further use or evaluation.

`.trim()

const textTicksGibberish = `
The \`MLPClassifier\` from the \`scikit-learn\` library.
\`\`\`c#
import numpy as np
from sklearn.datasets import make_classification

def train_mlp(hidden_layer_sizes=(100,), activation='relu', solver='adam', alpha=0.0001, batch_size='auto', learning_rate='constant', learning_rate_init=0.001, max_iter=200):
    
    # Split the dataset into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardize the features
    scaler = StandardScaler()
    
    # Print the results
    print(f'Accuracy: {accuracy}')
    
    return mlp

# Example usage
trained_mlp = train_mlp()
\`\`\`

1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.

\`\`\`matlab
async function handleDOMContentLoaded() {
    
    const log = console.log
    const textBox1 = document.getElementById('bot-message1');
    const textBox2 = document.getElementById('bot-message2');
    const textBox3 = document.getElementById('bot-message3');
}
\`\`\`


### Explanation:
1. **Data Generation**: Uses \`make_classification\` to create a synthetic dataset.
2. **Data Splitting**: Splits the data into training and testing sets.
3. **Data Standardization**: Standardizes the features to have zero mean and unit variance.
4. **Model Creation**: Creates an instance of \`MLPClassifier\` with specified hyperparameters.
5. **Model Training**: Fits the MLP model to the training data.
6. **Prediction and Evaluation**: Predicts the labels for the test data and evaluates the performance using accuracy and classification report.

You can customize the parameters of the \`MLPClassifier\` to suit your specific needs. The function returns the trained MLP model for further use or evaluation.

`.trim()

const textPoetry1 = `
\`\`\`
You are my everything
You are my love
\`\`\`
`

const textPoetry2 = `
Here's the poetry
\`\`\`
You are my everything
You are my love
\`\`\`
`

const textRunaway = `
\`\`\`python
print(hello)
`


async function handleDOMContentLoaded() {

    const log = console.log
    // const textBox1 = document.getElementById('bot-message1');
    // const textBox2 = document.getElementById('bot-message2');
    // const textBox3 = document.getElementById('bot-message3');
    // mdToHTML(textPoetry1, textBox1)
    // log('*'.repeat(50))
    // log('*'.repeat(50))
    // mdToHTML(textPoetry2, textBox2)
    // log('*'.repeat(50))
    // log('*'.repeat(50))
    
    // mdToHTML(textRunaway, textBox3)
    // log('*'.repeat(50))
    // log('*'.repeat(50))
    
    // let htmlWrapped = mdWrapped.render(textJsPyth);
    // textBox1.innerHTML = htmlWrapped
    // htmlWrapped = mdWrapped.render(textTicks);
    // textBox2.innerHTML = htmlWrapped
    // htmlWrapped = mdWrapped.render(textTicksGibberish);
    // textBox3.innerHTML = htmlWrapped

    // const js_text = `
    // const textBox1 = document.getElementById('bot-message1');
    // const textBox2 = document.getElementById('bot-message2');
    // const textBox3 = document.getElementById('bot-message3');

    // console.log("Hello world")
    // `.trim()
    // const htmlH = hljs.highlight(js_text, {language:'javascript'})
    // // const domPure = DOMPurify.sanitize(htmlHighlight);
    // log('htmlH')
    // log(htmlH)
    // log('*'.repeat(30))
    // const codeContainer = putInCodeContainer(htmlH.value, js_text, 'javascript')
    // textBox3.appendChild(codeContainer)

};


// Add event listener for DOMContentLoaded and call the async function
document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);