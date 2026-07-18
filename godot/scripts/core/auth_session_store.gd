class_name AtomizeAuthSessionStore
extends RefCounted

const SESSION_VERSION := 1
const DEFAULT_SESSION_PATH := "user://supabase_session.enc"
const SESSION_KEY_CONTEXT := "atomize-supabase-session-v1"

var session_path := DEFAULT_SESSION_PATH

func _init(path_override := "") -> void:
	if not path_override.is_empty():
		session_path = path_override

static func session_from_user(user: SupabaseUser) -> Dictionary:
	return {
		"version": SESSION_VERSION,
		"access_token": user.access_token,
		"refresh_token": user.refresh_token,
		"token_type": user.token_type,
		"expires_in": user.expires_in,
		"user": user.dict,
	}

func save_session(session: Dictionary) -> bool:
	if not _is_valid_session(session):
		return false

	var file := FileAccess.open_encrypted_with_pass(
		session_path,
		FileAccess.WRITE,
		_session_passphrase()
	)
	if file == null:
		return false

	file.store_string(JSON.stringify(session))
	file.close()
	return true

func load_session() -> Dictionary:
	if not FileAccess.file_exists(session_path):
		return {}

	var file := FileAccess.open_encrypted_with_pass(
		session_path,
		FileAccess.READ,
		_session_passphrase()
	)
	if file == null:
		return {}

	var parsed = JSON.parse_string(file.get_as_text())
	file.close()
	if typeof(parsed) != TYPE_DICTIONARY or not _is_valid_session(parsed):
		return {}

	return parsed

func clear_session() -> void:
	if FileAccess.file_exists(session_path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(session_path))

func _is_valid_session(session: Dictionary) -> bool:
	var user = session.get("user", {})
	return (
		str(session.get("access_token", "")).length() > 16
		and str(session.get("refresh_token", "")).length() >= 8
		and typeof(user) == TYPE_DICTIONARY
		and not str(user.get("id", "")).is_empty()
	)

func _session_passphrase() -> String:
	var device_id := OS.get_unique_id()
	if device_id.is_empty():
		device_id = "local-device"
	return "%s:%s" % [SESSION_KEY_CONTEXT, device_id]
