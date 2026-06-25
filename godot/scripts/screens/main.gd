extends Control

const Game := preload("res://scripts/core/game.gd")

const BEST_SCORE_PATH := "user://best_score.json"
const COMBO_QUEUE_MAX_ITEMS := 7
const SOLO_DURATION_SECONDS := 60.0
const SOLO_COMBO_STEP_DELAY_SECONDS := 0.18
const SOLO_SEED_PREFIX := "godot-mobile"
const VERSION_LABEL := "v0.0.0"
const COLOR_PRIMARY := Color("#184e77")
const COLOR_PRIMARY_STRONG := Color("#168aad")
const COLOR_SECONDARY := Color("#34a0a4")
const COLOR_INK := Color("#223247")
const COLOR_PAGE_BG := Color("#f4f7fb")
const COLOR_SURFACE := Color("#ffffff")
const COLOR_TEXT_INVERSE := Color("#ffffff")
const COLOR_TEXT_INVERSE_SOFT := Color(1.0, 1.0, 1.0, 0.64)
const COLOR_BORDER_INVERSE_SOFT := Color(1.0, 1.0, 1.0, 0.28)
const COLOR_BUTTON_DISABLED := Color(0.094, 0.306, 0.467, 0.12)
const HOME_BLOB_SIZE := 144.0
const HOME_BLOB_GAP := 24.0
const HOME_MENU_BUTTON_SIZE := 44.0
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
var home_menu_open := false

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
	home_menu_open = false
	_build_home_layout()

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
	_clear_screen()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

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
	panel.add_theme_stylebox_override("panel", _make_panel_style(COLOR_SURFACE))
	root_margin.add_child(panel)

	content = VBoxContainer.new()
	content.add_theme_constant_override("separation", 16)
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.size_flags_vertical = Control.SIZE_EXPAND_FILL
	panel.add_child(content)

func _build_home_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var title_orb_diameter: float = max(viewport_size.x * 1.6, viewport_size.y * 1.3)
	var title_orb := Panel.new()
	title_orb.size = Vector2(title_orb_diameter, title_orb_diameter)
	title_orb.position = Vector2(
		(viewport_size.x - title_orb_diameter) / 2.0,
		(viewport_size.y * 0.5) - title_orb_diameter
	)
	title_orb.add_theme_stylebox_override(
		"panel",
		_make_circle_style(COLOR_PRIMARY, title_orb_diameter / 2.0, COLOR_PRIMARY, 0)
	)
	add_child(title_orb)

	var version_label := _make_absolute_label(VERSION_LABEL, 12, COLOR_TEXT_INVERSE_SOFT, 600)
	version_label.position = Vector2(12, 12)
	version_label.size = Vector2(96, 24)
	add_child(version_label)

	var menu_button := _make_home_menu_button()
	menu_button.position = Vector2(viewport_size.x - HOME_MENU_BUTTON_SIZE - 12.0, 10.0)
	add_child(menu_button)
	_build_home_dropdown(menu_button.position + Vector2(-92, HOME_MENU_BUTTON_SIZE + 4))

	var title_row := _make_home_title()
	title_row.size = Vector2(min(viewport_size.x * 0.92, 320.0), 72)
	title_row.position = Vector2(
		(viewport_size.x - title_row.size.x) / 2.0,
		(viewport_size.y * 0.25) - 36.0
	)
	add_child(title_row)

	var total_blob_width := (HOME_BLOB_SIZE * 2.0) + HOME_BLOB_GAP
	var blob_left := (viewport_size.x - total_blob_width) / 2.0
	var blob_top := viewport_size.y * 0.63
	var solo_button := _make_home_blob_button("SOLO", _start_solo_game, COLOR_PRIMARY_STRONG, "timer")
	solo_button.position = Vector2(blob_left, blob_top)
	add_child(solo_button)

	var help_button := _make_home_blob_button("HELP", _start_help, COLOR_SECONDARY, "help")
	help_button.position = Vector2(blob_left + HOME_BLOB_SIZE + HOME_BLOB_GAP, blob_top)
	add_child(help_button)

func _build_home_dropdown(position: Vector2) -> void:
	if not home_menu_open:
		return

	var dropdown := VBoxContainer.new()
	dropdown.position = position
	dropdown.size = Vector2(128, 52)
	dropdown.add_theme_constant_override("separation", 8)
	add_child(dropdown)

	var reset_button := _make_dropdown_button("Reset Best", _reset_best_score)
	dropdown.add_child(reset_button)

func _toggle_home_menu() -> void:
	home_menu_open = not home_menu_open
	_build_home_layout()

func _clear_screen() -> void:
	for child in get_children():
		child.queue_free()

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
	target_label.add_theme_color_override("font_color", COLOR_INK)
	content.add_child(target_label)

	factors_label = _make_label("", 16, HORIZONTAL_ALIGNMENT_CENTER)
	factors_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(factors_label)

	queue_label = _make_label("", 18, HORIZONTAL_ALIGNMENT_CENTER)
	queue_label.add_theme_color_override("font_color", COLOR_PRIMARY_STRONG)
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
		button.add_theme_stylebox_override("normal", _make_button_style(COLOR_PRIMARY_STRONG))
		button.add_theme_stylebox_override("hover", _make_button_style(COLOR_PRIMARY_STRONG.lightened(0.08)))
		button.add_theme_stylebox_override("pressed", _make_button_style(COLOR_PRIMARY_STRONG.darkened(0.12)))
		button.pressed.connect(_queue_prime.bind(int(prime)))
		prime_grid.add_child(button)

	var action_row := HBoxContainer.new()
	action_row.add_theme_constant_override("separation", 12)
	content.add_child(action_row)

	backspace_button = _make_action_button("Backspace", _backspace_queue, COLOR_PRIMARY)
	backspace_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_row.add_child(backspace_button)

	submit_button = _make_action_button("Submit", _submit_queue, COLOR_PRIMARY_STRONG)
	submit_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_row.add_child(submit_button)

	var pause_button := _make_action_button("Pause", _pause_game, COLOR_SECONDARY)
	pause_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	action_row.add_child(pause_button)

func _build_pause_layout() -> void:
	_build_base_layout()
	content.add_spacer(false)
	content.add_child(_make_label("Paused", 40, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_label("Score %s" % int(solo_state["score"]), 20, HORIZONTAL_ALIGNMENT_CENTER))
	content.add_child(_make_action_button("Resume", _resume_game, COLOR_PRIMARY_STRONG))
	content.add_child(_make_action_button("Restart", _start_solo_game, COLOR_SECONDARY))
	content.add_child(_make_action_button("Home", _start_home, COLOR_PRIMARY))
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
	content.add_child(_make_action_button("Play Again", _start_solo_game, COLOR_PRIMARY_STRONG))
	content.add_child(_make_action_button("Home", _start_home, COLOR_PRIMARY))
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
	label.add_theme_color_override("font_color", COLOR_INK)
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
	button.add_theme_stylebox_override("disabled", _make_button_style(COLOR_BUTTON_DISABLED))
	button.pressed.connect(callback)
	return button

func _make_home_title() -> HBoxContainer:
	var title_row := HBoxContainer.new()
	title_row.alignment = BoxContainer.ALIGNMENT_CENTER
	title_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	title_row.add_theme_constant_override("separation", 2)

	var lead := _make_absolute_label("AT", 40, COLOR_TEXT_INVERSE, 900)
	lead.size_flags_horizontal = Control.SIZE_SHRINK_END
	title_row.add_child(lead)

	var filled_o_wrap := Control.new()
	filled_o_wrap.custom_minimum_size = Vector2(32, 44)
	title_row.add_child(filled_o_wrap)

	var filled_o := Panel.new()
	filled_o.size = Vector2(28, 28)
	filled_o.position = Vector2(2, 22)
	filled_o.add_theme_stylebox_override("panel", _make_circle_style(COLOR_TEXT_INVERSE, 14, COLOR_TEXT_INVERSE, 0))
	filled_o_wrap.add_child(filled_o)

	var tail := _make_absolute_label("MIZE", 40, COLOR_TEXT_INVERSE, 900)
	tail.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	title_row.add_child(tail)

	return title_row

func _make_home_blob_button(text: String, callback: Callable, color: Color, icon_kind: String) -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(HOME_BLOB_SIZE, HOME_BLOB_SIZE)
	button.size = Vector2(HOME_BLOB_SIZE, HOME_BLOB_SIZE)
	button.focus_mode = Control.FOCUS_NONE
	button.text = ""
	button.add_theme_stylebox_override(
		"normal",
		_make_circle_style(color, HOME_BLOB_SIZE / 2.0, COLOR_BORDER_INVERSE_SOFT, 2)
	)
	button.add_theme_stylebox_override(
		"hover",
		_make_circle_style(color.lightened(0.06), HOME_BLOB_SIZE / 2.0, COLOR_BORDER_INVERSE_SOFT, 2)
	)
	button.add_theme_stylebox_override(
		"pressed",
		_make_circle_style(color.darkened(0.08), HOME_BLOB_SIZE / 2.0, COLOR_BORDER_INVERSE_SOFT, 2)
	)
	button.pressed.connect(callback)

	var content_stack := VBoxContainer.new()
	content_stack.alignment = BoxContainer.ALIGNMENT_CENTER
	content_stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content_stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content_stack.add_theme_constant_override("separation", 4)
	button.add_child(content_stack)

	var icon_slot := Control.new()
	icon_slot.custom_minimum_size = Vector2(32, 28)
	content_stack.add_child(icon_slot)
	if icon_kind == "timer":
		_add_timer_icon(icon_slot)
	else:
		_add_help_icon(icon_slot)

	var label := _make_absolute_label(text, 16, COLOR_TEXT_INVERSE, 900)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.custom_minimum_size = Vector2(HOME_BLOB_SIZE, 24)
	content_stack.add_child(label)

	return button

func _make_home_menu_button() -> Button:
	var button := Button.new()
	button.size = Vector2(HOME_MENU_BUTTON_SIZE, HOME_MENU_BUTTON_SIZE)
	button.custom_minimum_size = Vector2(HOME_MENU_BUTTON_SIZE, HOME_MENU_BUTTON_SIZE)
	button.focus_mode = Control.FOCUS_NONE
	button.text = ""
	button.flat = true
	button.add_theme_stylebox_override("normal", _make_transparent_button_style())
	button.add_theme_stylebox_override("hover", _make_transparent_button_style())
	button.add_theme_stylebox_override("pressed", _make_transparent_button_style())
	button.pressed.connect(_toggle_home_menu)

	for index in range(3):
		var line := ColorRect.new()
		line.color = COLOR_TEXT_INVERSE_SOFT
		line.position = Vector2(13, 14 + (index * 7))
		line.size = Vector2(18, 2)
		line.mouse_filter = Control.MOUSE_FILTER_IGNORE
		button.add_child(line)

	return button

func _make_dropdown_button(text: String, callback: Callable) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(128, 44)
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_font_size_override("font_size", 14)
	button.add_theme_color_override("font_color", COLOR_PRIMARY)
	button.add_theme_stylebox_override("normal", _make_button_style(COLOR_SURFACE))
	button.add_theme_stylebox_override("hover", _make_button_style(COLOR_SURFACE.darkened(0.03)))
	button.add_theme_stylebox_override("pressed", _make_button_style(COLOR_SURFACE.darkened(0.06)))
	button.pressed.connect(callback)
	return button

func _make_absolute_label(text: String, font_size: int, color: Color, weight: int) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.label_settings = _make_label_settings(font_size, color, weight)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return label

func _make_label_settings(font_size: int, color: Color, weight: int) -> LabelSettings:
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Avenir Next", "Helvetica Neue", "Arial"])
	font.font_weight = weight

	var settings := LabelSettings.new()
	settings.font = font
	settings.font_size = font_size
	settings.font_color = color
	return settings

func _add_timer_icon(parent: Control) -> void:
	var ring := Panel.new()
	ring.size = Vector2(18, 18)
	ring.position = Vector2((HOME_BLOB_SIZE - 18.0) / 2.0, 8)
	ring.add_theme_stylebox_override("panel", _make_outline_circle_style(9, COLOR_TEXT_INVERSE, 3))
	parent.add_child(ring)

	var crown := ColorRect.new()
	crown.color = COLOR_TEXT_INVERSE
	crown.size = Vector2(8, 3)
	crown.position = Vector2((HOME_BLOB_SIZE - 8.0) / 2.0, 3)
	parent.add_child(crown)

	var hand := Line2D.new()
	hand.default_color = COLOR_TEXT_INVERSE
	hand.width = 2.0
	hand.points = PackedVector2Array([Vector2.ZERO, Vector2(4, -5)])
	hand.position = Vector2(HOME_BLOB_SIZE / 2.0, 17)
	parent.add_child(hand)

func _add_help_icon(parent: Control) -> void:
	var icon := _make_absolute_label("?", 24, COLOR_TEXT_INVERSE, 900)
	icon.size = Vector2(HOME_BLOB_SIZE, 28)
	parent.add_child(icon)

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

func _make_transparent_button_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color.TRANSPARENT
	return style

func _make_circle_style(color: Color, radius: float, border_color: Color, border_width: int) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	var corner_radius := int(round(radius))
	style.corner_radius_top_left = corner_radius
	style.corner_radius_top_right = corner_radius
	style.corner_radius_bottom_right = corner_radius
	style.corner_radius_bottom_left = corner_radius
	style.border_color = border_color
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	return style

func _make_outline_circle_style(radius: float, border_color: Color, border_width: int) -> StyleBoxFlat:
	var style := _make_circle_style(Color.TRANSPARENT, radius, border_color, border_width)
	style.draw_center = false
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
