# Previous-word primeEcho address as an LP2 next-word key: bounded negative

**Classification:** source-motivated, reproducible intermediate negative. No LP2 plaintext, key, or intended cipher mechanism recovered.

## Why this route was worth one exact test

The signed 2016 Cicada message describes words as a map and their numbers as direction. Separately, the solved p56 control establishes a GP29 prime-minus-one key map, with plaintext F/index 0 transparent to key consumption. The CicadaOS rootfs reconstruction contains a `prime_echo` sequence of primes from 2 through 3301.

A compact human-solve-path hypothesis is therefore: the sum of GP-prime values in one ciphertext word addresses the prime sequence, and that address supplies the running key for the next word. This links three source-visible objects (printed words, their prime values, and a known prime sequence) without searching arbitrary keys. **The sources do not explicitly prescribe this operation.** The 2016 message does not name `prime_echo`, previous-word feedback, or a modulo; p56's key rule is established for p56 only.

The source candidate is the CicadaOS `prime_echo` script at [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo). It is a 2022 reconstruction, not a contemporaneous authenticated LP2 instruction. The distinct signed 2013 TCP protocol defines BASE29, DH and NEXT, not a PRIMES/COUNT command or LP2 word-state cipher; the ISO animation and onion telnet interface must not be conflated.

## Exact source-count correction

The `prime_echo` script lists **464 primes**, from 2 through 3301 inclusive: `pi(3301) = 464`. It does not contain 465 primes. The prior `465` count in `results/README.md` and `im-results/2013-cicadaos-telnet-prime-gap-source-audit.md` was corrected in the same repository change as this report and reproduction script.

## Frozen inverse family

Use the canonical 2,896 printed ciphertext words and 12,956 unsolved GP29 runes. For word index i, compute the preceding original ciphertext word's state:

```
S_i = sum(GPprime(r) for r in W_(i-1))
pointer_i = (S_i - delta) mod 464
```

Use only the two natural address conventions `delta = 0` or `delta = 1`. For each rune of `W_i`, consume the next prime `q_j` from the 464-element `prime_echo` list and test the two source-relevant key maps:

- `K_j = q_j mod 29`;
- `K_j = (q_j - 1) mod 29 = phi(q_j) mod 29`, the p56 prime-minus-one map.

Test both additive directions and, independently, p56-inspired transparent consumption of a key symbol when the *decoded plaintext* rune is F/index 0. The pointer resets to the word-state address at each word. The first word is left unchanged because no preceding word exists. This is **16 frozen models**, not an open offset/phase search. Every candidate is re-encrypted against the original ciphertext for an exact round-trip assertion.
## Result

**Test completed.**

- Source sequence: **464** primes, endpoint **3301**.
- Target: **2,896 words / 12,956 runes**.
- Baseline ciphertext: IoC **0.0344783979**, top-12 frequency mass **5,568**, and **91/2,896 (3.14%)** exact word hits against the union dictionary from the three native controls.
- Across all 16 inverses: IoC **0.0344375–0.0345030**, top-12 mass **5,510–5,625**, and **87–117/2,896 (3.00–4.04%)** dictionary hits.
- The best dictionary-hit candidate is prime-minus-one, one-based address (δ=1), subtractive inverse, with no F bypass: **117/2,896 (4.04%)**, IoC **0.0344742750**. This small post-selection increase is not evidence of plaintext.
- The same union dictionary covers **13.74–15.44%** of words in the Gibran, Emerson and Shakespeare control texts. No candidate approaches native-control coverage or produces readable English.

The p56-inspired F-transparent option does not rescue the family. The candidate IoCs remain essentially at the original ciphertext's near-uniform value. This rejects the exact previous-word-sum → primeEcho-start → next-word running-key family tested here; it does **not** exclude every possible use of prime material or other word-state mechanisms.

## Decision

Retire this exact operation. Do not extend it with arbitrary offsets, new moduli, key transformations, or per-page exceptions: no source selects those additions. Reopen only if an independent original clue specifies a different prime-sequence address, key clock, or plaintext-bearing intermediate.

## Reproduction

From the repository root:

```sh
node sims/lp2_wordprime_primeecho_nextword_sft.cjs
```

The script asserts exact transcription/corpus alignment, the 464-prime endpoint, and exact re-encryption for every candidate. It reports the ciphertext baseline, all 16 candidate scores, and dictionary coverage on the three control texts.

**Status:** intermediate negative only. No change to the substantive plaintext/cipher synthesis in `results/README.md` is warranted; its prime-count correction is factual maintenance, not a new decryption.
