extends Control

const Game := preload("res://scripts/core/game.gd")
const BattleRoom := preload("res://scripts/core/multiplayer_room.gd")

const BEST_SCORE_PATH := "user://best_score.json"
const BATTLE_BOT_ID := "atom-bot"
const BATTLE_BOT_NAME := "AtomBot"
const BATTLE_BOT_STEP_SECONDS := 2.6
const BATTLE_PLAYER_ID := "guest-player"
const BATTLE_PLAYER_NAME := "Guest"
const COMBO_QUEUE_MAX_ITEMS := 7
const SCREEN_ARG_PREFIX := "--atomize-screen="
const SOLO_DURATION_SECONDS := 60.0
const SOLO_COMBO_STEP_DELAY_SECONDS := 0.18
const SOLO_SEED_PREFIX := "godot-mobile"
const VERSION_LABEL := "v0.0.0"
const COLOR_PRIMARY := Color("#10121f")
const COLOR_PRIMARY_STRONG := Color("#f7d51d")
const COLOR_SECONDARY := Color("#ef476f")
const COLOR_INK := Color("#10121f")
const COLOR_PAGE_BG := Color("#f8f4df")
const COLOR_SURFACE := Color("#f8f4df")
const COLOR_INK_SOFT := Color(0.063, 0.071, 0.122, 0.72)
const COLOR_KEYPAD_BUTTON_BG := Color("#f8f4df")
const COLOR_KEYPAD_BUTTON_TEXT := Color("#10121f")
const COLOR_TEXT_INVERSE := Color("#f8f4df")
const COLOR_TEXT_INVERSE_SOFT := Color(0.973, 0.957, 0.875, 0.72)
const COLOR_BORDER_INVERSE_SOFT := Color("#10121f")
const COLOR_BUTTON_DISABLED := Color(0.973, 0.957, 0.875, 0.36)
const PIXEL_BORDER := 4
const PIXEL_RADIUS := 0
const ICON_STROKE := 4.0
const FEEDBACK_TWEEN_SECONDS := 0.1
const SFX_SAMPLE_RATE := 22050
const HOME_BLOB_SIZE := 144.0
const HOME_BLOB_GAP := 16.0
const HOME_MENU_BUTTON_SIZE := 48.0
const SOLO_TARGET_SIZE := 256.0
const SOLO_KEY_SIZE := 80.0
const SOLO_KEY_GAP := 8.0
const SOLO_CONTROL_BOTTOM_MARGIN := 16.0
const PAGE_HEADER_BOTTOM := 224.0
const DIALOG_WIDTH := 304.0
const DIALOG_BUTTON_HEIGHT := 48.0
const THEME_BUTTON_PRIMARY := "AtomButtonPrimary"
const THEME_BUTTON_SECONDARY := "AtomButtonSecondary"
const THEME_BUTTON_SURFACE := "AtomButtonSurface"
const THEME_BUTTON_TRANSPARENT := "AtomButtonTransparent"
const THEME_BUTTON_KEYPAD := "AtomButtonKeypad"
const THEME_BUTTON_KEY_ACTION := "AtomButtonKeyAction"
const THEME_BUTTON_ICON_SURFACE := "AtomButtonIconSurface"
const THEME_BUTTON_SMALL_PRIMARY := "AtomButtonSmallPrimary"
const THEME_BUTTON_SMALL_SURFACE := "AtomButtonSmallSurface"
const THEME_BUTTON_PAGE_PRIMARY := "AtomButtonPagePrimary"
const THEME_BUTTON_PAGE_SECONDARY := "AtomButtonPageSecondary"
const THEME_PANEL_SURFACE := "AtomPanelSurface"
const THEME_PANEL_CONTAINER_SURFACE := "AtomPanelContainerSurface"
const THEME_PANEL_DIALOG := "AtomPanelDialog"
const THEME_PANEL_TARGET := "AtomPanelTarget"
const THEME_PANEL_AVATAR_PRIMARY := "AtomPanelAvatarPrimary"
const THEME_PANEL_AVATAR_SECONDARY := "AtomPanelAvatarSecondary"
const THEME_PANEL_BADGE_PRIMARY := "AtomPanelBadgePrimary"
const THEME_PANEL_BADGE_SURFACE := "AtomPanelBadgeSurface"
const THEME_PROGRESS_PRIMARY := "AtomProgressPrimary"
const THEME_PROGRESS_SECONDARY := "AtomProgressSecondary"
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
	SOLO_PREGAME,
	BATTLE_PICKER,
	BATTLE_READY,
	BATTLE_GAME,
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
var battle_snapshot: Dictionary
var battle_prime_queue: Array[int] = []
var battle_bot_elapsed := 0.0
var battle_result_text := ""
var icon_texture_cache: Dictionary = {}

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
var timer_bar: ProgressBar
var enemy_hp_bar: ProgressBar
var enemy_hp_label: Label
var player_hp_bar: ProgressBar
var player_hp_label: Label

func _ready() -> void:
	theme = _make_app_theme()
	best_score = _load_best_score()
	best_combo = _load_best_combo()
	match _get_requested_screen():
		"help":
			_start_help()
		"solo":
			_start_solo_game()
		"solo-pregame":
			_start_solo_pregame()
		"battle":
			_start_battle_picker()
		"battle-ready":
			_start_battle_ready()
		"battle-game":
			_start_battle_ready()
			_start_battle_game()
		_:
			_start_home()

func _get_requested_screen() -> String:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with(SCREEN_ARG_PREFIX):
			return argument.trim_prefix(SCREEN_ARG_PREFIX)

	return ""

func _process(delta: float) -> void:
	if screen == Screen.BATTLE_GAME:
		battle_bot_elapsed += delta
		if battle_bot_elapsed >= BATTLE_BOT_STEP_SECONDS:
			battle_bot_elapsed = 0.0
			_apply_atom_bot_turn()
		return

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
		elif (
			screen == Screen.HELP
			or screen == Screen.SOLO_PREGAME
			or screen == Screen.BATTLE_PICKER
			or screen == Screen.BATTLE_READY
			or screen == Screen.BATTLE_GAME
			or screen == Screen.GAME_OVER
		):
			_start_home()

func _start_home() -> void:
	screen = Screen.HOME
	prime_queue.clear()
	resolving_queue.clear()
	home_menu_open = false
	_build_home_layout()

func _start_help() -> void:
	screen = Screen.HELP
	_build_help_layout()

func _start_solo_pregame() -> void:
	screen = Screen.SOLO_PREGAME
	_build_solo_pregame_layout()

func _start_battle_picker() -> void:
	screen = Screen.BATTLE_PICKER
	_build_battle_picker_layout()

func _start_battle_ready() -> void:
	battle_snapshot = BattleRoom.create_room_snapshot("godot-atom-bot", BATTLE_BOT_ID, BATTLE_BOT_NAME)
	battle_snapshot = BattleRoom.add_player_to_room(
		battle_snapshot,
		BATTLE_PLAYER_ID,
		BATTLE_PLAYER_NAME
	)
	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_BOT_ID, true)
	battle_prime_queue.clear()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_READY
	_build_battle_ready_layout()

func _start_battle_game() -> void:
	if battle_snapshot.is_empty():
		_start_battle_ready()
		return

	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_PLAYER_ID, true)
	battle_snapshot = BattleRoom.begin_room_match(battle_snapshot)
	battle_prime_queue.clear()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_GAME
	_build_battle_game_layout()
	_render_battle()

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
	_play_sfx("fail")
	solo_time_left = 0.0
	resolving_queue.clear()
	prime_queue.clear()
	var final_score := int(solo_state["score"])
	var final_combo := int(solo_state["maxCombo"])
	did_set_new_best = _save_best_score(final_score, final_combo)
	best_score = _load_best_score()
	best_combo = _load_best_combo()
	_render_solo()
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
	_apply_panel_theme(panel, THEME_PANEL_CONTAINER_SURFACE)
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

	var hero_height: float = min(384.0, viewport_size.y * 0.48)
	var hero := ColorRect.new()
	hero.color = COLOR_PRIMARY
	hero.position = Vector2.ZERO
	hero.size = Vector2(viewport_size.x, hero_height)
	add_child(hero)

	var hero_rule := ColorRect.new()
	hero_rule.color = COLOR_PRIMARY_STRONG
	hero_rule.position = Vector2(0, hero_height - PIXEL_BORDER)
	hero_rule.size = Vector2(viewport_size.x, PIXEL_BORDER)
	add_child(hero_rule)

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
		(hero_height / 2.0) - 36.0
	)
	add_child(title_row)

	var total_blob_width := (HOME_BLOB_SIZE * 2.0) + HOME_BLOB_GAP
	var blob_left := (viewport_size.x - total_blob_width) / 2.0
	var blob_top := hero_height + 96.0
	var solo_button := _make_home_blob_button("SOLO", _start_solo_pregame, COLOR_PRIMARY_STRONG, "timer")
	solo_button.position = Vector2(blob_left, blob_top)
	add_child(solo_button)

	var battle_button := _make_home_blob_button("BATTLE", _start_battle_picker, COLOR_SECONDARY, "battle")
	battle_button.position = Vector2(blob_left + HOME_BLOB_SIZE + HOME_BLOB_GAP, blob_top)
	add_child(battle_button)

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

func _build_page_header(title_text: String, tagline_text: String, icon_kind: String) -> void:
	var viewport_size := get_viewport_rect().size
	var header := ColorRect.new()
	header.color = COLOR_PRIMARY
	header.position = Vector2.ZERO
	header.size = Vector2(viewport_size.x, PAGE_HEADER_BOTTOM)
	add_child(header)

	var header_rule := ColorRect.new()
	header_rule.color = COLOR_PRIMARY_STRONG
	header_rule.position = Vector2(0, PAGE_HEADER_BOTTOM - PIXEL_BORDER)
	header_rule.size = Vector2(viewport_size.x, PIXEL_BORDER)
	add_child(header_rule)

	var back_button := _make_header_icon_button("←", _start_home)
	back_button.position = Vector2(12, 24)
	add_child(back_button)

	var title := _make_absolute_label(title_text, 16, COLOR_TEXT_INVERSE, 900)
	title.position = Vector2(0, 28)
	title.size = Vector2(viewport_size.x, 36)
	add_child(title)

	var icon_slot := Control.new()
	icon_slot.position = Vector2((viewport_size.x - 84.0) / 2.0, 94)
	icon_slot.size = Vector2(84, 72)
	add_child(icon_slot)

	if icon_kind == "timer":
		_add_page_timer_icon(icon_slot)
	else:
		_add_page_battle_icon(icon_slot)

	var tagline := _make_absolute_label(tagline_text, 12, COLOR_TEXT_INVERSE_SOFT, 800)
	tagline.position = Vector2(0, 176)
	tagline.size = Vector2(viewport_size.x, 24)
	add_child(tagline)

func _build_solo_pregame_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	_build_page_header("SOLO", "BEAT THE CLOCK.", "timer")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0
	var stat_width: float = min(body_width, 224.0)
	var stat_left: float = (viewport_size.x - stat_width) / 2.0
	var button_width: float = min(body_width, viewport_size.x * 0.75)
	var button_left: float = (viewport_size.x - button_width) / 2.0

	var pb_title := _make_absolute_label("PERSONAL BEST", 12, COLOR_INK_SOFT, 700)
	pb_title.position = Vector2(stat_left, 304)
	pb_title.size = Vector2(stat_width, 24)
	add_child(pb_title)

	_add_pregame_stat_row(stat_left, 352, stat_width, "Score", best_score)
	_add_pregame_stat_row(stat_left, 400, stat_width, "Max Combo", best_combo)

	var start_button := _make_wide_page_button("GO", _start_solo_game, COLOR_PRIMARY_STRONG)
	start_button.position = Vector2(button_left, 512)
	start_button.size = Vector2(button_width, 56)
	add_child(start_button)

func _add_pregame_stat_row(left: float, top: float, width: float, label_text: String, value: int) -> void:
	var row := Control.new()
	row.position = Vector2(left, top)
	row.size = Vector2(width, 32)
	add_child(row)

	var label := _make_absolute_label(label_text, 16, COLOR_INK, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.position = Vector2.ZERO
	label.size = Vector2(width / 2.0, 32)
	row.add_child(label)

	var value_label := _make_absolute_label(str(value), 16, COLOR_PRIMARY, 800)
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.position = Vector2(width / 2.0, 0)
	value_label.size = Vector2(width / 2.0, 32)
	row.add_child(value_label)

func _build_battle_picker_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	_build_page_header("BATTLE", "OUTSMART THEM.", "battle")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0

	_add_battle_section_title(body_left, 262, "cpu", "CPU TRAINING")
	_add_battle_picker_row(body_left, 300, body_width, "bot", BATTLE_BOT_NAME, "Play", false, _start_battle_ready)

	_add_battle_section_title(body_left, 384, "users", "ONLINE PLAYERS")
	_add_battle_empty_state(body_left, 422, body_width)

func _add_battle_section_title(left: float, top: float, icon_kind: String, label_text: String) -> void:
	var icon_slot := Control.new()
	icon_slot.position = Vector2(left, top + 2.0)
	icon_slot.size = Vector2(20, 20)
	icon_slot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(icon_slot)

	if icon_kind == "cpu":
		_add_cpu_icon(icon_slot, 20, COLOR_KEYPAD_BUTTON_TEXT)
	else:
		_add_users_icon(icon_slot, 20, COLOR_KEYPAD_BUTTON_TEXT)

	var label := _make_absolute_label(label_text, 12, COLOR_INK_SOFT, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.position = Vector2(left + 26.0, top)
	label.size = Vector2(220, 24)
	add_child(label)

func _add_battle_picker_row(
	left: float,
	top: float,
	width: float,
	avatar_kind: String,
	name_text: String,
	action_text: String,
	disabled: bool,
	callback: Callable
) -> void:
	var avatar_color := COLOR_SECONDARY if avatar_kind == "bot" else COLOR_PRIMARY_STRONG
	var avatar := _make_avatar_icon_circle(44, avatar_color, avatar_kind)
	avatar.position = Vector2(left, top)
	add_child(avatar)

	var name := _make_absolute_label(name_text, 16, COLOR_INK, 800)
	name.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	name.position = Vector2(left + 54.0, top + 10.0)
	name.size = Vector2(160, 28)
	add_child(name)

	var action := Button.new()
	action.text = action_text
	action.disabled = disabled
	_apply_button_theme(action, THEME_BUTTON_SMALL_PRIMARY)
	action.position = Vector2(left + width - 82.0, top + 6.0)
	action.size = Vector2(82, 34)
	_wire_button_feedback(action, "start")
	if not disabled:
		action.pressed.connect(callback)
	add_child(action)

func _add_battle_empty_state(left: float, top: float, width: float) -> void:
	var empty := _make_absolute_label("No players online", 13, COLOR_INK_SOFT, 700)
	empty.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	empty.position = Vector2(left, top + 8.0)
	empty.size = Vector2(width, 24)
	add_child(empty)

	var hint := _make_absolute_label("Players will appear here when they join.", 13, COLOR_INK_SOFT, 600)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	hint.position = Vector2(left, top + 32.0)
	hint.size = Vector2(width, 24)
	hint.modulate.a = 0.72
	add_child(hint)

func _build_battle_ready_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PRIMARY
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var back_button := _make_header_icon_button("←", _start_battle_picker)
	back_button.position = Vector2(12, 18)
	add_child(back_button)

	var bot_avatar := _make_avatar_icon_circle(80, COLOR_SECONDARY, "bot")
	bot_avatar.position = Vector2((viewport_size.x - 80.0) / 2.0, 268)
	add_child(bot_avatar)

	var bot_label := _make_absolute_label(BATTLE_BOT_NAME, 15, COLOR_TEXT_INVERSE, 800)
	bot_label.position = Vector2(0, 354)
	bot_label.size = Vector2(viewport_size.x, 24)
	add_child(bot_label)

	var versus := _make_absolute_label("VS", 46, COLOR_TEXT_INVERSE, 900)
	versus.position = Vector2(0, 394)
	versus.size = Vector2(viewport_size.x, 56)
	add_child(versus)

	var player_avatar := _make_avatar_initial_circle(80, COLOR_PRIMARY_STRONG, "G", 20)
	player_avatar.position = Vector2((viewport_size.x - 80.0) / 2.0, 470)
	add_child(player_avatar)

	var player_label := _make_absolute_label(BATTLE_PLAYER_NAME, 15, COLOR_TEXT_INVERSE, 800)
	player_label.position = Vector2(0, 558)
	player_label.size = Vector2(viewport_size.x, 24)
	add_child(player_label)

	var ready_button := _make_wide_page_button("Ready", _start_battle_game, COLOR_PRIMARY_STRONG)
	ready_button.position = Vector2((viewport_size.x - 258.0) / 2.0, viewport_size.y - 88.0)
	ready_button.size = Vector2(258, 56)
	add_child(ready_button)

func _build_battle_game_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var enemy_name := _make_absolute_label(BATTLE_BOT_NAME, 15, COLOR_SECONDARY, 800)
	enemy_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	enemy_name.position = Vector2(12, 8)
	enemy_name.size = Vector2(160, 24)
	add_child(enemy_name)

	enemy_hp_label = _make_absolute_label("", 15, COLOR_SECONDARY, 800)
	enemy_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	enemy_hp_label.position = Vector2(viewport_size.x - 92.0, 8)
	enemy_hp_label.size = Vector2(80, 24)
	add_child(enemy_hp_label)

	enemy_hp_bar = _make_hp_bar(COLOR_SECONDARY)
	enemy_hp_bar.position = Vector2(12, 34)
	enemy_hp_bar.size = Vector2(viewport_size.x - 24.0, 10)
	add_child(enemy_hp_bar)

	var bot_avatar := _make_avatar_icon_circle(80, COLOR_SECONDARY, "bot")
	bot_avatar.position = Vector2((viewport_size.x - 80.0) / 2.0, 134)
	add_child(bot_avatar)

	var target_blob := Panel.new()
	target_blob.size = Vector2(160, 160)
	target_blob.position = Vector2((viewport_size.x - 160.0) / 2.0, 208)
	_apply_panel_theme(target_blob, THEME_PANEL_TARGET)
	add_child(target_blob)

	target_label = _make_absolute_label("", 48, COLOR_INK, 900)
	target_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	target_blob.add_child(target_label)

	battle_result_text = ""
	result_label = _make_absolute_label("", 15, COLOR_SECONDARY, 800)
	result_label.position = Vector2(0, 444)
	result_label.size = Vector2(viewport_size.x, 24)
	add_child(result_label)

	var player_name := _make_absolute_label(BATTLE_PLAYER_NAME, 15, COLOR_INK, 800)
	player_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	player_name.position = Vector2(12, 452)
	player_name.size = Vector2(160, 24)
	add_child(player_name)

	player_hp_label = _make_absolute_label("", 15, COLOR_INK, 800)
	player_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	player_hp_label.position = Vector2(viewport_size.x - 92.0, 452)
	player_hp_label.size = Vector2(80, 24)
	add_child(player_hp_label)

	player_hp_bar = _make_hp_bar(COLOR_PRIMARY_STRONG)
	player_hp_bar.position = Vector2(12, 476)
	player_hp_bar.size = Vector2(viewport_size.x - 24.0, 10)
	add_child(player_hp_bar)

	queue_label = _make_absolute_label("", 18, COLOR_INK, 800)
	queue_label.position = Vector2(24, 508)
	queue_label.size = Vector2(viewport_size.x - 48.0, 28)
	add_child(queue_label)

	prime_grid = GridContainer.new()
	prime_grid.columns = 3
	prime_grid.add_theme_constant_override("h_separation", int(SOLO_KEY_GAP))
	prime_grid.add_theme_constant_override("v_separation", int(SOLO_KEY_GAP))
	prime_grid.position = Vector2(12, viewport_size.y - (SOLO_KEY_SIZE * 3.0) - (SOLO_KEY_GAP * 2.0) - SOLO_CONTROL_BOTTOM_MARGIN)
	prime_grid.size = Vector2((SOLO_KEY_SIZE * 3.0) + (SOLO_KEY_GAP * 2.0), (SOLO_KEY_SIZE * 3.0) + (SOLO_KEY_GAP * 2.0))
	add_child(prime_grid)

	for prime in Game.get_playable_stage_primes():
		var button := _make_prime_key_button(str(prime))
		button.pressed.connect(_queue_battle_prime.bind(int(prime)))
		prime_grid.add_child(button)

	var action_x := prime_grid.position.x + prime_grid.size.x + SOLO_KEY_GAP
	backspace_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 28, "backspace")
	backspace_button.position = Vector2(action_x, prime_grid.position.y)
	backspace_button.size = Vector2(SOLO_KEY_SIZE, SOLO_KEY_SIZE)
	_add_delete_icon(backspace_button, SOLO_KEY_SIZE, SOLO_KEY_SIZE, COLOR_INK)
	backspace_button.pressed.connect(_backspace_battle_queue)
	add_child(backspace_button)

	submit_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 34, "submit")
	submit_button.position = Vector2(action_x, prime_grid.position.y + SOLO_KEY_SIZE + SOLO_KEY_GAP)
	submit_button.size = Vector2(SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP)
	_add_submit_icon(submit_button, SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP, COLOR_INK)
	submit_button.pressed.connect(_submit_battle_queue)
	add_child(submit_button)

func _build_help_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var header_bottom := 208.0
	var header := ColorRect.new()
	header.color = COLOR_PRIMARY
	header.position = Vector2.ZERO
	header.size = Vector2(viewport_size.x, header_bottom)
	add_child(header)

	var header_rule := ColorRect.new()
	header_rule.color = COLOR_PRIMARY_STRONG
	header_rule.position = Vector2(0, header_bottom - PIXEL_BORDER)
	header_rule.size = Vector2(viewport_size.x, PIXEL_BORDER)
	add_child(header_rule)

	var back_button := _make_header_icon_button("←", _start_home)
	back_button.position = Vector2(12, 24)
	add_child(back_button)

	var title := _make_absolute_label("HELP", 16, COLOR_TEXT_INVERSE, 900)
	title.position = Vector2(0, 28)
	title.size = Vector2(viewport_size.x, 36)
	add_child(title)

	var icon := _make_absolute_label("?", 64, COLOR_TEXT_INVERSE, 900)
	icon.position = Vector2(0, 82)
	icon.size = Vector2(viewport_size.x, 72)
	add_child(icon)

	var tagline := _make_absolute_label("BREAK NUMBERS INTO PRIMES.", 12, COLOR_TEXT_INVERSE_SOFT, 800)
	tagline.position = Vector2(0, 168)
	tagline.size = Vector2(viewport_size.x, 24)
	add_child(tagline)

	var body := VBoxContainer.new()
	body.position = Vector2((viewport_size.x - 320.0) / 2.0, 256)
	body.size = Vector2(320, 272)
	body.add_theme_constant_override("separation", 12)
	add_child(body)

	_add_help_rule(body, "Queue prime factors", "Tap primes to build a combo queue.")
	_add_help_rule(body, "Submit exact clears", "Send the full factorization to atomize the target.")
	_add_help_rule(body, "Avoid wrong primes", "Mistakes cost HP and time, and break your combo.")

	var example := _make_absolute_label("66 = 2 x 3 x 11", 16, COLOR_PRIMARY, 900)
	example.custom_minimum_size = Vector2(320, 40)
	body.add_child(example)

	var actions := VBoxContainer.new()
	actions.position = Vector2(48, viewport_size.y - 180.0)
	actions.size = Vector2(viewport_size.x - 96.0, 112)
	actions.add_theme_constant_override("separation", 12)
	add_child(actions)

	actions.add_child(_make_wide_page_button("GO", _start_solo_game, COLOR_PRIMARY_STRONG))
	actions.add_child(_make_wide_page_button("TOP", _start_home, COLOR_SECONDARY))

func _clear_screen() -> void:
	for child in get_children():
		child.queue_free()

func _build_solo_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var pause_button := _make_pause_icon_button()
	pause_button.position = Vector2(12, 12)
	pause_button.pressed.connect(_pause_game)
	add_child(pause_button)

	timer_bar = ProgressBar.new()
	timer_bar.show_percentage = false
	timer_bar.min_value = 0
	timer_bar.max_value = SOLO_DURATION_SECONDS
	timer_bar.value = solo_time_left
	timer_bar.position = Vector2(96, 28)
	timer_bar.size = Vector2(viewport_size.x - 192.0, 8)
	_apply_progress_theme(timer_bar, THEME_PROGRESS_PRIMARY)
	add_child(timer_bar)

	score_label = _make_absolute_label("", 14, COLOR_PRIMARY, 800)
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	score_label.position = Vector2(viewport_size.x - 84.0, 16)
	score_label.size = Vector2(68, 24)
	add_child(score_label)

	var target_blob := Panel.new()
	target_blob.size = Vector2(SOLO_TARGET_SIZE, SOLO_TARGET_SIZE)
	target_blob.position = Vector2((viewport_size.x - SOLO_TARGET_SIZE) / 2.0, 120)
	_apply_panel_theme(target_blob, THEME_PANEL_TARGET)
	add_child(target_blob)

	target_label = _make_absolute_label("", 72, COLOR_INK, 900)
	target_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	target_blob.add_child(target_label)

	queue_label = _make_absolute_label("", 18, COLOR_INK, 800)
	queue_label.position = Vector2(24, 456)
	queue_label.size = Vector2(viewport_size.x - 48.0, 32)
	add_child(queue_label)

	result_label = _make_absolute_label("", 14, COLOR_PRIMARY, 800)
	result_label.position = Vector2(24, 492)
	result_label.size = Vector2(viewport_size.x - 48.0, 28)
	add_child(result_label)

	factors_label = _make_absolute_label("", 12, COLOR_INK, 700)
	factors_label.position = Vector2(24, 520)
	factors_label.size = Vector2(viewport_size.x - 48.0, 24)
	add_child(factors_label)

	prime_grid = GridContainer.new()
	prime_grid.columns = 3
	prime_grid.add_theme_constant_override("h_separation", int(SOLO_KEY_GAP))
	prime_grid.add_theme_constant_override("v_separation", int(SOLO_KEY_GAP))
	prime_grid.position = Vector2(12, viewport_size.y - (SOLO_KEY_SIZE * 3.0) - (SOLO_KEY_GAP * 2.0) - SOLO_CONTROL_BOTTOM_MARGIN)
	prime_grid.size = Vector2((SOLO_KEY_SIZE * 3.0) + (SOLO_KEY_GAP * 2.0), (SOLO_KEY_SIZE * 3.0) + (SOLO_KEY_GAP * 2.0))
	add_child(prime_grid)

	for prime in Game.get_playable_stage_primes():
		var button := _make_prime_key_button(str(prime))
		button.pressed.connect(_queue_prime.bind(int(prime)))
		prime_grid.add_child(button)

	var action_x := prime_grid.position.x + prime_grid.size.x + SOLO_KEY_GAP
	backspace_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 28, "backspace")
	backspace_button.position = Vector2(action_x, prime_grid.position.y)
	backspace_button.size = Vector2(SOLO_KEY_SIZE, SOLO_KEY_SIZE)
	_add_delete_icon(backspace_button, SOLO_KEY_SIZE, SOLO_KEY_SIZE, COLOR_INK)
	backspace_button.pressed.connect(_backspace_queue)
	add_child(backspace_button)

	submit_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 34, "submit")
	submit_button.position = Vector2(action_x, prime_grid.position.y + SOLO_KEY_SIZE + SOLO_KEY_GAP)
	submit_button.size = Vector2(SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP)
	_add_submit_icon(submit_button, SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP, COLOR_INK)
	submit_button.pressed.connect(_submit_queue)
	add_child(submit_button)

func _build_pause_layout() -> void:
	var overlay := _make_modal_overlay()
	add_child(overlay)

	var panel := _make_dialog_panel(228)
	overlay.add_child(panel)

	_add_dialog_header(panel, "PAUSED")

	var actions := VBoxContainer.new()
	actions.position = Vector2(12, 68)
	actions.size = Vector2(DIALOG_WIDTH - 24.0, 144)
	actions.add_theme_constant_override("separation", 8)
	panel.add_child(actions)

	actions.add_child(_make_dialog_button("Resume", _resume_game, COLOR_PRIMARY_STRONG))
	actions.add_child(_make_dialog_button("Retry", _start_solo_game, COLOR_SECONDARY))
	actions.add_child(_make_dialog_button("Top", _start_home, COLOR_SECONDARY))

func _build_game_over_layout() -> void:
	var overlay := _make_modal_overlay()
	add_child(overlay)

	var panel := _make_dialog_panel(368)
	overlay.add_child(panel)

	_add_dialog_header(panel, "TIME'S UP")

	var hero_label := _make_absolute_label("SCORE", 12, COLOR_INK_SOFT, 700)
	hero_label.position = Vector2(0, 72)
	hero_label.size = Vector2(DIALOG_WIDTH, 20)
	panel.add_child(hero_label)

	var score_value := _make_absolute_label(str(int(solo_state["score"])), 48, COLOR_PRIMARY, 900)
	score_value.position = Vector2(0, 88)
	score_value.size = Vector2(DIALOG_WIDTH, 60)
	panel.add_child(score_value)

	var best_label := _make_best_score_badge()
	best_label.position = Vector2((DIALOG_WIDTH - best_label.size.x) / 2.0, 148)
	panel.add_child(best_label)

	var stats := VBoxContainer.new()
	stats.position = Vector2(12, 188)
	stats.size = Vector2(DIALOG_WIDTH - 24.0, 92)
	stats.add_theme_constant_override("separation", 8)
	panel.add_child(stats)

	_add_dialog_stat_row(stats, "Atomized", int(solo_state["clearedStages"]))
	_add_dialog_stat_row(stats, "Max Combo", int(solo_state["maxCombo"]))

	var actions := HBoxContainer.new()
	actions.position = Vector2(12, 304)
	actions.size = Vector2(DIALOG_WIDTH - 24.0, DIALOG_BUTTON_HEIGHT)
	actions.add_theme_constant_override("separation", 8)
	panel.add_child(actions)

	actions.add_child(_make_dialog_action_button("Top", _start_home, COLOR_SECONDARY))
	actions.add_child(_make_dialog_action_button("Retry", _start_solo_game, COLOR_PRIMARY_STRONG))

func _render_solo() -> void:
	if screen != Screen.SOLO:
		return

	var stage: Dictionary = solo_state["currentStage"]
	timer_bar.value = solo_time_left
	score_label.text = "%s pt" % int(solo_state["score"])
	target_label.text = str(stage["remainingValue"])
	factors_label.visible = false
	queue_label.text = _join_numbers(prime_queue)
	queue_label.visible = not prime_queue.is_empty()
	result_label.text = last_result_text
	result_label.visible = last_result_text != ""

	var is_busy := not resolving_queue.is_empty()
	submit_button.disabled = is_busy or prime_queue.is_empty()
	backspace_button.disabled = is_busy or prime_queue.is_empty()

	for child in prime_grid.get_children():
		if child is Button:
			child.disabled = is_busy or prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS

func _render_battle() -> void:
	if screen != Screen.BATTLE_GAME or battle_snapshot.is_empty():
		return

	var player = BattleRoom.find_player(battle_snapshot["players"], BATTLE_PLAYER_ID)
	var bot = BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)

	if player == null or bot == null:
		return

	var max_hp := int(battle_snapshot["maxHp"])
	enemy_hp_bar.max_value = max_hp
	enemy_hp_bar.value = int(bot["hp"])
	enemy_hp_label.text = str(int(bot["hp"]))
	player_hp_bar.max_value = max_hp
	player_hp_bar.value = int(player["hp"])
	player_hp_label.text = str(int(player["hp"]))
	target_label.text = str(player["stage"]["remainingValue"])
	queue_label.text = _join_numbers(battle_prime_queue)
	queue_label.visible = not battle_prime_queue.is_empty()
	result_label.text = battle_result_text
	result_label.visible = battle_result_text != ""

	var is_finished: bool = battle_snapshot["status"] == "finished"
	submit_button.disabled = is_finished or battle_prime_queue.is_empty()
	backspace_button.disabled = is_finished or battle_prime_queue.is_empty()

	for child in prime_grid.get_children():
		if child is Button:
			child.disabled = is_finished or battle_prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS

	if is_finished:
		_build_battle_over_overlay()

func _queue_battle_prime(prime: int) -> void:
	if screen != Screen.BATTLE_GAME or battle_snapshot["status"] != "playing":
		return

	if battle_prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS:
		_play_sfx("fail")
		battle_result_text = "Queue full"
		_render_battle()
		return

	battle_prime_queue.append(prime)
	battle_result_text = ""
	_render_battle()

func _backspace_battle_queue() -> void:
	if screen != Screen.BATTLE_GAME or battle_prime_queue.is_empty():
		return

	battle_prime_queue.pop_back()
	battle_result_text = ""
	_render_battle()

func _submit_battle_queue() -> void:
	if screen != Screen.BATTLE_GAME or battle_prime_queue.is_empty():
		return

	_apply_battle_queue(BATTLE_PLAYER_ID, battle_prime_queue)
	battle_prime_queue.clear()
	_render_battle()

func _apply_atom_bot_turn() -> void:
	if screen != Screen.BATTLE_GAME or battle_snapshot.is_empty() or battle_snapshot["status"] != "playing":
		return

	var bot = BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)
	if bot == null:
		return

	var factors: Array = bot["stage"]["factors"]
	if factors.is_empty():
		return

	_apply_battle_queue(BATTLE_BOT_ID, [int(factors[0])])
	_render_battle()

func _apply_battle_queue(player_id: String, queued_primes: Array) -> void:
	var submitted_length := queued_primes.size()

	for prime in queued_primes:
		if battle_snapshot["status"] != "playing":
			return

		var acting_player = BattleRoom.find_player(battle_snapshot["players"], player_id)
		if acting_player == null:
			return

		var stage: Dictionary = acting_player["stage"]
		var outcome: Dictionary = Game.apply_prime_selection(stage, int(prime))

		if outcome["kind"] == "wrong":
			battle_snapshot = BattleRoom.apply_battle_penalty(battle_snapshot, player_id)
			battle_result_text = "Miss" if player_id == BATTLE_PLAYER_ID else "-8"
			_play_sfx("fail")
			return

		var options: Dictionary = {}
		if outcome["cleared"]:
			options["resolvingQueueLength"] = submitted_length
			options["perfectSolveEligible"] = submitted_length == stage["factors"].size()

		battle_snapshot = BattleRoom.apply_battle_prime_selection(
			battle_snapshot,
			player_id,
			int(prime),
			options
		)

		var event: Dictionary = battle_snapshot.get("lastEvent", {})
		if event.has("damage"):
			battle_result_text = "-%s" % int(event["damage"])
			_play_sfx("success" if player_id == BATTLE_PLAYER_ID else "fail")

func _build_battle_over_overlay() -> void:
	if has_node("BattleOverOverlay"):
		return

	var player = BattleRoom.find_player(battle_snapshot["players"], BATTLE_PLAYER_ID)
	var bot = BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)
	var did_win := player != null and bot != null and int(bot["hp"]) <= 0 and int(player["hp"]) > 0
	_play_sfx("success" if did_win else "fail")

	var overlay := _make_modal_overlay()
	overlay.name = "BattleOverOverlay"
	add_child(overlay)

	var panel := _make_dialog_panel(248)
	overlay.add_child(panel)

	_add_dialog_header(panel, "VICTORY" if did_win else "DEFEAT")

	var message := _make_absolute_label("AtomBot defeated" if did_win else "AtomBot wins", 18, COLOR_INK, 800)
	message.position = Vector2(0, 84)
	message.size = Vector2(DIALOG_WIDTH, 32)
	panel.add_child(message)

	var actions := VBoxContainer.new()
	actions.position = Vector2(12, 140)
	actions.size = Vector2(DIALOG_WIDTH - 24.0, 96)
	actions.add_theme_constant_override("separation", 8)
	panel.add_child(actions)

	actions.add_child(_make_dialog_button("Retry", _start_battle_ready, COLOR_PRIMARY_STRONG))
	actions.add_child(_make_dialog_button("Top", _start_home, COLOR_SECONDARY))

func _queue_prime(prime: int) -> void:
	if screen != Screen.SOLO or not resolving_queue.is_empty():
		return

	if prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS:
		_play_sfx("fail")
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
		_play_sfx("fail")
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
		_play_sfx("fail")
	else:
		solo_state = next_state
		last_result_text = "Cleared" if outcome["cleared"] else "Hit +%s" % Game.compute_battle_factor_damage(next_prime)
		_play_sfx("success" if outcome["cleared"] else "prime")

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

func _make_app_theme() -> Theme:
	var app_theme := Theme.new()
	var button_font := _make_ui_font(800)
	var label_font := _make_ui_font(700)

	app_theme.set_font("font", "Button", button_font)
	app_theme.set_font_size("font_size", "Button", 16)
	app_theme.set_constant("h_separation", "Button", 8)
	app_theme.set_font("font", "Label", label_font)
	app_theme.set_font_size("font_size", "Label", 16)
	app_theme.set_color("font_color", "Label", COLOR_INK)

	_add_button_theme(app_theme, THEME_BUTTON_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_INK, 18)
	_add_button_theme(app_theme, THEME_BUTTON_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 18)
	_add_button_theme(app_theme, THEME_BUTTON_SURFACE, COLOR_SURFACE, COLOR_INK, 16, COLOR_PRIMARY_STRONG)
	_add_button_theme(app_theme, THEME_BUTTON_KEYPAD, COLOR_KEYPAD_BUTTON_BG, COLOR_KEYPAD_BUTTON_TEXT, 32, COLOR_PRIMARY_STRONG)
	_add_button_theme(app_theme, THEME_BUTTON_KEY_ACTION, COLOR_PRIMARY_STRONG, COLOR_INK, 28, Color.TRANSPARENT, 0)
	_add_button_theme(app_theme, THEME_BUTTON_ICON_SURFACE, COLOR_SURFACE, COLOR_INK, 16, COLOR_PRIMARY_STRONG, 0)
	_add_button_theme(app_theme, THEME_BUTTON_SMALL_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_INK, 13)
	_add_button_theme(app_theme, THEME_BUTTON_SMALL_SURFACE, COLOR_SURFACE, COLOR_INK, 14, COLOR_PRIMARY_STRONG)
	_add_button_theme(app_theme, THEME_BUTTON_PAGE_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_INK, 16)
	_add_button_theme(app_theme, THEME_BUTTON_PAGE_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 16)
	_add_transparent_button_theme(app_theme)
	_add_panel_theme(app_theme, THEME_PANEL_SURFACE, "Panel", _make_panel_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_CONTAINER_SURFACE, "PanelContainer", _make_panel_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG, "Panel", _make_dialog_panel_style())
	_add_panel_theme(app_theme, THEME_PANEL_TARGET, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_AVATAR_PRIMARY, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_AVATAR_SECONDARY, "Panel", _make_pixel_box_style(COLOR_SECONDARY, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_BADGE_PRIMARY, "Panel", _make_button_style(COLOR_PRIMARY_STRONG))
	_add_panel_theme(app_theme, THEME_PANEL_BADGE_SURFACE, "Panel", _make_button_style(COLOR_SURFACE))
	_add_progress_theme(app_theme, THEME_PROGRESS_PRIMARY, COLOR_PRIMARY_STRONG)
	_add_progress_theme(app_theme, THEME_PROGRESS_SECONDARY, COLOR_SECONDARY)

	return app_theme

func _add_button_theme(
	app_theme: Theme,
	variation: String,
	normal_color: Color,
	text_color: Color,
	font_size: int,
	hover_color: Color = Color.TRANSPARENT,
	content_margin: int = 16
) -> void:
	var resolved_hover_color := hover_color if hover_color != Color.TRANSPARENT else normal_color
	app_theme.set_type_variation(variation, "Button")
	app_theme.set_font("font", variation, _make_ui_font(800))
	app_theme.set_font_size("font_size", variation, font_size)
	app_theme.set_stylebox("normal", variation, _make_button_style(normal_color, content_margin))
	app_theme.set_stylebox("hover", variation, _make_button_style(resolved_hover_color, content_margin))
	app_theme.set_stylebox("focus", variation, _make_button_style(normal_color, content_margin))
	app_theme.set_stylebox("pressed", variation, _make_button_style(COLOR_SURFACE, content_margin))
	app_theme.set_stylebox("hover_pressed", variation, _make_button_style(COLOR_SURFACE, content_margin))
	app_theme.set_stylebox("disabled", variation, _make_button_style(COLOR_BUTTON_DISABLED, content_margin))
	_set_button_theme_colors(app_theme, variation, text_color)

func _add_transparent_button_theme(app_theme: Theme) -> void:
	app_theme.set_type_variation(THEME_BUTTON_TRANSPARENT, "Button")
	app_theme.set_font("font", THEME_BUTTON_TRANSPARENT, _make_ui_font(800))
	app_theme.set_font_size("font_size", THEME_BUTTON_TRANSPARENT, 28)
	for state in ["normal", "hover", "focus", "pressed", "hover_pressed", "disabled"]:
		app_theme.set_stylebox(state, THEME_BUTTON_TRANSPARENT, _make_transparent_button_style())
	_set_button_theme_colors(app_theme, THEME_BUTTON_TRANSPARENT, COLOR_TEXT_INVERSE)

func _set_button_theme_colors(app_theme: Theme, variation: String, text_color: Color) -> void:
	for color_name in [
		"font_color",
		"font_hover_color",
		"font_focus_color",
		"font_pressed_color",
		"font_hover_pressed_color",
		"icon_normal_color",
		"icon_hover_color",
		"icon_focus_color",
		"icon_pressed_color",
		"icon_hover_pressed_color",
	]:
		app_theme.set_color(color_name, variation, text_color)

	app_theme.set_color("font_disabled_color", variation, COLOR_INK_SOFT)
	app_theme.set_color("icon_disabled_color", variation, COLOR_INK_SOFT)

func _add_panel_theme(app_theme: Theme, variation: String, base_type: String, style: StyleBox) -> void:
	app_theme.set_type_variation(variation, base_type)
	app_theme.set_stylebox("panel", variation, style)

func _add_progress_theme(app_theme: Theme, variation: String, fill_color: Color) -> void:
	app_theme.set_type_variation(variation, "ProgressBar")
	app_theme.set_stylebox("background", variation, _make_bar_style(COLOR_BUTTON_DISABLED, 4))
	app_theme.set_stylebox("fill", variation, _make_bar_style(fill_color, 4))

func _make_ui_font(weight: int) -> SystemFont:
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Menlo", "Courier New", "Monaco"])
	font.font_weight = weight
	return font

func _apply_button_theme(button: Button, variation: String) -> void:
	button.theme_type_variation = variation
	button.focus_mode = Control.FOCUS_NONE

func _apply_panel_theme(panel: Control, variation: String) -> void:
	panel.theme_type_variation = variation

func _apply_progress_theme(bar: ProgressBar, variation: String) -> void:
	bar.theme_type_variation = variation

func _button_theme_for_color(color: Color, primary_theme: String, secondary_theme: String) -> String:
	return secondary_theme if color == COLOR_SECONDARY else primary_theme

func _panel_theme_for_color(color: Color) -> String:
	return THEME_PANEL_AVATAR_SECONDARY if color == COLOR_SECONDARY else THEME_PANEL_AVATAR_PRIMARY

func _progress_theme_for_color(color: Color) -> String:
	return THEME_PROGRESS_SECONDARY if color == COLOR_SECONDARY else THEME_PROGRESS_PRIMARY

func _make_action_button(text: String, callback: Callable, color: Color) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 56)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_apply_button_theme(button, _button_theme_for_color(color, THEME_BUTTON_PRIMARY, THEME_BUTTON_SECONDARY))
	_wire_button_feedback(button, "tap")
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

	var filled_o := ColorRect.new()
	filled_o.size = Vector2(28, 28)
	filled_o.position = Vector2(2, 22)
	filled_o.color = COLOR_TEXT_INVERSE
	filled_o_wrap.add_child(filled_o)

	var tail := _make_absolute_label("MIZE", 40, COLOR_TEXT_INVERSE, 900)
	tail.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	title_row.add_child(tail)

	return title_row

func _make_home_blob_button(text: String, callback: Callable, color: Color, icon_kind: String) -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(HOME_BLOB_SIZE, HOME_BLOB_SIZE)
	button.size = Vector2(HOME_BLOB_SIZE, HOME_BLOB_SIZE)
	button.text = ""
	_apply_button_theme(button, _button_theme_for_color(color, THEME_BUTTON_PAGE_PRIMARY, THEME_BUTTON_PAGE_SECONDARY))
	_wire_button_feedback(button, "start")
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
	var content_color := _get_button_text_color(color)
	if icon_kind == "timer":
		_add_timer_icon(icon_slot, content_color)
	elif icon_kind == "battle":
		_add_battle_icon(icon_slot, content_color)
	else:
		_add_help_icon(icon_slot, content_color)

	var label := _make_absolute_label(text, 16, content_color, 900)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.custom_minimum_size = Vector2(HOME_BLOB_SIZE, 24)
	content_stack.add_child(label)

	return button

func _make_home_menu_button() -> Button:
	var button := Button.new()
	button.size = Vector2(HOME_MENU_BUTTON_SIZE, HOME_MENU_BUTTON_SIZE)
	button.custom_minimum_size = Vector2(HOME_MENU_BUTTON_SIZE, HOME_MENU_BUTTON_SIZE)
	button.text = ""
	button.flat = true
	_apply_button_theme(button, THEME_BUTTON_TRANSPARENT)
	_wire_button_feedback(button, "tap")
	button.pressed.connect(_toggle_home_menu)
	_set_or_add_texture_icon(button, "menu", 28, COLOR_TEXT_INVERSE_SOFT)

	return button

func _make_dropdown_button(text: String, callback: Callable) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(128, 44)
	_apply_button_theme(button, THEME_BUTTON_SMALL_SURFACE)
	_wire_button_feedback(button, "tap")
	button.pressed.connect(callback)
	return button

func _make_header_icon_button(text: String, callback: Callable) -> Button:
	var button := Button.new()
	button.text = "" if text == "←" else text
	button.size = Vector2(44, 44)
	button.custom_minimum_size = Vector2(44, 44)
	_apply_button_theme(button, THEME_BUTTON_TRANSPARENT)
	if text == "←":
		_add_back_arrow_icon(button, 44, 44, COLOR_TEXT_INVERSE)
	_wire_button_feedback(button, "back")
	button.pressed.connect(callback)
	return button

func _make_pause_icon_button() -> Button:
	var button := Button.new()
	button.size = Vector2(44, 44)
	button.custom_minimum_size = Vector2(44, 44)
	button.text = ""
	_apply_button_theme(button, THEME_BUTTON_ICON_SURFACE)
	_wire_button_feedback(button, "tap")
	_set_or_add_texture_icon(button, "pause", 28, COLOR_INK)

	return button

func _make_avatar_initial_circle(size: float, color: Color, text: String, font_size: int) -> Panel:
	var avatar := Panel.new()
	avatar.size = Vector2(size, size)
	_apply_panel_theme(avatar, _panel_theme_for_color(color))

	var label := _make_absolute_label(text, font_size, _get_button_text_color(color), 900)
	label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	avatar.add_child(label)

	return avatar

func _make_avatar_icon_circle(size: float, color: Color, icon_kind: String) -> Panel:
	var avatar := Panel.new()
	avatar.size = Vector2(size, size)
	_apply_panel_theme(avatar, _panel_theme_for_color(color))

	var icon_slot := Control.new()
	icon_slot.size = Vector2(size, size)
	icon_slot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	avatar.add_child(icon_slot)

	if icon_kind == "bot":
		_add_bot_avatar_icon(icon_slot, size, COLOR_TEXT_INVERSE)
	else:
		_add_guest_avatar_icon(icon_slot, size, COLOR_TEXT_INVERSE)

	return avatar

func _make_hp_bar(color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.show_percentage = false
	bar.min_value = 0
	bar.max_value = BattleRoom.STARTING_HP
	bar.value = BattleRoom.STARTING_HP
	_apply_progress_theme(bar, _progress_theme_for_color(color))
	return bar

func _add_help_rule(container: VBoxContainer, title_text: String, body_text: String) -> void:
	var rule := VBoxContainer.new()
	rule.custom_minimum_size = Vector2(320, 64)
	rule.add_theme_constant_override("separation", 4)
	container.add_child(rule)

	var title := _make_absolute_label(title_text, 16, COLOR_INK, 800)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	title.custom_minimum_size = Vector2(320, 20)
	rule.add_child(title)

	var body := _make_absolute_label(body_text, 13, COLOR_INK_SOFT, 700)
	body.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.custom_minimum_size = Vector2(320, 36)
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rule.add_child(body)

func _make_wide_page_button(text: String, callback: Callable, color: Color) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 56)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_apply_button_theme(button, _button_theme_for_color(color, THEME_BUTTON_PAGE_PRIMARY, THEME_BUTTON_PAGE_SECONDARY))
	_wire_button_feedback(button, "start")
	button.pressed.connect(callback)
	return button

func _make_prime_key_button(text: String) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(SOLO_KEY_SIZE, SOLO_KEY_SIZE)
	_apply_button_theme(button, THEME_BUTTON_KEYPAD)
	_wire_button_feedback(button, "prime")
	return button

func _make_icon_text_button(
	text: String,
	_background_color: Color,
	_text_color: Color,
	_font_size: int,
	sound_kind: String = "tap"
) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(SOLO_KEY_SIZE, SOLO_KEY_SIZE)
	_apply_button_theme(button, THEME_BUTTON_KEY_ACTION)
	_wire_button_feedback(button, sound_kind)
	return button

func _make_modal_overlay() -> Control:
	var overlay := Control.new()
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP

	var scrim := ColorRect.new()
	scrim.color = Color(0.063, 0.071, 0.122, 0.72)
	scrim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(scrim)

	return overlay

func _make_dialog_panel(height: float) -> Panel:
	var viewport_size := get_viewport_rect().size
	var panel := Panel.new()
	panel.size = Vector2(DIALOG_WIDTH, height)
	panel.position = Vector2((viewport_size.x - DIALOG_WIDTH) / 2.0, (viewport_size.y - height) / 2.0)
	_apply_panel_theme(panel, THEME_PANEL_DIALOG)
	return panel

func _add_dialog_header(panel: Panel, title: String) -> void:
	var header := ColorRect.new()
	header.color = COLOR_PRIMARY
	header.position = Vector2.ZERO
	header.size = Vector2(DIALOG_WIDTH, 56)
	panel.add_child(header)

	var title_label := _make_absolute_label(title, 30, COLOR_TEXT_INVERSE, 900)
	title_label.position = Vector2.ZERO
	title_label.size = Vector2(DIALOG_WIDTH, 56)
	panel.add_child(title_label)

func _make_dialog_button(text: String, callback: Callable, color: Color) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(DIALOG_WIDTH - 24.0, DIALOG_BUTTON_HEIGHT)
	_apply_button_theme(button, _button_theme_for_color(color, THEME_BUTTON_PAGE_PRIMARY, THEME_BUTTON_PAGE_SECONDARY))
	_wire_button_feedback(button, "tap")
	button.pressed.connect(callback)
	return button

func _make_dialog_action_button(text: String, callback: Callable, color: Color) -> Button:
	var button := _make_dialog_button(text, callback, color)
	button.custom_minimum_size = Vector2((DIALOG_WIDTH - 32.0) / 2.0, DIALOG_BUTTON_HEIGHT)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return button

func _make_best_score_badge() -> Panel:
	var badge := Panel.new()
	badge.size = Vector2(124, 28)
	var badge_color := COLOR_PRIMARY_STRONG if did_set_new_best else COLOR_SURFACE
	_apply_panel_theme(badge, THEME_PANEL_BADGE_PRIMARY if did_set_new_best else THEME_PANEL_BADGE_SURFACE)

	var badge_text := "NEW BEST!" if did_set_new_best else "BEST %s" % best_score
	var text_color := _get_button_text_color(badge_color)
	var label := _make_absolute_label(badge_text, 12, text_color, 800)
	label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	badge.add_child(label)
	return badge

func _add_dialog_stat_row(container: VBoxContainer, label_text: String, value: int) -> void:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(DIALOG_WIDTH - 24.0, 36)
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	container.add_child(row)

	var label := _make_absolute_label(label_text, 16, COLOR_INK, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(label)

	var value_label := _make_absolute_label(str(value), 16, COLOR_PRIMARY, 800)
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(value_label)

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
	font.font_names = PackedStringArray(["Menlo", "Courier New", "Monaco"])
	font.font_weight = weight

	var settings := LabelSettings.new()
	settings.font = font
	settings.font_size = font_size
	settings.font_color = color
	return settings

func _get_button_text_color(color: Color) -> Color:
	return COLOR_TEXT_INVERSE if color == COLOR_SECONDARY or color == COLOR_PRIMARY else COLOR_INK

func _wire_button_feedback(button: Button, sound_kind: String) -> void:
	button.button_down.connect(_press_button_feedback.bind(button, sound_kind))
	button.button_up.connect(_release_button_feedback.bind(button))
	button.mouse_exited.connect(_release_button_feedback.bind(button))

func _press_button_feedback(button: Button, sound_kind: String) -> void:
	if not is_instance_valid(button) or button.disabled:
		return

	button.pivot_offset = button.size / 2.0
	_play_sfx(sound_kind)
	var tween := button.create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(button, "scale", Vector2(0.96, 0.96), FEEDBACK_TWEEN_SECONDS)

func _release_button_feedback(button: Button) -> void:
	if not is_instance_valid(button):
		return

	button.pivot_offset = button.size / 2.0
	var tween := button.create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(button, "scale", Vector2.ONE, FEEDBACK_TWEEN_SECONDS)

func _play_sfx(kind: String) -> void:
	var tones: Array = [[150.0, 0.035, 0.16]]

	match kind:
		"prime":
			tones = [[220.0, 0.025, 0.18], [330.0, 0.025, 0.16]]
		"backspace":
			tones = [[130.0, 0.045, 0.18]]
		"submit":
			tones = [[180.0, 0.035, 0.18], [360.0, 0.045, 0.16]]
		"start":
			tones = [[170.0, 0.035, 0.16], [260.0, 0.045, 0.18]]
		"success":
			tones = [[330.0, 0.045, 0.17], [520.0, 0.055, 0.16]]
		"fail":
			tones = [[110.0, 0.075, 0.2]]
		"back":
			tones = [[140.0, 0.035, 0.15]]

	var player := AudioStreamPlayer.new()
	var stream := AudioStreamGenerator.new()
	stream.mix_rate = SFX_SAMPLE_RATE
	stream.buffer_length = 0.25
	player.stream = stream
	player.volume_db = -8.0
	add_child(player)
	player.play()

	var playback := player.get_stream_playback()
	if playback == null:
		player.queue_free()
		return

	var duration := 0.0
	for tone in tones:
		var frequency := float(tone[0])
		var seconds := float(tone[1])
		var volume := float(tone[2])
		duration += seconds
		_push_square_tone(playback, frequency, seconds, volume)
		_push_square_tone(playback, 0.0, 0.006, 0.0)
		duration += 0.006

	get_tree().create_timer(duration + 0.1).timeout.connect(player.queue_free)

func _push_square_tone(
	playback: AudioStreamGeneratorPlayback,
	frequency: float,
	seconds: float,
	volume: float
) -> void:
	var frame_count := int(SFX_SAMPLE_RATE * seconds)
	for index in range(frame_count):
		var sample := 0.0
		if frequency > 0.0:
			var phase := fmod((float(index) * frequency) / float(SFX_SAMPLE_RATE), 1.0)
			sample = volume if phase < 0.5 else -volume
		playback.push_frame(Vector2(sample, sample))

func _add_back_arrow_icon(parent: Control, width: float, height: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "back", int(min(width, height)), color)

func _add_delete_icon(parent: Control, width: float, height: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "delete", int(min(width, height) * 0.52), color)

func _add_submit_icon(parent: Control, width: float, height: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "submit", int(min(width, height) * 0.72), color)

func _add_cpu_icon(parent: Control, size: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "cpu", int(size), color)

func _add_users_icon(parent: Control, size: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "users", int(size), color)

func _add_bot_avatar_icon(parent: Control, size: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "bot", int(size), color)

func _add_guest_avatar_icon(parent: Control, size: float, color: Color) -> void:
	_set_or_add_texture_icon(parent, "guest", int(size), color)

func _add_timer_icon(parent: Control, color: Color = COLOR_TEXT_INVERSE) -> void:
	_set_or_add_texture_icon(parent, "timer", 32, color)

func _add_battle_icon(parent: Control, color: Color = COLOR_TEXT_INVERSE) -> void:
	_set_or_add_texture_icon(parent, "battle", 32, color)

func _add_help_icon(parent: Control, color: Color = COLOR_TEXT_INVERSE) -> void:
	_set_or_add_texture_icon(parent, "help", 32, color)

func _add_page_timer_icon(parent: Control) -> void:
	_set_or_add_texture_icon(parent, "timer", 64, COLOR_TEXT_INVERSE)

func _add_page_battle_icon(parent: Control) -> void:
	_set_or_add_texture_icon(parent, "battle", 64, COLOR_TEXT_INVERSE)

func _set_or_add_texture_icon(parent: Control, kind: String, icon_size: int, color: Color) -> void:
	var texture := _get_icon_texture(kind, color, icon_size)
	if parent is Button:
		var button := parent as Button
		button.icon = texture
		button.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		button.vertical_icon_alignment = VERTICAL_ALIGNMENT_CENTER
		button.expand_icon = false
		button.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		return

	var texture_rect := TextureRect.new()
	texture_rect.texture = texture
	texture_rect.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	texture_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	texture_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	parent.add_child(texture_rect)

func _get_icon_texture(kind: String, color: Color, size: int) -> Texture2D:
	var cache_key := "%s:%s:%d" % [kind, color.to_html(true), size]
	if icon_texture_cache.has(cache_key):
		return icon_texture_cache[cache_key]

	var image := Image.create(size, size, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	var stroke: int = max(2, int(size / 12.0))
	match kind:
		"menu":
			_draw_icon_rect(image, Rect2i(int(size * 0.22), int(size * 0.26), int(size * 0.56), max(2, stroke - 1)), color)
			_draw_icon_rect(image, Rect2i(int(size * 0.22), int(size * 0.48), int(size * 0.56), max(2, stroke - 1)), color)
			_draw_icon_rect(image, Rect2i(int(size * 0.22), int(size * 0.70), int(size * 0.56), max(2, stroke - 1)), color)
		"back":
			_draw_icon_line(image, Vector2(size * 0.68, size * 0.5), Vector2(size * 0.28, size * 0.5), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.28, size * 0.5), Vector2(size * 0.44, size * 0.34), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.28, size * 0.5), Vector2(size * 0.44, size * 0.66), color, stroke)
		"delete":
			var points := [
				Vector2(size * 0.28, size * 0.24),
				Vector2(size * 0.84, size * 0.24),
				Vector2(size * 0.84, size * 0.76),
				Vector2(size * 0.28, size * 0.76),
				Vector2(size * 0.12, size * 0.5),
				Vector2(size * 0.28, size * 0.24),
			]
			_draw_icon_polyline(image, points, color, stroke)
			_draw_icon_line(image, Vector2(size * 0.48, size * 0.4), Vector2(size * 0.68, size * 0.6), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.68, size * 0.4), Vector2(size * 0.48, size * 0.6), color, stroke)
		"submit":
			_draw_icon_rect_outline(image, Rect2i(2, 2, size - 4, size - 4), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.5, size * 0.72), Vector2(size * 0.5, size * 0.24), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.5, size * 0.24), Vector2(size * 0.32, size * 0.42), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.5, size * 0.24), Vector2(size * 0.68, size * 0.42), color, stroke)
		"pause":
			_draw_icon_rect(image, Rect2i(int(size * 0.28), int(size * 0.2), stroke, int(size * 0.6)), color)
			_draw_icon_rect(image, Rect2i(int(size * 0.58), int(size * 0.2), stroke, int(size * 0.6)), color)
		"timer":
			_draw_icon_rect_outline(image, Rect2i(int(size * 0.22), int(size * 0.26), int(size * 0.56), int(size * 0.56)), color, stroke)
			_draw_icon_rect(image, Rect2i(int(size * 0.4), int(size * 0.1), int(size * 0.2), stroke), color)
			_draw_icon_line(image, Vector2(size * 0.5, size * 0.54), Vector2(size * 0.66, size * 0.38), color, stroke)
		"battle":
			_draw_icon_line(image, Vector2(size * 0.24, size * 0.22), Vector2(size * 0.76, size * 0.74), color, stroke)
			_draw_icon_line(image, Vector2(size * 0.76, size * 0.22), Vector2(size * 0.24, size * 0.74), color, stroke)
			_draw_icon_rect(image, Rect2i(int(size * 0.16), int(size * 0.12), int(size * 0.22), stroke), color)
			_draw_icon_rect(image, Rect2i(int(size * 0.62), int(size * 0.12), int(size * 0.22), stroke), color)
		"cpu":
			_draw_icon_rect_outline(image, Rect2i(int(size * 0.28), int(size * 0.28), int(size * 0.44), int(size * 0.44)), color, max(1, stroke - 1))
			for index in [1, 2, 3]:
				var pin := int(size * (0.2 + (0.2 * index)))
				_draw_icon_rect(image, Rect2i(pin, int(size * 0.08), max(1, stroke - 1), int(size * 0.16)), color)
				_draw_icon_rect(image, Rect2i(pin, int(size * 0.76), max(1, stroke - 1), int(size * 0.16)), color)
				_draw_icon_rect(image, Rect2i(int(size * 0.08), pin, int(size * 0.16), max(1, stroke - 1)), color)
				_draw_icon_rect(image, Rect2i(int(size * 0.76), pin, int(size * 0.16), max(1, stroke - 1)), color)
		"users":
			_draw_icon_rect_outline(image, Rect2i(int(size * 0.2), int(size * 0.18), int(size * 0.28), int(size * 0.28)), color, max(1, stroke - 1))
			_draw_icon_rect_outline(image, Rect2i(int(size * 0.52), int(size * 0.28), int(size * 0.24), int(size * 0.24)), color, max(1, stroke - 1))
			_draw_icon_polyline(image, [Vector2(size * 0.14, size * 0.78), Vector2(size * 0.26, size * 0.58), Vector2(size * 0.54, size * 0.58), Vector2(size * 0.66, size * 0.78)], color, stroke)
			_draw_icon_polyline(image, [Vector2(size * 0.54, size * 0.68), Vector2(size * 0.78, size * 0.68), Vector2(size * 0.88, size * 0.82)], color, stroke)
		"bot":
			_draw_icon_line(image, Vector2(size * 0.5, size * 0.36), Vector2(size * 0.5, size * 0.16), color, stroke)
			_draw_icon_rect(image, Rect2i(int(size * 0.44), int(size * 0.08), int(size * 0.12), int(size * 0.12)), color)
			_draw_icon_rect_outline(image, Rect2i(int(size * 0.26), int(size * 0.38), int(size * 0.48), int(size * 0.34)), color, stroke)
			_draw_icon_rect(image, Rect2i(int(size * 0.38), int(size * 0.5), stroke, stroke), color)
			_draw_icon_rect(image, Rect2i(int(size * 0.58), int(size * 0.5), stroke, stroke), color)
			_draw_icon_rect(image, Rect2i(int(size * 0.4), int(size * 0.62), int(size * 0.2), stroke), color)
		"guest":
			_draw_icon_rect_outline(image, Rect2i(int(size * 0.32), int(size * 0.18), int(size * 0.36), int(size * 0.36)), color, stroke)
			_draw_icon_polyline(image, [Vector2(size * 0.24, size * 0.82), Vector2(size * 0.36, size * 0.62), Vector2(size * 0.64, size * 0.62), Vector2(size * 0.76, size * 0.82)], color, stroke)
		"help":
			_draw_question_mark_icon(image, color)

	var texture := ImageTexture.create_from_image(image)
	icon_texture_cache[cache_key] = texture
	return texture

func _draw_question_mark_icon(image: Image, color: Color) -> void:
	var size: int = image.get_width()
	var cell: int = max(2, int(size / 8.0))
	for point in [
		Vector2i(2, 1),
		Vector2i(3, 1),
		Vector2i(4, 1),
		Vector2i(5, 2),
		Vector2i(5, 3),
		Vector2i(4, 4),
		Vector2i(3, 5),
		Vector2i(3, 7),
	]:
		_draw_icon_rect(image, Rect2i(point.x * cell, point.y * cell, cell, cell), color)

func _draw_icon_polyline(image: Image, points: Array, color: Color, thickness: int) -> void:
	for index in range(points.size() - 1):
		_draw_icon_line(image, points[index], points[index + 1], color, thickness)

func _draw_icon_line(image: Image, from_point: Vector2, to_point: Vector2, color: Color, thickness: int) -> void:
	var steps := int(max(abs(to_point.x - from_point.x), abs(to_point.y - from_point.y)))
	if steps <= 0:
		_draw_icon_centered_pixel(image, int(from_point.x), int(from_point.y), thickness, color)
		return

	for index in range(steps + 1):
		var t := float(index) / float(steps)
		var point := from_point.lerp(to_point, t)
		_draw_icon_centered_pixel(image, int(round(point.x)), int(round(point.y)), thickness, color)

func _draw_icon_rect_outline(image: Image, rect: Rect2i, color: Color, thickness: int) -> void:
	_draw_icon_rect(image, Rect2i(rect.position.x, rect.position.y, rect.size.x, thickness), color)
	_draw_icon_rect(image, Rect2i(rect.position.x, rect.position.y + rect.size.y - thickness, rect.size.x, thickness), color)
	_draw_icon_rect(image, Rect2i(rect.position.x, rect.position.y, thickness, rect.size.y), color)
	_draw_icon_rect(image, Rect2i(rect.position.x + rect.size.x - thickness, rect.position.y, thickness, rect.size.y), color)

func _draw_icon_centered_pixel(image: Image, x: int, y: int, size: int, color: Color) -> void:
	var half := int(size / 2.0)
	_draw_icon_rect(image, Rect2i(x - half, y - half, size, size), color)

func _draw_icon_rect(image: Image, rect: Rect2i, color: Color) -> void:
	var x_start: int = max(0, rect.position.x)
	var y_start: int = max(0, rect.position.y)
	var x_end: int = min(image.get_width(), rect.position.x + rect.size.x)
	var y_end: int = min(image.get_height(), rect.position.y + rect.size.y)
	for y in range(y_start, y_end):
		for x in range(x_start, x_end):
			image.set_pixel(x, y, color)

func _make_button_style(color: Color, content_margin: int = 16) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = PIXEL_RADIUS
	style.corner_radius_top_right = PIXEL_RADIUS
	style.corner_radius_bottom_right = PIXEL_RADIUS
	style.corner_radius_bottom_left = PIXEL_RADIUS
	style.border_color = COLOR_INK
	style.border_width_left = PIXEL_BORDER
	style.border_width_top = PIXEL_BORDER
	style.border_width_right = PIXEL_BORDER
	style.border_width_bottom = PIXEL_BORDER
	style.content_margin_left = content_margin
	style.content_margin_right = content_margin
	style.content_margin_top = max(0, content_margin / 2)
	style.content_margin_bottom = max(0, content_margin / 2)
	return style

func _make_bar_style(color: Color, radius: int) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = PIXEL_RADIUS
	style.corner_radius_top_right = PIXEL_RADIUS
	style.corner_radius_bottom_right = PIXEL_RADIUS
	style.corner_radius_bottom_left = PIXEL_RADIUS
	return style

func _make_dialog_panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = COLOR_SURFACE
	style.border_color = COLOR_INK
	style.border_width_left = PIXEL_BORDER
	style.border_width_top = PIXEL_BORDER
	style.border_width_right = PIXEL_BORDER
	style.border_width_bottom = PIXEL_BORDER
	style.corner_radius_top_left = PIXEL_RADIUS
	style.corner_radius_top_right = PIXEL_RADIUS
	style.corner_radius_bottom_right = PIXEL_RADIUS
	style.corner_radius_bottom_left = PIXEL_RADIUS
	return style

func _make_transparent_button_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color.TRANSPARENT
	return style

func _make_circle_style(color: Color, _radius: float, border_color: Color, border_width: int) -> StyleBoxFlat:
	return _make_pixel_box_style(color, border_color, border_width)

func _make_pixel_box_style(color: Color, border_color: Color, border_width: int) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	var corner_radius := PIXEL_RADIUS
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
	style.corner_radius_top_left = PIXEL_RADIUS
	style.corner_radius_top_right = PIXEL_RADIUS
	style.corner_radius_bottom_right = PIXEL_RADIUS
	style.corner_radius_bottom_left = PIXEL_RADIUS
	style.border_color = COLOR_INK
	style.border_width_left = PIXEL_BORDER
	style.border_width_top = PIXEL_BORDER
	style.border_width_right = PIXEL_BORDER
	style.border_width_bottom = PIXEL_BORDER
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
