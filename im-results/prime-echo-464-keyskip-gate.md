# Prime-echo 464-period key under the soft repeat-rejection model

**Status: negative; do not expand this branch without a new source selector.**

## Question

The 2013 Cicada OS `prime_echo` routine exposes an ordered list of 464 primes, 2 through 3301 (exactly (16\times29)). The repository already tested the natural direct periodic additive-key readings and found no language signal. The LP2 ciphertext has only 86 adjacent equal-rune pairs across 12,956 unknown runes, so a separately validated soft ciphertext-repeat-rejection transducer is a plausible *additional* mechanism. This test asks whether the exact prime-echo sequence becomes a specific key under that one fixed mechanism.

This is not a claim that `prime_echo` is itself a PRNG. It is a bounded test of the source-visible 464-prime sequence as a periodic key.

## Locked experiment

- **Ciphertext:** canonical LP2 unknown pages p0–p55, concatenated in page order; empty numeric-grid p50 contributes no runes. 55 rune-bearing pages, 12,956 runes, 86 adjacent doublets.
- **Source key:** first 464 primes, from 2 through 3301, in `prime_echo` order.
- **Four predeclared key maps:** (p_i\bmod29), (-p_i\bmod29), ((p_i-1)\bmod29=\varphi(p_i)\bmod29), and (-(p_i-1)\bmod29).
- **Cipher model:** the existing exact `sims/keyskip_transducer.cjs` model. A plaintext symbol is sampled once and held fixed while a key position is rejected if it would repeat the previous *ciphertext* symbol. Fixed rejection probability (r=0.81); identity outer permutation; one global continuous key clock starting at phase 0; no page or line resets.
- **Plaintext prior:** same add-one-smoothed reference as `sims/skip_phase_hmm.cjs`: LP1 literal pages 3, 8–11, 14 plus solved LP2 pages.
- **Truncation:** maximum 512 total skipped key positions and four local rejects per output. For the best mapping, raising the total-skip bound to 1024 produced the identical log-likelihood; the final posterior had zero mass at the 512-skip boundary and mean skip count 267.
- **Null controls:** Fisher–Yates shuffles of each key's 464 values, preserving the source key's residue multiset. Seeds are fixed in the reproduction script.

## Results

Natural-log marginal likelihood; larger (less negative) is better.

| Mapping | Source score | 8-shuffle mean | SD | Rank (1 best of 9) | z |
|---|---:|---:|---:|---:|---:|
| (p_i\bmod29), negative | -47287.2271 | -47291.9022 | 53.5440 | 4/9 | 0.087 |
| (p_i\bmod29), positive | -47280.5723 | -47279.2854 | 46.7688 | 4/9 | -0.028 |
| (\varphi(p_i)\bmod29), negative | -47293.7925 | -47257.1691 | 46.4364 | 7/9 | -0.789 |
| (\varphi(p_i)\bmod29), positive | -47231.5915 | -47272.3298 | 20.0897 | 1/9 | 2.028 |

The initially best-looking `+φ(prime)` mapping was followed with 32 additional, separately seeded shuffles:

- source score: **-47231.5915**
- shuffled-key mean: **-47288.4437**, SD **38.9135**
- best shuffled key: **-47168.3672** (63.2243 nats better than the source key)
- source rank: **3/33**, empirical (p=3/33=0.0909), (z=1.461)

Thus the apparent (+2.0\sigma) result in the eight-control screen does not survive a larger control set. Two shuffled keys outscore the source key. Since four source mappings were screened, the family-wise evidence is weaker still.

## Decision and limits

There is **no discriminating evidence** that the 464-prime sequence is the global continuous additive key under the fixed (r=0.81) rejection transducer. The best source mapping is not exceptional against same-multiset shuffled keys. Do not spend further compute on phase sweeps, page/line resets, alternate byte reductions, or PRNG wrappers around this sequence without an independent clue selecting them.

This result does **not** prove that LP2 uses no rejection mechanism, nor does it rule out non-English plaintext or a different source-selected generator. It only rejects these four direct prime/totient reductions under one source-aligned global clock and the fixed English unigram prior. The exact transducer itself has independent normalization and planted-key recovery tests in `sims/test_keyskip_transducer.cjs`.

## Reproduction

Run:

```sh
node sims/prime_echo_464_keyskip_gate.cjs
```

The script reads the canonical corpus and LP1 transcription, imports the validated transducer, regenerates the 464 primes, uses the fixed shuffle seeds, and prints all source/control scores. The earlier direct-key test is `sims/prime_echo_464_periodic_key_sft.cjs`.
