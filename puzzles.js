// ═══════════════════════════════════════════════════════════════
//  CHESS BEAST — Interactive Puzzle Trainer
//  Mate-in-1 and Mate-in-2 puzzles
//  ═══════════════════════════════════════════════════════════════

"use strict";

// ─── Puzzle Database ───
const PUZZLES_EASY = [
    {
        name: "Back Rank Mate",
        instruction: "White to move. Deliver checkmate in 1!",
        side: "w",
        fen: "4r1k1/5ppp/8/8/8/8/4R3/6K1 w - - 0 1",
        solution: "e8"
    },
    {
        name: "Smothered Mate Setup",
        instruction: "White to move. Find the fastest checkmate!",
        side: "w",
        fen: "6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1",
        solution: "g7"
    },
    {
        name: "Queen Sacrifice",
        instruction: "White to move. Deliver checkmate in 1!",
        side: "w",
        fen: "1r6/p7/k7/8/8/8/8/1Q2K3 w - - 0 1",
        solution: "b6"
    },
    {
        name: "Rook Ladder",
        instruction: "White to move. Find the mate!",
        side: "w",
        fen: "7k/8/8/8/8/8/7R/7K w - - 0 1",
        solution: "h8"
    }
];

const PUZZLES_HARD = [
    {
        name: "Anastasia's Mate",
        instruction: "White to move. Mate in 2! Find the key move.",
        side: "w",
        fen: "7r/pppk4/4p3/4B3/8/8/8/4K2R w K - 0 1",
        solution: "h8"
    },
    {
        name: "Bodens Mate",
        instruction: "White to move. Mate in 2! Find the key move.",
        side: "w",
        fen: "5rk1/5ppp/8/8/1B6/8/8/4K3 w - - 0 1",
        solution: "g7"
    },
    {
        name: "Arabian Mate",
        instruction: "White to move. Mate in 2! Find the key move.",
        side: "w",
        fen: "6k1/5ppp/8/8/8/8/7N/6K1 w - - 0 1",
        solution: "g7"
    },
    {
        name: "Dovetail Mate",
        instruction: "White to move. Mate in 2! Find the key move.",
        side: "w",
        fen: "6k1/5pp1/5Q2/8/8/8/8/6K1 w - - 0 1",
        solution: "g7"
    }
];

// ─── Simple FEN parser ───
function parseFEN(fen) {
    const parts = fen.split(" ");
    const pos = parts[0];
    const turn = parts[1] === "w" ? WHITE : BLACK;

    const board = new Int8Array(64);
    let sq = 56; // Start at a8

    for (const ch of pos) {
        if (ch === "/") { sq -= 16; continue; }
        if (ch >= "1" && ch <= "8") { sq += parseInt(ch); continue; }
        const isWhite = ch === ch.toUpperCase();
        const color = isWhite ? WHITE : BLACK;
        const pt = " PNBRQK".indexOf(ch.toUpperCase());
        if (pt > 0) board[sq] = color | pt;
        sq++;
    }

    return { board, turn };
}

// ─── Puzzle State ───
let currentDifficulty = "easy";
let currentPuzzleIndex = 0;
let puzzleSolved = false;
let scoreCorrect = 0;
let scoreTotal = 0;
let puzzleSelectedSq = -1;
let puzzleLegalMoves = [];
let puzzleLastMove = null;
let puzzleBoard = new Int8Array(64);
let puzzleTurn = WHITE;
let puzzlePlayerColor = WHITE;

function getPuzzles() {
    return currentDifficulty === "easy" ? PUZZLES_EASY : PUZZLES_HARD;
}

function loadPuzzle(index) {
    const puzzles = getPuzzles();
    if (index >= puzzles.length) index = 0;
    currentPuzzleIndex = index;
    puzzleSolved = false;
    const puzzle = puzzles[index];
    const parsed = parseFEN(puzzle.fen);
    puzzleBoard = parsed.board;
    puzzleTurn = parsed.turn;
    puzzlePlayerColor = parsed.turn;
    puzzleSelectedSq = -1;
    puzzleLegalMoves = [];
    puzzleLastMove = null;

    document.getElementById("puzzle-num").textContent = index + 1;
    document.getElementById("puzzle-total").textContent = puzzles.length;
    document.getElementById("puzzle-instruction").textContent = puzzle.instruction;
    document.getElementById("puzzle-status").textContent = "";
    document.getElementById("puzzle-status").className = "puzzle-status";

    renderPuzzleBoard();
}

function renderPuzzleBoard() {
    const boardEl = document.getElementById("board");
    if (!boardEl) return;
    boardEl.innerHTML = "";

    const selectedSet = new Set(puzzleLegalMoves.map(m => m.to));
    const captureSet = new Set(puzzleLegalMoves.filter(m => puzzleBoard[m.to] !== EMPTY).map(m => m.to));

    for (let visRow = 0; visRow < 8; visRow++) {
        for (let visCol = 0; visCol < 8; visCol++) {
            const r = 7 - visRow;
            const f = visCol;
            const s = sq(r, f);
            const el = document.createElement("div");
            el.className = "sq " + ((r + f) % 2 === 0 ? "dark" : "light");
            el.dataset.sq = s;

            if (s === puzzleSelectedSq) el.classList.add("selected");
            else if (puzzleLastMove && (s === puzzleLastMove.from || s === puzzleLastMove.to)) el.classList.add("last-move");

            if (typeOf(puzzleBoard[s]) === K && colorOf(puzzleBoard[s]) === puzzleTurn) {
                const opp = puzzleTurn === WHITE ? BLACK : WHITE;
                const ks = kingSquare(puzzleBoard, puzzleTurn);
                if (isAttacked(puzzleBoard, ks, opp)) el.classList.add("in-check");
            }

            if (puzzleSelectedSq !== -1 && selectedSet.has(s)) {
                el.classList.add(captureSet.has(s) ? "can-capture" : "can-move");
            }

            if (puzzleBoard[s] !== EMPTY) {
                const span = document.createElement("span");
                span.className = "piece";
                span.innerHTML = PIECE_SVG[puzzleBoard[s]];
                el.appendChild(span);
            }
            el.addEventListener("click", () => handlePuzzleClick(s));
            boardEl.appendChild(el);
        }
    }

    renderPuzzleCoords();
}

function renderPuzzleCoords() {
    const rankLabels = document.getElementById("rank-labels");
    const fileLabels = document.getElementById("file-labels");
    if (!rankLabels || !fileLabels) return;
    rankLabels.innerHTML = "";
    fileLabels.innerHTML = "";
    for (let i = 0; i < 8; i++) {
        const r = 8 - i;
        const d = document.createElement("div");
        d.className = "coord coord-r";
        d.textContent = r;
        d.style.height = "60px";
        d.style.display = "flex";
        d.style.alignItems = "center";
        rankLabels.appendChild(d);
    }
    for (let i = 0; i < 8; i++) {
        const d = document.createElement("div");
        d.className = "coord";
        d.textContent = FILES[i];
        fileLabels.appendChild(d);
    }
}

function handlePuzzleClick(s) {
    if (puzzleSolved) return;
    if (puzzleTurn !== puzzlePlayerColor) return;

    if (puzzleSelectedSq !== -1) {
        const move = puzzleLegalMoves.find(m => m.to === s);
        if (move) {
            executePuzzleMove(move);
            return;
        }
    }

    if (colorOf(puzzleBoard[s]) === puzzlePlayerColor) {
        puzzleSelectedSq = s;
        puzzleLegalMoves = legalMovesFor(puzzleBoard, puzzleTurn, -1, {
            wK: false, wQ: false, bK: false, bQ: false
        }).filter(m => m.from === s);
        renderPuzzleBoard();
    } else {
        puzzleSelectedSq = -1;
        puzzleLegalMoves = [];
        renderPuzzleBoard();
    }
}

function executePuzzleMove(m) {
    const result = applyMove(puzzleBoard, m, puzzleTurn, {
        wK: false, wQ: false, bK: false, bQ: false
    });
    puzzleBoard = result.nb;
    puzzleLastMove = { from: m.from, to: m.to };
    puzzleTurn = puzzleTurn === WHITE ? BLACK : WHITE;
    puzzleSelectedSq = -1;
    puzzleLegalMoves = [];
    scoreTotal++;

    renderPuzzleBoard();

    // Check if solution is correct
    const puzzles = getPuzzles();
    const puzzle = puzzles[currentPuzzleIndex];
    const targetSqName = FILES[fileOf(m.to)] + (rankOf(m.to) + 1);
    const isCorrect = targetSqName === puzzle.solution;

    const statusEl = document.getElementById("puzzle-status");
    if (isCorrect) {
        puzzleSolved = true;
        scoreCorrect++;
        statusEl.textContent = "\u2705 Correct! Well done!";
        statusEl.className = "puzzle-status correct";
    } else {
        statusEl.textContent = "\u274c Not quite. The solution was " + puzzle.solution.toUpperCase() + ".";
        statusEl.className = "puzzle-status wrong";
    }

    document.getElementById("score-correct").textContent = scoreCorrect;
    document.getElementById("score-total").textContent = scoreTotal;
}

function nextPuzzle() {
    const puzzles = getPuzzles();
    let next = currentPuzzleIndex + 1;
    if (next >= puzzles.length) {
        // Shuffle and restart
        next = 0;
    }
    loadPuzzle(next);
}

function resetPuzzle() {
    loadPuzzle(currentPuzzleIndex);
}

function setDifficulty(diff) {
    currentDifficulty = diff;
    document.querySelectorAll(".diff-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    loadPuzzle(0);
}

// ─── Initialize ───
document.addEventListener("DOMContentLoaded", () => {
    loadPuzzle(0);
});
