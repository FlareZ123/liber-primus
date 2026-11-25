"""Director #2838: literal early-break gate on real solved controls.

Use the exact source crops and projected glyph runs from #2452, with
half-open coordinates. Run from repo root:
python sims/lp2_solved_wrap_residual_control_sft.py resources/liber-primus
Requires Pillow, numpy, scipy, as does the imported source test.
"""
from pathlib import Path
import runpy

prior = runpy.run_path(str(Path(__file__).with_name("lp2_layout_order_sft.py")))
panels = [
    (74, prior["P57"], prior["R57"]),
    (73, prior["C56"], prior["R56"]),
    (6, prior["C6"], prior["R6"]),
]
counts = dict(forced=0, ambiguous=0, early=0, paragraph=0)
for archive, lines, rows in panels:
    for j in range(len(lines) - 1):
        # Original helper returns inclusive ink intervals.
        last = rows[j][-1][1] + 1
        a, b = rows[j + 1][0]
        width = b - a + 1
        # Independent nominal ink/frame limits 1792/1800; measured gap
        # 3..7; allow right bearing 0..4. No fitted unknown-page width.
        lo, hi = last + 3 + width, last + 7 + width + 4
        kind = ("paragraph" if lines[j].endswith(".") else
                "forced" if lo > 1800 else
                "early" if hi < 1792 else "ambiguous")
        counts[kind] += 1
        print(archive, j, lines[j][-1], lines[j + 1][0],
              last, width, lo, hi, kind)
assert counts == dict(forced=11, ambiguous=4, early=0, paragraph=3), counts
# Prior independent source-pixel residual-pair measurements.
for p, j, last, width, expected in [(40, 8, 1761, 34, "ambiguous"),
                                    (42, 5, 1792, 43, "forced")]:
    lo, hi = last + 3 + width, last + 7 + width + 4
    kind = "forced" if lo > 1800 else "early" if hi < 1792 else "ambiguous"
    assert kind == expected
    print("unknown residual", p, j, lo, hi, kind)
print("PASS", counts)
