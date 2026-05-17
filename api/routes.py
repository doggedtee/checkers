from fastapi import APIRouter, HTTPException, Header, FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from game.game import Game
from game.bot import choose_move
from db.supabase import get_google_oauth_url, get_user, save_game, get_game_history, get_all_games_for_leaderboard

app = FastAPI()
router = APIRouter()

games: dict[str, Game] = {}


class MoveRequest(BaseModel):
    piece_row: int
    piece_col: int
    to_row: int
    to_col: int
    user_id: str = None
    region: str = None


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
            region=body.region,
        )

    return {
        "board": game.board,
        "turn": game.turn,
        "winner": winner
    }


class EndRequest(BaseModel):
    winner: str  # "BEIGE", "BLACK", or "DRAW"
    user_id: str = None
    region: str = None


@router.post("/game/{game_id}/end")
def end_game(game_id: str, body: EndRequest):
    game = _get_game(game_id)
    save_game(
        player1_id=body.user_id or game_id,
        winner=body.winner,
        moves=game.move_history,
        region=body.region,
    )
    return {"ok": True, "winner": body.winner}


@router.post("/game/{game_id}/undo")
def undo_move(game_id: str, steps: int = 1):
    game = _get_game(game_id)
    ok = game.undo(steps=steps)
    return {
        "ok": ok,
        "board": game.board,
        "turn": game.turn,
        "winner": game.get_winner(),
    }


@router.post("/game/{game_id}/bot-move")
def bot_move(game_id: str, difficulty: int = 800, user_id: str = None, region: str = None):
    game = _get_game(game_id)
    if game.get_winner():
        return {"board": game.board, "turn": game.turn, "winner": game.get_winner(), "moves": []}

    moves_played = []
    # keep going while it's the bot's turn (BLACK) — handles multi-capture chains
    while game.turn == 2 and not game.get_winner():
        result = choose_move(game, difficulty)
        if not result:
            break
        piece, move = result
        if not piece:
            break
        from_pos = [piece.row, piece.col]
        game.make_move(piece, move)
        to_pos = [move[0], move[1]]
        moves_played.append({"from": from_pos, "to": to_pos, "capture": len(move) == 4})

    winner = game.get_winner()
    if winner:
        save_game(
            player1_id=user_id or game_id,
            winner=winner,
            moves=game.move_history,
            region=region,
        )

    return {
        "board": game.board,
        "turn": game.turn,
        "winner": winner,
        "moves": moves_played,
    }


@router.get("/user/{user_id}/history")
def user_history(user_id: str):
    result = get_game_history(user_id)
    return {"games": result.data}


@router.get("/leaderboard")
def leaderboard(region: str = None):
    result = get_all_games_for_leaderboard(region=region)
    rows = result.data or []
    agg: dict[str, dict] = {}
    for row in rows:
        pid = row.get("player1_id")
        if not pid:
            continue
        entry = agg.setdefault(pid, {"player_id": pid, "wins": 0, "losses": 0, "total": 0})
        entry["total"] += 1
        if row.get("winner") == "BEIGE":
            entry["wins"] += 1
        else:
            entry["losses"] += 1
    players = []
    for entry in agg.values():
        rate = round((entry["wins"] / entry["total"]) * 100) if entry["total"] else 0
        score = entry["wins"] * 25 + entry["total"] * 4
        players.append({
            "player_id": entry["player_id"],
            "wins": entry["wins"],
            "losses": entry["losses"],
            "total": entry["total"],
            "rate": rate,
            "score": score,
        })
    players.sort(key=lambda p: p["score"], reverse=True)
    return {"players": players}


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


app.include_router(router)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
