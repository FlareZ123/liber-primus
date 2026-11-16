# The solved PARABLE's “shed circumferences” as word-local GP29 decoder

**Original-source bounded result, Agent24, 16 November 2026.** No unknown LP2 plaintext, genuine creator key, or puzzle destination has been recovered. This experiment addresses a literal human-observable word-edge receiver that differs from a five-phase secret alphabet and from the previously tested grid-driven word-edge key advances.

The clear p57 PARABLE says **“WE MUST SHED OUR OWN CIRCUMFERENCES.”** The 2,896 original LP2 printed rune-words contain 12,956 GP29 glyphs; **83** words are singletons. Interpret the first and last glyph of each longer printed word as its *own circumference*, transmitted unchanged as the local key/initialization information. Use the full original printed words across 32 page carries; page wraps and visual lines do not create words. **7,247** remaining interior positions are potential content, with the other **5,709** transmitted glyphs acting as boundary side information.

The smallest complete, source-readable reversible forms for interior index j have four base registers: original C[j], C[j]−C[j−1], C[j]−C[j+1], or C[j]−C[j−5] (using first boundary C[0] for j<5). Subtract or add one fixed word-local boundary value: **first**, **last**, **first+last**, or **last−first** modulo29. This is exactly **4×4×2 = 32** candidate models, fixed before language scoring. The previous-ciphertext difference responds to the manuscript's unusual shortage of adjacent equal ciphertext runes; the five-back difference responds to the independent word-local fifth-position echo and recurrent five-dot illustration. Neither the clear p57 text nor the artwork explicitly prescribes these algebraic choices.

The [read-only, source-exact SFT](../sims/lp2_shed_wordedge_local_feedback_sft.cjs) preserves both ciphertext endpoints of every word, making all four base operations bijective on the remaining interior. It implements the inverse recurrence, including the right-to-left inverse for next-rune feedback, and verifies exact **12,956/12,956** original source reconstruction for all 32 modes. Each mode also enciphers the **95 actual solved p57 GP runes**, including its 20 original word boundaries, and recovers all 95 exactly; this is a plaintext control, rather than authentication of the unknown cipher.

| Direct source measurement | GP29 IoC |
|---|---:|
| Original p0–55 word interiors (7,247 runes) | **0.03447346** |
| Highest of all 32 decoded LP2 word interiors | **0.03458852** |
| Authentic solved PARABLE word interiors (55 runes) | **0.07138047** |

The **best** model is previous-ciphertext first difference, subtracting first+last edge GP values. Every tested model's entire 7,247-rune decoded content remains below **0.04 IoC** and is visibly nonprose; no meaningful unknown text arises. These are descriptive original-cipher register measurements, without a null p-value or a claim about all languages. The p57 comparison is short, but the candidate outputs' near-uniform profile is consistent across a long register. Exact re-encoding demonstrates proper invertibility and only establishes that the proposed construction is operationally possible.

**Decision:** retire all 32 specified low-complexity *printed-word edge-key plus direct/one-back/one-ahead/five-back feedback* interpretations. The conditional word-edge source reading, the printed word boundaries, and the ciphertext's unknown actual keying remain open. An independently authored receiver allowing word reordering, ciphertext-dependent segmentation, distinct historical punctuation semantics, or a derived nonperiodic full-length keystream is outside this gate. Do not broaden the table by arbitrary pagewise phases or fitted letters without a new visible clue.
