import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)


def get_google_oauth_url(redirect_url: str) -> str:
    res = supabase.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {"redirect_to": redirect_url}
    })
    return res.url


def get_user(access_token: str):
    return supabase.auth.get_user(access_token)


def save_game(player1_id: str, winner: str, moves: list, player2_id: str = None, region: str = None):
    data = {
        "player1_id": player1_id,
        "player2_id": player2_id,
        "winner": winner,
        "moves": moves,
    }
    if region:
        data["region"] = region
    try:
        return supabase.table("games").insert(data).execute()
    except Exception as e:
        # Retry without region in case the column doesn't exist yet.
        if region and "region" in str(e):
            data.pop("region", None)
            return supabase.table("games").insert(data).execute()
        raise


def get_game_history(player_id: str):
    return supabase.table("games").select("*").eq("player1_id", player_id).order("created_at", desc=True).execute()


def save_active_game(game_id: str, game) -> None:
    pending_row = game.pending_piece.row if game.pending_piece else None
    pending_col = game.pending_piece.col if game.pending_piece else None
    supabase.table("active_games").upsert({
        "game_id": game_id,
        "board": game.board,
        "turn": game.turn,
        "move_history": game.move_history,
        "pending_row": pending_row,
        "pending_col": pending_col,
    }).execute()


def load_active_game(game_id: str):
    res = supabase.table("active_games").select("*").eq("game_id", game_id).execute()
    return res.data[0] if res.data else None


def get_all_games_for_leaderboard(region: str = None):
    q = supabase.table("games").select("player1_id, winner, region")
    if region:
        q = q.eq("region", region)
    try:
        return q.execute()
    except Exception as e:
        # Fall back to unfiltered query if the region column doesn't exist yet.
        if "region" in str(e):
            return supabase.table("games").select("player1_id, winner").execute()
        raise
