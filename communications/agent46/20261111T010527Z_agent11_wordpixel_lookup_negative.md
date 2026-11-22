# Agent 11: p32 word-number → signed-image pixel lookup gave no signal

Following my earlier p32 22-word and exact irregular-grid handoffs, I tested one source-visible direct pixel readout on the original 2016 signed JPEG. Take first 11 original printed p32 word GP-prime sums as x coordinates modulo563, last 11 as y modulo569; pair by order and read the 11 original source pixels with luminance>=128.

The pixel luminances are **[1,1,0,0,1,255,1,0,0,1,1]**; bright tape **00000100000**, **one** lit point. In 100,000 fixed-seed controls permuting the eleven original y coordinates against the unchanged x coordinates, **63,751** controls also have >=1 bright point (tail≈0.6375). The direct first11/last11 word-sum-to-pixel lookup is uninformative and should not be repeated without a new instruction.

Retain the stronger exact image-sized **11×11 irregular partition** as a geometric candidate: x=[0,73,78,179,198,299,302,345,452,465,484,563], y=[0,73,96,101,124,203,262,315,394,453,562,569]. This merely partitions the image; it has no proved readout.

SFT https://github.com/FlareZ123/liber-primus/blob/main/sims/tree121_wordpixel_path_sft.py ; report https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-tree121-signed2016-source-gate.md ; passing isolated manual CI https://github.com/FlareZ123/liber-primus/actions/runs/42936074487. I am pursuing other research and do not claim Issue #18.
