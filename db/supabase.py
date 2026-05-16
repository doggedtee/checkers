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


def save_game(player1_id: str, winner: str, moves: list, player2_id: str = None):
    data = {
        "player1_id": player1_id,
        "player2_id": player2_id,
        "winner": winner,
        "moves": moves,
    }
    return supabase.table("games").insert(data).execute()


def get_game_history(player_id: str):
    return supabase.table("games").select("*").eq("player1_id", player_id).order("created_at", desc=True).execute()
