class_name AtomizeSaveManager
extends RefCounted

const SAVE_VERSION := 1
const DEFAULT_BEST_SCORE_PATH := "user://best_score.json"
const DEFAULT_EXPERIENCE_PATH := "user://experience.json"
const DEFAULT_PROFILE_PATH := "user://profile.json"
const DEFAULT_TUTORIAL_COMPLETE_PATH := "user://tutorial_complete.txt"
const PLAYER_NAME_LIMIT := 8

var best_score_path := DEFAULT_BEST_SCORE_PATH
var experience_path := DEFAULT_EXPERIENCE_PATH
var profile_path := DEFAULT_PROFILE_PATH
var tutorial_complete_path := DEFAULT_TUTORIAL_COMPLETE_PATH

func _init(path_overrides: Dictionary = {}) -> void:
	best_score_path = str(path_overrides.get("best_score_path", DEFAULT_BEST_SCORE_PATH))
	experience_path = str(path_overrides.get("experience_path", DEFAULT_EXPERIENCE_PATH))
	profile_path = str(path_overrides.get("profile_path", DEFAULT_PROFILE_PATH))
	tutorial_complete_path = str(path_overrides.get("tutorial_complete_path", DEFAULT_TUTORIAL_COMPLETE_PATH))

static func normalize_player_name(value: String) -> String:
	var result := ""
	var previous_was_space := true

	for index in range(value.length()):
		var character := value.substr(index, 1)
		var character_code := value.unicode_at(index)
		var is_space := character_code <= 32
		if is_space:
			if not previous_was_space and result.length() < PLAYER_NAME_LIMIT:
				result += " "
			previous_was_space = true
			continue

		if result.length() >= PLAYER_NAME_LIMIT:
			break

		result += character
		previous_was_space = false

	return result.strip_edges()

func load_player_name(default_name := "") -> String:
	var record := _read_json_object(profile_path)
	var player_name := normalize_player_name(str(record.get("playerName", "")))
	if not player_name.is_empty():
		return player_name

	return normalize_player_name(default_name)

func save_player_name(player_name: String) -> String:
	var normalized_name := normalize_player_name(player_name)
	if normalized_name.is_empty():
		delete_file(profile_path)
		return ""

	_write_json(profile_path, {
		"version": SAVE_VERSION,
		"playerName": normalized_name,
	})
	return normalized_name

func load_best_score() -> int:
	return int(load_best_record().get("score", 0))

func load_best_combo() -> int:
	return int(load_best_record().get("maxCombo", 0))

func load_best_record() -> Dictionary:
	var record := _read_json_object(best_score_path)
	return {
		"score": maxi(0, int(record.get("score", 0))),
		"maxCombo": maxi(0, int(record.get("maxCombo", 0))),
	}

func reset_best_record() -> void:
	_write_json(best_score_path, {
		"version": SAVE_VERSION,
		"score": 0,
		"maxCombo": 0,
	})

func save_best_score(score: int, max_combo: int) -> bool:
	var record := load_best_record()
	var current_best_score := int(record.get("score", 0))
	var current_best_combo := int(record.get("maxCombo", 0))
	var next_best_score := maxi(score, current_best_score)
	var next_best_combo := maxi(max_combo, current_best_combo)
	var is_new_high_score := score > current_best_score

	if next_best_score == current_best_score and next_best_combo == current_best_combo:
		return is_new_high_score

	if not _write_json(best_score_path, {
		"version": SAVE_VERSION,
		"score": next_best_score,
		"maxCombo": next_best_combo,
	}):
		return false

	return is_new_high_score

func is_tutorial_complete() -> bool:
	return FileAccess.file_exists(tutorial_complete_path)

func mark_tutorial_complete() -> void:
	var file := FileAccess.open(tutorial_complete_path, FileAccess.WRITE)
	if file != null:
		file.store_string("1")
		file.close()

func load_experience() -> int:
	if not FileAccess.file_exists(experience_path):
		return 0

	var file := FileAccess.open(experience_path, FileAccess.READ)
	if file == null:
		return 0

	var parsed = JSON.parse_string(file.get_as_text())
	file.close()

	if typeof(parsed) == TYPE_DICTIONARY:
		return maxi(0, int(parsed.get("experience", 0)))

	if typeof(parsed) == TYPE_FLOAT or typeof(parsed) == TYPE_INT:
		return maxi(0, int(parsed))

	return 0

func save_experience(experience: int) -> int:
	var normalized_experience := maxi(0, experience)
	if not _write_json(experience_path, {
		"version": SAVE_VERSION,
		"experience": normalized_experience,
	}):
		return load_experience()

	return normalized_experience

func add_experience(current_experience: int, experience_gain: int) -> int:
	var normalized_gain := maxi(0, experience_gain)
	if normalized_gain == 0:
		return current_experience

	return save_experience(current_experience + normalized_gain)

func delete_file(path: String) -> void:
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(path))

func _read_json_object(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}

	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}

	var parsed = JSON.parse_string(file.get_as_text())
	file.close()

	if typeof(parsed) != TYPE_DICTIONARY:
		return {}

	return parsed

func _write_json(path: String, data: Dictionary) -> bool:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return false

	file.store_string(JSON.stringify(data))
	file.close()
	return true
