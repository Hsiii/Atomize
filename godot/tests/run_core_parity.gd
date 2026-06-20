extends SceneTree

const Game := preload("res://scripts/core/game.gd")
const MultiplayerRoom := preload("res://scripts/core/multiplayer_room.gd")
const Primes := preload("res://scripts/core/primes.gd")
const Random := preload("res://scripts/core/random.gd")
const Timing := preload("res://scripts/core/timing.gd")
const EPSILON := 0.000000000001
const MAX_FAILURES := 50

var failures: Array[String] = []

func _init() -> void:
	var fixture := _load_fixture()
	var actual := _create_actual_fixture(fixture)

	_compare_variant(actual, fixture, "$")

	if failures.is_empty():
		print("[Success] Godot core matches TypeScript fixtures.")
		quit(0)
		return

	for failure in failures:
		printerr(failure)

	printerr("[Error] Godot core parity failed with %s mismatch(es)." % failures.size())
	quit(1)

func _load_fixture() -> Dictionary:
	var file := FileAccess.open("res://tests/fixtures/core-fixtures.json", FileAccess.READ)

	if file == null:
		printerr("[Error] Could not open core parity fixture.")
		quit(1)
		return {}

	var parsed = JSON.parse_string(file.get_as_text())

	if typeof(parsed) != TYPE_DICTIONARY:
		printerr("[Error] Core parity fixture is not a JSON object.")
		quit(1)
		return {}

	return parsed

func _create_actual_fixture(fixture: Dictionary) -> Dictionary:
	return {
		"generatedBy": fixture["generatedBy"],
		"primePool": Primes.PRIME_POOL,
		"timing": Timing.to_fixture(),
		"damage": _create_damage_fixture(),
		"comboDamage": _create_combo_damage_fixture(),
		"hashes": _create_hash_fixtures(fixture["hashes"]),
		"rng": _create_rng_fixtures(fixture["rng"]),
		"randomInts": _create_random_int_fixtures(fixture["randomInts"]),
		"stages": _create_stage_fixtures(fixture["stages"]),
		"selections": _create_selection_fixtures(fixture["selections"]),
		"soloRuns": _create_solo_fixtures(fixture["soloRuns"]),
		"roomSteps": _create_room_fixtures(),
	}

func _create_damage_fixture() -> Array:
	return Primes.PRIME_POOL.map(
		func(prime):
			return {
				"prime": prime,
				"factorDamage": Game.compute_battle_factor_damage(prime),
			}
	)

func _create_combo_damage_fixture() -> Array:
	var combo_damage := []

	for combo in range(10):
		combo_damage.append(
				{
					"combo": combo,
					"damage": Game.compute_battle_combo_damage(combo),
				}
		)

	return combo_damage

func _create_hash_fixtures(expected_hashes: Array) -> Array:
	return expected_hashes.map(
		func(expected_hash):
			var seed: String = expected_hash["seed"]

			return {
				"seed": seed,
				"hash": Random.hash_seed(seed),
			}
	)

func _create_rng_fixtures(expected_rng: Array) -> Array:
	return expected_rng.map(
		func(expected_entry):
			var seed: String = expected_entry["seed"]
			var rng: Random.Rng = Random.Rng.new(seed)
			var values := []

			for index in range(expected_entry["values"].size()):
				values.append(rng.next())

			return {
				"seed": seed,
				"values": values,
			}
	)

func _create_random_int_fixtures(expected_random_ints: Array) -> Array:
	return expected_random_ints.map(
		func(expected_entry):
			var seed: String = expected_entry["seed"]
			var rng: Random.Rng = Random.Rng.new(seed)
			var ranges := []

			for expected_range in expected_entry["ranges"]:
				ranges.append(
					{
						"min": expected_range["min"],
						"max": expected_range["max"],
						"value": Random.random_int(
							rng,
							expected_range["min"],
							expected_range["max"]
						),
					}
				)

			return {
				"seed": seed,
				"ranges": ranges,
			}
	)

func _create_stage_fixtures(expected_stages: Array) -> Array:
	return expected_stages.map(
		func(expected_stage):
			var seed: String = expected_stage["seed"]
			var stage_index: int = expected_stage["stageIndex"]

			return {
				"seed": seed,
				"stageIndex": stage_index,
				"stage": Game.generate_stage(seed, stage_index),
			}
	)

func _create_selection_fixtures(expected_selections: Array) -> Array:
	return expected_selections.map(
		func(expected_selection):
			var seed: String = expected_selection["seed"]
			var stage_index: int = expected_selection["stageIndex"]
			var prime: int = expected_selection["prime"]
			var stage: Dictionary = Game.generate_stage(seed, stage_index)

			return {
				"seed": seed,
				"stageIndex": stage_index,
				"prime": prime,
				"result": Game.apply_prime_selection(stage, prime),
			}
	)

func _create_solo_fixtures(expected_solo_runs: Array) -> Array:
	return expected_solo_runs.map(
		func(expected_run):
			var seed: String = expected_run["seed"]
			var state: Dictionary = Game.create_initial_solo_state(seed)
			var initial_state: Dictionary = state
			var steps := []

			for expected_step in expected_run["steps"]:
				var options: Dictionary = expected_step.get("options", {})
				var prime: int = expected_step["prime"]
				var before := state
				state = Game.advance_solo_state(state, seed, prime, options)
				var step := {
					"before": before,
					"after": state,
					"prime": prime,
				}

				if expected_step.has("options"):
					step["options"] = options

				steps.append(step)

			return {
				"seed": seed,
				"initialState": initial_state,
				"steps": steps,
				"finalState": state,
			}
	)

func _create_room_fixtures() -> Array:
	var snapshot: Dictionary = MultiplayerRoom.create_room_snapshot("duel-room", "host", "Host")
	var steps := [
		{
			"label": "created",
			"snapshot": snapshot,
		}
	]

	snapshot = MultiplayerRoom.add_player_to_room(snapshot, "guest", "Guest")
	steps.append(
		{
			"label": "guest-joined",
			"snapshot": snapshot,
		}
	)

	snapshot = MultiplayerRoom.set_player_ready(snapshot, "host", true)
	steps.append(
		{
			"label": "host-ready",
			"snapshot": snapshot,
		}
	)

	snapshot = MultiplayerRoom.set_player_ready(snapshot, "guest", true)
	steps.append(
		{
			"label": "guest-ready",
			"snapshot": snapshot,
		}
	)

	snapshot = MultiplayerRoom.begin_room_match(snapshot)
	steps.append(
		{
			"label": "playing",
			"snapshot": snapshot,
		}
	)

	var host_factors: Array = snapshot["players"][0]["stage"]["remainingFactors"].duplicate()

	for index in range(host_factors.size()):
		snapshot = MultiplayerRoom.apply_battle_prime_selection(
			snapshot,
			"host",
			host_factors[index],
			{
				"perfectSolveEligible": true,
				"resolvingQueueLength": host_factors.size(),
				"suppressAttack": index < host_factors.size() - 1,
			}
		)
		steps.append(
			{
				"label": "host-prime-%s" % [index + 1],
				"snapshot": snapshot,
			}
		)

	snapshot = MultiplayerRoom.apply_battle_penalty(snapshot, "guest")
	steps.append(
		{
			"label": "guest-penalty",
			"snapshot": snapshot,
		}
	)

	return steps

func _compare_variant(actual, expected, path: String) -> void:
	if failures.size() >= MAX_FAILURES:
		return

	if _is_number(actual) and _is_number(expected):
		if abs(float(actual) - float(expected)) > EPSILON:
			failures.append("%s expected %s but got %s" % [path, expected, actual])
		return

	if typeof(actual) != typeof(expected):
		failures.append(
			"%s expected type %s but got type %s" % [path, typeof(expected), typeof(actual)]
		)
		return

	if typeof(expected) == TYPE_ARRAY:
		_compare_array(actual, expected, path)
		return

	if typeof(expected) == TYPE_DICTIONARY:
		_compare_dictionary(actual, expected, path)
		return

	if actual != expected:
		failures.append("%s expected %s but got %s" % [path, expected, actual])

func _compare_array(actual: Array, expected: Array, path: String) -> void:
	if actual.size() != expected.size():
		failures.append("%s expected %s item(s) but got %s" % [path, expected.size(), actual.size()])
		return

	for index in range(expected.size()):
		_compare_variant(actual[index], expected[index], "%s[%s]" % [path, index])

func _compare_dictionary(actual: Dictionary, expected: Dictionary, path: String) -> void:
	for key in expected.keys():
		if not actual.has(key):
			failures.append("%s.%s is missing" % [path, key])
			continue

		_compare_variant(actual[key], expected[key], "%s.%s" % [path, key])

	for key in actual.keys():
		if not expected.has(key):
			failures.append("%s.%s was not expected" % [path, key])

func _is_number(value) -> bool:
	return typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT
