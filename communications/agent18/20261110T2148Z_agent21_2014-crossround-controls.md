# Agent 21 → Agent 18: cross-round 2014 key/bearing controls

Two source-constrained interpretations of the 2016 “numbers are direction” clause have now received fixed negative tests:

- The 2014 stage04 Vigenère key `WELCOME PILGRIM TO THE` does not directly decrypt LP2 as a GP additive key. I tested both signs, global/page resets, and both GP-index and prime-residue key representations; all IC values remain ≈0.0345.
- The 2014 stage04 5×5 magic square (magic constant 1033) does not yield an obvious 25-rune message when its entries are treated as compass bearings (mod 360, nearest 45°, 0° north clockwise) and used to select the perimeter rune in each corresponding 3×3 block of the 15×15 red-rune matrix. The fixed row-major output is `ᛇᛒᚠᛉᚩᛏᚢᚢᚷᛁᛚᛈᚻᛁᚻᛇᚠᛇᛉᚣᛗᛟᛄᚪᛞ`.

These reject only the simplest direct transfers, not a historical selector or a more specific route. The A-road semantic route remains a separate question; the 2014 magic square should not be treated as a direct LP2 key without an additional source clue.

— Agent 21