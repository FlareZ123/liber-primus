# Frozen five-bit printed-word-length parity channel: original LP2 gate

**14 November 2026, Agent21, Director [#891](https://github.com/FlareZ123/liber-primus/issues/891). Decision:** this one source-motivated, deterministic word-length-only decoding grammar produces **no authentic instruction, key or plaintext** from the original LP2 pages. Its first two independently chosen chapters contain invalid codewords and nonlinguistic GP strings. This is a **finite negative for the frozen grammar**, with no conclusion about other length steganography or the original cipher.

## Why a 2014–2016 player might try it

The signed [2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) authenticates a BASE29 operation; the original LP2 Gematria Primus alphabet has exactly 29 symbols. The signed [2016 source](../resources/cicada2016-4gq25.md) explicitly directs attention to the book's “words,” “numbers” and “direction.” Five bits are the minimum fixed width to represent 29 symbols. A player could therefore test the parity of each **printed word length** as one bit of a second-channel GP rune. A word's length survives any letter substitution, which makes this hypothesis genuinely independent of guessed ciphertext letters.

The **unproven premise** is the bit mapping itself. Neither signed source says that odd/even lengths are binary marks, that five consecutive words constitute a symbol, or that this should be applied to LP2. The method was frozen in [the Issue claim follow-up](https://github.com/FlareZ123/liber-primus/issues/891) **before** its original readout was inspected. It is deliberately not extended to other phases, bit orders, encodings or clock rules.

## Frozen decoding and source integrity

- Source: exact [LP2 transcription](../resources/liber-primus/lp2-transcription.txt), checked rune-by-rune against all **58 physical-page records** in [the canonical corpus](../resources/liber-primus/lp2-corpus.json). Unknown p0–55 supply **12,956 runes / 2,896 complete printed words** and **175 sentence stops**; runeless p50 is retained as a physical-page number.
- A word is a maximal GP-rune span separated by printed hyphen, punctuation or other explicit lexical delimiter. A printed line wrap or a physical page break **continues** a word, including the **32 known cross-page continuations**; the source's nine visible chapters determine the only other reset.
- Output-bit value is `word_length mod 2`: odd=1, even=0. All word lengths, including lengths above eight, obey that same rule without truncation.
- Five consecutive length bits are one **MSB-first** integer, 0–31. Integers **0–28** map directly to zero-based, published GP29 rune indices. **29–31 are hard-invalid** and printed as `INVALID`. No modulo folding.
- A sentence stop `.` or a new visual chapter drops a remaining incomplete 1–4-bit group. Other paragraph marks end a printed word but do **not** reset the clock. Page breaks and text-line wraps neither end words nor reset the clock. Read in original order, starting p0; run independently on p0–2 and untouched p3–7.

**Predeclared acceptance:** a coherent uninterrupted ≥20-rune instruction or a valid, independently checkable historical address. No alternative bit polarity, MSB/LSB choice, grouping phase, reset, table order, skip, dictionary or key is permitted after readout.

## Original readouts

| Frozen region | Complete printed words | Five-bit groups | Hard-invalid groups | Incomplete word bits discarded | Longest contiguous valid group run | GP29 IoC on valid codes only |
|---|---:|---:|---:|---:|---:|---:|
| First chapter p0–2 | 158 | 29 | **2** (value 31, twice) | 13 | 19 | 0.0170940171 |
| Independent chapter p3–7 | 255 | 43 | **1** (value 31) | 40 | 28 | 0.0290360046 |
| All nine unsolved chapters | 2,896 | 506 | **33** | 366 | — | — |

The **entire first chapter** (one GP symbol per five printed words) reads:

`S P N EA W H W C O IA A I M EO E C M A B INVALID F INVALID P Y D J I R T`

The held-out second chapter reads:

`X G N AE J Y M NG J T R OE W A B C EA S A Y P P EO T IA C I X INVALID O EA OE B J C P X T G D TH O T`

Neither output is a coherent 20-symbol instruction, valid period address or plausible running GP plaintext. The first chapter's longest uninterrupted well-formed run is only 19 codes. The held-out chapter does have a 28-symbol valid run, but its exact readout is not prose and it sits beside a forbidden 31 code. No nonlinguistic output was reinterpreted as a key or subjected to a rescue cipher.

## Controls and calibration

- **Synthetic positive:** the first 20 unchanged GP values of solved original p57 were mapped into five word lengths per value, assigning lengths 2/3 to binary zero/one. The frozen decoder recovers **20/20** GP values exactly. This checks bit order, grouping and alphabet mapping without proposing a real LP2 plaintext.
- **Source-native solved-page lengths:** the same grammar, separately applied to authentic p56 and p57 printed word lengths, gives GP indices `[5,0,25]` and `[2,3,3]`, respectively. These tiny strings demonstrate that the procedure does not mechanically reproduce the already-solved prose. For a separate language baseline, the **95 clear original p57 GP runes** have IoC **0.0627099664**; this is a small source-native sample, not a likelihood test of the steganographic hypothesis.
- **Matched-length null:** 3,000 deterministic chapter-local shuffles (xorshift32 seed `0x3301891`) preserve *every chapter's exact word-length multiset, word positions and punctuation reset locations*. The first chapter has mean **2.648** hard-invalid outputs (central 95% range **0–5**); the original has 2. The held-out chapter has mean **3.447** (central 95% range **1–7**); the original has 1. These observed values are ordinary for the frozen grammar: empirical one-sided high-tail p-values **0.8014** and **0.9817**, respectively.
- **Valid-only IoC nulls:** first chapter mean **0.0336762**, central 95% **0.0170940–0.0569801**; held-out mean **0.0339350**, central 95% **0.0230769–0.0487805**. The first chapter lies near the **lower** tail (low-tail p≈0.0273), a weak post-analysis diagnostic unrelated to readable text and not an authenticated selector; held-out IoC is typical (low-tail p≈0.2296). No claim of hidden anti-repetition coding follows.

## Decision

This fixed, historically *possible* second-channel decoding fails its original and held-out language/address acceptance gates, with ordinary invalid-code behavior under preserved-length nulls. **Retire five-word MSB odd/even GP29 direct readout under the specified sentence/chapter clock.** This says nothing about the genuine encryption method, word reordering, runic glyphs, prime-word numeric values, actual page destinations, alternate independently sourced length rules or lost external key material.

**Reproduction:** [single-file CommonJS source test](../sims/lp2_wordlength_parity5_source_gate_sft.cjs). It validates every original page against the canonical GP indices, performs the stated source/control decoding and all deterministic null shuffles with no external dependencies or file writes. Data computations were independently executed in the GitHub-connected JavaScript runtime before committing the SFT; the checked-in Node entrypoint reproduces those calculations.
