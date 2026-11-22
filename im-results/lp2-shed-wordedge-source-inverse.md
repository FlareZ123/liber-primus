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

## Key-independent all-secret word-edge substitution extension

The 32 concrete shifts above are only a narrow class of possible edge-key decoders. An exact **all-key** invariant now tests a much broader and more powerful one-symbol receiver: grant an arbitrary secret **29! GP29 alphabet permutation** for *each* possible value of the word's first rune, last rune, sum of both, or last-minus-first (mod29). There are 29 secret maps per source-key rule; each is allowed to be nonlinear and is reused consistently among words sharing that boundary-key value. This includes every fixed GP29 affine shift keyed by that source value, with any additive or multiplicative constants, while preserving the positions of the 7,247 interior runes.

For each of 29 ciphertext-key states, a bijection can only **relabel** that state's 29 original rune-frequency counts. The global maximum number of occurrences of any one plaintext rune is the sum of the largest original count inside each state. Likewise, the summed largest 5 and 12 per-state counts are valid upper bounds for the global plaintext's 5 and 12 most common runes, for **all possible hidden permutations**.

| Word-edge key state | Ceiling: any one rune of 7,247 | Ceiling: top 5 | Ceiling: top 12 |
|---|---:|---:|---:|
| Word first rune | **435** | 1,878 | 3,928 |
| Word last rune | **440** | 1,889 | 3,940 |
| (First + last) mod29 | **435** | 1,895 | 3,957 |
| (Last − first) mod29 | **443** | 1,888 | 3,933 |

The strongest source-key model allows at most **443/7,247 = 6.11%** of any one decoded rune and at most **3,957/7,247 = 54.60%** for its twelve commonest runes. As a short independent author-style reference, the authentic clear p57 word interiors have **8/55 = 14.55%** at the most frequent rune and **50/55 = 90.91%** across the top twelve. This is a **deterministic all-secret necessary-condition exclusion** of native-like GP29 concentrated plaintext under these four edge-only **single-substitution** key states; it does not require selecting or testing an actual key. It remains conditional on preserving the original 7,247 interior symbol positions and natural-language-like GP29 frequency. A cipher indexed by the *ordered pair* of both word edges would allow up to 812 independent secret alphabets and lies outside the theorem, as would a clock or nonlocal state.

The same SFT asserts every bound against untouched source, along with its original 32 two-way encoder/decoder positives.

**Decision:** retire all 32 specified low-complexity *printed-word edge-key plus direct/one-back/one-ahead/five-back feedback* interpretations. The conditional word-edge source reading, the printed word boundaries, and the ciphertext's unknown actual keying remain open. An independently authored receiver allowing word reordering, ciphertext-dependent segmentation, distinct historical punctuation semantics, or a derived nonperiodic full-length keystream is outside this gate. Do not broaden the table by arbitrary pagewise phases or fitted letters without a new visible clue.
