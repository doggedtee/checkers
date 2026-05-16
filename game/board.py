EMPTY = 0
BEIGE = 1
BLACK = 2
BEIGE_KING = 3
BLACK_KING = 4

ROWS = 8
COLS = 8


def create_board():
    board = [[EMPTY] * COLS for _ in range(ROWS)]

    for row in range(3):
        for col in range(COLS):
            if (row + col) % 2 == 1:
                board[row][col] = BEIGE

    for row in range(5, 8):
        for col in range(COLS):
            if (row + col) % 2 == 1:
                board[row][col] = BLACK

    return board


def display_board(board):
    symbols = {
        EMPTY: ".",
        BEIGE: "g",
        BLACK: "b",
        BEIGE_KING: "G",
        BLACK_KING: "B",
    }
    print("  " + " ".join(str(c) for c in range(COLS)))
    for row in range(ROWS):
        print(str(row) + " " + " ".join(symbols[cell] for cell in board[row]))

b = create_board()
print(b)
