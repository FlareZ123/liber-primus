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
