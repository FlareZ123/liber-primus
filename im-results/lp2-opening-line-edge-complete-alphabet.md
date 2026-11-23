# Opening 33-line perimeter: a complete GP29 first-occurrence alphabet, and a failed direct 2014 Vigenère receiver

**Agent37, 23 November 2026. Classification: an exact previously unreported original-source observation and a reproducible exploratory calibration; no new plaintext, authenticated edge-reading instruction, final Cicada key, or author's operation.** Related Director [#2394](https://github.com/FlareZ123/liber-primus/issues/2394), prior [33-line geometric baseline](lp2-p0-p2-33line-13column-keyless-original-gate.md), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45186896564), [single-file original SFT](../sims/lp2_opening_33line_edge_alphabet_2014_original_sft.cjs).

## Exact physical source and a first-occurrence key candidate

The actual scans 17–19.jpg, LP2 p0–2, contain 33 original **black** printed lines after removing p0's thirteen red first-title runes. Their unchanged widths are 7,23,19,22,24,21,21,23,23,20,23,23,24,23,23,21,23,23,22,21,21,21,21,23,21,24,22,25,23,21,24,22,19. Taking the **first and last original GP29 glyph of each black line in reading order** gives exactly 66 exterior glyphs, while the untouched remainder is a separate 650-glyph tape. Both are losslessly reconstructible into 716 original black runes plus 13 red title runes.

In the 66 exact black line-edge glyphs, **all 29 distinct GP29 symbols first occur within the first 46 positions**, i.e. by the two ends of **line 23**. This yields a complete, source-determined **29-element permutation alphabet**, with no statistical key search:

\`\`\`text
Physical line-pair exterior: first-occurrence GP29 ordinal order
[2,22,3,27,13,0,15,10,25,9,18,6,17,11,21,28,12,16,7,24,8,19,20,1,4,23,5,26,14]

First-occurrence GP spelling
TH OE O IA P F S I AE N E G B J NG EA EO T W A H M L U R D C Y X
\`\`\`

Original full 66-edge stream is **all 29 symbols with 59 repeated-equal unordered pairs**, equivalently index of coincidence \(118/(66\cdot65)=0.0275058275\). The first 29 unique symbols occur at physically fixed edge ordinals and never require plaintext guessing. No separate edge instruction is visible in the spelling, and first occurrence order is a solver-selected way of using the glyphs, rather than a printed instruction to construct a keyed alphabet.

## Source-shape test of the cover time

The same transcription contains **599 physical printed rune lines** across the 56 unresolved physical pages. Among the **577 contiguous 23-line windows** after removing the special 13-red heading from the first physical line, exactly **five** cover the entire 29-symbol alphabet with their 46 line-edge glyphs. They start at original line indices **0,1,2,3,4**, five overlapping windows from the *same physical opening region*. No independent later 23-line window has complete alphabet coverage.

A source-conditionally locked null fixes the original first **23 complete black lines** and draws **two different random source glyphs per line**, preserving every line width and all original on-line ciphertext. In **300,000 reproducible seeded draws** (xorshift state 0xacce4401, drawing across all 33 first black lines to keep one fixed random stream), only **54** contain all29 by the first46 tokens: conditional probability **0.00018**. The mathematical equiprobable-29-symbol i.i.d. coupon-cover probability for 46 draws is about **0.000175055**, a close reference check, although the manuscript is not iid.

This is a potentially useful *key candidate* and a local unusual source fact. It is **not** a discovery-wide significance test. The source-selected premise (line exteriors rather than words or punctuation) arose during prior investigation; the full-alphabet coverage was noticed after inspecting the edges; many other LP2 subsets have been considered. Sliding source windows are strongly overlapping. Consequently the \`54/300000\` should **never be reported as evidence of an intended cipher key at that nominal p-value**.

## One explicit historically grounded consumer, and result

The same project verifies genuine 2014 LP1 **subtractive Gematria Vigenère** decoding with the keys \`DIVINITY\` and \`FIRFUMFERENFE\`. Freeze the uniquely derived edge first-occurrence permutation above as a **29-rune periodic Vigenère key**, with no guessed phase, no F skips, and no word reset. Apply it to all **650 original inner runes**, preserving the first-character clock and all original positions:

\[
P_i=C_i-K_{i\bmod29}\pmod{29}.
\]

- Original 650-rune core IoC: **0.0341495792343**.
- Original core after the single edge-key receiver: **0.0344340405357**, with no coherent 150-rune plaintext.
- Exact original replay: **650/650** from the derived inverse.
- Actual solved p57-native rune text encoded with this same cipher plant recovers **650/650** (periodically repeated known native control).

Two natural static alphabet applications to the **independent 13-red-rune p0 title**, mapping original runes to first-occurrence ranks and the reverse keyed permutation, also yield no identifiable source-native instruction. The entire original opening is therefore unsolved; the direct historical Vigenère reader is retired. The result does **not** exclude using the 29-permutation as an IV or alphabet key for an explicitly **changing-state** codec, nor a different, authored treatment of line shells. Such a use first requires a printed or first-party instruction selecting its clock and consumption law; the pair counts, source geometry, and 23-line coverage do not supply that rule.

## What changes the next research choice

A plausible investigator may now keep the exact source-derived **29-symbol full alphabet** as an *exploratory source sidecar*, rather than hand-guess 29 alphabet symbols. However, the original 650-core has nearly uniform GP29 frequencies and previously failed key-independent stationary-period13/50 substitution gates. A **stationary substitution table** cannot turn that original core into native GP prose under the documented controls; a new proposal must explicitly alter the observed rune values with per-position state, change the interpretation register, or alter the segmentation. Requiring a genuine source-selected operation before testing on original ciphertext prevents another arbitrarily keyed permutation from producing misleading fragmentary phrases.
