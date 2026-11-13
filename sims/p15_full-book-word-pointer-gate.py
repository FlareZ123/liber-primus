#!/usr/bin/env python3
import json, re
from pathlib import Path

master = Path("resources/transcriptions/liber_primus_master.txt").read_text()
header = {"Delimiters", "Word     : -", "Clause   : .", "Paragraph: &", "Segment  : $", "Chapter  : §", "Line     : /", "Page     : %"}
body = " ".join(line for line in master.splitlines() if line not in header)
words = [w for w in re.split(r"[-./&$%§\s]+", body) if w]
addresses = [3299, 3298, 3296, 3294, 3292, 3289, 3287, 3284, 3282, 3279, 3277, 3274, 3272, 3269, 3267, 3264]
assert len(words) == 4461 and all(0 <= n < len(words) for n in addresses)
print(json.dumps({
    "source": "resources/transcriptions/liber_primus_master.txt",
    "delimiterRule": "split on -, ., /, &, $, %, § and whitespace",
    "wordCount": len(words), "addresses": addresses,
    "zeroBased": [words[n] for n in addresses],
    "oneBased": [words[n - 1] for n in addresses],
    "interpretation": "Both conventions return GP29 rune-words, not a plaintext instruction."
}, ensure_ascii=False, indent=2))
