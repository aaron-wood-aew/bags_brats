"""
Scheduler for tournament tasks.
- Reset user presence/paid status at midnight
- Manage check-in windows
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import pytz
from config import Config


def create_scheduler(mongo):
    """Create and configure the scheduler with tournament jobs."""
    scheduler = BackgroundScheduler()
    tz = pytz.timezone(Config.TOURNAMENT_TIMEZONE)
    
    def reset_daily_status():
        """Reset all users' checked_in and has_paid status at midnight."""
        try:
            result = mongo.db.users.update_many(
                {},
                {"$set": {"checked_in": False, "has_paid": False, "checked_in_at": None}}
            )
            print(f"[Scheduler] Midnight reset: {result.modified_count} users reset")
        except Exception as e:
            print(f"[Scheduler] Error in midnight reset: {e}")
    
    # Schedule midnight reset job
    scheduler.add_job(
        reset_daily_status,
        trigger=CronTrigger(hour=0, minute=0, timezone=tz),
        id='midnight_reset',
        name='Reset daily user status',
        replace_existing=True
    )
    
    def auto_finalize_expired_games():
        """Automatically finalize active games if end_time + 60 seconds has elapsed."""
        try:
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            cutoff = (now - timedelta(seconds=60)).strftime('%Y-%m-%dT%H:%M:%SZ')
            expired_games = list(mongo.db.games.find({
                "status": "active",
                "end_time": {"$lte": cutoff}
            }))
            
            if expired_games:
                for g in expired_games:
                    mongo.db.games.update_one(
                        {"_id": g["_id"]},
                        {"$set": {
                            "status": "finalized",
                            "end_time": now.strftime('%Y-%m-%dT%H:%M:%SZ')
                        }}
                    )
                    print(f"[Scheduler] Auto-finalized game {g['_id']} on Station {g.get('court') or g.get('game_number')}")
                
                # Broadcast standings update since games were finalized
                try:
                    t_id = str(expired_games[0]["tournament_id"])
                    from app.events import broadcast_standings_update
                    broadcast_standings_update(t_id)
                except Exception as e:
                    print(f"[Scheduler] Auto-finalize broadcast failed: {e}")
        except Exception as e:
            print(f"[Scheduler] Error in auto-finalize job: {e}")

    # Schedule auto-finalize check every 10 seconds
    scheduler.add_job(
        auto_finalize_expired_games,
        trigger='interval',
        seconds=10,
        id='auto_finalize',
        name='Auto finalize expired games',
        replace_existing=True
    )
    
    return scheduler


def is_checkin_window_open(mongo):
    """Check if the check-in window is currently open.
    
    Returns (is_open, message):
    - (True, None) if check-in is allowed
    - (False, reason) if check-in is not allowed
    """
    tz = pytz.timezone(Config.TOURNAMENT_TIMEZONE)
    now = datetime.now(tz)
    check_in_hour = Config.CHECK_IN_HOUR
    
    # Check if admin has manually opened check-in
    tournament = mongo.db.tournaments.find_one({"status": {"$in": ["upcoming", "active", "blackout"]}})
    if tournament and tournament.get('check_in_open'):
        return True, None
    
    # Check if it's a tournament day
    if tournament:
        today = now.strftime('%Y-%m-%d')
        if today in tournament.get('dates', []):
            # On a tournament day, check-in opens at CHECK_IN_HOUR
            if now.hour >= check_in_hour:
                return True, None
            else:
                minutes_until = (check_in_hour - now.hour) * 60 - now.minute
                return False, f"Check-in opens at {check_in_hour}:00. {minutes_until} minutes remaining."
    
    # No active tournament or not a tournament day
    return False, "No active tournament today."


def get_time_info(mongo):
    """Get current time info for debugging/display."""
    tz = pytz.timezone(Config.TOURNAMENT_TIMEZONE)
    now = datetime.now(tz)
    return {
        "current_time": now.strftime('%Y-%m-%d %H:%M:%S %Z'),
        "timezone": Config.TOURNAMENT_TIMEZONE,
        "check_in_hour": Config.CHECK_IN_HOUR
    }
