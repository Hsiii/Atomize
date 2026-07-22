extends SceneTree

const MAIN_SCENE := preload("res://scenes/Main.tscn")
const Game := preload("res://scripts/core/game.gd")
const SCREEN_ARG_PREFIX := "--atomize-screen="

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var screen_name := _get_requested_screen()
	var main_scene := MAIN_SCENE.instantiate()
	root.add_child(main_scene)

	await process_frame
	await process_frame

	var failures := _validate_screen(main_scene, screen_name)
	if not failures.is_empty():
		for failure in failures:
			printerr("[Error] Godot screen smoke failed for %s: %s" % [_screen_label(screen_name), failure])
		main_scene.queue_free()
		quit(1)
		return

	print("[Success] Godot screen smoke passed: %s" % _screen_label(screen_name))
	main_scene.queue_free()
	await process_frame
	if is_instance_valid(main_scene):
		printerr("[Error] Godot screen smoke leaked main scene for %s." % _screen_label(screen_name))
		quit(1)
		return

	quit(0)

func _validate_screen(main_scene: Node, screen_name: String) -> Array[String]:
	var failures: Array[String] = []
	if main_scene.get_child_count() == 0:
		failures.append("rendered no nodes")

	var label := _screen_label(screen_name)
	match label:
		"solo", "battle-game":
			_validate_gameplay_keypad(main_scene, failures)
		"dialog-player-name":
			_validate_dialog_buttons(main_scene, ["Cancel", "Claim", "Continue as Guest"], failures)
		"dialog-reset-best":
			_validate_dialog_buttons(main_scene, ["Cancel", "Reset"], failures)
		"dialog-pause":
			_validate_dialog_buttons(main_scene, ["Resume", "Restart Run", "Main Menu"], failures)
		"dialog-game-over":
			_validate_dialog_buttons(main_scene, ["Main Menu", "Play Again"], failures)
		"home":
			_expect_minimum_controls(main_scene, failures, 1, 2)
		"battle":
			_expect_minimum_controls(main_scene, failures, 2, 3)
		_:
			_expect_minimum_controls(main_scene, failures, 1, 2)

	if label == "battle-game":
		_validate_attack_vfx(main_scene, failures)
		_validate_battle_emotion_vfx(main_scene, failures)

	return failures

func _validate_dialog_buttons(main_scene: Node, expected_texts: Array, failures: Array[String]) -> void:
	var panel := main_scene.find_child("DialogPanel", true, false)
	if panel == null or not (panel is Panel):
		failures.append("missing DialogPanel")
		return

	for expected_text in expected_texts:
		var button := _find_button_by_text(panel, str(expected_text))
		if button == null:
			failures.append("missing dialog action %s" % expected_text)
		elif button.size.x < 44.0 or button.size.y < 44.0:
			failures.append("dialog action %s is below 44x44" % expected_text)

func _find_button_by_text(root: Node, expected_text: String) -> Button:
	if root is Button and (root as Button).text == expected_text:
		return root as Button

	for child in root.get_children():
		var match_button := _find_button_by_text(child, expected_text)
		if match_button != null:
			return match_button

	return null

func _validate_gameplay_keypad(main_scene: Node, failures: Array[String]) -> void:
	_expect_minimum_controls(main_scene, failures, 11, 3)

	var controls := main_scene.find_child("PrimeControls", true, false)
	if controls == null or not (controls is HBoxContainer):
		failures.append("missing PrimeControls HBoxContainer")

	var grid := main_scene.find_child("PrimeGrid", true, false)
	if grid == null or not (grid is GridContainer):
		failures.append("missing PrimeGrid GridContainer")
	else:
		var expected_primes := Game.get_playable_stage_primes().size()
		var button_count := _count_buttons(grid)
		if button_count != expected_primes:
			failures.append("PrimeGrid has %d buttons, expected %d" % [button_count, expected_primes])

	var backspace := main_scene.find_child("BackspaceButton", true, false)
	if backspace == null or not (backspace is Button):
		failures.append("missing BackspaceButton")

	var submit := main_scene.find_child("SubmitButton", true, false)
	if submit == null or not (submit is Button):
		failures.append("missing SubmitButton")

func _validate_attack_vfx(main_scene: Node, failures: Array[String]) -> void:
	if not main_scene.has_method("_spawn_attack_particles"):
		failures.append("missing attack particle spawner")
		return

	main_scene.call(
		"_spawn_attack_particles",
		Vector2(96, 440),
		Vector2(260, 48),
		"AtomPanelParticlePrimary",
		"AtomPanelParticleRingPrimary",
		"AtomPanelAttackBallPrimary",
		24,
		Callable()
	)

	var bullet_node: Node = main_scene.find_child("AttackBullet", true, false)
	if bullet_node == null or not (bullet_node is Control):
		failures.append("attack VFX did not spawn AttackBullet")
		return

	var bullet := bullet_node as Control
	if bullet.size != Vector2(24, 24):
		failures.append("AttackBullet does not match the web lead-ball size")
	if bullet.get_child_count() != 0:
		failures.append("AttackBullet should be a single web-style ball")

	var source := Vector2(0, 100)
	var control := Vector2(50, 0)
	var target := Vector2(100, 100)
	main_scene.call("_position_attack_bullet", 0.5, bullet, source, control, target)
	var expected_center := Vector2(25, 62.5)
	var actual_center := bullet.position + bullet.size / 2.0
	if not actual_center.is_equal_approx(expected_center):
		failures.append("AttackBullet does not use the web quadratic acceleration curve")

	var flash_node: Node = main_scene.find_child("AttackImpactFlash", true, false)
	if flash_node == null or not (flash_node is CanvasItem):
		failures.append("attack VFX did not spawn delayed impact flash")
	elif (flash_node as CanvasItem).modulate.a > 0.01:
		failures.append("impact flash is visible before bullet impact")

	var shockwave_node: Node = main_scene.find_child("AttackImpactShockwave", true, false)
	if shockwave_node == null or not (shockwave_node is CanvasItem):
		failures.append("attack VFX did not spawn delayed impact shockwave")
	elif (shockwave_node as CanvasItem).modulate.a > 0.01:
		failures.append("impact shockwave is visible before bullet impact")

func _validate_battle_emotion_vfx(main_scene: Node, failures: Array[String]) -> void:
	for method_name in ["_spawn_heal_stream", "_spawn_fault_shards", "_spawn_perfect_halo", "_spawn_battle_hit_flash"]:
		if not main_scene.has_method(method_name):
			failures.append("missing battle emotion VFX method %s" % method_name)
			return

	main_scene.call("_spawn_heal_stream", Vector2(120, 420), Vector2(250, 96), 12)
	main_scene.call("_spawn_fault_shards", Vector2(180, 360), 6)
	main_scene.call("_spawn_perfect_halo", Vector2(220, 300))
	main_scene.call("_spawn_battle_hit_flash", true, 1)

	for node_name in ["HealPulse", "HealMote", "FaultShard", "PerfectHalo", "PerfectOrbitMote", "BattleHitFlash"]:
		if main_scene.find_child(node_name, true, false) == null:
			failures.append("battle emotion VFX did not spawn %s" % node_name)

func _expect_minimum_controls(
	main_scene: Node,
	failures: Array[String],
	min_buttons: int,
	min_labels: int
) -> void:
	var button_count := _count_buttons(main_scene)
	if button_count < min_buttons:
		failures.append("found %d buttons, expected at least %d" % [button_count, min_buttons])

	var label_count := _count_labels(main_scene)
	if label_count < min_labels:
		failures.append("found %d labels, expected at least %d" % [label_count, min_labels])

func _count_buttons(root: Node) -> int:
	var count := 1 if root is Button else 0
	for child: Node in root.get_children():
		count += _count_buttons(child)

	return count

func _count_labels(root: Node) -> int:
	var count := 1 if root is Label else 0
	for child: Node in root.get_children():
		count += _count_labels(child)

	return count

func _get_requested_screen() -> String:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with(SCREEN_ARG_PREFIX):
			return argument.trim_prefix(SCREEN_ARG_PREFIX)

	return ""

func _screen_label(screen_name: String) -> String:
	if screen_name.is_empty():
		return "home"

	return screen_name
