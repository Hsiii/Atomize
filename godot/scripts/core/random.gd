class_name AtomizeRandom
extends RefCounted

const UINT32_MAX := 0xffffffff

class Rng:
	var state: int

	func _init(seed: String) -> void:
		state = hash_seed(seed)
		if state == 0:
			state = 1

	func next() -> float:
		state = u32(state + 0x6d2b79f5)
		var output := imul(
			u32(state ^ unsigned_right_shift(state, 15)),
			u32(1 | state)
		)
		output = u32(
			output
			^ u32(
				output
				+ imul(
					u32(output ^ unsigned_right_shift(output, 7)),
					u32(61 | output)
				)
			)
		)

		return (
			float(u32(output ^ unsigned_right_shift(output, 14)))
			/ 4294967296.0
		)

	static func hash_seed(seed: String) -> int:
		var hash := 2166136261

		for index in range(seed.length()):
			hash = u32(hash ^ seed.unicode_at(index))
			hash = imul(hash, 16777619)

		return u32(hash)

	static func u32(value: int) -> int:
		return value & UINT32_MAX

	static func unsigned_right_shift(value: int, bits: int) -> int:
		return u32(value) >> bits

	static func imul(left: int, right: int) -> int:
		var left_low := left & 0xffff
		var left_high := (left >> 16) & 0xffff
		var right_low := right & 0xffff
		var right_high := (right >> 16) & 0xffff

		return u32(
			left_low * right_low
			+ (((left_high * right_low + left_low * right_high) & 0xffff) << 16)
		)

static func hash_seed(seed: String) -> int:
	var hash := 2166136261

	for index in range(seed.length()):
		hash = u32(hash ^ seed.unicode_at(index))
		hash = imul(hash, 16777619)

	return u32(hash)

static func random_int(rng: Rng, min_value: int, max_value: int) -> int:
	return int(floor(rng.next() * float(max_value - min_value + 1))) + min_value

static func u32(value: int) -> int:
	return value & UINT32_MAX

static func unsigned_right_shift(value: int, bits: int) -> int:
	return u32(value) >> bits

static func imul(left: int, right: int) -> int:
	var left_low := left & 0xffff
	var left_high := (left >> 16) & 0xffff
	var right_low := right & 0xffff
	var right_high := (right >> 16) & 0xffff

	return u32(
		left_low * right_low
		+ (((left_high * right_low + left_low * right_high) & 0xffff) << 16)
	)
