const EMPTY = 0;
const BEIGE = 1;
const BLACK = 2;
const BEIGE_KING = 3;
const BLACK_KING = 4;

let board = [];
let selectedCell = null;
let validMoves = [];
let turn = BEIGE;
let gameOver = false;

function createBoard() {
  board = Array.from({ length: 8 }, () => Array(8).fill(EMPTY));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row][col] = BEIGE;
    }
  }
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row][col] = BLACK;
    }
  }
}

function getDirections(value) {
  if (value === BEIGE_KING || value === BLACK_KING) return [[-1,-1],[-1,1],[1,-1],[1,1]];
  if (value === BEIGE) return [[1,-1],[1,1]];
  return [[-1,-1],[-1,1]];
}

function isSameColor(value, target) {
  const beige = new Set([BEIGE, BEIGE_KING]);
  const black = new Set([BLACK, BLACK_KING]);
  if (beige.has(value)) return beige.has(target);
  return black.has(target);
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getMoves(row, col) {
  const value = board[row][col];
  const directions = getDirections(value);
  const moves = [];
  const captures = [];

  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (!inBounds(r, c)) continue;

    if (board[r][c] === EMPTY) {
      moves.push({ toRow: r, toCol: c });
    } else if (!isSameColor(value, board[r][c])) {
      const jr = r + dr;
      const jc = c + dc;
      if (inBounds(jr, jc) && board[jr][jc] === EMPTY) {
        captures.push({ toRow: jr, toCol: jc, capRow: r, capCol: c });
      }
    }
  }

  return captures.length > 0 ? captures : moves;
}

function getAllMoves() {
  const pieces = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const v = board[r][c];
      const isTurn = turn === BEIGE ? (v === BEIGE || v === BEIGE_KING) : (v === BLACK || v === BLACK_KING);
      if (isTurn) {
        const moves = getMoves(r, c);
        if (moves.length > 0) pieces.push({ row: r, col: c, moves });
      }
    }
  }

  const hasCapture = pieces.some(p => p.moves[0].capRow !== undefined);
  return hasCapture ? pieces.filter(p => p.moves[0].capRow !== undefined) : pieces;
}

function checkPromotion(row, col) {
  if (board[row][col] === BEIGE && row === 7) board[row][col] = BEIGE_KING;
  if (board[row][col] === BLACK && row === 0) board[row][col] = BLACK_KING;
}

function checkWinner() {
  const allMoves = getAllMoves();
  if (allMoves.length === 0) {
    return turn === BEIGE ? "Black wins!" : "Beige wins!";
  }

  let beige = false, black = false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === BEIGE || board[r][c] === BEIGE_KING) beige = true;
      if (board[r][c] === BLACK || board[r][c] === BLACK_KING) black = true;
    }
  }
  if (!beige) return "Black wins!";
  if (!black) return "Beige wins!";
  return null;
}

function onCellClick(row, col) {
  if (gameOver) return;

  const allMoves = getAllMoves();
  const clickedPiece = allMoves.find(p => p.row === row && p.col === col);

  if (clickedPiece) {
    selectedCell = { row, col };
    validMoves = clickedPiece.moves;
    render();
    return;
  }

  if (selectedCell) {
    const move = validMoves.find(m => m.toRow === row && m.toCol === col);
    if (move) {
      board[row][col] = board[selectedCell.row][selectedCell.col];
      board[selectedCell.row][selectedCell.col] = EMPTY;
      if (move.capRow !== undefined) board[move.capRow][move.capCol] = EMPTY;
      checkPromotion(row, col);

      selectedCell = null;
      validMoves = [];
      turn = turn === BEIGE ? BLACK : BEIGE;

      const winner = checkWinner();
      if (winner) {
        gameOver = true;
        document.getElementById('winner-banner').textContent = winner;
      }

      render();
      return;
    }

    selectedCell = null;
    validMoves = [];
    render();
  }
}

function render() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  const turnName = turn === BEIGE ? "Beige's Turn" : "Black's Turn";
  document.getElementById('turn-indicator').textContent = gameOver ? '' : turnName;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;

      const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
      const isValid = validMoves.some(m => m.toRow === row && m.toCol === col);

      if (isSelected) cell.classList.add('selected');
      if (isValid) cell.classList.add('valid-move');

      const value = board[row][col];
      if (value !== EMPTY) {
        const piece = document.createElement('div');
        const isBeige = value === BEIGE || value === BEIGE_KING;
        piece.className = `piece ${isBeige ? 'beige' : 'black'}${value === BEIGE_KING || value === BLACK_KING ? ' king' : ''}`;
        cell.appendChild(piece);
      }

      cell.addEventListener('click', () => onCellClick(row, col));
      boardEl.appendChild(cell);
    }
  }
}

function init() {
  gameOver = false;
  turn = BEIGE;
  selectedCell = null;
  validMoves = [];
  document.getElementById('winner-banner').textContent = '';
  createBoard();
  render();
}

document.getElementById('restart-btn').addEventListener('click', init);

init();
