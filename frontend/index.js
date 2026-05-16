const API = 'http://localhost:8000';
const GAME_ID = 'game1';

const EMPTY = 0;
const BEIGE_KING = 3;
const BLACK_KING = 4;

let board = [];
let turn = null;
let selectedCell = null;
let validMoves = [];
let gameOver = false;

async function newGame() {
  const res = await fetch(`${API}/game/new?game_id=${GAME_ID}`, { method: 'POST' });
  const data = await res.json();
  board = data.board;
  turn = data.turn;
  selectedCell = null;
  validMoves = [];
  gameOver = false;
  document.getElementById('winner-banner').textContent = '';
  render();
}

async function fetchValidMoves(row, col) {
  const res = await fetch(`${API}/game/${GAME_ID}/valid-moves?row=${row}&col=${col}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.moves;
}

async function makeMove(pieceRow, pieceCol, toRow, toCol) {
  const res = await fetch(`${API}/game/${GAME_ID}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ piece_row: pieceRow, piece_col: pieceCol, to_row: toRow, to_col: toCol })
  });
  if (!res.ok) return;
  const data = await res.json();
  board = data.board;
  turn = data.turn;

  if (data.winner) {
    gameOver = true;
    document.getElementById('winner-banner').textContent = `${data.winner} wins!`;
    document.getElementById('turn-indicator').textContent = '';
  }

  selectedCell = null;
  validMoves = [];
  render();
}

async function onCellClick(row, col) {
  if (gameOver) return;

  if (selectedCell) {
    const move = validMoves.find(m => m[0] === row && m[1] === col);
    if (move) {
      await makeMove(selectedCell.row, selectedCell.col, row, col);
      return;
    }
  }

  const moves = await fetchValidMoves(row, col);
  if (moves.length > 0) {
    selectedCell = { row, col };
    validMoves = moves;
    render();
  } else {
    selectedCell = null;
    validMoves = [];
    render();
  }
}

function render() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  if (!gameOver) {
    document.getElementById('turn-indicator').textContent = turn === 1 ? "Beige's Turn" : "Black's Turn";
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;

      const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
      const isValid = validMoves.some(m => m[0] === row && m[1] === col);

      if (isSelected) cell.classList.add('selected');
      if (isValid) cell.classList.add('valid-move');

      const value = board[row][col];
      if (value !== EMPTY) {
        const piece = document.createElement('div');
        const isBeige = value === 1 || value === BEIGE_KING;
        piece.className = `piece ${isBeige ? 'beige' : 'black'}${value === BEIGE_KING || value === BLACK_KING ? ' king' : ''}`;
        cell.appendChild(piece);
      }

      cell.addEventListener('click', () => onCellClick(row, col));
      boardEl.appendChild(cell);
    }
  }
}

document.getElementById('restart-btn').addEventListener('click', newGame);

newGame();
