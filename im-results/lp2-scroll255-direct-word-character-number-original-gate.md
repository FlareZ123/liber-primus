# Original scroll255 → p8 character-address receiver

**Decision (23 November 2026, Agent20):** The unusually exact **255 complete words** on physical LP2 pp3–7 and **255 following runes** on p8 do *not* support a direct one-character-per-word book-code decoder when the adjacent p8 rune is taken as its GP29 ordinal or the rune's listed GP prime. All four standard absolute index conventions run out of each original word at **at least 212 of 255 positions**. Forced cyclic wrapping produces uniformly distributed, nonlinguistic 255-rune strings. There is no authenticated plaintext, key, or first-party instruction for cyclic word-local addressing. This excludes a simple *specific* human-readable receiver without deciding whether the 255/255 alignment is intentional.

## Independent original clues and strict receiver

The complete original runic words across physical pp3–7, including genuine line/page continuations, total **255 words = 1,145 runes**. The next physical page p8 contains **255 runes**. The uniqueness of this word-count-versus-following-page-length equality across all 1,540 contiguous eligible original page windows was already established by [the distinct scroll registration and stateless-word-map study](../sims/lp2_scroll255_word2rune_anylookup_obstruction_sft.cjs); it is **prior work**, rather than a new claim here.

The signed 2016 Cicada hint says that the book's *words* are the *map* and their *numbers* are the *direction*. The simplest candidate would take source word \`W_i\` at position \`i\` and the *following page's* rune \`Y_i\` to select exactly one glyph \`W_i[k_i]\`. This uses the adjacent 255/255 source registers and a conventional 2014-available GP numeral; it does **not** assume a private word-hash function, GF(4) LFSR, or distant p50 grid. We froze two actual chart interpretations before reading any candidate letter: zero-based GP ordinal \`0…28\` or the GP chart's prime values \`2…109\`. Each has ordinary zero-based and one-based character-index conventions. The decisive test is whether the address even fits the authentic printed word. For completeness, we separately tried the new, unlicensed rule \`(k−base) mod length(W_i)\`, solely to show what rescuing invalid indices by wrapping would produce.

| Original p8 number | Character indexing | In-range | Invalid, 255 total | Full wrapped-string GP29 IoC |
|---|---|---:|---:|---:|
| GP ordinal | 0-based | 43 | **212** | 0.03538675312644743 |
| GP ordinal | 1-based | 43 | **212** | 0.033719314497452524 |
| GP prime value | 0-based | 17 | **238** | 0.03489269723637486 |
| GP prime value | 1-based | 21 | **234** | 0.03594256600277906 |

All direct interpretations fail the finite book-code range requirement on at least 83% of authentic source words. All four modulo repairs yield unfamiliar GP29 sequences with IoC near the uniform-alphabet level \`1/29 ≈ 0.03448\` (the 95-rune solved native p57 passage has ~0.0627; this shorter control is context, not a calibrated likelihood test). None has ordinary consecutive solved-style prose or specifies a key. One must supply an entirely new *source-given* character-position reduction rule to treat them as authored. The near-uniform scores are qualitative supplementary evidence; the raw out-of-bounds counts are the decisive exact exclusion.

## Reproduction and positive controls

[Read-only, single-file Windows Node.js 22 SFT](../sims/lp2_scroll255_direct_word_char_number_gate_sft.cjs) loads only the canonical source transcription and rune chart, asserts the 255/255 counts and exact 1,145-source-rune continuity, performs all four frozen full-original probes, emits the GP transliteration prefix and SHA256 of every 255-rune wrapped readout, and verifies four synthetic **255/255 legal character-address readbacks** on the same original words. The positives establish correct 0/1-index handling without fitting any original p8 digits. Full original output is deterministic and read-only. The 2016 signed message is merely a historically available motivation; it neither explicitly pairs pp3–7 with p8 nor defines modulo-word-length reading.

**Decision fork:** Leave the intriguing source 255/255 registration available as an *uninterpreted relationship*. A genuinely different channel would require its own observable author instruction, e.g. a letter-position normalization or an explicit intermediary key and independent untouched readout. More arbitrary modulo variants cannot overturn the simple index-range obstruction and are low-priority compared with locating an actual inverse or plaintext.

## All-secret character address with arbitrary word-length normalization (Agent7, 25 November)

The previous four literal index conventions do not cover an unknown number→position code. We now grant **every deterministic mapping from the paired p8 rune and authentic source word length to an in-range character index**, with no fitted alphabet or guessed modulo. Test both untouched p8 GP29 and the previously fitted, explicitly unauthenticated GF4/radix59 correction. For each, also test arbitrary signed absolute addresses per rune (from either end), and the wholly free one-character-per-word relaxation as a capacity rival. The p3–7 source remains exactly 255 complete groups/1145 runes; p8 255. The conditional pad is reproduced unchanged with all four Parikh equalities and exact reversal.

For each address-equivalence class, the best unigram likelihood over all legal choices is independent of every other class. With training counts n[r] and smoothing 1/5, each output contributes the integer factor 5*n[r]+1; the denominator is identical for all 255-symbol candidates. Multiplying the per-class maximum integer product gives the **exact global all-key optimum**, compared with exact BigInt products of every 255-rune window in each left-out native LP1 section. No beam, floating comparison, alphabet optimization, or guessed English words. Log values below are presentation only (nats per GP rune). The native source excludes the held section during frequency training.

| Held native section | Windows | Worst genuine window | Maximum signed key, raw / corrected | Maximum length-conditioned key, raw / corrected |
|---|---:|---:|---:|---:|
| 0_welcome | 261 | -3.042580 | -3.859293 / -3.939523 | -3.260130 / -3.234239 |
| 0_koan_1 | 526 | -2.974760 | -3.812876 / -3.880219 | -3.231946 / -3.215220 |
| 0_loss_of_divinity | 501 | -3.060097 | -3.844510 / -3.930060 | -3.248279 / -3.239621 |
| jpg107-167 | 65 | -2.950518 | -3.872587 / -3.939565 | -3.266429 / -3.233863 |

All **1,353 overlapping held native windows** exceed all respective original all-key maxima for both signed and arbitrary length-conditioned addressing. The latter grants 155 raw / 150 corrected occupied symbol-length classes, each with every legal character index. The independent forward-only absolute-address family is also excluded under the same comparison. This rejects literal native-prose extraction under a static p8-symbol address, even allowing independent arbitrary length-specific normalizations. It does not prove that all possible messages are absent: alternative alphabet, state, reordering, other register, or a private independently chosen index per word escape. The wholly free per-word control is not robustly excluded and is not a key recovery; it has no source-selected index. Do not fit a new key from this relaxation. 

**Controls:** 32 source-shaped plants (four target-excluded native texts, two target-symbol tapes, four modes); keep source group lengths and target class identities and embed the actual native target at a fixed hidden legal address per class. All recover all 255 literal target runes using the plant key; all exact optimum products dominate the true plant likelihood. These are capacity/readback controls, not blind hidden-key recoveries. The same integer-product optimizer returns a maximizing address map and full literal readout for every original case in the raw output; the upper bounds, rather than subjective previews, drive the decision.

**Reproduction:** [SFT](../sims/lp2_scroll255_allsecret_character_address_sft.cjs) · [full output](lp2-scroll255-allsecret-character-address-output.json). The exact core executed in connected V8 against the current repository source bytes; standalone Node/CI not run. No unknown plaintext, historical key, or authenticated consumer. Retire this exact static direct-extraction receiver and demand an independent source-selected state/representation before further work.
