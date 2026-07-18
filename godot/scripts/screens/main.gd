extends Control

const Game := preload("res://scripts/core/game.gd")
const BattleRoom := preload("res://scripts/core/multiplayer_room.gd")
const RealtimeAuthority := preload("res://scripts/core/realtime_authority.gd")
const SaveManager := preload("res://scripts/core/save_manager.gd")
const SupabaseClient := preload("res://scripts/core/supabase_client.gd")

const BATTLE_BOT_ID := "atom-bot"
const BATTLE_BOT_NAME := "AtomBot"
const BATTLE_BOT_MISTAKE_CHANCE := 0.14
const BATTLE_BOT_THINK_BASE_SECONDS := 0.42
const BATTLE_BOT_THINK_FACTOR_SECONDS := 0.14
const BATTLE_BOT_THINK_PENDING_DAMAGE_SECONDS := 0.012
const BATTLE_PLAYER_ID := "guest-player"
const BATTLE_GUEST_NAME := "Guest"
const TUTORIAL_CPU_HP := 136
const TUTORIAL_CPU_THINK_BASE_SECONDS := 1.4
const TUTORIAL_CPU_THINK_FACTOR_SECONDS := 0.2
const COMBO_QUEUE_MAX_ITEMS := 7
const SCREEN_ARG_PREFIX := "--atomize-screen="
const APP_VERSION_FALLBACK := "0.1.0"
const APP_VERSION_SETTING := "application/config/version"
const REDUCE_MOTION_SETTING := "accessibility/reduce_motion"
const SOLO_DURATION_SECONDS := 60.0
const SOLO_COMBO_STEP_DELAY_SECONDS := 0.14
const MULTIPLAYER_COMBO_STEP_DELAY_SECONDS := 0.22
const SOLO_SEED_PREFIX := "godot-mobile"
const SOLO_SCORE_REDESIGN_AT := "2026-04-07T10:48:36.000Z"
const HISTORIC_SOLO_SCORE_FACTOR := 0.5
const HISTORIC_SOLO_SCORE_CAP := 600
const BATTLE_WIN_EXPERIENCE := 150
const BATTLE_TIE_EXPERIENCE := 50
const BATTLE_LOSS_EXPERIENCE := 30
const DESKTOP_PRIME_KEYCODES := [KEY_R, KEY_T, KEY_Y, KEY_F, KEY_G, KEY_H, KEY_V, KEY_B, KEY_N]
const DESKTOP_DIGIT_KEYCODES := [KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_8, KEY_9]
const INPUT_ACTION_GAME_BACKSPACE := &"atom_game_backspace"
const INPUT_ACTION_GAME_SUBMIT := &"atom_game_submit"
const INPUT_ACTION_GAME_SPACE := &"atom_game_space"
const INPUT_ACTION_PRIME_PREFIX := "atom_prime_"
const INPUT_ACTION_DIGIT_PREFIX := "atom_digit_"
const REALTIME_LOBBY_TOPIC := "realtime:atomize:lobby"
const REALTIME_ROOM_TOPIC_PREFIX := "realtime:atomize:"
const REALTIME_HEARTBEAT_SECONDS := 25.0
const REALTIME_RECONNECT_SECONDS := 6.0
const REALTIME_EVENT_ROOM_INVITE := "room_invite"
const REALTIME_EVENT_INVITE_DECLINED := "invite_declined"
const REALTIME_EVENT_ROOM_STATE := "room_state"
const REALTIME_EVENT_JOIN_REQUEST := "join_request"
const REALTIME_EVENT_PLAYER_READY := "player_ready"
const REALTIME_EVENT_PRIME_SELECTED := "prime_selected"
const REALTIME_EVENT_COMBO_PENALTY := "combo_penalty"
const REALTIME_EVENT_CLEAR_SOLVED_STAGE := "clear_solved_stage"
const REALTIME_EVENT_ROOM_ERROR := "room_error"
const COLOR_PRIMARY := Color("#184e77")
const COLOR_PRIMARY_STRONG := Color("#168aad")
const COLOR_SECONDARY := Color("#34a0a4")
const COLOR_INK := Color("#223247")
const COLOR_PAGE_BG := Color("#f4f7fb")
const COLOR_SURFACE := Color("#ffffff")
const COLOR_INK_SOFT := Color(0.063, 0.106, 0.180, 0.72)
const COLOR_INK_SOFT_HINT := Color(0.063, 0.106, 0.180, 0.50)
const COLOR_KEYPAD_BUTTON_BG := Color(0.094, 0.306, 0.467, 0.12)
const COLOR_KEYPAD_BUTTON_ACTIVE_BG := Color(0.063, 0.106, 0.180, 0.14)
const COLOR_KEYPAD_BUTTON_TEXT := Color(0.063, 0.106, 0.180, 0.70)
const COLOR_TEXT_INVERSE := Color("#ffffff")
const COLOR_TEXT_INVERSE_SUBTLE := Color(1.0, 1.0, 1.0, 0.85)
const COLOR_TEXT_INVERSE_SOFT := Color(1.0, 1.0, 1.0, 0.64)
const COLOR_BORDER_SOFT := Color(0.094, 0.306, 0.467, 0.20)
const COLOR_BORDER_CONTRAST := Color(1.0, 1.0, 1.0, 0.26)
const COLOR_BORDER_INVERSE_SOFT := Color(1.0, 1.0, 1.0, 0.28)
const COLOR_OUTLINE_STRONG := Color(0.094, 0.306, 0.467, 0.44)
const COLOR_BUTTON_DISABLED := Color(0.094, 0.306, 0.467, 0.12)
const COLOR_DANGER := Color("#c43a3a")
const COLOR_GOLD := Color("#d4a017")
const COLOR_GOLD_STRONG := Color("#e8b825")
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
const DAMAGE_POP_SECONDS := 0.78
const SOLO_SCORE_POP_SECONDS := 0.9
const TIMER_PENALTY_POP_SECONDS := 0.7
const BATTLE_HP_ZERO_HOLD_SECONDS := 0.9
const BATTLE_ATTACK_FLIGHT_END := 0.82
const BATTLE_ATTACK_IMPACT_START := 0.78
const BATTLE_ATTACK_TRAIL_STEP := 0.06
const BATTLE_ATTACK_LAUNCH_FLARE_SECONDS := 0.18
const BATTLE_ATTACK_IMPACT_FLASH_SECONDS := 0.28
const BATTLE_HEAL_STREAM_SECONDS := 0.66
const BATTLE_HEAL_STREAM_STEP := 0.055
const BATTLE_HEAL_PULSE_SECONDS := 0.52
const BATTLE_FAULT_RICOCHET_SECONDS := 0.34
const BATTLE_PERFECT_HALO_SECONDS := 0.78
const SFX_BUS_NAME := "SFX"
const SFX_POOL_SIZE := 8
const SFX_SAMPLE_RATE := 22050
const HOME_BLOB_SIZE := 144.0
const HOME_BLOB_GAP := 16.0
const HOME_MENU_BUTTON_SIZE := 48.0
const SAFE_AREA_EDGE_PADDING := 12.0
const SAFE_AREA_PAGE_PADDING := 24.0
const SOLO_TARGET_SIZE := 272.0
const SOLO_KEY_SIZE := 84.0
const SOLO_KEY_GAP := 8.0
const QUEUE_CHIP_SIZE := 26.0
const QUEUE_CHIP_GAP := 2.0
const QUEUE_SEPARATOR_WIDTH := 10.0
const SOLO_CONTROL_BOTTOM_MARGIN := 64.0
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
const THEME_PANEL_PAGE_HEADER := "AtomPanelPageHeader"
const THEME_PANEL_LOGO_DOT := "AtomPanelLogoDot"
const THEME_PANEL_SURFACE := "AtomPanelSurface"
const THEME_PANEL_CONTAINER_SURFACE := "AtomPanelContainerSurface"
const THEME_PANEL_DIALOG := "AtomPanelDialog"
const THEME_PANEL_DIALOG_DEFEAT := "AtomPanelDialogDefeat"
const THEME_PANEL_DIALOG_VICTORY := "AtomPanelDialogVictory"
const THEME_PANEL_TARGET := "AtomPanelTarget"
const THEME_PANEL_TARGET_DANGER := "AtomPanelTargetDanger"
const THEME_PANEL_TARGET_GOLD := "AtomPanelTargetGold"
const THEME_PANEL_TUTORIAL := "AtomPanelTutorial"
const THEME_PANEL_AVATAR_PRIMARY := "AtomPanelAvatarPrimary"
const THEME_PANEL_AVATAR_SECONDARY := "AtomPanelAvatarSecondary"
const THEME_PANEL_BADGE_GOLD := "AtomPanelBadgeGold"
const THEME_PANEL_BADGE_SURFACE := "AtomPanelBadgeSurface"
const THEME_PANEL_READY_BADGE := "AtomPanelReadyBadge"
const THEME_PANEL_PARTICLE_PRIMARY := "AtomPanelParticlePrimary"
const THEME_PANEL_PARTICLE_SECONDARY := "AtomPanelParticleSecondary"
const THEME_PANEL_PARTICLE_DANGER := "AtomPanelParticleDanger"
const THEME_PANEL_PARTICLE_GOLD := "AtomPanelParticleGold"
const THEME_PANEL_PARTICLE_GOLD_STRONG := "AtomPanelParticleGoldStrong"
const THEME_PANEL_PARTICLE_RING_PRIMARY := "AtomPanelParticleRingPrimary"
const THEME_PANEL_PARTICLE_RING_SECONDARY := "AtomPanelParticleRingSecondary"
const THEME_PANEL_PARTICLE_RING_DANGER := "AtomPanelParticleRingDanger"
const THEME_PANEL_PARTICLE_RING_GOLD := "AtomPanelParticleRingGold"
const THEME_PANEL_HEAL_GLOW := "AtomPanelHealGlow"
const THEME_PANEL_FAULT_SHARD := "AtomPanelFaultShard"
const THEME_PANEL_FAULT_GLOW := "AtomPanelFaultGlow"
const THEME_PANEL_ATTACK_BALL_PRIMARY := "AtomPanelAttackBallPrimary"
const THEME_PANEL_ATTACK_BALL_SECONDARY := "AtomPanelAttackBallSecondary"
const THEME_PANEL_ATTACK_GLOW_PRIMARY := "AtomPanelAttackGlowPrimary"
const THEME_PANEL_ATTACK_GLOW_SECONDARY := "AtomPanelAttackGlowSecondary"
const THEME_PANEL_ATTACK_STREAK_PRIMARY := "AtomPanelAttackStreakPrimary"
const THEME_PANEL_ATTACK_STREAK_SECONDARY := "AtomPanelAttackStreakSecondary"
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
	"chevron_up": "res://assets/icons/chevron-up.svg",
	"cpu": "res://assets/icons/cpu.svg",
	"delete": "res://assets/icons/delete.svg",
	"guest": "res://assets/icons/guest.svg",
	"help": "res://assets/icons/help.svg",
	"menu": "res://assets/icons/menu.svg",
	"pause": "res://assets/icons/pause.svg",
	"play": "res://assets/icons/play.svg",
	"submit": "res://assets/icons/submit.svg",
	"timer": "res://assets/icons/timer.svg",
	"trophy": "res://assets/icons/trophy.svg",
	"users": "res://assets/icons/users.svg",
}
const VICTORY_CONFETTI := [
	{"angle": -30.0, "distance": 16.0, "size": 0.70, "delay": 0.12},
	{"angle": 25.0, "distance": 18.0, "size": 0.55, "delay": 0.18},
	{"angle": 72.0, "distance": 15.0, "size": 0.65, "delay": 0.10},
	{"angle": -80.0, "distance": 17.0, "size": 0.60, "delay": 0.22},
	{"angle": 120.0, "distance": 14.5, "size": 0.68, "delay": 0.15},
	{"angle": -125.0, "distance": 16.5, "size": 0.58, "delay": 0.20},
	{"angle": 160.0, "distance": 13.5, "size": 0.72, "delay": 0.13},
	{"angle": -165.0, "distance": 19.0, "size": 0.50, "delay": 0.25},
]

enum Screen {
	HOME,
	LEADERBOARD,
	SOLO_PREGAME,
	BATTLE_PICKER,
	BATTLE_READY,
	BATTLE_GAME,
	SOLO,
	PAUSED,
	GAME_OVER,
}

enum TutorialStep {
	INTRO,
	STAGE_ONE_PRIME,
	STAGE_ONE_QUEUE,
	STAGE_ONE_SUBMIT,
	STAGE_ONE_RESULT,
	STAGE_TWO_PRIME,
	STAGE_TWO_QUEUE,
	STAGE_TWO_RESULT,
	STAGE_TWO_FINISH,
	STAGE_TWO_FINISH_SUBMIT,
	PERFECT_SOLVE_EXPLAIN,
	PERFECT_SOLVE_QUEUE,
	PERFECT_SOLVE_SUBMIT,
	PERFECT_SOLVE_RESULT,
	ENEMY_TURN,
	ENEMY_ATTACK,
	TRY_WRONG_PRIME,
	WRONG_PRIME_RESULT,
	OVERFLOW_EXPLAIN,
	OVERFLOW_QUEUE,
	OVERFLOW_SUBMIT,
	OVERFLOW_RESULT,
	OVERFLOW_CLEAR,
	SUMMARY,
	DONE,
}

const TUTORIAL_PLAYER_FACTORS := [
	[2, 3],
	[2, 3, 13],
	[2, 7],
	[3, 7],
	[2, 2, 5],
	[11, 13],
]
const TUTORIAL_CPU_FACTORS := [
	[2, 5],
	[3, 3],
	[2, 2, 3],
	[5, 5],
]
const TUTORIAL_LESSONS := {
	TutorialStep.INTRO: {
		"action": "Start",
		"blocking": true,
		"body": "This is your compound. Factor and atomize it to deal damage to the enemy.",
		"position": "bottom",
		"title": "Tutorial - Factor to survive",
	},
	TutorialStep.STAGE_ONE_PRIME: {
		"blocking": false,
		"body": "Your compound is 6 = 2 x 3. Tap 2 to start queuing factors.",
		"position": "top",
		"title": "Pick a prime factor",
	},
	TutorialStep.STAGE_ONE_QUEUE: {
		"blocking": false,
		"body": "Now tap 3 to complete the factorization.",
		"position": "top",
		"title": "Queue the next factor",
	},
	TutorialStep.STAGE_ONE_SUBMIT: {
		"blocking": false,
		"body": "Hit send to attack with your queued factors.",
		"position": "top",
		"title": "Send the queue",
	},
	TutorialStep.STAGE_ONE_RESULT: {
		"action": "Next compound",
		"blocking": true,
		"body": "Compound cleared. Each factor you queue deals damage, and clearing finishes the attack.",
		"position": "bottom",
		"title": "Atomized!",
	},
	TutorialStep.STAGE_TWO_PRIME: {
		"blocking": false,
		"body": "This compound is 78. You can spot 2 and 3 as factors - start with 2.",
		"position": "top",
		"title": "Trickier compound",
	},
	TutorialStep.STAGE_TWO_QUEUE: {
		"blocking": false,
		"body": "Add 3 and send. Not sure what's left after 6? Fire off what you know.",
		"position": "top",
		"title": "Partial factoring",
	},
	TutorialStep.STAGE_TWO_RESULT: {
		"action": "Finish it",
		"blocking": true,
		"body": "The blob dropped from 78 to 13. Damage dealt while you figure out the rest.",
		"position": "bottom",
		"title": "Partial clear",
	},
	TutorialStep.STAGE_TWO_FINISH: {
		"blocking": false,
		"body": "13 is prime - tap 13 to finish it off.",
		"position": "top",
		"title": "Finish the compound",
	},
	TutorialStep.STAGE_TWO_FINISH_SUBMIT: {
		"blocking": false,
		"body": "Send the last factor to finish this compound.",
		"position": "top",
		"title": "Finish it off",
	},
	TutorialStep.PERFECT_SOLVE_EXPLAIN: {
		"action": "Try it",
		"blocking": true,
		"body": "Queue ALL factors in one send for a perfect clear. Perfect clears heal HP! Try it on this blob.",
		"position": "bottom",
		"title": "Perfect clear",
	},
	TutorialStep.PERFECT_SOLVE_QUEUE: {
		"blocking": false,
		"body": "This compound is 14 = 2 × 7. Queue both factors at once.",
		"position": "top",
		"title": "Queue all factors",
	},
	TutorialStep.PERFECT_SOLVE_SUBMIT: {
		"blocking": false,
		"body": "Send the perfect combo!",
		"position": "top",
		"title": "Send it",
	},
	TutorialStep.PERFECT_SOLVE_RESULT: {
		"action": "Next",
		"blocking": true,
		"body": "Your HP went up! Perfect clears heal and deal bonus combo damage — the more factors, the bigger the bonus.",
		"position": "bottom",
		"title": "Healed!",
	},
	TutorialStep.ENEMY_TURN: {
		"action": "Show attack",
		"blocking": true,
		"body": "Enemy clears cost you HP. Watch your HP bar.",
		"position": "bottom",
		"title": "Enemy turn",
	},
	TutorialStep.ENEMY_ATTACK: {
		"action": "Next",
		"blocking": true,
		"body": "You lost HP! But there is a way to recover...",
		"position": "bottom",
		"title": "Ouch!",
	},
	TutorialStep.TRY_WRONG_PRIME: {
		"blocking": false,
		"body": "Tap 2 and submit. It does not divide the current compound.",
		"position": "top",
		"title": "Try a wrong factor",
	},
	TutorialStep.WRONG_PRIME_RESULT: {
		"action": "Next",
		"blocking": true,
		"body": "Wrong factors deal damage to yourself and break combos. Avoid mistakes to stay alive.",
		"position": "bottom",
		"title": "Wrong factors backfire",
	},
	TutorialStep.OVERFLOW_EXPLAIN: {
		"action": "Try it",
		"blocking": true,
		"body": "What if you queue more factors than needed? Let’s find out.",
		"position": "bottom",
		"title": "Over-queuing",
	},
	TutorialStep.OVERFLOW_QUEUE: {
		"blocking": false,
		"body": "Queue 3, 7, then 2. The blob only needs 3 × 7, so 2 is extra.",
		"position": "top",
		"title": "Queue too many",
	},
	TutorialStep.OVERFLOW_SUBMIT: {
		"blocking": false,
		"body": "Now submit and watch what happens.",
		"position": "top",
		"title": "Send it",
	},
	TutorialStep.OVERFLOW_RESULT: {
		"action": "Next",
		"blocking": true,
		"body": "The blob cleared to 1, but the extra 2 backfired as self-damage. Only queue what you need!",
		"position": "bottom",
		"title": "Overflow penalty",
	},
	TutorialStep.OVERFLOW_CLEAR: {
		"blocking": false,
		"body": "Hit Enter to break the 1 and move on.",
		"position": "top",
		"title": "Clear the 1",
	},
	TutorialStep.SUMMARY: {
		"action": "Keep playing",
		"blocking": true,
		"body": "Queue primes, clear compounds for combo damage, and avoid wrong factors. Finish the match!",
		"position": "bottom",
		"title": "You are ready",
	},
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
var keyboard_buffered_prime_input := ""
var best_score := 0
var best_combo := 0
var player_experience := 0
var did_set_new_best := false
var home_menu_open := false
var needs_tutorial := false
var battle_player_name := ""
var tutorial_active := false
var tutorial_step := TutorialStep.DONE
var tutorial_enemy_attack_seen := false
var tutorial_enemy_turn_acknowledged := false
var tutorial_self_penalty_seen := false
var tutorial_overflow_penalty_seen := false
var tutorial_cpu_attack_allowed := false
var tutorial_tracked_event_id := -1
var battle_snapshot: Dictionary
var battle_prime_queue: Array[int] = []
var battle_resolving_queue: Array[int] = []
var battle_resolving_player_id := ""
var battle_submitted_queue_length := 0
var battle_resolve_elapsed := 0.0
var battle_perfect_solve_eligible := false
var battle_bot_elapsed := 0.0
var battle_result_text := ""
var battle_display_player_hp := -1
var battle_display_bot_hp := -1
var battle_display_event_id := -1
var battle_result_reveal_event_id := -1
var leaderboard_entries: Array[Dictionary] = []
var leaderboard_status_text := ""
var save_manager: SaveManager
var supabase_client: SupabaseClient
var realtime_socket := WebSocketPeer.new()
var realtime_player_id := ""
var realtime_ref_counter := 0
var realtime_join_ref := ""
var realtime_has_opened := false
var realtime_joined := false
var realtime_should_reconnect := false
var realtime_heartbeat_elapsed := 0.0
var realtime_reconnect_elapsed := 0.0
var realtime_status_text := ""
var realtime_presence_state: Dictionary = {}
var realtime_online_players: Array[Dictionary] = []
var realtime_invited_player_ids: Dictionary = {}
var realtime_pending_invitation: Dictionary = {}
var realtime_room_id := ""
var realtime_room_topic := ""
var realtime_room_join_ref := ""
var realtime_room_joined := false
var realtime_room_is_host := false
var realtime_room_player_id := ""
var realtime_room_status_text := ""
var realtime_room_action_order := 0
var realtime_room_state_version := 0
var realtime_room_authority_player_id := ""
var realtime_remote_action_orders: Dictionary = {}
var realtime_pending_invite_target_id := ""
var icon_texture_cache: Dictionary = {}
var pixel_circle_texture_cache: Dictionary = {}
var active_control_tweens: Dictionary = {}
var app_background_throttled := false
var foreground_max_fps := 0
var master_bus_was_muted := false
var sfx_pool_root: Node
var sfx_players: Array[AudioStreamPlayer] = []
var sfx_pool_index := 0
var network_root: Node
var leaderboard_request: HTTPRequest

var root_margin: MarginContainer
var content: VBoxContainer
var stage_label: Label
var score_label: Label
var score_unit_label: Label
var target_label: Label
var enemy_target_label: Label
var queue_label: HBoxContainer
var result_label: Label
var leaderboard_rows_root: VBoxContainer
var leaderboard_status_label: Label
var leaderboard_empty_button: Button
var battle_online_scroll: ScrollContainer
var battle_online_rows_root: VBoxContainer
var battle_online_status_label: Label
var battle_online_hint_label: Label
var prime_grid: GridContainer
var submit_button: Button
var backspace_button: Button
var target_blob_panel: Panel
var enemy_avatar_panel: Panel
var timer_bar: ProgressBar
var enemy_hp_bar: ProgressBar
var enemy_hp_label: Label
var player_hp_bar: ProgressBar
var player_hp_label: Label
var player_name_input: LineEdit

func _ready() -> void:
	get_tree().set_quit_on_go_back(false)
	_ensure_gameplay_input_actions()
	_ensure_audio_buses()
	_build_sfx_pool()
	save_manager = SaveManager.new()
	supabase_client = SupabaseClient.new()
	realtime_player_id = "godot-%s" % Time.get_ticks_usec()
	battle_player_name = save_manager.load_player_name(_create_guest_display_name())
	_build_network_nodes()
	theme = _make_app_theme()
	best_score = _load_best_score()
	best_combo = _load_best_combo()
	player_experience = _load_experience()
	needs_tutorial = not _is_tutorial_complete()
	match _get_requested_screen():
		"home-first-run":
			needs_tutorial = true
			_start_home()
		"home-menu":
			needs_tutorial = false
			_start_home()
			home_menu_open = true
			_build_home_layout()
		"help":
			_start_help()
		"tutorial":
			_start_tutorial_game()
		"leaderboard":
			_start_leaderboard()
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

func _create_guest_display_name() -> String:
	var guest_number := (Time.get_ticks_usec() % 999) + 1
	return "%s%s" % [BATTLE_GUEST_NAME, guest_number]

func _ensure_gameplay_input_actions() -> void:
	_ensure_key_action(INPUT_ACTION_GAME_BACKSPACE, [KEY_BACKSPACE, KEY_U])
	_ensure_key_action(INPUT_ACTION_GAME_SUBMIT, [KEY_ENTER, KEY_KP_ENTER, KEY_J])
	_ensure_key_action(INPUT_ACTION_GAME_SPACE, [KEY_SPACE])

	for index in range(DESKTOP_PRIME_KEYCODES.size()):
		_ensure_key_action(_prime_action_name(index), [int(DESKTOP_PRIME_KEYCODES[index])])

	for index in range(DESKTOP_DIGIT_KEYCODES.size()):
		_ensure_key_action(_digit_action_name(index + 1), [int(DESKTOP_DIGIT_KEYCODES[index])])

func _ensure_key_action(action_name: StringName, keycodes: Array) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)

	for keycode in keycodes:
		if _action_has_key(action_name, int(keycode)):
			continue

		var key_event := InputEventKey.new()
		key_event.keycode = int(keycode)
		key_event.physical_keycode = int(keycode)
		InputMap.action_add_event(action_name, key_event)

func _action_has_key(action_name: StringName, keycode: int) -> bool:
	for event in InputMap.action_get_events(action_name):
		var key_event := event as InputEventKey
		if key_event == null:
			continue

		if key_event.keycode == keycode or key_event.physical_keycode == keycode:
			return true

	return false

func _prime_action_name(index: int) -> StringName:
	return StringName("%s%d" % [INPUT_ACTION_PRIME_PREFIX, index])

func _digit_action_name(digit: int) -> StringName:
	return StringName("%s%d" % [INPUT_ACTION_DIGIT_PREFIX, digit])

func _build_network_nodes() -> void:
	network_root = Node.new()
	network_root.name = "Network"
	add_child(network_root)

	leaderboard_request = HTTPRequest.new()
	leaderboard_request.name = "LeaderboardRequest"
	leaderboard_request.request_completed.connect(_on_leaderboard_request_completed)
	network_root.add_child(leaderboard_request)

func _connect_realtime_lobby() -> void:
	supabase_client.reload()

	if not supabase_client.is_configured():
		realtime_status_text = "Supabase realtime not configured"
		realtime_should_reconnect = false
		_render_battle_online_players()
		return

	var state := realtime_socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN or state == WebSocketPeer.STATE_CONNECTING:
		realtime_should_reconnect = true
		_track_realtime_presence()
		_render_battle_online_players()
		return

	realtime_socket = WebSocketPeer.new()
	realtime_has_opened = false
	realtime_joined = false
	realtime_join_ref = ""
	realtime_heartbeat_elapsed = 0.0
	realtime_reconnect_elapsed = 0.0
	realtime_status_text = "Connecting realtime..."
	realtime_should_reconnect = true

	var error := realtime_socket.connect_to_url(supabase_client.realtime_websocket_url())
	if error != OK:
		realtime_status_text = "Realtime unavailable"
		realtime_should_reconnect = false

	_render_battle_online_players()

func _close_realtime_lobby() -> void:
	realtime_should_reconnect = false
	realtime_has_opened = false
	realtime_joined = false
	realtime_join_ref = ""
	realtime_heartbeat_elapsed = 0.0
	realtime_reconnect_elapsed = 0.0
	realtime_status_text = ""
	realtime_presence_state.clear()
	realtime_online_players.clear()
	realtime_invited_player_ids.clear()
	realtime_pending_invitation.clear()
	_reset_realtime_room_state(false)

	var state := realtime_socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN or state == WebSocketPeer.STATE_CONNECTING:
		realtime_socket.close()

func _poll_realtime_lobby(delta: float) -> void:
	var state := realtime_socket.get_ready_state()
	if state == WebSocketPeer.STATE_CONNECTING or state == WebSocketPeer.STATE_OPEN:
		realtime_socket.poll()
		state = realtime_socket.get_ready_state()

	if state == WebSocketPeer.STATE_OPEN:
		if not realtime_has_opened:
			realtime_has_opened = true
			realtime_status_text = "Joining realtime..."
			_send_realtime_join()
			_render_battle_online_players()

		if realtime_joined and not realtime_room_id.is_empty() and realtime_room_join_ref.is_empty():
			_send_realtime_room_join()

		realtime_heartbeat_elapsed += delta
		if realtime_heartbeat_elapsed >= REALTIME_HEARTBEAT_SECONDS:
			realtime_heartbeat_elapsed = 0.0
			_send_realtime_message("phoenix", "heartbeat", {}, _next_realtime_ref())

		while realtime_socket.get_available_packet_count() > 0:
			_handle_realtime_packet(realtime_socket.get_packet().get_string_from_utf8())

		return

	if not realtime_should_reconnect:
		return

	realtime_reconnect_elapsed += delta
	if realtime_reconnect_elapsed < REALTIME_RECONNECT_SECONDS:
		return

	realtime_reconnect_elapsed = 0.0
	_connect_realtime_lobby()

func _send_realtime_join() -> void:
	realtime_join_ref = _next_realtime_ref()
	_send_realtime_message(
		REALTIME_LOBBY_TOPIC,
		"phx_join",
		{
			"config": {
				"broadcast": {
					"ack": false,
					"self": false,
				},
				"presence": {
					"enabled": true,
					"key": realtime_player_id,
				},
				"postgres_changes": [],
				"private": false,
			},
			"access_token": supabase_client.anon_key,
		},
		realtime_join_ref,
		realtime_join_ref
	)

func _track_realtime_presence() -> void:
	if not realtime_joined or realtime_socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	_send_realtime_message(
		REALTIME_LOBBY_TOPIC,
		"presence",
		{
			"type": "presence",
			"event": "track",
			"payload": {
				"playerId": realtime_player_id,
				"name": battle_player_name,
				"status": _realtime_presence_status(),
				"platform": "godot",
				"updatedAt": Time.get_unix_time_from_system(),
			},
		},
		_next_realtime_ref(),
		realtime_join_ref
	)

func _send_realtime_message(
	topic: String,
	event_name: String,
	payload: Dictionary,
	ref: String = "",
	join_ref: String = ""
) -> void:
	if realtime_socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	var message := {
		"topic": topic,
		"event": event_name,
		"payload": payload,
		"ref": ref,
	}
	if not join_ref.is_empty():
		message["join_ref"] = join_ref

	realtime_socket.send_text(JSON.stringify(message))

func _send_realtime_broadcast(topic: String, event_name: String, payload: Dictionary, join_ref: String) -> void:
	_send_realtime_message(
		topic,
		"broadcast",
		{
			"type": "broadcast",
			"event": event_name,
			"payload": payload,
		},
		_next_realtime_ref(),
		join_ref
	)

func _send_realtime_room_broadcast(event_name: String, payload: Dictionary) -> void:
	if not realtime_room_joined:
		return

	_send_realtime_broadcast(realtime_room_topic, event_name, payload, realtime_room_join_ref)

func _send_realtime_lobby_broadcast(event_name: String, payload: Dictionary) -> void:
	if not realtime_joined:
		return

	_send_realtime_broadcast(REALTIME_LOBBY_TOPIC, event_name, payload, realtime_join_ref)

func _send_realtime_room_join() -> void:
	if realtime_room_id.is_empty() or realtime_socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	realtime_room_topic = _realtime_room_topic_for(realtime_room_id)
	realtime_room_join_ref = _next_realtime_ref()
	realtime_room_joined = false
	_send_realtime_message(
		realtime_room_topic,
		"phx_join",
		{
			"config": {
				"broadcast": {
					"ack": false,
					"self": false,
				},
				"presence": {
					"enabled": false,
				},
				"postgres_changes": [],
				"private": false,
			},
			"access_token": supabase_client.anon_key,
		},
		realtime_room_join_ref,
		realtime_room_join_ref
	)

func _realtime_room_topic_for(room_id: String) -> String:
	return "%s%s" % [REALTIME_ROOM_TOPIC_PREFIX, room_id]

func _broadcast_realtime_room_state() -> void:
	if battle_snapshot.is_empty() or not realtime_room_is_host:
		return

	realtime_room_state_version += 1
	realtime_room_authority_player_id = RealtimeAuthority.host_player_id(battle_snapshot)
	if realtime_room_authority_player_id.is_empty():
		realtime_room_authority_player_id = realtime_room_player_id

	_send_realtime_room_broadcast(
		REALTIME_EVENT_ROOM_STATE,
		{
			"type": REALTIME_EVENT_ROOM_STATE,
			"snapshot": battle_snapshot,
			"sourcePlayerId": realtime_room_player_id,
			"authorityPlayerId": realtime_room_authority_player_id,
			"stateVersion": realtime_room_state_version,
		}
	)

func _send_realtime_room_invite(target_player_id: String) -> void:
	if target_player_id.is_empty() or realtime_room_id.is_empty():
		return

	realtime_invited_player_ids[target_player_id] = true
	_send_realtime_lobby_broadcast(
		REALTIME_EVENT_ROOM_INVITE,
		{
			"type": REALTIME_EVENT_ROOM_INVITE,
			"roomCode": realtime_room_id,
			"fromName": battle_player_name,
			"fromPlayerId": realtime_player_id,
			"targetPlayerId": target_player_id,
		}
	)

func _reset_realtime_room_state(send_leave: bool = true) -> void:
	if (
		send_leave
		and realtime_room_joined
		and not realtime_room_topic.is_empty()
		and realtime_socket.get_ready_state() == WebSocketPeer.STATE_OPEN
	):
		_send_realtime_message(
			realtime_room_topic,
			"phx_leave",
			{},
			_next_realtime_ref(),
			realtime_room_join_ref
		)

	realtime_room_id = ""
	realtime_room_topic = ""
	realtime_room_join_ref = ""
	realtime_room_joined = false
	realtime_room_is_host = false
	realtime_room_player_id = ""
	realtime_room_status_text = ""
	realtime_room_action_order = 0
	realtime_room_state_version = 0
	realtime_room_authority_player_id = ""
	realtime_remote_action_orders.clear()
	realtime_pending_invite_target_id = ""

func _leave_realtime_room() -> void:
	_reset_realtime_room_state()
	battle_snapshot.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	_track_realtime_presence()

func _is_realtime_room_active() -> bool:
	return not realtime_room_id.is_empty() and not realtime_room_player_id.is_empty()

func _create_realtime_room_id() -> String:
	return "room-%s-%s" % [Time.get_unix_time_from_system(), Time.get_ticks_usec()]

func _next_realtime_room_action_order() -> int:
	realtime_room_action_order += 1
	return realtime_room_action_order

func _handle_realtime_packet(text: String) -> void:
	var parsed = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return

	var topic := str(parsed.get("topic", ""))
	var event_name := str(parsed.get("event", ""))
	var payload = parsed.get("payload", {})
	if event_name == "phx_reply":
		_handle_realtime_reply(parsed, payload)
		return

	if event_name == "broadcast" and typeof(payload) == TYPE_DICTIONARY:
		_handle_realtime_broadcast(topic, payload)
		return

	if topic != REALTIME_LOBBY_TOPIC:
		return

	if event_name == "presence_state" and typeof(payload) == TYPE_DICTIONARY:
		realtime_presence_state = payload
		_rebuild_realtime_online_players()
		return

	if event_name == "presence_diff" and typeof(payload) == TYPE_DICTIONARY:
		_apply_realtime_presence_diff(payload)
		_rebuild_realtime_online_players()
		return

	if event_name == "phx_error" or event_name == "phx_close":
		realtime_joined = false
		realtime_status_text = "Realtime reconnecting..."
		_render_battle_online_players()

func _handle_realtime_reply(message: Dictionary, payload) -> void:
	var ref := str(message.get("ref", ""))
	if typeof(payload) != TYPE_DICTIONARY:
		return

	if ref == realtime_room_join_ref:
		_handle_realtime_room_reply(payload)
		return

	if ref != realtime_join_ref:
		return

	if str(payload.get("status", "")) == "ok":
		realtime_joined = true
		realtime_status_text = "No players online"
		_track_realtime_presence()
	else:
		realtime_joined = false
		realtime_status_text = "Realtime unavailable"

	_render_battle_online_players()

func _handle_realtime_room_reply(payload: Dictionary) -> void:
	if str(payload.get("status", "")) != "ok":
		realtime_room_joined = false
		realtime_room_status_text = "Room unavailable"
		_build_battle_ready_layout()
		return

	realtime_room_joined = true
	realtime_room_status_text = ""

	if realtime_room_is_host:
		_broadcast_realtime_room_state()
		if not realtime_pending_invite_target_id.is_empty():
			_send_realtime_room_invite(realtime_pending_invite_target_id)
			realtime_pending_invite_target_id = ""
	else:
		_send_realtime_room_broadcast(
			REALTIME_EVENT_JOIN_REQUEST,
			{
				"type": REALTIME_EVENT_JOIN_REQUEST,
				"playerId": realtime_room_player_id,
				"playerName": battle_player_name,
			}
		)

	_track_realtime_presence()
	_build_battle_ready_layout()

func _handle_realtime_broadcast(topic: String, payload: Dictionary) -> void:
	var broadcast_event := str(payload.get("event", ""))
	var message = payload.get("payload", {})
	if typeof(message) != TYPE_DICTIONARY:
		return

	if topic == REALTIME_LOBBY_TOPIC:
		_handle_lobby_broadcast(broadcast_event, message)
		return

	if topic == realtime_room_topic:
		_handle_room_broadcast(broadcast_event, message)

func _handle_lobby_broadcast(event_name: String, message: Dictionary) -> void:
	match event_name:
		REALTIME_EVENT_ROOM_INVITE:
			_handle_lobby_room_invite(message)
		REALTIME_EVENT_INVITE_DECLINED:
			_handle_lobby_invite_declined(message)

func _handle_lobby_room_invite(message: Dictionary) -> void:
	if str(message.get("targetPlayerId", "")) != realtime_player_id:
		return

	if screen != Screen.BATTLE_PICKER or not realtime_room_id.is_empty():
		return

	realtime_pending_invitation = {
		"fromName": str(message.get("fromName", BATTLE_GUEST_NAME)),
		"fromPlayerId": str(message.get("fromPlayerId", "")),
		"roomCode": str(message.get("roomCode", "")),
	}
	_build_battle_picker_layout()

func _handle_lobby_invite_declined(message: Dictionary) -> void:
	if str(message.get("targetPlayerId", "")) != realtime_player_id:
		return

	if str(message.get("roomCode", "")) != realtime_room_id:
		return

	if battle_snapshot.has("players") and battle_snapshot["players"].size() >= 2:
		return

	realtime_status_text = "Invitation declined"
	_leave_realtime_room()
	_start_battle_picker()

func _handle_room_broadcast(event_name: String, message: Dictionary) -> void:
	match event_name:
		REALTIME_EVENT_ROOM_STATE:
			_handle_room_state_broadcast(message)
		REALTIME_EVENT_JOIN_REQUEST:
			_handle_join_request_broadcast(message)
		REALTIME_EVENT_PLAYER_READY:
			_handle_player_ready_broadcast(message)
		REALTIME_EVENT_PRIME_SELECTED:
			_handle_gameplay_broadcast(message)
		REALTIME_EVENT_COMBO_PENALTY:
			_handle_gameplay_broadcast(message)
		REALTIME_EVENT_CLEAR_SOLVED_STAGE:
			_handle_gameplay_broadcast(message)
		REALTIME_EVENT_ROOM_ERROR:
			_handle_room_error_broadcast(message)

func _handle_room_state_broadcast(message: Dictionary) -> void:
	if realtime_room_is_host:
		return

	var validation := RealtimeAuthority.validate_room_state_message(
		message,
		realtime_room_id,
		realtime_room_state_version
	)
	if not validation["accepted"]:
		return

	battle_snapshot = validation["snapshot"]
	realtime_room_state_version = int(validation["stateVersion"])
	realtime_room_authority_player_id = str(validation["authorityPlayerId"])
	_clear_battle_resolution()
	_reset_battle_display_state()
	_track_realtime_presence()

	if str(battle_snapshot.get("status", "")) == "playing":
		_enter_realtime_battle_game()
	else:
		screen = Screen.BATTLE_READY
		_build_battle_ready_layout()

func _handle_join_request_broadcast(message: Dictionary) -> void:
	if not realtime_room_is_host or battle_snapshot.is_empty():
		return

	if str(message.get("type", "")) != REALTIME_EVENT_JOIN_REQUEST:
		return

	var player_id := str(message.get("playerId", ""))
	var player_name := str(message.get("playerName", BATTLE_GUEST_NAME)).strip_edges()
	if player_id.is_empty():
		return
	if player_name.is_empty():
		player_name = BATTLE_GUEST_NAME

	var next_snapshot = BattleRoom.add_player_to_room(battle_snapshot, player_id, player_name)
	if next_snapshot == null:
		_send_realtime_room_broadcast(
			REALTIME_EVENT_ROOM_ERROR,
			{
				"type": REALTIME_EVENT_ROOM_ERROR,
				"targetPlayerId": player_id,
				"message": "Room already full",
			}
		)
		return

	battle_snapshot = next_snapshot
	_broadcast_realtime_room_state()
	_build_battle_ready_layout()

func _handle_player_ready_broadcast(message: Dictionary) -> void:
	if not realtime_room_is_host or battle_snapshot.is_empty():
		return

	if str(message.get("type", "")) != REALTIME_EVENT_PLAYER_READY:
		return

	var ready_snapshot := BattleRoom.set_player_ready(
		battle_snapshot,
		str(message.get("playerId", "")),
		message.get("ready", false) == true
	)
	battle_snapshot = BattleRoom.begin_room_match(ready_snapshot)
	_broadcast_realtime_room_state()

	if str(battle_snapshot.get("status", "")) == "playing":
		_enter_realtime_battle_game()
	else:
		_build_battle_ready_layout()

func _handle_gameplay_broadcast(message: Dictionary) -> void:
	if (
		not realtime_room_is_host
		or battle_snapshot.is_empty()
		or str(message.get("playerId", "")) == realtime_room_player_id
	):
		return

	var player_id := str(message.get("playerId", ""))
	var last_action_order := int(realtime_remote_action_orders.get(player_id, 0))
	var validation := RealtimeAuthority.validate_gameplay_action(
		battle_snapshot,
		message,
		last_action_order
	)
	if not validation["accepted"]:
		return

	realtime_remote_action_orders[player_id] = int(validation["actionOrder"])
	match str(message.get("type", "")):
		REALTIME_EVENT_PRIME_SELECTED:
			battle_snapshot = BattleRoom.apply_battle_prime_selection(
				battle_snapshot,
				player_id,
				int(message.get("prime", 0)),
				{
					"suppressAttack": message.get("suppressAttack", false) == true,
					"perfectSolveEligible": message.get("perfectSolveEligible", false) == true,
					"resolvingQueueLength": int(message.get("resolvingQueueLength", 1)),
				}
			)
		REALTIME_EVENT_COMBO_PENALTY:
			battle_snapshot = BattleRoom.apply_battle_penalty(
				battle_snapshot,
				player_id,
				message.get("preservedStage", null),
				message.get("releasedDamage", null)
			)
		REALTIME_EVENT_CLEAR_SOLVED_STAGE:
			battle_snapshot = BattleRoom.clear_solved_battle_stage(battle_snapshot, player_id)

	_broadcast_realtime_room_state()
	_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
	_render_battle()

func _handle_room_error_broadcast(message: Dictionary) -> void:
	if str(message.get("targetPlayerId", "")) != realtime_room_player_id:
		return

	var error_text := str(message.get("message", "Room unavailable"))
	_leave_realtime_room()
	realtime_status_text = error_text
	screen = Screen.BATTLE_PICKER
	_build_battle_picker_layout()

func _apply_realtime_presence_diff(payload: Dictionary) -> void:
	var joins = payload.get("joins", {})
	if typeof(joins) == TYPE_DICTIONARY:
		for key in joins.keys():
			realtime_presence_state[key] = joins[key]

	var leaves = payload.get("leaves", {})
	if typeof(leaves) == TYPE_DICTIONARY:
		for key in leaves.keys():
			realtime_presence_state.erase(key)

func _rebuild_realtime_online_players() -> void:
	var players: Array[Dictionary] = []

	for key in realtime_presence_state.keys():
		var presence = realtime_presence_state[key]
		if typeof(presence) != TYPE_DICTIONARY:
			continue

		var metas = presence.get("metas", [])
		if typeof(metas) != TYPE_ARRAY or metas.is_empty():
			continue

		var meta = metas[metas.size() - 1]
		if typeof(meta) != TYPE_DICTIONARY:
			continue

		var player_id := str(meta.get("playerId", key))
		if player_id == realtime_player_id:
			continue

		var player_name := str(meta.get("name", "Guest")).strip_edges()
		if player_name.is_empty():
			player_name = "Guest"

		players.append({
			"player_id": player_id,
			"name": player_name,
			"status": str(meta.get("status", "lobby")),
			"platform": str(meta.get("platform", "web")),
		})

	realtime_online_players = players
	realtime_status_text = "" if not realtime_online_players.is_empty() else "No players online"
	_render_battle_online_players()

func _next_realtime_ref() -> String:
	realtime_ref_counter += 1
	return str(realtime_ref_counter)

func _realtime_presence_status() -> String:
	if screen == Screen.BATTLE_GAME:
		return "in-game"

	if screen == Screen.BATTLE_READY and _is_realtime_room_active():
		return "in-team"

	return "lobby"

func _process(delta: float) -> void:
	_poll_realtime_lobby(delta)

	if screen == Screen.BATTLE_GAME:
		if not battle_resolving_queue.is_empty():
			battle_resolve_elapsed += delta
			if battle_resolve_elapsed >= MULTIPLAYER_COMBO_STEP_DELAY_SECONDS:
				battle_resolve_elapsed = 0.0
				_resolve_next_battle_prime()
			return

		if not battle_snapshot.is_empty() and battle_snapshot["status"] == "playing":
			var bot = null if _is_realtime_room_active() else BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)
			if bot != null and _can_apply_bot_turn(bot):
				battle_bot_elapsed += delta
				if battle_bot_elapsed >= _bot_think_delay_seconds(bot):
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
	match what:
		NOTIFICATION_APPLICATION_PAUSED:
			_throttle_background_app()
		NOTIFICATION_APPLICATION_RESUMED:
			_restore_foreground_app()
		NOTIFICATION_WM_GO_BACK_REQUEST:
			if _handle_back_navigation():
				get_viewport().set_input_as_handled()
			else:
				get_tree().quit()

func _unhandled_input(event: InputEvent) -> void:
	if not event.is_pressed():
		return

	if event.is_action_pressed("ui_cancel"):
		if _handle_back_navigation():
			get_viewport().set_input_as_handled()
		return

	if _handle_game_keyboard_input(event):
		get_viewport().set_input_as_handled()

func _handle_back_navigation() -> bool:
	if screen == Screen.SOLO:
		_pause_game()
		return true

	if screen == Screen.PAUSED:
		_resume_game()
		return true

	if (
		screen == Screen.LEADERBOARD
		or screen == Screen.SOLO_PREGAME
		or screen == Screen.BATTLE_PICKER
		or screen == Screen.BATTLE_READY
		or screen == Screen.BATTLE_GAME
		or screen == Screen.GAME_OVER
	):
		if tutorial_active and screen == Screen.BATTLE_GAME:
			_skip_tutorial()
		else:
			_start_home()
		return true

	return false

func _throttle_background_app() -> void:
	if app_background_throttled:
		return

	app_background_throttled = true
	foreground_max_fps = Engine.max_fps
	Engine.max_fps = 5

	var master_bus_index := AudioServer.get_bus_index("Master")
	if master_bus_index >= 0:
		master_bus_was_muted = AudioServer.is_bus_mute(master_bus_index)
		AudioServer.set_bus_mute(master_bus_index, true)

	if screen == Screen.SOLO:
		_pause_game()

	get_tree().paused = true

func _restore_foreground_app() -> void:
	get_tree().paused = false

	if not app_background_throttled:
		return

	Engine.max_fps = foreground_max_fps

	var master_bus_index := AudioServer.get_bus_index("Master")
	if master_bus_index >= 0:
		AudioServer.set_bus_mute(master_bus_index, master_bus_was_muted)

	app_background_throttled = false

func _handle_game_keyboard_input(event: InputEvent) -> bool:
	if screen != Screen.SOLO and screen != Screen.BATTLE_GAME:
		return false

	var key_event := event as InputEventKey
	if key_event != null and (key_event.alt_pressed or key_event.ctrl_pressed or key_event.meta_pressed):
		return false

	if event.is_action_pressed(INPUT_ACTION_GAME_BACKSPACE):
		if _is_game_keyboard_busy() or (keyboard_buffered_prime_input.is_empty() and _active_prime_queue_size() == 0):
			return false

		_handle_keyboard_backspace()
		return true

	if event.is_action_pressed(INPUT_ACTION_GAME_SPACE):
		_handle_keyboard_space()
		return true

	if event.is_action_pressed(INPUT_ACTION_GAME_SUBMIT):
		_handle_keyboard_submit()
		return true

	if key_event != null and key_event.echo:
		return false

	var direct_prime := _prime_from_input_action(event)
	if direct_prime != 0:
		_handle_keyboard_prime(direct_prime)
		return true

	var digit := _digit_from_input_action(event)
	if not digit.is_empty():
		_handle_keyboard_digit(digit)
		return true

	return false

func _prime_from_input_action(event: InputEvent) -> int:
	var playable_primes := Game.get_playable_stage_primes()
	for index in range(playable_primes.size()):
		if event.is_action_pressed(_prime_action_name(index)):
			return int(playable_primes[index])

	return 0

func _digit_from_input_action(event: InputEvent) -> String:
	for digit in range(1, 10):
		if event.is_action_pressed(_digit_action_name(digit)):
			return str(digit)

	return ""

func _handle_keyboard_prime(prime: int) -> void:
	_clear_keyboard_prime_input(false)
	if screen == Screen.SOLO:
		_queue_prime(prime)
	elif screen == Screen.BATTLE_GAME:
		_queue_battle_prime(prime)

func _handle_keyboard_digit(digit: String) -> void:
	if not _can_queue_keyboard_prime():
		return

	if keyboard_buffered_prime_input.is_empty():
		_process_fresh_keyboard_digit(digit)
		return

	var buffered_prime := _playable_prime_matching("%s%s" % [keyboard_buffered_prime_input, digit])
	_clear_keyboard_prime_input(false)
	if buffered_prime != 0:
		_handle_keyboard_prime(buffered_prime)
		return

	_process_fresh_keyboard_digit(digit)

func _process_fresh_keyboard_digit(digit: String) -> void:
	if digit == "4":
		var shortcut_prime := _playable_prime_matching("23")
		if shortcut_prime != 0:
			_handle_keyboard_prime(shortcut_prime)
		return

	var matching_primes := _playable_primes_starting_with(digit)
	if matching_primes.is_empty():
		return

	var exact_prime := _playable_prime_matching(digit)
	var has_longer_match := false
	for prime in matching_primes:
		if str(prime).length() > digit.length():
			has_longer_match = true
			break

	if exact_prime != 0 and (digit != "1" or not has_longer_match):
		_handle_keyboard_prime(exact_prime)
		return

	_set_keyboard_prime_input(digit)

func _handle_keyboard_backspace() -> void:
	if screen == Screen.SOLO:
		_backspace_queue()
	elif screen == Screen.BATTLE_GAME:
		_backspace_battle_queue()

func _handle_keyboard_submit() -> void:
	if not keyboard_buffered_prime_input.is_empty():
		return

	if screen == Screen.SOLO:
		_submit_queue()
	elif screen == Screen.BATTLE_GAME:
		_submit_battle_queue()

func _handle_keyboard_space() -> void:
	if not keyboard_buffered_prime_input.is_empty():
		_commit_keyboard_prime_input()
		return

	_handle_keyboard_submit()

func _commit_keyboard_prime_input() -> void:
	if not _can_queue_keyboard_prime():
		_clear_keyboard_prime_input()
		return

	var buffered_prime := _playable_prime_matching(keyboard_buffered_prime_input)
	_clear_keyboard_prime_input(false)
	if buffered_prime != 0:
		_handle_keyboard_prime(buffered_prime)
	else:
		_render_active_game_input()

func _can_queue_keyboard_prime() -> bool:
	if screen == Screen.SOLO:
		return resolving_queue.is_empty() and prime_queue.size() < COMBO_QUEUE_MAX_ITEMS

	if screen != Screen.BATTLE_GAME or battle_snapshot.is_empty():
		return false

	if battle_snapshot["status"] != "playing" or not battle_resolving_queue.is_empty():
		return false

	if battle_prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS:
		return false

	if tutorial_active:
		_sync_tutorial_state()
		if _tutorial_is_interaction_blocked():
			return false

	return true

func _is_game_keyboard_busy() -> bool:
	if screen == Screen.SOLO:
		return not resolving_queue.is_empty()

	if screen == Screen.BATTLE_GAME:
		return not battle_resolving_queue.is_empty()

	return false

func _active_prime_queue_size() -> int:
	if screen == Screen.SOLO:
		return prime_queue.size()

	if screen == Screen.BATTLE_GAME:
		return battle_prime_queue.size()

	return 0

func _playable_prime_matching(value: String) -> int:
	for prime in Game.get_playable_stage_primes():
		if str(prime) == value:
			return int(prime)

	return 0

func _playable_primes_starting_with(value: String) -> Array[int]:
	var matches: Array[int] = []
	for prime in Game.get_playable_stage_primes():
		if str(prime).begins_with(value):
			matches.append(int(prime))

	return matches

func _set_keyboard_prime_input(value: String) -> void:
	keyboard_buffered_prime_input = value
	_render_active_game_input()

func _clear_keyboard_prime_input(should_render := true) -> void:
	if keyboard_buffered_prime_input.is_empty():
		return

	keyboard_buffered_prime_input = ""
	if should_render:
		_render_active_game_input()

func _render_active_game_input() -> void:
	if screen == Screen.SOLO:
		_render_solo()
	elif screen == Screen.BATTLE_GAME:
		_render_battle()

func _start_home() -> void:
	_close_realtime_lobby()
	_reset_tutorial_runtime(false)
	screen = Screen.HOME
	prime_queue.clear()
	resolving_queue.clear()
	_clear_battle_resolution()
	home_menu_open = false
	_build_home_layout()

func _start_help() -> void:
	_start_tutorial_game()

func _skip_tutorial() -> void:
	_mark_tutorial_complete()
	_start_home()

func _start_tutorial_game() -> void:
	_close_realtime_lobby()
	_reset_tutorial_runtime(true)
	var room_id := "tutorial:%s" % Time.get_ticks_usec()
	battle_snapshot = BattleRoom.create_room_snapshot(room_id, BATTLE_PLAYER_ID, battle_player_name)
	battle_snapshot = BattleRoom.add_player_to_room(battle_snapshot, BATTLE_BOT_ID, BATTLE_BOT_NAME)
	battle_snapshot = _set_tutorial_cpu_hp(battle_snapshot)
	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_PLAYER_ID, true)
	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_BOT_ID, true)
	battle_snapshot = BattleRoom.begin_room_match(battle_snapshot)
	battle_snapshot = _normalize_tutorial_snapshot(battle_snapshot)
	battle_prime_queue.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_GAME
	_build_battle_game_layout()
	_render_battle()

func _start_leaderboard() -> void:
	_close_realtime_lobby()
	screen = Screen.LEADERBOARD
	leaderboard_entries.clear()
	leaderboard_status_text = "Waiting..."
	_build_leaderboard_layout()
	_request_leaderboard()

func _start_solo_pregame() -> void:
	screen = Screen.SOLO_PREGAME
	_build_solo_pregame_layout()

func _start_battle_picker() -> void:
	_leave_realtime_room()
	screen = Screen.BATTLE_PICKER
	_build_battle_picker_layout()
	_connect_realtime_lobby()

func _start_battle_ready() -> void:
	_leave_realtime_room()
	_reset_tutorial_runtime(false)
	battle_snapshot = BattleRoom.create_room_snapshot("godot-atom-bot", BATTLE_BOT_ID, BATTLE_BOT_NAME)
	battle_snapshot = BattleRoom.add_player_to_room(
		battle_snapshot,
		BATTLE_PLAYER_ID,
		battle_player_name
	)
	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_BOT_ID, true)
	battle_prime_queue.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_READY
	_build_battle_ready_layout()
	_track_realtime_presence()

func _start_hosted_realtime_room(target_player_id: String) -> void:
	if target_player_id.is_empty() or not realtime_joined:
		realtime_status_text = "Realtime unavailable"
		_render_battle_online_players()
		return

	_reset_tutorial_runtime(false)
	_reset_realtime_room_state()
	realtime_room_id = _create_realtime_room_id()
	realtime_room_topic = _realtime_room_topic_for(realtime_room_id)
	realtime_room_is_host = true
	realtime_room_player_id = realtime_player_id
	realtime_room_status_text = "Creating room..."
	realtime_pending_invite_target_id = target_player_id
	battle_snapshot = BattleRoom.create_room_snapshot(realtime_room_id, realtime_room_player_id, battle_player_name)
	battle_prime_queue.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	screen = Screen.BATTLE_READY
	_build_battle_ready_layout()
	_send_realtime_room_join()
	_track_realtime_presence()

func _accept_realtime_invitation() -> void:
	var room_id := str(realtime_pending_invitation.get("roomCode", ""))
	if room_id.is_empty() or not realtime_joined:
		realtime_pending_invitation.clear()
		_build_battle_picker_layout()
		return

	_reset_tutorial_runtime(false)
	_reset_realtime_room_state()
	realtime_room_id = room_id
	realtime_room_topic = _realtime_room_topic_for(room_id)
	realtime_room_is_host = false
	realtime_room_player_id = realtime_player_id
	realtime_room_status_text = "Joining room..."
	realtime_pending_invitation.clear()
	battle_snapshot.clear()
	battle_prime_queue.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	screen = Screen.BATTLE_READY
	_build_battle_ready_layout()
	_send_realtime_room_join()
	_track_realtime_presence()

func _decline_realtime_invitation() -> void:
	if realtime_pending_invitation.is_empty():
		return

	_send_realtime_lobby_broadcast(
		REALTIME_EVENT_INVITE_DECLINED,
		{
			"type": REALTIME_EVENT_INVITE_DECLINED,
			"roomCode": str(realtime_pending_invitation.get("roomCode", "")),
			"targetPlayerId": str(realtime_pending_invitation.get("fromPlayerId", "")),
		}
	)
	realtime_pending_invitation.clear()
	_build_battle_picker_layout()

func _start_battle_game() -> void:
	if _is_realtime_room_active():
		_toggle_realtime_ready()
		return

	if battle_snapshot.is_empty():
		_start_battle_ready()
		return

	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_PLAYER_ID, true)
	battle_snapshot = BattleRoom.begin_room_match(battle_snapshot)
	battle_prime_queue.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_GAME
	_build_battle_game_layout()
	_render_battle()
	_track_realtime_presence()

func _enter_realtime_battle_game() -> void:
	if battle_snapshot.is_empty():
		return

	battle_prime_queue.clear()
	_clear_battle_resolution()
	_reset_battle_display_state()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_GAME
	_build_battle_game_layout()
	_render_battle()
	_track_realtime_presence()

func _toggle_realtime_ready() -> void:
	if not _is_realtime_room_active() or battle_snapshot.is_empty():
		return

	var local_player = BattleRoom.find_player(battle_snapshot.get("players", []), realtime_room_player_id)
	if local_player == null or str(battle_snapshot.get("status", "")) != "waiting":
		return

	var next_ready: bool = local_player.get("ready", false) != true
	if realtime_room_is_host:
		battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, realtime_room_player_id, next_ready)
		battle_snapshot = BattleRoom.begin_room_match(battle_snapshot)
		_broadcast_realtime_room_state()
		if str(battle_snapshot.get("status", "")) == "playing":
			_enter_realtime_battle_game()
		else:
			_build_battle_ready_layout()
		return

	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, realtime_room_player_id, next_ready)
	_send_realtime_room_broadcast(
		REALTIME_EVENT_PLAYER_READY,
		{
			"type": REALTIME_EVENT_PLAYER_READY,
			"playerId": realtime_room_player_id,
			"ready": next_ready,
		}
	)
	_build_battle_ready_layout()

func _clear_battle_resolution() -> void:
	battle_resolving_queue.clear()
	battle_resolving_player_id = ""
	battle_submitted_queue_length = 0
	battle_resolve_elapsed = 0.0
	battle_perfect_solve_eligible = false

func _reset_battle_display_state() -> void:
	battle_display_player_hp = -1
	battle_display_bot_hp = -1
	battle_display_event_id = -1
	battle_result_reveal_event_id = -1

func _reset_tutorial_runtime(active: bool) -> void:
	tutorial_active = active
	tutorial_step = TutorialStep.INTRO if active else TutorialStep.DONE
	tutorial_enemy_attack_seen = false
	tutorial_enemy_turn_acknowledged = false
	tutorial_self_penalty_seen = false
	tutorial_overflow_penalty_seen = false
	tutorial_cpu_attack_allowed = false
	tutorial_tracked_event_id = -1

func _set_tutorial_cpu_hp(snapshot: Dictionary) -> Dictionary:
	var next_snapshot := snapshot.duplicate(true)
	for player in next_snapshot["players"]:
		if player["id"] == BATTLE_BOT_ID:
			player["hp"] = TUTORIAL_CPU_HP
	return next_snapshot

func _normalize_tutorial_snapshot(snapshot: Dictionary) -> Dictionary:
	if snapshot.is_empty():
		return snapshot

	var next_snapshot := snapshot.duplicate(true)
	var normalized_players: Array = []
	for player in next_snapshot["players"]:
		var next_player: Dictionary = player.duplicate(true)
		var side := "cpu" if str(player["id"]) == BATTLE_BOT_ID else "player"
		var scripted_stage := _get_tutorial_stage(side, int(player["stageIndex"]), str(snapshot["seed"]))
		if not _is_same_stage_shape(next_player["stage"], scripted_stage):
			next_player["stage"] = scripted_stage
		normalized_players.append(next_player)

	next_snapshot["players"] = normalized_players
	var local_player = BattleRoom.find_player(normalized_players, BATTLE_PLAYER_ID)
	if local_player != null:
		next_snapshot["stageIndex"] = int(local_player["stageIndex"])
		next_snapshot["stage"] = local_player["stage"]

	return next_snapshot

func _get_tutorial_stage(side: String, stage_index: int, seed: String) -> Dictionary:
	var scripted_factors := TUTORIAL_CPU_FACTORS if side == "cpu" else TUTORIAL_PLAYER_FACTORS
	if stage_index >= 0 and stage_index < scripted_factors.size():
		return _create_stage_state(stage_index, scripted_factors[stage_index])

	return Game.generate_stage("%s:%s" % [seed, side], stage_index)

func _create_stage_state(stage_index: int, factors: Array) -> Dictionary:
	var normalized_factors := factors.duplicate()
	normalized_factors.sort()
	var target_value := 1
	for prime in normalized_factors:
		target_value *= int(prime)

	return {
		"stageIndex": stage_index,
		"targetValue": target_value,
		"remainingValue": target_value,
		"factors": normalized_factors,
		"remainingFactors": normalized_factors.duplicate(),
	}

func _is_same_stage_shape(current_stage: Dictionary, scripted_stage: Dictionary) -> bool:
	var current_factors: Array = current_stage["factors"]
	var scripted_factors: Array = scripted_stage["factors"]
	return (
		int(current_stage["stageIndex"]) == int(scripted_stage["stageIndex"])
		and int(current_stage["targetValue"]) == int(scripted_stage["targetValue"])
		and current_factors.size() == scripted_factors.size()
		and _arrays_match(current_factors, scripted_factors)
	)

func _arrays_match(left: Array, right: Array) -> bool:
	if left.size() != right.size():
		return false

	for index in range(left.size()):
		if int(left[index]) != int(right[index]):
			return false

	return true

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
	_clear_keyboard_prime_input(false)
	var final_score := int(solo_state["score"])
	var final_combo := int(solo_state["maxCombo"])
	did_set_new_best = _save_best_score(final_score, final_combo)
	_add_experience(_solo_exp_gained(final_score))
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
	root_margin.add_theme_constant_override("margin_left", int(SAFE_AREA_PAGE_PADDING + _safe_area_left()))
	root_margin.add_theme_constant_override("margin_top", int(32.0 + _safe_area_top()))
	root_margin.add_theme_constant_override("margin_right", int(SAFE_AREA_PAGE_PADDING + _safe_area_right()))
	root_margin.add_theme_constant_override("margin_bottom", int(32.0 + _safe_area_bottom()))
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

func _safe_area_insets() -> Dictionary:
	if not OS.has_feature("mobile"):
		return {
			"left": 0.0,
			"top": 0.0,
			"right": 0.0,
			"bottom": 0.0,
		}

	var screen_size := Vector2(DisplayServer.screen_get_size())
	if screen_size.x <= 0.0 or screen_size.y <= 0.0:
		return {
			"left": 0.0,
			"top": 0.0,
			"right": 0.0,
			"bottom": 0.0,
		}

	var viewport_size := get_viewport_rect().size
	var scale := Vector2(viewport_size.x / screen_size.x, viewport_size.y / screen_size.y)
	var safe_area := DisplayServer.get_display_safe_area()
	var safe_start := Vector2(safe_area.position) * scale
	var safe_end := Vector2(safe_area.end) * scale

	return {
		"left": maxf(0.0, safe_start.x),
		"top": maxf(0.0, safe_start.y),
		"right": maxf(0.0, viewport_size.x - safe_end.x),
		"bottom": maxf(0.0, viewport_size.y - safe_end.y),
	}

func _safe_area_left() -> float:
	return float(_safe_area_insets()["left"])

func _safe_area_top() -> float:
	return float(_safe_area_insets()["top"])

func _safe_area_right() -> float:
	return float(_safe_area_insets()["right"])

func _safe_area_bottom() -> float:
	return float(_safe_area_insets()["bottom"])

func _safe_top_y(base: float) -> float:
	return base + _safe_area_top()

func _safe_bottom_y(viewport_height: float, height: float, bottom_margin: float) -> float:
	return viewport_height - height - bottom_margin - _safe_area_bottom()

func _app_version_label() -> String:
	var version := APP_VERSION_FALLBACK
	if ProjectSettings.has_setting(APP_VERSION_SETTING):
		version = str(ProjectSettings.get_setting(APP_VERSION_SETTING)).strip_edges()

	if version.is_empty():
		version = APP_VERSION_FALLBACK

	return "v%s" % version.trim_prefix("v")

func _build_home_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_left := _safe_area_left()
	var safe_top := _safe_area_top()
	var safe_right := _safe_area_right()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var version_label := _make_absolute_label(_app_version_label(), 13, COLOR_TEXT_INVERSE_SOFT, 600)
	version_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	version_label.position = Vector2(SAFE_AREA_EDGE_PADDING + safe_left, SAFE_AREA_EDGE_PADDING + safe_top)
	version_label.size = Vector2(96.0, 24.0)
	add_child(version_label)

	var hero_height: float = min(384.0, viewport_size.y * 0.48)
	var hero_diameter: float = max(viewport_size.x * 1.6, viewport_size.y * 1.3)
	var hero := Panel.new()
	hero.position = Vector2((viewport_size.x - hero_diameter) / 2.0, (viewport_size.y * 0.5) - hero_diameter)
	hero.size = Vector2(hero_diameter, hero_diameter)
	_apply_panel_theme(hero, THEME_PANEL_HERO_ORB)
	add_child(hero)

	var title_row := _make_home_title()
	title_row.size = Vector2(min(viewport_size.x * 0.92, 320.0), 72)
	title_row.position = Vector2(
		(viewport_size.x - title_row.size.x) / 2.0,
		(viewport_size.y * 0.25) - 36.0
	)
	add_child(title_row)
	_add_home_level_badge(viewport_size, title_row.position.y + title_row.size.y + 4.0)

	var total_blob_width := (HOME_BLOB_SIZE * 2.0) + HOME_BLOB_GAP
	var blob_left := (viewport_size.x - total_blob_width) / 2.0
	var blob_top := hero_height + 96.0

	if needs_tutorial:
		var play_button := _make_home_blob_button("Play", _start_tutorial_game, COLOR_PRIMARY_STRONG, "play")
		play_button.position = Vector2((viewport_size.x - HOME_BLOB_SIZE) / 2.0, blob_top)
		add_child(play_button)
		_start_home_blob_idle(play_button, false)
		return

	var solo_button := _make_home_blob_button("Solo", _start_solo_pregame, COLOR_PRIMARY_STRONG, "timer")
	solo_button.position = Vector2(blob_left, blob_top)
	add_child(solo_button)
	_start_home_blob_idle(solo_button, false)

	var battle_button := _make_home_blob_button("Battle", _start_battle_picker, COLOR_SECONDARY, "battle")
	battle_button.position = Vector2(blob_left + HOME_BLOB_SIZE + HOME_BLOB_GAP, blob_top)
	add_child(battle_button)
	_start_home_blob_idle(battle_button, true)

	_build_home_menu_controls(viewport_size, safe_top, safe_right)

func _add_home_level_badge(viewport_size: Vector2, top: float) -> void:
	var level := _calculate_level(player_experience)
	var badge := Panel.new()
	badge.size = Vector2(88, 32)
	badge.position = Vector2((viewport_size.x - badge.size.x) / 2.0, top)
	_apply_panel_theme(badge, THEME_PANEL_BADGE_SURFACE)
	add_child(badge)

	var label := _make_absolute_label("Lv. %d" % level, 13, COLOR_PRIMARY, 800)
	label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	badge.add_child(label)

func _build_home_menu_controls(viewport_size: Vector2, safe_top: float, safe_right: float) -> void:
	var menu_button_position := Vector2(
		viewport_size.x - HOME_MENU_BUTTON_SIZE - SAFE_AREA_EDGE_PADDING - safe_right,
		SAFE_AREA_EDGE_PADDING + safe_top
	)

	if home_menu_open:
		var dismiss_button := Button.new()
		dismiss_button.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		dismiss_button.text = ""
		dismiss_button.flat = true
		_apply_button_theme(dismiss_button, THEME_BUTTON_TRANSPARENT)
		dismiss_button.pressed.connect(_toggle_home_menu)
		add_child(dismiss_button)

		var dropdown := VBoxContainer.new()
		dropdown.position = Vector2(
			viewport_size.x - HOME_MENU_BUTTON_SIZE - SAFE_AREA_EDGE_PADDING - safe_right,
			menu_button_position.y + HOME_MENU_BUTTON_SIZE + 4.0
		)
		dropdown.size = Vector2(HOME_MENU_BUTTON_SIZE, 208.0)
		dropdown.add_theme_constant_override("separation", 4)
		add_child(dropdown)

		dropdown.add_child(_make_home_menu_item("guest", "Player", _show_player_name_dialog))
		dropdown.add_child(_make_home_menu_item("trophy", "Leaderboard", _start_leaderboard))
		dropdown.add_child(_make_home_menu_item("help", "Tutorial", _start_tutorial_game))
		dropdown.add_child(_make_home_menu_item("delete", "Reset best", _reset_best_score))

	var menu_button := _make_home_menu_button()
	menu_button.position = menu_button_position
	add_child(menu_button)

func _show_player_name_dialog() -> void:
	home_menu_open = false
	_build_home_layout()

	var overlay := _make_modal_overlay()
	overlay.name = "PlayerNameOverlay"
	add_child(overlay)

	var panel := _make_dialog_panel(260)
	overlay.add_child(panel)
	_add_dialog_header(panel, "Player")

	var label := _make_absolute_label("DISPLAY NAME", 12, COLOR_INK_SOFT, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.position = Vector2(14, 76)
	label.size = Vector2(DIALOG_WIDTH - 28.0, 20)
	panel.add_child(label)

	player_name_input = LineEdit.new()
	player_name_input.text = battle_player_name
	player_name_input.max_length = SaveManager.PLAYER_NAME_LIMIT
	player_name_input.placeholder_text = BATTLE_GUEST_NAME
	player_name_input.accessibility_name = "Display name"
	player_name_input.position = Vector2(14, 104)
	player_name_input.size = Vector2(DIALOG_WIDTH - 28.0, 44)
	player_name_input.alignment = HORIZONTAL_ALIGNMENT_CENTER
	player_name_input.virtual_keyboard_enabled = true
	player_name_input.text_submitted.connect(_save_player_name_from_dialog.unbind(1))
	panel.add_child(player_name_input)
	player_name_input.grab_focus()

	var hint := _make_absolute_label("Shown in battles and leaderboard.", 12, COLOR_INK_SOFT_HINT, 600)
	hint.position = Vector2(14, 154)
	hint.size = Vector2(DIALOG_WIDTH - 28.0, 20)
	panel.add_child(hint)

	var actions := HBoxContainer.new()
	actions.position = Vector2(12, 196)
	actions.size = Vector2(DIALOG_WIDTH - 24.0, DIALOG_BUTTON_HEIGHT)
	actions.add_theme_constant_override("separation", 8)
	panel.add_child(actions)

	actions.add_child(_make_dialog_action_button("Guest", _clear_player_name_from_dialog, COLOR_SECONDARY))
	actions.add_child(_make_dialog_action_button("Save", _save_player_name_from_dialog, COLOR_PRIMARY_STRONG))

func _save_player_name_from_dialog() -> void:
	if not is_instance_valid(player_name_input):
		return

	var saved_name := save_manager.save_player_name(player_name_input.text)
	battle_player_name = saved_name if not saved_name.is_empty() else _create_guest_display_name()
	_track_realtime_presence()
	_start_home()

func _clear_player_name_from_dialog() -> void:
	save_manager.save_player_name("")
	battle_player_name = _create_guest_display_name()
	_track_realtime_presence()
	_start_home()

func _build_leaderboard_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	_build_page_header("Leaderboard", "Top players.", "trophy")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0

	leaderboard_status_label = _make_absolute_label("", 15, COLOR_INK_SOFT, 700)
	leaderboard_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	leaderboard_status_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	leaderboard_status_label.position = Vector2(body_left, 276.0 + safe_top)
	leaderboard_status_label.size = Vector2(body_width, 64)
	leaderboard_status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(leaderboard_status_label)

	leaderboard_empty_button = _make_wide_page_button("PLAY SOLO", _start_solo_pregame, COLOR_PRIMARY_STRONG)
	leaderboard_empty_button.position = Vector2(body_left + 32.0, 356.0 + safe_top)
	leaderboard_empty_button.size = Vector2(body_width - 64.0, 56.0)
	add_child(leaderboard_empty_button)

	leaderboard_rows_root = VBoxContainer.new()
	leaderboard_rows_root.position = Vector2(body_left, 276.0 + safe_top)
	leaderboard_rows_root.size = Vector2(body_width, maxf(160.0, viewport_size.y - leaderboard_rows_root.position.y - 32.0 - _safe_area_bottom()))
	leaderboard_rows_root.add_theme_constant_override("separation", 8)
	add_child(leaderboard_rows_root)

	_render_leaderboard()

func _request_leaderboard() -> void:
	supabase_client.reload()

	if not supabase_client.is_configured():
		_use_local_leaderboard_fallback("Supabase not configured")
		return

	if leaderboard_request.get_http_client_status() != HTTPClient.STATUS_DISCONNECTED:
		leaderboard_request.cancel_request()

	var error := leaderboard_request.request(
		supabase_client.leaderboard_url(),
		supabase_client.rest_headers(),
		HTTPClient.METHOD_GET
	)
	if error != OK:
		_use_local_leaderboard_fallback("Leaderboard unavailable")

func _on_leaderboard_request_completed(
	result: int,
	response_code: int,
	_headers: PackedStringArray,
	body: PackedByteArray
) -> void:
	if screen != Screen.LEADERBOARD:
		return

	if result != HTTPRequest.RESULT_SUCCESS or response_code < 200 or response_code >= 300:
		_use_local_leaderboard_fallback("Leaderboard unavailable")
		return

	var parsed = JSON.parse_string(body.get_string_from_utf8())
	if typeof(parsed) != TYPE_ARRAY:
		_use_local_leaderboard_fallback("Leaderboard unavailable")
		return

	leaderboard_entries = _top_leaderboard_entries(_parse_leaderboard_entries(parsed))
	leaderboard_status_text = "" if not leaderboard_entries.is_empty() else "No records yet.\nPlay Solo to set the first score."
	_render_leaderboard()

func _parse_leaderboard_entries(rows: Array) -> Array[Dictionary]:
	var entries: Array[Dictionary] = []

	for row in rows:
		if typeof(row) != TYPE_DICTIONARY:
			continue

		var player_name := str(row.get("player_name", "")).strip_edges()
		var updated_at := str(row.get("updated_at", ""))
		var high_score := _normalize_historic_solo_high_score(float(row.get("high_score", 0)), updated_at)
		if player_name.is_empty() or high_score <= 0:
			continue

		entries.append({
			"player_name": player_name,
			"high_score": high_score,
		})

	return entries

func _top_leaderboard_entries(entries: Array[Dictionary]) -> Array[Dictionary]:
	var sorted_entries: Array[Dictionary] = []

	for entry in entries:
		var insert_index := -1
		for index in range(sorted_entries.size()):
			if int(sorted_entries[index]["high_score"]) < int(entry["high_score"]):
				insert_index = index
				break

		if insert_index == -1:
			sorted_entries.append(entry)
		else:
			sorted_entries.insert(insert_index, entry)

	var top_entries: Array[Dictionary] = []
	for index in range(min(10, sorted_entries.size())):
		top_entries.append(sorted_entries[index])
	return top_entries

func _normalize_historic_solo_high_score(score: float, updated_at: String) -> int:
	if not is_finite(score) or score <= 0.0:
		return 0

	if updated_at.is_empty() or updated_at >= SOLO_SCORE_REDESIGN_AT:
		return int(round(score))

	return min(HISTORIC_SOLO_SCORE_CAP, int(round(score * HISTORIC_SOLO_SCORE_FACTOR)))

func _use_local_leaderboard_fallback(_status_text: String) -> void:
	leaderboard_entries = _local_leaderboard_entries()
	leaderboard_status_text = "" if not leaderboard_entries.is_empty() else "No records yet.\nPlay Solo to set the first score."
	_render_leaderboard()

func _local_leaderboard_entries() -> Array[Dictionary]:
	var entries: Array[Dictionary] = []
	best_score = _load_best_score()
	if best_score > 0:
		entries.append({
			"player_name": battle_player_name,
			"high_score": best_score,
		})
	return entries

func _render_leaderboard() -> void:
	if (
		not is_instance_valid(leaderboard_rows_root)
		or not is_instance_valid(leaderboard_status_label)
		or not is_instance_valid(leaderboard_empty_button)
	):
		return

	for child in leaderboard_rows_root.get_children():
		child.queue_free()

	leaderboard_status_label.text = leaderboard_status_text
	leaderboard_status_label.visible = not leaderboard_status_text.is_empty()
	leaderboard_empty_button.visible = leaderboard_entries.is_empty()

	if not leaderboard_entries.is_empty():
		_add_leaderboard_header(leaderboard_rows_root, leaderboard_rows_root.size.x)

	for index in range(leaderboard_entries.size()):
		_add_leaderboard_row(leaderboard_rows_root, index + 1, leaderboard_entries[index], leaderboard_rows_root.size.x)

func _add_leaderboard_header(parent: VBoxContainer, width: float) -> void:
	var header := Control.new()
	header.custom_minimum_size = Vector2(width, 28)
	parent.add_child(header)

	var rank_label := _make_absolute_label("RANK", 11, COLOR_INK_SOFT, 800)
	rank_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	rank_label.position = Vector2(0, 0)
	rank_label.size = Vector2(56, 24)
	header.add_child(rank_label)

	var player_label := _make_absolute_label("PLAYER", 11, COLOR_INK_SOFT, 800)
	player_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	player_label.position = Vector2(64, 0)
	player_label.size = Vector2(max(96.0, width - 160.0), 24)
	header.add_child(player_label)

	var score_label := _make_absolute_label("HIGH SCORE", 11, COLOR_INK_SOFT, 800)
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	score_label.position = Vector2(width - 88.0, 0)
	score_label.size = Vector2(88, 24)
	header.add_child(score_label)

func _add_leaderboard_row(parent: VBoxContainer, rank: int, entry: Dictionary, width: float) -> void:
	var row := Control.new()
	row.custom_minimum_size = Vector2(width, 44)
	parent.add_child(row)

	var rank_color := COLOR_GOLD if rank == 1 else COLOR_PRIMARY
	var rank_label := _make_absolute_label("#%s" % rank, 14, rank_color, 900)
	rank_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	rank_label.position = Vector2(0, 6)
	rank_label.size = Vector2(56, 28)
	row.add_child(rank_label)

	var player_label := _make_absolute_label(str(entry["player_name"]), 15, COLOR_INK, 800)
	player_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	player_label.clip_text = true
	player_label.position = Vector2(64, 6)
	player_label.size = Vector2(max(96.0, width - 160.0), 28)
	row.add_child(player_label)

	var score_label := _make_absolute_label(str(int(entry["high_score"])), 15, COLOR_PRIMARY, 900)
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	score_label.position = Vector2(width - 88.0, 6)
	score_label.size = Vector2(88, 28)
	row.add_child(score_label)

func _toggle_home_menu() -> void:
	home_menu_open = not home_menu_open
	_build_home_layout()

func _build_page_header(title_text: String, tagline_text: String, icon_kind: String) -> void:
	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()
	var header_bottom := PAGE_HEADER_BOTTOM + safe_top
	var header_diameter: float = max(viewport_size.x * 1.6, viewport_size.y)
	var header := Panel.new()
	header.position = Vector2((viewport_size.x - header_diameter) / 2.0, header_bottom - header_diameter)
	header.size = Vector2(header_diameter, header_diameter)
	_apply_panel_theme(header, THEME_PANEL_PAGE_HEADER)
	add_child(header)

	var back_button := _make_page_back_button(_start_home)
	back_button.position = Vector2(SAFE_AREA_EDGE_PADDING + _safe_area_left(), _safe_top_y(24.0))
	add_child(back_button)

	var title := _make_absolute_label(title_text.to_upper(), 16, COLOR_TEXT_INVERSE, 900)
	title.position = Vector2(0, _safe_top_y(28.0))
	title.size = Vector2(viewport_size.x, 36)
	add_child(title)

	var icon_slot := Control.new()
	icon_slot.position = Vector2((viewport_size.x - 84.0) / 2.0, _safe_top_y(94.0))
	icon_slot.size = Vector2(84, 72)
	add_child(icon_slot)

	match icon_kind:
		"timer":
			_add_page_timer_icon(icon_slot)
		"trophy":
			_add_page_trophy_icon(icon_slot)
		_:
			_add_page_battle_icon(icon_slot)

	var tagline := _make_absolute_label(tagline_text.to_upper(), 12, COLOR_TEXT_INVERSE_SOFT, 800)
	tagline.position = Vector2(0, _safe_top_y(176.0))
	tagline.size = Vector2(viewport_size.x, 24)
	add_child(tagline)

func _build_solo_pregame_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	_build_page_header("Solo", "Beat the clock.", "timer")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0
	var stat_width: float = min(body_width, 256.0)
	var stat_left: float = (viewport_size.x - stat_width) / 2.0
	var button_width: float = body_width
	var button_left: float = (viewport_size.x - button_width) / 2.0

	var stat_panel := Panel.new()
	stat_panel.position = Vector2(stat_left, 284.0 + safe_top)
	stat_panel.size = Vector2(stat_width, 152.0)
	_apply_panel_theme(stat_panel, THEME_PANEL_SURFACE)
	add_child(stat_panel)

	var pb_title := _make_absolute_label("PERSONAL BEST", 12, COLOR_INK_SOFT, 800)
	pb_title.position = Vector2(16.0, 16.0)
	pb_title.size = Vector2(stat_width - 32.0, 24)
	stat_panel.add_child(pb_title)

	_add_pregame_stat_row(stat_panel, 16.0, 52.0, stat_width - 32.0, "Score", best_score)
	_add_pregame_stat_row(stat_panel, 16.0, 96.0, stat_width - 32.0, "Max Combo", best_combo)

	var start_button := _make_wide_page_button("GO", _start_solo_game, COLOR_PRIMARY_STRONG)
	start_button.position = Vector2(button_left, minf(492.0 + safe_top, _safe_bottom_y(viewport_size.y, 56.0, 48.0)))
	start_button.size = Vector2(button_width, 56)
	add_child(start_button)

func _add_pregame_stat_row(parent: Control, left: float, top: float, width: float, label_text: String, value: int) -> void:
	var row := Control.new()
	row.position = Vector2(left, top)
	row.size = Vector2(width, 32)
	parent.add_child(row)

	var label := _make_absolute_label(label_text, 16, COLOR_INK, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.position = Vector2.ZERO
	label.size = Vector2(width / 2.0, 32)
	row.add_child(label)

	var value_label := _make_absolute_label(str(value), 18, COLOR_PRIMARY, 900)
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.position = Vector2(width / 2.0, 0)
	value_label.size = Vector2(width / 2.0, 32)
	row.add_child(value_label)

func _build_battle_picker_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	_build_page_header("Battle", "Outsmart them.", "battle")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0

	_add_battle_section_title(body_left, 262.0 + safe_top, "cpu", "CPU Training")
	_add_battle_picker_row(body_left, 300.0 + safe_top, body_width, "bot", BATTLE_BOT_NAME, "Play", false, _start_battle_ready)

	var online_section_top := 384.0 + safe_top
	if not realtime_pending_invitation.is_empty():
		_add_realtime_invitation_card(body_left, online_section_top, body_width)
		online_section_top += 112.0

	_add_battle_section_title(body_left, online_section_top, "users", "Online Players")
	_add_battle_online_state(body_left, online_section_top + 38.0, body_width)

func _add_realtime_invitation_card(left: float, top: float, width: float) -> void:
	var panel := Panel.new()
	panel.position = Vector2(left, top)
	panel.size = Vector2(width, 88)
	_apply_panel_theme(panel, THEME_PANEL_SURFACE)
	add_child(panel)

	var from_name := str(realtime_pending_invitation.get("fromName", BATTLE_GUEST_NAME))
	var title := _make_absolute_label("%s invited you" % from_name, 14, COLOR_INK, 800)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	title.clip_text = true
	title.position = Vector2(12, 10)
	title.size = Vector2(width - 24.0, 24)
	panel.add_child(title)

	var accept_button := _make_dialog_action_button("Accept", _accept_realtime_invitation, COLOR_PRIMARY_STRONG)
	accept_button.position = Vector2(12, 44)
	accept_button.size = Vector2((width - 32.0) / 2.0, 34)
	panel.add_child(accept_button)

	var decline_button := _make_dialog_action_button("Decline", _decline_realtime_invitation, COLOR_SECONDARY)
	decline_button.position = Vector2(20.0 + accept_button.size.x, 44)
	decline_button.size = Vector2((width - 32.0) / 2.0, 34)
	panel.add_child(decline_button)

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

	var label := _make_absolute_label(label_text.to_upper(), 12, COLOR_INK_SOFT, 800)
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

func _add_battle_online_state(left: float, top: float, width: float) -> void:
	battle_online_status_label = _make_absolute_label("", 13, COLOR_INK_SOFT, 700)
	battle_online_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	battle_online_status_label.position = Vector2(left, top + 10.0)
	battle_online_status_label.size = Vector2(width, 24)
	battle_online_status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(battle_online_status_label)

	battle_online_hint_label = _make_absolute_label("Players will appear here when they join.", 13, COLOR_INK_SOFT_HINT, 600)
	battle_online_hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	battle_online_hint_label.position = Vector2(left, top + 34.0)
	battle_online_hint_label.size = Vector2(width, 28)
	battle_online_hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(battle_online_hint_label)

	battle_online_scroll = ScrollContainer.new()
	battle_online_scroll.position = Vector2(left, top)
	battle_online_scroll.size = Vector2(width, 196)
	add_child(battle_online_scroll)

	battle_online_rows_root = VBoxContainer.new()
	battle_online_rows_root.custom_minimum_size = Vector2(width, 0)
	battle_online_rows_root.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	battle_online_rows_root.add_theme_constant_override("separation", 0)
	battle_online_scroll.add_child(battle_online_rows_root)

	_render_battle_online_players()

func _render_battle_online_players() -> void:
	if (
		not is_instance_valid(battle_online_status_label)
		or not is_instance_valid(battle_online_hint_label)
		or not is_instance_valid(battle_online_scroll)
		or not is_instance_valid(battle_online_rows_root)
	):
		return

	for child in battle_online_rows_root.get_children():
		child.queue_free()

	if realtime_online_players.is_empty():
		battle_online_scroll.visible = false
		battle_online_status_label.visible = true
		battle_online_hint_label.visible = true
		battle_online_status_label.text = "No players online"
		battle_online_hint_label.text = "Players will appear here when they join."
		return

	battle_online_scroll.visible = true
	battle_online_status_label.visible = false
	battle_online_hint_label.visible = false

	for index in range(realtime_online_players.size()):
		_add_battle_online_row(battle_online_rows_root, realtime_online_players[index], battle_online_scroll.size.x, index > 0)

func _add_battle_online_row(parent: VBoxContainer, player: Dictionary, width: float, show_separator: bool) -> void:
	var row := Control.new()
	row.custom_minimum_size = Vector2(width, 64)
	parent.add_child(row)

	if show_separator:
		var separator := ColorRect.new()
		separator.color = COLOR_BORDER_SOFT
		separator.position = Vector2.ZERO
		separator.size = Vector2(width, 1.0)
		row.add_child(separator)

	var player_name := str(player.get("name", BATTLE_GUEST_NAME))
	var avatar_initial := player_name.substr(0, 1).to_upper()
	if avatar_initial.is_empty():
		avatar_initial = BATTLE_GUEST_NAME.substr(0, 1)

	var avatar := _make_avatar_initial_circle(40, COLOR_PRIMARY_STRONG, avatar_initial, 13)
	avatar.position = Vector2(0.0, 12.0)
	row.add_child(avatar)

	var name := _make_absolute_label(player_name, 16, COLOR_INK, 800)
	name.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	name.clip_text = true
	name.position = Vector2(52.0, 18.0)
	name.size = Vector2(max(104.0, width - 152.0), 28)
	row.add_child(name)

	var player_id := str(player.get("player_id", ""))
	var player_status := str(player.get("status", "lobby"))
	var is_invited := realtime_invited_player_ids.has(player_id)
	var action := Button.new()
	action.disabled = player_status != "lobby" or is_invited
	action.text = "Invited" if is_invited else ("Invite" if player_status == "lobby" else _format_realtime_status(player_status))
	_apply_button_theme(action, THEME_BUTTON_SMALL_SURFACE if action.disabled else THEME_BUTTON_SMALL_PRIMARY)
	action.position = Vector2(width - 88.0, 14.0)
	action.size = Vector2(88, 36)
	_wire_button_feedback(action, "tap")
	if not action.disabled:
		action.pressed.connect(_start_hosted_realtime_room.bind(player_id))
	row.add_child(action)

func _format_realtime_status(status: String) -> String:
	match status:
		"in-game":
			return "In Game"
		"in-team":
			return "In Team"
		_:
			return "Lobby"

func _battle_local_player_id() -> String:
	if _is_realtime_room_active():
		return realtime_room_player_id

	return BATTLE_PLAYER_ID

func _battle_opponent_player_id() -> String:
	if battle_snapshot.is_empty() or not battle_snapshot.has("players"):
		return BATTLE_BOT_ID

	var opponent = BattleRoom.find_opponent(battle_snapshot["players"], _battle_local_player_id())
	if opponent == null:
		return BATTLE_BOT_ID

	return str(opponent.get("id", BATTLE_BOT_ID))

func _battle_local_player():
	if battle_snapshot.is_empty() or not battle_snapshot.has("players"):
		return null

	return BattleRoom.find_player(battle_snapshot["players"], _battle_local_player_id())

func _battle_opponent_player():
	if battle_snapshot.is_empty() or not battle_snapshot.has("players"):
		return null

	return BattleRoom.find_opponent(battle_snapshot["players"], _battle_local_player_id())

func _battle_opponent_name() -> String:
	var opponent = _battle_opponent_player()
	if opponent == null:
		return "Waiting..." if _is_realtime_room_active() else BATTLE_BOT_NAME

	return str(opponent.get("name", BATTLE_BOT_NAME))

func _battle_local_player_name() -> String:
	var player = _battle_local_player()
	if player == null:
		return battle_player_name

	return str(player.get("name", battle_player_name))

func _build_battle_ready_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()

	var background := ColorRect.new()
	background.color = COLOR_PRIMARY
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var back_button := _make_header_icon_button("←", _start_battle_picker)
	back_button.position = Vector2(SAFE_AREA_EDGE_PADDING + _safe_area_left(), _safe_top_y(18.0))
	add_child(back_button)

	var opponent = _battle_opponent_player()
	var opponent_ready: bool = opponent != null and opponent.get("ready", false) == true
	var opponent_name := _battle_opponent_name()
	var opponent_avatar: Panel
	if _is_realtime_room_active():
		var opponent_initial := opponent_name.substr(0, 1).to_upper()
		if opponent == null:
			opponent_initial = "?"
		elif opponent_initial.is_empty():
			opponent_initial = BATTLE_GUEST_NAME.substr(0, 1)
		opponent_avatar = _make_avatar_initial_circle(80, COLOR_SECONDARY, opponent_initial, 20)
	else:
		opponent_avatar = _make_avatar_icon_circle(80, COLOR_SECONDARY, "bot")

	opponent_avatar.position = Vector2((viewport_size.x - 80.0) / 2.0, 268.0 + safe_top)
	if opponent_ready or not _is_realtime_room_active():
		_add_ready_badge(opponent_avatar, 20)
	add_child(opponent_avatar)

	var opponent_label := _make_absolute_label(opponent_name, 15, COLOR_TEXT_INVERSE_SUBTLE, 800)
	opponent_label.position = Vector2(0, 354.0 + safe_top)
	opponent_label.size = Vector2(viewport_size.x, 24)
	add_child(opponent_label)

	var versus := _make_absolute_label("VS", 46, COLOR_TEXT_INVERSE_SUBTLE, 900)
	versus.position = Vector2(0, 394.0 + safe_top)
	versus.size = Vector2(viewport_size.x, 56)
	add_child(versus)

	var local_player = _battle_local_player()
	var local_ready: bool = local_player != null and local_player.get("ready", false) == true
	var local_player_name := _battle_local_player_name()
	var player_initial := local_player_name.substr(0, 1).to_upper()
	if player_initial.is_empty():
		player_initial = BATTLE_GUEST_NAME.substr(0, 1)

	var player_avatar := _make_avatar_initial_circle(80, COLOR_PRIMARY_STRONG, player_initial, 20)
	player_avatar.position = Vector2((viewport_size.x - 80.0) / 2.0, 470.0 + safe_top)
	if local_ready:
		_add_ready_badge(player_avatar, 20)
	add_child(player_avatar)

	var player_label := _make_absolute_label(local_player_name, 15, COLOR_TEXT_INVERSE_SUBTLE, 800)
	player_label.position = Vector2(0, 558.0 + safe_top)
	player_label.size = Vector2(viewport_size.x, 24)
	add_child(player_label)

	var ready_button := _make_wide_page_button("Ready", _start_battle_game, COLOR_PRIMARY_STRONG)
	ready_button.size = Vector2(258, 56)
	ready_button.position = Vector2((viewport_size.x - 258.0) / 2.0, _safe_bottom_y(viewport_size.y, ready_button.size.y, 32.0))
	ready_button.disabled = _is_realtime_room_active() and (local_player == null or opponent == null)
	add_child(ready_button)

	if not realtime_room_status_text.is_empty():
		var status := _make_absolute_label(realtime_room_status_text, 12, COLOR_TEXT_INVERSE_SOFT, 700)
		status.position = Vector2(0, ready_button.position.y - 34.0)
		status.size = Vector2(viewport_size.x, 24)
		add_child(status)

func _build_battle_game_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()
	var safe_left := _safe_area_left()
	var safe_right := _safe_area_right()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var enemy_name := _make_absolute_label(_battle_opponent_name(), 15, COLOR_SECONDARY, 800)
	enemy_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	enemy_name.position = Vector2(SAFE_AREA_EDGE_PADDING + safe_left, 8.0 + safe_top)
	enemy_name.size = Vector2(160, 24)
	add_child(enemy_name)

	enemy_hp_label = _make_absolute_label("", 15, COLOR_SECONDARY, 800)
	enemy_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	enemy_hp_label.position = Vector2(viewport_size.x - 92.0 - safe_right, 8.0 + safe_top)
	enemy_hp_label.size = Vector2(80, 24)
	add_child(enemy_hp_label)

	enemy_hp_bar = _make_hp_bar(COLOR_SECONDARY)
	enemy_hp_bar.position = Vector2(SAFE_AREA_EDGE_PADDING + safe_left, 34.0 + safe_top)
	enemy_hp_bar.size = Vector2(viewport_size.x - (SAFE_AREA_EDGE_PADDING * 2.0) - safe_left - safe_right, 10)
	add_child(enemy_hp_bar)

	var enemy_blob := Panel.new()
	enemy_blob.size = Vector2(112, 112)
	enemy_blob.position = Vector2((viewport_size.x - 112.0) / 2.0, 72.0 + safe_top)
	_apply_panel_theme(enemy_blob, THEME_PANEL_AVATAR_SECONDARY)
	add_child(enemy_blob)
	enemy_target_label = _make_absolute_label("", 34, COLOR_INK, 900)
	enemy_target_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	enemy_blob.add_child(enemy_target_label)
	enemy_avatar_panel = enemy_blob

	var target_blob := Panel.new()
	target_blob.size = Vector2(160, 160)
	target_blob.position = Vector2((viewport_size.x - 160.0) / 2.0, 152.0 + safe_top)
	_apply_panel_theme(target_blob, THEME_PANEL_TARGET)
	add_child(target_blob)
	target_blob_panel = target_blob

	target_label = _make_absolute_label("", 48, COLOR_INK, 900)
	target_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	target_blob.add_child(target_label)

	stage_label = _make_absolute_label("", 12, COLOR_INK_SOFT, 800)
	stage_label.position = Vector2(24.0 + safe_left, 316.0 + safe_top)
	stage_label.size = Vector2(viewport_size.x - 48.0, 24)
	stage_label.visible = false
	add_child(stage_label)

	battle_result_text = ""
	result_label = _make_absolute_label("", 15, COLOR_SECONDARY, 800)
	result_label.position = Vector2(0, 324.0 + safe_top)
	result_label.size = Vector2(viewport_size.x, 24)
	add_child(result_label)

	var player_name_text := "You" if tutorial_active else _battle_local_player_name()
	var player_name := _make_absolute_label(player_name_text, 15, COLOR_PRIMARY_STRONG, 800)
	player_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	player_name.position = Vector2(SAFE_AREA_EDGE_PADDING + safe_left, 384.0 + safe_top)
	player_name.size = Vector2(160, 24)
	add_child(player_name)

	player_hp_label = _make_absolute_label("", 15, COLOR_PRIMARY_STRONG, 800)
	player_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	player_hp_label.position = Vector2(viewport_size.x - 92.0 - safe_right, 384.0 + safe_top)
	player_hp_label.size = Vector2(80, 24)
	add_child(player_hp_label)

	player_hp_bar = _make_hp_bar(COLOR_PRIMARY_STRONG)
	player_hp_bar.position = Vector2(SAFE_AREA_EDGE_PADDING + safe_left, 408.0 + safe_top)
	player_hp_bar.size = Vector2(viewport_size.x - (SAFE_AREA_EDGE_PADDING * 2.0) - safe_left - safe_right, 10)
	add_child(player_hp_bar)

	queue_label = _make_queue_panel()
	queue_label.position = Vector2(24.0 + safe_left, 436.0 + safe_top)
	queue_label.size = Vector2(viewport_size.x - 48.0 - safe_left - safe_right, 48)
	add_child(queue_label)

	var controls := _build_prime_keypad_controls(_queue_battle_prime, _backspace_battle_queue, _submit_battle_queue)
	_animate_game_layout_entry(target_blob, controls)

func _clear_screen() -> void:
	_clear_control_tweens()
	_clear_keyboard_prime_input(false)
	for child in get_children():
		if child == sfx_pool_root or child == network_root:
			continue

		child.queue_free()
	target_blob_panel = null
	enemy_avatar_panel = null
	enemy_target_label = null

func _build_solo_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size
	var safe_top := _safe_area_top()
	var safe_left := _safe_area_left()
	var safe_right := _safe_area_right()

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var pause_button := _make_pause_icon_button()
	pause_button.position = Vector2(SAFE_AREA_EDGE_PADDING + safe_left, SAFE_AREA_EDGE_PADDING + safe_top)
	pause_button.pressed.connect(_pause_game)
	add_child(pause_button)

	timer_bar = ProgressBar.new()
	timer_bar.show_percentage = false
	timer_bar.min_value = 0
	timer_bar.max_value = SOLO_DURATION_SECONDS
	timer_bar.value = solo_time_left
	timer_bar.position = Vector2(96.0 + safe_left, 28.0 + safe_top)
	timer_bar.size = Vector2(viewport_size.x - 192.0 - safe_left - safe_right, 8)
	_apply_progress_theme(timer_bar, THEME_PROGRESS_PRIMARY)
	add_child(timer_bar)

	score_label = _make_absolute_label("", 16, COLOR_PRIMARY, 900)
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	score_label.position = Vector2(viewport_size.x - 112.0 - safe_right, 16.0 + safe_top)
	score_label.size = Vector2(70, 24)
	add_child(score_label)

	score_unit_label = _make_absolute_label("pt", 13, COLOR_INK_SOFT, 600)
	score_unit_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	score_unit_label.position = Vector2(viewport_size.x - 38.0 - safe_right, 16.0 + safe_top)
	score_unit_label.size = Vector2(22, 24)
	add_child(score_unit_label)

	stage_label = _make_absolute_label("", 12, COLOR_INK_SOFT, 800)
	stage_label.position = Vector2(24.0 + safe_left, 88.0 + safe_top)
	stage_label.size = Vector2(viewport_size.x - 48.0 - safe_left - safe_right, 24)
	stage_label.visible = false
	add_child(stage_label)

	var target_blob := Panel.new()
	target_blob.size = Vector2(SOLO_TARGET_SIZE, SOLO_TARGET_SIZE)
	target_blob.position = Vector2((viewport_size.x - SOLO_TARGET_SIZE) / 2.0, 96.0 + safe_top)
	_apply_panel_theme(target_blob, THEME_PANEL_TARGET)
	add_child(target_blob)
	target_blob_panel = target_blob

	target_label = _make_absolute_label("", 72, COLOR_INK, 900)
	target_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	target_blob.add_child(target_label)

	queue_label = _make_queue_panel()
	queue_label.position = Vector2(24.0 + safe_left, 392.0 + safe_top)
	queue_label.size = Vector2(viewport_size.x - 48.0 - safe_left - safe_right, 56)
	add_child(queue_label)

	result_label = _make_absolute_label("", 14, COLOR_PRIMARY, 800)
	result_label.position = Vector2(24.0 + safe_left, 452.0 + safe_top)
	result_label.size = Vector2(viewport_size.x - 48.0 - safe_left - safe_right, 28)
	add_child(result_label)

	var controls := _build_prime_keypad_controls(_queue_prime, _backspace_queue, _submit_queue)
	_animate_game_layout_entry(target_blob, controls)

func _build_pause_layout() -> void:
	var overlay := _make_modal_overlay()
	add_child(overlay)

	var panel := _make_dialog_panel(228)
	overlay.add_child(panel)

	_add_dialog_header(panel, "Paused")

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

	var panel := _make_dialog_panel(408)
	overlay.add_child(panel)

	_add_dialog_header(panel, "Time's Up")

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
	stats.size = Vector2(DIALOG_WIDTH - 24.0, 132)
	stats.add_theme_constant_override("separation", 8)
	panel.add_child(stats)

	_add_dialog_stat_row(stats, "Atomized", int(solo_state["clearedStages"]))
	_add_dialog_stat_row(stats, "Max Combo", int(solo_state["maxCombo"]))
	var exp_gained := _solo_exp_gained(int(solo_state["score"]))
	if exp_gained > 0:
		_add_dialog_stat_text_row(stats, "EXP", "+%d" % exp_gained)

	var actions := HBoxContainer.new()
	actions.position = Vector2(12, 344)
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
	_apply_progress_theme(timer_bar, THEME_PROGRESS_PRIMARY)
	score_label.text = str(int(solo_state["score"]))
	stage_label.text = "Stage %s" % [int(solo_state["clearedStages"]) + 1]
	target_label.text = str(stage["remainingValue"])
	_render_queue_panel(prime_queue)
	result_label.text = last_result_text
	result_label.visible = last_result_text != ""
	_set_label_color(result_label, _feedback_text_color(last_result_text, COLOR_PRIMARY))

	var is_busy := not resolving_queue.is_empty()
	submit_button.disabled = is_busy or prime_queue.is_empty()
	backspace_button.disabled = is_busy or (prime_queue.is_empty() and keyboard_buffered_prime_input.is_empty())

	for child in prime_grid.get_children():
		if child is Button:
			child.disabled = is_busy or prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS

func _render_battle() -> void:
	if screen != Screen.BATTLE_GAME or battle_snapshot.is_empty():
		return

	if tutorial_active:
		battle_snapshot = _normalize_tutorial_snapshot(battle_snapshot)
		_track_tutorial_event()
		_sync_tutorial_state()

	var local_player_id := _battle_local_player_id()
	var opponent_player_id := _battle_opponent_player_id()
	var player = BattleRoom.find_player(battle_snapshot["players"], local_player_id)
	var bot = BattleRoom.find_player(battle_snapshot["players"], opponent_player_id)

	if player == null or bot == null:
		return

	var max_hp := int(battle_snapshot["maxHp"])
	if battle_display_player_hp < 0:
		battle_display_player_hp = int(player["hp"])
	if battle_display_bot_hp < 0:
		battle_display_bot_hp = int(bot["hp"])

	enemy_hp_bar.max_value = max_hp
	enemy_hp_bar.value = battle_display_bot_hp
	enemy_hp_label.text = str(battle_display_bot_hp)
	enemy_target_label.text = str(bot["stage"]["remainingValue"])
	player_hp_bar.max_value = max_hp
	player_hp_bar.value = battle_display_player_hp
	player_hp_label.text = str(battle_display_player_hp)
	stage_label.text = ""
	target_label.text = str(player["stage"]["remainingValue"])
	_render_queue_panel(battle_prime_queue)
	result_label.text = battle_result_text
	result_label.visible = battle_result_text != ""
	_set_label_color(result_label, _feedback_text_color(battle_result_text, COLOR_SECONDARY))

	var is_finished: bool = battle_snapshot["status"] == "finished"
	var is_busy := not battle_resolving_queue.is_empty()
	var can_submit_solved_stage := int(player["stage"]["remainingValue"]) == 1
	submit_button.disabled = (
		is_finished
		or is_busy
		or (battle_prime_queue.is_empty() and not can_submit_solved_stage)
		or (tutorial_active and _tutorial_is_submit_locked())
	)
	backspace_button.disabled = (
		is_finished
		or is_busy
		or (battle_prime_queue.is_empty() and keyboard_buffered_prime_input.is_empty())
		or (tutorial_active and tutorial_step != TutorialStep.DONE)
	)

	for child in prime_grid.get_children():
		if child is Button:
			var prime := int(child.text)
			child.disabled = (
				is_finished
				or is_busy
				or battle_prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS
				or (tutorial_active and _tutorial_prime_disabled(prime))
			)

	if is_finished and _is_battle_result_ready_to_render(player, bot):
		_build_battle_over_overlay()

	_render_tutorial_overlay()

func _is_battle_result_ready_to_render(player: Dictionary, bot: Dictionary) -> bool:
	if battle_display_player_hp != int(player["hp"]) or battle_display_bot_hp != int(bot["hp"]):
		return false

	var last_event: Dictionary = battle_snapshot.get("lastEvent", {})
	if last_event.has("id") and battle_result_reveal_event_id < int(last_event["id"]):
		return false

	return true

func _queue_battle_prime(prime: int) -> void:
	if screen != Screen.BATTLE_GAME or battle_snapshot["status"] != "playing":
		return

	_clear_keyboard_prime_input(false)
	if tutorial_active:
		_sync_tutorial_state()
		if _tutorial_is_interaction_blocked() or _tutorial_prime_disabled(prime):
			_play_sfx("fail")
			return

	if battle_prime_queue.size() >= COMBO_QUEUE_MAX_ITEMS:
		_play_sfx("fail")
		battle_result_text = "Queue full"
		_render_battle()
		_play_queue_limit_feedback()
		return

	battle_prime_queue.append(prime)
	battle_result_text = ""
	if tutorial_active:
		_sync_tutorial_state()
	_render_battle()

func _backspace_battle_queue() -> void:
	if screen != Screen.BATTLE_GAME or not battle_resolving_queue.is_empty():
		return

	if not keyboard_buffered_prime_input.is_empty():
		_clear_keyboard_prime_input()
		return

	if battle_prime_queue.is_empty():
		return

	if tutorial_active and tutorial_step != TutorialStep.DONE:
		_play_sfx("fail")
		return

	battle_prime_queue.pop_back()
	battle_result_text = ""
	_render_battle()

func _submit_battle_queue() -> void:
	if screen != Screen.BATTLE_GAME or not battle_resolving_queue.is_empty():
		return

	if not keyboard_buffered_prime_input.is_empty():
		return

	var local_player_id := _battle_local_player_id()
	var player = BattleRoom.find_player(battle_snapshot["players"], local_player_id)
	if player == null:
		return

	var can_submit_solved_stage := int(player["stage"]["remainingValue"]) == 1
	if tutorial_active:
		_sync_tutorial_state()
		if _tutorial_is_submit_locked():
			_play_sfx("fail")
			return

	if battle_prime_queue.is_empty():
		if can_submit_solved_stage:
			battle_snapshot = BattleRoom.clear_solved_battle_stage(battle_snapshot, local_player_id)
			_broadcast_realtime_clear_solved_stage(local_player_id)
			_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
			_render_battle()
		return

	_begin_battle_queue(local_player_id, battle_prime_queue.duplicate())
	battle_prime_queue.clear()
	_render_battle()

func _apply_atom_bot_turn() -> void:
	if (
		screen != Screen.BATTLE_GAME
		or battle_snapshot.is_empty()
		or battle_snapshot["status"] != "playing"
		or not battle_resolving_queue.is_empty()
	):
		return

	var bot = BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)
	if bot == null:
		return

	if int(bot["stage"]["remainingValue"]) == 1:
		battle_snapshot = BattleRoom.clear_solved_battle_stage(battle_snapshot, BATTLE_BOT_ID)
		_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
		_render_battle()
		return

	var selected_prime := _pick_tutorial_bot_prime(bot) if tutorial_active else _pick_bot_prime(bot)
	if selected_prime == 0:
		return

	_begin_battle_queue(BATTLE_BOT_ID, [selected_prime])
	_render_battle()

func _begin_battle_queue(player_id: String, queued_primes: Array) -> void:
	if (
		screen != Screen.BATTLE_GAME
		or battle_snapshot.is_empty()
		or battle_snapshot["status"] != "playing"
		or queued_primes.is_empty()
		or not battle_resolving_queue.is_empty()
	):
		return

	var acting_player = BattleRoom.find_player(battle_snapshot["players"], player_id)
	if acting_player == null:
		return

	battle_resolving_queue.clear()
	for prime in queued_primes:
		battle_resolving_queue.append(int(prime))

	battle_resolving_player_id = player_id
	battle_submitted_queue_length = battle_resolving_queue.size()
	battle_resolve_elapsed = 0.0
	battle_perfect_solve_eligible = (
		int(acting_player["stage"]["remainingValue"]) == int(acting_player["stage"]["targetValue"])
	)
	battle_result_text = ""
	battle_bot_elapsed = 0.0
	_resolve_next_battle_prime()

func _resolve_next_battle_prime() -> void:
	if battle_resolving_queue.is_empty() or battle_snapshot.is_empty():
		_clear_battle_resolution()
		return

	if battle_snapshot["status"] != "playing":
		_clear_battle_resolution()
		return

	var player_id := battle_resolving_player_id
	var prime := int(battle_resolving_queue.pop_front())
	var acting_player = BattleRoom.find_player(battle_snapshot["players"], player_id)
	if acting_player == null:
		_clear_battle_resolution()
		return

	var stage: Dictionary = acting_player["stage"]
	var outcome: Dictionary = Game.apply_prime_selection(stage, prime)

	if outcome["kind"] == "wrong":
		var released_damage_on_miss := int(acting_player["pendingFactorDamage"])
		battle_snapshot = BattleRoom.apply_battle_penalty(
			battle_snapshot,
			player_id,
			stage,
			released_damage_on_miss
		)
		_broadcast_realtime_combo_penalty(player_id, stage, released_damage_on_miss)
		battle_result_text = "Miss" if player_id == _battle_local_player_id() else "-8"
		_play_sfx("fail")
		_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
		_finish_battle_resolution()
		_render_battle()
		return

	if outcome["cleared"] and not battle_resolving_queue.is_empty():
		var released_damage := int(acting_player["pendingFactorDamage"]) + Game.compute_battle_factor_damage(prime)
		battle_snapshot = BattleRoom.apply_battle_penalty(
			battle_snapshot,
			player_id,
			outcome["stage"],
			released_damage
		)
		_broadcast_realtime_combo_penalty(player_id, outcome["stage"], released_damage)
		battle_result_text = "Miss" if player_id == _battle_local_player_id() else "-8"
		_play_sfx("fail")
		_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
		_finish_battle_resolution()
		_render_battle()
		return

	var is_final_queued_prime := battle_resolving_queue.is_empty()
	var should_batch_combo_damage := battle_submitted_queue_length > 1
	var options := {
		"suppressAttack": should_batch_combo_damage and not outcome["cleared"] and not is_final_queued_prime,
		"perfectSolveEligible": battle_perfect_solve_eligible,
	}

	if outcome["cleared"]:
		options["resolvingQueueLength"] = battle_submitted_queue_length

	battle_snapshot = BattleRoom.apply_battle_prime_selection(
		battle_snapshot,
		player_id,
		prime,
		options
	)
	_broadcast_realtime_prime_selected(player_id, prime, options)

	var event: Dictionary = battle_snapshot.get("lastEvent", {})
	if event.has("damage"):
		battle_result_text = ""
		_play_sfx("success" if player_id == _battle_local_player_id() else "fail")
		_play_battle_event_feedback(event)
	elif player_id == _battle_local_player_id():
		_play_sfx("prime")
		_play_target_impact()

	if battle_resolving_queue.is_empty():
		_finish_battle_resolution()

	_render_battle()

func _finish_battle_resolution() -> void:
	_clear_battle_resolution()
	battle_bot_elapsed = 0.0

func _should_broadcast_realtime_action(player_id: String) -> bool:
	return _is_realtime_room_active() and player_id == realtime_room_player_id and realtime_room_joined

func _broadcast_realtime_prime_selected(player_id: String, prime: int, options: Dictionary) -> void:
	if not _should_broadcast_realtime_action(player_id):
		return

	if realtime_room_is_host:
		_broadcast_realtime_room_state()
		return

	var payload := {
		"type": REALTIME_EVENT_PRIME_SELECTED,
		"playerId": player_id,
		"actionOrder": _next_realtime_room_action_order(),
		"prime": prime,
	}
	if options.has("suppressAttack"):
		payload["suppressAttack"] = options["suppressAttack"]
	if options.has("perfectSolveEligible"):
		payload["perfectSolveEligible"] = options["perfectSolveEligible"]
	if options.has("resolvingQueueLength"):
		payload["resolvingQueueLength"] = options["resolvingQueueLength"]

	_send_realtime_room_broadcast(REALTIME_EVENT_PRIME_SELECTED, payload)

func _broadcast_realtime_combo_penalty(player_id: String, preserved_stage, released_damage: int) -> void:
	if not _should_broadcast_realtime_action(player_id):
		return

	if realtime_room_is_host:
		_broadcast_realtime_room_state()
		return

	_send_realtime_room_broadcast(
		REALTIME_EVENT_COMBO_PENALTY,
		{
			"type": REALTIME_EVENT_COMBO_PENALTY,
			"playerId": player_id,
			"actionOrder": _next_realtime_room_action_order(),
			"preservedStage": preserved_stage,
			"releasedDamage": released_damage,
		}
	)

func _broadcast_realtime_clear_solved_stage(player_id: String) -> void:
	if not _should_broadcast_realtime_action(player_id):
		return

	if realtime_room_is_host:
		_broadcast_realtime_room_state()
		return

	_send_realtime_room_broadcast(
		REALTIME_EVENT_CLEAR_SOLVED_STAGE,
		{
			"type": REALTIME_EVENT_CLEAR_SOLVED_STAGE,
			"playerId": player_id,
			"actionOrder": _next_realtime_room_action_order(),
		}
	)

func _bot_think_delay_seconds(bot: Dictionary) -> float:
	if tutorial_active:
		return TUTORIAL_CPU_THINK_BASE_SECONDS + float(bot["stage"]["remainingFactors"].size()) * TUTORIAL_CPU_THINK_FACTOR_SECONDS

	var remaining_factor_count: int = int(bot["stage"]["remainingFactors"].size())
	var pending_damage_weight: int = min(int(bot["pendingFactorDamage"]), 12)
	return (
		BATTLE_BOT_THINK_BASE_SECONDS
		+ float(remaining_factor_count) * BATTLE_BOT_THINK_FACTOR_SECONDS
		- float(pending_damage_weight) * BATTLE_BOT_THINK_PENDING_DAMAGE_SECONDS
	)

func _pick_bot_prime(bot: Dictionary) -> int:
	var remaining_factors: Array = bot["stage"]["remainingFactors"]
	if remaining_factors.is_empty():
		return 0

	var wrong_primes: Array[int] = []
	for prime in Game.get_playable_stage_primes():
		if not remaining_factors.has(prime):
			wrong_primes.append(int(prime))

	if not wrong_primes.is_empty() and randf() < BATTLE_BOT_MISTAKE_CHANCE:
		return wrong_primes[randi_range(0, wrong_primes.size() - 1)]

	return int(remaining_factors[randi_range(0, remaining_factors.size() - 1)])

func _build_battle_over_overlay() -> void:
	if has_node("BattleOverOverlay"):
		return

	var player = BattleRoom.find_player(battle_snapshot["players"], _battle_local_player_id())
	var bot = BattleRoom.find_player(battle_snapshot["players"], _battle_opponent_player_id())
	var did_win := player != null and bot != null and int(bot["hp"]) <= 0 and int(player["hp"]) > 0
	var exp_gained := 0 if tutorial_active else _battle_exp_gained(player, bot, did_win)
	_add_experience(exp_gained)
	_play_sfx("success" if did_win else "fail")

	var overlay := _make_modal_overlay()
	overlay.name = "BattleOverOverlay"
	add_child(overlay)

	var panel := _make_dialog_panel(360)
	_apply_panel_theme(panel, THEME_PANEL_DIALOG_VICTORY if did_win else THEME_PANEL_DIALOG_DEFEAT)
	if did_win:
		_spawn_victory_confetti(overlay, panel.position + (panel.size / 2.0))
	overlay.add_child(panel)

	_add_dialog_header(panel, "Victory" if did_win else "Defeat", COLOR_GOLD if did_win else COLOR_INK_SOFT)

	var columns := HBoxContainer.new()
	columns.position = Vector2(12, 76)
	columns.size = Vector2(DIALOG_WIDTH - 24.0, 164)
	columns.add_theme_constant_override("separation", 8)
	panel.add_child(columns)

	_add_battle_result_column(columns, player, did_win, true, exp_gained)

	var divider := ColorRect.new()
	divider.color = COLOR_BORDER_SOFT
	divider.custom_minimum_size = Vector2(1, 156)
	columns.add_child(divider)

	_add_battle_result_column(columns, bot, not did_win, false, 0)

	var actions := HBoxContainer.new()
	actions.position = Vector2(12, 292)
	actions.size = Vector2(DIALOG_WIDTH - 24.0, DIALOG_BUTTON_HEIGHT)
	actions.add_theme_constant_override("separation", 8)
	panel.add_child(actions)

	var next_battle_label := "Battle" if _is_realtime_room_active() else "Rematch"
	var next_battle_callback := _start_battle_picker if _is_realtime_room_active() else _start_battle_ready
	actions.add_child(_make_dialog_action_button(next_battle_label, next_battle_callback, COLOR_SECONDARY))
	actions.add_child(_make_dialog_action_button("Top", _start_home, COLOR_PRIMARY_STRONG))

func _battle_exp_gained(player, opponent, did_win: bool) -> int:
	if did_win:
		return BATTLE_WIN_EXPERIENCE

	if player != null and opponent != null and int(player["hp"]) == 0 and int(opponent["hp"]) == 0:
		return BATTLE_TIE_EXPERIENCE

	return BATTLE_LOSS_EXPERIENCE

func _track_tutorial_event() -> void:
	if not tutorial_active or not battle_snapshot.has("lastEvent"):
		return

	var event: Dictionary = battle_snapshot["lastEvent"]
	var event_id := int(event.get("id", -1))
	if event_id == -1 or event_id == tutorial_tracked_event_id:
		return

	tutorial_tracked_event_id = event_id
	var source_player_id := str(event.get("sourcePlayerId", ""))
	var event_type := str(event.get("type", ""))

	if source_player_id == BATTLE_BOT_ID and (event_type == "attack" or event_type == "finish"):
		tutorial_enemy_attack_seen = true

	if source_player_id == BATTLE_PLAYER_ID and event_type == "self-hit":
		tutorial_self_penalty_seen = true
		if tutorial_step == TutorialStep.OVERFLOW_QUEUE or tutorial_step == TutorialStep.OVERFLOW_SUBMIT:
			tutorial_overflow_penalty_seen = true

func _sync_tutorial_state() -> void:
	if not tutorial_active:
		return

	var player = BattleRoom.find_player(battle_snapshot.get("players", []), BATTLE_PLAYER_ID)
	if player == null:
		return

	match tutorial_step:
		TutorialStep.STAGE_ONE_PRIME:
			if _queue_matches([2]):
				tutorial_step = TutorialStep.STAGE_ONE_QUEUE
		TutorialStep.STAGE_ONE_QUEUE:
			if battle_prime_queue.is_empty():
				tutorial_step = TutorialStep.STAGE_ONE_PRIME
			elif _queue_matches([2, 3]):
				tutorial_step = TutorialStep.STAGE_ONE_SUBMIT
		TutorialStep.STAGE_ONE_SUBMIT:
			if int(player["stageIndex"]) >= 1:
				tutorial_step = TutorialStep.STAGE_ONE_RESULT
		TutorialStep.STAGE_TWO_PRIME:
			if _queue_matches([2]):
				tutorial_step = TutorialStep.STAGE_TWO_QUEUE
		TutorialStep.STAGE_TWO_QUEUE:
			var stage: Dictionary = player["stage"]
			if battle_prime_queue.is_empty() and int(stage["remainingValue"]) == int(stage["targetValue"]):
				tutorial_step = TutorialStep.STAGE_TWO_PRIME
			elif int(player["stageIndex"]) >= 1 and int(stage["remainingValue"]) == 13:
				tutorial_step = TutorialStep.STAGE_TWO_RESULT
		TutorialStep.STAGE_TWO_FINISH:
			if _queue_matches([13]):
				tutorial_step = TutorialStep.STAGE_TWO_FINISH_SUBMIT
		TutorialStep.STAGE_TWO_FINISH_SUBMIT:
			if int(player["stageIndex"]) >= 2:
				tutorial_step = TutorialStep.ENEMY_TURN
		TutorialStep.ENEMY_TURN:
			if tutorial_enemy_attack_seen:
				tutorial_step = TutorialStep.ENEMY_ATTACK
		TutorialStep.PERFECT_SOLVE_QUEUE:
			if _queue_matches([2, 7]):
				tutorial_step = TutorialStep.PERFECT_SOLVE_SUBMIT
		TutorialStep.PERFECT_SOLVE_SUBMIT:
			if int(player["stageIndex"]) >= 3:
				tutorial_step = TutorialStep.PERFECT_SOLVE_RESULT
		TutorialStep.TRY_WRONG_PRIME:
			if tutorial_self_penalty_seen:
				tutorial_step = TutorialStep.WRONG_PRIME_RESULT
		TutorialStep.OVERFLOW_QUEUE:
			if _queue_matches([3, 7, 2]):
				tutorial_step = TutorialStep.OVERFLOW_SUBMIT
		TutorialStep.OVERFLOW_SUBMIT:
			if tutorial_overflow_penalty_seen:
				tutorial_step = TutorialStep.OVERFLOW_RESULT
		TutorialStep.OVERFLOW_CLEAR:
			if int(player["stageIndex"]) >= 4:
				tutorial_step = TutorialStep.SUMMARY

func _tutorial_handle_action() -> void:
	match tutorial_step:
		TutorialStep.INTRO:
			tutorial_step = TutorialStep.STAGE_ONE_PRIME
		TutorialStep.STAGE_ONE_RESULT:
			tutorial_step = TutorialStep.STAGE_TWO_PRIME
		TutorialStep.STAGE_TWO_RESULT:
			tutorial_step = TutorialStep.STAGE_TWO_FINISH
		TutorialStep.PERFECT_SOLVE_EXPLAIN:
			tutorial_step = TutorialStep.PERFECT_SOLVE_QUEUE
		TutorialStep.PERFECT_SOLVE_RESULT:
			tutorial_step = TutorialStep.TRY_WRONG_PRIME
		TutorialStep.ENEMY_TURN:
			tutorial_enemy_turn_acknowledged = true
			tutorial_cpu_attack_allowed = true
			battle_bot_elapsed = 0.0
		TutorialStep.ENEMY_ATTACK:
			tutorial_step = TutorialStep.PERFECT_SOLVE_EXPLAIN
		TutorialStep.WRONG_PRIME_RESULT:
			tutorial_step = TutorialStep.OVERFLOW_EXPLAIN
		TutorialStep.OVERFLOW_EXPLAIN:
			tutorial_step = TutorialStep.OVERFLOW_QUEUE
		TutorialStep.OVERFLOW_RESULT:
			tutorial_step = TutorialStep.OVERFLOW_CLEAR
		TutorialStep.SUMMARY:
			_mark_tutorial_complete()
			_start_home()
			return

	_render_battle()

func _tutorial_is_interaction_blocked() -> bool:
	if not tutorial_active:
		return false

	if tutorial_step == TutorialStep.ENEMY_TURN and tutorial_enemy_turn_acknowledged:
		return true

	var lesson: Dictionary = TUTORIAL_LESSONS.get(tutorial_step, {})
	return lesson.get("blocking", false) == true

func _tutorial_expected_queue() -> Array:
	match tutorial_step:
		TutorialStep.STAGE_ONE_PRIME, TutorialStep.STAGE_ONE_QUEUE, TutorialStep.STAGE_ONE_SUBMIT:
			return [2, 3]
		TutorialStep.STAGE_TWO_PRIME, TutorialStep.STAGE_TWO_QUEUE:
			return [2, 3]
		TutorialStep.STAGE_TWO_FINISH, TutorialStep.STAGE_TWO_FINISH_SUBMIT:
			return [13]
		TutorialStep.PERFECT_SOLVE_QUEUE, TutorialStep.PERFECT_SOLVE_SUBMIT:
			return [2, 7]
		TutorialStep.TRY_WRONG_PRIME:
			return [2]
		TutorialStep.OVERFLOW_QUEUE, TutorialStep.OVERFLOW_SUBMIT:
			return [3, 7, 2]
		_:
			return []

func _tutorial_prime_disabled(prime: int) -> bool:
	if _tutorial_is_interaction_blocked():
		return true

	if not _is_tutorial_prime_entry_step(tutorial_step):
		return not _tutorial_expected_queue().is_empty()

	var expected_queue := _tutorial_expected_queue()
	if expected_queue.is_empty():
		return false

	if not _queue_has_prefix(battle_prime_queue, expected_queue):
		return true

	if battle_prime_queue.size() >= expected_queue.size():
		return true

	return prime != int(expected_queue[battle_prime_queue.size()])

func _tutorial_is_submit_locked() -> bool:
	if _tutorial_is_interaction_blocked():
		return true

	match tutorial_step:
		TutorialStep.STAGE_ONE_SUBMIT:
			return not _queue_matches([2, 3])
		TutorialStep.STAGE_TWO_QUEUE:
			return not _queue_matches([2, 3])
		TutorialStep.STAGE_TWO_FINISH_SUBMIT:
			return not _queue_matches([13])
		TutorialStep.PERFECT_SOLVE_SUBMIT:
			return not _queue_matches([2, 7])
		TutorialStep.TRY_WRONG_PRIME:
			return not _queue_matches([2])
		TutorialStep.OVERFLOW_SUBMIT:
			return not _queue_matches([3, 7, 2])
		TutorialStep.OVERFLOW_CLEAR:
			return false
		_:
			return true

func _queue_matches(expected_queue: Array) -> bool:
	return _arrays_match(battle_prime_queue, expected_queue)

func _queue_has_prefix(queue: Array, expected_queue: Array) -> bool:
	if queue.size() > expected_queue.size():
		return false

	for index in range(queue.size()):
		if int(queue[index]) != int(expected_queue[index]):
			return false

	return true

func _is_tutorial_prime_entry_step(step: int) -> bool:
	return (
		step == TutorialStep.STAGE_ONE_PRIME
		or step == TutorialStep.STAGE_ONE_QUEUE
		or step == TutorialStep.STAGE_TWO_PRIME
		or step == TutorialStep.STAGE_TWO_QUEUE
		or step == TutorialStep.STAGE_TWO_FINISH
		or step == TutorialStep.PERFECT_SOLVE_QUEUE
		or step == TutorialStep.TRY_WRONG_PRIME
		or step == TutorialStep.OVERFLOW_QUEUE
	)

func _can_apply_bot_turn(bot: Dictionary) -> bool:
	if not tutorial_active:
		return true

	var player = BattleRoom.find_player(battle_snapshot.get("players", []), BATTLE_PLAYER_ID)
	if player == null:
		return false

	if int(player["stageIndex"]) < 2:
		return false

	if not tutorial_cpu_attack_allowed:
		return false

	if tutorial_enemy_attack_seen:
		return false

	return int(bot["hp"]) > 0 and int(player["hp"]) > 0

func _pick_tutorial_bot_prime(bot: Dictionary) -> int:
	if int(bot["stageIndex"]) == 0:
		if int(bot["stage"]["remainingValue"]) == 10:
			return 2
		if int(bot["stage"]["remainingValue"]) == 5:
			return 5

	if int(bot["stageIndex"]) == 1:
		return 3

	return _pick_bot_prime(bot)

func _render_tutorial_overlay() -> void:
	if has_node("TutorialCoachOverlay"):
		get_node("TutorialCoachOverlay").queue_free()

	if not tutorial_active or tutorial_step == TutorialStep.DONE:
		return

	if tutorial_step == TutorialStep.ENEMY_TURN and tutorial_enemy_turn_acknowledged:
		return

	var lesson: Dictionary = TUTORIAL_LESSONS.get(tutorial_step, {})
	if lesson.is_empty():
		return

	var viewport_size := get_viewport_rect().size
	var overlay := Control.new()
	overlay.name = "TutorialCoachOverlay"
	overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

	var has_primary_action := str(lesson.get("action", "")) != ""
	var has_skip_action := tutorial_step == TutorialStep.INTRO
	var card_height := 172.0 if has_primary_action or has_skip_action else 124.0
	var card_width: float = min(viewport_size.x - 16.0, 374.0)
	var controls_height := (SOLO_KEY_SIZE * 3.0) + (SOLO_KEY_GAP * 2.0)
	var controls_top := viewport_size.y - controls_height - SOLO_CONTROL_BOTTOM_MARGIN - _safe_area_bottom()
	var is_top_lesson := str(lesson.get("position", "bottom")) == "top"
	var card := Panel.new()
	card.size = Vector2(card_width, card_height)
	card.position = Vector2(
		(viewport_size.x - card_width) / 2.0,
		_safe_top_y(72.0) if is_top_lesson else maxf(_safe_top_y(84.0), controls_top - card_height - 12.0)
	)
	card.mouse_filter = Control.MOUSE_FILTER_STOP
	_apply_panel_theme(card, THEME_PANEL_TUTORIAL)
	overlay.add_child(card)

	var title := _make_absolute_label(str(lesson["title"]).to_upper(), 13, COLOR_PRIMARY, 900)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	title.position = Vector2(14, 12)
	title.size = Vector2(card_width - 28.0, 24)
	card.add_child(title)

	var body := _make_absolute_label(str(lesson["body"]), 13, COLOR_INK_SOFT, 700)
	body.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	body.vertical_alignment = VERTICAL_ALIGNMENT_TOP
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.position = Vector2(14, 42)
	body.size = Vector2(card_width - 28.0, 64)
	card.add_child(body)

	if has_primary_action or has_skip_action:
		var actions := HBoxContainer.new()
		actions.position = Vector2(14, card_height - 58.0)
		actions.size = Vector2(card_width - 28.0, DIALOG_BUTTON_HEIGHT)
		actions.add_theme_constant_override("separation", 8)
		card.add_child(actions)

		if has_primary_action:
			var action_button := _make_dialog_action_button(str(lesson["action"]), _tutorial_handle_action, COLOR_PRIMARY_STRONG)
			actions.add_child(action_button)

		if has_skip_action:
			var skip_button := _make_dialog_action_button("Skip", _skip_tutorial, COLOR_SECONDARY)
			actions.add_child(skip_button)

	_animate_tutorial_card(card)

func _queue_prime(prime: int) -> void:
	if screen != Screen.SOLO or not resolving_queue.is_empty():
		return

	_clear_keyboard_prime_input(false)
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
	if screen != Screen.SOLO or not resolving_queue.is_empty():
		return

	if not keyboard_buffered_prime_input.is_empty():
		_clear_keyboard_prime_input()
		return

	if prime_queue.is_empty():
		return

	prime_queue.pop_back()
	last_result_text = ""
	_render_solo()

func _submit_queue() -> void:
	if screen != Screen.SOLO or prime_queue.is_empty() or not resolving_queue.is_empty():
		return

	if not keyboard_buffered_prime_input.is_empty():
		return

	resolving_queue = prime_queue.duplicate()
	submitted_queue_length = resolving_queue.size()
	prime_queue.clear()
	resolve_elapsed = 0.0
	last_result_text = ""
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
		last_result_text = ""
		_play_sfx("fail")
		_play_target_fault()
		_spawn_timer_penalty_pop()
		_spawn_radial_particles(_target_center(), THEME_PANEL_PARTICLE_DANGER, THEME_PANEL_PARTICLE_RING_DANGER, 6)
		_render_solo()
		return

	var has_redundant_buffered_primes: bool = outcome["cleared"] and not resolving_queue.is_empty()
	var options: Dictionary = {}
	if outcome["cleared"] and not has_redundant_buffered_primes:
		options["resolvingQueueLength"] = submitted_queue_length

	var next_state: Dictionary = Game.advance_solo_state(current_state, run_seed, next_prime, options)

	if has_redundant_buffered_primes:
		solo_state = Game.apply_solo_penalty(next_state)
		solo_time_left = max(0.0, solo_time_left - 1.0)
		resolving_queue.clear()
		last_result_text = ""
		_play_sfx("fail")
		_play_target_fault()
		_spawn_timer_penalty_pop()
		_spawn_radial_particles(_target_center(), THEME_PANEL_PARTICLE_DANGER, THEME_PANEL_PARTICLE_RING_DANGER, 6)
	else:
		solo_state = next_state
		if outcome["cleared"]:
			_apply_time_compensation(current_state, submitted_queue_length)
		last_result_text = ""
		_play_sfx("success" if outcome["cleared"] else "prime")
		_play_target_impact()
		var score_delta := int(next_state["score"]) - int(current_state["score"])
		if score_delta > 0:
			_spawn_damage_pop("+%s" % score_delta, _target_pop_position(), COLOR_GOLD, SOLO_SCORE_POP_SECONDS)
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

func _is_tutorial_complete() -> bool:
	return save_manager.is_tutorial_complete()

func _mark_tutorial_complete() -> void:
	needs_tutorial = false
	save_manager.mark_tutorial_complete()

func _reset_best_score() -> void:
	best_score = 0
	best_combo = 0
	save_manager.reset_best_record()

	_start_home()

func _load_best_score() -> int:
	return save_manager.load_best_score()

func _load_best_combo() -> int:
	return save_manager.load_best_combo()

func _load_best_record() -> Dictionary:
	return save_manager.load_best_record()

func _save_best_score(score: int, max_combo: int) -> bool:
	return save_manager.save_best_score(score, max_combo)

func _solo_exp_gained(score: int) -> int:
	return maxi(0, int(floor(float(score) / 10.0)))

func _calculate_level(experience: int) -> int:
	return floori(sqrt(float(maxi(0, experience)) / 100.0)) + 1

func _add_experience(experience_gain: int) -> int:
	player_experience = save_manager.add_experience(player_experience, experience_gain)
	return player_experience

func _load_experience() -> int:
	return save_manager.load_experience()

func _save_experience(experience: int) -> int:
	return save_manager.save_experience(experience)

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
	_add_button_theme(app_theme, THEME_BUTTON_PAGE_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 16, COLOR_PRIMARY_STRONG, 16, RADIUS_PILL)
	_add_button_theme(app_theme, THEME_BUTTON_PAGE_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 16, COLOR_SECONDARY, 16, RADIUS_PILL)
	_add_button_theme(app_theme, THEME_BUTTON_BLOB_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_TEXT_INVERSE, 16, COLOR_PRIMARY_STRONG, 16, RADIUS_PILL, COLOR_BORDER_INVERSE_SOFT)
	_add_button_theme(app_theme, THEME_BUTTON_BLOB_SECONDARY, COLOR_SECONDARY, COLOR_TEXT_INVERSE, 16, COLOR_SECONDARY, 16, RADIUS_PILL, COLOR_BORDER_INVERSE_SOFT)
	_add_transparent_button_theme(app_theme)
	_add_panel_theme(app_theme, THEME_PANEL_HERO_ORB, "Panel", _make_pixel_box_style(COLOR_PRIMARY, COLOR_OUTLINE_STRONG, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_PAGE_HEADER, "Panel", _make_capsule_style(COLOR_PRIMARY))
	_add_panel_theme(app_theme, THEME_PANEL_LOGO_DOT, "Panel", _make_pixel_box_style(COLOR_TEXT_INVERSE, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_SURFACE, "Panel", _make_panel_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_CONTAINER_SURFACE, "PanelContainer", _make_panel_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG, "Panel", _make_dialog_panel_style())
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG_DEFEAT, "Panel", _make_dialog_panel_style(COLOR_INK_SOFT))
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG_VICTORY, "Panel", _make_dialog_panel_style(COLOR_GOLD))
	_add_panel_theme(app_theme, THEME_PANEL_TARGET, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_TARGET_DANGER, "Panel", _make_pixel_box_style(COLOR_DANGER, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_TARGET_GOLD, "Panel", _make_pixel_box_style(COLOR_GOLD, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_TUTORIAL, "Panel", _make_tutorial_panel_style())
	_add_panel_theme(app_theme, THEME_PANEL_AVATAR_PRIMARY, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_AVATAR_SECONDARY, "Panel", _make_pixel_box_style(COLOR_SECONDARY, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_BADGE_GOLD, "Panel", _make_button_style(COLOR_GOLD))
	_add_panel_theme(app_theme, THEME_PANEL_BADGE_SURFACE, "Panel", _make_button_style(COLOR_SURFACE))
	_add_panel_theme(app_theme, THEME_PANEL_READY_BADGE, "Panel", _make_pixel_box_style(COLOR_SURFACE, COLOR_PRIMARY, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_PRIMARY, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_SECONDARY, "Panel", _make_pixel_box_style(COLOR_SECONDARY, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_DANGER, "Panel", _make_pixel_box_style(COLOR_DANGER, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_GOLD, "Panel", _make_pixel_box_style(COLOR_GOLD, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_GOLD_STRONG, "Panel", _make_pixel_box_style(COLOR_GOLD_STRONG, Color.TRANSPARENT, 0, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_RING_PRIMARY, "Panel", _make_outline_circle_style(RADIUS_PILL, COLOR_PRIMARY_STRONG, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_RING_SECONDARY, "Panel", _make_outline_circle_style(RADIUS_PILL, COLOR_SECONDARY, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_RING_DANGER, "Panel", _make_outline_circle_style(RADIUS_PILL, COLOR_DANGER, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_PARTICLE_RING_GOLD, "Panel", _make_outline_circle_style(RADIUS_PILL, COLOR_GOLD, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_HEAL_GLOW, "Panel", _make_capsule_style(_alpha_color(COLOR_GOLD_STRONG, 0.24)))
	_add_panel_theme(app_theme, THEME_PANEL_FAULT_SHARD, "Panel", _make_capsule_style(COLOR_DANGER, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER))
	_add_panel_theme(app_theme, THEME_PANEL_FAULT_GLOW, "Panel", _make_capsule_style(_alpha_color(COLOR_DANGER, 0.24)))
	_add_panel_theme(app_theme, THEME_PANEL_ATTACK_BALL_PRIMARY, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_ATTACK_BALL_SECONDARY, "Panel", _make_pixel_box_style(COLOR_SECONDARY, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL))
	_add_panel_theme(app_theme, THEME_PANEL_ATTACK_GLOW_PRIMARY, "Panel", _make_capsule_style(_alpha_color(COLOR_PRIMARY_STRONG, 0.24)))
	_add_panel_theme(app_theme, THEME_PANEL_ATTACK_GLOW_SECONDARY, "Panel", _make_capsule_style(_alpha_color(COLOR_SECONDARY, 0.24)))
	_add_panel_theme(app_theme, THEME_PANEL_ATTACK_STREAK_PRIMARY, "Panel", _make_capsule_style(_alpha_color(COLOR_PRIMARY_STRONG, 0.68)))
	_add_panel_theme(app_theme, THEME_PANEL_ATTACK_STREAK_SECONDARY, "Panel", _make_capsule_style(_alpha_color(COLOR_SECONDARY, 0.68)))
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
	app_theme.set_stylebox("focus", variation, _make_button_style(normal_color, content_margin, radius, COLOR_GOLD, 3))
	app_theme.set_stylebox("pressed", variation, _make_button_style(pressed_color, content_margin, radius, border_color, border_width))
	app_theme.set_stylebox("hover_pressed", variation, _make_button_style(pressed_color, content_margin, radius, border_color, border_width))
	var disabled_color := Color(normal_color.r, normal_color.g, normal_color.b, normal_color.a * 0.56)
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

	var disabled_text_color := Color(text_color.r, text_color.g, text_color.b, text_color.a * 0.64)
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
	font.font_names = PackedStringArray(["Avenir Next", "Helvetica Neue", "Arial"])
	font.font_weight = weight
	return font

func _apply_button_theme(button: Button, variation: String) -> void:
	button.theme_type_variation = variation
	button.focus_mode = Control.FOCUS_ALL

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
	button.accessibility_name = text
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
	elif icon_kind == "play":
		_set_or_add_texture_icon(icon_slot, "play", 24, content_color)
	else:
		_add_help_icon(icon_slot, content_color)

	var label := _make_absolute_label(text.to_upper(), 16, content_color, 900)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.custom_minimum_size = Vector2(HOME_BLOB_SIZE, 24)
	content_stack.add_child(label)

	return button

func _start_home_blob_idle(button: Button, starts_raised: bool) -> void:
	if _prefers_reduced_motion():
		return

	var base_y := button.position.y
	var raised_y := base_y - 4.0
	if starts_raised:
		button.position.y = raised_y

	var tween := button.create_tween().bind_node(button)
	tween.set_loops()
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_IN_OUT)
	if starts_raised:
		tween.tween_property(button, "position:y", base_y, 3.3)
		tween.tween_property(button, "position:y", raised_y, 3.3)
	else:
		tween.tween_property(button, "position:y", raised_y, 3.3)
		tween.tween_property(button, "position:y", base_y, 3.3)

func _make_home_menu_button() -> Button:
	var button := Button.new()
	button.accessibility_name = "Close menu" if home_menu_open else "Menu"
	button.size = Vector2(HOME_MENU_BUTTON_SIZE, HOME_MENU_BUTTON_SIZE)
	button.custom_minimum_size = Vector2(HOME_MENU_BUTTON_SIZE, HOME_MENU_BUTTON_SIZE)
	button.text = ""
	button.flat = true
	_apply_button_theme(button, THEME_BUTTON_TRANSPARENT)
	_wire_button_feedback(button, "tap")
	button.pressed.connect(_toggle_home_menu)
	_set_or_add_texture_icon(button, "chevron_up" if home_menu_open else "menu", 28, COLOR_TEXT_INVERSE_SOFT)

	return button

func _make_home_menu_item(icon_kind: String, tooltip: String, callback: Callable) -> Button:
	var button := Button.new()
	button.accessibility_name = tooltip
	button.text = ""
	button.custom_minimum_size = Vector2(48, 48)
	button.flat = true
	_apply_button_theme(button, THEME_BUTTON_TRANSPARENT)
	_wire_button_feedback(button, "tap")
	_set_or_add_texture_icon(button, icon_kind, 24, COLOR_TEXT_INVERSE_SOFT)
	button.pressed.connect(callback)
	return button

func _prefers_reduced_motion() -> bool:
	return bool(ProjectSettings.get_setting(REDUCE_MOTION_SETTING, false))

func _make_header_icon_button(text: String, callback: Callable) -> Button:
	var button := Button.new()
	button.accessibility_name = "Back" if text == "←" else text
	button.text = "" if text == "←" else text
	button.size = Vector2(44, 44)
	button.custom_minimum_size = Vector2(44, 44)
	_apply_button_theme(button, THEME_BUTTON_TRANSPARENT)
	if text == "←":
		_add_back_arrow_icon(button, 44, 44, COLOR_TEXT_INVERSE)
	_wire_button_feedback(button, "back")
	button.pressed.connect(callback)
	return button

func _make_page_back_button(callback: Callable) -> Button:
	var button := Button.new()
	button.accessibility_name = "Back"
	button.text = ""
	button.size = Vector2(44, 44)
	button.custom_minimum_size = Vector2(44, 44)
	_apply_button_theme(button, THEME_BUTTON_ICON_SURFACE)
	_set_or_add_texture_icon(button, "back", 24, COLOR_PRIMARY)
	_wire_button_feedback(button, "back")
	button.pressed.connect(callback)
	return button

func _make_pause_icon_button() -> Button:
	var button := Button.new()
	button.accessibility_name = "Pause"
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

func _add_ready_badge(parent: Control, size: float) -> void:
	var badge := Panel.new()
	badge.size = Vector2(size, size)
	badge.position = Vector2(parent.size.x - size + 2.0, parent.size.y - size + 2.0)
	badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_apply_panel_theme(badge, THEME_PANEL_READY_BADGE)
	parent.add_child(badge)

	var check := Line2D.new()
	check.default_color = COLOR_PRIMARY
	check.width = 3.0
	check.points = PackedVector2Array([
		Vector2(size * 0.28, size * 0.52),
		Vector2(size * 0.42, size * 0.66),
		Vector2(size * 0.74, size * 0.34),
	])
	badge.add_child(check)

func _make_hp_bar(color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.show_percentage = false
	bar.min_value = 0
	bar.max_value = BattleRoom.STARTING_HP
	bar.value = BattleRoom.STARTING_HP
	_apply_progress_theme(bar, _progress_theme_for_color(color))
	return bar

func _make_wide_page_button(text: String, callback: Callable, color: Color) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 56)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_apply_button_theme(button, _button_theme_for_color(color, THEME_BUTTON_PAGE_PRIMARY, THEME_BUTTON_PAGE_SECONDARY))
	_wire_button_feedback(button, "start")
	button.pressed.connect(callback)
	return button

func _build_prime_keypad_controls(
	prime_callback: Callable,
	backspace_callback: Callable,
	submit_callback: Callable
) -> Control:
	var viewport_size := get_viewport_rect().size
	var safe_left := _safe_area_left()
	var safe_bottom := _safe_area_bottom()
	var grid_size := (SOLO_KEY_SIZE * 3.0) + (SOLO_KEY_GAP * 2.0)
	var controls_width := grid_size + SOLO_KEY_GAP + SOLO_KEY_SIZE
	var controls_height := grid_size
	var controls := HBoxContainer.new()
	controls.name = "PrimeControls"
	controls.position = Vector2(
		12.0 + safe_left,
		viewport_size.y - controls_height - SOLO_CONTROL_BOTTOM_MARGIN - safe_bottom
	)
	controls.size = Vector2(controls_width, controls_height)
	controls.add_theme_constant_override("separation", int(SOLO_KEY_GAP))
	add_child(controls)

	prime_grid = GridContainer.new()
	prime_grid.name = "PrimeGrid"
	prime_grid.columns = 3
	prime_grid.custom_minimum_size = Vector2(grid_size, grid_size)
	prime_grid.add_theme_constant_override("h_separation", int(SOLO_KEY_GAP))
	prime_grid.add_theme_constant_override("v_separation", int(SOLO_KEY_GAP))
	controls.add_child(prime_grid)

	for prime in Game.get_playable_stage_primes():
		var button := _make_prime_key_button(str(prime))
		button.pressed.connect(prime_callback.bind(int(prime)))
		prime_grid.add_child(button)

	var action_column := VBoxContainer.new()
	action_column.name = "PrimeActions"
	action_column.custom_minimum_size = Vector2(SOLO_KEY_SIZE, controls_height)
	action_column.add_theme_constant_override("separation", int(SOLO_KEY_GAP))
	controls.add_child(action_column)

	backspace_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 28, "backspace")
	backspace_button.name = "BackspaceButton"
	backspace_button.accessibility_name = "Backspace"
	backspace_button.custom_minimum_size = Vector2(SOLO_KEY_SIZE, SOLO_KEY_SIZE)
	_add_delete_icon(backspace_button, SOLO_KEY_SIZE, SOLO_KEY_SIZE, _get_button_text_color(COLOR_PRIMARY_STRONG))
	backspace_button.pressed.connect(backspace_callback)
	action_column.add_child(backspace_button)

	submit_button = _make_icon_text_button("", COLOR_PRIMARY_STRONG, COLOR_INK, 34, "submit")
	submit_button.name = "SubmitButton"
	submit_button.accessibility_name = "Submit combo"
	submit_button.custom_minimum_size = Vector2(SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP)
	_add_submit_icon(submit_button, SOLO_KEY_SIZE, (SOLO_KEY_SIZE * 2.0) + SOLO_KEY_GAP, _get_button_text_color(COLOR_PRIMARY_STRONG))
	submit_button.pressed.connect(submit_callback)
	action_column.add_child(submit_button)
	return controls

func _animate_game_layout_entry(target: Control, controls: Control) -> void:
	if _prefers_reduced_motion():
		return

	target.pivot_offset = target.size / 2.0
	target.scale = Vector2(0.96, 0.96)
	target.modulate.a = 0.0
	controls.position.y += 24.0
	controls.modulate.a = 0.0

	var tween := target.create_tween().set_parallel(true)
	tween.set_trans(Tween.TRANS_QUINT)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(target, "scale", Vector2.ONE, 0.36)
	tween.tween_property(target, "modulate:a", 1.0, 0.28)
	tween.tween_property(controls, "position:y", controls.position.y - 24.0, 0.44).set_delay(0.08)
	tween.tween_property(controls, "modulate:a", 1.0, 0.32).set_delay(0.08)

func _animate_tutorial_card(card: Panel) -> void:
	if _prefers_reduced_motion():
		return

	card.pivot_offset = Vector2(card.size.x / 2.0, card.size.y)
	card.scale = Vector2(0.98, 0.98)
	card.modulate.a = 0.0
	card.position.y += 12.0
	var tween := card.create_tween().set_parallel(true)
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(card, "position:y", card.position.y - 12.0, 0.28)
	tween.tween_property(card, "scale", Vector2.ONE, 0.28)
	tween.tween_property(card, "modulate:a", 1.0, 0.18)

func _make_prime_key_button(text: String) -> Button:
	var button := Button.new()
	button.accessibility_name = "Prime %s" % text
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
	panel.tree_entered.connect(_animate_dialog_panel.bind(panel), CONNECT_ONE_SHOT)
	return panel

func _animate_dialog_panel(panel: Panel) -> void:
	if _prefers_reduced_motion():
		return

	panel.pivot_offset = panel.size / 2.0
	panel.scale = Vector2(0.96, 0.96)
	panel.modulate.a = 0.0
	panel.position.y += 16.0
	var tween := panel.create_tween().set_parallel(true)
	tween.set_trans(Tween.TRANS_BACK)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(panel, "position:y", panel.position.y - 16.0, 0.3)
	tween.tween_property(panel, "scale", Vector2.ONE, 0.3)
	tween.tween_property(panel, "modulate:a", 1.0, 0.2)

func _add_dialog_header(panel: Panel, title: String, header_color: Color = COLOR_PRIMARY) -> void:
	var header := ColorRect.new()
	header.color = header_color
	header.position = Vector2.ZERO
	header.size = Vector2(DIALOG_WIDTH, 56)
	panel.add_child(header)

	var title_label := _make_absolute_label(title.to_upper(), 30, COLOR_TEXT_INVERSE, 900)
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
	var badge_color := COLOR_GOLD if did_set_new_best else COLOR_SURFACE
	_apply_panel_theme(badge, THEME_PANEL_BADGE_GOLD if did_set_new_best else THEME_PANEL_BADGE_SURFACE)

	var badge_text := "New Best!" if did_set_new_best else "BEST %s" % best_score
	var text_color := COLOR_TEXT_INVERSE if did_set_new_best else _get_button_text_color(badge_color)
	var label := _make_absolute_label(badge_text, 12, text_color, 800)
	label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	badge.add_child(label)
	return badge

func _add_dialog_stat_row(container: VBoxContainer, label_text: String, value: int) -> void:
	_add_dialog_stat_text_row(container, label_text, str(value))

func _add_dialog_stat_text_row(container: VBoxContainer, label_text: String, value_text: String) -> void:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(DIALOG_WIDTH - 24.0, 36)
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	container.add_child(row)

	var label := _make_absolute_label(label_text, 16, COLOR_INK, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(label)

	var value_label := _make_absolute_label(value_text, 16, COLOR_PRIMARY, 800)
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(value_label)

func _add_battle_result_column(
	container: HBoxContainer,
	player,
	is_winner: bool,
	show_exp: bool,
	exp_gained: int
) -> void:
	var column := VBoxContainer.new()
	column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	column.custom_minimum_size = Vector2(124, 156)
	column.alignment = BoxContainer.ALIGNMENT_CENTER
	column.add_theme_constant_override("separation", 8)
	container.add_child(column)

	var player_name := BATTLE_GUEST_NAME if player == null else str(player.get("name", BATTLE_GUEST_NAME))
	var name_row := HBoxContainer.new()
	name_row.custom_minimum_size = Vector2(124, 28)
	name_row.alignment = BoxContainer.ALIGNMENT_CENTER
	name_row.add_theme_constant_override("separation", 4)
	column.add_child(name_row)

	if is_winner:
		var crown_slot := Control.new()
		crown_slot.custom_minimum_size = Vector2(16, 16)
		crown_slot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		name_row.add_child(crown_slot)
		_add_crown_icon(crown_slot, 16, COLOR_GOLD)

	var name_label := _make_absolute_label(player_name, 14, COLOR_GOLD if is_winner else COLOR_INK_SOFT, 900)
	name_label.clip_text = true
	name_label.custom_minimum_size = Vector2(0, 28)
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_row.add_child(name_label)

	_add_battle_column_stat(column, "Atomized", str(0 if player == null else int(player.get("stageIndex", 0))), COLOR_PRIMARY)
	_add_battle_column_stat(column, "Max Combo", str(0 if player == null else int(player.get("maxCombo", 0))), COLOR_PRIMARY)

	if show_exp and exp_gained > 0:
		_add_battle_column_stat(column, "EXP", "+%s" % exp_gained, COLOR_GOLD)

func _add_battle_column_stat(container: VBoxContainer, label_text: String, value_text: String, value_color: Color) -> void:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(124, 32)
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	container.add_child(row)

	var label := _make_absolute_label(label_text, 11, COLOR_INK_SOFT, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(label)

	var value_label := _make_absolute_label(value_text, 13, value_color, 900)
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(value_label)

func _add_crown_icon(parent: Control, size: float, color: Color) -> void:
	var crown := Polygon2D.new()
	crown.color = color
	crown.polygon = PackedVector2Array([
		Vector2(size * 0.08, size * 0.78),
		Vector2(size * 0.20, size * 0.28),
		Vector2(size * 0.38, size * 0.54),
		Vector2(size * 0.50, size * 0.14),
		Vector2(size * 0.62, size * 0.54),
		Vector2(size * 0.80, size * 0.28),
		Vector2(size * 0.92, size * 0.78),
	])
	parent.add_child(crown)

	var base := ColorRect.new()
	base.color = color
	base.position = Vector2(size * 0.12, size * 0.78)
	base.size = Vector2(size * 0.76, size * 0.14)
	base.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(base)

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

func _get_button_text_color(color: Color) -> Color:
	return COLOR_TEXT_INVERSE if color in [COLOR_PRIMARY, COLOR_PRIMARY_STRONG, COLOR_SECONDARY, COLOR_DANGER] else COLOR_PRIMARY

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
	atom_art.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	atom_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	atom_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	atom_art.size = Vector2(icon_size, icon_size)
	atom_art.position = (parent.size - atom_art.size) / 2.0
	parent.add_child(atom_art)

func _play_target_impact() -> void:
	if not is_instance_valid(target_blob_panel):
		return

	target_blob_panel.pivot_offset = target_blob_panel.size / 2.0
	_pulse_panel_theme(target_blob_panel, THEME_PANEL_TARGET_GOLD, THEME_PANEL_TARGET, 0.18)
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
	_pulse_panel_theme(target_blob_panel, THEME_PANEL_TARGET_DANGER, THEME_PANEL_TARGET, 0.32)
	_flash_control(target_blob_panel, COLOR_DANGER, 0.24)

func _target_center() -> Vector2:
	if not is_instance_valid(target_blob_panel):
		var viewport_size := get_viewport_rect().size
		return viewport_size / 2.0

	return target_blob_panel.global_position + (target_blob_panel.size / 2.0)

func _target_pop_position() -> Vector2:
	return _target_center() + Vector2(-48, -24)

func _spawn_timer_penalty_pop() -> void:
	if not is_instance_valid(timer_bar):
		return

	var base_position := timer_bar.global_position + Vector2(timer_bar.size.x - 72.0, -28.0)
	var label := _make_absolute_label("-1s", 14, COLOR_DANGER, 800)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	label.position = base_position + Vector2(0, 7)
	label.size = Vector2(72, 24)
	label.scale = Vector2(0.92, 0.92)
	label.modulate = Color(1, 1, 1, 0)
	add_child(label)

	var motion_tween := label.create_tween()
	motion_tween.set_parallel(true)
	motion_tween.tween_property(label, "position", base_position + Vector2(0, -13), TIMER_PENALTY_POP_SECONDS).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	motion_tween.tween_property(label, "scale", Vector2.ONE, TIMER_PENALTY_POP_SECONDS).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

	var fade_tween := label.create_tween()
	fade_tween.tween_property(label, "modulate", Color(1, 1, 1, 1), TIMER_PENALTY_POP_SECONDS * 0.2)
	fade_tween.tween_interval(TIMER_PENALTY_POP_SECONDS * 0.4)
	fade_tween.tween_property(label, "modulate", Color(1, 1, 1, 0), TIMER_PENALTY_POP_SECONDS * 0.4)
	fade_tween.finished.connect(label.queue_free)

func _play_hp_hit(bar: ProgressBar, damage: int) -> void:
	if not is_instance_valid(bar) or damage <= 0:
		return

	var severity := _attack_severity(damage)
	_shake_control(bar, 6.0 + float(severity) * 3.0)
	_shake_screen(2.0 + float(severity) * 1.5)
	_pulse_hp_bar_theme(bar, THEME_PROGRESS_DANGER, 0.42 + float(severity) * 0.06)
	_pulse_label_color(_hp_label_for_bar(bar), COLOR_DANGER, _base_hp_color_for_bar(bar), 0.42)
	_flash_control(bar, COLOR_DANGER, 0.56)
	_spawn_damage_pop("-%s" % damage, _hp_pop_position(bar), COLOR_DANGER)

func _play_hp_regen(bar: ProgressBar, regen: int, source: Vector2) -> void:
	if not is_instance_valid(bar) or regen <= 0:
		return

	var target := _hp_bar_center(bar)
	_pulse_hp_bar_theme(bar, THEME_PROGRESS_GOLD, 0.54)
	_pulse_label_color(_hp_label_for_bar(bar), COLOR_GOLD, _base_hp_color_for_bar(bar), 0.54)
	_shine_hp_bar(bar)
	_flash_control(bar, COLOR_GOLD, 0.48)
	_spawn_damage_pop("+%s" % regen, _hp_pop_position(bar), COLOR_GOLD)
	_spawn_heal_stream(source, target, regen)

func _pulse_panel_theme(panel: Control, pulse_theme: String, base_theme: String, seconds: float) -> void:
	if not is_instance_valid(panel):
		return

	_apply_panel_theme(panel, pulse_theme)
	var tween := _make_control_tween(panel, "theme")
	tween.tween_interval(seconds)
	tween.tween_callback(_apply_panel_theme.bind(panel, base_theme))

func _pulse_hp_bar_theme(bar: ProgressBar, pulse_theme: String, seconds: float) -> void:
	if not is_instance_valid(bar):
		return

	_apply_progress_theme(bar, pulse_theme)
	var tween := _make_control_tween(bar, "hp-theme")
	tween.tween_interval(seconds)
	tween.tween_callback(_restore_hp_bar_theme.bind(bar))

func _restore_hp_bar_theme(bar: ProgressBar) -> void:
	if not is_instance_valid(bar):
		return

	if bar == enemy_hp_bar:
		_apply_progress_theme(bar, THEME_PROGRESS_SECONDARY)
	else:
		_apply_progress_theme(bar, THEME_PROGRESS_PRIMARY)

func _pulse_label_color(label, pulse_color: Color, base_color: Color, seconds: float) -> void:
	if not is_instance_valid(label):
		return

	_set_label_color(label, pulse_color)
	var tween := _make_control_tween(label, "label-color")
	tween.tween_interval(seconds)
	tween.tween_callback(_set_label_color.bind(label, base_color))

func _hp_label_for_bar(bar: ProgressBar):
	return enemy_hp_label if bar == enemy_hp_bar else player_hp_label

func _base_hp_color_for_bar(bar: ProgressBar) -> Color:
	return COLOR_SECONDARY if bar == enemy_hp_bar else COLOR_PRIMARY_STRONG

func _shine_hp_bar(bar: ProgressBar) -> void:
	if not is_instance_valid(bar):
		return

	var shine := ColorRect.new()
	shine.color = Color(COLOR_GOLD.r, COLOR_GOLD.g, COLOR_GOLD.b, 0.42)
	shine.position = Vector2(-16, -2)
	shine.size = Vector2(16, bar.size.y + 4)
	shine.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bar.add_child(shine)

	var tween := shine.create_tween()
	tween.set_parallel(true)
	tween.tween_property(shine, "position", Vector2(bar.size.x + 16.0, -2), 0.56).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(shine, "modulate", Color(1, 1, 1, 0), 0.56).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(shine.queue_free)

func _hp_pop_position(bar: ProgressBar) -> Vector2:
	var y_offset := 18.0 if bar == enemy_hp_bar else -58.0
	return bar.global_position + Vector2((bar.size.x - 96.0) / 2.0, y_offset)

func _hp_bar_center(bar: ProgressBar) -> Vector2:
	if not is_instance_valid(bar):
		return _target_center()

	return bar.global_position + (bar.size / 2.0)

func _attack_severity(damage: int) -> int:
	if damage > 30:
		return 3

	if damage > 15:
		return 2

	if damage > 5:
		return 1

	return 0

func _shake_screen(distance: float) -> void:
	var origin := position
	var tween := _make_control_tween(self, "screen-shake")
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(self, "position", origin + Vector2(-distance, 0), 0.018)
	tween.tween_property(self, "position", origin + Vector2(distance * 0.72, 0), 0.018)
	tween.tween_property(self, "position", origin + Vector2(-distance * 0.36, 0), 0.018)
	tween.tween_property(self, "position", origin, 0.018)

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
		_apply_panel_theme(panel_flash, _particle_theme_for_color(color))
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

func _particle_theme_for_color(color: Color) -> String:
	if color == COLOR_DANGER:
		return THEME_PANEL_PARTICLE_DANGER

	if color == COLOR_GOLD:
		return THEME_PANEL_PARTICLE_GOLD

	if color == COLOR_SECONDARY:
		return THEME_PANEL_PARTICLE_SECONDARY

	return THEME_PANEL_PARTICLE_PRIMARY

func _spawn_damage_pop(text: String, position: Vector2, color: Color, duration: float = DAMAGE_POP_SECONDS) -> void:
	var label := _make_absolute_label(text, 18, color, 900)
	label.position = position
	label.size = Vector2(96, 28)
	label.modulate = Color(1, 1, 1, 1)
	add_child(label)

	var tween := label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position", position + Vector2(0, -18), duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate", Color(1, 1, 1, 0), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(label.queue_free)

func _spawn_victory_confetti(parent: Control, center: Vector2) -> void:
	for index in range(VICTORY_CONFETTI.size()):
		var dot: Dictionary = VICTORY_CONFETTI[index]
		var angle := deg_to_rad(float(dot["angle"]))
		var distance := float(dot["distance"]) * 16.0
		var direction := Vector2(sin(angle), -cos(angle))
		var endpoint := center + (direction * distance)
		var particle_size := float(dot["size"]) * 16.0
		_spawn_confetti_particle(
			parent,
			center,
			endpoint,
			_victory_confetti_theme(index),
			particle_size,
			float(dot["delay"])
		)

func _victory_confetti_theme(index: int) -> String:
	match index % 3:
		0:
			return THEME_PANEL_PARTICLE_GOLD
		1:
			return THEME_PANEL_PARTICLE_GOLD_STRONG
		_:
			return THEME_PANEL_PARTICLE_PRIMARY

func _spawn_confetti_particle(
	parent: Control,
	source: Vector2,
	target: Vector2,
	theme_name: String,
	particle_size: float,
	delay: float
) -> void:
	var particle := _make_particle_panel(theme_name, particle_size)
	particle.position = source - (particle.size / 2.0)
	particle.scale = Vector2.ZERO
	particle.modulate = Color(1, 1, 1, 0)
	parent.add_child(particle)

	var mid_target := source + ((target - source) * 0.45)
	var tween := particle.create_tween()
	if delay > 0.0:
		tween.tween_interval(delay)
	tween.set_parallel(true)
	tween.tween_property(particle, "position", mid_target - (particle.size / 2.0), 0.39).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(particle, "scale", Vector2(1.15, 1.15), 0.39).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(particle, "modulate", Color(1, 1, 1, 1), 0.39).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	tween.chain().set_parallel(true)
	tween.tween_property(particle, "position", target - (particle.size / 2.0), 0.91).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(particle, "scale", Vector2(0.6, 0.6), 0.91).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.tween_property(particle, "modulate", Color(1, 1, 1, 0), 0.91).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(particle.queue_free)

func _spawn_radial_particles(center: Vector2, fill_theme: String, ring_theme: String, count: int = 8) -> void:
	for index in range(count):
		var angle := (TAU * float(index)) / float(count)
		var distance := 28.0 + float(index % 3) * 8.0
		var endpoint := center + Vector2(cos(angle), sin(angle)) * distance
		_spawn_particle(center, endpoint, fill_theme if index % 3 != 0 else ring_theme, 0.26 + float(index % 2) * 0.04, index)

func _spawn_attack_particles(
	source: Vector2,
	target: Vector2,
	fill_theme: String,
	ring_theme: String,
	ball_theme: String,
	damage: int = 0,
	completion_callback: Callable = Callable()
) -> void:
	var severity := _attack_severity(damage)
	var trail_count := _attack_trail_count(severity)
	var lead_size := _attack_lead_size(severity)
	var trail_size := _attack_trail_size(severity)
	var spread_scale := _attack_spread_scale(severity)
	var duration := _attack_duration(severity)
	var flight_duration := duration * BATTLE_ATTACK_FLIGHT_END
	var impact_delay := duration * BATTLE_ATTACK_IMPACT_START
	var impact_duration: float = max(0.01, duration - impact_delay)
	var delta := target - source
	var direction := delta.normalized() if delta.length() > 0.0 else Vector2.RIGHT
	var tangent := Vector2(-direction.y, direction.x)
	var horizontal_direction := 1.0 if target.x >= source.x else -1.0
	var control := (source + target) / 2.0 + Vector2(42.0 * horizontal_direction * spread_scale, -88.0 * spread_scale)
	var glow_theme := _attack_glow_theme_for_ball(ball_theme)
	var streak_theme := _attack_streak_theme_for_ball(ball_theme)

	_spawn_attack_launch_flare(source, direction, fill_theme, ring_theme, severity)
	_spawn_attack_bullet(source, control, target, ball_theme, glow_theme, streak_theme, flight_duration, lead_size, severity)

	for index in range(trail_count):
		var delay := duration * (float(index) + 1.0) * BATTLE_ATTACK_TRAIL_STEP
		var wobble := 10.0 * spread_scale
		var size: float = trail_size * max(0.5, 1.0 - float(index) * 0.06)
		_spawn_attack_path_particle(
			source,
			control,
			target,
			fill_theme,
			max(0.01, flight_duration - delay),
			delay,
			index + 1,
			size,
			tangent,
			wobble,
			float(index) * 1.8,
			false
		)

	_spawn_attack_impact_flash(target, fill_theme, ring_theme, glow_theme, severity, impact_delay, impact_duration)
	_spawn_impact_rings(target, ring_theme, severity, impact_delay, impact_duration)

	if completion_callback.is_valid():
		var completion_tween := create_tween()
		completion_tween.tween_interval(duration)
		completion_tween.tween_callback(completion_callback)

func _spawn_attack_launch_flare(
	center: Vector2,
	direction: Vector2,
	fill_theme: String,
	ring_theme: String,
	severity: int
) -> void:
	var tangent := Vector2(-direction.y, direction.x)
	var flare_size := 16.0 + float(severity) * 4.0
	var recoil_target := center - (direction * (20.0 + float(severity) * 4.0))
	_spawn_attack_impact_ring(center, recoil_target, ring_theme, 0.0, BATTLE_ATTACK_LAUNCH_FLARE_SECONDS, flare_size)

	var spark_count := 4 + severity
	for index in range(spark_count):
		var side := -1.0 if index % 2 == 0 else 1.0
		var lane := tangent * side * (5.0 + float(index / 2) * 4.0)
		var source := center + (lane * 0.18)
		var target := center - (direction * (22.0 + float(index) * 5.0)) + lane
		var size := 5.0 + float(severity) * 1.5
		_spawn_particle(source, target, fill_theme, 0.16 + float(index) * 0.012, index, 0.0, size)

func _spawn_attack_bullet(
	source: Vector2,
	control: Vector2,
	target: Vector2,
	ball_theme: String,
	glow_theme: String,
	streak_theme: String,
	duration: float,
	particle_size: float,
	severity: int
) -> void:
	var bullet := _make_attack_bullet(ball_theme, glow_theme, streak_theme, particle_size, severity)
	bullet.position = source - (bullet.size / 2.0)
	bullet.modulate = Color(1, 1, 1, 0)
	add_child(bullet)

	var motion_tween := bullet.create_tween()
	motion_tween.set_parallel(true)
	motion_tween.tween_method(
		_position_attack_bullet.bind(bullet, source, control, target),
		0.0,
		1.0,
		duration
	).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
	motion_tween.tween_property(
		bullet,
		"scale",
		Vector2(1.08 + float(severity) * 0.04, 0.92),
		duration * 0.55
	).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	motion_tween.finished.connect(bullet.queue_free)

	var fade_in_duration: float = min(duration * 0.14, 0.08)
	var fade_out_duration: float = min(duration * 0.20, 0.14)
	var fade_tween := bullet.create_tween()
	fade_tween.tween_property(bullet, "modulate", Color(1, 1, 1, 1), fade_in_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	fade_tween.tween_interval(max(0.01, duration - fade_in_duration - fade_out_duration))
	fade_tween.tween_property(bullet, "modulate", Color(1, 1, 1, 0), fade_out_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

func _make_attack_bullet(
	ball_theme: String,
	glow_theme: String,
	streak_theme: String,
	particle_size: float,
	severity: int
) -> Control:
	var bullet := Control.new()
	bullet.name = "AttackBullet"
	bullet.mouse_filter = Control.MOUSE_FILTER_IGNORE

	var bullet_length := particle_size * (2.2 + float(severity) * 0.28)
	var bullet_height: float = max(8.0, particle_size * 0.82)
	bullet.size = Vector2(bullet_length, bullet_height)
	bullet.pivot_offset = bullet.size / 2.0
	bullet.scale = Vector2(0.88, 0.88)

	var glow := _make_particle_panel_sized(glow_theme, Vector2(bullet_length * 1.32, bullet_height * 2.2))
	glow.name = "AttackBulletGlow"
	glow.position = (bullet.size - glow.size) / 2.0
	glow.modulate = Color(1, 1, 1, 0.82)
	bullet.add_child(glow)

	var streak := _make_particle_panel_sized(streak_theme, Vector2(bullet_length * 0.82, max(4.0, bullet_height * 0.42)))
	streak.name = "AttackBulletStreak"
	streak.position = Vector2(0, (bullet.size.y - streak.size.y) / 2.0)
	streak.modulate = Color(1, 1, 1, 0.78)
	bullet.add_child(streak)

	var core_size := Vector2(particle_size, particle_size)
	var core := _make_particle_panel_sized(ball_theme, core_size)
	core.name = "AttackBulletCore"
	core.position = Vector2(bullet_length - (core_size.x * 0.95), (bullet.size.y - core_size.y) / 2.0)
	bullet.add_child(core)

	return bullet

func _spawn_attack_path_particle(
	source: Vector2,
	control: Vector2,
	target: Vector2,
	theme_name: String,
	duration: float,
	delay: float,
	index: int,
	particle_size: float,
	tangent: Vector2,
	wobble: float,
	wobble_phase: float,
	is_lead: bool = false
) -> void:
	var particle := _make_particle_panel(theme_name, particle_size)
	particle.position = source - (particle.size / 2.0)
	particle.modulate = Color(1, 1, 1, 0)
	add_child(particle)

	var tween := particle.create_tween()
	if delay > 0.0:
		tween.tween_interval(delay)
	tween.set_parallel(true)
	tween.tween_method(
		_position_attack_particle.bind(particle, source, control, target, tangent, wobble, wobble_phase),
		0.0,
		1.0,
		duration
	).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
	tween.finished.connect(particle.queue_free)

	var fade_tween := particle.create_tween()
	if delay > 0.0:
		fade_tween.tween_interval(delay)
	var fade_in_duration: float = min(duration * 0.18, 0.12)
	fade_tween.tween_property(particle, "modulate", Color(1, 1, 1, 1), fade_in_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	if not is_lead:
		fade_tween.tween_property(particle, "modulate", Color(1, 1, 1, 0.35), max(0.01, duration - fade_in_duration)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

func _position_attack_bullet(
	progress: float,
	bullet: Control,
	source: Vector2,
	control: Vector2,
	target: Vector2
) -> void:
	if not is_instance_valid(bullet):
		return

	var t: float = clamp(progress, 0.0, 1.0)
	var accelerated := t * t
	var point := _quadratic_bezier_vec2(source, control, target, accelerated)
	var tangent := _quadratic_bezier_tangent_vec2(source, control, target, accelerated)
	if tangent.length() > 0.0:
		bullet.rotation = tangent.angle()
	bullet.position = point - (bullet.size / 2.0)

func _position_attack_particle(
	progress: float,
	particle: Control,
	source: Vector2,
	control: Vector2,
	target: Vector2,
	tangent: Vector2,
	wobble: float,
	wobble_phase: float
) -> void:
	if not is_instance_valid(particle):
		return

	var t: float = clamp(progress, 0.0, 1.0)
	var accelerated := t * t
	var point := _quadratic_bezier_vec2(source, control, target, accelerated)
	var wobble_offset := tangent * (sin(t * PI * 4.0 + wobble_phase) * wobble * sin(t * PI))
	particle.position = point - (particle.size / 2.0) + wobble_offset

func _quadratic_bezier_vec2(source: Vector2, control: Vector2, target: Vector2, progress: float) -> Vector2:
	var inverse := 1.0 - progress
	return (source * inverse * inverse) + (control * 2.0 * inverse * progress) + (target * progress * progress)

func _quadratic_bezier_tangent_vec2(source: Vector2, control: Vector2, target: Vector2, progress: float) -> Vector2:
	return ((control - source) * 2.0 * (1.0 - progress)) + ((target - control) * 2.0 * progress)

func _spawn_attack_impact_flash(
	center: Vector2,
	fill_theme: String,
	ring_theme: String,
	glow_theme: String,
	severity: int,
	delay: float,
	duration: float
) -> void:
	var flash_size := _attack_impact_radius(severity) * 1.25
	var flash := _make_particle_panel_sized(glow_theme, Vector2(flash_size, flash_size))
	flash.name = "AttackImpactFlash"
	flash.position = center - (flash.size / 2.0)
	flash.scale = Vector2(0.18, 0.18)
	flash.modulate = Color(1, 1, 1, 0)
	add_child(flash)

	var flash_tween := flash.create_tween()
	if delay > 0.0:
		flash_tween.tween_interval(delay)
	flash_tween.set_parallel(true)
	flash_tween.tween_property(flash, "scale", Vector2(1.28 + float(severity) * 0.12, 1.28 + float(severity) * 0.12), min(duration, BATTLE_ATTACK_IMPACT_FLASH_SECONDS)).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	flash_tween.tween_property(flash, "modulate", Color(1, 1, 1, 0.0), min(duration, BATTLE_ATTACK_IMPACT_FLASH_SECONDS)).from(Color(1, 1, 1, 0.74)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	flash_tween.finished.connect(flash.queue_free)

	var shock_size: float = max(20.0, _attack_impact_radius(severity) * 0.74)
	var shockwave := _make_particle_panel_sized(ring_theme, Vector2(shock_size, shock_size))
	shockwave.name = "AttackImpactShockwave"
	shockwave.position = center - (shockwave.size / 2.0)
	shockwave.scale = Vector2(0.32, 0.32)
	shockwave.modulate = Color(1, 1, 1, 0)
	add_child(shockwave)

	var shock_tween := shockwave.create_tween()
	if delay > 0.0:
		shock_tween.tween_interval(delay)
	shock_tween.set_parallel(true)
	shock_tween.tween_property(shockwave, "scale", Vector2(2.0 + float(severity) * 0.22, 2.0 + float(severity) * 0.22), duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	shock_tween.tween_property(shockwave, "modulate", Color(1, 1, 1, 0), duration).from(Color(1, 1, 1, 0.84)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	shock_tween.finished.connect(shockwave.queue_free)

	var spark_count := 5 + severity * 2
	for index in range(spark_count):
		var angle := (TAU * float(index)) / float(spark_count) + 0.18
		var distance := _attack_impact_radius(severity) * (0.42 + float(index % 3) * 0.12)
		var endpoint := center + Vector2(cos(angle), sin(angle)) * distance
		_spawn_particle(center, endpoint, fill_theme, min(0.22, duration), index, delay + float(index % 2) * 0.015, 4.0 + float(severity) * 1.5)

func _spawn_impact_rings(center: Vector2, ring_theme: String, severity: int, delay: float, duration: float) -> void:
	var ring_count := _attack_ring_count(severity)
	var radius := _attack_impact_radius(severity)
	var ring_size := _attack_lead_size(severity) * 0.5
	for index in range(ring_count):
		var angle := (TAU * float(index)) / float(ring_count) + 0.3
		var endpoint := center + Vector2(cos(angle), sin(angle)) * radius
		_spawn_attack_impact_ring(center, endpoint, ring_theme, delay, duration, ring_size)

func _spawn_attack_impact_ring(source: Vector2, target: Vector2, ring_theme: String, delay: float, duration: float, particle_size: float) -> void:
	var particle := _make_particle_panel(ring_theme, particle_size)
	particle.position = source - (particle.size / 2.0)
	particle.modulate = Color(1, 1, 1, 0)
	add_child(particle)

	var motion_tween := particle.create_tween()
	if delay > 0.0:
		motion_tween.tween_interval(delay)
	motion_tween.set_parallel(true)
	motion_tween.tween_property(particle, "position", target - (particle.size / 2.0), duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	motion_tween.tween_property(particle, "scale", Vector2(0.6, 0.6), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	motion_tween.finished.connect(particle.queue_free)

	var fade_tween := particle.create_tween()
	if delay > 0.0:
		fade_tween.tween_interval(delay)
	var fade_in_duration: float = min(0.05, duration * 0.3)
	fade_tween.tween_property(particle, "modulate", Color(1, 1, 1, 0.9), fade_in_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	fade_tween.tween_property(particle, "modulate", Color(1, 1, 1, 0), max(0.01, duration - fade_in_duration)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

func _make_particle_panel(theme_name: String, particle_size: float) -> Panel:
	return _make_particle_panel_sized(theme_name, Vector2(particle_size, particle_size))

func _make_particle_panel_sized(theme_name: String, particle_size: Vector2) -> Panel:
	var particle := Panel.new()
	particle.size = particle_size
	particle.pivot_offset = particle.size / 2.0
	particle.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_apply_panel_theme(particle, theme_name)
	return particle

func _spawn_particle(
	source: Vector2,
	target: Vector2,
	theme_name: String,
	duration: float,
	index: int,
	delay: float = 0.0,
	particle_size_override: float = -1.0
) -> void:
	var particle_size := particle_size_override if particle_size_override > 0.0 else 8.0 + float(index % 3) * 2.0
	var particle := _make_particle_panel(theme_name, particle_size)
	particle.position = source - (particle.size / 2.0)
	particle.scale = Vector2(0.72, 0.72)
	particle.modulate = Color(1, 1, 1, 0 if delay > 0.0 else 1)
	add_child(particle)

	var arc_lift := Vector2(0, -10.0 - float(index % 4) * 4.0)
	var motion_tween := particle.create_tween()
	if delay > 0.0:
		motion_tween.tween_interval(delay)
	motion_tween.set_parallel(true)
	motion_tween.tween_property(particle, "position", target - (particle.size / 2.0) + arc_lift, duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	motion_tween.tween_property(particle, "scale", Vector2(0.18, 0.18), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	motion_tween.finished.connect(particle.queue_free)

	var fade_tween := particle.create_tween()
	if delay > 0.0:
		fade_tween.tween_interval(delay)
	var fade_in_duration: float = min(0.04, duration * 0.25)
	if delay > 0.0:
		fade_tween.tween_property(particle, "modulate", Color(1, 1, 1, 1), fade_in_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	fade_tween.tween_property(particle, "modulate", Color(1, 1, 1, 0), max(0.01, duration - fade_in_duration)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

func _spawn_heal_stream(source: Vector2, target: Vector2, regen: int) -> void:
	var severity := _regen_severity(regen)
	var mote_count := _heal_mote_count(severity)
	var delta := target - source
	var direction := delta.normalized() if delta.length() > 0.0 else Vector2.UP
	var tangent := Vector2(-direction.y, direction.x)
	var control_base := (source + target) / 2.0 + Vector2(0, -48.0 - float(severity) * 16.0)

	_spawn_heal_pulse(target, severity)

	for index in range(mote_count):
		var side := -1.0 if index % 2 == 0 else 1.0
		var lane := tangent * side * (6.0 + float(index % 4) * 3.0)
		var start := source + (lane * 0.2) - (direction * float(index % 3) * 4.0)
		var control := control_base + (lane * 1.2) + Vector2(0, -float(index % 3) * 8.0)
		var end := target + (lane * 0.18) + Vector2(0, -float(index % 2) * 4.0)
		var delay := float(index) * BATTLE_HEAL_STREAM_STEP
		var duration: float = max(0.22, BATTLE_HEAL_STREAM_SECONDS - delay * 0.25)
		var particle_size := 6.0 + float(index % 3) * 2.0 + float(severity)
		var theme_name := THEME_PANEL_PARTICLE_GOLD_STRONG if index % 4 == 0 else THEME_PANEL_PARTICLE_GOLD
		_spawn_heal_mote(start, control, end, theme_name, particle_size, delay, duration)

func _spawn_heal_pulse(center: Vector2, severity: int) -> void:
	var pulse_size := 36.0 + float(severity) * 12.0
	var pulse := _make_particle_panel_sized(THEME_PANEL_HEAL_GLOW, Vector2(pulse_size, pulse_size))
	pulse.name = "HealPulse"
	pulse.position = center - (pulse.size / 2.0)
	pulse.scale = Vector2(0.32, 0.32)
	pulse.modulate = Color(1, 1, 1, 0)
	add_child(pulse)

	var pulse_tween := pulse.create_tween()
	pulse_tween.set_parallel(true)
	pulse_tween.tween_property(pulse, "scale", Vector2(1.46 + float(severity) * 0.12, 1.46 + float(severity) * 0.12), BATTLE_HEAL_PULSE_SECONDS).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	pulse_tween.tween_property(pulse, "modulate", Color(1, 1, 1, 0), BATTLE_HEAL_PULSE_SECONDS).from(Color(1, 1, 1, 0.74)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	pulse_tween.finished.connect(pulse.queue_free)

	var ring := _make_particle_panel_sized(THEME_PANEL_PARTICLE_RING_GOLD, Vector2(pulse_size * 0.72, pulse_size * 0.72))
	ring.name = "HealRing"
	ring.position = center - (ring.size / 2.0)
	ring.scale = Vector2(0.44, 0.44)
	ring.modulate = Color(1, 1, 1, 0)
	add_child(ring)

	var ring_tween := ring.create_tween()
	ring_tween.set_parallel(true)
	ring_tween.tween_property(ring, "scale", Vector2(1.8 + float(severity) * 0.16, 1.8 + float(severity) * 0.16), BATTLE_HEAL_PULSE_SECONDS * 0.92).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	ring_tween.tween_property(ring, "modulate", Color(1, 1, 1, 0), BATTLE_HEAL_PULSE_SECONDS * 0.92).from(Color(1, 1, 1, 0.86)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	ring_tween.finished.connect(ring.queue_free)

func _spawn_heal_mote(
	source: Vector2,
	control: Vector2,
	target: Vector2,
	theme_name: String,
	particle_size: float,
	delay: float,
	duration: float
) -> void:
	var mote := _make_particle_panel(theme_name, particle_size)
	mote.name = "HealMote"
	mote.position = source - (mote.size / 2.0)
	mote.scale = Vector2(0.72, 0.72)
	mote.modulate = Color(1, 1, 1, 0)
	add_child(mote)

	var motion_tween := mote.create_tween()
	if delay > 0.0:
		motion_tween.tween_interval(delay)
	motion_tween.set_parallel(true)
	motion_tween.tween_method(
		_position_heal_mote.bind(mote, source, control, target),
		0.0,
		1.0,
		duration
	).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	motion_tween.tween_property(mote, "scale", Vector2(0.38, 0.38), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	motion_tween.finished.connect(mote.queue_free)

	var fade_tween := mote.create_tween()
	if delay > 0.0:
		fade_tween.tween_interval(delay)
	var fade_in_duration: float = min(0.1, duration * 0.28)
	fade_tween.tween_property(mote, "modulate", Color(1, 1, 1, 1), fade_in_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	fade_tween.tween_property(mote, "modulate", Color(1, 1, 1, 0), max(0.01, duration - fade_in_duration)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

func _position_heal_mote(
	progress: float,
	mote: Control,
	source: Vector2,
	control: Vector2,
	target: Vector2
) -> void:
	if not is_instance_valid(mote):
		return

	var t: float = clamp(progress, 0.0, 1.0)
	var eased := 1.0 - ((1.0 - t) * (1.0 - t))
	var point := _quadratic_bezier_vec2(source, control, target, eased)
	mote.position = point - (mote.size / 2.0)

func _spawn_fault_ricochet(source: Vector2, target: Vector2, damage: int) -> void:
	var severity := _attack_severity(damage)
	var delta := target - source
	var direction := delta.normalized() if delta.length() > 0.0 else Vector2.DOWN
	var horizontal_direction := 1.0 if target.x >= source.x else -1.0
	var control := (source + target) / 2.0 + Vector2(28.0 * horizontal_direction, -40.0 - float(severity) * 8.0)
	var particle_size := Vector2(20.0 + float(severity) * 4.0, 6.0 + float(severity))
	var ricochet := _make_particle_panel_sized(THEME_PANEL_FAULT_SHARD, particle_size)
	ricochet.name = "FaultRicochet"
	ricochet.position = source - (ricochet.size / 2.0)
	ricochet.rotation = direction.angle()
	ricochet.modulate = Color(1, 1, 1, 0)
	add_child(ricochet)

	var motion_tween := ricochet.create_tween()
	motion_tween.set_parallel(true)
	motion_tween.tween_method(
		_position_fault_ricochet.bind(ricochet, source, control, target),
		0.0,
		1.0,
		BATTLE_FAULT_RICOCHET_SECONDS
	).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
	motion_tween.finished.connect(ricochet.queue_free)

	var fade_tween := ricochet.create_tween()
	fade_tween.tween_property(ricochet, "modulate", Color(1, 1, 1, 1), 0.06).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	fade_tween.tween_interval(BATTLE_FAULT_RICOCHET_SECONDS * 0.52)
	fade_tween.tween_property(ricochet, "modulate", Color(1, 1, 1, 0), BATTLE_FAULT_RICOCHET_SECONDS * 0.3).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

	var impact_tween := create_tween()
	impact_tween.tween_interval(BATTLE_FAULT_RICOCHET_SECONDS * 0.8)
	impact_tween.tween_callback(_spawn_fault_shards.bind(target, 6 + severity * 2))

func _position_fault_ricochet(
	progress: float,
	ricochet: Control,
	source: Vector2,
	control: Vector2,
	target: Vector2
) -> void:
	if not is_instance_valid(ricochet):
		return

	var t: float = clamp(progress, 0.0, 1.0)
	var accelerated := t * t
	var point := _quadratic_bezier_vec2(source, control, target, accelerated)
	var tangent := _quadratic_bezier_tangent_vec2(source, control, target, accelerated)
	if tangent.length() > 0.0:
		ricochet.rotation = tangent.angle()
	ricochet.position = point - (ricochet.size / 2.0)

func _spawn_fault_shards(center: Vector2, count: int = 7) -> void:
	var glow_size := 34.0
	var glow := _make_particle_panel_sized(THEME_PANEL_FAULT_GLOW, Vector2(glow_size, glow_size))
	glow.name = "FaultGlow"
	glow.position = center - (glow.size / 2.0)
	glow.scale = Vector2(0.28, 0.28)
	glow.modulate = Color(1, 1, 1, 0)
	add_child(glow)

	var glow_tween := glow.create_tween()
	glow_tween.set_parallel(true)
	glow_tween.tween_property(glow, "scale", Vector2(1.5, 1.5), 0.22).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	glow_tween.tween_property(glow, "modulate", Color(1, 1, 1, 0), 0.22).from(Color(1, 1, 1, 0.68)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	glow_tween.finished.connect(glow.queue_free)

	for index in range(count):
		var angle := (TAU * float(index)) / float(count) + 0.18
		var distance := 18.0 + float(index % 3) * 7.0
		var endpoint := center + Vector2(cos(angle), sin(angle)) * distance
		_spawn_fault_shard(center, endpoint, index)

func _spawn_fault_shard(source: Vector2, target: Vector2, index: int) -> void:
	var shard_size := Vector2(10.0 + float(index % 2) * 4.0, 4.0)
	var shard := _make_particle_panel_sized(THEME_PANEL_FAULT_SHARD, shard_size)
	shard.name = "FaultShard"
	shard.position = source - (shard.size / 2.0)
	shard.rotation = (target - source).angle()
	shard.modulate = Color(1, 1, 1, 0)
	add_child(shard)

	var duration := 0.24 + float(index % 2) * 0.04
	var tween := shard.create_tween()
	tween.set_parallel(true)
	tween.tween_property(shard, "position", target - (shard.size / 2.0), duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(shard, "scale", Vector2(0.32, 0.32), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.tween_property(shard, "modulate", Color(1, 1, 1, 0), duration).from(Color(1, 1, 1, 0.94)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(shard.queue_free)

func _spawn_perfect_halo(center: Vector2) -> void:
	var halo_size := 58.0
	var halo := _make_particle_panel_sized(THEME_PANEL_PARTICLE_RING_GOLD, Vector2(halo_size, halo_size))
	halo.name = "PerfectHalo"
	halo.position = center - (halo.size / 2.0)
	halo.scale = Vector2(0.36, 0.36)
	halo.modulate = Color(1, 1, 1, 0)
	add_child(halo)

	var halo_tween := halo.create_tween()
	halo_tween.set_parallel(true)
	halo_tween.tween_property(halo, "scale", Vector2(2.1, 2.1), BATTLE_PERFECT_HALO_SECONDS).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	halo_tween.tween_property(halo, "modulate", Color(1, 1, 1, 0), BATTLE_PERFECT_HALO_SECONDS).from(Color(1, 1, 1, 0.88)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	halo_tween.finished.connect(halo.queue_free)

	for index in range(8):
		var angle := (TAU * float(index)) / 8.0
		_spawn_perfect_orbit_mote(center, angle, index)

func _spawn_perfect_orbit_mote(center: Vector2, angle: float, index: int) -> void:
	var mote_size := 6.0 + float(index % 2) * 2.0
	var mote := _make_particle_panel(THEME_PANEL_PARTICLE_GOLD_STRONG, mote_size)
	mote.name = "PerfectOrbitMote"
	mote.position = center - (mote.size / 2.0)
	mote.modulate = Color(1, 1, 1, 0)
	add_child(mote)

	var start_radius := 18.0
	var end_radius := 54.0 + float(index % 3) * 4.0
	var duration := BATTLE_PERFECT_HALO_SECONDS * (0.72 + float(index % 2) * 0.08)
	var tween := mote.create_tween()
	tween.set_parallel(true)
	tween.tween_method(
		_position_perfect_orbit_mote.bind(mote, center, angle, start_radius, end_radius),
		0.0,
		1.0,
		duration
	).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(mote, "scale", Vector2(0.42, 0.42), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.tween_property(mote, "modulate", Color(1, 1, 1, 0), duration).from(Color(1, 1, 1, 1)).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(mote.queue_free)

func _position_perfect_orbit_mote(
	progress: float,
	mote: Control,
	center: Vector2,
	angle: float,
	start_radius: float,
	end_radius: float
) -> void:
	if not is_instance_valid(mote):
		return

	var t: float = clamp(progress, 0.0, 1.0)
	var current_angle: float = angle + (t * 1.15)
	var radius: float = start_radius + ((end_radius - start_radius) * t)
	var point: Vector2 = center + Vector2(cos(current_angle), sin(current_angle)) * radius
	mote.position = point - (mote.size / 2.0)

func _regen_severity(regen: int) -> int:
	if regen > 20:
		return 3

	if regen > 12:
		return 2

	if regen > 5:
		return 1

	return 0

func _heal_mote_count(severity: int) -> int:
	match severity:
		3:
			return 12
		2:
			return 9
		1:
			return 7
		_:
			return 5

func _attack_trail_count(severity: int) -> int:
	match severity:
		3:
			return 11
		2:
			return 8
		1:
			return 5
		_:
			return 3

func _attack_lead_size(severity: int) -> float:
	match severity:
		3:
			return 30.0
		2:
			return 24.0
		1:
			return 18.0
		_:
			return 14.0

func _attack_trail_size(severity: int) -> float:
	match severity:
		3:
			return 12.0
		2:
			return 10.0
		1:
			return 8.0
		_:
			return 6.0

func _attack_spread_scale(severity: int) -> float:
	match severity:
		3:
			return 2.0
		2:
			return 1.5
		1:
			return 1.0
		_:
			return 0.6

func _attack_duration(severity: int) -> float:
	match severity:
		3:
			return 0.72
		2:
			return 0.84
		1:
			return 0.96
		_:
			return 1.08

func _attack_ring_count(severity: int) -> int:
	match severity:
		3:
			return 7
		2:
			return 5
		1:
			return 4
		_:
			return 3

func _attack_impact_radius(severity: int) -> float:
	match severity:
		3:
			return 54.0
		2:
			return 44.0
		1:
			return 34.0
		_:
			return 24.0

func _battle_event_hp_for_player(event: Dictionary, player_id: String) -> int:
	if player_id == "":
		return -1

	if str(event.get("sourcePlayerId", "")) == player_id and event.has("sourceHp"):
		return int(event["sourceHp"])
	if str(event.get("targetPlayerId", "")) == player_id and event.has("targetHp"):
		return int(event["targetHp"])
	if str(event.get("winnerPlayerId", "")) == player_id and event.has("winnerHp"):
		return int(event["winnerHp"])
	if str(event.get("loserPlayerId", "")) == player_id and event.has("loserHp"):
		return int(event["loserHp"])

	return -1

func _apply_battle_display_hp(player_id: String, hp: int, event_id: int) -> bool:
	if event_id < battle_display_event_id:
		return false

	if player_id == _battle_local_player_id():
		if battle_display_player_hp == hp:
			return true
		battle_display_player_hp = hp
	elif player_id == _battle_opponent_player_id():
		if battle_display_bot_hp == hp:
			return true
		battle_display_bot_hp = hp
	else:
		return false

	battle_display_event_id = max(battle_display_event_id, event_id)
	_render_battle()
	return true

func _apply_battle_event_display_hp(event_id: int, event: Dictionary, player_id: String) -> bool:
	var hp := _battle_event_hp_for_player(event, player_id)
	if hp < 0:
		return false

	var applied := _apply_battle_display_hp(player_id, hp, event_id)
	if applied and str(event.get("type", "")) == "finish" and hp == 0:
		_schedule_battle_result_reveal(event_id, BATTLE_HP_ZERO_HOLD_SECONDS)
	return applied

func _battle_hp_hit_callback(event: Dictionary, player_id: String, damage: int) -> Callable:
	if damage <= 0 or player_id == "":
		return Callable()

	var event_id := int(event.get("id", 0))
	return _apply_delayed_battle_hp_hit.bind(event_id, event.duplicate(true), player_id, damage)

func _apply_delayed_battle_hp_hit(event_id: int, event: Dictionary, player_id: String, damage: int) -> void:
	if event_id < battle_display_event_id:
		return

	if not _apply_battle_event_display_hp(event_id, event, player_id):
		return

	_play_hp_hit(_hp_bar_for_player(player_id), damage)

func _schedule_battle_result_reveal(event_id: int, delay: float) -> void:
	var tween := create_tween()
	if delay > 0.0:
		tween.tween_interval(delay)
	tween.tween_callback(_reveal_battle_result.bind(event_id))

func _reveal_battle_result(event_id: int) -> void:
	var last_event: Dictionary = battle_snapshot.get("lastEvent", {})
	if last_event.has("id") and int(last_event["id"]) != event_id:
		return

	battle_result_reveal_event_id = max(battle_result_reveal_event_id, event_id)
	_render_battle()

func _play_battle_event_feedback(event: Dictionary) -> void:
	if event.is_empty():
		return

	var event_type := str(event.get("type", ""))
	var event_cause := str(event.get("cause", ""))
	var source_id := str(event.get("sourcePlayerId", ""))
	var damage := int(event.get("damage", 0))
	var regen := int(event.get("regen", 0))
	var perfect_solve: bool = event.get("perfectSolve", false) == true
	var event_id := int(event.get("id", 0))

	_apply_battle_event_display_hp(event_id, event, source_id)

	if event_type == "self-hit" or event_cause == "self-hit":
		_play_source_fault(source_id)
		_play_hp_hit(_hp_bar_for_player(source_id), damage)
		_spawn_fault_ricochet(_battle_source_anchor(source_id), _battle_hp_anchor(source_id), damage)
		if source_id == _battle_local_player_id():
			_play_target_fault()
		var released_damage := int(event.get("releasedDamage", 0))
		var released_target_id := str(event.get("targetPlayerId", ""))
		if released_damage > 0 and released_target_id != "":
			_play_attack_launch(source_id, released_damage)
			_spawn_attack_particles(
				_battle_source_anchor(source_id),
				_battle_hp_anchor(released_target_id),
				_particle_fill_theme_for_player(source_id),
				_particle_ring_theme_for_player(source_id),
				_particle_ball_theme_for_player(source_id),
				released_damage,
				_battle_hp_hit_callback(event, released_target_id, released_damage)
			)
		return

	var target_id := str(event.get("targetPlayerId", event.get("loserPlayerId", "")))
	if damage > 0 and target_id != "":
		_play_attack_launch(source_id, damage)
		_spawn_attack_particles(
			_battle_source_anchor(source_id),
			_battle_hp_anchor(target_id),
			_particle_fill_theme_for_player(source_id),
			_particle_ring_theme_for_player(source_id),
			_particle_ball_theme_for_player(source_id),
			damage,
			_battle_hp_hit_callback(event, target_id, damage)
		)

	if perfect_solve:
		_play_perfect_burst(source_id)

	if regen > 0:
		_play_hp_regen(_hp_bar_for_player(source_id), regen, _battle_source_anchor(source_id))

func _play_attack_launch(source_id: String, damage: int) -> void:
	var severity := _attack_severity(damage)
	var source_control = _battle_source_control(source_id)
	if is_instance_valid(source_control):
		_bump_control(source_control, 1.08 + float(severity) * 0.03, 0.14)
		_flash_control(source_control, _player_accent_color(source_id), 0.22)

	_spawn_radial_particles(
		_battle_source_anchor(source_id),
		_particle_fill_theme_for_player(source_id),
		_particle_ring_theme_for_player(source_id),
		5 + severity * 2
	)

func _play_source_fault(source_id: String) -> void:
	var source_control = _battle_source_control(source_id)
	if is_instance_valid(source_control):
		_shake_control(source_control, 10.0)
		_flash_control(source_control, COLOR_DANGER, 0.34)

	_spawn_radial_particles(
		_battle_source_anchor(source_id),
		THEME_PANEL_PARTICLE_DANGER,
		THEME_PANEL_PARTICLE_RING_DANGER,
		7
	)
	_spawn_fault_shards(_battle_source_anchor(source_id), 5)

func _play_perfect_burst(source_id: String) -> void:
	var source_control = _battle_source_control(source_id)
	if is_instance_valid(source_control):
		_bump_control(source_control, 1.14, 0.2)
		_flash_control(source_control, COLOR_GOLD, 0.36)
		if source_control == target_blob_panel:
			_pulse_panel_theme(target_blob_panel, THEME_PANEL_TARGET_GOLD, THEME_PANEL_TARGET, 0.48)

	var center := _battle_source_anchor(source_id)
	_spawn_damage_pop("PERFECT", center + Vector2(-48, -56), COLOR_GOLD)
	_spawn_perfect_halo(center)
	_spawn_radial_particles(center, THEME_PANEL_PARTICLE_GOLD, THEME_PANEL_PARTICLE_RING_GOLD, 12)

func _bump_control(control: Control, peak_scale: float, seconds: float) -> void:
	if not is_instance_valid(control):
		return

	control.pivot_offset = control.size / 2.0
	var tween := _make_control_tween(control, "bump")
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_OUT)
	tween.tween_property(control, "scale", Vector2(peak_scale, peak_scale), seconds * 0.45)
	tween.tween_property(control, "scale", Vector2.ONE, seconds * 0.55)

func _battle_source_control(player_id: String):
	return enemy_avatar_panel if player_id == _battle_opponent_player_id() else target_blob_panel

func _player_accent_color(player_id: String) -> Color:
	return COLOR_SECONDARY if player_id == _battle_opponent_player_id() else COLOR_PRIMARY_STRONG

func _hp_bar_for_player(player_id: String) -> ProgressBar:
	return enemy_hp_bar if player_id == _battle_opponent_player_id() else player_hp_bar

func _battle_hp_anchor(player_id: String) -> Vector2:
	var bar := _hp_bar_for_player(player_id)
	return _hp_bar_center(bar)

func _battle_source_anchor(player_id: String) -> Vector2:
	var viewport_size := get_viewport_rect().size
	if player_id == _battle_opponent_player_id():
		return Vector2(viewport_size.x / 2.0, 174.0)
	return _target_center()

func _particle_fill_theme_for_player(player_id: String) -> String:
	return THEME_PANEL_PARTICLE_SECONDARY if player_id == _battle_opponent_player_id() else THEME_PANEL_PARTICLE_PRIMARY

func _particle_ring_theme_for_player(player_id: String) -> String:
	return THEME_PANEL_PARTICLE_RING_SECONDARY if player_id == _battle_opponent_player_id() else THEME_PANEL_PARTICLE_RING_PRIMARY

func _particle_ball_theme_for_player(player_id: String) -> String:
	return THEME_PANEL_ATTACK_BALL_SECONDARY if player_id == _battle_opponent_player_id() else THEME_PANEL_ATTACK_BALL_PRIMARY

func _attack_glow_theme_for_ball(ball_theme: String) -> String:
	return THEME_PANEL_ATTACK_GLOW_SECONDARY if ball_theme == THEME_PANEL_ATTACK_BALL_SECONDARY else THEME_PANEL_ATTACK_GLOW_PRIMARY

func _attack_streak_theme_for_ball(ball_theme: String) -> String:
	return THEME_PANEL_ATTACK_STREAK_SECONDARY if ball_theme == THEME_PANEL_ATTACK_BALL_SECONDARY else THEME_PANEL_ATTACK_STREAK_PRIMARY

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

func _add_page_trophy_icon(parent: Control) -> void:
	_set_or_add_texture_icon(parent, "trophy", 64, COLOR_TEXT_INVERSE)

func _set_or_add_texture_icon(parent: Control, kind: String, icon_size: int, color: Color) -> void:
	var texture := _get_icon_texture(kind, color, icon_size)
	if parent is Button:
		var button := parent as Button
		button.icon = texture
		button.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		button.vertical_icon_alignment = VERTICAL_ALIGNMENT_CENTER
		button.expand_icon = false
		button.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
		return

	var texture_rect := TextureRect.new()
	texture_rect.texture = texture
	texture_rect.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
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
		image.resize(size, size, Image.INTERPOLATE_LANCZOS)
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
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = true
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
	style.anti_aliasing = true
	style.corner_radius_top_left = radius
	style.corner_radius_top_right = radius
	style.corner_radius_bottom_right = radius
	style.corner_radius_bottom_left = radius
	return style

func _make_dialog_panel_style(border_color: Color = COLOR_PRIMARY) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = COLOR_SURFACE
	style.anti_aliasing = true
	style.border_color = border_color
	style.border_width_left = PIXEL_BORDER
	style.border_width_top = PIXEL_BORDER
	style.border_width_right = PIXEL_BORDER
	style.border_width_bottom = PIXEL_BORDER
	style.corner_radius_top_left = RADIUS_PANEL
	style.corner_radius_top_right = RADIUS_PANEL
	style.corner_radius_bottom_right = RADIUS_PANEL
	style.corner_radius_bottom_left = RADIUS_PANEL
	return style

func _make_tutorial_panel_style() -> StyleBoxFlat:
	var style := _make_panel_style(COLOR_SURFACE)
	style.border_width_left = 0
	style.border_width_top = 0
	style.border_width_right = 0
	style.border_width_bottom = 0
	return style

func _make_transparent_button_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color.TRANSPARENT
	return style

func _alpha_color(color: Color, alpha: float) -> Color:
	return Color(color.r, color.g, color.b, alpha)

func _make_circle_style(color: Color, radius: float, border_color: Color, border_width: int) -> StyleBox:
	return _make_pixel_circle_style(color, border_color, border_width)

func _make_capsule_style(
	color: Color,
	border_color: Color = Color.TRANSPARENT,
	border_width: int = 0
) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = true
	style.corner_radius_top_left = RADIUS_PILL
	style.corner_radius_top_right = RADIUS_PILL
	style.corner_radius_bottom_right = RADIUS_PILL
	style.corner_radius_bottom_left = RADIUS_PILL
	style.border_color = border_color
	style.border_width_left = border_width
	style.border_width_top = border_width
	style.border_width_right = border_width
	style.border_width_bottom = border_width
	return style

func _make_pixel_box_style(
	color: Color,
	border_color: Color,
	border_width: int,
	radius: int = RADIUS_BUTTON,
	with_shadow: bool = false
) -> StyleBox:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = true
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
) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.anti_aliasing = true
	style.corner_radius_top_left = RADIUS_PILL
	style.corner_radius_top_right = RADIUS_PILL
	style.corner_radius_bottom_right = RADIUS_PILL
	style.corner_radius_bottom_left = RADIUS_PILL
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
	style.anti_aliasing = true
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

func _make_queue_panel() -> HBoxContainer:
	var panel := HBoxContainer.new()
	panel.alignment = BoxContainer.ALIGNMENT_CENTER
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_theme_constant_override("separation", int(QUEUE_CHIP_GAP))
	return panel

func _render_queue_panel(numbers: Array) -> void:
	if not is_instance_valid(queue_label):
		return

	for child in queue_label.get_children():
		child.queue_free()

	var display_numbers := numbers.duplicate()
	var has_pending_input := not keyboard_buffered_prime_input.is_empty()
	if has_pending_input:
		display_numbers.append(keyboard_buffered_prime_input)

	queue_label.visible = true
	queue_label.modulate.a = 1.0 if not display_numbers.is_empty() else 0.46
	if display_numbers.is_empty():
		return

	for index in range(display_numbers.size()):
		var is_pending := has_pending_input and index == display_numbers.size() - 1
		queue_label.add_child(_make_queue_chip(str(display_numbers[index]), is_pending))

		if index < display_numbers.size() - 1:
			queue_label.add_child(_make_queue_separator())

func _make_queue_chip(text: String, is_pending: bool) -> Panel:
	var chip := Panel.new()
	chip.custom_minimum_size = Vector2(QUEUE_CHIP_SIZE, QUEUE_CHIP_SIZE)
	chip.mouse_filter = Control.MOUSE_FILTER_IGNORE
	chip.modulate.a = 0.5 if is_pending else 1.0
	_apply_panel_theme(chip, THEME_PANEL_PARTICLE_PRIMARY)

	var label := _make_absolute_label(text, 12, COLOR_TEXT_INVERSE, 700)
	label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	chip.add_child(label)
	return chip

func _make_queue_separator() -> Label:
	var separator := _make_absolute_label("×", 12, COLOR_INK_SOFT, 600)
	separator.custom_minimum_size = Vector2(QUEUE_SEPARATOR_WIDTH, QUEUE_CHIP_SIZE)
	return separator
