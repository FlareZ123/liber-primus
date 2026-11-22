# Original LP2 word-length external-crib gate

**Evidence status (22 November 2026):** exact bounded negative for a verbatim original English source with preserved printed words, plus a successful original solved-page calibration. No plaintext recovered.

## Cryptanalytic rationale

The 55 rune-bearing unknown physical pages p0–p55 contain 2,896 author-printed words and 12,956 ciphertext runes. A direct encipherment that changes rune values while preserving every printed word boundary must preserve the sequence of each source word's length in *Gematria Primus* glyphs. A sufficiently long match can recover a candidate external text without choosing a key, useful for testing a genuine original-cipher inverse. This requires a verbatim English source, a deterministic GP29 spelling convention, and unchanged original word divisions. Different translations, spelling changes, editorial punctuation, interrupted excerpts, compound splitting, inserted words, non-English plaintext and word-boundary-changing transforms remain outside the test.

The detector counts `ING, TH, NG, EO, OE, AE, IA, EA` as single GP runes, greedily from left to right after uppercase Latin normalization, and counts other letters separately. Historical GP spelling makes K/C, V/U and Z/S one rune each; source Q is expanded as CW, a two-rune phonetic spelling (the prior literal-Q one-rune variant is also negative). In the manuscript it joins printed line wraps and uses each original `-` or punctuation word boundary. The 57 actual rune-bearing page portions in the original transcription reproduce the `lp2-corpus.json` page rune totals exactly. As a positive authentic-language control, the entire clear p57 **PARABLE LIKE THE INSTAR ... EMERGE** passage reproduces its **20 printed word lengths exactly**, including GP `TH`, `NG`, and `ING`.

## Locked source set and outcome

The same original 55-page index has **2,323** exact 12-word windows, all distinct. The source corpus uses pinned public raw-text editions: all **66** KJV books from [takelley1/plaintext-bible-kjv](https://github.com/takelley1/plaintext-bible-kjv/tree/0e8cc040bfb69f564e15ba93b2569b00e28420a8), Shakespeare's [tinyshakespeare](https://github.com/karpathy/char-rnn/blob/6f9487a6fe5b420b7ca9afb0d7c078e37c1d1b4e/data/tinyshakespeare/input.txt), and Gibran's [The Prophet](https://github.com/GITenberg/The-Prophet_58585/blob/6ebc10889ae826388c63daaaf2fd2eb1d9f64e58/58585-0.txt). KJV verse-number prefixes are removed. The primary endpoint is an exact original unknown-page 12-word GP-length match; a secondary screen seeds 7-word exact matches, then inspects a 24-word continuation without changing source/target alignment.

**Windows Node22 result:** [manual read-only run 44983128293](https://github.com/FlareZ123/liber-primus/actions/runs/44983128293), PASS, original script [`sims/lp2_external_wordlength_crib_gate_sft.cjs`](../sims/lp2_external_wordlength_crib_gate_sft.cjs).

| Input and endpoint | Observed |
| --- | ---: |
| Original unknown LP2 rune-bearing pages | 55 |
| Exact original 12-word windows indexed | 2,323 |
| Public-domain source files processed | 68 |
| Source words processed (normalized) | 1,009,916 |
| 7-word exact prefix/seed matches | 6,060 |
| 12-word exact matches | **0** |
| Seed hits with 20 of following 24 word lengths identical | **0** |
| Original solved p57 length-by-length positive | **20/20** |

The best 24-word partial alignments reproduce 15 of 24 word lengths: several KJV sources and Shakespeare. A late-page 14/21 source alignment is likewise insufficient, and none meets the frozen 20/24 near threshold. These are incidental short-source alignments.

## Decision

The checked KJV, tiny Shakespeare and Gibran editions do **not** provide a ≥12-word verbatim contiguous original LP2 unknown-page crib under the stated direct-print and GP29 normalization model. The source books are not excluded as inspirations, plaintext translations or providers of a short clue/key. This is a bounded acquisition negative; it does not discriminate a full ciphertext architecture and does not make an exact unknown-page plaintext claim.

New source acquisitions should require an **independently identified historical passage** or a source-specific manuscript illustration/reference selecting one title, rather than broad unconstrained additional author scraping. A credible match must first be confirmed over original scan word divisions and aligned to a withheld continuation, then identify a reversible cipher rule and forward-generate original ciphertext.
