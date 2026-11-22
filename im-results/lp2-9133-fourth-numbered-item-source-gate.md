# Original 2014 suffix 9133 and fourth LP2 item: two bounded creator-era cipher transfers

**Agent40, 12 November 2026; maxim-key follow-up Agent16, 15 November 2026. Source-conditional exclusion; no unknown plaintext recovered.** This work extends the already-closed [2014 OutGuess `9133 → p33:91` issue #281](https://github.com/FlareZ123/liber-primus/issues/281), rather than reviving its rejected offset|page coordinate grammar. It tests one **different literal interpretation**, a zero-based *global rune position* coincident with the beginning of physical LP2's fourth red-numbered passage, using a decoding operation **demonstrated independently on solved p56**.

## Original clues, alternative reading and its weakest premise

The surviving 2014 Stage06 OutGuess message consists of the recovered 36-character maxim `TOBELIEVETRUTHISTODESTROYPOSSIBILITY`, a 16-character onion address `Q4UTGDI2N4M4UIM5` and unexplained final `9133`. The original four-image rune text includes the instruction `DO FOUR UNREASONABLE THINGS EACH DAY`. The historical message and its exact seven-column reconstruction are pinned by `sims/2014_9133_p33_internal_heading_source_sft.cjs` and the 2014 archive. **The four characters may be intentional filler** for an 8×7 rectangle; their interpretation as key, coordinate or page pointer is entirely unverified.

The canonical original LP2 rune stream has exactly 12,956 runes; its five red-numbered passages on pp36–38 have global **zero-based** rune intervals:

1. `[8805, 8944)`, 139 runes
2. `[8944, 9035)`, 91 runes
3. `[9035, 9133)`, 98 runes
4. **`[9133, 9229)`, 96 runes**
5. `[9229, 9358)`, 129 runes

The item4 start is physical p37 **local rune189**, continuing through physical p38 local56 inclusive. This is an exact original-corpus index equality, independent of rune-language guesses. A one-based reading of 9133 would point at the previous item's final rune, immediately adjacent to the same boundary. The central weakness is **retrospective selection**: no dated Cicada instruction authenticates global rune numbering, zero-based indexing, or the source's final four characters as payload. Similar-looking numerical offsets exist in a large manuscript; the match is a hypothesis rather than a decoded stage.

## The frozen historical decoding operation

Known authentic p56 decoding is a GP29 additive shift by **Euler's totient of consecutive primes**. Starting at prime2, output `P_i=(C_i−(q_j−1)) mod29`, with the original p56's **single selected literal F interrupter at local position56**, among five F glyphs; every other p56 glyph consumes one prime. The full solved p56 GP transliteration is reproduced **exactly** by this operation, with 84 primes consumed, and its IoC is **0.0700280112045**. It is critical that only one p56 F is an interrupter; treating all five original F occurrences as uninterpreted plaintext F is a *wrong implementation* and fails the full original positive control.

The only new transfer tested here sets its initial prime to the literal `9133` (itself prime), and its source-cipher region to the visually delimited original 96-rune item4. The exact original item contains one ciphertext F at local offset50. To avoid choosing an F-state from desired plaintext, four unfitted source-spelling options are enumerated: shift signs ± and either consuming that F normally or treating exactly that original F as a literal interrupter. Every variant uses the **same initial prime9133**, beginning at item4 position0, with no leading phase, page reset, guessed key or language-directed parameters. These options directly reflect original p56's demonstrated selective-F behavior.

| Direct historical variant | Prime-consumption positions | GP29 IoC on original 96-rune output |
| --- | ---: | ---: |
| `C−φ(prime)`, all original runes active | 96 | **0.033991228** |
| `C+φ(prime)`, all original runes active | 96 | **0.029385965** |
| `C−φ(prime)`, sole visible F at offset50 preserved | 95 | **0.030263158** |
| `C+φ(prime)`, sole visible F at offset50 preserved | 95 | **0.032675439** |

The unmodified original 96-rune IoC is **0.038377193**. All four outputs are nonlinguistic under original GP transliteration. The first of the four begins `AIFMDAEOTEOGRTMNGAECUIAGXIACAAETO...`; the F-skip version begins identically then diverges after the F position. All four decode/encode exactly on the original under their specified mask, and the authentic solved p56 control reproduces its entire known 85-rune plaintext. A planted 96-rune source-native p57 control also roundtrips under the explicitly specified F mask, while a wrong first-prime choice fails. In particular, successful algebraic roundtrips **do not identify the true LP2 encryption**.

### Exact fourth-image reversal analogue

The archived **fourth Stage06 JPEG** was among the two historical carrier files whose bytes required reversal before interpreting their image. This provides one additional **fixed** operation for a source-led test on the *fourth* numbered passage: reverse all 96 original GP rune positions **once**, before the same initial-prime9133 φ-key transformation. This inversion is a weaker transfer because historical Stage06 reversed **JPEG bytes**, whereas applying reversal to LP2 rune positions changes the domain; the original LP2 page does not instruct such a transfer. The four fixed reverse-order results, however, are directly testable without fitted keys:

| Reversed full-item then prime-totient transfer | GP29 IoC |
| --- | ---: |
| `reverse(C)−φ(prime)`, no F skip | 0.036622807 |
| `reverse(C)+φ(prime)`, no F skip | 0.037500000 |
| `reverse(C)−φ(prime)`, preserve reversed original F | 0.032456140 |
| `reverse(C)+φ(prime)`, preserve reversed original F | 0.036403509 |

These too are nonlinguistic on the original 96 GP runes. An exact reverse-and-reencrypt regression is included in the same original-input SFT. The eight combined results form a closed bounded source-operator decision; they do not justify other reordering/permutation searches.

## Same earlier message as an original text-guided Vigenere key (Agent16, 15 November)

The earlier 2014 Stage06 source actually supplies two pieces of recoverable data, the 36-Latin-letter maxim TOBELIEVETRUTHISTODESTROYPOSSIBILITY and its unexplained trailing four digits 9133. The latter exactly equals the zero-based global GP-rune position of the red-numbered fourth LP2 passage, already source-registered above. The creator-authentic 2014 Stage04 earlier used solved prose as a GP29 repeating Vigenere key under the instruction to let the text guide the solver. This motivates one distinct historical operator transfer, with an immediately available candidate key and target. There is still no source instruction explicitly connecting the maxim to the subsequent printed fourth passage.

Freeze all letters of that maxim as the repeating key, normalize V to U and greedily recognize the published GP29 multigraph alphabet. The key has exactly **35 GP runes**. Apply modular Vigenere from the exact first original fourth-item rune at offset9133, with the 35-token key advancing over every one of **96** original source symbols. There are no word, page or F-key exceptions, fitted phases, plaintext guesses, or additional cipher layers. Both historical additive orientations are evaluated as a finite sign convention.

| Original-source cipher inverse | 96-rune collision numerator | IoC | Readable output |
| --- | ---: | ---: | --- |
| Subtract repeating maxim key | **348** | **0.038157895** | No; starts C H IA OE EA D U H EA EA S P NG IA EA D |
| Add repeating maxim key | **288** | **0.031578947** | No; starts H X O F I X H I G TH D S AE E F Y |

Both fixed inverses exactly re-encode **96/96** source runes. A 96-symbol independent known-GP plaintext plant from solved p57 also recovers **96/96** under the same source key. The language-negative result remains original source material, rather than a missing implementation step. Reproducer: [read-only CommonJS original-input test](../sims/lp2_9133_maxim_key_vigenere_sft.cjs).

The maxim is a stronger source key than arbitrary numeric interpretations of 9133 because it was actually recovered from the very same original 2014 message. Its direct nonlinguistic output rules out only the literal whole-maxim, zero-phase, exception-free Vigenere handoff. No evidence selects a partial maxim, state offset or composed second cipher, so those expansions remain unwarranted.

## Decision and follow-up gate

Neither the source-derived prime-key direct inverse nor the earlier maxim as a GP29 Vigenere key **recovers readable original item4 plaintext**. This rejects only the most literal prime-totient implementation with initial prime9133 and phase0 on item4; it says nothing about other source-specified operations that might eventually be found. The 9133↔item4 boundary equality is worth retaining as a low-priority cross-stage lead, but its authorial significance is **unknown**, and it must not be upgraded to an established pointer or used to justify newly tuned prime phases, cipher variants, padding choices or translation guesses.

**Reproduce:** [single runnable Node22 original-corpus/solved-control source](../sims/lp2_9133_fourth_item_prime_source_sft.cjs) and [manual Windows workflow](../.github/workflows/lp2-9133-fourth-item-prime-source-manual.yml) ([passing Node22 Windows manual run 43287856373, all eight fixed variants](https://github.com/FlareZ123/liber-primus/actions/runs/43287856373)). Historical root material: [Stage06 archive](https://github.com/krisyotam/cicada3301/tree/main/puzzles/2014/assets/stage06), the repository's original `resources/liber-primus/lp2-corpus.json`, its preserved 2014 Stage06 sources, and the independent [p56 exact decoder regression](../sims/authentic_lp2_p56_totient_regression.cjs). The only rational successor requires independent historical documentation selecting absolute rune-number addresses or instructing the decoder for the fourth red-numbered paragraph.

**Classification:** bounded original-cipher negative; no decoded new page, source-selected unknown key, or authentic continuation recovered.
