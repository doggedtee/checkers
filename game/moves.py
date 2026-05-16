from game.board import EMPTY, BEIGE, BEIGE_KING


def get_moves(piece, board):
    moves = []
    captures = []

    directions = _get_directions(piece)

    for dr, dc in directions:
        r, c = piece.row + dr, piece.col + dc

        if not _in_bounds(r, c):
            continue

        if board[r][c] == EMPTY:
            moves.append((r, c))

        elif not _is_same_color(piece, board[r][c]):
            jump_r, jump_c = r + dr, c + dc
            if _in_bounds(jump_r, jump_c) and board[jump_r][jump_c] == EMPTY:
                captures.append((jump_r, jump_c, r, c))

    return captures if captures else moves


def _get_directions(piece):
    if piece.is_king:
        return [(-1, -1), (-1, 1), (1, -1), (1, 1)]
    elif piece.color == BEIGE or piece.color == BEIGE_KING:
        return [(1, -1), (1, 1)]
    else:
        return [(-1, -1), (-1, 1)]


def _in_bounds(row, col):
    return 0 <= row < 8 and 0 <= col < 8


def _is_same_color(piece, cell_value):
    beige_values = {1, 3}
    black_values = {2, 4}
    if piece.color in beige_values:
        return cell_value in beige_values
    return cell_value in black_values
