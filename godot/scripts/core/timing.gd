class_name AtomizeTiming
extends RefCounted

const SOLO_COMBO_STEP_DELAY_MS := 140
const MULTIPLAYER_COMBO_STEP_DELAY_MS := 220
const BLOB_REVEAL_TOTAL_MS := 3000
const KEYBOARD_DIGIT_BUFFER_WINDOW_MS := 250
const DAMAGE_POP_LIFETIME_MS := 780
const SELF_FAULT_DURATION_MS := 600
const PERFECT_BURST_DURATION_MS := 1120
const HP_IMPACT_TAIL_MS := 240
const HP_LOSS_BASE_DURATION_MS := 220
const HP_LOSS_PER_POINT_DURATION_MS := 28
const HP_REGEN_BASE_DURATION_MS := 260
const HP_REGEN_PER_POINT_DURATION_MS := 24
const HP_ZERO_HOLD_MS := 900

static func to_fixture() -> Dictionary:
	return {
		"blobRevealTotalMs": BLOB_REVEAL_TOTAL_MS,
		"damagePopLifetimeMs": DAMAGE_POP_LIFETIME_MS,
		"hpImpactTailMs": HP_IMPACT_TAIL_MS,
		"hpLossBaseDurationMs": HP_LOSS_BASE_DURATION_MS,
		"hpLossPerPointDurationMs": HP_LOSS_PER_POINT_DURATION_MS,
		"hpRegenBaseDurationMs": HP_REGEN_BASE_DURATION_MS,
		"hpRegenPerPointDurationMs": HP_REGEN_PER_POINT_DURATION_MS,
		"hpZeroHoldMs": HP_ZERO_HOLD_MS,
		"keyboardDigitBufferWindowMs": KEYBOARD_DIGIT_BUFFER_WINDOW_MS,
		"multiplayerComboStepDelayMs": MULTIPLAYER_COMBO_STEP_DELAY_MS,
		"perfectBurstDurationMs": PERFECT_BURST_DURATION_MS,
		"selfFaultDurationMs": SELF_FAULT_DURATION_MS,
		"soloComboStepDelayMs": SOLO_COMBO_STEP_DELAY_MS,
	}
