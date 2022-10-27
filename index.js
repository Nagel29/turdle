// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
let words;
let totalGames = 0;
let winPercentage = 0;
let avgAttempts = 0;

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var statsTotalGames = document.querySelector('#stats-total-games');
var statsWinPercentage = document.querySelector('#stats-percent-correct');
var statsAvgAttempts = document.querySelector('#stats-average-guesses');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverMessage = document.querySelector('#game-over-message');
var gameOverInformation = document.querySelector('#informational-text')
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');

// Event Listeners
window.addEventListener('load', promises);

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Data fetch functions
let fetchWords = () => {
  return fetch(`http://localhost:3001/api/v1/words`)
      .then(response => response.json())
      .catch(error => console.log(error));
}

// Promises
function promises() {
  Promise.all([fetchWords()]).then(data => {
    words = data[0];
    setGame(words)
  })
}

// Functions
function setGame(wordsData) {
  currentRow = 1;
  winningWord = getRandomWord(wordsData);
  updateInputPermissions();
}

function getRandomWord(wordsData) {
  var randomIndex = Math.floor(Math.random() * 2500);
  return wordsData[randomIndex];
}

function updateInputPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } else if (currentRow !== 6) {
      changeRow();
    } else {
      declareLoser();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats('win');
  updateGameOverMessage('win');
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function declareLoser() {
  recordGameStats('loss');
  updateGameOverMessage('loss');
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats(result) {
  if (result === 'loss') {
    gamesPlayed.push({ solved: false, guesses: 6 })
  } else {
  gamesPlayed.push({ solved: true, guesses: currentRow });
  }
  updateStatistics();
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame(words);
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

function updateGameOverMessage(result) {
  if (result === 'loss') {
  gameOverInformation.classList.add('hidden');
  gameOverMessage.innerText = 'Sorry, you lost!';
  } else {
    gameOverInformation.classList.remove('hidden');
    gameOverMessage.innerText = 'Yay!';
  }
}

function updateWinPercentage() {
  let unformattedWinPercentage = gamesPlayed.filter(game => game.solved).length / totalGames;
  winPercentage = (unformattedWinPercentage * 100).toFixed(2) + '%';
}

function updateAvgAttempts() {
  totalAttempts = gamesPlayed.reduce((acc, game) => {
    acc += game.guesses;
    return acc;
  }, 0);
  avgAttempts = (totalAttempts / totalGames).toFixed(1);
}

function updateStatistics() {
  totalGames = gamesPlayed.length;
  updateWinPercentage();
  updateAvgAttempts();
  updateStatisticsView();
}

function updateStatisticsView() {
  statsTotalGames.innerText = totalGames;
  statsWinPercentage.innerText = winPercentage;
  statsAvgAttempts.innerText = avgAttempts;
}



// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
