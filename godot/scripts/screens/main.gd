extends Control

const Game := preload("res://scripts/core/game.gd")
const BattleRoom := preload("res://scripts/core/multiplayer_room.gd")
const SupabaseClient := preload("res://scripts/core/supabase_client.gd")

const BEST_SCORE_PATH := "user://best_score.json"
const TUTORIAL_COMPLETE_PATH := "user://tutorial_complete.txt"
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
const APP_VERSION_LABEL := "v0.0.0"
const SOLO_DURATION_SECONDS := 60.0
const SOLO_COMBO_STEP_DELAY_SECONDS := 0.14
const MULTIPLAYER_COMBO_STEP_DELAY_SECONDS := 0.22
const SOLO_SEED_PREFIX := "godot-mobile"
const SOLO_SCORE_REDESIGN_AT := "2026-04-07T10:48:36.000Z"
const HISTORIC_SOLO_SCORE_FACTOR := 0.5
const HISTORIC_SOLO_SCORE_CAP := 600
const DESKTOP_PRIME_KEYBINDS := ["r", "t", "y", "f", "g", "h", "v", "b", "n"]
const DESKTOP_BACKSPACE_KEY := "u"
const DESKTOP_SUBMIT_KEY := "j"
const REALTIME_LOBBY_TOPIC := "realtime:atomize:lobby"
const REALTIME_HEARTBEAT_SECONDS := 25.0
const REALTIME_RECONNECT_SECONDS := 6.0
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
const THEME_PANEL_DIALOG_DEFEAT := "AtomPanelDialogDefeat"
const THEME_PANEL_DIALOG_VICTORY := "AtomPanelDialogVictory"
const THEME_PANEL_TARGET := "AtomPanelTarget"
const THEME_PANEL_TARGET_DANGER := "AtomPanelTargetDanger"
const THEME_PANEL_TARGET_GOLD := "AtomPanelTargetGold"
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
var leaderboard_entries: Array[Dictionary] = []
var leaderboard_status_text := ""
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
var icon_texture_cache: Dictionary = {}
var pixel_circle_texture_cache: Dictionary = {}
var active_control_tweens: Dictionary = {}
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
var factors_label: Label
var queue_label: Label
var result_label: Label
var leaderboard_rows_root: VBoxContainer
var leaderboard_status_label: Label
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

func _ready() -> void:
	_ensure_audio_buses()
	_build_sfx_pool()
	supabase_client = SupabaseClient.new()
	realtime_player_id = "godot-%s" % Time.get_ticks_usec()
	battle_player_name = _create_guest_display_name()
	_build_network_nodes()
	theme = _make_app_theme()
	best_score = _load_best_score()
	best_combo = _load_best_combo()
	needs_tutorial = not _is_tutorial_complete()
	match _get_requested_screen():
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

func _handle_realtime_packet(text: String) -> void:
	var parsed = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return

	var event_name := str(parsed.get("event", ""))
	var payload = parsed.get("payload", {})
	if event_name == "phx_reply":
		_handle_realtime_reply(parsed, payload)
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
	if ref != realtime_join_ref or typeof(payload) != TYPE_DICTIONARY:
		return

	if str(payload.get("status", "")) == "ok":
		realtime_joined = true
		realtime_status_text = "No players online"
		_track_realtime_presence()
	else:
		realtime_joined = false
		realtime_status_text = "Realtime unavailable"

	_render_battle_online_players()

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
	if screen == Screen.BATTLE_READY or screen == Screen.BATTLE_GAME:
		return "in-game"

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
			var bot = BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)
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
		get_viewport().set_input_as_handled()
		return

	if _handle_game_keyboard_input(event):
		get_viewport().set_input_as_handled()

func _handle_game_keyboard_input(event: InputEvent) -> bool:
	if screen != Screen.SOLO and screen != Screen.BATTLE_GAME:
		return false

	if not (event is InputEventKey):
		return false

	var key_event := event as InputEventKey
	if key_event.alt_pressed or key_event.ctrl_pressed or key_event.meta_pressed:
		return false

	var key_text := _keyboard_event_text(key_event)
	if key_text == "backspace":
		if _is_game_keyboard_busy() or (keyboard_buffered_prime_input.is_empty() and _active_prime_queue_size() == 0):
			return false

		_handle_keyboard_backspace()
		return true

	if key_text == " " or key_text == "space":
		_handle_keyboard_space()
		return true

	if key_text == "enter" or key_text == "kp enter":
		_handle_keyboard_submit()
		return true

	if key_event.echo:
		return false

	var direct_prime := _desktop_prime_from_key(key_text)
	if direct_prime != 0:
		_handle_keyboard_prime(direct_prime)
		return true

	if key_text == DESKTOP_BACKSPACE_KEY:
		if _is_game_keyboard_busy() or (keyboard_buffered_prime_input.is_empty() and _active_prime_queue_size() == 0):
			return false

		_handle_keyboard_backspace()
		return true

	if key_text == DESKTOP_SUBMIT_KEY:
		_handle_keyboard_submit()
		return true

	if key_text.length() == 1 and key_text >= "1" and key_text <= "9":
		_handle_keyboard_digit(key_text)
		return true

	return false

func _keyboard_event_text(event: InputEventKey) -> String:
	if event.keycode == KEY_BACKSPACE:
		return "backspace"

	if event.keycode == KEY_ENTER or event.keycode == KEY_KP_ENTER:
		return "enter"

	if event.keycode == KEY_SPACE:
		return " "

	if event.unicode > 0:
		return String.chr(event.unicode).to_lower()

	return OS.get_keycode_string(event.keycode).to_lower()

func _desktop_prime_from_key(key_text: String) -> int:
	var key_index := DESKTOP_PRIME_KEYBINDS.find(key_text)
	if key_index == -1:
		return 0

	var playable_primes := Game.get_playable_stage_primes()
	if key_index >= playable_primes.size():
		return 0

	return int(playable_primes[key_index])

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
	screen = Screen.BATTLE_PICKER
	_build_battle_picker_layout()
	_connect_realtime_lobby()

func _start_battle_ready() -> void:
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
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_READY
	_build_battle_ready_layout()
	_track_realtime_presence()

func _start_battle_game() -> void:
	if battle_snapshot.is_empty():
		_start_battle_ready()
		return

	battle_snapshot = BattleRoom.set_player_ready(battle_snapshot, BATTLE_PLAYER_ID, true)
	battle_snapshot = BattleRoom.begin_room_match(battle_snapshot)
	battle_prime_queue.clear()
	_clear_battle_resolution()
	battle_bot_elapsed = 0.0
	battle_result_text = ""
	screen = Screen.BATTLE_GAME
	_build_battle_game_layout()
	_render_battle()
	_track_realtime_presence()

func _clear_battle_resolution() -> void:
	battle_resolving_queue.clear()
	battle_resolving_player_id = ""
	battle_submitted_queue_length = 0
	battle_resolve_elapsed = 0.0
	battle_perfect_solve_eligible = false

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

	var version_label := _make_absolute_label(APP_VERSION_LABEL, 13, COLOR_TEXT_INVERSE_SOFT, 600)
	version_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	version_label.position = Vector2(14.0, 14.0)
	version_label.size = Vector2(96.0, 24.0)
	add_child(version_label)

	var hero_height: float = min(384.0, viewport_size.y * 0.48)
	var hero_diameter: float = max(viewport_size.x * 1.6, viewport_size.y * 1.3)
	var hero := Panel.new()
	hero.position = Vector2((viewport_size.x - hero_diameter) / 2.0, (viewport_size.y * 0.5) - hero_diameter)
	hero.size = Vector2(hero_diameter, hero_diameter)
	_apply_panel_theme(hero, THEME_PANEL_HERO_ORB)
	add_child(hero)

	if not needs_tutorial:
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

	if needs_tutorial:
		var play_button := _make_home_blob_button("Play", _start_tutorial_game, COLOR_PRIMARY_STRONG, "help")
		play_button.position = Vector2((viewport_size.x - HOME_BLOB_SIZE) / 2.0, blob_top)
		add_child(play_button)
		return

	var solo_button := _make_home_blob_button("Solo", _start_solo_pregame, COLOR_PRIMARY_STRONG, "timer")
	solo_button.position = Vector2(blob_left, blob_top)
	add_child(solo_button)

	var battle_button := _make_home_blob_button("Battle", _start_battle_picker, COLOR_SECONDARY, "battle")
	battle_button.position = Vector2(blob_left + HOME_BLOB_SIZE + HOME_BLOB_GAP, blob_top)
	add_child(battle_button)

func _build_home_dropdown(position: Vector2) -> void:
	if not home_menu_open:
		return

	var dropdown := VBoxContainer.new()
	dropdown.position = position
	dropdown.size = Vector2(128, 156)
	dropdown.add_theme_constant_override("separation", 8)
	add_child(dropdown)

	var leaderboard_button := _make_dropdown_button("Leaderboard", _start_leaderboard)
	dropdown.add_child(leaderboard_button)

	var help_button := _make_dropdown_button("Tutorial", _start_tutorial_game)
	dropdown.add_child(help_button)

	var reset_button := _make_dropdown_button("Reset Best", _reset_best_score)
	dropdown.add_child(reset_button)

func _build_leaderboard_layout() -> void:
	_clear_screen()

	var viewport_size := get_viewport_rect().size

	var background := ColorRect.new()
	background.color = COLOR_PAGE_BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	_build_page_header("Leaderboard", "Top players.", "trophy")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0

	leaderboard_status_label = _make_absolute_label("", 13, COLOR_INK_SOFT, 700)
	leaderboard_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	leaderboard_status_label.position = Vector2(body_left, 262)
	leaderboard_status_label.size = Vector2(body_width, 24)
	add_child(leaderboard_status_label)

	leaderboard_rows_root = VBoxContainer.new()
	leaderboard_rows_root.position = Vector2(body_left, 304)
	leaderboard_rows_root.size = Vector2(body_width, 480)
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
	leaderboard_status_text = "" if not leaderboard_entries.is_empty() else "No records found"
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
	leaderboard_status_text = "" if not leaderboard_entries.is_empty() else "No records found"
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
	if not is_instance_valid(leaderboard_rows_root) or not is_instance_valid(leaderboard_status_label):
		return

	for child in leaderboard_rows_root.get_children():
		child.queue_free()

	leaderboard_status_label.text = leaderboard_status_text
	leaderboard_status_label.visible = not leaderboard_status_text.is_empty()

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

	match icon_kind:
		"timer":
			_add_page_timer_icon(icon_slot)
		"trophy":
			_add_page_trophy_icon(icon_slot)
		_:
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

	_build_page_header("Solo", "Beat the clock.", "timer")

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

	_build_page_header("Battle", "Outsmart them.", "battle")

	var body_width: float = min(viewport_size.x - 48.0, 352.0)
	var body_left: float = (viewport_size.x - body_width) / 2.0

	_add_battle_section_title(body_left, 262, "cpu", "CPU Training")
	_add_battle_picker_row(body_left, 300, body_width, "bot", BATTLE_BOT_NAME, "Play", false, _start_battle_ready)

	_add_battle_section_title(body_left, 384, "users", "Online Players")
	_add_battle_online_state(body_left, 422, body_width)

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

	var status := Button.new()
	status.text = _format_realtime_status(str(player.get("status", "lobby")))
	status.disabled = true
	_apply_button_theme(status, THEME_BUTTON_SMALL_SURFACE)
	status.position = Vector2(width - 88.0, 14.0)
	status.size = Vector2(88, 36)
	row.add_child(status)

func _format_realtime_status(status: String) -> String:
	match status:
		"in-game":
			return "In Game"
		"in-team":
			return "In Team"
		_:
			return "Lobby"

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
	_add_ready_badge(bot_avatar, 20)
	add_child(bot_avatar)

	var bot_label := _make_absolute_label(BATTLE_BOT_NAME, 15, COLOR_TEXT_INVERSE, 800)
	bot_label.position = Vector2(0, 354)
	bot_label.size = Vector2(viewport_size.x, 24)
	add_child(bot_label)

	var versus := _make_absolute_label("VS", 46, COLOR_TEXT_INVERSE, 900)
	versus.position = Vector2(0, 394)
	versus.size = Vector2(viewport_size.x, 56)
	add_child(versus)

	var player_initial := battle_player_name.substr(0, 1).to_upper()
	if player_initial.is_empty():
		player_initial = BATTLE_GUEST_NAME.substr(0, 1)

	var player_avatar := _make_avatar_initial_circle(80, COLOR_PRIMARY_STRONG, player_initial, 20)
	player_avatar.position = Vector2((viewport_size.x - 80.0) / 2.0, 470)
	add_child(player_avatar)

	var player_label := _make_absolute_label(battle_player_name, 15, COLOR_TEXT_INVERSE, 800)
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
	enemy_avatar_panel = bot_avatar

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

	var player_name_text := "You" if tutorial_active else battle_player_name
	var player_name := _make_absolute_label(player_name_text, 15, COLOR_INK, 800)
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

func _clear_screen() -> void:
	_clear_control_tweens()
	_clear_keyboard_prime_input(false)
	for child in get_children():
		if child == sfx_pool_root or child == network_root:
			continue

		child.queue_free()
	target_blob_panel = null
	enemy_avatar_panel = null

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

	score_label = _make_absolute_label("", 16, COLOR_PRIMARY, 900)
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	score_label.position = Vector2(viewport_size.x - 112.0, 16)
	score_label.size = Vector2(70, 24)
	add_child(score_label)

	score_unit_label = _make_absolute_label("pt", 13, COLOR_INK_SOFT, 600)
	score_unit_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	score_unit_label.position = Vector2(viewport_size.x - 38.0, 16)
	score_unit_label.size = Vector2(22, 24)
	add_child(score_unit_label)

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

	var hero_label := _make_absolute_label("Score", 12, COLOR_INK_SOFT, 700)
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
	var exp_gained := int(floor(float(solo_state["score"]) / 10.0))
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
	factors_label.text = "%s left" % stage["remainingFactors"].size()
	factors_label.visible = true
	var queue_text := _format_queue_label(prime_queue)
	queue_label.text = queue_text
	queue_label.modulate.a = 1.0 if not queue_text.is_empty() else 0.46
	queue_label.visible = true
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
	stage_label.text = "Stage %s" % [int(player["stageIndex"]) + 1]
	target_label.text = str(player["stage"]["remainingValue"])
	var queue_text := _format_queue_label(battle_prime_queue)
	queue_label.text = queue_text
	queue_label.modulate.a = 1.0 if not queue_text.is_empty() else 0.46
	queue_label.visible = true
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

	if is_finished:
		_build_battle_over_overlay()

	_render_tutorial_overlay()

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

	var player = BattleRoom.find_player(battle_snapshot["players"], BATTLE_PLAYER_ID)
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
			battle_snapshot = BattleRoom.clear_solved_battle_stage(battle_snapshot, BATTLE_PLAYER_ID)
			_play_battle_event_feedback(battle_snapshot.get("lastEvent", {}))
			_render_battle()
		return

	_begin_battle_queue(BATTLE_PLAYER_ID, battle_prime_queue.duplicate())
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
		battle_snapshot = BattleRoom.apply_battle_penalty(
			battle_snapshot,
			player_id,
			stage,
			int(acting_player["pendingFactorDamage"])
		)
		battle_result_text = "Miss" if player_id == BATTLE_PLAYER_ID else "-8"
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
		battle_result_text = "Miss" if player_id == BATTLE_PLAYER_ID else "-8"
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

	var event: Dictionary = battle_snapshot.get("lastEvent", {})
	if event.has("damage"):
		battle_result_text = ""
		_play_sfx("success" if player_id == BATTLE_PLAYER_ID else "fail")
		_play_battle_event_feedback(event)
	elif player_id == BATTLE_PLAYER_ID:
		_play_sfx("prime")
		_play_target_impact()

	if battle_resolving_queue.is_empty():
		_finish_battle_resolution()

	_render_battle()

func _finish_battle_resolution() -> void:
	_clear_battle_resolution()
	battle_bot_elapsed = 0.0

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

	var player = BattleRoom.find_player(battle_snapshot["players"], BATTLE_PLAYER_ID)
	var bot = BattleRoom.find_player(battle_snapshot["players"], BATTLE_BOT_ID)
	var did_win := player != null and bot != null and int(bot["hp"]) <= 0 and int(player["hp"]) > 0
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

	_add_battle_result_column(columns, player, did_win, true, _battle_exp_gained(player, bot, did_win))

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

	actions.add_child(_make_dialog_action_button("Rematch", _start_battle_ready, COLOR_SECONDARY))
	actions.add_child(_make_dialog_action_button("Top", _start_home, COLOR_PRIMARY_STRONG))

func _battle_exp_gained(player, opponent, did_win: bool) -> int:
	if did_win:
		return 150

	if player != null and opponent != null and int(player["hp"]) == 0 and int(opponent["hp"]) == 0:
		return 50

	return 30

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
	var card_width: float = min(viewport_size.x - 32.0, 360.0)
	var card := Panel.new()
	card.size = Vector2(card_width, card_height)
	card.position = Vector2(
		(viewport_size.x - card_width) / 2.0,
		72.0 if str(lesson.get("position", "bottom")) == "top" else viewport_size.y - card_height - 24.0
	)
	card.mouse_filter = Control.MOUSE_FILTER_STOP
	_apply_panel_theme(card, THEME_PANEL_DIALOG)
	overlay.add_child(card)

	var title := _make_absolute_label(str(lesson["title"]), 16, COLOR_INK, 900)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	title.position = Vector2(14, 12)
	title.size = Vector2(card_width - 28.0, 24)
	card.add_child(title)

	var body := _make_absolute_label(str(lesson["body"]), 12, COLOR_INK_SOFT, 700)
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
	return FileAccess.file_exists(TUTORIAL_COMPLETE_PATH)

func _mark_tutorial_complete() -> void:
	needs_tutorial = false
	var file := FileAccess.open(TUTORIAL_COMPLETE_PATH, FileAccess.WRITE)
	if file != null:
		file.store_string("1")

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
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG_DEFEAT, "Panel", _make_dialog_panel_style(COLOR_INK_SOFT))
	_add_panel_theme(app_theme, THEME_PANEL_DIALOG_VICTORY, "Panel", _make_dialog_panel_style(COLOR_GOLD))
	_add_panel_theme(app_theme, THEME_PANEL_TARGET, "Panel", _make_pixel_box_style(COLOR_PRIMARY_STRONG, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_TARGET_DANGER, "Panel", _make_pixel_box_style(COLOR_DANGER, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
	_add_panel_theme(app_theme, THEME_PANEL_TARGET_GOLD, "Panel", _make_pixel_box_style(COLOR_GOLD, COLOR_BORDER_INVERSE_SOFT, PIXEL_BORDER, RADIUS_PILL, true))
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

	var label := _make_absolute_label(text.to_upper(), 16, content_color, 900)
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

func _add_dialog_header(panel: Panel, title: String, header_color: Color = COLOR_PRIMARY) -> void:
	var header := ColorRect.new()
	header.color = header_color
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
	font.font_names = PackedStringArray(["Menlo", "Courier New", "Monaco"])
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

func _play_hp_regen(bar: ProgressBar, regen: int) -> void:
	if not is_instance_valid(bar) or regen <= 0:
		return

	_pulse_hp_bar_theme(bar, THEME_PROGRESS_GOLD, 0.54)
	_pulse_label_color(_hp_label_for_bar(bar), COLOR_GOLD, _base_hp_color_for_bar(bar), 0.54)
	_shine_hp_bar(bar)
	_flash_control(bar, COLOR_GOLD, 0.48)
	_spawn_damage_pop("+%s" % regen, _hp_pop_position(bar), COLOR_GOLD)

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
	return COLOR_SECONDARY if bar == enemy_hp_bar else COLOR_INK

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
	damage: int = 0
) -> void:
	var severity := _attack_severity(damage)
	var trail_count := _attack_trail_count(severity)
	var lead_size := _attack_lead_size(severity)
	var trail_size := _attack_trail_size(severity)
	var spread_scale := _attack_spread_scale(severity)
	var duration := _attack_duration(severity)
	var delta := target - source
	var direction := delta.normalized() if delta.length() > 0.0 else Vector2.RIGHT
	var tangent := Vector2(-direction.y, direction.x)
	var horizontal_direction := 1.0 if target.x >= source.x else -1.0
	var control := (source + target) / 2.0 + Vector2(42.0 * horizontal_direction * spread_scale, -88.0 * spread_scale)

	_spawn_attack_path_particle(source, control, target, fill_theme, duration * 0.82, 0.0, 0, lead_size, tangent, 0.0, 0.0)

	for index in range(trail_count):
		var delay := duration * (float(index) + 1.0) * 0.06
		var wobble := 10.0 * spread_scale
		var size: float = trail_size * max(0.5, 1.0 - float(index) * 0.06)
		_spawn_attack_path_particle(
			source,
			control,
			target,
			fill_theme,
			max(0.18, duration * 0.82 - delay),
			delay,
			index + 1,
			size,
			tangent,
			wobble,
			float(index) * 1.8
		)

	_spawn_impact_rings(target, ring_theme, severity, duration * 0.78)

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
	wobble_phase: float
) -> void:
	var particle := _make_particle_panel(theme_name, particle_size)
	particle.position = source - (particle.size / 2.0)
	particle.scale = Vector2(0.8, 0.8)
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
	tween.tween_property(particle, "scale", Vector2(0.18, 0.18), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.tween_property(particle, "modulate", Color(1, 1, 1, 0), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(particle.queue_free)

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

func _spawn_impact_rings(center: Vector2, ring_theme: String, severity: int, delay: float) -> void:
	var ring_count := _attack_ring_count(severity)
	var radius := _attack_impact_radius(severity)
	for index in range(ring_count):
		var angle := (TAU * float(index)) / float(ring_count) + 0.3
		var endpoint := center + Vector2(cos(angle), sin(angle)) * (radius + float(index % 2) * 4.0)
		_spawn_particle(center, endpoint, ring_theme, 0.26 + float(index % 3) * 0.035, index, delay, max(8.0, _attack_trail_size(severity)))

func _make_particle_panel(theme_name: String, particle_size: float) -> Panel:
	var particle := Panel.new()
	particle.size = Vector2(particle_size, particle_size)
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
	add_child(particle)

	var arc_lift := Vector2(0, -10.0 - float(index % 4) * 4.0)
	var tween := particle.create_tween()
	if delay > 0.0:
		tween.tween_interval(delay)
	tween.set_parallel(true)
	tween.tween_property(particle, "position", target - (particle.size / 2.0) + arc_lift, duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(particle, "scale", Vector2(0.18, 0.18), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.tween_property(particle, "modulate", Color(1, 1, 1, 0), duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	tween.finished.connect(particle.queue_free)

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

func _play_battle_event_feedback(event: Dictionary) -> void:
	if event.is_empty():
		return

	var event_type := str(event.get("type", ""))
	var event_cause := str(event.get("cause", ""))
	var source_id := str(event.get("sourcePlayerId", ""))
	var damage := int(event.get("damage", 0))
	var regen := int(event.get("regen", 0))
	var perfect_solve: bool = event.get("perfectSolve", false) == true

	if event_type == "self-hit" or event_cause == "self-hit":
		_play_source_fault(source_id)
		_play_hp_hit(_hp_bar_for_player(source_id), damage)
		if source_id == BATTLE_PLAYER_ID:
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
				released_damage
			)
			_play_hp_hit(_hp_bar_for_player(released_target_id), released_damage)
		return

	var target_id := str(event.get("targetPlayerId", event.get("loserPlayerId", "")))
	if damage > 0 and target_id != "":
		_play_attack_launch(source_id, damage)
		_spawn_attack_particles(
			_battle_source_anchor(source_id),
			_battle_hp_anchor(target_id),
			_particle_fill_theme_for_player(source_id),
			_particle_ring_theme_for_player(source_id),
			damage
		)
		_play_hp_hit(_hp_bar_for_player(target_id), damage)
		_play_target_impact()

	if perfect_solve:
		_play_perfect_burst(source_id)

	if regen > 0:
		_play_hp_regen(_hp_bar_for_player(source_id), regen)

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

func _play_perfect_burst(source_id: String) -> void:
	var source_control = _battle_source_control(source_id)
	if is_instance_valid(source_control):
		_bump_control(source_control, 1.14, 0.2)
		_flash_control(source_control, COLOR_GOLD, 0.36)
		if source_control == target_blob_panel:
			_pulse_panel_theme(target_blob_panel, THEME_PANEL_TARGET_GOLD, THEME_PANEL_TARGET, 0.48)

	var center := _battle_source_anchor(source_id)
	_spawn_damage_pop("PERFECT", center + Vector2(-48, -56), COLOR_GOLD)
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
	return enemy_avatar_panel if player_id == BATTLE_BOT_ID else target_blob_panel

func _player_accent_color(player_id: String) -> Color:
	return COLOR_SECONDARY if player_id == BATTLE_BOT_ID else COLOR_PRIMARY_STRONG

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

func _make_dialog_panel_style(border_color: Color = COLOR_PRIMARY) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = COLOR_SURFACE
	style.anti_aliasing = false
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

func _format_queue_label(numbers: Array) -> String:
	var display_numbers := numbers.duplicate()
	if not keyboard_buffered_prime_input.is_empty():
		display_numbers.append(keyboard_buffered_prime_input)

	return _join_numbers(display_numbers) if not display_numbers.is_empty() else ""

func _join_numbers(numbers: Array) -> String:
	var labels: Array[String] = []

	for number in numbers:
		labels.append(str(number))

	return " × ".join(labels)
