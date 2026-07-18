class_name AtomizeAuthManager
extends RefCounted

const SaveManager := preload("res://scripts/core/save_manager.gd")
const SessionStore := preload("res://scripts/core/auth_session_store.gd")

var supabase: Node
var session_store: SessionStore
var user_id := ""
var access_token := ""

func _init(supabase_node: Node, session_path := "") -> void:
	supabase = supabase_node
	session_store = SessionStore.new(session_path)
	if is_instance_valid(supabase.auth):
		supabase.auth.token_refreshed.connect(_on_token_refreshed)

func is_configured() -> bool:
	return (
		is_instance_valid(supabase)
		and not str(supabase.config.get("supabaseUrl", "")).is_empty()
		and not str(supabase.config.get("supabaseKey", "")).is_empty()
	)

func is_authenticated() -> bool:
	return not user_id.is_empty() and not access_token.is_empty()

func initialize() -> Dictionary:
	if not is_configured():
		return {"ok": false, "error": "Supabase is not configured."}

	var saved_session := session_store.load_session()
	if saved_session.is_empty():
		return {"ok": true}

	var auth_task: AuthTask = await supabase.auth.restore_session(saved_session).completed
	if auth_task.error != null or auth_task.user == null:
		var session_error := str(auth_task.error) if auth_task.error != null else "Missing refreshed user"
		session_store.clear_session()
		_clear_identity()
		return {"ok": true, "session_error": session_error}

	_remember_user(auth_task.user)
	var profile_result := await load_profile()
	if bool(profile_result.get("ok", false)):
		return {
			"ok": true,
			"player_name": str(profile_result.get("player_name", "")),
		}

	return {"ok": true}

func claim_player_name(value: String) -> Dictionary:
	var normalized_name := SaveManager.normalize_player_name(value)
	if normalized_name.is_empty():
		return {"ok": false, "error": "Enter a player name."}

	if not is_configured():
		return {"ok": false, "error": "Player names are unavailable offline."}

	if not is_authenticated():
		var auth_task: AuthTask = await supabase.auth.sign_in_anonymous({"platform": "godot"}).completed
		if auth_task.error != null or auth_task.user == null:
			return {"ok": false, "error": "Could not create a player session."}
		_remember_user(auth_task.user)

	var database_task: DatabaseTask = await supabase.database.Rpc(
		"claim_player_name",
		{"p_player_name": normalized_name}
	).completed
	if database_task.error != null:
		if database_task.error.code == "23505":
			return {"ok": false, "error": "That player name is already taken."}
		return {"ok": false, "error": "Could not save that player name."}

	return {
		"ok": true,
		"player_name": _player_name_from_response(database_task.data, normalized_name),
	}

func load_profile() -> Dictionary:
	if not is_authenticated():
		return {"ok": false}

	var query := SupabaseQuery.new().from("combo_leaderboard").select(
		PackedStringArray(["player_name"])
	).eq("user_id", user_id)
	var database_task: DatabaseTask = await supabase.database.query(query).completed
	if database_task.error != null:
		return {"ok": false}

	return {
		"ok": true,
		"player_name": _player_name_from_response(database_task.data),
	}

func submit_solo_score(score: int, max_combo: int) -> bool:
	if not is_authenticated():
		return false

	var database_task: DatabaseTask = await supabase.database.Rpc(
		"submit_solo_score",
		{
			"p_score": maxi(0, score),
			"p_max_combo": maxi(0, max_combo),
		}
	).completed
	return database_task.error == null

func realtime_access_token(fallback_token: String) -> String:
	return access_token if is_authenticated() else fallback_token

func _remember_user(user: SupabaseUser) -> void:
	user_id = user.id
	access_token = user.access_token
	session_store.save_session(SessionStore.session_from_user(user))

func _on_token_refreshed(user: SupabaseUser) -> void:
	_remember_user(user)

func _clear_identity() -> void:
	user_id = ""
	access_token = ""

func _player_name_from_response(data, fallback := "") -> String:
	if typeof(data) == TYPE_DICTIONARY:
		return str(data.get("player_name", fallback))

	if typeof(data) == TYPE_ARRAY and not data.is_empty() and typeof(data[0]) == TYPE_DICTIONARY:
		return str(data[0].get("player_name", fallback))

	return fallback
