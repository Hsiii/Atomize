class_name AtomizeGame
extends RefCounted

const Random := preload("res://scripts/core/random.gd")
const MAX_FACTOR_COUNT := 7
const MAX_PLAYABLE_PRIME_COUNT := 9
const MIN_FACTOR_COUNT := 2
const MAX_STAGE_VALUE := 1000000
const MIN_PRIME := 2
const SOLO_MAX_HP := 1000
const PLAYABLE_STAGE_PRIMES := [2, 3, 5, 7, 11, 13, 17, 19, 23]
const LARGE_REPEAT_STAGE_CHANCE := 0.38
const LARGE_REPEAT_STAGE_START := 1
const MAX_LARGE_REPEAT_COUNT := 3

static func apply_solo_penalty(state: Dictionary) -> Dictionary:
	return {
		"hp": max(0, int(state["hp"]) - 1),
		"combo": 0,
		"maxCombo": state["maxCombo"],
		"score": state["score"],
		"clearedStages": state["clearedStages"],
		"currentStage": state["currentStage"],
	}

static func generate_stage(seed: String, stage_index: int) -> Dictionary:
	var rng: Random.Rng = Random.Rng.new("%s:%s" % [seed, stage_index])
	var factor_count: int = min(
		MAX_FACTOR_COUNT,
		MIN_FACTOR_COUNT + floori(float(stage_index) / 2.0) + Random.random_int(rng, 0, 1)
	)
	var factors: Array = []
	var should_use_large_repeat_prime := (
		stage_index >= LARGE_REPEAT_STAGE_START and rng.next() < LARGE_REPEAT_STAGE_CHANCE
	)
	var large_repeat_prime = pick_large_repeat_prime(rng) if should_use_large_repeat_prime else null
	var desired_large_repeat_count = (
		0
		if large_repeat_prime == null
		else get_desired_large_repeat_count(stage_index, factor_count, rng)
	)
	var placed_large_repeat_count := 0
	var target_value := 1

	for count in range(factor_count):
		var remaining_slots: int = factor_count - count - 1
		var reserved_value := int(MIN_PRIME ** remaining_slots)
		var max_prime_value := floori(float(MAX_STAGE_VALUE) / float(target_value * reserved_value))
		var can_place_more_large_repeats := (
			large_repeat_prime != null and placed_large_repeat_count < desired_large_repeat_count
		)

		if can_place_more_large_repeats and large_repeat_prime <= max_prime_value:
			factors.append(large_repeat_prime)
			target_value *= large_repeat_prime
			placed_large_repeat_count += 1
			continue

		var available_primes := get_available_stage_primes(
			max_prime_value,
			factors,
			large_repeat_prime,
			can_place_more_large_repeats
		)
		var selectable_primes := (
			get_fallback_stage_primes(max_prime_value) if available_primes.is_empty() else available_primes
		)

		if selectable_primes.is_empty():
			break

		var selected_prime := pick_stage_prime(selectable_primes, rng, large_repeat_prime)

		factors.append(selected_prime)
		target_value *= selected_prime

	factors.sort()

	return {
		"stageIndex": stage_index,
		"targetValue": target_value,
		"remainingValue": target_value,
		"factors": factors,
		"remainingFactors": factors.duplicate(),
	}

static func apply_prime_selection(stage: Dictionary, selected_prime: int) -> Dictionary:
	var remaining_factors: Array = stage["remainingFactors"]
	var factor_index := remaining_factors.find(selected_prime)

	if factor_index == -1:
		return {
			"kind": "wrong",
			"stage": stage,
			"selectedPrime": selected_prime,
		}

	var next_remaining_factors := remaining_factors.duplicate()
	next_remaining_factors.remove_at(factor_index)

	var next_stage := stage.duplicate(true)
	next_stage["remainingFactors"] = next_remaining_factors
	next_stage["remainingValue"] = int(stage["remainingValue"] / selected_prime)

	return {
		"kind": "correct",
		"stage": next_stage,
		"cleared": next_remaining_factors.is_empty(),
	}

static func create_initial_solo_state(seed: String) -> Dictionary:
	return {
		"hp": SOLO_MAX_HP,
		"combo": 0,
		"maxCombo": 0,
		"score": 0,
		"clearedStages": 0,
		"currentStage": generate_stage(seed, 0),
	}

static func advance_solo_state(
	state: Dictionary,
	seed: String,
	selected_prime: int,
	options: Dictionary = {}
) -> Dictionary:
	var outcome: Dictionary = apply_prime_selection(state["currentStage"], selected_prime)

	if outcome["kind"] == "wrong":
		return apply_solo_penalty(state)

	if not outcome["cleared"]:
		return {
			"hp": state["hp"],
			"combo": state["combo"],
			"maxCombo": state["maxCombo"],
			"score": state["score"] + compute_battle_factor_damage(selected_prime),
			"clearedStages": state["clearedStages"],
			"currentStage": outcome["stage"],
		}

	var next_stage_index := int(state["clearedStages"]) + 1
	var next_combo: int = max(1, int(options.get("resolvingQueueLength", 1)))
	var factor_damage: int = compute_battle_factor_damage(selected_prime)
	var combo_damage: int = compute_battle_combo_damage(next_combo)

	return {
		"hp": min(SOLO_MAX_HP, int(state["hp"]) + (1 if next_stage_index % 5 == 0 else 0)),
		"combo": next_combo,
		"maxCombo": max(int(state["maxCombo"]), next_combo),
		"score": state["score"] + factor_damage + combo_damage,
		"clearedStages": next_stage_index,
		"currentStage": generate_stage(seed, next_stage_index),
	}

static func compute_battle_factor_damage(selected_prime: int) -> int:
	return selected_prime * 2

static func compute_battle_combo_damage(combo: int) -> int:
	return max(0, combo - 1) * 16

static func get_playable_stage_primes() -> Array:
	return PLAYABLE_STAGE_PRIMES.duplicate()

static func is_large_repeat_prime(prime: int) -> bool:
	return prime == 19 or prime == 23

static func get_available_stage_primes(
	max_prime_value: int,
	factors: Array,
	large_repeat_prime = null,
	can_place_more_large_repeats := false
) -> Array:
	var has_large_repeat_prime := factors.any(func(factor): return is_large_repeat_prime(factor))
	var has_two := factors.has(2)
	var has_five := factors.has(5)
	var available_primes: Array = []

	for prime in PLAYABLE_STAGE_PRIMES:
		if prime > max_prime_value:
			continue

		if (prime == 5 and has_two) or (prime == 2 and has_five):
			continue

		if not is_large_repeat_prime(prime):
			available_primes.append(prime)
			continue

		if prime == large_repeat_prime:
			if can_place_more_large_repeats or not factors.has(prime):
				available_primes.append(prime)
			continue

		if not has_large_repeat_prime:
			available_primes.append(prime)

	return available_primes

static func pick_stage_prime(available_primes: Array, rng: Random.Rng, large_repeat_prime = null) -> int:
	var weighted_primes: Array = []

	for prime in available_primes:
		var weight := 1

		if large_repeat_prime != null:
			if prime <= 7:
				weight = 4
			elif prime <= 13:
				weight = 2
			elif prime == 17:
				weight = 1

		for count in range(weight):
			weighted_primes.append(prime)

	return weighted_primes[Random.random_int(rng, 0, weighted_primes.size() - 1)]

static func get_fallback_stage_primes(max_prime_value: int) -> Array:
	var fallback_primes: Array = []

	for prime in PLAYABLE_STAGE_PRIMES:
		if prime <= max_prime_value:
			fallback_primes.append(prime)

	return fallback_primes

static func pick_large_repeat_prime(rng: Random.Rng) -> int:
	var weighted_large_primes := [19, 19, 23]

	return weighted_large_primes[
		Random.random_int(rng, 0, weighted_large_primes.size() - 1)
	]

static func get_desired_large_repeat_count(stage_index: int, factor_count: int, rng: Random.Rng) -> int:
	var max_repeat_count = min(
		factor_count,
		min(1 + floori(float(stage_index) / 4.0), MAX_LARGE_REPEAT_COUNT)
	)

	if max_repeat_count <= 1:
		return 1

	return Random.random_int(rng, 1, max_repeat_count)
