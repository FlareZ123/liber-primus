# Opening 33-line perimeter: the GP29 first-occurrence alphabet and two failed historical Vigenère receivers

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

Two natural static alphabet applications to the **independent 13-red-rune p0 title**, mapping original runes to first-occurrence ranks and the reverse keyed permutation, also yield no identifiable source-native instruction. The entire original opening remains unsolved; this plain-key-periodic receiver fails, and the separate custom-tabula-recta construction below also fails. The result does **not** exclude using the 29-permutation as an IV or alphabet key for an explicitly **changing-state** codec, nor a different, authored treatment of line shells. Such a use first requires a printed or first-party instruction selecting its clock and consumption law; the pair counts, source geometry, and 23-line coverage do not supply that rule.

## Director #2401: the same alphabet as a custom Vigenère tabula recta

The first consumer used the **29 exterior-first-occurrence glyphs as an ordinary numeric repeating key**. A materially different, already historical primitive is a **Vigenère tabula recta under a source-chosen alphabet order**. The actual 2014 post-square source demonstrates subtractive GP Vigenère and uses a fixed reversed rune alphabet. For this bounded experiment, conditionally **replace** the canonical GP ordering with the first-occurrence exterior ordering, and use the physically disjoint first **13 red original p0 heading runes** as a periodic key. The source places both operands before the opening body; it does **not** tell the player to replace the published alphabet, so this is an explicitly conditional original-cipher test.

Let \`A=[2,22,3,27,13,0,15,10,25,9,18,6,17,11,21,28,12,16,7,24,8,19,20,1,4,23,5,26,14]\` be the actual 29-glyph permutation in canonical GP indices, \`rank_A\` its inverse, and \`K=[15,8,18,3,6,19,27,0,15,26,18,21,5]\` the independent printed red13 heading. The complete frozen inverse is

\[
P_i=A\left[(\operatorname{rank}_A(C_i)-\operatorname{rank}_A(K_{i\bmod13}))\bmod29\right].
\]

The opposite global sign is one predeclared orientation control. The original 33 physical black lines stay in place: exactly **66** line exteriors supply the alphabet and **650** untouched interiors are the target, split into **225** original p0 and a disjoint **425** p1–p2 runes. Every original target rune consumes exactly one of the 13 key positions; no F exception, language-ranked phase, word reset, secret alphabet trial, or edited source byte is admitted.

| Fixed source-first-occurrence tabula recta | All 650 IoC | p0 (225) IoC | p1–2 untouched (425) IoC |
| --- | ---: | ---: | ---: |
| Original untouched printed core | 0.034149579234 | — | — |
| Historical subtractive direction | **0.034505155861** | **0.034761904762** | **0.034972253052** |
| Opposite direction control | **0.034604717317** | **0.034920634921** | **0.034317425083** |

The subtractive output opens \`I H Y IA O T C P P H O F N R D C B B T F S OE...\`, and the opposite opens \`A O W I R OE IA NG EO EO L P IA I I T EO F OE...\`. All fixed source outputs remain close to uniform 1/29 and produce neither 150 original prose runes nor a disjoint p1–2 plaintext continuation. Both exact original complete 650-rune replays succeed; two forward-encrypted **650/650 authentic solved-p57 GP29 plaintext plants** decode exactly under their respective fixed directions. This demonstrates executable inversion, not original-key authentication.

The [complete Windows Node22 original-source SFT](../sims/lp2_p0_edge29_red13_customvigenere_original_sft.cjs) reconstructs all 33 line breaks and 729 original input runes, asserts the 46-edge alphabet cover, keeps red13 and the 650 target runes disjoint, and prints **both entire 650-rune output streams** for independent scrutiny.

**Decision:** the source-conditional **custom tabula recta + authentic red13 periodic key** fails to recover the p0 body or its p1–2 heldout passage under either historically defensible direction. This closes the exact two-operand stationary Vigenère transfer in Director #2401. The unusual 46-edge alphabet coverage remains an exploratory source observation without a printed instruction that it should replace the standardized Gematria Primus order. A changing-state use would require a separately sourced clock or receiver before further trial.

## Signed BASE29 as a direct binary stream: source-first-occurrence readout

**Agent8, 23 November 2026. Source-conditional negative.** A genuinely distinct historical primitive from Vigenère is the first-party 2013 numeric `BASE29` conversion, attested by the signed example `3QO` → 3301. The source-derived 29-permutation above can instead serve as a **digit alphabet**. Read the entire original **650-rune** opening 33-line core as **one big-endian base29 integer**, then emit its shortest big-endian binary byte string. This tests the direct standard radix codec (which might have exposed an ASCII/PGP message or compressed payload), without selecting arbitrary block widths, byte offsets, cipher keys, word subsets or target content. Preserve all 66 line-edge symbols as the source-only alphabet sidecar and the disjoint 13 title runes in the original page census. No signed author document directs BASE29 specifically to these p0–p2 interiors, so the route remains a **conditional** hypothesis.

Exactly **two** input alphabets have an independent source basis: published canonical GP29 rank 0..28, and source-first-occurrence rank of the 29 edge glyphs. The [single-file Windows Node22 test](../sims/lp2_p0_edge29_base29_ascii_original_sft.cjs) asserts every printed line length, 13+66+650 conservation, edge cover by ordinal46, the known 2013 BASE29 number, and a source-native synthetic 35-byte PGP-header binary pack→base29→unpack control. The original **650/650** digits round-trip exactly in either alphabet.

| Literal source-first BASE29 byte consumer | Output length | Hex prefix (first 16 bytes) | Printable fraction | Recognizable payload |
| --- | ---: | --- | ---: | --- |
| Canonical GP29 ordinal | **395 bytes** | `13f87819c37e5638cb9f4ab0122bf7b8` | **0.34683544** | No |
| First-46 original edge-derived ordinal | **395 bytes** | `17cbc6a66c05698d163aec45a7c3b254` | **0.38481013** | No |

Both original outputs have near-binary-random readability, lack known file magic, PGP armor, legible URLs or contiguous source-language prose. Neither is a recognizable 2014 payload. Full output SHA-256: canonical `d678ae241892d216cd5dda90ceda3aef88ca6b43a22924c93f1472487e0aa7b1`, edge-derived `25506ac5526a4496cea6be4d0106f569ab22d7b66d098fcedfc3140b47603888`. [Complete original-source Windows PASS 45194997778](https://github.com/FlareZ123/liber-primus/actions/runs/45194997778).

**Decision:** the direct whole-core source-selected BASE29→bytes interpretation is closed for these two unmodified alphabets. Variable per-word packets, different byte grammar or compression layers are distinct hypotheses and need their own **source-selected** evidence; do not tune arbitrary byte grouping or offset to rescue an unrecognizable readout. This provides no LP2 plaintext or decipherment key.

## What changes the next research choice

A plausible investigator may now keep the exact source-derived **29-symbol full alphabet** as an *exploratory source sidecar*, rather than hand-guess 29 alphabet symbols. However, the original 650-core has nearly uniform GP29 frequencies and previously failed key-independent stationary-period13/50 substitution gates. Neither tested historical Vigenère receiver recovers native GP prose, and neither canonical nor edge-derived direct BASE29 binary readout produces a recognizable payload; stationary substitution tables also cannot turn the source core into native-GP prose under the documented key-independent controls; a new proposal must explicitly alter the observed rune values with per-position state, change the interpretation register, or alter the segmentation. Requiring a genuine source-selected operation before testing on original ciphertext prevents another arbitrarily keyed permutation from producing misleading fragmentary phrases.
