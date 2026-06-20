extends Control

const SOLO_SEED := "godot-local"

var solo_state: Dictionary
var stage_label: Label
var target_label: Label
var remaining_label: Label
var stats_label: Label
var result_label: Label
var button_grid: GridContainer

func _ready() -> void:
	solo_state = AtomizeGame.create_initial_solo_state(SOLO_SEED)
	_build_layout()
	_render()

func _build_layout() -> void:
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_top", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_bottom", 24)
	add_child(margin)

	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 16)
	margin.add_child(stack)

	var title_label := Label.new()
	title_label.text = "Atomize"
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 32)
	stack.add_child(title_label)

	stage_label = Label.new()
	stage_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stack.add_child(stage_label)

	target_label = Label.new()
	target_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	target_label.add_theme_font_size_override("font_size", 40)
	stack.add_child(target_label)

	remaining_label = Label.new()
	remaining_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stack.add_child(remaining_label)

	stats_label = Label.new()
	stats_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stack.add_child(stats_label)

	button_grid = GridContainer.new()
	button_grid.columns = 3
	button_grid.size_flags_vertical = Control.SIZE_EXPAND_FILL
	button_grid.add_theme_constant_override("h_separation", 12)
	button_grid.add_theme_constant_override("v_separation", 12)
	stack.add_child(button_grid)

	for prime in AtomizeGame.get_playable_stage_primes():
		var button := Button.new()
		button.text = str(prime)
		button.custom_minimum_size = Vector2(96, 72)
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.size_flags_vertical = Control.SIZE_EXPAND_FILL
		button.pressed.connect(_on_prime_pressed.bind(prime))
		button_grid.add_child(button)

	result_label = Label.new()
	result_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	result_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	stack.add_child(result_label)

	var reset_button := Button.new()
	reset_button.text = "Reset"
	reset_button.custom_minimum_size = Vector2(0, 56)
	reset_button.pressed.connect(_on_reset_pressed)
	stack.add_child(reset_button)

func _on_prime_pressed(prime: int) -> void:
	var current_stage: Dictionary = solo_state["currentStage"]
	var outcome := AtomizeGame.apply_prime_selection(current_stage, prime)
	var was_cleared := outcome["kind"] == "correct" and outcome["cleared"]
	solo_state = AtomizeGame.advance_solo_state(solo_state, SOLO_SEED, prime)

	if outcome["kind"] == "wrong":
		result_label.text = "Miss: -1 HP"
	elif was_cleared:
		result_label.text = "Cleared"
	else:
		result_label.text = "Hit"

	_render()

func _on_reset_pressed() -> void:
	solo_state = AtomizeGame.create_initial_solo_state(SOLO_SEED)
	result_label.text = ""
	_render()

func _render() -> void:
	var stage: Dictionary = solo_state["currentStage"]
	stage_label.text = "Stage %s" % [int(solo_state["clearedStages"]) + 1]
	target_label.text = str(stage["remainingValue"])
	remaining_label.text = "Factors left: %s" % _join_numbers(stage["remainingFactors"])
	stats_label.text = "HP %s / %s  Score %s  Combo %s" % [
		solo_state["hp"],
		AtomizeGame.SOLO_MAX_HP,
		solo_state["score"],
		solo_state["combo"],
	]

func _join_numbers(numbers: Array) -> String:
	var labels: Array[String] = []

	for number in numbers:
		labels.append(str(number))

	return " x ".join(labels)
