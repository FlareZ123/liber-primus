# P55 full-length inverse from the next printed hash via historical BASE29

**Status:** scoped negative, 22 November 2026, Agent11, Director #2173. **No unknown LP2 plaintext, source-selected terminal key, or authenticated p55 decoder has been recovered.**

## Why this test was preferable to another perimeter search

The original physical p55 (`72.jpg`) immediately precedes the authentic solved p56 (`73.jpg`), which visibly prints a full 128-hex-character hash. The original 2013 Cicada BASE29 protocol establishes a source-era integer-to-base29 encoding and the original solved p56 proves a GP29 additive prime-totient cipher with transparent plaintext-F skip. Those two already-authenticated operations make a specific prospective hash-as-key transfer possible. The p55 page has exactly 76 original runes, including the one-rune fragment carried from p54. Converting the entire visible hash as one big-endian integer yields **105 base29 digits**, enough to cover the intact p55. This is a bounded *hypothesis*; the source never says that the p56 hash is a key for the previous page.

The fixed test avoids secondary selection from the p55 33-exterior/43-interior split. Its ciphertext receiver is **all 76 original runes** with all printed word breaks retained.

## Frozen operation and explicit failure

1. Take the complete original p56 hash exactly as printed, in its source order, without hashing it again. Parse it as one positive hexadecimal integer, and write that integer as **105 ordinary most-significant-first base29 digits** `K`.
2. Apply the exact solved-p56 forward law to original p55 from key position zero: plaintext F (index 0) emits ciphertext F without advancing `K`; any other plaintext rune `P` emits `C=(P+K[j]) mod29`, then advances `j`.
3. Use exhaustive F/non-F predecessor branching to invert each of the **76 source p55 glyphs**. Discard any branch requiring plaintext F to have been encrypted as a non-F value. Preserve the original source-word delimiters and p54 page-carry singleton.

The printed key's first 15 GP index digits are `[23,3,6,21,17,20,0,12,9,23,28,15,28,28,6]`. **Every possible F/non-F branch dies at original p55 zero-based offset 61 (the 62nd glyph)**. This is an algebraic impossibility under the frozen receiver, independent of English word frequency. No 76-symbol inverse exists.

The fully reversible direct additive variant with **no transparent-F bypass** does produce a unique 76-symbol inverse and reencrypts exactly, as any known pad must. Its output has GP29 coincidence index **0.030877192982456142** and begins, in original 17-fragment word layout, `IA OEPEM AB THI NGPLAOM CSEAEOAEC ...`; it contains no coherent plaintext. This diagnostic tests one obvious difference between 2013 numeric keying and the genuinely solved p56 mechanism, not a second candidate selected after a plaintext success.

A **prospective 76-symbol positive using the first 76 runes of the genuine solved-p56 plaintext** passes exact transparent-F encryption, recovered plaintext inclusion among all **four** algebraically legal inverse branches and exact reencryption of every branch. The full authentic **85/85 p56 plaintext** was independently verified by reproducing its actual prime-totient/F-bypass original ciphertext before transplanting those first 76 runes to the proposed hash-base29 cipher. A distinct no-bypass 76-rune positive also recovers all text. Thus the original failure arises from the original p55 ciphertext/key relationship under the specified F rule.

## Separate source-length observation, with its limit

The original p54 introductory red rubric has **nine** runes, and p55 has **76** runes. Their concatenation therefore has **85** runes, equal to solved p56's complete ciphertext length. However, the two 85-symbol strings have *different sorted 29-bin rune frequency histograms*. Consequently, they cannot be related by any composition of one fixed monoalphabetic GP29 bijection and positional transposition. This length equality was noticed after looking at adjacent source counts and is **not an authored alignment instruction**; in particular the old `A BEGINNING` reading of p54's rubric is an unproved crib.

## Operational decision

The 128-hex printed number is genuine, and historical BASE29 and the solved p56 F-bypass are executable. The missing first-party instruction is the **binding of that number to p55 as a starting key, an applicable cipher direction and a clock rule**. Neither its location nor the p55 illustration supplies that binding. The one fixed complete handoff above is rejected; this says nothing about an unknown independent key, another representation of the 128 digits, a value-changing source-visible transition, or the external web page whose digest is printed.

**Reproduction:** [source-exact Node22 CJS SFT](../sims/lp2_p56_hash_base29_p55_original_sft.cjs), original inputs [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [solved reference](../resources/liber-primus/lp1-plaintext-reference.txt), [actual Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44990391161), and [p55 source-layout facts](p55-original-33-exterior-43-interior-source-framing.md). No change is warranted to the overall authoritative decipherment status.
