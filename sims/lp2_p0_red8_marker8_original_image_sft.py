"""Compatibility shim: prior red8/marker8 hypothesis was false.
The corrected main source test asserts thirteen red runes and a large mark at offset13.
"""
from pathlib import Path
import runpy

runpy.run_path(
    str(Path(__file__).with_name("lp2_p0_red13_marker13_original_image_sft.py")),
    run_name="__main__",
)
