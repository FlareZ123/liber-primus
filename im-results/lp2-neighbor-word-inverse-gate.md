# Neighbor-word GP29 inverse: exact opening and reverse-direction contradictions

**Decision (24 November 2026, Agent9):** no unknown plaintext recovered. Retire the two frozen neighbor-word models below. They are distinct from the already-rejected *preceding* plaintext-word recurrence (#2503); their motivation is the signed 2016 words-as-map statement, historical GP29 Vigenère and the availability of a known terminal word AN in adjacent solved p56. No first-party instruction actually selects either architecture.

## Original-input and inverse contract

The original [transcription](../resources/liber-primus/lp2-transcription.txt) is joined across line and page wraps before splitting printed word separators. Its first 2,896 words exactly match all 12,956 p0–55 GP indices in the [canonical corpus](../resources/liber-primus/lp2-corpus.json). The following two models use fixed GP0 and preserve within-word reading order. The terminal boundary is AN=[24,9], the known first plaintext word of p56; this is an exploratory handoff, not a confirmed LP2 cipher clock.

### 1. Noncausal two-sided word coupling

For each word w, rune j, define C[w,j] = P[w,j] + P[w−1,j mod L[w−1]] + P[w+1,j mod L[w+1]] modulo 29. Use zero at the opening boundary and the fixed terminal AN key. This is a global linear system, not a causal previous-word recurrence or a fit with per-word keys.

The original opening two words have length 8 and 5, the third length 4. For j=0..4, subtract C[0,j] from C[1,j]. The two first-word terms cancel, so the difference must equal P[2,j mod 4]. Therefore j=0 and j=4 **must agree**. Actual first heading differences are 15−15=0 and 5−6=28 modulo29. This is an explicit contradiction confined to the opening 13 ciphertext runes and the third word's printed length, independent of the terminal seed. No plaintext exists under the frozen rule.

Full sparse GF29 elimination gives coefficient rank 12221/12956, nullity 735, 708 nonzero reduced zero rows. Counts of such rows depend on the elimination order; the opening certificate does not. The system is also noninjective even on consistent ciphertext of this layout. An actual clear p57 forward plant has rank 84/95, zero contradictions and exact forward replay; its chosen free-zero inverse matches 15/95 true runes. This positive control establishes the solver's algebraic behavior, not historical selection.

### 2. Right-to-left whole-word autokey

Decode words from right to left, while preserving normal rune order *inside* each word. The entire immediately following plaintext word is the cyclic Vigenère key, reset at each printed word. The first receiver is the actual final p55 word, and the key for it is AN from solved p56. This is the opposite word dependency of [#2503's exact left-to-right gate](lp2-preceding-plaintext-word-autokey-fhold-exact-gate.md).

Under the authentic plaintext-F convention, plaintext 0 emits 0 without consuming the key; nonzero plaintext consumes a key rune. Ciphertext zero allows all valid branches. Exhaustive state merging uses the complete currently decoded word, which is sufficient state.

Starting from AN, the only successive possible states (counts 1,1,1,1,1,0) die at complete word 2890, global rune 12928 (0-based). The anchor is not needed for exclusion: grant every one of the 29 possible plaintext states at the rightmost original singleton word 2856 (rune 12770). All die after 33 earlier words, at word 2823, rune 12623. Maximum subsequent state population 24. No vocabulary or language restrictions.

The four keys before the final failure are [[27,20],[27,27],[11,20],[11,11]]; the original target word is [27,24,11]. The executable inverse checks exact branch replay. On an actual clear 95-rune p57 positive plant, every genuine word survives the inverse state search.

Under ordinary additive Vigenère without F hold, the full inverse is unique given AN and exactly re-encrypts the original. Its GP29 IoC is 0.0344714510; only 10/83 singleton words decode to A/I/O. The last 30 decoded words are:

```text
HYDFMEHOE UNNEU AEEPD DTNHEFEAOE AR MMH THWCX PJNOESEO NGALUEG THDT GN JGIAEOPYBEOEAE YOE OEIAENUPUJOENGD PCIAOE EOX OO JTWHOEY RAEEASNEA AETH JTHXTHIHAHIAAENGNG GYSEOFJ PEHS RM HEAAEFIPIA LMXGROEB IAAE RYAEOEA UTHS OENS
```

There is no coherent native-GP plaintext. The same exact ordinary inverse recovers 95/95 genuine clear p57 runes after planting the frozen operation.

## Reproduction and implications

Run `node sims/lp2_neighbor_word_inverse_sft.cjs` from the repository, using the two named input resources. The script validates the original tape, solves the full linear system, exhaustively retains all F branches, and tests actual p57 controls. [Executed output](lp2-neighbor-word-inverse-output.json).

These are bounded original-cipher results. Do not generalize to nonlocal word relationships, changed word segmentation, independent keys, or other clock rules. The two-sided first-heading contradiction and all-seed reverse F-hold contradiction retire their precise laws without further key fitting. Ordinary reverse autokey produces a complete but unreadable candidate. Neither architecture identifies new plaintext or a source-selected operation. A new independently motivated operand is required before extending these families.

## Numeric neighboring-word keys: exact 12-law extension

Agent9, 24 November. #2503 tested cyclic neighboring plaintext **indices**. In the signed 2016 statement the words' *numbers* are the direction, and historical sources establish GP prime weights, prime-minus-one shifts, and BASE29 conversion. Test just the three literal word-to-key conversions: (1) each rune's prime mod29, (2) prime minus one mod29, (3) each prime expanded as a complete big-endian base29 number. Concatenate in written order; restart the cyclic key at each receiving complete printed word. These are exploratory source-motivated laws, not proven instructions. Both traversal directions, both additive signs, ordinary and F-transparent clocks are included. No fitted word-private keys.

Grant all 29 possible preceding plaintext states at original singleton 39 (forward) or 2856 (backward). These are a superset of all possible seeds irrespective of vocabulary. F-transparent transitions retain every valid branch; each branch is checked against its original ciphertext word. The state is the complete decoded word. Every law fails before completing the manuscript:

| Key conversion | Word traversal | Decode sign | First impossible original word (0-based) | Attempted emitted words | Best ordinary-clock dictionary-matched runes | Longest matched-word run in best candidate |
|---|---|---:|---:|---:|---:|---:|
| prime | forward | -1 | 60 | 21 | 329 | 2 |
| prime | forward | 1 | 125 | 86 | 346 | 3 |
| prime | backward | -1 | 2821 | 35 | 391 | 3 |
| prime | backward | 1 | 2821 | 35 | 340 | 2 |
| phi | forward | -1 | 86 | 47 | 362 | 2 |
| phi | forward | 1 | 60 | 21 | 376 | 3 |
| phi | backward | -1 | 2817 | 39 | 359 | 2 |
| phi | backward | 1 | 2825 | 31 | 342 | 2 |
| base29 | forward | -1 | 51 | 12 | 321 | 3 |
| base29 | forward | 1 | 51 | 12 | 356 | 2 |
| base29 | backward | -1 | 2842 | 14 | 339 | 3 |
| base29 | backward | 1 | 2847 | 9 | 340 | 2 |

The ordinary-clock inverse for each of the 29 singleton seeds is deterministic and replays all 2,856 emitted original words. Rank by number of runes in exact matches to the pinned 29,060-form native-GP TextBlob lexicon. Best across all 348 candidates is only 391 matched runes with no more than three consecutive dictionary words; no coherent paragraph. On genuine p57, every tested F-transparent model retains its true word at every step and each ordinary model uniquely recovers the planted word. This extends the all-seed contradiction to the three specifically source-motivated numerical conversions; it does not exclude arbitrary rekeying or alternative segmentation.

Run `node sims/lp2_neighbor_word_numeric_inverse_sft.cjs`. The executed output, including complete state counts and candidate excerpts, is [here](lp2-neighbor-word-numeric-inverse-output.json). Agent18 independently performed a concurrent reverse GP-index F-hold study (#2503), so the earlier reverse GP-index result above is corroboration rather than a claim of priority.

## All-secret neighboring-word key-length envelope

The earlier negative formulas leave other nonlinear word-to-key functions open. Grant independently arbitrary cyclic keys of **any length 1…2m**, where m is the printed preceding/following word length. This contains literal GP indices, base29 per-rune prime expansions and even whole-word prime products in base29 (each prime is <29²). No shared state/key constraints are imposed. For candidate same-length plaintext p and original ciphertext c, define d_j=(c_j−p_j) mod29. Ordinary additive decoding is feasible exactly when d has some period k≤2m, not necessarily a divisor of the word length. Under F hold require c_j=0 when p_j=0, omit these positions from d, and test the same period bound. First k residuals determine a compatible key, padding unobserved entries. Both signs are covered by arbitrary keys. Every accepted candidate is exactly replayed.

Native-GP TextBlob plus actual solved native source words gives **29,081 distinct forms**. Of the 2,895 eligible original receivers in each direction:

| Neighbor | Clock | No candidate for exact m-symbol key | No candidate for any key of length ≤2m | Of latter, neighboring singleton | Unique dictionary candidate under ≤2m |
|---|---|---:|---:|---:|---:|
| preceding | ordinary | 599 | 174 | 36 | 23 |
| preceding | hold | 597 | 175 | 36 | 24 |
| following | ordinary | 601 | 184 | 37 | 15 |
| following | hold | 609 | 183 | 37 | 21 |

Original forward word5 has length11 after length3, with ciphertext [9,18,7,17,24,15,22,12,10,21,1]. Neither clock admits a dictionary entry under any key up to six symbols. Word40 follows a singleton and admits no six-rune entry under one or two key symbols. Hundreds of zero-candidate words make this short cyclic neighboring-word family implausible for this finite native prose register even with completely independent per-word keys. Unique dictionary islands are not authenticated. This is not an impossibility theorem for all language, changed boundaries or longer/noncyclic keys. Retire further variants absent an independent source selector. 2956 native solved-word plant cases pass period and exact key replay.

[Standalone SFT](../sims/lp2_neighbor_word_keylength_allsecret_sft.cjs). The complete JSON output is produced by the SFT; the above counts and exact witness select the research decision.
