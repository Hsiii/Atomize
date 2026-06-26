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
const COLOR_PRIMARY := Color("#184e77")
const COLOR_PRIMARY_STRONG := Color("#168aad")
const COLOR_SECONDARY := Color("#34a0a4")
const COLOR_INK := Color("#223247")
const COLOR_PAGE_BG := Color("#f4f7fb")
const COLOR_SURFACE := Color("#ffffff")
const COLOR_INK_SOFT := Color(0.063, 0.106, 0.180, 0.72)
const COLOR_KEYPAD_BUTTON_BG := Color(0.094, 0.306, 0.467, 0.12)
const COLOR_KEYPAD_BUTTON_ACTIVE_BG := Color(0.063, 0.106, 0.180, 0.14)
const COLOR_KEYPAD_BUTTON_TEXT := Color(0.063, 0.106, 0.180, 0.54)
const COLOR_TEXT_INVERSE := Color("#ffffff")
const COLOR_TEXT_INVERSE_SOFT := Color(1.0, 1.0, 1.0, 0.64)
const COLOR_BORDER_SOFT := Color(0.094, 0.306, 0.467, 0.20)
const COLOR_BORDER_CONTRAST := Color(1.0, 1.0, 1.0, 0.26)
const COLOR_BORDER_INVERSE_SOFT := Color(1.0, 1.0, 1.0, 0.28)
const COLOR_OUTLINE_STRONG := Color(0.094, 0.306, 0.467, 0.44)
const COLOR_BUTTON_DISABLED := Color(0.094, 0.306, 0.467, 0.12)
const COLOR_DANGER := Color("#c43a3a")
const COLOR_GOLD := Color("#d4a017")
const COLOR_TRACK := Color(0.063, 0.106, 0.180, 0.12)
const COLOR_BLOB_SHADOW := Color(0.063, 0.106, 0.180, 0.08)
const PIXEL_BORDER := 2
const RADIUS_BUTTON := 16
const RADIUS_PANEL := 24
const RADIUS_PILL := 2048
const FEEDBACK_TWEEN_SECONDS := 0.1
const HAPTIC_TAP_MS := 8
const HAPTIC_SUCCESS_MS := 22
const HAPTIC_FAIL_MS := 36
const ATTACK_PARTICLE_COUNT := 9
const DAMAGE_POP_SECONDS := 0.7
const SFX_BUS_NAME := "SFX"
const SFX_POOL_SIZE := 8
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
const THEME_BUTTON_BLOB_PRIMARY := "AtomButtonBlobPrimary"
const THEME_BUTTON_BLOB_SECONDARY := "AtomButtonBlobSecondary"
const THEME_PANEL_HERO_ORB := "AtomPanelHeroOrb"
const THEME_PANEL_LOGO_DOT := "AtomPanelLogoDot"
const THEME_PANEL_SURFACE := "AtomPanelSurface"
const THEME_PANEL_CONTAINER_SURFACE := "AtomPanelContainerSurface"
const THEME_PANEL_DIALOG := "AtomPanelDialog"
const THEME_PANEL_TARGET := "AtomPanelTarget"
const THEME_PANEL_AVATAR_PRIMARY := "AtomPanelAvatarPrimary"
const THEME_PANEL_AVATAR_SECONDARY := "AtomPanelAvatarSecondary"
const THEME_PANEL_BADGE_PRIMARY := "AtomPanelBadgePrimary"
const THEME_PANEL_BADGE_SURFACE := "AtomPanelBadgeSurface"
const THEME_PANEL_PARTICLE_PRIMARY := "AtomPanelParticlePrimary"
const THEME_PANEL_PARTICLE_SECONDARY := "AtomPanelParticleSecondary"
const THEME_PANEL_PARTICLE_DANGER := "AtomPanelParticleDanger"
const THEME_PANEL_PARTICLE_GOLD := "AtomPanelParticleGold"
const THEME_PANEL_PARTICLE_RING_PRIMARY := "AtomPanelParticleRingPrimary"
const THEME_PANEL_PARTICLE_RING_SECONDARY := "AtomPanelParticleRingSecondary"
const THEME_PROGRESS_PRIMARY := "AtomProgressPrimary"
const THEME_PROGRESS_SECONDARY := "AtomProgressSecondary"
const THEME_PROGRESS_DANGER := "AtomProgressDanger"
const THEME_PROGRESS_GOLD := "AtomProgressGold"
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
const ICON_PATHS := {
	"atom": "res://assets/icons/atom.svg",
	"back": "res://assets/icons/back.svg",
	"battle": "res://assets/icons/battle.svg",
	"bot": "res://assets/icons/bot.svg",
	"cpu": "res://assets/icons/cpu.svg",
	"delete": "res://assets/icons/delete.svg",
	"guest": "res://assets/icons/guest.svg",
	"help": "res://assets/icons/help.svg",
	"menu": "res://assets/icons/menu.svg",
	"pause": "res://assets/icons/pause.svg",
	"submit": "res://assets/icons/submit.svg",
	"timer": "res://assets/icons/timer.svg",
	"trophy": "res://assets/icons/trophy.svg",
	"users": "res://assets/icons/users.svg",
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
var pixel_circle_texture_cache: Dictionary = {}
var active_control_tweens: Dictionary = {}
var sfx_pool_root: Node
var sfx_players: Array[AudioStreamPlayer] = []
var sfx_pool_index := 0

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
var target_blob_panel: Panel
var timer_bar: ProgressBar
var enemy_hp_bar: ProgressBar
var enemy_hp_label: Label
var player_hp_bar: ProgressBar
var player_hp_label: Label

func _ready() -> void:
	_ensure_audio_buses()
	_build_sfx_pool()
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
	var hero_diameter: float = max(viewport_size.x * 1.6, viewport_size.y * 1.3)
	var hero := Panel.new()
	hero.position = Vector2((viewport_size.x - hero_diameter) / 2.0, (viewport_size.y * 0.5) - hero_diameter)
	hero.size = Vector2(hero_diameter, hero_diameter)
	_apply_panel_theme(hero, THEME_PANEL_HERO_ORB)
	add_child(hero)

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
	dropdown.size = Vector2(128, 104)
	dropdown.add_theme_constant_override("separation", 8)
	add_child(dropdown)

	var help_button := _make_dropdown_button("Help", _start_help)
	dropdown.add_child(help_button)

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
	target_blob_panel = target_blob

	_add_target_atom_art(target_blob, 124)

	target_label = _make_absolute_label("", 48, COLOR_INK, 900)
	target_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	target_blob.add_child(target_label)

	stage_label = _make_absolute_label("", 12, COLOR_INK_SOFT, 800)
	stage_label.position = Vector2(24, 382)
	stage_label.size = Vector2(viewport_size.x - 48.0, 24)
	add_child(stage_label)

	battle_result_text = ""
	result_label = _make_absolute_label("", 15, COLOR_SECONDARY, 800)
	result_label.position = Vector2(0, 412)
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
	_add_delete_icon(backspace_button, SOLO_KEY_SIZE, SOLO_KEY_SIZE, _get_button_text_color(COLOR_PRIMARY_STRONG))
	backspace_button.pressed.connect(_backspace_battle_queue)
	add_child(backspace_button)

	submit_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 34, "submit")
	submit_button.position = Vector2(action_x, prime_grid.position.y + SOLO_KEY_SIZE + SOLO_KEY_GAP)
	submit_button.size = Vector2(SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP)
	_add_submit_icon(submit_button, SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP, _get_button_text_color(COLOR_PRIMARY_STRONG))
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
	_clear_control_tweens()
	for child in get_children():
		if child == sfx_pool_root:
			continue

		child.queue_free()
	target_blob_panel = null

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

	timer_label = _make_absolute_label("", 14, COLOR_PRIMARY, 800)
	timer_label.position = Vector2((viewport_size.x - 72.0) / 2.0, 6)
	timer_label.size = Vector2(72, 20)
	add_child(timer_label)

	score_label = _make_absolute_label("", 14, COLOR_PRIMARY, 800)
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	score_label.position = Vector2(viewport_size.x - 112.0, 16)
	score_label.size = Vector2(96, 24)
	add_child(score_label)

	stage_label = _make_absolute_label("", 12, COLOR_INK_SOFT, 800)
	stage_label.position = Vector2(24, 92)
	stage_label.size = Vector2(viewport_size.x - 48.0, 24)
	add_child(stage_label)

	var target_blob := Panel.new()
	target_blob.size = Vector2(SOLO_TARGET_SIZE, SOLO_TARGET_SIZE)
	target_blob.position = Vector2((viewport_size.x - SOLO_TARGET_SIZE) / 2.0, 120)
	_apply_panel_theme(target_blob, THEME_PANEL_TARGET)
	add_child(target_blob)
	target_blob_panel = target_blob

	_add_target_atom_art(target_blob, 192)

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
	_add_delete_icon(backspace_button, SOLO_KEY_SIZE, SOLO_KEY_SIZE, _get_button_text_color(COLOR_PRIMARY_STRONG))
	backspace_button.pressed.connect(_backspace_queue)
	add_child(backspace_button)

	submit_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 34, "submit")
	submit_button.position = Vector2(action_x, prime_grid.position.y + SOLO_KEY_SIZE + SOLO_KEY_GAP)
	submit_button.size = Vector2(SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP)
	_add_submit_icon(submit_button, SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP, _get_button_text_color(COLOR_PRIMARY_STRONG))
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
	_apply_progress_theme(timer_bar, _timer_progress_theme())
	timer_label.text = "%02d" % ceili(solo_time_left)
	_set_label_color(timer_label, _timer_text_color())
	score_label.text = "%s pt" % int(solo_state["score"])
	stage_label.text = "STAGE %s" % [int(solo_state["clearedStages"]) + 1]
	target_label.text = str(stage["remainingValue"])
	factors_label.text = "%s FACTORS LEFT" % stage["remainingFactors"].size()
	factors_label.visible = true
	queue_label.text = _join_numbers(prime_queue) if not prime_queue.is_empty() else "Queue primes"
	queue_label.modulate.a = 1.0 if not prime_queue.is_empty() else 0.46
	queue_label.visible = true
	result_label.text = last_result_text
	result_label.visible = last_result_text != ""
	_set_label_color(result_label, _feedback_text_color(last_result_text, COLOR_PRIMARY))

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
	stage_label.text = "STAGE %s" % [int(player["stageIndex"]) + 1]
	target_label.text = str(player["stage"]["remainingValue"])
	queue_label.text = _join_numbers(battle_prime_queue) if not battle_prime_queue.is_empty() else "Queue attacks"
	queue_label.modulate.a = 1.0 if not battle_prime_queue.is_empty() else 0.46
	queue_label.visible = true
	result_label.text = battle_result_text
	result_label.visible = battle_result_text != ""
	_set_label_color(result_label, _feedback_text_color(battle_result_text, COLOR_SECONDARY))

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
		_play_queue_limit_feedback()
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
			_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
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
			battle_result_text = ""
			_play_sfx("success" if player_id == BATTLE_PLAYER_ID else "fail")
			_play_battle_event_feedback(event)

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
		_play_queue_limit_feedback()
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
		_play_target_fault()
		_spawn_damage_pop("-1 HP", _target_pop_position(), COLOR_DANGER)
		_spawn_radial_particles(_target_center(), THEME_PANEL_PARTICLE_DANGER, THEME_PANEL_PARTICLE_DANGER, 6)
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
		_play_target_fault()
		_spawn_damage_pop("-1 HP", _target_pop_position(), COLOR_DANGER)
		_spawn_radial_particles(_target_center(), THEME_PANEL_PARTICLE_DANGER, THEME_PANEL_PARTICLE_DANGER, 6)
	else:
		solo_state = next_state
		last_result_text = "Cleared" if outcome["cleared"] else "Hit +%s" % Game.compute_battle_factor_damage(next_prime)
		_play_sfx("success" if outcome["cleared"] else "prime")
		_play_target_impact()
		_spawn_radial_particles(
			_target_center(),
			THEME_PANEL_PARTICLE_PRIMARY,
			THEME_PANEL_PARTICLE_RING_PRIMARY,
			10 if outcome["cleared"] else 5
		)

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

	_add_button_theme(app_theme, THEME_BUTTON_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 18)
	_add_button_theme(app_theme, THEME_BUTTON_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 18)
	_add_button_theme(app_theme, THEME_BUTTON_SURFACE, COLOR_SURFACE, COLOR_PRIMARY, 16, COLOR_KEYPAD_BUTTON_BG, 16, RADIUS_BUTTON, COLOR_BORDER_SOFT)
	_add_button_theme(app_theme, THEME_BUTTON_KEYPAD, COLOR_KEYPAD_BUTTON_BG, COLOR_KEYPAD_BUTTON_TEXT, 32, COLOR_KEYPAD_BUTTON_ACTIVE_BG, 0, RADIUS_PILL, Color.TRANSPARENT, 0)
	_add_button_theme(app_theme, THEME_BUTTON_KEY_ACTION, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 28, COLOR_PRIMARY, 0, RADIUS_BUTTON, COLOR_BORDER_CONTRAST)
	_add_button_theme(app_theme, THEME_BUTTON_ICON_SURFACE, COLOR_SURFACE, COLOR_PRIMARY, 16, COLOR_KEYPAD_BUTTON_BG, 0, RADIUS_PILL, COLOR_BORDER_SOFT)
	_add_button_theme(app_theme, THEME_BUTTON_SMALL_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 13)
	_add_button_theme(app_theme, THEME_BUTTON_SMALL_SURFACE, COLOR_SURFACE, COLOR_PRIMARY, 14, COLOR_KEYPAD_BUTTON_BG, 16, RADIUS_BUTTON, COLOR_BORDER_SOFT)
	_add_button_theme(app_theme, THEME_BUTTON_PAGE_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 16)
	_add_button_theme(app_theme, THEME_BUTTON_PAGE_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 16)
	_add_button_theme(app_theme, THEME_BUTTON_BLOB_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 16, COLOR_PRIMARY_STRONG, 16, RADIUS_PILL, COLOR_BORDER_INVERSE_SOFT)
	_add_button_theme(app_theme, THEME_BUTTON_BLOB_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 16, COLOR_SECONDARY, 16, RADIUS_PILL, COLOR_BORDER_INVERSE_SOFT)
	_add_transparent_button_theme(app_theme)
	_add_panel_theme(app_theme, THEME_PANEL_HERO_ORB, "Panel", _make_pixel_box_style(COLOR_PRIMARY, COLOR_OUTLINE_STRONG, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_LOGO_DOT, "Panel", _make_pixel_box_style(COLOR_TEXT_INVERSE, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_SURFACE, "Panel", _make_panel_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_CONTAINER_SURFACE, "PanelContainer", _make_panel_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG, "Panel", _make_dialog_panel_style())
	_add_panel_theme(app_theme, THEME_PANEL_TARGET, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_AVATAR_PRIMARY, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_AVATAR_SECONDARY, "Panel", _make_pixel_box_style(COLOR_SECONDARY, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_BADGE_PRIMARY, "Panel", _make_button_style(COLOR_PRIMARY_STRONG))
	_add_panel_theme(app_theme, THEME_PANEL_BADGE_SURFACE, "Panel", _make_button_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_PRIMARY, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_SECONDARY, "Panel", _make_pixel_box_style(COLOR_SECONDARY, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_DANGER, "Panel", _make_pixel_box_style(COLOR_DANGER, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_GOLD, "Panel", _make_pixel_box_style(COLOR_GOLD, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_RING_PRIMARY, "Panel", _make_outline_circle_style(RADIUS_PILL, COLOR_PRIMARY_STRONG, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_RING_SECONDARY, "Panel", _make_outline_circle_style(RADIUS_PILL, COLOR_SECONDARY, PIXEL_BORDER))
	_add_progress_theme(app_theme, THEME_PROGRESS_PRIMARY, COLOR_PRIMARY_STRONG)
	_add_progress_theme(app_theme, THEME_PROGRESS_SECONDARY, COLOR_SECONDARY)
	_add_progress_theme(app_theme, THEME_PROGRESS_DANGER, COLOR_DANGER)
	_add_progress_theme(app_theme, THEME_PROGRESS_GOLD, COLOR_GOLD)

	return app_theme

func _add_button_theme(
	app_theme: Theme,
	variation: String,
	normal_color: Color,
	text_color: Color,
	font_size: int,
	hover_color: Color = Color.TRANSPARENT,
	content_margin: int = 16,
	radius: int = RADIUS_BUTTON,
	border_color: Color = COLOR_BORDER_CONTRAST,
	border_width: int = PIXEL_BORDER
) -> void:
	var resolved_hover_color := hover_color if hover_color != Color.TRANSPARENT else normal_color
	var pressed_color := normal_color.lerp(COLOR_INK, 0.08)
	app_theme.set_type_variation(variation, "Button")
	app_theme.set_font("font", variation, _make_ui_font(800))
	app_theme.set_font_size("font_size", variation, font_size)
	app_theme.set_stylebox("normal", variation, _make_button_style(normal_color, content_margin, radius, border_color, border_width))
	app_theme.set_stylebox("hover", variation, _make_button_style(resolved_hover_color, content_margin, radius, border_color, border_width))
	app_theme.set_stylebox("focus", variation, _make_button_style(normal_color, content_margin, radius, border_color, border_width))
	app_theme.set_stylebox("pressed", variation, _make_button_style(pressed_color, content_margin, radius, border_color, border_width))
	app_theme.set_stylebox("hover_pressed", variation, _make_button_style(pressed_color, content_margin, radius, border_color, border_width))
	var disabled_color := Color(normal_color.r, normal_color.g, normal_color.b, max(0.18, normal_color.a * 0.38))
	app_theme.set_stylebox("disabled", variation, _make_button_style(disabled_color, content_margin, radius, Color.TRANSPARENT, 0))
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

	var disabled_text_color := Color(text_color.r, text_color.g, text_color.b, max(0.38, text_color.a * 0.38))
	app_theme.set_color("font_disabled_color", variation, disabled_text_color)
	app_theme.set_color("icon_disabled_color", variation, disabled_text_color)

func _add_panel_theme(app_theme: Theme, variation: String, base_type: String, style: StyleBox) -> void:
	app_theme.set_type_variation(variation, base_type)
	app_theme.set_stylebox("panel", variation, style)

func _add_progress_theme(app_theme: Theme, variation: String, fill_color: Color) -> void:
	app_theme.set_type_variation(variation, "ProgressBar")
	app_theme.set_stylebox("background", variation, _make_bar_style(COLOR_TRACK, 8))
	app_theme.set_stylebox("fill", variation, _make_bar_style(fill_color, 8))

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

	var filled_o := Panel.new()
	filled_o.size = Vector2(28, 28)
	filled_o.position = Vector2(2, 22)
	_apply_panel_theme(filled_o, THEME_PANEL_LOGO_DOT)
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
	_apply_button_theme(button, _button_theme_for_color(color, THEME_BUTTON_BLOB_PRIMARY, THEME_BUTTON_BLOB_SECONDARY))
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
	return COLOR_TEXT_INVERSE if color in [COLOR_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_SECONDARY, COLOR_DANGER] else COLOR_PRIMARY

func _timer_progress_theme() -> String:
	if solo_time_left <= 10.0:
		return THEME_PROGRESS_DANGER

	if solo_time_left <= 20.0:
		return THEME_PROGRESS_GOLD

	return THEME_PROGRESS_PRIMARY

func _timer_text_color() -> Color:
	if solo_time_left <= 10.0:
		return COLOR_DANGER

	if solo_time_left <= 20.0:
		return COLOR_GOLD

	return COLOR_PRIMARY

func _feedback_text_color(text: String, fallback: Color) -> Color:
	if text == "":
		return fallback

	if text.begins_with("Miss") or text.begins_with("Overrun") or text.begins_with("-") or text == "Queue full":
		return COLOR_DANGER

	if text.begins_with("Cleared"):
		return COLOR_GOLD

	return fallback

func _set_label_color(label: Label, color: Color) -> void:
	if not is_instance_valid(label) or label.label_settings == null:
		return

	label.label_settings.font_color = color

func _add_target_atom_art(parent: Control, icon_size: int) -> void:
	var atom_art := TextureRect.new()
	atom_art.texture = _get_icon_texture("atom", Color(1.0, 1.0, 1.0, 0.26), icon_size)
	atom_art.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	atom_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	atom_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	atom_art.size = Vector2(icon_size, icon_size)
	atom_art.position = (parent.size - atom_art.size) / 2.0
	parent.add_child(atom_art)

func _play_target_impact() -> void:
	if not is_instance_valid(target_blob_panel):
		return

	target_blob_panel.pivot_offset = target_blob_panel.size / 2.0
	var tween := _make_control_tween(target_blob_panel, "target-impact")
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(target_blob_panel, "scale", Vector2(0.94, 0.94), 0.04)
	tween.tween_property(target_blob_panel, "scale", Vector2(1.04, 1.04), 0.04)
	tween.tween_property(target_blob_panel, "scale", Vector2.ONE, 0.04)

func _play_target_fault() -> void:
	if not is_instance_valid(target_blob_panel):
		return

	_shake_control(target_blob_panel, 12.0)
	_flash_control(target_blob_panel, COLOR_DANGER, 0.24)

func _target_center() -> Vector2:
	if not is_instance_valid(target_blob_panel):
		var viewport_size := get_viewport_rect().size
		return viewport_size / 2.0

	return target_blob_panel.global_position + (target_blob_panel.size / 2.0)

func _target_pop_position() -> Vector2:
	return _target_center() + Vector2(-48, -24)

func _play_hp_hit(bar: ProgressBar, damage: int) -> void:
	if not is_instance_valid(bar) or damage <= 0:
		return

	_shake_control(bar, 6.0)
	_flash_control(bar, COLOR_DANGER, 0.56)
	_spawn_damage_pop("-%s" % damage, _hp_pop_position(bar), COLOR_DANGER)

func _play_hp_regen(bar: ProgressBar, regen: int) -> void:
	if not is_instance_valid(bar) or regen <= 0:
		return

	_flash_control(bar, COLOR_GOLD, 0.48)
	_spawn_damage_pop("+%s" % regen, _hp_pop_position(bar), COLOR_GOLD)

func _hp_pop_position(bar: ProgressBar) -> Vector2:
	var y_offset := 18.0 if bar == enemy_hp_bar else -58.0
	return bar.global_position + Vector2((bar.size.x - 96.0) / 2.0, y_offset)

func _shake_control(control: Control, distance: float) -> void:
	if not is_instance_valid(control):
		return

	var origin := control.position
	var tween := _make_control_tween(control, "shake")
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(control, "position", origin + Vector2(-distance, 0), 0.02)
	tween.tween_property(control, "position", origin + Vector2(distance * 0.75, 0), 0.02)
	tween.tween_property(control, "position", origin + Vector2(-distance * 0.42, 0), 0.02)
	tween.tween_property(control, "position", origin + Vector2(distance * 0.22, 0), 0.02)
	tween.tween_property(control, "position", origin, 0.02)

func _flash_control(control: Control, color: Color, alpha: float) -> void:
	if not is_instance_valid(control):
		return

	var flash: Control
	if control == target_blob_panel:
		var panel_flash := Panel.new()
		_apply_panel_theme(panel_flash, THEME_PANEL_PARTICLE_DANGER if color == COLOR_DANGER else THEME_PANEL_PARTICLE_GOLD)
		flash = panel_flash
	else:
		var rect_flash := ColorRect.new()
		rect_flash.color = color
		flash = rect_flash

	flash.modulate = Color(1, 1, 1, alpha)
	flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	flash.size = control.size
	control.add_child(flash)

	var tween := flash.create_tween()
	tween.tween_property(flash, "modulate", Color(1, 1, 1, 0), 0.18)
	tween.finished.connect(flash.queue_free)

func _spawn_damage_pop(text: String, position: Vector2, color: Color) -> void:
	var label := _make_absolute_label(text, 18, color, 900)
	label.position = position
	label.size = Vector2(96, 28)
	label.modulate = Color(1, 1, 1, 1)
	add_child(label)

	var tween := label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position", position + Vector2(0, -18), DAMAGE_POP_SECONDS).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate", Color(1, 1, 1, 0), DAMAGE_POP_SECONDS).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(label.queue_free)

func _spawn_radial_particles(center: Vector2, fill_theme: String, ring_theme: String, count: int = 8) -> void:
	for index in range(count):
		var angle := (TAU * float(index)) / float(count)
		var distance := 28.0 + float(index % 3) * 8.0
		var endpoint := center + Vector2(cos(angle), sin(angle)) * distance
		_spawn_particle(center, endpoint, fill_theme if index % 3 != 0 else ring_theme, 0.26 + float(index % 2) * 0.04, index)

func _spawn_attack_particles(source: Vector2, target: Vector2, fill_theme: String, ring_theme: String) -> void:
	var delta := target - source
	var direction := delta.normalized() if delta.length() > 0.0 else Vector2.RIGHT
	var tangent := Vector2(-direction.y, direction.x)
	for index in range(ATTACK_PARTICLE_COUNT):
		var middle_offset := float(index - int(ATTACK_PARTICLE_COUNT / 2)) * 7.0
		var endpoint := target + (tangent * middle_offset) - (direction * float(index % 3) * 4.0)
		_spawn_particle(source, endpoint, fill_theme if index % 3 != 0 else ring_theme, 0.24 + float(index % 3) * 0.03, index)

func _spawn_particle(source: Vector2, target: Vector2, theme_name: String, duration: float, index: int) -> void:
	var particle := Panel.new()
	var particle_size := 8.0 + float(index % 3) * 2.0
	particle.size = Vector2(particle_size, particle_size)
	particle.position = source - (particle.size / 2.0)
	particle.pivot_offset = particle.size / 2.0
	particle.mouse_filter = Control.MOUSE_FILTER_IGNORE
	particle.scale = Vector2(0.72, 0.72)
	_apply_panel_theme(particle, theme_name)
	add_child(particle)

	var arc_lift := Vector2(0, -10.0 - float(index % 4) * 4.0)
	var tween := particle.create_tween()
	tween.set_parallel(true)
	tween.tween_property(particle, "position", target - (particle.size / 2.0) + arc_lift, duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(particle, "scale", Vector2(0.18, 0.18), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.tween_property(particle, "modulate", Color(1, 1, 1, 0), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(particle.queue_free)

func _play_battle_event_feedback(event: Dictionary) -> void:
	if event.is_empty():
		return

	var event_type := str(event.get("type", ""))
	var event_cause := str(event.get("cause", ""))
	var source_id := str(event.get("sourcePlayerId", ""))
	var damage := int(event.get("damage", 0))
	var regen := int(event.get("regen", 0))

	if event_type == "self-hit" or event_cause == "self-hit":
		_play_hp_hit(_hp_bar_for_player(source_id), damage)
		if source_id == BATTLE_PLAYER_ID:
			_play_target_fault()
		var released_damage := int(event.get("releasedDamage", 0))
		var released_target_id := str(event.get("targetPlayerId", ""))
		if released_damage > 0 and released_target_id != "":
			_spawn_attack_particles(
				_battle_source_anchor(source_id),
				_battle_hp_anchor(released_target_id),
				_particle_fill_theme_for_player(source_id),
				_particle_ring_theme_for_player(source_id)
			)
			_play_hp_hit(_hp_bar_for_player(released_target_id), released_damage)
		return

	var target_id := str(event.get("targetPlayerId", event.get("loserPlayerId", "")))
	if damage > 0 and target_id != "":
		_spawn_attack_particles(
			_battle_source_anchor(source_id),
			_battle_hp_anchor(target_id),
			_particle_fill_theme_for_player(source_id),
			_particle_ring_theme_for_player(source_id)
		)
		_play_hp_hit(_hp_bar_for_player(target_id), damage)
		_play_target_impact()

	if regen > 0:
		_play_hp_regen(_hp_bar_for_player(source_id), regen)

func _hp_bar_for_player(player_id: String) -> ProgressBar:
	return enemy_hp_bar if player_id == BATTLE_BOT_ID else player_hp_bar

func _battle_hp_anchor(player_id: String) -> Vector2:
	var bar := _hp_bar_for_player(player_id)
	if not is_instance_valid(bar):
		return _target_center()
	return bar.global_position + (bar.size / 2.0)

func _battle_source_anchor(player_id: String) -> Vector2:
	var viewport_size := get_viewport_rect().size
	if player_id == BATTLE_BOT_ID:
		return Vector2(viewport_size.x / 2.0, 174.0)
	return _target_center()

func _particle_fill_theme_for_player(player_id: String) -> String:
	return THEME_PANEL_PARTICLE_SECONDARY if player_id == BATTLE_BOT_ID else THEME_PANEL_PARTICLE_PRIMARY

func _particle_ring_theme_for_player(player_id: String) -> String:
	return THEME_PANEL_PARTICLE_RING_SECONDARY if player_id == BATTLE_BOT_ID else THEME_PANEL_PARTICLE_RING_PRIMARY

func _make_control_tween(control: Control, channel: String) -> Tween:
	var key := "%s:%s" % [control.get_instance_id(), channel]
	var previous = active_control_tweens.get(key)
	if previous is Tween and previous.is_valid():
		previous.kill()

	var tween := control.create_tween()
	active_control_tweens[key] = tween
	tween.finished.connect(_forget_control_tween.bind(key, tween), CONNECT_ONE_SHOT)
	return tween

func _forget_control_tween(key: String, tween: Tween) -> void:
	if active_control_tweens.get(key) == tween:
		active_control_tweens.erase(key)

func _clear_control_tweens() -> void:
	for tween in active_control_tweens.values():
		if tween is Tween and tween.is_valid():
			tween.kill()

	active_control_tweens.clear()

func _play_queue_limit_feedback() -> void:
	if is_instance_valid(queue_label):
		_shake_control(queue_label, 8.0)
		_flash_control(queue_label, COLOR_DANGER, 0.24)
		return

	if is_instance_valid(target_blob_panel):
		_play_target_fault()

func _wire_button_feedback(button: Button, sound_kind: String) -> void:
	button.button_down.connect(_press_button_feedback.bind(button, sound_kind))
	button.button_up.connect(_release_button_feedback.bind(button))
	button.mouse_exited.connect(_release_button_feedback.bind(button))

func _press_button_feedback(button: Button, sound_kind: String) -> void:
	if not is_instance_valid(button) or button.disabled:
		return

	button.pivot_offset = button.size / 2.0
	_play_sfx(sound_kind)
	var tween := _make_control_tween(button, "press")
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(button, "scale", Vector2(0.96, 0.96), FEEDBACK_TWEEN_SECONDS)

func _release_button_feedback(button: Button) -> void:
	if not is_instance_valid(button):
		return

	button.pivot_offset = button.size / 2.0
	var tween := _make_control_tween(button, "press")
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(button, "scale", Vector2.ONE, FEEDBACK_TWEEN_SECONDS)

func _ensure_audio_buses() -> void:
	if AudioServer.get_bus_index(SFX_BUS_NAME) != -1:
		return

	var bus_index := AudioServer.bus_count
	AudioServer.add_bus(bus_index)
	AudioServer.set_bus_name(bus_index, SFX_BUS_NAME)
	AudioServer.set_bus_send(bus_index, "Master")
	AudioServer.set_bus_volume_db(bus_index, -2.0)

func _build_sfx_pool() -> void:
	if is_instance_valid(sfx_pool_root):
		return

	sfx_pool_root = Node.new()
	sfx_pool_root.name = "SfxPool"
	add_child(sfx_pool_root)
	sfx_players.clear()

	for index in range(SFX_POOL_SIZE):
		var player := AudioStreamPlayer.new()
		player.bus = SFX_BUS_NAME if AudioServer.get_bus_index(SFX_BUS_NAME) != -1 else "Master"
		player.volume_db = -9.0
		sfx_pool_root.add_child(player)
		sfx_players.append(player)

func _next_sfx_player() -> AudioStreamPlayer:
	if sfx_players.is_empty():
		_build_sfx_pool()

	var player := sfx_players[sfx_pool_index]
	sfx_pool_index = (sfx_pool_index + 1) % max(1, sfx_players.size())

	if player.playing:
		player.stop()

	return player

func _play_sfx(kind: String) -> void:
	_play_haptic(kind)
	var tones: Array = [[160.0, 0.04, 0.12]]

	match kind:
		"prime":
			tones = [[261.63, 0.035, 0.12], [392.0, 0.035, 0.10]]
		"backspace":
			tones = [[196.0, 0.035, 0.11], [146.83, 0.035, 0.08]]
		"submit":
			tones = [[196.0, 0.035, 0.11], [392.0, 0.04, 0.10], [783.99, 0.035, 0.07]]
		"start":
			tones = [[246.94, 0.04, 0.11], [329.63, 0.04, 0.10], [493.88, 0.045, 0.08]]
		"success":
			tones = [[392.0, 0.045, 0.11], [523.25, 0.05, 0.10], [783.99, 0.06, 0.08]]
		"fail":
			tones = [[146.83, 0.09, 0.15], [98.0, 0.07, 0.10]]
		"back":
			tones = [[220.0, 0.035, 0.10], [164.81, 0.035, 0.08]]

	var player := _next_sfx_player()
	var stream := AudioStreamGenerator.new()
	stream.mix_rate = SFX_SAMPLE_RATE
	stream.buffer_length = 0.35
	player.stream = stream
	player.play()

	var playback := player.get_stream_playback()
	if playback == null:
		return

	for tone in tones:
		var frequency := float(tone[0])
		var seconds := float(tone[1])
		var volume := float(tone[2])
		_push_synth_tone(playback, frequency, seconds, volume)
		_push_synth_tone(playback, 0.0, 0.006, 0.0)

func _play_haptic(kind: String) -> void:
	var duration := HAPTIC_TAP_MS
	match kind:
		"success":
			duration = HAPTIC_SUCCESS_MS
		"fail":
			duration = HAPTIC_FAIL_MS
		"submit", "start":
			duration = HAPTIC_SUCCESS_MS

	Input.vibrate_handheld(duration)

func _push_synth_tone(
	playback: AudioStreamGeneratorPlayback,
	frequency: float,
	seconds: float,
	volume: float
) -> void:
	var frame_count := int(SFX_SAMPLE_RATE * seconds)
	for index in range(frame_count):
		var sample := 0.0
		if frequency > 0.0:
			var time := float(index) / float(SFX_SAMPLE_RATE)
			var attack: float = min(1.0, float(index) / max(1.0, float(frame_count) * 0.18))
			var release: float = min(1.0, float(frame_count - index) / max(1.0, float(frame_count) * 0.32))
			var envelope: float = min(attack, release)
			var primary := sin(TAU * frequency * time)
			var overtone := sin(TAU * frequency * 2.0 * time) * 0.22
			sample = (primary + overtone) * volume * envelope
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

	var image := _load_icon_image(kind, size)
	_tint_icon_image(image, color)
	var texture := ImageTexture.create_from_image(image)
	icon_texture_cache[cache_key] = texture
	return texture

func _load_icon_image(kind: String, size: int) -> Image:
	var image := Image.create(size, size, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)

	var path := str(ICON_PATHS.get(kind, ""))
	if path.is_empty():
		return image

	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return image

	var scale: float = max(1.0, float(size) / 24.0)
	if image.load_svg_from_buffer(file.get_buffer(file.get_length()), scale) != OK:
		image.fill(Color.TRANSPARENT)
		return image

	if image.get_width() != size or image.get_height() != size:
		image.resize(size, size, Image.INTERPOLATE_NEAREST)
	return image

func _tint_icon_image(image: Image, color: Color) -> void:
	for y in range(image.get_height()):
		for x in range(image.get_width()):
			var pixel := image.get_pixel(x, y)
			if pixel.a <= 0.0:
				continue
			image.set_pixel(x, y, Color(color.r, color.g, color.b, color.a * pixel.a))

func _make_button_style(
	color: Color,
	content_margin: int = 16,
	radius: int = RADIUS_BUTTON,
	border_color: Color = COLOR_BORDER_CONTRAST,
	border_width: int = PIXEL_BORDER
) -> StyleBox:
	if radius == RADIUS_PILL:
		return _make_pixel_circle_style(color, border_color, border_width, content_margin)

	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = false
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_right = radius
	style.corner_radius_bottom_left = radius
	style.border_color = border_color
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	style.content_margin_left = content_margin
	style.content_margin_right = content_margin
	style.content_margin_top = max(0, content_margin / 2)
	style.content_margin_bottom = max(0, content_margin / 2)
	return style

func _make_bar_style(color: Color, radius: int) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = false
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_right = radius
	style.corner_radius_bottom_left = radius
	return style

func _make_dialog_panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = COLOR_SURFACE
	style.anti_aliasing = false
	style.border_color = COLOR_PRIMARY
	style.border_width_left = PIXEL_BORDER
	style.border_width_top = PIXEL_BORDER
	style.border_width_right = PIXEL_BORDER
	style.border_width_bottom = PIXEL_BORDER
	style.corner_radius_top_left = RADIUS_PANEL
	style.corner_radius_top_right = RADIUS_PANEL
	style.corner_radius_bottom_right = RADIUS_PANEL
	style.corner_radius_bottom_left = RADIUS_PANEL
	return style

func _make_transparent_button_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color.TRANSPARENT
	return style

func _make_circle_style(color: Color, radius: float, border_color: Color, border_width: int) -> StyleBox:
	return _make_pixel_circle_style(color, border_color, border_width)

func _make_pixel_box_style(
	color: Color,
	border_color: Color,
	border_width: int,
	radius: int = RADIUS_BUTTON,
	with_shadow: bool = false
) -> StyleBox:
	if radius == RADIUS_PILL:
		return _make_pixel_circle_style(color, border_color, border_width)

	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = false
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_right = radius
	style.corner_radius_bottom_left = radius
	style.border_color = border_color
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	if with_shadow:
		style.shadow_color = COLOR_BLOB_SHADOW
		style.shadow_size = 12
		style.shadow_offset = Vector2(0, 8)
	return style

func _make_outline_circle_style(radius: float, border_color: Color, border_width: int) -> StyleBox:
	return _make_pixel_circle_style(Color.TRANSPARENT, border_color, border_width)

func _make_pixel_circle_style(
	color: Color,
	border_color: Color,
	border_width: int,
	content_margin: int = 0
) -> StyleBoxTexture:
	var style := StyleBoxTexture.new()
	style.texture = _get_pixel_circle_texture(color, border_color, border_width)
	style.texture_margin_left = 8
	style.texture_margin_top = 8
	style.texture_margin_right = 8
	style.texture_margin_bottom = 8
	style.content_margin_left = content_margin
	style.content_margin_right = content_margin
	style.content_margin_top = max(0, content_margin / 2)
	style.content_margin_bottom = max(0, content_margin / 2)
	style.draw_center = true
	return style

func _get_pixel_circle_texture(color: Color, border_color: Color, border_width: int) -> Texture2D:
	var cache_key := "%s:%s:%d" % [color.to_html(true), border_color.to_html(true), border_width]
	if pixel_circle_texture_cache.has(cache_key):
		return pixel_circle_texture_cache[cache_key]

	var image := Image.create(16, 16, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	var center := Vector2(7.5, 7.5)
	var radius := 7.5
	var border_pixels := 0.0
	if border_width > 0 and border_color.a > 0.0:
		border_pixels = 1.5

	for y in range(16):
		for x in range(16):
			var distance := Vector2(float(x), float(y)).distance_to(center)
			if distance > radius:
				continue
			if border_pixels > 0.0 and distance >= radius - border_pixels:
				image.set_pixel(x, y, border_color)
			else:
				image.set_pixel(x, y, color)

	var texture := ImageTexture.create_from_image(image)
	pixel_circle_texture_cache[cache_key] = texture
	return texture

func _make_panel_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = false
	style.corner_radius_top_left = RADIUS_PANEL
	style.corner_radius_top_right = RADIUS_PANEL
	style.corner_radius_bottom_right = RADIUS_PANEL
	style.corner_radius_bottom_left = RADIUS_PANEL
	style.border_color = COLOR_BORDER_SOFT
	style.border_width_left = PIXEL_BORDER
	style.border_width_top = PIXEL_BORDER
	style.border_width_right = PIXEL_BORDER
	style.border_width_bottom = PIXEL_BORDER
	style.shadow_color = COLOR_BLOB_SHADOW
	style.shadow_size = 12
	style.shadow_offset = Vector2(0, 8)
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
