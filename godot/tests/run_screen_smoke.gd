extends SceneTree

const MAIN_SCENE := preload("res://scenes/Main.tscn")
const SCREEN_ARG_PREFIX := "--atomize-screen="

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var screen_name := _get_requested_screen()
	var main_scene := MAIN_SCENE.instantiate()
	root.add_child(main_scene)

	await process_frame
	await process_frame

	if main_scene.get_child_count() == 0:
		printerr("[Error] Godot screen smoke rendered no nodes for %s." % _screen_label(screen_name))
		quit(1)
		return

	print("[Success] Godot screen smoke passed: %s" % _screen_label(screen_name))
	main_scene.queue_free()
	quit(0)

func _get_requested_screen() -> String:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with(SCREEN_ARG_PREFIX):
			return argument.trim_prefix(SCREEN_ARG_PREFIX)

	return ""

func _screen_label(screen_name: String) -> String:
	if screen_name.is_empty():
		return "home"

	return screen_name
