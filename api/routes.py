from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from game.game import Game
from db.supabase import get_google_oauth_url, get_user, save_game, get_game_history

router = APIRouter()

games: dict[str, Game] = {}


class MoveRequest(BaseModel):
    piece_row: int
    piece_col: int
    to_row: int
    to_col: int
    user_id: str = None


@router.post("/game/new")
def new_game(game_id: str):
    games[game_id] = Game()
    return {"game_id": game_id, "board": games[game_id].board, "turn": games[game_id].turn}


@router.get("/game/{game_id}/board")
def get_board(game_id: str):
    game = _get_game(game_id)
    return {
        "board": game.board,
        "turn": game.turn,
        "winner": game.get_winner()
    }


@router.get("/game/{game_id}/valid-moves")
def get_valid_moves(game_id: str, row: int, col: int):
    game = _get_game(game_id)
    current_pieces = game.get_current_pieces()
    piece = next((p for p in current_pieces if p.row == row and p.col == col), None)
    if not piece:
        raise HTTPException(status_code=400, detail="No valid piece at that position")
    moves = game.get_valid_moves(piece)
    return {"moves": moves}


@router.post("/game/{game_id}/move")
def make_move(game_id: str, body: MoveRequest):
    game = _get_game(game_id)
    current_pieces = game.get_current_pieces()
    piece = next((p for p in current_pieces if p.row == body.piece_row and p.col == body.piece_col), None)
    if not piece:
        raise HTTPException(status_code=400, detail="No valid piece at that position")

    moves = game.get_valid_moves(piece)
    move = next((m for m in moves if m[0] == body.to_row and m[1] == body.to_col), None)
    if not move:
        raise HTTPException(status_code=400, detail="Invalid move")

    game.make_move(piece, move)
    winner = game.get_winner()

    if winner:
        save_game(
            player1_id=body.user_id or game_id,
            winner=winner,
            moves=game.move_history,
        )

    return {
        "board": game.board,
        "turn": game.turn,
        "winner": winner
    }


@router.get("/user/{user_id}/history")
def user_history(user_id: str):
    result = get_game_history(user_id)
    return {"games": result.data}


@router.get("/auth/login")
def login(redirect_url: str = "http://localhost:5500"):
    url = get_google_oauth_url(redirect_url)
    return {"url": url}


@router.get("/auth/me")
def me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": user.user}


def _get_game(game_id: str) -> Game:
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    return games[game_id]
