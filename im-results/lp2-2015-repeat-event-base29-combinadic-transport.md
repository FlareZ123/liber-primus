# The 2015 prime-difference repeat events do not directly serialize as BASE29 plaintext

**16 November 2026, Agent 11. Classification:** four frozen direct source-to-bytes candidates tested on the original first 729 unknown GP29 runes. This yields **no decoded unknown plaintext, authentic key, author-selected binary transport or puzzle destination**. The complete non-mutating CommonJS reproducer is [lp2_2015_repeat_base29_integer_gate_sft.cjs](../sims/lp2_2015_repeat_base29_integer_gate_sft.cjs).

## Specific human pathway and strongest missing link

A documented February 2015 participant experiment subtracts successive primes from the first three physical unknown pages, starting from fictitious F minus prime2, then differences the shifted GP29 rune sequence. It produces exactly **40 repeated adjacent derived symbols**, observed within 729 original runes. See [the historical reconstruction](lp2-2015-prime-delta-40-doublet-source-inversion.md). A real Cicada-signed January 2013 example encodes integer 3301 as **BASE29 3QO**, selecting ordinary radix29 integer conversion as one plausible operation. A solver might ask whether the original 40 special positions disclose bytes, rather than trying more primes/offsets or guessing a language plaintext.

The critical missing premise is **authorship of the repeated-event selection**. The prime/difference operation was proposed by a 2015 solver; no Cicada-authenticated LP2 page instructs us to select these equalities or serialize them. The alternative event-position encoding below is a mathematical capability test and does not inherit the historical BASE29 instruction.

## Original input and four exact literal transports

Input is exactly original LP2 p0, p1 and p2, 729 GP rune indices from the canonical unchanged [original GP29 corpus](../resources/liber-primus/lp2-corpus.json). Consecutive primes are p0=2, p1=3, etc. Define

```text
previous shifted = 0 - 2 = 27 (mod 29)
S[i] = C[i] - prime[i+1] (mod 29)
D[i] = S[i] - S[i-1] (mod 29)
event positions i>0 where D[i] == D[i-1]
```

This gives **40 events** at original zero-based positions **9,49,57,65,67,…,710,711,724**. The exact full event list is printed by the SFT. Original event sites, GP rune values and prime clock are fixed before testing any output. Two direct BASE29 readings treat the 40 selected GP29 values as 40 *high-place-first digits* in one unsigned integer, then convert that integer to its minimum big-endian bytes. One uses the derived repeat values D[i]; the other uses unchanged original ciphertext C[i] at exactly those sites.

Separately, treat the 40 event **positions** as an ordered 40-element subset of {0,…,728}. For standard colexicographic ranking, compute `R=Σ C(position_j,j+1)` for j=0..39. For standard lexicographic ranking, add the binomial counts for each skipped combination in the conventional increasing-position subset order. Both ranks lie strictly below C(729,40). Convert each integer to the same unsigned big-endian bytes.

| Original-value source and fixed readout | Bytes | Complete big-endian output (hex) | Printable ASCII bytes | Recognized file signature |
| --- | ---: | --- | ---: | --- |
| 40 consecutive-equal **D values**, BASE29 integer | 25 | `01a80e13d25f18b5e617e91c893c824deb362f8745118fcc9a` | 6/25 | None |
| 40 original **C values** at the event sites, BASE29 integer | 25 | `049f5302e750c916e63332aa7a145df445bdb2b2cb7efcb0b7` | 8/25 | None |
| 40 original event positions, **colex combinatorial rank** | 28 | `09cec7fc6e54fdda07907b7b0de08ff5f466f410a7f4014dbd9c1fb4` | 6/28 | None |
| 40 original event positions, **lex combinatorial rank** | 28 | `056e94b062c1a38daa24180377f07c6b23b7628190dcb79bd4cbe2b3` | 8/28 | None |

No output is directly readable ordinary text or begins with one of the tested PDF, PNG, ZIP, JPEG or gzip file magics. The literal BASE29 outputs are at most 25 bytes long; they **cannot directly hold 150 consecutive rune plaintext symbols** even if a further decoder were specified. An opaque secret/seed of 25–28 bytes can of course look random, so these observations do **not** rule out a deliberately encoded cryptographic key or a compressed headerless payload. Neither can be authenticated as a key from these outputs alone.

## P57 word-edge 40-rune key and exact first-chapter replacement-only capacity (Agent24, 16 November 2026)

The **20** source-printed words of the solved p57 PARABLE give **40** outer runes when a solver literally sheds each word's first and last rune, left then right. The separately reconstructed 2015 human-solver prime-delta D on untouched original p0–2 has exactly **40 adjacent-equal derived events**. This 40↔40 numerical alignment is an exploratory *human-solve conjecture*: the signed 2016 clue does not equate the two registers, and the 2015 prime-delta procedure came from a participant, not a first-party Cicada instruction. The simplest direct operation pairs all 40 D repeat values with the 40 p57 word-edge key symbols in source order. Their GP29 additive result is **nonprose** (begins `OE W D B N NG O J NG L S G E TH EO`), and a fixed GP-trigram model's score was only in the top **~5.2%** of 20,000 key-order shuffles; this exploratory tail cannot authenticate a key or account for choosing the favorable arithmetic sign. The other natural ordinal/GP-prime and grouped-boundary combinations likewise reveal no coherent plaintext.

A stronger [source-only SFT](../sims/lp2_p57_wordedge40_replacement_capacity_sft.cjs) asks whether **any** 40-symbol key, known or unknown, could restore native-looking 729-rune prose by *changing only those 40 event rune values*. On the printed C register, 2015 first D register, or the documented second E register, hold the other **689** rune slots fixed. Because the GP29 index of coincidence is a sum of convex occupancy functions, its exact global maximum assigns all 40 free sites to whichever rune is most frequent among those 689 fixed positions; the proof does **not** depend on testing particular passwords.

| Original p0–2 register | Original 729-rune GP IoC | **Maximum GP IoC under any replacement of these 40 event symbols** |
|---|---:|---:|
| Printed C | 0.03408252 | **0.03829949** |
| 2015 D, prime-shift then first difference | 0.03450459 | **0.03862358** |
| 2015 E, next difference | 0.03480230 | **0.03992749** |

For comparison, the independently solved **p57 GP text IoC is 0.06270997**. This is a deterministic all-key obstruction: even granting all 29⁴⁰ conceivable replacement assignments and any GP primer, **the rest of the transformed p0–2 register remains too uniform for native English-like rune frequency**. The SFT uses unchanged canonical source, reconstructs the historically witnessed 40 events and both D/E registers, asserts all exact IoC maxima, checks that 1,000 explicit arbitrary assignments never exceed each bound, and matches the solved p57 word count, 40 edge symbols and 55 inner symbols.

**Decision:** retire the exact 40-to-40 event *replacement-only* story. It cannot decode the whole original first chapter into native GP prose. It does **not** exclude those 40 symbols being a compact binary key for a separate reversible cipher affecting all 729 runes, nor does it imply the 40=40 alignment was intentional.

## Reproducible decision and scope

The [standalone Node22/CommonJS SFT](../sims/lp2_2015_repeat_base29_integer_gate_sft.cjs) asserts the original 729-input/40-event census, first and last event coordinates and all four exact hex outputs. It includes an **authentic 2013 BASE29 3QO→3301 arithmetic control**, a planted ASCII BASE29 encode/decode positive, rank-zero and rank-one subset positive controls and both rank range assertions. The four outputs were independently calculated against the repository's canonical original GP29 JSON in the connected research runtime. A separate Node22 workflow execution of the committed SFT is **not claimed**.

**Decision:** The simplest literal **2015 repeated-value event tape → 2013 BASE29 plaintext bytes** reading does not recover recognizable plaintext. The more flexible rank-of-positions readings likewise do not reveal a native message. Keep the previously established unusual 2015 40-event signal as conditional evidence, but do not use these opaque integers as retrospectively tuned passwords or try other numeral conventions without an original source selecting their consumption. A productive continuation requires an independently sourced selector of event semantics and a reversible operation yielding original unknown GP29 plaintext on a disjoint passage.

This adds a source-motivated original-data transport check without changing [the authoritative solution-state synthesis](../results/README.md); all 56 unknown pages remain unsolved.
