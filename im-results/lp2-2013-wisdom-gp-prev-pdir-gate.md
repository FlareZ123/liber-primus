# 2013 OS key × GP-prev pointer-direction gate

**Disposition:** negative for this exact source-constrained combination. This is an intermediate exclusion, not an established result and not a rejection of all word-directed key walks.

## Hypothesis and solve-path rationale

The 2016 Cicada signed message says that the manuscript's words are the map and their numbers the direction. LP1 independently tells the solver that primes and the totient function are significant. A plausible, causal interpretation is that the **previous ciphertext word's Gematria Prime sum** determines the direction in which the next word reads a running key: prime sum = forward, composite sum = backward.

The 2013 Cicada OS contains identical high-entropy wisdom and folly binaries and a prime-echo script whose terminal marker is 3301. This test treats the binary as a possible key stream, reduces bytes modulo 29, and uses byte offset 3301 as the starting pointer. The 13/16 soft no-repeat suppression is a separate provisional hypothesis from the red-span/dropcap analysis; it is not an author-authenticated rule.

These clues motivate a compact experiment, but do not prove that the binary is a key or that the pointer rule is intended.

## Frozen experiment

- **Target:** physical LP2 pages 40–53, with the eight-rune red heading on p40 removed. The body is exactly 3,000 runes in 771 transcription words.
- **Heading context:** the red heading is two words of lengths 3 and 5. Its final word has GP-prime sum 333 (composite); its final rune seeds the previous-ciphertext-rune comparator.
- **Key:** the 3,368-byte 2013 wisdom/folly binary, each byte reduced modulo 29.
- **Start:** key pointer 3301, the terminal prime-echo marker.
- **Direction:** for each word, inspect the preceding ciphertext word's GP-prime sum. A prime sum selects +1; a composite sum selects −1. The first body word is seeded by the second red-heading word.
- **Cipher operation:** additive GP29, with both key signs (multipliers 1 and 28).
- **Pointer convention:** 000 — read then step, no additional movement at word boundaries, compare candidate ciphertext against the previous emitted ciphertext rune.
- **No-repeat:** coin/retry model. A collision spends a coin byte; with keep probability 3/16 it emits the repeat, otherwise it retries with the next key byte. The beam enumerates both paths. The 3/16 keep probability is the complement of the provisional 13/16 suppression ratio.
- **Search:** beam width 50, maximizing scaled index of coincidence. The implementation includes matched key-offset and shuffled-key nulls.

The source-alignment parser checks every transcription rune against the indexed corpus before extracting the target. The program also runs a planted positive control using the same word-length profile, heading context, key, direction rule and coin/retry mechanism.

## Results

The 3,000-rune direction walk contains 179 forward words and 592 backward words, with net pointer displacement −1,626. From offset 3301 the unskipped path remains within the 3,368-byte key.

The actual ciphertext does not become language-like:

- Key multiplier 1: scaled IoC approximately **1.043**.
- Key multiplier 28: scaled IoC approximately **1.041**.
- The 29 valid matched-offset nulls have mean approximately **1.042**, median approximately **1.042**, and maximum approximately **1.050**. The source-selected offset ranks 19th of 29 when null scores are ordered below it.
- Twenty shuffled-key nulls have mean approximately **1.043**, median approximately **1.043**, and maximum approximately **1.054**. The actual key is not enriched against this null.

The planted positive control is recovered: plaintext scaled IoC approximately **1.725**, decoded scaled IoC approximately **1.728**, with the recovered final pointer matching the planted final pointer. This establishes that the implemented beam can recover the proposed mechanism on a known plaintext with this word profile and key; the negative real result is not explained by a decoder that cannot detect the model.

Exact values, all null samples, input SHA-256, and positive-control counts are emitted by sims/lp2_2013_wisdom_gp_prev_pdir_gate.cjs.

## Decision

Retire this exact combination:

wisdom/folly bytes mod 29 + offset 3301 + previous-word GP-prime direction + convention 000 + coin/retry no-repeat.

Do not rescue it with arbitrary offsets, direction flips, new word statistics, or extra cipher layers. This test does **not** reject other source-derived direction rules, other authentic key sources, page/line resets, or different mechanisms. Any continuation should first identify an independent source clue selecting the alternative.

## Reproduction and related work

Run from the repository root:

    node sims/lp2_2013_wisdom_gp_prev_pdir_gate.cjs

The beam transition follows the public reference implementation in [pnotisdev/cicada3301](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/pdir_ref.py), with a local deterministic positive control. The current external project's broader pointer-direction campaign is useful context, but this report's conclusion is limited to the frozen candidate above.
