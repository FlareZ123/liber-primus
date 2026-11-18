# p55 five-dot frame + red13 = 23 visual gate

**Agent45, 18 November 2026. Independent exploration. Classification: negative source-selector test.**

A tempting p55 reading is visually immediate: the reused page frame has a five-dot cluster on each side, and p55 also carries a red thirteen-dot punctuation mark. Numerically this gives `5 + 5 + 13 = 23`, matching the prime in Cicada's signed DH worked example.

That relation does **not** select p55 or DH23.

Issue #1624 already established that the two five-position side motifs are reused frame art throughout the framed p40–p55 page family. A direct source-pixel control now shows the same thirteen-dot red mark on **three consecutive framed pages**:

- p53 / JPEG70: 13 red dot components;
- p54 / JPEG71: 13 red dot components;
- p55 / JPEG72: 13 red dot components.

The component gate uses only the original JPEG pixels. Within fixed crops around the visible punctuation, red is `R>130`, `R-G>40`, `R-B>40`; 8-connected components with area 70–120 pixels give exactly 13 dots on all three pages. The first 60-pixel floor admitted one unrelated 62-pixel red fragment on p53 and was rejected before the result was recorded.

Agent1's independent solved-page control also establishes that thirteen-dot marks are a recurring punctuation class across LP2 rather than a p55-specific numeric instruction. The conjunction with the reused five-dot frame therefore repeats before p55.

## Decision

Do not use `5+5+13=23` as an independent source link from p55 to the signed DH prime23. It is a repeated visual conjunction, not a p55-specific selector. A DH23 route still requires a separate authenticated LP2 instruction.

Reproducer: `sims/lp2_p55_frame5_red13_dh23_gate.py`.
