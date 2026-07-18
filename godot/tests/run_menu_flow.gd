extends SceneTree

const MAIN_SCENE := preload("res://scenes/Main.tscn")
const SaveManager := preload("res://scripts/core/save_manager.gd")
const MIN_TOUCH_TARGET := 44.0

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var main_scene := MAIN_SCENE.instantiate()
	root.add_child(main_scene)
	await process_frame
	await process_frame
	main_scene.set("save_manager", SaveManager.new({
		"best_score_path": "user://menu_flow_best_score.json",
		"experience_path": "user://menu_flow_experience.json",
		"profile_path": "user://menu_flow_profile.json",
		"tutorial_complete_path": "user://menu_flow_tutorial.txt",
	}))

	var failures: Array[String] = []
	await _validate_home_navigation(main_scene, failures)
	await _validate_player_name_dialog(main_scene, failures)
	await _validate_reset_dialog(main_scene, failures)
	await _validate_pause_dialog(main_scene, failures)
	await _validate_game_over_dialog(main_scene, failures)
	await _validate_battle_touch_targets(main_scene, failures)
	await _validate_battle_over_dialog(main_scene, failures)

	if not failures.is_empty():
		for failure in failures:
			printerr("[Error] Godot menu flow failed: %s" % failure)
		main_scene.queue_free()
		quit(1)
		return

	print("[Success] Godot menu flow and dialog spacing tests passed.")
	main_scene.queue_free()
	await process_frame
	quit(0)

func _validate_home_navigation(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_start_home")
	main_scene.call("_toggle_home_menu")
	if not bool(main_scene.get("home_menu_open")):
		failures.append("home menu did not open")
	elif not bool(main_scene.call("_handle_back_navigation")):
		failures.append("Back did not handle the open home menu")
	elif bool(main_scene.get("home_menu_open")):
		failures.append("Back did not close the home menu")
	await process_frame

func _validate_player_name_dialog(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_show_player_name_dialog")
	await process_frame
	var overlay := main_scene.get_node_or_null("PlayerNameOverlay")
	_validate_dialog(overlay, Vector2(304, 352), ["Cancel", "Claim", "Continue as Guest"], failures, "player name")
	if overlay != null and not bool(main_scene.call("_handle_back_navigation")):
		failures.append("Back did not handle the player name dialog")
	await process_frame
	if main_scene.get_node_or_null("PlayerNameOverlay") != null:
		failures.append("Back did not dismiss the player name dialog")

func _validate_reset_dialog(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_show_reset_best_dialog")
	await process_frame
	var overlay := main_scene.get_node_or_null("ResetBestOverlay")
	_validate_dialog(overlay, Vector2(304, 236), ["Cancel", "Reset"], failures, "reset best")
	if overlay != null and not bool(main_scene.call("_handle_back_navigation")):
		failures.append("Back did not handle the reset dialog")
	await process_frame
	if main_scene.get_node_or_null("ResetBestOverlay") != null:
		failures.append("Back did not dismiss the reset dialog")

func _validate_pause_dialog(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_start_solo_game")
	main_scene.call("_pause_game")
	await process_frame
	var overlay := main_scene.get_node_or_null("PauseOverlay")
	_validate_dialog(overlay, Vector2(304, 248), ["Resume", "Restart Run", "Main Menu"], failures, "pause")
	if overlay != null and not bool(main_scene.call("_handle_back_navigation")):
		failures.append("Back did not resume from pause")
	await process_frame
	if main_scene.get_node_or_null("PauseOverlay") != null:
		failures.append("Back did not dismiss the pause dialog")

func _validate_game_over_dialog(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_build_game_over_layout")
	await process_frame
	var overlay := main_scene.get_node_or_null("GameOverOverlay")
	_validate_dialog(overlay, Vector2(304, 408), ["Main Menu", "Play Again"], failures, "game over")
	main_scene.call("_start_home")
	await process_frame

func _validate_battle_touch_targets(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_start_home")
	main_scene.call(
		"_add_battle_picker_row",
		24.0,
		300.0,
		342.0,
		"bot",
		"AtomBot",
		"Play",
		false,
		Callable(main_scene, "_start_battle_ready")
	)
	var play_button := _find_button(main_scene, "Play")
	_validate_touch_target(play_button, failures, "battle Play")

	main_scene.set("realtime_pending_invitation", {"fromName": "Player"})
	main_scene.call("_add_realtime_invitation_card", 24.0, 384.0, 342.0)
	_validate_touch_target(_find_button(main_scene, "Accept"), failures, "invitation Accept")
	_validate_touch_target(_find_button(main_scene, "Decline"), failures, "invitation Decline")

func _validate_battle_over_dialog(main_scene: Node, failures: Array[String]) -> void:
	main_scene.call("_start_battle_ready")
	var snapshot: Dictionary = main_scene.get("battle_snapshot")
	for player in snapshot.get("players", []):
		if str(player.get("id", "")) == "atom-bot":
			player["hp"] = 0
	snapshot["status"] = "finished"
	main_scene.set("battle_snapshot", snapshot)
	main_scene.set("tutorial_active", true)
	main_scene.call("_build_battle_over_overlay")
	await process_frame
	var overlay := main_scene.get_node_or_null("BattleOverOverlay")
	_validate_dialog(overlay, Vector2(304, 336), ["Rematch", "Main Menu"], failures, "battle over")
	main_scene.call("_start_home")
	await process_frame

func _validate_dialog(
	overlay: Node,
	expected_size: Vector2,
	button_texts: Array[String],
	failures: Array[String],
	label: String
) -> void:
	if overlay == null:
		failures.append("%s dialog is missing" % label)
		return

	var panel := overlay.get_node_or_null("DialogPanel") as Panel
	if panel == null:
		failures.append("%s dialog panel is missing" % label)
		return
	if not panel.size.is_equal_approx(expected_size):
		failures.append("%s dialog is %s, expected %s" % [label, panel.size, expected_size])

	for button_text in button_texts:
		var button := _find_button(panel, button_text)
		if button == null:
			failures.append("%s dialog is missing %s" % [label, button_text])
		else:
			_validate_touch_target(button, failures, "%s %s" % [label, button_text])

func _validate_touch_target(button: Button, failures: Array[String], label: String) -> void:
	if button == null:
		failures.append("%s button is missing" % label)
		return
	if button.size.x < MIN_TOUCH_TARGET or button.size.y < MIN_TOUCH_TARGET:
		failures.append("%s touch target is %s, expected at least 44x44" % [label, button.size])

func _find_button(node: Node, text: String) -> Button:
	if node is Button and (node as Button).text == text:
		return node as Button
	for child in node.get_children():
		var match_button := _find_button(child, text)
		if match_button != null:
			return match_button
	return null
