"use strict";

// ═══════════════════════════════════════════════════════════════
//  PIECE CONSTANTS
// ═══════════════════════════════════════════════════════════════
const EMPTY = 0;
const P = 1,
  N = 2,
  B = 3,
  R = 4,
  Q = 5,
  K = 6; // piece types
const WHITE = 8,
  BLACK = 16; // color flags

// SVG piece paths — Staunton-style, viewBox 0 0 45 45
// Each returns an SVG <path> d string (or multiple elements)
const PIECE_SVG = (() => {
  // Colors: white pieces = ivory fill + dark stroke; black pieces = dark fill + light stroke
  const W_FILL = "#f0e9d2";
  const W_STROKE = "#2c1a0e";
  const B_FILL = "#2c2016";
  const B_STROKE = "#f0e9d2";

  function piece(fill, stroke, paths) {
    return `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
<g fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
${paths}
</g></svg>`;
  }

  function pawn(f, s) {
    return piece(
      f,
      s,
      `
<path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,14.755 19.077,16.261 20.601,16.829
       C 19.38,18.034 18.5,20 18.5,22 L 26.5,22 C 26.5,20 25.62,18.034 24.399,16.829
       C 25.923,16.261 27,14.755 27,13 C 27,10.79 25.21,9 23,9 Z" />
<path d="M 15,32 C 15,30 16.5,28 18.5,27 L 26.5,27 C 28.5,28 30,30 30,32 L 15,32 Z"/>
<rect x="12" y="32" width="21" height="3.5" rx="2"/>
<rect x="11" y="35.5" width="23" height="3" rx="1.5"/>
`,
    );
  }

  function knight(f, s) {
    const accent = f === W_FILL ? W_STROKE : W_FILL;
    return piece(
      f,
      s,
      `
<path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 Z"/>
<path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27
       C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28
       C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26
       C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5
       C 13.27,9.506 13.5,8.5 13.5,7.5
       C 14.5,6.5 16.5,10 16.5,10 L 18.5,10
       C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10 Z"/>
<path d="M 9.5,25.5 A 0.5,0.5 0 1 1 8.5,25.5 A 0.5,0.5 0 1 1 9.5,25.5 Z"
    fill="${accent}" stroke="${accent}" stroke-width="1"/>
<path d="M 15,15.5 A 0.5,1.5 0 1 1 14,15.5 A 0.5,1.5 0 1 1 15,15.5 Z"
    fill="${accent}" stroke="${accent}" stroke-width="1" transform="rotate(30,14.5,15.5)"/>
`,
    );
  }

  function bishop(f, s) {
    const accent = f === W_FILL ? W_STROKE : W_FILL;
    return piece(
      f,
      s,
      `
<path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34
       C 25.89,36.43 32.61,35.03 36,36 L 36,37.5
       C 32.61,36.53 25.89,37.93 22.5,35.5
       C 19.11,37.93 12.39,36.53 9,37.5 Z"/>
<path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32
       L 30,30 C 27.5,32.5 17.5,32.5 15,30 Z"/>
<path d="M 22.5,6 C 19,6 17,10 18,14 L 18,30 L 27,30 L 27,14 C 28,10 26,6 22.5,6 Z"/>
<path d="M 22.5,6 C 22,7 22,8 22.5,8.5 C 23,8 23,7 22.5,6 Z"
    fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
<circle cx="22.5" cy="7.5" r="1.5" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
<path d="M 20,20 L 25,15 M 20,15 L 25,20"
    stroke="${accent}" stroke-width="1.5" fill="none"/>
`,
    );
  }

  function rook(f, s) {
    return piece(
      f,
      s,
      `
<path d="M 9,39 L 36,39 L 36,36 L 9,36 Z"/>
<path d="M 12,36 L 12,32 L 33,32 L 33,36 Z"/>
<path d="M 11,32 L 11,10 L 14,10 L 14,12 L 18.5,12 L 18.5,10 L 26.5,10 L 26.5,12 L 31,12 L 31,10 L 34,10 L 34,32 Z"/>
`,
    );
  }

  function queen(f, s) {
    const accent = f === W_FILL ? W_STROKE : W_FILL;
    return piece(
      f,
      s,
      `
<path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25
       L 29.5,12.5 L 22.5,25 L 15.5,12.5 L 14,25 L 7,14 Z"/>
<path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5
       C 14.5,34.5 18.5,35.5 22.5,35.5 C 26.5,35.5 30.5,34.5 33,33.5
       C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26
       C 27.5,24.5 17.5,24.5 9,26 Z"/>
<path d="M 11,38.5 A 35,35 0 0 0 34,38.5" fill="none"/>
<path d="M 11,29 A 35,35 0 0 1 34,29" fill="none"/>
<circle cx="6"    cy="12" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
<circle cx="14"   cy="9"  r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
<circle cx="22.5" cy="8"  r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
<circle cx="31"   cy="9"  r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
<circle cx="39"   cy="12" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>
`,
    );
  }

  function king(f, s) {
    return piece(
      f,
      s,
      `
<path d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8" stroke-width="1.5"/>
<path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5
       C 25.5,14.5 24.5,12 22.5,12
       C 20.5,12 19.5,14.5 19.5,14.5
       C 18,17.5 22.5,25 22.5,25 Z"/>
<path d="M 12.5,37 C 13,31.5 14.5,30.5 14.5,30.5
       C 14.5,30.5 14,28 14,26.5
       C 14,25 14.5,24 15.5,23.5
       C 16.5,23 18,22.5 22.5,22.5
       C 27,22.5 28.5,23 29.5,23.5
       C 30.5,24 31,25 31,26.5
       C 31,28 30.5,30.5 30.5,30.5
       C 30.5,30.5 32,31.5 32.5,37 Z"/>
<path d="M 11.5,37 L 32.5,37 L 33.5,39 L 11.5,39 Z"/>
<path d="M 12,36.5 L 33,36.5" fill="none"/>
`,
    );
  }

  const builders = {
    [P]: pawn,
    [N]: knight,
    [B]: bishop,
    [R]: rook,
    [Q]: queen,
    [K]: king,
  };
  const cache = {};
  for (const clr of [WHITE, BLACK]) {
    const f = clr === WHITE ? W_FILL : B_FILL;
    const s = clr === WHITE ? W_STROKE : B_STROKE;
    for (const [pt, fn] of Object.entries(builders)) {
      cache[clr | +pt] = fn(f, s);
    }
  }
  return cache;
})();

// Keep PIECE_CHAR for move history / captured display only
const PIECE_CHAR = {
  [WHITE | P]: "♙",
  [WHITE | N]: "♘",
  [WHITE | B]: "♗",
  [WHITE | R]: "♖",
  [WHITE | Q]: "♕",
  [WHITE | K]: "♔",
  [BLACK | P]: "♟",
  [BLACK | N]: "♞",
  [BLACK | B]: "♝",
  [BLACK | R]: "♜",
  [BLACK | Q]: "♛",
  [BLACK | K]: "♚",
};

const PIECE_SYMBOL = {
  [WHITE | P]: "P",
  [WHITE | N]: "N",
  [WHITE | B]: "B",
  [WHITE | R]: "R",
  [WHITE | Q]: "Q",
  [WHITE | K]: "K",
  [BLACK | P]: "p",
  [BLACK | N]: "n",
  [BLACK | B]: "b",
  [BLACK | R]: "r",
  [BLACK | Q]: "q",
  [BLACK | K]: "k",
};

const typeOf = (sq) => sq & 7;
const colorOf = (sq) => sq & 24;

// Material values (centipawns)
const VALUE = {
  [P]: 100,
  [N]: 320,
  [B]: 330,
  [R]: 500,
  [Q]: 900,
  [K]: 20000,
};

// ═══════════════════════════════════════════════════════════════
//  PIECE-SQUARE TABLES  (white perspective, a1=bottom-left)
//  Index: rank*8 + file  (rank 0 = rank 1, rank 7 = rank 8)
// ═══════════════════════════════════════════════════════════════
const PST = {
  [P]: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
    20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5,
    -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],
  [N]: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
    0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20,
    20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20,
    -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  [B]: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
    5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10,
    0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20,
    -10, -10, -10, -10, -10, -10, -20,
  ],
  [R]: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
    -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0,
    0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  [Q]: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
    5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5,
    5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
    -10, -20,
  ],
  [K]: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
    -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
    -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

// King endgame table (less castling priority, more centralization)
const KING_END = [
  -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30,
  -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30,
  -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30,
  0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
];

// ═══════════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════════
let board; // 64-element array, index = rank*8 + file
let turn; // WHITE or BLACK
let playerColor; // WHITE or BLACK (human's color)
let castling; // { wK, wQ, bK, bQ } — rights
let enPassant; // target square index or -1
let halfMove; // for 50-move rule
let fullMove;
let selectedSq; // currently selected square index or -1
let legalMoves; // legal moves from selectedSq
let lastMove; // {from, to} for highlighting
let capturedByPlayer;
let capturedByAI;
let moveHistory; // SAN strings
let gameOver;
let aiThinking;

function initState() {
  board = new Int8Array(64);
  turn = WHITE;
  castling = { wK: true, wQ: true, bK: true, bQ: true };
  enPassant = -1;
  halfMove = 0;
  fullMove = 1;
  selectedSq = -1;
  legalMoves = [];
  lastMove = null;
  capturedByPlayer = [];
  capturedByAI = [];
  moveHistory = [];
  gameOver = false;
  aiThinking = false;
  setStartingPosition();
}

function setStartingPosition() {
  const back = [R, N, B, Q, K, B, N, R];
  for (let f = 0; f < 8; f++) {
    board[0 * 8 + f] = WHITE | back[f];
    board[1 * 8 + f] = WHITE | P;
    board[6 * 8 + f] = BLACK | P;
    board[7 * 8 + f] = BLACK | back[f];
  }
}

// ═══════════════════════════════════════════════════════════════
//  MOVE GENERATION
// ═══════════════════════════════════════════════════════════════
function rankOf(sq) {
  return sq >> 3;
}
function fileOf(sq) {
  return sq & 7;
}
function sq(r, f) {
  return r * 8 + f;
}
function inBounds(r, f) {
  return r >= 0 && r < 8 && f >= 0 && f < 8;
}

// Generate pseudo-legal moves (not checking for discovered check)
function pseudoMoves(b, clr, ep, cas) {
  const moves = [];
  const opp = clr === WHITE ? BLACK : WHITE;

  for (let s = 0; s < 64; s++) {
    if (colorOf(b[s]) !== clr) continue;
    const t = typeOf(b[s]);
    const r = rankOf(s),
      f = fileOf(s);

    if (t === P) {
      const dir = clr === WHITE ? 1 : -1;
      const startRank = clr === WHITE ? 1 : 6;
      const promRank = clr === WHITE ? 7 : 0;
      // Forward
      if (inBounds(r + dir, f) && b[sq(r + dir, f)] === EMPTY) {
        if (r + dir === promRank) {
          for (const pt of [Q, R, B, N])
            moves.push({
              from: s,
              to: sq(r + dir, f),
              prom: pt,
            });
        } else {
          moves.push({ from: s, to: sq(r + dir, f) });
          // Double push from start
          if (r === startRank && b[sq(r + 2 * dir, f)] === EMPTY)
            moves.push({
              from: s,
              to: sq(r + 2 * dir, f),
            });
        }
      }
      // Captures
      for (const df of [-1, 1]) {
        if (!inBounds(r + dir, f + df)) continue;
        const ts = sq(r + dir, f + df);
        if (colorOf(b[ts]) === opp) {
          if (r + dir === promRank) {
            for (const pt of [Q, R, B, N])
              moves.push({
                from: s,
                to: ts,
                prom: pt,
              });
          } else {
            moves.push({ from: s, to: ts });
          }
        } else if (ts === ep) {
          moves.push({ from: s, to: ts, ep: true });
        }
      }
    } else if (t === N) {
      for (const [dr, df] of [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]) {
        if (!inBounds(r + dr, f + df)) continue;
        const ts = sq(r + dr, f + df);
        if (colorOf(b[ts]) !== clr) moves.push({ from: s, to: ts });
      }
    } else if (t === B || t === Q) {
      for (const [dr, df] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!inBounds(r + dr * i, f + df * i)) break;
          const ts = sq(r + dr * i, f + df * i);
          if (colorOf(b[ts]) === clr) break;
          moves.push({ from: s, to: ts });
          if (b[ts] !== EMPTY) break;
        }
      }
      if (t === B) continue;
    }
    if (t === R || t === Q) {
      for (const [dr, df] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!inBounds(r + dr * i, f + df * i)) break;
          const ts = sq(r + dr * i, f + df * i);
          if (colorOf(b[ts]) === clr) break;
          moves.push({ from: s, to: ts });
          if (b[ts] !== EMPTY) break;
        }
      }
    } else if (t === K) {
      for (const [dr, df] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        if (!inBounds(r + dr, f + df)) continue;
        const ts = sq(r + dr, f + df);
        if (colorOf(b[ts]) !== clr) moves.push({ from: s, to: ts });
      }
      // Castling
      if (clr === WHITE && r === 0 && f === 4) {
        if (
          cas.wK &&
          b[sq(0, 5)] === EMPTY &&
          b[sq(0, 6)] === EMPTY &&
          typeOf(b[sq(0, 7)]) === R
        )
          moves.push({
            from: s,
            to: sq(0, 6),
            castle: "K",
          });
        if (
          cas.wQ &&
          b[sq(0, 3)] === EMPTY &&
          b[sq(0, 2)] === EMPTY &&
          b[sq(0, 1)] === EMPTY &&
          typeOf(b[sq(0, 0)]) === R
        )
          moves.push({
            from: s,
            to: sq(0, 2),
            castle: "Q",
          });
      }
      if (clr === BLACK && r === 7 && f === 4) {
        if (
          cas.bK &&
          b[sq(7, 5)] === EMPTY &&
          b[sq(7, 6)] === EMPTY &&
          typeOf(b[sq(7, 7)]) === R
        )
          moves.push({
            from: s,
            to: sq(7, 6),
            castle: "K",
          });
        if (
          cas.bQ &&
          b[sq(7, 3)] === EMPTY &&
          b[sq(7, 2)] === EMPTY &&
          b[sq(7, 1)] === EMPTY &&
          typeOf(b[sq(7, 0)]) === R
        )
          moves.push({
            from: s,
            to: sq(7, 2),
            castle: "Q",
          });
      }
    }
  }
  return moves;
}

// Is square `s` attacked by `attacker` color?
function isAttacked(b, s, attacker) {
  const pseudo = pseudoMoves(b, attacker, -1, {
    wK: false,
    wQ: false,
    bK: false,
    bQ: false,
  });
  return pseudo.some((m) => m.to === s && !m.castle);
}

// Find king square for given color
function kingSquare(b, clr) {
  for (let s = 0; s < 64; s++) if (b[s] === (clr | K)) return s;
  return -1;
}

// Apply a move to a board copy; returns new board, new ep, new castling
function applyMove(b, m, clr, cas) {
  const nb = new Int8Array(b);
  const opp = clr === WHITE ? BLACK : WHITE;
  let nep = -1;
  const nc = { ...cas };

  const piece = nb[m.from];
  const pt = typeOf(piece);

  // En passant capture
  if (m.ep) {
    const capR = rankOf(m.from);
    nb[sq(capR, fileOf(m.to))] = EMPTY;
  }

  // Castling rook move
  if (m.castle) {
    if (m.castle === "K") {
      const rr = rankOf(m.from);
      nb[sq(rr, 5)] = nb[sq(rr, 7)];
      nb[sq(rr, 7)] = EMPTY;
    } else {
      const rr = rankOf(m.from);
      nb[sq(rr, 3)] = nb[sq(rr, 0)];
      nb[sq(rr, 0)] = EMPTY;
    }
  }

  nb[m.to] = m.prom ? clr | m.prom : piece;
  nb[m.from] = EMPTY;

  // En passant target after double push
  if (pt === P && Math.abs(rankOf(m.to) - rankOf(m.from)) === 2) {
    nep = sq((rankOf(m.from) + rankOf(m.to)) >> 1, fileOf(m.from));
  }

  // Update castling rights
  if (pt === K) {
    if (clr === WHITE) {
      nc.wK = false;
      nc.wQ = false;
    } else {
      nc.bK = false;
      nc.bQ = false;
    }
  }
  if (pt === R) {
    if (m.from === sq(0, 7)) nc.wK = false;
    if (m.from === sq(0, 0)) nc.wQ = false;
    if (m.from === sq(7, 7)) nc.bK = false;
    if (m.from === sq(7, 0)) nc.bQ = false;
  }
  if (typeOf(nb[m.to]) === R) {
    // rook captured
    if (m.to === sq(0, 7)) nc.wK = false;
    if (m.to === sq(0, 0)) nc.wQ = false;
    if (m.to === sq(7, 7)) nc.bK = false;
    if (m.to === sq(7, 0)) nc.bQ = false;
  }

  return { nb, nep, nc };
}

// Legal moves: pseudo-legal filtered by legality (king not in check after)
function legalMovesFor(b, clr, ep, cas) {
  const pseudo = pseudoMoves(b, clr, ep, cas);
  return pseudo.filter((m) => {
    // Castling: king must not pass through check
    if (m.castle) {
      const r = rankOf(m.from);
      const passSq = m.castle === "K" ? sq(r, 5) : sq(r, 3);
      if (isAttacked(b, m.from, clr === WHITE ? BLACK : WHITE)) return false;
      if (isAttacked(b, passSq, clr === WHITE ? BLACK : WHITE)) return false;
    }
    const { nb } = applyMove(b, m, clr, cas);
    const ks = kingSquare(nb, clr);
    return !isAttacked(nb, ks, clr === WHITE ? BLACK : WHITE);
  });
}

// ═══════════════════════════════════════════════════════════════
//  EVALUATION
// ═══════════════════════════════════════════════════════════════
function isEndgame(b) {
  let q = 0;
  for (let s = 0; s < 64; s++) if (typeOf(b[s]) === Q) q++;
  return q === 0;
}

function evaluate(b) {
  let score = 0;
  const eg = isEndgame(b);
  for (let s = 0; s < 64; s++) {
    const p = b[s];
    if (p === EMPTY) continue;
    const t = typeOf(p);
    const clr = colorOf(p);
    const r = rankOf(s),
      f = fileOf(s);
    const pstIdx = clr === WHITE ? r * 8 + f : (7 - r) * 8 + f;
    const pst = t === K && eg ? KING_END : PST[t];
    const val = VALUE[t] + (pst ? pst[pstIdx] : 0);
    score += clr === WHITE ? val : -val;
  }
  return score;
}

// ═══════════════════════════════════════════════════════════════
//  MOVE ORDERING  (MVV-LVA: Most Valuable Victim / Least Valuable Attacker)
// ═══════════════════════════════════════════════════════════════
function moveScore(b, m) {
  let s = 0;
  if (b[m.to] !== EMPTY)
    s += 10 * VALUE[typeOf(b[m.to])] - VALUE[typeOf(b[m.from])];
  if (m.prom) s += VALUE[m.prom] * 10;
  if (m.ep) s += VALUE[P] * 10;
  return s;
}

// ═══════════════════════════════════════════════════════════════
//  MINIMAX  with Alpha-Beta Pruning + Quiescence Search
// ═══════════════════════════════════════════════════════════════
const INF = 999999;

function quiesce(b, clr, ep, cas, alpha, beta) {
  const stand = clr === WHITE ? evaluate(b) : -evaluate(b);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;

  const moves = pseudoMoves(b, clr, ep, cas)
    .filter((m) => b[m.to] !== EMPTY || m.ep || m.prom)
    .sort((a, z) => moveScore(b, z) - moveScore(b, a));

  const opp = clr === WHITE ? BLACK : WHITE;
  for (const m of moves) {
    const { nb, nep, nc } = applyMove(b, m, clr, cas);
    const ks = kingSquare(nb, clr);
    if (isAttacked(nb, ks, opp)) continue;
    const score = -quiesce(nb, opp, nep, nc, -beta, -alpha);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function alphaBeta(b, clr, ep, cas, depth, alpha, beta) {
  if (depth === 0) return quiesce(b, clr, ep, cas, alpha, beta);

  const opp = clr === WHITE ? BLACK : WHITE;
  const moves = legalMovesFor(b, clr, ep, cas).sort(
    (a, z) => moveScore(b, z) - moveScore(b, a),
  );

  if (moves.length === 0) {
    const ks = kingSquare(b, clr);
    if (isAttacked(b, ks, opp)) return -INF + (10 - depth); // checkmate
    return 0; // stalemate
  }

  for (const m of moves) {
    const { nb, nep, nc } = applyMove(b, m, clr, cas);
    const score = -alphaBeta(nb, opp, nep, nc, depth - 1, -beta, -alpha);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

// Iterative deepening search — returns best move
function findBestMove(b, clr, ep, cas) {
  const opp = clr === WHITE ? BLACK : WHITE;
  const moves = legalMovesFor(b, clr, ep, cas).sort(
    (a, z) => moveScore(b, z) - moveScore(b, a),
  );

  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const MAX_DEPTH = 4; // depth 4 + quiescence ≈ 2100 ELO
  let best = moves[0];

  for (let depth = 1; depth <= MAX_DEPTH; depth++) {
    let alpha = -INF,
      localBest = moves[0];
    for (const m of moves) {
      const { nb, nep, nc } = applyMove(b, m, clr, cas);
      const score = -alphaBeta(nb, opp, nep, nc, depth - 1, -INF, -alpha);
      if (score > alpha) {
        alpha = score;
        localBest = m;
      }
    }
    best = localBest;
  }
  return best;
}

// ═══════════════════════════════════════════════════════════════
//  SAN NOTATION  (simplified)
// ═══════════════════════════════════════════════════════════════
const FILES = "abcdefgh";
const sqName = (s) => FILES[fileOf(s)] + (rankOf(s) + 1);

function toSAN(b, m, clr, ep, cas) {
  if (m.castle) return m.castle === "K" ? "O-O" : "O-O-O";
  const pt = typeOf(b[m.from]);
  const capture = b[m.to] !== EMPTY || m.ep;
  const prefix =
    pt === P ? (capture ? FILES[fileOf(m.from)] : "") : "NBRQK"[pt - 2];
  const { nb, nep, nc } = applyMove(b, m, clr, cas);
  const opp = clr === WHITE ? BLACK : WHITE;
  const oppLegal = legalMovesFor(nb, opp, nep, nc);
  const ks = kingSquare(nb, opp);
  const inCh = isAttacked(nb, ks, clr);
  const suffix = inCh ? (oppLegal.length === 0 ? "#" : "+") : "";
  const prom = m.prom ? "=" + "NBRQ"[m.prom - 2] : "";
  return prefix + (capture ? "x" : "") + sqName(m.to) + prom + suffix;
}

// ═══════════════════════════════════════════════════════════════
//  UI RENDERING
// ═══════════════════════════════════════════════════════════════
function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";

  const isFlipped = playerColor === BLACK;

  // Which squares highlight
  const selectedSet = new Set(legalMoves.map((m) => m.to));
  const captureSet = new Set(
    legalMoves.filter((m) => board[m.to] !== EMPTY || m.ep).map((m) => m.to),
  );

  for (let visRow = 0; visRow < 8; visRow++) {
    for (let visCol = 0; visCol < 8; visCol++) {
      const r = isFlipped ? visRow : 7 - visRow;
      const f = isFlipped ? 7 - visCol : visCol;
      const s = sq(r, f);

      const el = document.createElement("div");
      el.className = "sq " + ((r + f) % 2 === 0 ? "dark" : "light");
      el.dataset.sq = s;

      if (s === selectedSq) el.classList.add("selected");
      else if (lastMove && (s === lastMove.from || s === lastMove.to))
        el.classList.add("last-move");

      // Check highlight
      if (typeOf(board[s]) === K && colorOf(board[s]) === turn) {
        const opp = turn === WHITE ? BLACK : WHITE;
        const ks = kingSquare(board, turn);
        if (isAttacked(board, ks, opp)) el.classList.add("in-check");
      }

      if (selectedSq !== -1 && selectedSet.has(s)) {
        el.classList.add(captureSet.has(s) ? "can-capture" : "can-move");
      }

      if (board[s] !== EMPTY) {
        const span = document.createElement("span");
        span.className = "piece";
        span.innerHTML = PIECE_SVG[board[s]];
        el.appendChild(span);
      }

      el.addEventListener("click", () => handleClick(s));
      boardEl.appendChild(el);
    }
  }

  renderCoords(isFlipped);
  renderCaptured();
  renderMoveHistory();
}

function renderCoords(flipped) {
  const rankLabels = document.getElementById("rank-labels");
  const fileLabels = document.getElementById("file-labels");
  rankLabels.innerHTML = "";
  fileLabels.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const r = flipped ? i + 1 : 8 - i;
    const d = document.createElement("div");
    d.className = "coord coord-r";
    d.textContent = r;
    d.style.height = "60px";
    d.style.display = "flex";
    d.style.alignItems = "center";
    rankLabels.appendChild(d);
  }

  for (let i = 0; i < 8; i++) {
    const f = flipped ? 7 - i : i;
    const d = document.createElement("div");
    d.className = "coord";
    d.textContent = FILES[f];
    fileLabels.appendChild(d);
  }
}

function renderCaptured() {
  document.getElementById("cap-by-player").textContent = capturedByPlayer
    .map((p) => PIECE_CHAR[p])
    .join("");
  document.getElementById("cap-by-ai").textContent = capturedByAI
    .map((p) => PIECE_CHAR[p])
    .join("");
}

function renderMoveHistory() {
  const el = document.getElementById("moves-list");
  el.innerHTML = "";
  for (let i = 0; i < moveHistory.length; i += 2) {
    const num = document.createElement("div");
    num.className = "move-num";
    num.textContent = i / 2 + 1 + ".";
    el.appendChild(num);
    const w = document.createElement("div");
    w.className =
      "move-entry" + (i === moveHistory.length - 1 ? " current" : "");
    w.textContent = moveHistory[i];
    el.appendChild(w);
    if (i + 1 < moveHistory.length) {
      const b = document.createElement("div");
      b.className =
        "move-entry" + (i + 1 === moveHistory.length - 1 ? " current" : "");
      b.textContent = moveHistory[i + 1];
      el.appendChild(b);
    }
  }
  el.scrollTop = el.scrollHeight;
}

function updateStatus() {
  const opp = turn === WHITE ? BLACK : WHITE;
  const ks = kingSquare(board, turn);
  const inCheck = isAttacked(board, ks, opp);
  const legal = legalMovesFor(board, turn, enPassant, castling);
  const titleEl = document.getElementById("status-title");
  const textEl = document.getElementById("status-text");

  if (legal.length === 0) {
    gameOver = true;
    if (inCheck) {
      const winner = turn === WHITE ? "Black" : "White";
      titleEl.textContent = "Checkmate!";
      textEl.textContent = winner + " wins.";
      showResult("Checkmate", winner + " wins by checkmate.");
    } else {
      titleEl.textContent = "Stalemate";
      textEl.textContent = "Draw — no legal moves.";
      showResult("Stalemate", "The game is a draw.");
    }
    return;
  }

  if (inCheck) {
    titleEl.textContent = (turn === WHITE ? "White" : "Black") + " — Check!";
    textEl.textContent = "Your king is under attack.";
  } else {
    const who = turn === playerColor ? "Your turn" : "AI's turn";
    titleEl.textContent = (turn === WHITE ? "White" : "Black") + " to move";
    textEl.textContent = who + ".";
  }
}

function showResult(title, desc) {
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-desc").textContent = desc;
  document.getElementById("result-overlay").classList.add("active");
}

// ═══════════════════════════════════════════════════════════════
//  CLICK HANDLING
// ═══════════════════════════════════════════════════════════════
function handleClick(s) {
  if (gameOver || aiThinking || turn !== playerColor) return;

  // If a square is already selected, try to move
  if (selectedSq !== -1) {
    const move = legalMoves.find((m) => m.to === s);
    if (move) {
      executeMove(move, playerColor);
      return;
    }
  }

  // Select a piece of player's color
  if (colorOf(board[s]) === playerColor) {
    selectedSq = s;
    legalMoves = legalMovesFor(board, turn, enPassant, castling).filter(
      (m) => m.from === s,
    );
    renderBoard();
  } else {
    selectedSq = -1;
    legalMoves = [];
    renderBoard();
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXECUTE A MOVE
// ═══════════════════════════════════════════════════════════════
function executeMove(m, clr) {
  const san = toSAN(board, m, clr, enPassant, castling);
  const captured = m.ep ? (clr === WHITE ? BLACK | P : WHITE | P) : board[m.to];

  if (captured !== EMPTY) {
    if (clr === playerColor) capturedByPlayer.push(captured);
    else capturedByAI.push(captured);
  }

  const { nb, nep, nc } = applyMove(board, m, clr, castling);
  board = nb;
  enPassant = nep;
  castling = nc;
  halfMove = typeOf(nb[m.to]) === P || captured !== EMPTY ? 0 : halfMove + 1;
  if (clr === BLACK) fullMove++;

  lastMove = { from: m.from, to: m.to };
  turn = clr === WHITE ? BLACK : WHITE;
  selectedSq = -1;
  legalMoves = [];
  moveHistory.push(san);

  renderBoard();
  updateStatus();

  if (!gameOver && turn !== playerColor) {
    scheduleAI();
  }
}

// ═══════════════════════════════════════════════════════════════
//  AI TURN
// ═══════════════════════════════════════════════════════════════
function scheduleAI() {
  aiThinking = true;
  document.getElementById("thinking-indicator").classList.add("active");
  // Use setTimeout to yield to browser for re-render
  setTimeout(() => {
    const aiColor = playerColor === WHITE ? BLACK : WHITE;
    const move = findBestMove(board, aiColor, enPassant, castling);
    document.getElementById("thinking-indicator").classList.remove("active");
    aiThinking = false;
    if (move) executeMove(move, aiColor);
  }, 30);
}

// ═══════════════════════════════════════════════════════════════
//  GAME CONTROL
// ═══════════════════════════════════════════════════════════════
function startGame(color) {
  playerColor = color === "white" ? WHITE : BLACK;
  document.getElementById("color-picker").style.display = "none";
  document.getElementById("game").classList.add("active");
  initState();
  renderBoard();
  updateStatus();

  // AI moves first if player chose black
  if (playerColor === BLACK) scheduleAI();
}

function newGame() {
  document.getElementById("result-overlay").classList.remove("active");
  document.getElementById("game").classList.remove("active");
  document.getElementById("color-picker").style.display = "block";
}
