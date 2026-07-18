extends SceneTree

const AuthManager := preload("res://scripts/core/auth_manager.gd")
const SupabaseNode := preload("res://addons/supabase/Supabase/supabase.gd")
const SESSION_PATH := "user://atomize-supabase-auth-live-test.enc"

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var first_client := SupabaseNode.new()
	root.add_child(first_client)
	await process_frame

	var first_manager := AuthManager.new(first_client, SESSION_PATH)
	first_manager.session_store.clear_session()
	if not first_manager.is_configured():
		_fail("Supabase is not configured")
		return

	var player_name := "Cdx%05d" % (int(Time.get_unix_time_from_system()) % 100000)
	var claim_result := await first_manager.claim_player_name(player_name)
	if not bool(claim_result.get("ok", false)):
		_fail(str(claim_result.get("error", "Could not claim player name")))
		return
	if first_manager.session_store.load_session().is_empty():
		_fail("Anonymous session was not persisted (access=%d, refresh=%d, user=%s)" % [
			first_client.auth.client.access_token.length(),
			first_client.auth.client.refresh_token.length(),
			first_client.auth.client.id,
		])
		return

	if not await first_manager.submit_solo_score(321, 7):
		_fail("Could not submit score")
		return

	var second_client := SupabaseNode.new()
	root.add_child(second_client)
	await process_frame
	var restored_manager := AuthManager.new(second_client, SESSION_PATH)
	var restore_result := await restored_manager.initialize()
	if not bool(restore_result.get("ok", false)):
		_fail("Could not restore the persisted session")
		return
	if not restored_manager.is_authenticated():
		_fail("Could not refresh the persisted session: %s" % str(restore_result.get("session_error", "unknown error")))
		return

	if restored_manager.user_id != first_manager.user_id:
		_fail("Restored session changed auth.uid() from %s to %s" % [first_manager.user_id, restored_manager.user_id])
		return

	var query := SupabaseQuery.new().from("combo_leaderboard").select(
		PackedStringArray(["player_name", "high_score", "max_combo"])
	).eq("user_id", restored_manager.user_id)
	var database_task: DatabaseTask = await second_client.database.query(query).completed
	if database_task.error != null or typeof(database_task.data) != TYPE_ARRAY or database_task.data.is_empty():
		_fail("Could not read the authenticated leaderboard profile")
		return

	var profile: Dictionary = database_task.data[0]
	if str(profile.get("player_name", "")) != player_name:
		_fail("Claimed player name did not persist")
		return
	if int(profile.get("high_score", 0)) != 321 or int(profile.get("max_combo", 0)) != 7:
		_fail("Submitted score did not persist")
		return

	restored_manager.session_store.clear_session()
	print("[Success] Supabase auth live test passed: %s" % JSON.stringify({
		"user_id": restored_manager.user_id,
		"player_name": player_name,
		"high_score": int(profile.get("high_score", 0)),
		"max_combo": int(profile.get("max_combo", 0)),
	}))
	quit(0)

func _fail(message: String) -> void:
	printerr("[Error] Supabase auth live test failed: %s" % message)
	quit(1)
