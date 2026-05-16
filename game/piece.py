from game.board import BEIGE, BEIGE_KING, BLACK_KING


class Piece:
    def __init__(self, row, col, color):
        self.row = row
        self.col = col
        self.color = color
        self.is_king = False

    def promote(self):
        self.is_king = True
        self.color = BEIGE_KING if self.color == BEIGE else BLACK_KING

    def __repr__(self):
        color_name = "BEIGE" if self.color in (BEIGE, BEIGE_KING) else "BLACK"
        king = " KING" if self.is_king else ""
        return f"Piece({color_name}{king} at ({self.row}, {self.col}))"
