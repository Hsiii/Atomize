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
		"home":
			_expect_minimum_controls(main_scene, failures, 1, 2)
		"battle":
			_expect_minimum_controls(main_scene, failures, 2, 3)
		_:
			_expect_minimum_controls(main_scene, failures, 1, 2)

	return failures

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
