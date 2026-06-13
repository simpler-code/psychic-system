// ═══════════════════════════════════════════════════════════════
//  CHESS BEAST — Shared Chess Engine
//  Minimax + Alpha-Beta + Quiescence, ~2100 ELO
//  ═══════════════════════════════════════════════════════════════

"use strict";

// ─── Piece Constants ───
const EMPTY = 0;
const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6;
const WHITE = 8, BLACK = 16;

// ─── SVG Piece Renderer ───
const PIECE_SVG = (() => {
    const W_FILL = "#f0e9d2", W_STROKE = "#2c1a0e";
    const B_FILL = "#2c2016", B_STROKE = "#f0e9d2";

    function piece(fill, stroke, paths) {
        return `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
    }
    function pawn(f, s) {
        return piece(f, s, `<path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,14.755 19.077,16.261 20.601,16.829 C 19.38,18.034 18.5,20 18.5,22 L 26.5,22 C 26.5,20 25.62,18.034 24.399,16.829 C 25.923,16.261 27,14.755 27,13 C 27,10.79 25.21,9 23,9 Z"/><path d="M 15,32 C 15,30 16.5,28 18.5,27 L 26.5,27 C 28.5,28 30,30 30,32 L 15,32 Z"/><rect x="12" y="32" width="21" height="3.5" rx="2"/><rect x="11" y="35.5" width="23" height="3" rx="1.5"/>`);
    }
    function knight(f, s) {
        const accent = f === W_FILL ? W_STROKE : W_FILL;
        return piece(f, s, `<path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 Z"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10 Z"/><circle cx="22.5" cy="7.5" r="1.5" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>`);
    }
    function bishop(f, s) {
        const accent = f === W_FILL ? W_STROKE : W_FILL;
        return piece(f, s, `<path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 L 36,37.5 C 32.61,36.53 25.89,37.93 22.5,35.5 C 19.11,37.93 12.39,36.53 9,37.5 Z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 L 30,30 C 27.5,32.5 17.5,32.5 15,30 Z"/><path d="M 22.5,6 C 19,6 17,10 18,14 L 18,30 L 27,30 L 27,14 C 28,10 26,6 22.5,6 Z"/><circle cx="22.5" cy="7.5" r="1.5" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>`);
    }
    function rook(f, s) {
        return piece(f, s, `<path d="M 9,39 L 36,39 L 36,36 L 9,36 Z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 Z"/><path d="M 11,32 L 11,10 L 14,10 L 14,12 L 18.5,12 L 18.5,10 L 26.5,10 L 26.5,12 L 31,12 L 31,10 L 34,10 L 34,32 Z"/>`);
    }
    function queen(f, s) {
        const accent = f === W_FILL ? W_STROKE : W_FILL;
        return piece(f, s, `<path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 29.5,12.5 L 22.5,25 L 15.5,12.5 L 14,25 L 7,14 Z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 14.5,34.5 18.5,35.5 22.5,35.5 C 26.5,35.5 30.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 Z"/><circle cx="6" cy="12" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/><circle cx="14" cy="9" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/><circle cx="22.5" cy="8" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/><circle cx="31" cy="9" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/><circle cx="39" cy="12" r="2" fill="${accent}" stroke="${accent}" stroke-width="0.5"/>`);
    }
    function king(f, s) {
        return piece(f, s, `<path d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8" stroke-width="1.5"/><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 Z"/><path d="M 12.5,37 C 13,31.5 14.5,30.5 14.5,30.5 C 14.5,30.5 14,28 14,26.5 C 14,25 14.5,24 15.5,23.5 C 16.5,23 18,22.5 22.5,22.5 C 27,22.5 28.5,23 29.5,23.5 C 30.5,24 31,25 31,26.5 C 31,28 30.5,30.5 30.5,30.5 C 30.5,30.5 32,31.5 32.5,37 Z"/><path d="M 11.5,37 L 32.5,37 L 33.5,39 L 11.5,39 Z"/>`);
    }
    const builders = { [P]: pawn, [N]: knight, [B]: bishop, [R]: rook, [Q]: queen, [K]: king };
    const cache = {};
    for (const clr of [WHITE, BLACK]) {
        const f = clr === WHITE ? W_FILL : B_FILL;
        const s = clr === WHITE ? W_STROKE : B_STROKE;
        for (const [pt, fn] of Object.entries(builders)) cache[clr | +pt] = fn(f, s);
    }
    return cache;
})();

const PIECE_CHAR = {
    [WHITE|P]: "\u2659", [WHITE|N]: "\u2658", [WHITE|B]: "\u2657",
    [WHITE|R]: "\u2656", [WHITE|Q]: "\u2655", [WHITE|K]: "\u2654",
    [BLACK|P]: "\u265F", [BLACK|N]: "\u265E", [BLACK|B]: "\u265D",
    [BLACK|R]: "\u265C", [BLACK|Q]: "\u265B", [BLACK|K]: "\u265A",
};

const typeOf = sq => sq & 7;
const colorOf = sq => sq & 24;

const VALUE = { [P]: 100, [N]: 320, [B]: 330, [R]: 500, [Q]: 900, [K]: 20000 };

const PST = {
    [P]: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
    [N]: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
    [B]: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
    [R]: [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
    [Q]: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
    [K]: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20],
};

const KING_END = [-50,-40,-30,-20,-20,-30,-40,-50,-30,-20,-10,0,0,-10,-20,-30,-30,-10,20,30,30,20,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,30,40,40,30,-10,-30,-30,-10,20,30,30,20,-10,-30,-30,-30,0,0,0,0,-30,-30,-50,-30,-30,-30,-30,-30,-30,-50];

// ─── Game State ───
let board, turn, playerColor, castling, enPassant, halfMove, fullMove;
let selectedSq, legalMoves, lastMove, capturedByPlayer, capturedByAI, moveHistory;
let gameOver, aiThinking;

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
        board[0*8+f] = WHITE | back[f];
        board[1*8+f] = WHITE | P;
        board[6*8+f] = BLACK | P;
        board[7*8+f] = BLACK | back[f];
    }
}

function rankOf(s) { return s >> 3; }
function fileOf(s) { return s & 7; }
function sq(r, f) { return r*8+f; }
function inBounds(r, f) { return r>=0 && r<8 && f>=0 && f<8; }

// ─── Move Generation ───
function pseudoMoves(b, clr, ep, cas) {
    const moves = [];
    const opp = clr === WHITE ? BLACK : WHITE;
    for (let s = 0; s < 64; s++) {
        if (colorOf(b[s]) !== clr) continue;
        const t = typeOf(b[s]), r = rankOf(s), f = fileOf(s);
        if (t === P) {
            const dir = clr === WHITE ? 1 : -1;
            const startRank = clr === WHITE ? 1 : 6;
            const promRank = clr === WHITE ? 7 : 0;
            if (inBounds(r+dir, f) && b[sq(r+dir, f)] === EMPTY) {
                if (r+dir === promRank) for (const pt of [Q, R, B, N]) moves.push({ from: s, to: sq(r+dir, f), prom: pt });
                else {
                    moves.push({ from: s, to: sq(r+dir, f) });
                    if (r === startRank && b[sq(r+2*dir, f)] === EMPTY) moves.push({ from: s, to: sq(r+2*dir, f) });
                }
            }
            for (const df of [-1, 1]) {
                if (!inBounds(r+dir, f+df)) continue;
                const ts = sq(r+dir, f+df);
                if (colorOf(b[ts]) === opp) {
                    if (r+dir === promRank) for (const pt of [Q, R, B, N]) moves.push({ from: s, to: ts, prom: pt });
                    else moves.push({ from: s, to: ts });
                } else if (ts === ep) moves.push({ from: s, to: ts, ep: true });
            }
        } else if (t === N) {
            for (const [dr, df] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
                if (!inBounds(r+dr, f+df)) continue;
                const ts = sq(r+dr, f+df);
                if (colorOf(b[ts]) !== clr) moves.push({ from: s, to: ts });
            }
        } else if (t === B || t === Q) {
            for (const [dr, df] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
                for (let i = 1; i < 8; i++) {
                    if (!inBounds(r+dr*i, f+df*i)) break;
                    const ts = sq(r+dr*i, f+df*i);
                    if (colorOf(b[ts]) === clr) break;
                    moves.push({ from: s, to: ts });
                    if (b[ts] !== EMPTY) break;
                }
            }
            if (t === B) continue;
        }
        if (t === R || t === Q) {
            for (const [dr, df] of [[-1,0],[1,0],[0,-1],[0,1]]) {
                for (let i = 1; i < 8; i++) {
                    if (!inBounds(r+dr*i, f+df*i)) break;
                    const ts = sq(r+dr*i, f+df*i);
                    if (colorOf(b[ts]) === clr) break;
                    moves.push({ from: s, to: ts });
                    if (b[ts] !== EMPTY) break;
                }
            }
        } else if (t === K) {
            for (const [dr, df] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
                if (!inBounds(r+dr, f+df)) continue;
                const ts = sq(r+dr, f+df);
                if (colorOf(b[ts]) !== clr) moves.push({ from: s, to: ts });
            }
            // Castling
            if (clr === WHITE && r === 0 && f === 4) {
                if (cas.wK && b[sq(0,5)]===EMPTY && b[sq(0,6)]===EMPTY && typeOf(b[sq(0,7)])===R) moves.push({ from: s, to: sq(0,6), castle: "K" });
                if (cas.wQ && b[sq(0,3)]===EMPTY && b[sq(0,2)]===EMPTY && b[sq(0,1)]===EMPTY && typeOf(b[sq(0,0)])===R) moves.push({ from: s, to: sq(0,2), castle: "Q" });
            }
            if (clr === BLACK && r === 7 && f === 4) {
                if (cas.bK && b[sq(7,5)]===EMPTY && b[sq(7,6)]===EMPTY && typeOf(b[sq(7,7)])===R) moves.push({ from: s, to: sq(7,6), castle: "K" });
                if (cas.bQ && b[sq(7,3)]===EMPTY && b[sq(7,2)]===EMPTY && b[sq(7,1)]===EMPTY && typeOf(b[sq(7,0)])===R) moves.push({ from: s, to: sq(7,2), castle: "Q" });
            }
        }
    }
    return moves;
}

function isAttacked(b, s, attacker) {
    const pseudo = pseudoMoves(b, attacker, -1, { wK: false, wQ: false, bK: false, bQ: false });
    return pseudo.some(m => m.to === s && !m.castle);
}

function kingSquare(b, clr) {
    for (let s = 0; s < 64; s++) if (b[s] === (clr|K)) return s;
    return -1;
}

function applyMove(b, m, clr, cas) {
    const nb = new Int8Array(b);
    const opp = clr === WHITE ? BLACK : WHITE;
    let nep = -1;
    const nc = { ...cas };
    const pt = typeOf(nb[m.from]);

    if (m.ep) {
        const capR = rankOf(m.from);
        nb[sq(capR, fileOf(m.to))] = EMPTY;
    }
    if (m.castle) {
        const rr = rankOf(m.from);
        if (m.castle === "K") { nb[sq(rr, 5)] = nb[sq(rr, 7)]; nb[sq(rr, 7)] = EMPTY; }
        else { nb[sq(rr, 3)] = nb[sq(rr, 0)]; nb[sq(rr, 0)] = EMPTY; }
    }
    nb[m.to] = m.prom ? clr | m.prom : nb[m.from];
    nb[m.from] = EMPTY;

    if (pt === P && Math.abs(rankOf(m.to) - rankOf(m.from)) === 2) {
        nep = sq((rankOf(m.from) + rankOf(m.to)) >> 1, fileOf(m.from));
    }
    if (pt === K) {
        if (clr === WHITE) { nc.wK = false; nc.wQ = false; }
        else { nc.bK = false; nc.bQ = false; }
    }
    if (pt === R) {
        if (m.from === sq(0, 7)) nc.wK = false;
        if (m.from === sq(0, 0)) nc.wQ = false;
        if (m.from === sq(7, 7)) nc.bK = false;
        if (m.from === sq(7, 0)) nc.bQ = false;
    }
    if (typeOf(nb[m.to]) === R) {
        if (m.to === sq(0, 7)) nc.wK = false;
        if (m.to === sq(0, 0)) nc.wQ = false;
        if (m.to === sq(7, 7)) nc.bK = false;
        if (m.to === sq(7, 0)) nc.bQ = false;
    }
    return { nb, nep, nc };
}

function legalMovesFor(b, clr, ep, cas) {
    const pseudo = pseudoMoves(b, clr, ep, cas);
    return pseudo.filter(m => {
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

// ─── Evaluation ───
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
        const t = typeOf(p), clr = colorOf(p);
        const r = rankOf(s), f = fileOf(s);
        const pstIdx = clr === WHITE ? r*8+f : (7-r)*8+f;
        const pst = t === K && eg ? KING_END : PST[t];
        const val = VALUE[t] + (pst ? pst[pstIdx] : 0);
        score += clr === WHITE ? val : -val;
    }
    return score;
}

function moveScore(b, m) {
    let s = 0;
    if (b[m.to] !== EMPTY) s += 10 * VALUE[typeOf(b[m.to])] - VALUE[typeOf(b[m.from])];
    if (m.prom) s += VALUE[m.prom] * 10;
    if (m.ep) s += VALUE[P] * 10;
    return s;
}

// ─── Search ───
const INF = 999999;

function quiesce(b, clr, ep, cas, alpha, beta) {
    const stand = clr === WHITE ? evaluate(b) : -evaluate(b);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    const moves = pseudoMoves(b, clr, ep, cas).filter(m => b[m.to] !== EMPTY || m.ep || m.prom).sort((a, z) => moveScore(b, z) - moveScore(b, a));
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
    const moves = legalMovesFor(b, clr, ep, cas).sort((a, z) => moveScore(b, z) - moveScore(b, a));
    if (moves.length === 0) {
        const ks = kingSquare(b, clr);
        if (isAttacked(b, ks, opp)) return -INF + (10 - depth);
        return 0;
    }
    for (const m of moves) {
        const { nb, nep, nc } = applyMove(b, m, clr, cas);
        const score = -alphaBeta(nb, opp, nep, nc, depth - 1, -beta, -alpha);
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

function findBestMove(b, clr, ep, cas) {
    const opp = clr === WHITE ? BLACK : WHITE;
    const moves = legalMovesFor(b, clr, ep, cas).sort((a, z) => moveScore(b, z) - moveScore(b, a));
    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0];
    const MAX_DEPTH = 4;
    let best = moves[0];
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        let alpha = -INF, localBest = moves[0];
        for (const m of moves) {
            const { nb, nep, nc } = applyMove(b, m, clr, cas);
            const score = -alphaBeta(nb, opp, nep, nc, depth - 1, -INF, -alpha);
            if (score > alpha) { alpha = score; localBest = m; }
        }
        best = localBest;
    }
    return best;
}

// ─── SAN Notation ───
const FILES = "abcdefgh";
const sqName = s => FILES[fileOf(s)] + (rankOf(s) + 1);

function toSAN(b, m, clr, ep, cas) {
    if (m.castle) return m.castle === "K" ? "O-O" : "O-O-O";
    const pt = typeOf(b[m.from]);
    const capture = b[m.to] !== EMPTY || m.ep;
    const prefix = pt === P ? (capture ? FILES[fileOf(m.from)] : "") : "NBRQK"[pt - 2];
    const { nb, nep, nc } = applyMove(b, m, clr, cas);
    const opp = clr === WHITE ? BLACK : WHITE;
    const oppLegal = legalMovesFor(nb, opp, nep, nc);
    const ks = kingSquare(nb, opp);
    const inCh = isAttacked(nb, ks, clr);
    const suffix = inCh ? (oppLegal.length === 0 ? "#" : "+") : "";
    const prom = m.prom ? "=" + "NBRQ"[m.prom - 2] : "";
    return prefix + (capture ? "x" : "") + sqName(m.to) + prom + suffix;
}

// ─── UI Rendering ───
function renderBoard(boardElId = "board") {
    const boardEl = document.getElementById(boardElId);
    if (!boardEl) return;
    boardEl.innerHTML = "";
    const isFlipped = playerColor === BLACK;
    const selectedSet = new Set(legalMoves.map(m => m.to));
    const captureSet = new Set(legalMoves.filter(m => board[m.to] !== EMPTY || m.ep).map(m => m.to));

    for (let visRow = 0; visRow < 8; visRow++) {
        for (let visCol = 0; visCol < 8; visCol++) {
            const r = isFlipped ? visRow : 7 - visRow;
            const f = isFlipped ? 7 - visCol : visCol;
            const s = sq(r, f);
            const el = document.createElement("div");
            el.className = "sq " + ((r + f) % 2 === 0 ? "dark" : "light");
            el.dataset.sq = s;
            if (s === selectedSq) el.classList.add("selected");
            else if (lastMove && (s === lastMove.from || s === lastMove.to)) el.classList.add("last-move");
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
    if (!rankLabels || !fileLabels) return;
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
    const capPlayer = document.getElementById("cap-by-player");
    const capAI = document.getElementById("cap-by-ai");
    if (capPlayer) capPlayer.textContent = capturedByPlayer.map(p => PIECE_CHAR[p]).join("");
    if (capAI) capAI.textContent = capturedByAI.map(p => PIECE_CHAR[p]).join("");
}

function renderMoveHistory() {
    const el = document.getElementById("moves-list");
    if (!el) return;
    el.innerHTML = "";
    for (let i = 0; i < moveHistory.length; i += 2) {
        const num = document.createElement("div");
        num.className = "move-num";
        num.textContent = (i / 2 + 1) + ".";
        el.appendChild(num);
        const w = document.createElement("div");
        w.className = "move-entry" + (i === moveHistory.length - 1 ? " current" : "");
        w.textContent = moveHistory[i];
        el.appendChild(w);
        if (i + 1 < moveHistory.length) {
            const b = document.createElement("div");
            b.className = "move-entry" + (i + 1 === moveHistory.length - 1 ? " current" : "");
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
    if (!titleEl || !textEl) return;

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
    const rt = document.getElementById("result-title");
    const rd = document.getElementById("result-desc");
    const ro = document.getElementById("result-overlay");
    if (rt) rt.textContent = title;
    if (rd) rd.textContent = desc;
    if (ro) ro.classList.add("active");
}

// ─── Click Handling ───
function handleClick(s) {
    if (gameOver || aiThinking || turn !== playerColor) return;
    if (selectedSq !== -1) {
        const move = legalMoves.find(m => m.to === s);
        if (move) { executeMove(move, playerColor); return; }
    }
    if (colorOf(board[s]) === playerColor) {
        selectedSq = s;
        legalMoves = legalMovesFor(board, turn, enPassant, castling).filter(m => m.from === s);
        renderBoard();
    } else {
        selectedSq = -1;
        legalMoves = [];
        renderBoard();
    }
}

// ─── Execute Move ───
function executeMove(m, clr) {
    const san = toSAN(board, m, clr, enPassant, castling);
    const captured = m.ep ? (clr === WHITE ? BLACK | P : WHITE | P) : board[m.to];
    if (captured !== EMPTY) {
        if (clr === playerColor) capturedByPlayer.push(captured);
        else capturedByAI.push(captured);
    }
    const result = applyMove(board, m, clr, castling);
    board = result.nb;
    enPassant = result.nep;
    castling = result.nc;
    halfMove = typeOf(result.nb[m.to]) === P || captured !== EMPTY ? 0 : halfMove + 1;
    if (clr === BLACK) fullMove++;
    lastMove = { from: m.from, to: m.to };
    turn = clr === WHITE ? BLACK : WHITE;
    selectedSq = -1;
    legalMoves = [];
    moveHistory.push(san);
    renderBoard();
    updateStatus();
    if (!gameOver && turn !== playerColor) scheduleAI();
}

// ─── AI Turn ───
function scheduleAI() {
    aiThinking = true;
    const ind = document.getElementById("thinking-indicator");
    if (ind) ind.classList.add("active");
    setTimeout(() => {
        const aiColor = playerColor === WHITE ? BLACK : WHITE;
        const move = findBestMove(board, aiColor, enPassant, castling);
        if (ind) ind.classList.remove("active");
        aiThinking = false;
        if (move) executeMove(move, aiColor);
    }, 30);
}

// ─── Game Control ───
function startGame(color) {
    playerColor = color === "white" ? WHITE : BLACK;
    const cp = document.getElementById("color-picker");
    const gm = document.getElementById("game");
    if (cp) cp.style.display = "none";
    if (gm) gm.classList.add("active");
    initState();
    renderBoard();
    updateStatus();
    if (playerColor === BLACK) scheduleAI();
}

function newGame() {
    const ro = document.getElementById("result-overlay");
    const gm = document.getElementById("game");
    const cp = document.getElementById("color-picker");
    if (ro) ro.classList.remove("active");
    if (gm) gm.classList.remove("active");
    if (cp) cp.style.display = "block";
}

// Export for puzzle usage
if (typeof window !== "undefined") {
    window.ChessEngine = {
        initState, setStartingPosition, renderBoard, startGame, newGame,
        board: () => board, turn: () => turn, playerColor: () => playerColor,
        legalMovesFor, executeMove, sq, rankOf, fileOf, typeOf, colorOf,
        WHITE, BLACK, P, N, B, R, Q, K, EMPTY, PIECE_SVG, PIECE_CHAR, FILES
    };
}
