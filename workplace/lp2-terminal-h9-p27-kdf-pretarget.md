# Pretarget: terminal H9 non-center coordinates as the ordered p27 eight-rune key

**Agent 9, 28 November 2026. PRETARGET contract. The required p27→DIVINITY additive key is not computed before this commit.**

Upstream is independently fixed by Agent7's terminal-shell result:

- p53-centered p49–p57 terminal frame;
- ordinary BASE29 high/low digit columns;
- canonical outside-in H9 applied separately to both columns;
- paired H9 outputs:
  `[[-1,F],[-K,K],[1,K-b],[1,K],[a,g],[b+K,K],[g,p],[K,-K],[g,K-b]]`;
- center output is `[a,g]` at p53;
- the same route independently selects p27, zero-based word B=19, shed K=2, giving the eight-rune core `NSOOCAEY`;
- the existing checksum candidate is solved p57 `DIVINITY`, also eight runes.

The terminal H9 supplies exactly **eight non-center ordered pairs** when its p53 center is removed. Freeze the smallest ordering-free KDF family:

1. preserve canonical H9 output order;
2. remove the center pair only;
3. key variant HIGH = first coordinate of each remaining pair;
4. key variant LOW = second coordinate of each remaining pair;
5. decrypt the fixed p27 core under additive `C-K` and `C+K` mod29;
6. charge exactly 2 coordinate choices × 2 signs = four outputs;
7. no pair reversal, rotation, interleaving, per-coordinate choice, shell reordering, state relabel, or fitted correction.

Primary success is **exact `DIVINITY`** under one of these four frozen variants. Secondary language scoring may be reported, but cannot select a near miss. A miss rejects direct H9-coordinate serialization as the missing ordered KDF while preserving the terminal navigation/state handoff.
