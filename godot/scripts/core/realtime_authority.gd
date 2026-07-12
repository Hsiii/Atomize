class_name AtomizeRealtimeAuthority
extends RefCounted

const MAX_ROOM_PLAYERS := 2
const VALID_ROOM_STATUSES := ["waiting", "countdown", "playing", "finished"]

static func host_player_id(snapshot: Dictionary) -> String:
	var players = snapshot.get("players", [])
	if typeof(players) != TYPE_ARRAY or players.is_empty():
		return ""

	var host = players[0]
	if typeof(host) != TYPE_DICTIONARY:
		return ""

	return str(host.get("id", ""))

static func has_player(snapshot: Dictionary, player_id: String) -> bool:
	var players = snapshot.get("players", [])
	if typeof(players) != TYPE_ARRAY:
		return false

	for player in players:
		if typeof(player) == TYPE_DICTIONARY and str(player.get("id", "")) == player_id:
			return true

	return false

static func validate_room_state_message(
	message: Dictionary,
	room_id: String,
	last_state_version: int
) -> Dictionary:
	var snapshot = message.get("snapshot", {})
	if typeof(snapshot) != TYPE_DICTIONARY:
		return _rejected("missing snapshot")

	if not _is_valid_snapshot(snapshot, room_id):
		return _rejected("invalid snapshot")

	var authority_player_id := str(message.get("authorityPlayerId", ""))
	var host_id := host_player_id(snapshot)
	if authority_player_id.is_empty() or authority_player_id != host_id:
		return _rejected("non-authoritative snapshot")

	var state_version := int(message.get("stateVersion", 0))
	if state_version <= last_state_version:
		return _rejected("stale snapshot")

	return {
		"accepted": true,
		"authorityPlayerId": authority_player_id,
		"snapshot": snapshot,
		"stateVersion": state_version,
	}

static func validate_gameplay_action(
	snapshot: Dictionary,
	message: Dictionary,
	last_action_order: int
) -> Dictionary:
	if snapshot.is_empty() or str(snapshot.get("status", "")) != "playing":
		return _rejected("room is not playing")

	var player_id := str(message.get("playerId", ""))
	if player_id.is_empty() or not has_player(snapshot, player_id):
		return _rejected("unknown player")

	var action_order := int(message.get("actionOrder", 0))
	if action_order <= last_action_order:
		return _rejected("stale action")

	return {
		"accepted": true,
		"actionOrder": action_order,
		"playerId": player_id,
	}

static func _is_valid_snapshot(snapshot: Dictionary, room_id: String) -> bool:
	if str(snapshot.get("roomId", "")) != room_id:
		return false

	if str(snapshot.get("seed", "")).is_empty():
		return false

	if int(snapshot.get("maxHp", 0)) <= 0:
		return false

	var status := str(snapshot.get("status", ""))
	if not VALID_ROOM_STATUSES.has(status):
		return false

	var players = snapshot.get("players", [])
	if typeof(players) != TYPE_ARRAY or players.is_empty() or players.size() > MAX_ROOM_PLAYERS:
		return false

	var player_ids := {}
	for player in players:
		if typeof(player) != TYPE_DICTIONARY:
			return false

		var player_id := str(player.get("id", ""))
		if player_id.is_empty() or player_ids.has(player_id):
			return false

		player_ids[player_id] = true

	return true

static func _rejected(reason: String) -> Dictionary:
	return {
		"accepted": false,
		"reason": reason,
	}
