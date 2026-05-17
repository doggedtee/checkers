import copy
from game.board import create_board, BEIGE, BLACK
from game.piece import Piece
from game.moves import get_moves
from game.rules import check_promotion, check_winner


class Game:
    def __init__(self):
        self.board = create_board()
        self.turn = BEIGE
        self.beige_pieces = []
        self.black_pieces = []
        self.move_history = []
        self.pending_piece = None
        self._undo_stack = []
        self._setup_pieces()

    def _snapshot(self):
        return {
            "board": [row[:] for row in self.board],
            "turn": self.turn,
            "beige_pieces": copy.deepcopy(self.beige_pieces),
            "black_pieces": copy.deepcopy(self.black_pieces),
            "move_history": list(self.move_history),
            "pending_piece": copy.deepcopy(self.pending_piece),
        }

    def _restore(self, snap):
        self.board = [row[:] for row in snap["board"]]
        self.turn = snap["turn"]
        self.beige_pieces = copy.deepcopy(snap["beige_pieces"])
        self.black_pieces = copy.deepcopy(snap["black_pieces"])
        self.move_history = list(snap["move_history"])
        self.pending_piece = copy.deepcopy(snap["pending_piece"])

    def undo(self, steps=1):
        for _ in range(steps):
            if not self._undo_stack:
                return False
            self._restore(self._undo_stack.pop())
        return True

    def _setup_pieces(self):
        for row in range(8):
            for col in range(8):
                if self.board[row][col] == BEIGE:
                    self.beige_pieces.append(Piece(row, col, BEIGE))
                elif self.board[row][col] == BLACK:
                    self.black_pieces.append(Piece(row, col, BLACK))

    def get_valid_moves(self, piece):
        return get_moves(piece, self.board)

    def make_move(self, piece, move):
        # Only snapshot at the start of a fresh turn (not during multi-capture chains)
        if not self.pending_piece:
            self._undo_stack.append(self._snapshot())
        was_capture = len(move) == 4
        if was_capture:
            to_row, to_col, cap_row, cap_col = move
            self._remove_piece(cap_row, cap_col)
        else:
            to_row, to_col = move

        self.move_history.append({"from": [piece.row, piece.col], "to": [to_row, to_col], "capture": was_capture})
        self.board[piece.row][piece.col] = 0
        piece.row = to_row
        piece.col = to_col
        self.board[to_row][to_col] = piece.color

        check_promotion(piece, self.board)

        if was_capture:
            next_captures = [m for m in get_moves(piece, self.board) if len(m) == 4]
            if next_captures:
                self.pending_piece = piece
                return

        self.pending_piece = None
        self._switch_turn()

    def get_current_pieces(self):
        if hasattr(self, 'pending_piece') and self.pending_piece:
            return [self.pending_piece]
        return self.beige_pieces if self.turn == BEIGE else self.black_pieces

    def _remove_piece(self, row, col):
        self.board[row][col] = 0
        self.beige_pieces = [p for p in self.beige_pieces if not (p.row == row and p.col == col)]
        self.black_pieces = [p for p in self.black_pieces if not (p.row == row and p.col == col)]

    def _switch_turn(self):
        self.turn = BLACK if self.turn == BEIGE else BEIGE

    def get_winner(self):
        return check_winner(self.beige_pieces, self.black_pieces, self.board)
