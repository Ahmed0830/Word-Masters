const letters = document.querySelectorAll('.letters');
const loading = document.querySelector('.loader');

async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split('');
    let done = false;
    setLoading(false);
    isLoading = false;
    function addLetter (letter) {
        if (currentGuess.length < 5) {
            //adds a letter
            currentGuess += letter;
        } else {
            //Replaces the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letters[currentRow * 5 + currentGuess.length - 1].innerText = letter;
    }
async function commit () {
    if(currentGuess.length !== 5) {
        return; //do nothing
    }
    isLoading = true;
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: currentGuess})
    });
    const resObj = await res.json();
    const validWord = resObj.validWord;
    isLoading = false;
    setLoading(false);


    if(!validWord) {
        markInvalidWord();
        return;
    }
    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    for(let i = 0; i < 5; i++) {
        if(guessParts[i] === wordParts[i]) {
            letters[currentRow * 5 + i].classList.add("correct");
            map[guessParts[i]]--;
        } 
    }       
    for(let i = 0; i < 5; i++){ 
        if(guessParts[i] === wordParts[i]){
            //already done
        }else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
            letters[currentRow * 5 + i].classList.add("close");
            map[guessParts[i]]--;
        } else{
            letters[currentRow * 5 + i].classList.add("wrong");
        }
    }
    currentRow++;   
    if(currentGuess === word) {
        alert('You Win!!!');  // Win
        document.querySelector('.title').classList.add('winner');
        done = true;
        return;
    } else if (currentRow === 6) {
        alert(`You lose! The word was ${word}`);
        done = true;
    }
    currentGuess = '';
}
function backspace () {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * 5 + currentGuess.length].innerText = '';
}

function markInvalidWord() {
    for(let i = 0; i < 5; i++){
    letters[currentRow * 5 + i].classList.remove("invalid");
    setTimeout(function () {
        letters[currentRow * 5 + i].classList.add("invalid");
    }, 10);
}
}
 document.addEventListener('keydown', function handleKeyPress(event) {
        if(done || isLoading) {
            return; //do nothing
        }
        const action = event.key;
        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            // do nothing
        }
 });
}
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}
function setLoading(isLoading) {
    loading.classList.toggle('hidden', !isLoading);
}
function makeMap(array){
    const obj = {};
    for(let i = 0; i < 5; i++){
        const letter = array[i];
        if (obj[letter]){
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}
init();