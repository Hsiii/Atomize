extends SceneTree

const SaveManager := preload("res://scripts/core/save_manager.gd")

var failures: Array[String] = []

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var manager := SaveManager.new({
		"best_score_path": "user://atomize-save-manager-test-best.json",
		"experience_path": "user://atomize-save-manager-test-experience.json",
		"profile_path": "user://atomize-save-manager-test-profile.json",
		"tutorial_complete_path": "user://atomize-save-manager-test-tutorial.txt",
	})
	_cleanup(manager)

	_test_player_name(manager)
	_test_best_record(manager)
	_test_experience(manager)
	_test_tutorial_completion(manager)

	_cleanup(manager)

	if failures.is_empty():
		print("[Success] Godot save manager tests passed.")
		quit(0)
		return

	for failure in failures:
		printerr(failure)

	printerr("[Error] Godot save manager tests failed with %s failure(s)." % failures.size())
	quit(1)

func _test_player_name(manager: SaveManager) -> void:
	_assert_eq(SaveManager.normalize_player_name("  Long    Name  "), "Long Nam", "player names collapse spaces and clamp to 8 chars")
	_assert_eq(manager.load_player_name("Guest42"), "Guest42", "missing profile falls back to guest name")
	_assert_eq(manager.save_player_name("  Atomic Player  "), "Atomic P", "saved names are normalized")
	_assert_eq(manager.load_player_name("Guest42"), "Atomic P", "saved profile name loads")
	_assert_eq(manager.save_player_name(""), "", "empty player name clears profile")
	_assert_eq(manager.load_player_name("Guest42"), "Guest42", "cleared profile returns to guest fallback")

func _test_best_record(manager: SaveManager) -> void:
	_assert_eq(manager.load_best_record(), {"score": 0, "maxCombo": 0}, "missing best record defaults to zeroes")
	_assert_eq(manager.save_best_score(120, 3), true, "first saved score is a new high score")
	_assert_eq(manager.load_best_record(), {"score": 120, "maxCombo": 3}, "best score and combo save together")
	_assert_eq(manager.save_best_score(80, 5), false, "lower score with higher combo is not a high score")
	_assert_eq(manager.load_best_record(), {"score": 120, "maxCombo": 5}, "max combo advances independently")
	_assert_eq(manager.save_best_score(140, 4), true, "higher score reports a new high score")
	_assert_eq(manager.load_best_record(), {"score": 140, "maxCombo": 5}, "higher score preserves best combo")
	manager.reset_best_record()
	_assert_eq(manager.load_best_record(), {"score": 0, "maxCombo": 0}, "reset clears best record")

func _test_experience(manager: SaveManager) -> void:
	_assert_eq(manager.load_experience(), 0, "missing experience defaults to zero")
	_assert_eq(manager.save_experience(-5), 0, "experience cannot be negative")
	_assert_eq(manager.add_experience(0, 25), 25, "positive experience gain saves")
	_assert_eq(manager.load_experience(), 25, "saved experience loads")
	_assert_eq(manager.add_experience(25, -10), 25, "negative experience gain is ignored")

func _test_tutorial_completion(manager: SaveManager) -> void:
	_assert_eq(manager.is_tutorial_complete(), false, "tutorial starts incomplete")
	manager.mark_tutorial_complete()
	_assert_eq(manager.is_tutorial_complete(), true, "tutorial completion persists")

func _assert_eq(actual, expected, message: String) -> void:
	if actual != expected:
		failures.append("%s: expected %s, got %s" % [message, var_to_str(expected), var_to_str(actual)])

func _cleanup(manager: SaveManager) -> void:
	manager.delete_file(manager.best_score_path)
	manager.delete_file(manager.experience_path)
	manager.delete_file(manager.profile_path)
	manager.delete_file(manager.tutorial_complete_path)
