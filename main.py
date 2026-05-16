from game.board import display_board
from game.game import Game


def main():
    game = Game()
    display_board(game.board)

    while True:
        winner = game.get_winner()
        if winner:
            print(f"\n{winner} wins!")
            break

        current_pieces = game.get_current_pieces()
        turn_name = "BEIGE" if game.turn == 1 else "BLACK"
        print(f"\n{turn_name}'s turn")

        all_moves = [(piece, game.get_valid_moves(piece)) for piece in current_pieces if game.get_valid_moves(piece)]
        has_capture = any(len(moves) > 0 and len(moves[0]) == 4 for _, moves in all_moves)
        movable = [(piece, moves) for piece, moves in all_moves if not has_capture or (moves and len(moves[0]) == 4)]
        for i, (piece, moves) in enumerate(movable):
            print(f"  [{i}] Piece at ({piece.row}, {piece.col}) -> {moves}")

        try:
            piece_index = int(input("\nSelect piece index: "))
            piece, moves = movable[piece_index]

            move_index = int(input(f"Select move index (0-{len(moves)-1}): "))
            move = moves[move_index]

            game.make_move(piece, move)
            display_board(game.board)

        except (ValueError, IndexError):
            print("Invalid input, try again.")


if __name__ == "__main__":
    main()
