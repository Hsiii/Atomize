class_name AtomizeSupabaseClient
extends RefCounted

const SUPABASE_URL_SETTING := "application/config/supabase_url"
const SUPABASE_ANON_KEY_SETTING := "application/config/supabase_anon_key"
const SUPABASE_URL_ENV := "VITE_SUPABASE_URL"
const SUPABASE_ANON_KEY_ENV := "VITE_SUPABASE_ANON_KEY"

var supabase_url := ""
var anon_key := ""

func _init() -> void:
	reload()

func reload() -> void:
	supabase_url = _trim_trailing_slashes(_read_config_value(SUPABASE_URL_SETTING, SUPABASE_URL_ENV))
	anon_key = _read_config_value(SUPABASE_ANON_KEY_SETTING, SUPABASE_ANON_KEY_ENV)

func is_configured() -> bool:
	return not supabase_url.is_empty() and not anon_key.is_empty()

func leaderboard_url() -> String:
	return "%s/rest/v1/combo_leaderboard?select=player_name,high_score,updated_at&high_score=gt.0&limit=100" % supabase_url

func realtime_websocket_url() -> String:
	return "%s/realtime/v1/websocket?apikey=%s&vsn=1.0.0" % [
		_to_websocket_base_url(supabase_url),
		anon_key,
	]

func rest_headers() -> PackedStringArray:
	return PackedStringArray([
		"apikey: %s" % anon_key,
		"Authorization: Bearer %s" % anon_key,
		"Accept: application/json",
	])

func _read_config_value(setting_name: String, env_name: String) -> String:
	if ProjectSettings.has_setting(setting_name):
		var setting_value := str(ProjectSettings.get_setting(setting_name)).strip_edges()
		if not setting_value.is_empty():
			return setting_value

	return OS.get_environment(env_name).strip_edges()

func _trim_trailing_slashes(value: String) -> String:
	var result := value.strip_edges()
	while result.ends_with("/"):
		result = result.substr(0, result.length() - 1)
	return result

func _to_websocket_base_url(value: String) -> String:
	if value.begins_with("https://"):
		return "wss://%s" % value.trim_prefix("https://")

	if value.begins_with("http://"):
		return "ws://%s" % value.trim_prefix("http://")

	return value
