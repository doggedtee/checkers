from game.board import BEIGE, BEIGE_KING, BLACK, BLACK_KING
from game.moves import get_moves


def check_promotion(piece, board):
    if piece.color == BEIGE and piece.row == 7:
        piece.promote()
        board[piece.row][piece.col] = BEIGE_KING
    elif piece.color == BLACK and piece.row == 0:
        piece.promote()
        board[piece.row][piece.col] = BLACK_KING


def check_winner(beige_pieces, black_pieces, board):
    if not beige_pieces:
        return "BLACK"
    if not black_pieces:
        return "BEIGE"

    if not _has_any_moves(beige_pieces, board):
        return "BLACK"
    if not _has_any_moves(black_pieces, board):
        return "BEIGE"

    return None


def _has_any_moves(pieces, board):
    for piece in pieces:
        if get_moves(piece, board):
            return True
    return False
