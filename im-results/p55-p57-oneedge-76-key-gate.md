# P57 word-circumference stripping: corrected 75-body and earlier 76-page hypotheses

**Classification:** two distinct source-sized, reversible word-edge keys tested on the **actual 75-rune p55 body**, and the earlier twelve 76-page decoders plus the printed numerical perimeter test. All original-input decodes fail to recover native-GP plaintext. These are finite operations suggested by the solved p57 command, not authenticated Cicada key instructions.

## Corrected source-first 75-rune key: shave all twenty printed p57 words (12 November 2026)

**Source boundary:** p55 starts with an `NG` rune completing p54's last word. Therefore its own **16 complete printed words contain 75 runes**. In independently solved p57, the seven-rune **PARABLE** heading and the 19 separately printed body words form **20 actual words totaling 95 runes**. One literal reading of “SHED OUR OWN CIRCUMFERENCES” removes exactly one first (or last) rune from **every one of the 20 complete p57 words**, including the heading. This produces two different **95−20=75** GP29 keys for the complete p55 body, without padding, guessing the carried rune, or truncating a key. The existence of an exact length fit does not independently select an additive cipher or prove intended key reuse.

Hold fixed the printed p57 word order and GP29 indices, apply exactly `P[i]=(C55body[i]±K[i]) mod29` with phase zero, and retain the 16 original p55 word boundaries for output. No secret offset, wordwise restart, reverse read, F skip, or fitted parameter is permitted. The GP29 addition/subtraction choice comes from previously solved genuine LP1 Vigenère. All four original outputs fully re-encrypt the original 75 symbols and recover the same 75-runic solved-p57 control under a planted source key.

| p57 word-edge removed (20 words) | Original-input decoding | Decoded p55-body IoC | Distinct key rune labels | Native readable plaintext? |
| --- | --- | ---: | ---: | --- |
| First rune | `C−K` | 0.03963964 | 21 | No |
| First rune | `C+K` | 0.03423423 | 21 | No |
| Last rune | `C−K` | 0.03351351 | 20 | No |
| Last rune | `C+K` | 0.03819820 | 20 | No |

Untouched original p55-body IoC is **0.03855856**, lower than the minimum **0.04540541** across all **3,462** independently solved LP1 75-rune overlapping native-GP controls. Every decoded candidate remains below the same native-language comparison floor and none forms coherent GP text. As a distinct necessary-condition check, treating either shaved 75-rune source as *literal* p55 plaintext under any monoalphabetic bijection plus transposition is impossible: the actual p55 body has **25** distinct GP labels while the candidate source has **21** or **20**. This label-count obstruction does **not** apply to the separate polyalphabetic additive key hypothesis.

This **corrected 75-body test is distinct** from the previously archived 76-rune page-local read below, which keeps the seven-rune heading and shaves only the 19 body words. Both exact mappings are now tested, rather than interpreting either numerical coincidence as a decoder. The [standalone CJS original SFT](../sims/p55_p57_title20_shed75_source_sft.cjs) passed [manual GitHub Actions step 4](https://github.com/FlareZ123/liber-primus/actions/runs/43261681429). That whole workflow concludes failure at a **later, unrelated legacy `p55_2016_sha1_exterior_crib_inner_sft.cjs` score assertion**; its first four research steps, including this new test, all passed. The source-led 75-body edge key is therefore retired as a *direct* GP29 additive plaintext route, while other independently specified operations remain open.

## Direct 52-rune SHED key on the last three p55 lines (Agent43, 12 November 2026)

A more local interpretation of the exact **52-rune** innermost-ring/SHED motif uses the source *without* shaving its 20 words. The last three original p55 printed lines contain **22+22+8=52** GP29 runes, starting at physical p55 rune **24**. The original clear p57 imperative begins with *SHED* at rune **43** and occupies its last **52** GP29 runes. This gives two independently source-cut, same-length strings. Under one frozen authentic 2014 additive-key operation, subtract the **unchanged p57 final52** GP values from the **unchanged p55 final52** ciphertext in order, with no fitted start/phase, F skip, per-line reset or additional alphabet mapping.

The actual 52-rune result transliterates as:

\`PNGAETTFUIUEOSTHSIOEHPJPMOFDOEAHUEOEOBNGHXTHOENGTHEAEOOEUAAELCNGEOPEONG\`

It has GP29 IoC **0.040723982**, a Shakespeare-native conditional-trigram score of **−4.66107123** nats/rune versus the raw original p55 suffix **−4.32452320**. All **4,185** original-source 52-rune Shakespeare control windows (52-rune stride) score from **−2.92662377** to higher native values; **0/4,185** perform as poorly as this candidate. A complete authentic-GP-native 52-rune planted message decrypts and re-encrypts exactly, as does the original ciphertext, but no original plaintext emerges. The split after p55's first line also interrupts an original complete word (the 7th p55 word crosses the line), so there is no independent lexical instruction selecting this key transfer.

**Decision:** reject this *specific* fixed SHED-suffix-as-pad interpretation. The visually striking 52+52 alignment and p57 exhortation remain unproven as an actual cipher instruction; do not search other start phases, word resets, signs or substring cribs without a new original clue. [Standalone source-exact CJS SFT](../sims/p55_p57_sh_ed_52linekey_sft.cjs).

## Fixed source-selected framing

Physical p57 (already solved in ordinary GP29) contains a **seven-rune PARABLE heading** followed by **19 separate body words totaling 88 runes**. Its 95 original runes are thus `7+88`. Physical p55 contains **76** original runes. A literal reading of the p57 phrase “shed our own circumferences” suggests removing *one outer rune per body word*:

`7 (unchanged heading) + (88 − 19) = 76.`

Exactly two directional choices are admitted: retain the PARABLE heading, and remove either the *first* or the *last* rune from each of the 19 body words, using the original printed word segmentation. Each resulting 76-rune GP29 stream becomes a candidate full-length key for the original 76-rune p55 ciphertext, in source order. The sentence and manuscript do not actually command this key transfer. The matching length makes it a bounded hypothesis worth testing once.

Earlier [19×4 / 19×5 affine-code work](terminal-p55-p57-19block-affine-obstruction.md) rejected fixed secret block matrices on unsegmented pages; it did **not** cover removing first/last glyphs from the *printed* body words. The broader [circumference report](instar-circumference-edge-strip.md) tested other ring and repeat-key interpretations, but did not test these specific 76-rune keys against p55 under the two established differential rank conventions.

## All-secret monoalphabetic exclusion independent of source position (Agent47, 12 November 2026)

The same two **source-specified 76-rune** stripped-p57 sequences can be tested as **literal plaintext candidates for p55** under *every possible* secret fixed bijective GP29 symbol substitution, independently of the numerical decoder/key candidates below. A bijection preserves the number of distinct rune labels even if an arbitrary, independently imposed reading order permutes their positions. In the original verified runes:

| Complete 76-rune sequence | Distinct GP29 symbols |
| --- | ---: |
| Original ciphertext p55 | **25** |
| Solved p57 heading + body words with each **first** rune shed | **22** |
| Solved p57 heading + body words with each **last** rune shed | **20** |

Because `25>22` and `25>20`, **no monoalphabetic bijection and no subsequent transposition** can map either literal source candidate onto the unmodified p55 ciphertext. This is key-independent; there is no need to try 29! alphabets. It does not reject an independent polyalphabetic/stateful cipher, homophones, insertion, or another intermediate register. [The existing SFT](../sims/p55_p57_oneedge_76_key_gate.cjs) now asserts these exact three distinct-symbol counts before its earlier candidate-decryption tests. Its 12 direct/rank-decoder results below remain unchanged.

## Twelve frozen complete-page decoders

Two source-derived keys are each evaluated under exactly six reversible operations:

- Original GP29 additive cipher, with `P_i = C_i ± K_i mod29`, two signs.
- Anti-doublet GP28 ciphertext-difference encoder, with `Δ_i = (C_i-C_(i−1)) mod29`, `C_(−1)=0`; nonzero differences are converted either by `Δ−1` or by the discrete logarithm base 15 in GF29; `Δ=0` emits the reserved EA symbol; the two key signs are tested for each rank convention.

All twelve models completely re-encrypt **76/76 original source runes** and recover **76/76 planted known GP29 plaintext runes**, with a forced EA sentinel testing the zero-difference channel. The differential model has a p55 ciphertext repeat at one noninitial position, handled without loss. No phase/offset/word reset, key permutation or unrestricted alphabet fit is introduced.

The strongest candidate is *remove-last, GP28 ordinal difference, positive key sign* with decoded IoC **0.04385964912**. The next relevant simple direct-GP29 candidate (remove-first, subtraction) reaches **0.04035087719**. All other source candidates lie from **0.03122807018** through **0.03894736842**. Every decoded transliteration is nonlinguistic.

As a matched-length native-language comparison, the repository's solved LP1 reference provides **3,504** greedily encoded GP29 runes, and **3,429** consecutive 76-rune windows. The **lowest** reference IoC is **0.04561403509**. All twelve original candidates remain below that floor, including the highest GP28 candidate. This benchmark describes the tested GP-native register; it does not forbid an unknown language, compressed intermediate or a separate source-provided transform.

## A three-way inverse: p57-shaved candidate plaintext, p55 ciphertext, p50-ring key

This incremental source test is reproduced independently in [the p55/p57/p50 76-rune bridge SFT](../sims/p55_p57_shed19_key_bridge_sft.cjs); the earlier one-edge key SFT below still owns the 12 direct/differential decoders.

Read the real 32×8 table's perimeter from top-left, across the top, down the right side, along the bottom from right to left, then up the left side, without repeating corners: **76 source token values**. Reverse that complete ring as the sole direction alternative. The conventional published base60 interpretation gives original bytes 0…255, reduced modulo29 for a direct GP rune pad.

Under the exact candidate `C55 = shed(P57) + perimeterPad mod29` or `C55 = shed(P57) − perimeterPad mod29`, the **required** pad is `(C55 − shed(P57)) mod29`. Because both p55 and the shaved p57 are fixed original strings, **no guessed plaintext or cryptographic key is used**.

| p57 shaving | Ring direction | Matches if ring added to known p57 | Matches if ring subtracted |
| --- | --- | ---: | ---: |
| First | Clockwise | 1/76 | 4/76 |
| First | Reversed | 4/76 | 3/76 |
| Last | Clockwise | 5/76 | 6/76 |
| Last | Reversed | **6/76** | 4/76 |

Every direct ring interpretation has at least **70** contradicted positions. There is no resulting source-key encryption of the observed p55 ciphertext under these stationary source-order rules.

More permissively, allow the **entire 76-byte table perimeter** to act through an **arbitrary completely unknown but fixed function** `F(byte) → GP29 pad`, with a different free F for each of the four source readings. This contains *every possible stationary substitution codebook*, including the ordinary byte residue rule. The original perimeter has **68 distinct byte values** in 76 positions, hence eight repeated-token occurrences. A single stationary function must give identical pad for each repeated token. The exact maximum-match calculation sums the modal required-pad frequency for each source-token class:

| Shaving / perimeter orientation | Absolute maximum exact positions under every secret lookup | Forced errors |
| --- | ---: | ---: |
| First / clockwise | **68/76** | 8 |
| First / reversed | **68/76** | 8 |
| Last / clockwise | **70/76** | 6 |
| Last / reversed | **69/76** | 7 |

Thus no *fixed token-to-key lookup*, regardless of its unknown 256-entry content, can make the two original terminal strings form a clean additive relation using this literal 76-cell ring order. This conclusion is conditional on the p57 shaving actually being the proposed p55 plaintext, which is **unproven**. A stateful or position-dependent key and another geometric traversal remain logically possible, but no original source selects them.

## P57 19-word numerical key: independent direct GP29 test

A second literal interpretation of the signed 2016 hint “Its words are the map … their numbers are the direction” lets each of p57's **19 body words** supply one additive GP29 key value, repeated across a consecutive group of four p55 runes. The two obvious source-authentic word values are sum of GP rune indices and sum of GP prime weights, each modulo29. These yield precisely **19×4 = 76** p55 decoded runes with no chosen phase. All four plus/minus streams have IoC in **0.032632–0.041404** and no native-GP prose. This excludes those four direct scalar-key reads alone. The 19×4 block assumption is not an independently printed p55 layout.

**Executed source test:** [Node 22 workflow run 43168398561](https://github.com/FlareZ123/liber-primus/actions/runs/43168398561) completed this new SFT step successfully. The combined legacy workflow failed at an **unrelated pre-existing** p55 SHA1 score assertion in another SFT; see run log. The new SFT reads the exact original p55/p57 corpus and 32×8 grid and includes native-GP and secret-map positive plants.

## Decision

**Retire these specific p57 one-edge-stripped keys as stand-alone GP29 additive or protected-zero GP28 differential decryptors of p55.** Also retire the exact direct p50 perimeter pad and every stationary unknown byte-to-GP-pad lookup in printed/reversed circumference order when the shaved p57 text is used as the proposed known plaintext. The 95−19=76 source-length equality and the explicit printed 19-word segmentation survive as observations, but do not license further fitted trims, key schedules or cipher menus without an independent instruction.

[Single-file, dependency-free CommonJS reproducer](../sims/p55_p57_oneedge_76_key_gate.cjs) uses the pinned original runic transcription, GP alphabet, solved p57 and p55 physical page indices, and solved LP1 reference. It asserts the exact source counts and all original/plant round-trips.
