import random
from game.board import EMPTY, BEIGE, BLACK, BEIGE_KING, BLACK_KING
from game.piece import Piece
from game.moves import get_moves

PAWN_VALUE = 1.0
KING_VALUE = 2.0
INF = 10**9


def get_strategy(difficulty: int) -> dict:
    if difficulty < 500:
        return {"mode": "random", "depth": 0, "blunder": 0.0}
    if difficulty < 1000:
        return {"mode": "minimax", "depth": 2, "blunder": 0.15}
    if difficulty < 1500:
        return {"mode": "minimax", "depth": 4, "blunder": 0.05}
    return {"mode": "minimax", "depth": 6, "blunder": 0.0}


def choose_move(game, difficulty: int):
    strategy = get_strategy(difficulty)
    board = game.board
    pending_pos = None
    if getattr(game, "pending_piece", None):
        pending_pos = (game.pending_piece.row, game.pending_piece.col)

    moves = _gen_moves(board, game.turn, pending_pos)
    if not moves:
        return None

    if strategy["mode"] == "random":
        from_r, from_c, m = random.choice(moves)
        return _find_piece(game, from_r, from_c), m

    scored = []
    for from_r, from_c, m in moves:
        new_board, can_continue, new_pos = _apply(board, from_r, from_c, m)
        next_player = game.turn if can_continue else _other(game.turn)
        next_pending = new_pos if can_continue else None
        score = _minimax(new_board, next_player, next_pending, strategy["depth"] - 1, -INF, INF)
        scored.append((score, from_r, from_c, m))

    scored.sort(key=lambda x: -x[0] if game.turn == BLACK else x[0])

    if strategy["blunder"] > 0 and len(scored) > 1 and random.random() < strategy["blunder"]:
        chosen = scored[1]
    else:
        chosen = scored[0]

    return _find_piece(game, chosen[1], chosen[2]), chosen[3]


def _minimax(board, player, pending_pos, depth, alpha, beta):
    if depth == 0:
        return _evaluate(board)

    moves = _gen_moves(board, player, pending_pos)
    if not moves:
        return -INF if player == BLACK else INF

    if player == BLACK:
        best = -INF
        for from_r, from_c, m in moves:
            new_board, can_continue, new_pos = _apply(board, from_r, from_c, m)
            next_player = BLACK if can_continue else BEIGE
            next_pending = new_pos if can_continue else None
            score = _minimax(new_board, next_player, next_pending, depth - 1, alpha, beta)
            if score > best:
                best = score
            if best > alpha:
                alpha = best
            if beta <= alpha:
                break
        return best
    else:
        best = INF
        for from_r, from_c, m in moves:
            new_board, can_continue, new_pos = _apply(board, from_r, from_c, m)
            next_player = BEIGE if can_continue else BLACK
            next_pending = new_pos if can_continue else None
            score = _minimax(new_board, next_player, next_pending, depth - 1, alpha, beta)
            if score < best:
                best = score
            if best < beta:
                beta = best
            if beta <= alpha:
                break
        return best


def _evaluate(board):
    score = 0.0
    for r in range(8):
        for c in range(8):
            cell = board[r][c]
            if cell == EMPTY:
                continue
            center = 3 <= r <= 4 and 2 <= c <= 5
            if cell == BLACK:
                score += PAWN_VALUE
                score += 0.1 * (7 - r)
                if r == 7:
                    score += 0.5
                if center:
                    score += 0.3
            elif cell == BLACK_KING:
                score += KING_VALUE
                if center:
                    score += 0.3
            elif cell == BEIGE:
                score -= PAWN_VALUE
                score -= 0.1 * r
                if r == 0:
                    score -= 0.5
                if center:
                    score -= 0.3
            elif cell == BEIGE_KING:
                score -= KING_VALUE
                if center:
                    score -= 0.3
    return score


def _gen_moves(board, player, pending_pos):
    if pending_pos:
        r, c = pending_pos
        piece = _piece_at(board, r, c)
        captures = [m for m in get_moves(piece, board) if len(m) == 4]
        return [(r, c, m) for m in captures]

    color_set = {BEIGE, BEIGE_KING} if player == BEIGE else {BLACK, BLACK_KING}
    out = []
    for r in range(8):
        for c in range(8):
            if board[r][c] in color_set:
                piece = _piece_at(board, r, c)
                for m in get_moves(piece, board):
                    out.append((r, c, m))

    captures = [t for t in out if len(t[2]) == 4]
    return captures if captures else out


def _apply(board, from_r, from_c, move):
    new_board = [row[:] for row in board]
    piece_val = new_board[from_r][from_c]
    was_capture = len(move) == 4

    if was_capture:
        to_r, to_c, cap_r, cap_c = move
        new_board[cap_r][cap_c] = EMPTY
    else:
        to_r, to_c = move

    new_board[from_r][from_c] = EMPTY

    if piece_val == BEIGE and to_r == 7:
        piece_val = BEIGE_KING
    elif piece_val == BLACK and to_r == 0:
        piece_val = BLACK_KING

    new_board[to_r][to_c] = piece_val

    can_continue = False
    if was_capture:
        piece = _piece_at(new_board, to_r, to_c)
        if any(len(m) == 4 for m in get_moves(piece, new_board)):
            can_continue = True

    return new_board, can_continue, (to_r, to_c)


def _piece_at(board, r, c):
    cell = board[r][c]
    p = Piece(r, c, cell)
    p.is_king = cell in (BEIGE_KING, BLACK_KING)
    return p


def _find_piece(game, row, col):
    return next((p for p in game.get_current_pieces() if p.row == row and p.col == col), None)


def _other(player):
    return BEIGE if player == BLACK else BLACK
