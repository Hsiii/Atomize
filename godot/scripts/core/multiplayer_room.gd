class_name AtomizeMultiplayerRoom
extends RefCounted

const STARTING_HP := 1000
const WRONG_SELECTION_DAMAGE := 8

static func create_room_snapshot(room_id: String, host_id: String, host_name: String) -> Dictionary:
	var initial_stage := AtomizeGame.generate_stage(room_id, 0)

	return {
		"roomId": room_id,
		"seed": room_id,
		"maxHp": STARTING_HP,
		"stageIndex": 0,
		"stage": initial_stage,
		"players": [create_player(host_id, host_name, room_id)],
		"status": "waiting",
	}

static func add_player_to_room(
	snapshot: Dictionary,
	player_id: String,
	player_name: String
):
	if snapshot["players"].any(func(player): return player["id"] == player_id):
		return snapshot

	if snapshot["players"].size() >= 2:
		return null

	var next_snapshot := snapshot.duplicate(true)
	var players: Array = snapshot["players"].duplicate(true)
	players.append(create_player(player_id, player_name, snapshot["seed"]))
	next_snapshot["players"] = players
	next_snapshot.erase("lastEvent")
	next_snapshot["status"] = "waiting"

	return next_snapshot

static func set_player_ready(snapshot: Dictionary, player_id: String, ready: bool) -> Dictionary:
	if snapshot["status"] == "playing" or snapshot["status"] == "finished":
		return snapshot

	var next_players: Array = []

	for player in snapshot["players"]:
		if player["id"] == player_id:
			var next_player: Dictionary = player.duplicate(true)
			next_player["ready"] = ready
			next_players.append(next_player)
		else:
			next_players.append(player.duplicate(true))

	var next_snapshot := snapshot.duplicate(true)
	next_snapshot["players"] = next_players
	next_snapshot.erase("countdownEndsAt")
	next_snapshot["status"] = "waiting" if snapshot["status"] == "countdown" else snapshot["status"]

	return next_snapshot

static func begin_room_match(snapshot: Dictionary) -> Dictionary:
	if snapshot["players"].size() < 2 or snapshot["status"] != "waiting":
		return snapshot

	if not snapshot["players"].all(func(player): return player["ready"]):
		return snapshot

	var next_snapshot := snapshot.duplicate(true)
	next_snapshot.erase("countdownEndsAt")
	next_snapshot["status"] = "playing"

	return next_snapshot

static func apply_battle_prime_selection(
	snapshot: Dictionary,
	player_id: String,
	prime: int,
	options: Dictionary = {}
) -> Dictionary:
	if snapshot["status"] != "playing":
		return snapshot

	var acting_player = find_player(snapshot["players"], player_id)
	var target_player = find_opponent(snapshot["players"], player_id)

	if acting_player == null or target_player == null:
		return snapshot

	var selection := AtomizeGame.apply_prime_selection(acting_player["stage"], prime)

	if selection["kind"] == "wrong":
		return apply_battle_penalty(snapshot, player_id)

	var combo := max(1, int(options.get("resolvingQueueLength", 1))) if selection["cleared"] else 0
	var stage_index := acting_player["stageIndex"] + 1 if selection["cleared"] else acting_player["stageIndex"]
	var next_stage = (
		AtomizeGame.generate_stage(snapshot["seed"], stage_index) if selection["cleared"] else selection["stage"]
	)
	var should_suppress_attack := options.get("suppressAttack", false) == true and not selection["cleared"]
	var pending_factor_damage: int = acting_player["pendingFactorDamage"]
	var factor_damage := AtomizeGame.compute_battle_factor_damage(prime)
	var total_factor_damage := pending_factor_damage + factor_damage
	var perfect_solve := selection["cleared"] and options.get("perfectSolveEligible", false) == true
	var combo_damage := AtomizeGame.compute_battle_combo_damage(combo) if selection["cleared"] else 0
	var regen := compute_perfect_solve_regen(
		acting_player["hp"],
		snapshot["maxHp"],
		total_factor_damage,
		perfect_solve
	)
	var next_pending_factor_damage := total_factor_damage if should_suppress_attack else 0
	var damage := 0 if should_suppress_attack else total_factor_damage + combo_damage
	var next_players: Array = []

	for player in snapshot["players"]:
		var next_player: Dictionary = player.duplicate(true)

		if player["id"] == player_id:
			next_player["hp"] = min(snapshot["maxHp"], int(player["hp"]) + regen)
			next_player["pendingFactorDamage"] = next_pending_factor_damage
			next_player["combo"] = combo
			next_player["maxCombo"] = (
				max(int(player["maxCombo"]), combo) if selection["cleared"] else player["maxCombo"]
			)
			next_player["stageIndex"] = stage_index
			next_player["stage"] = next_stage
		else:
			next_player["hp"] = max(0, int(player["hp"]) - damage)

		next_players.append(next_player)

	var next_acting_player = find_player(next_players, player_id)
	var next_target_player = find_player(next_players, target_player["id"])

	if next_acting_player == null or next_target_player == null:
		return snapshot

	var snapshot_with_stage := snapshot.duplicate(true)
	snapshot_with_stage["stageIndex"] = stage_index
	snapshot_with_stage["stage"] = next_stage

	if should_suppress_attack:
		return with_players(snapshot_with_stage, next_players, null, false)

	var last_event := (
		{
			"id": get_next_event_id(snapshot),
			"type": "finish",
			"winnerPlayerId": next_acting_player["id"],
			"loserPlayerId": next_target_player["id"],
			"sourcePlayerId": player_id,
			"damage": damage,
			"regen": regen,
			"perfectSolve": perfect_solve,
			"combo": combo,
			"cause": "attack",
			"sourceStageIndex": acting_player["stageIndex"],
			"nextStageIndex": stage_index,
			"winnerHp": next_acting_player["hp"],
			"loserHp": next_target_player["hp"],
		}
		if next_target_player["hp"] == 0
		else {
			"id": get_next_event_id(snapshot),
			"type": "attack",
			"sourcePlayerId": player_id,
			"targetPlayerId": next_target_player["id"],
			"damage": damage,
			"regen": regen,
			"perfectSolve": perfect_solve,
			"combo": combo,
			"sourceStageIndex": acting_player["stageIndex"],
			"nextStageIndex": stage_index,
			"sourceHp": next_acting_player["hp"],
			"targetHp": next_target_player["hp"],
		}
	)

	return with_players(snapshot_with_stage, next_players, last_event, false)

static func apply_battle_penalty(
	snapshot: Dictionary,
	player_id: String,
	preserved_stage = null,
	released_damage_override = null
) -> Dictionary:
	if snapshot["status"] != "playing":
		return snapshot

	var acting_player = find_player(snapshot["players"], player_id)
	var target_player = find_opponent(snapshot["players"], player_id)

	if acting_player == null or target_player == null:
		return snapshot

	var next_stage = preserved_stage if preserved_stage != null else acting_player["stage"]
	var released_damage = max(
		0,
		released_damage_override
		if released_damage_override != null
		else acting_player["pendingFactorDamage"]
	)
	var next_players: Array = []

	for player in snapshot["players"]:
		var next_player: Dictionary = player.duplicate(true)

		if player["id"] == player_id:
			next_player["hp"] = max(0, int(player["hp"]) - WRONG_SELECTION_DAMAGE)
			next_player["pendingFactorDamage"] = 0
			next_player["combo"] = 0
			next_player["stage"] = next_stage
		else:
			next_player["hp"] = max(0, int(player["hp"]) - released_damage)

		next_players.append(next_player)

	var next_acting_player = find_player(next_players, player_id)
	var next_target_player = find_opponent(next_players, player_id)

	if next_acting_player == null or next_target_player == null:
		return snapshot

	var snapshot_with_stage := snapshot.duplicate(true)
	snapshot_with_stage["stageIndex"] = acting_player["stageIndex"]
	snapshot_with_stage["stage"] = next_stage

	if next_target_player["hp"] == 0:
		return with_players(
			snapshot_with_stage,
			next_players,
			{
				"id": get_next_event_id(snapshot),
				"type": "finish",
				"winnerPlayerId": acting_player["id"],
				"loserPlayerId": target_player["id"],
				"sourcePlayerId": player_id,
				"damage": released_damage,
				"regen": 0,
				"perfectSolve": false,
				"combo": 0,
				"cause": "attack",
				"sourceStageIndex": acting_player["stageIndex"],
				"nextStageIndex": acting_player["stageIndex"],
				"winnerHp": next_acting_player["hp"],
				"loserHp": next_target_player["hp"],
			},
			false
		)

	var last_event := (
		{
			"id": get_next_event_id(snapshot),
			"type": "finish",
			"winnerPlayerId": target_player["id"],
			"loserPlayerId": next_acting_player["id"],
			"sourcePlayerId": player_id,
			"damage": WRONG_SELECTION_DAMAGE,
			"regen": 0,
			"perfectSolve": false,
			"combo": 0,
			"cause": "self-hit",
			"sourceStageIndex": acting_player["stageIndex"],
			"nextStageIndex": acting_player["stageIndex"],
			"winnerHp": next_target_player["hp"],
			"loserHp": next_acting_player["hp"],
		}
		if next_acting_player["hp"] == 0
		else {
			"id": get_next_event_id(snapshot),
			"type": "self-hit",
			"sourcePlayerId": player_id,
			"damage": WRONG_SELECTION_DAMAGE,
			"combo": 0,
			"sourceStageIndex": acting_player["stageIndex"],
			"nextStageIndex": acting_player["stageIndex"],
			"sourceHp": next_acting_player["hp"],
			"releasedDamage": released_damage,
			"targetPlayerId": target_player["id"],
			"targetHp": next_target_player["hp"],
		}
	)

	return with_players(snapshot_with_stage, next_players, last_event, false)

static func clear_solved_battle_stage(snapshot: Dictionary, player_id: String) -> Dictionary:
	if snapshot["status"] != "playing":
		return snapshot

	var acting_player = find_player(snapshot["players"], player_id)

	if acting_player == null or acting_player["stage"]["remainingValue"] != 1:
		return snapshot

	var target_player = find_opponent(snapshot["players"], player_id)

	if target_player == null:
		return snapshot

	var clear_damage := 2
	var combo := 1
	var stage_index: int = acting_player["stageIndex"] + 1
	var next_stage := AtomizeGame.generate_stage(snapshot["seed"], stage_index)
	var next_players: Array = []

	for player in snapshot["players"]:
		var next_player: Dictionary = player.duplicate(true)

		if player["id"] == player_id:
			next_player["pendingFactorDamage"] = 0
			next_player["combo"] = combo
			next_player["maxCombo"] = max(int(player["maxCombo"]), combo)
			next_player["stageIndex"] = stage_index
			next_player["stage"] = next_stage
		else:
			next_player["hp"] = max(0, int(player["hp"]) - clear_damage)

		next_players.append(next_player)

	var next_acting_player = find_player(next_players, player_id)
	var next_target_player = find_opponent(next_players, player_id)

	if next_acting_player == null or next_target_player == null:
		return snapshot

	var snapshot_with_stage := snapshot.duplicate(true)
	snapshot_with_stage["stageIndex"] = stage_index
	snapshot_with_stage["stage"] = next_stage

	var last_event := (
		{
			"id": get_next_event_id(snapshot),
			"type": "finish",
			"winnerPlayerId": acting_player["id"],
			"loserPlayerId": target_player["id"],
			"sourcePlayerId": player_id,
			"damage": clear_damage,
			"regen": 0,
			"perfectSolve": false,
			"combo": combo,
			"cause": "attack",
			"sourceStageIndex": acting_player["stageIndex"],
			"nextStageIndex": stage_index,
			"winnerHp": next_acting_player["hp"],
			"loserHp": next_target_player["hp"],
		}
		if next_target_player["hp"] == 0
		else {
			"id": get_next_event_id(snapshot),
			"type": "attack",
			"sourcePlayerId": player_id,
			"targetPlayerId": target_player["id"],
			"damage": clear_damage,
			"regen": 0,
			"perfectSolve": false,
			"combo": combo,
			"sourceStageIndex": acting_player["stageIndex"],
			"nextStageIndex": stage_index,
			"sourceHp": next_acting_player["hp"],
			"targetHp": next_target_player["hp"],
		}
	)

	return with_players(snapshot_with_stage, next_players, last_event, false)

static func compute_perfect_solve_regen(
	hp: int,
	max_hp: int,
	factor_damage_total: int,
	perfect_solve: bool
) -> int:
	if not perfect_solve:
		return 0

	return max(0, min(max_hp - hp, int(round(float(factor_damage_total) / 2.0))))

static func create_player(id: String, name: String, seed: String) -> Dictionary:
	return {
		"id": id,
		"name": name,
		"hp": STARTING_HP,
		"pendingFactorDamage": 0,
		"combo": 0,
		"maxCombo": 0,
		"stageIndex": 0,
		"stage": AtomizeGame.generate_stage(seed, 0),
		"connected": true,
		"ready": false,
	}

static func with_players(
	snapshot: Dictionary,
	players: Array,
	last_event = null,
	use_existing_last_event := true
) -> Dictionary:
	var has_defeated_player := players.any(func(player): return player["hp"] == 0)
	var next_snapshot := snapshot.duplicate(true)
	next_snapshot["players"] = players.duplicate(true)

	if use_existing_last_event:
		if snapshot.has("lastEvent"):
			next_snapshot["lastEvent"] = snapshot["lastEvent"]
		else:
			next_snapshot.erase("lastEvent")
	elif last_event != null:
		next_snapshot["lastEvent"] = last_event
	else:
		next_snapshot.erase("lastEvent")

	if has_defeated_player:
		next_snapshot.erase("countdownEndsAt")
		next_snapshot["status"] = "finished"
	else:
		if snapshot.has("countdownEndsAt"):
			next_snapshot["countdownEndsAt"] = snapshot["countdownEndsAt"]
		else:
			next_snapshot.erase("countdownEndsAt")
		next_snapshot["status"] = snapshot["status"]

	return next_snapshot

static func get_next_event_id(snapshot: Dictionary) -> int:
	if snapshot.has("lastEvent"):
		return int(snapshot["lastEvent"]["id"]) + 1

	return 1

static func find_player(players: Array, player_id: String):
	for player in players:
		if player["id"] == player_id:
			return player

	return null

static func find_opponent(players: Array, player_id: String):
	for player in players:
		if player["id"] != player_id:
			return player

	return null
