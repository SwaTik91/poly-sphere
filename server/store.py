from pathlib import Path
_dir = Path(__file__).with_name("store_parts")
_src = "".join(p.read_text(encoding="utf-8") for p in sorted(_dir.glob("part-*.txt")))
exec(compile(_src, str(Path(__file__)), "exec"), globals())
