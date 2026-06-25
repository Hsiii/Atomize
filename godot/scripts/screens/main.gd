extends Control

const Game := preload("res://scripts/core/game.gd")

const BEST_SCORE_PATH := "user://best_score.json"
const COMBO_QUEUE_MAX_ITEMS := 7
const SOLO_DURATION_SECONDS := 60.0
const SOLO_COMBO_STEP_DELAY_SECONDS := 0.18
const SOLO_SEED_PREFIX := "godot-mobile"
const PRIME_COMPENSATION_FACTORS := {
	2: 0.2,
	3: 0.2,
	5: 0.2,
	7: 0.4,
	11: 0.4,
	13: 0.4,
	17: 0.8,
	19: 0.8,
	23: 0.8,
}

enum Screen {
	HOME,
	HELP,
	SOLO,
	PAUSED,
	GAME_OVER,
}

var screen := Screen.HOME
var previous_screen := Screen.HOME
var run_seed := ""
var solo_state: Dictionary
var solo_time_left := SOLO_DURATION_SECONDS
var prime_queue: Array[int] = []
var resolving_queue: Array[int] = []
var submitted_queue_length := 0
var resolve_elapsed := 0.0
var last_result_text := ""
var best_score := 0
var best_combo := 0
var did_set_new_best := false

var root_margin: MarginContainer
var content: VBoxContainer
var stage_label: Label
var timer_label: Label
var score_label: Label
var target_label: Label
var factors_label: Label
var queue_label: Label
var result_label: Label
var prime_grid: GridContainer
var submit_button: Button
var backspace_button: Button

func _ready() -> void:
	best_score = _load_best_score()
	best_combo = _load_best_combo()
	_start_home()

func _process(delta: float) -> void:
	if screen != Screen.SOLO:
		return

	if resolving_queue.is_empty():
		solo_time_left = max(0.0, solo_time_left - delta)
		if solo_time_left <= 0.0:
			_finish_game()
			return

		_render_solo()
		return

	resolve_elapsed += delta
	if resolve_elapsed < SOLO_COMBO_STEP_DELAY_SECONDS:
		return

	resolve_elapsed = 0.0
	_resolve_next_queued_prime()

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED and screen == Screen.SOLO:
		_pause_game()

func _unhandled_input(event: InputEvent) -> void:
	if not event.is_pressed():
		return

	if event.is_action_pressed("ui_cancel"):
		if screen == Screen.SOLO:
			_pause_game()
		elif screen == Screen.PAUSED:
			_resume_game()
		elif screen == Screen.HELP or screen == Screen.GAME_OVER:
			_start_home()

func _start_home() -> void:
	screen = Screen.HOME
	prime_queue.clear()
	resolving_queue.clear()
	_build_base_layout()

	var title := _make_label("Atomize", 44, HORIZONTAL_ALIGNMENT_CENTER)
	title.add_theme_color_override("font_color", Color("#f8fafc"))
	content.add_child(title)

	var subtitle := _make_label(
		"Prime factorization built for touch-speed mobile testing.",
		18,
		HORIZONTAL_ALIGNMENT_CENTER
	)
	subtitle.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(subtitle)

	var stats := _make_label(
		"Best %s  Combo %s" % [best_score, best_combo],
		18,
		HORIZONTAL_ALIGNMENT_CENTER
	)
	stats.add_theme_color_override("font_color", Color("#fbbf24"))
	content.add_child(stats)

	content.add_spacer(false)
	content.add_child(_make_action_button("Play Solo", _start_solo_game, Color("#22c55e")))
	content.add_child(_make_action_button("How To Play", _start_help, Color("#38bdf8")))
	content.add_child(_make_action_button("Reset Best", _reset_best_score, Color("#f97316")))
	content.add_spacer(false)

	var note := _make_label(
		"Native Godot build: solo mode, scoring, combos, timer, pause, and saved best score.",
		14,
		HORIZONTAL_ALIGNMENT_CENTER
	)
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note.add_theme_color_override("font_color", Color("#cbd5e1"))
	content.add_child(note)

func _start_help() -> void:
	screen = Screen.HELP
	_build_base_layout()

	content.add_child(_make_label("How To Play", 34, HORIZONTAL_ALIGNMENT_CENTER))

	var copy := _make_label(
		"Break the target into prime factors. Tap primes to build a queue, then submit. Clear the full target with the exact factors to score. Wrong primes cost HP and time. Bigger primes and longer exact clears pay better.",
		18,
		HORIZONTAL_ALIGNMENT_CENTER
	)
	copy.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	copy.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(copy)

	var examples := _make_label(
		"Example: 66 = 2 x 3 x 11. Queue 2, 3, 11 and submit.",
		18,
		HORIZONTAL_ALIGNMENT_CENTER
	)
	examples.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	examples.add_theme_color_override("font_color", Color("#fbbf24"))
	content.add_child(examples)

	content.add_spacer(false)
	content.add_child(_make_action_button("Start Solo", _start_solo_game, Color("#22c55e")))
	content.add_child(_make_action_button("Back", _start_home, Color("#64748b")))

func _start_solo_game() -> void:
	run_seed = "%s:%s" % [SOLO_SEED_PREFIX, Time.get_ticks_usec()]
	solo_state = Game.create_initial_solo_state(run_seed)
	solo_time_left = SOLO_DURATION_SECONDS
	prime_queue.clear()
	resolving_queue.clear()
	submitted_queue_length = 0
	resolve_elapsed = 0.0
	last_result_text = ""
	did_set_new_best = false
	screen = Screen.SOLO
	_build_solo_layout()
	_render_solo()

func _pause_game() -> void:
	if screen != Screen.SOLO:
		return

	previous_screen = screen
	screen = Screen.PAUSED
	_build_pause_layout()

func _resume_game() -> void:
	if screen != Screen.PAUSED:
		return

	screen = previous_screen
	_build_solo_layout()
	_render_solo()

func _finish_game() -> void:
	solo_time_left = 0.0
	resolving_queue.clear()
	prime_queue.clear()
	var final_score := int(solo_state["score"])
	var final_combo := int(solo_state["maxCombo"])
	did_set_new_best = _save_best_score(final_score, final_combo)
	best_score = _load_best_score()
	best_combo = _load_best_combo()
	screen = Screen.GAME_OVER
	_build_game_over_layout()

func _build_base_layout() -> void:
	for child in get_children():
		child.queue_free()

	root_margin = MarginContainer.new()
	root_margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root_margin.add_theme_constant_override("margin_left", 24)
	root_margin.add_theme_constant_override("margin_top", 32)
	root_margin.add_theme_constant_override("margin_right", 24)
	root_margin.add_theme_constant_override("margin_bottom", 32)
	add_child(root_margin)

	var panel := PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color("#111827")))
	root_margin.add_child(panel)

	content = VBoxContainer.new()
	content.add_theme_constant_override("separation", 16)
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.size_flags_vertical = Control.SIZE_EXPAND_FILL
	panel.add_child(content)

func _build_solo_layout() -> void:
	_build_base_layout()

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 12)
	content.add_child(header)

	stage_label = _make_label("", 16, HORIZONTAL_ALIGNMENT_LEFT)
	stage_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(stage_label)

	timer_label = _make_label("", 16, HORIZONTAL_ALIGNMENT_RIGHT)
	timer_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(timer_label)

	score_label = _make_label("", 16, HORIZONTAL_ALIGNMENT_CENTER)
	content.add_child(score_label)

	target_label = _make_label("", 64, HORIZONTAL_ALIGNMENT_CENTER)
	target_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	target_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	target_label.add_theme_color_override("font_color", Color("#f8fafc"))
	content.add_child(target_label)

	factors_label = _make_label("", 16, HORIZONTAL_ALIGNMENT_CENTER)
	factors_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(factors_label)

	queue_label = _make_label("", 18, HORIZONTAL_ALIGNMENT_CENTER)
	queue_label.add_theme_color_override("font_color", Color("#fbbf24"))
	content.add_child(queue_label)

	result_label = _make_label("", 15, HORIZONTAL_ALIGNMENT_CENTER)
	content.add_child(result_label)

	prime_grid = GridContainer.new()
	prime_grid.columns = 3
	prime_grid.add_theme_constant_override("h_separation", 12)
	prime_grid.add_theme_constant_override("v_separation", 12)
	prime_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	prime_grid.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(prime_grid)

	for prime in Game.get_playable_stage_primes():
		var button := Button.new()
		button.text = str(prime)
		button.custom_minimum_size = Vector2(88, 64)
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.size_flags_vertical = Control.SIZE_EXPAND_FILL
		button.add_theme_font_size_override("font_size", 24)
		button.add_theme_stylebox_override("normal", _make_button_style(Color("#1d4ed8")))
		button.add_theme_stylebox_override("hover", _make_button_style(Color("#2563eb")))
		button.add_theme_stylebox_override("pressed", _make_button_style(Color("#1e40af")))
		button.pressed.connect(_queue_prime.bind(int(prime)))
		prime_grid.add_child(button)

	var action_row := HBoxContainer.new()
	action_row.add_theme_constant_override("separation", 12)
	content.add_child(action_row)

	backspace_button = _make_action_button("Backspace", _backspace_queue, Color("#64748b"))
	backspace_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_row.add_child(backspace_button)

	submit_button = _make_action_button("Submit", _submit_queue, Color("#22c55e"))
	submit_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_row.add_child(submit_button)

	var pause_button := _make_action_button("Pause", _pause_game, Color("#f97316"))
	pause_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_row.add_child(pause_button)

func _build_pause_layout() -> void:
	_build_base_layout()
	content.add_spacer(false)
	content.add_child(_make_label("Paused", 40, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_label("Score %s" % int(solo_state["score"]), 20, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_action_button("Resume", _resume_game, Color("#22c55e")))
	content.add_child(_make_action_button("Restart", _start_solo_game, Color("#38bdf8")))
	content.add_child(_make_action_button("Home", _start_home, Color("#64748b")))
	content.add_spacer(false)

func _build_game_over_layout() -> void:
	_build_base_layout()
	content.add_spacer(false)

	var title_text := "New Best" if did_set_new_best else "Time Up"
	content.add_child(_make_label(title_text, 40, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_label("Score %s" % int(solo_state["score"]), 28, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_label("Atomized %s" % int(solo_state["clearedStages"]), 20, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_label("Max combo %s" % int(solo_state["maxCombo"]), 20, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_label("Best %s" % best_score, 20, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_action_button("Play Again", _start_solo_game, Color("#22c55e")))
	content.add_child(_make_action_button("Home", _start_home, Color("#64748b")))
	content.add_spacer(false)

func _render_solo() -> void:
	if screen != Screen.SOLO:
		return

	var stage: Dictionary = solo_state["currentStage"]
	stage_label.text = "Stage %s" % [int(solo_state["clearedStages"]) + 1]
	timer_label.text = "Time %s" % ceili(solo_time_left)
	score_label.text = "HP %s / %s   Score %s   Combo %s" % [
		int(solo_state["hp"]),
		Game.SOLO_MAX_HP,
		int(solo_state["score"]),
		int(solo_state["combo"]),
	]
	target_label.text = str(stage["remainingValue"])
	factors_label.text = "Factors left: %s" % _join_numbers(stage["remainingFactors"])
	queue_label.text = "Queue: %s" % (_join_numbers(prime_queue) if not prime_queue.is_empty() else "-")
	result_label.text = last_result_text

	var is_busy := not resolving_queue.is_empty()
	submit_button.disabled = is_busy or prime_queue.is_empty()
	backspace_button.disabled = is_busy or prime_queue.is_empty()

	for child in prime_grid.get_children():
		if child is Button:
			child.disabled = is_busy or prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS

func _queue_prime(prime: int) -> void:
	if screen != Screen.SOLO or not resolving_queue.is_empty():
		return

	if prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS:
		last_result_text = "Queue full"
		_render_solo()
		return

	prime_queue.append(prime)
	last_result_text = ""
	_render_solo()

func _backspace_queue() -> void:
	if screen != Screen.SOLO or not resolving_queue.is_empty() or prime_queue.is_empty():
		return

	prime_queue.pop_back()
	last_result_text = ""
	_render_solo()

func _submit_queue() -> void:
	if screen != Screen.SOLO or prime_queue.is_empty() or not resolving_queue.is_empty():
		return

	resolving_queue = prime_queue.duplicate()
	submitted_queue_length = resolving_queue.size()
	prime_queue.clear()
	resolve_elapsed = SOLO_COMBO_STEP_DELAY_SECONDS
	last_result_text = "Resolving..."
	_render_solo()

func _resolve_next_queued_prime() -> void:
	if resolving_queue.is_empty():
		return

	var next_prime: int = int(resolving_queue.pop_front())
	var current_state: Dictionary = solo_state
	var outcome: Dictionary = Game.apply_prime_selection(current_state["currentStage"], next_prime)

	if outcome["kind"] == "wrong":
		solo_state = Game.apply_solo_penalty(current_state)
		solo_time_left = max(0.0, solo_time_left - 1.0)
		resolving_queue.clear()
		last_result_text = "Miss: -1 HP and -1s"
		_render_solo()
		return

	var has_redundant_buffered_primes: bool = outcome["cleared"] and not resolving_queue.is_empty()
	var options: Dictionary = {}
	if outcome["cleared"] and not has_redundant_buffered_primes:
		options["resolvingQueueLength"] = submitted_queue_length

	var next_state: Dictionary = Game.advance_solo_state(current_state, run_seed, next_prime, options)

	if outcome["cleared"]:
		_apply_time_compensation(current_state, submitted_queue_length)

	if has_redundant_buffered_primes:
		solo_state = Game.apply_solo_penalty(next_state)
		solo_time_left = max(0.0, solo_time_left - 1.0)
		resolving_queue.clear()
		last_result_text = "Overrun: target cleared before queue ended"
	else:
		solo_state = next_state
		last_result_text = "Cleared" if outcome["cleared"] else "Hit +%s" % Game.compute_battle_factor_damage(next_prime)

	if resolving_queue.is_empty():
		submitted_queue_length = 0

	_render_solo()

func _apply_time_compensation(state_before_clear: Dictionary, queue_length: int) -> void:
	var stage: Dictionary = state_before_clear["currentStage"]
	var factors: Array = stage["factors"]
	var used_primes := factors.slice(max(0, factors.size() - queue_length), factors.size())
	var is_perfect := queue_length == factors.size()
	var compensation := 0.0

	for prime in used_primes:
		compensation += float(PRIME_COMPENSATION_FACTORS.get(int(prime), 0.0))

	if is_perfect:
		compensation *= 2.0

	solo_time_left += compensation

func _reset_best_score() -> void:
	best_score = 0
	best_combo = 0
	var file := FileAccess.open(BEST_SCORE_PATH, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify({"score": 0, "maxCombo": 0}))

	_start_home()

func _load_best_score() -> int:
	return int(_load_best_record().get("score", 0))

func _load_best_combo() -> int:
	return int(_load_best_record().get("maxCombo", 0))

func _load_best_record() -> Dictionary:
	if not FileAccess.file_exists(BEST_SCORE_PATH):
		return {"score": 0, "maxCombo": 0}

	var file := FileAccess.open(BEST_SCORE_PATH, FileAccess.READ)
	if file == null:
		return {"score": 0, "maxCombo": 0}

	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return {"score": 0, "maxCombo": 0}

	return parsed

func _save_best_score(score: int, max_combo: int) -> bool:
	var record := _load_best_record()
	var current_best_score := int(record.get("score", 0))
	var current_best_combo := int(record.get("maxCombo", 0))

	if score < current_best_score or (score == current_best_score and max_combo <= current_best_combo):
		return false

	var file := FileAccess.open(BEST_SCORE_PATH, FileAccess.WRITE)
	if file == null:
		return false

	file.store_string(JSON.stringify({"score": score, "maxCombo": max_combo}))
	return true

func _make_label(text: String, font_size: int, alignment: HorizontalAlignment) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = alignment
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", Color("#e2e8f0"))
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return label

func _make_action_button(text: String, callback: Callable, color: Color) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 56)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_font_size_override("font_size", 18)
	button.add_theme_stylebox_override("normal", _make_button_style(color))
	button.add_theme_stylebox_override("hover", _make_button_style(color.lightened(0.08)))
	button.add_theme_stylebox_override("pressed", _make_button_style(color.darkened(0.12)))
	button.add_theme_stylebox_override("disabled", _make_button_style(Color("#334155")))
	button.pressed.connect(callback)
	return button

func _make_button_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_right = 8
	style.corner_radius_bottom_left = 8
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	return style

func _make_panel_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_right = 8
	style.corner_radius_bottom_left = 8
	style.content_margin_left = 20
	style.content_margin_right = 20
	style.content_margin_top = 20
	style.content_margin_bottom = 20
	return style

func _join_numbers(numbers: Array) -> String:
	var labels: Array[String] = []

	for number in numbers:
		labels.append(str(number))

	return " x ".join(labels)
