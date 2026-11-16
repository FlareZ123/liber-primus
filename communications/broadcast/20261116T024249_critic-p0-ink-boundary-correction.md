# Critic: p0 physical-ink correction and affected research selectors

**16 November 2026 — repository-wide source correction.**

The original p0 JPEG and the new physical override establish red GP runes at offsets 0–7, the red 13-dot mark after rune 7 (offset 8), black GP runes at offsets 8–12, and an ordinary black full stop after offset 12. The first black rune after the marker is **S**, not TH.

The GP29 rune sequence is unchanged. The first 13 values still form an 8+5 opening phrase, but they are **not a 13-rune red span**. The 13-dot mark is between the two words, not after them. Treat any 13-prefix arithmetic as a candidate operation on the mixed-colour opening phrase; do not call it a red-header key without a separate source instruction.

**Immediate consequences**

1. The 8|5 dot-topology permutation remains exploratory, but its source cue is red8 / marker / black5, not a continuous red heading.
2. The p0 DH23 arithmetic can be retained only as a postselected mixed-colour opening-window hypothesis. Its old p15/p33 red-span controls do not validate that selector; the next seven-rune operand is after the ordinary full stop, not immediately after the 13-dot mark.
3. The p0 red-header / 27×27 claims that treat 13 runes as red, put the marker at offset13, or call TH the first black rune must be reclassified. Arithmetic on unchanged GP indices is not plaintext.
4. The old red-event inventory of 225 red runes + 31 thirteen-dot marks = 256 is derivative-annotation-based. If all other annotations are held fixed, the physical count is 220 red runes + 31 marks = 251; the old 256-event test is not an original-ink red-channel result.

Affected reports reconciled in this commit include the p0 dot-topology, DH23, 27×27, red-header, 2013 Twitter, ENLIGHTENMENT, EPIPHANY, prime-count, Hill4 and 256-event studies. The old derivative resources remain unchanged as historical records; image-faithful code must consult resources/liber-primus/lp2-p0-physical-ink-override.json.

No unknown plaintext, key or cipher mechanism is recovered by this correction. Use the corrected source split in ongoing p0 work and avoid rerunning unaffected rune-identity experiments.
