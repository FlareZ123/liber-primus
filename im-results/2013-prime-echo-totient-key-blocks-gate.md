# 2013 prime_echo totient-key blocks: bounded original-cipher negative

**Status: 13 November 2026. Intermediate result; no unknown plaintext recovered.**

## Solve-path hypothesis

The original 2013 boot-image prime_echo program emits 464 primes in ascending order, from 2 through 3301, and visibly pauses after 1033 and 3301. The repeated 1033/3301 operator pair is independently present in the Cicada historical chain and LP1 magic-square material. Their one-based prime ordinals are 174 and 464; these are 6×29 and 16×29. The source-marked blocks therefore contain 174 primes (2 through 1033) and 290 primes (1039 through 3301), each a whole number of Gematria Primus alphabet cycles.

A solver could reasonably ask whether this prime stream is intended as a direct repeating key. The solved LP2 p56 page supplies an authentic nearby operation: subtract the totient of successive primes modulo 29, with plaintext F passed through without consuming a key symbol. This test freezes that operation and the source-defined prime blocks; it does not search key offsets, signs, multipliers or reset clocks.

## Frozen inputs and validation

- Original prime source: [cicada2013-os-original-prime-echo.sh](../resources/historical/cicada2013-os-original-prime-echo.sh). The reproducer extracts all 464 literal prime outputs and asserts the pause values and their ordinals.
- Original LP2 transcription and canonical rune corpus: [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt) and [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json).
- Fixed English word-frequency control: [english_wordfreq_textblob.txt](../resources/control/english_wordfreq_textblob.txt).
- The first 2,896 printed words flatten to exactly 12,956 runes and match original pages 0–55 rune-for-rune. Page 50 contributes no runes. The parser removes visual line-wrap slashes, whitespace and page markers while retaining printed word boundaries, including the cross-page word carry.

## Exact hypotheses

For a key prime p, the tested inverse is:

\[
P_i = (C_i - (p_i - 1)) \bmod 29.
\]

The key value is the prime totient p−1 reduced modulo 29. The source-fixed candidate periods are:

1. **Full stream:** all 464 primes, repeated from prime 2.
2. **First marked block:** the 174 primes from 2 through 1033, repeated.
3. **Second marked block:** the 290 primes from 1039 through 3301, repeated.

For the transparent-F version, every ciphertext F is exhaustively branched as either literal plaintext F (no key advance) or encrypted non-F. Every key-consuming position that would decode to plaintext F is forbidden, because the known forward encoder passes plaintext F through unchanged. A Boolean reachability dynamic program tracks every possible key phase and every F interpretation; it does not use an English dictionary to prune paths. The stream starts at phase zero and continues across all pages and words without resets.

A second control applies ordinary repeating Vigenère with the same three fixed key blocks but no F bypass. It uses no fitted phase.

## Positive control

The independently established p56 plaintext is:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

Its 85 runes re-encrypt exactly with the first 85 prime totients from the original prime_echo list. The five ciphertext-F positions are 35, 47, 51, 56 and 74; only plaintext position 56 is a literal F, so 84 key symbols are consumed. This matches the established [p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs).

## Results

### Transparent-F exact feasibility

All three source-defined periodic keys lose every legal path inside the first physical page:

| Key block | First impossible word (0-based) | Rune offset | Cipher word | Surviving phase(s) | Exact contradiction |
|---|---:|---:|---|---|---|
| Full 464-prime stream | 52 | 235 | HC | 231 | At offset 235, ciphertext H (GP index 8) meets prime 1459, giving shift 8 and forcing plaintext F from a non-F ciphertext |
| First 174 primes | 47 | 211 | OEDMO | 33 | At offset 211, ciphertext OE (GP index 22) meets prime 139, giving shift 22 and forcing plaintext F |
| Final 290 primes | 18 | 83 | IAEHXTHPG | 79, 81, 82 | Each surviving phase forces plaintext F from a non-F ciphertext: phase 79 at offset 87 (TH, index 2, prime 1627); phase 81 at offset 84 (AE, index 25, prime 1621); phase 82 at offset 88 (P, index 13, prime 1667) |

These are structural impossibilities under the specified encoder, not merely poor language scores. The failure words contain no ciphertext F, so no alternative literal-F mask can rescue the failing step.

### Ordinary Vigenère without F bypass

The fixed TextBlob GP lexicon recognizes 201 of the 2,896 raw ciphertext words. The three ordinary Vigenère outputs recognize 204/2,896 (full 464), 197/2,896 (first 174), and 213/2,896 (final 290). Their opening rune strings remain visibly nonlinguistic; index of coincidence remains near the 1/29 uniform baseline. All three arithmetic inverses re-encrypt exactly, which is a consistency check, not evidence of plaintext.

## Decision

Reject these three direct repeated prime-totient key readings: the full 464-prime stream, the 174-prime block ending at 1033, and the 290-prime block from 1039 through 3301. The p56 positive control confirms that the known prime-totient/F-bypass implementation is functioning.

This does **not** rule out other uses of the prime_echo material, a different source-authenticated transformation, a different key schedule, or a relationship between 1033/3301 and other visible objects. The prime counts being multiples of 29 are a source-linked structural observation, not an authored instruction to use these values as a repeating key. Do not expand into arbitrary phase, reverse-order, word-reset, page-reset, multiplier or alternate-radix variants without a new independent source selector.

## Reproduction

Run from the repository root:

    node sims/lp2_2013_prime_echo_totient_key_blocks_gate.cjs

The script uses only Node.js built-ins and the four frozen repository inputs above. It asserts the source counts, exact transcription/corpus identity, p56 positive control, all three transparent-F failure witnesses and the ordinary-Vigenère dictionary counts.
