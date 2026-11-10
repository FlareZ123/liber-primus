# Liber Primus research: authoritative state

**State as of 2026-11-10:** The unresolved second release of Liber Primus (LP2 pages 0–55) is **not decrypted**. Neither a validated general decryption method nor the associated keys or intended destination have been recovered in this repository. The 56 unresolved pages include one table/diagram page with no rune text; the other 55 pages comprise 12,956 ciphertext runes. LP2 pages 56–57 are previously solved. The earlier Liber Primus release has established partial/complete plaintexts.

## Strongest current cryptanalytic conclusions

### Fixed homophonic mappings to language fail necessary conditions

A fixed deterministic mapping from each of the 29 ciphertext runes to one decoded alphabet symbol is inconsistent with the measured adjacent-character statistics of LP1-like English. This covers **all many-to-one static rune-to-letter maps**, without having to enumerate them. It does **not** exclude state-dependent or keystream-based ciphers.

The calculation uses the 12,956 unsolved runes and a 3,101-letter sample of previously solved English. Over 12,901 within-page ciphertext pairs, the empirical lag-one mutual information is **0.071174 bits**, compared with **0.819409 bits** over 3,007 adjacent pairs of the solved reference text. For any fixed decoder f, the data-processing inequality requires I(f(C_i);f(C_(i+1))) <= I(C_i;C_(i+1)). Additionally, each of the 29 ciphertext runes occurs at least 399 times, so any one-output-symbol-per-rune static decoding necessarily assigns every used plaintext symbol a frequency of at least **3.07965%**. Eleven used letters in the solved English reference are below this floor.

A phase-conditioned form of the inequality applies to known, fixed phase schedules, including short periodic mappings; phase-conditional reference comparisons for periods 2–8 also show large dependence gaps. These are necessary-condition comparisons against a specific language register, not a proof of the actual cipher class.

Full derivation, inputs, simulation controls, caveats, and reproduction:
[Homophonic information bound](../im-results/homophonic-information-bound.md) ·
[Python implementation](../sims/homophonic_information_bound.py) ·
[Successful on-demand CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42737967287).

### The known low-dependence ciphertext profile

The ciphertext's 29 rune frequencies are nearly flat, and immediate rune repeats are rare: **86 of 12,901** within-page adjacent pairs. A matched no-repeat Markov model reproduces the measured mutual information without a detected excess (600 replicates; upper-tail p ≈ 0.278). The raw uniformity and repeat deficit were already established in independent public work. These statistics favor mechanisms with substantial symbol-by-symbol mixing or state dependence, but do not uniquely identify a generator, key schedule, or encryption mechanism.

[Independent historical analysis and tested negative candidates](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/MEASURED-CEILING.md) ·
[External consolidated dossier](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/SOLVERS-DOSSIER.md).

## What remains unresolved

1. **Complete decryption:** recover the plaintext of all 56 unsolved LP2 pages, including whether the rune-free table supplies key material, and demonstrate a repeatable mechanism on original ciphertext.
2. **Actual cipher architecture:** distinguish finite seeded stream, other stateful transformations, source-dependent key material, and externally supplied keys. The fixed homophonic mapping result does not solve this identification problem.
3. **Page structures and continuation:** recover any intended instructions, addresses, external information, and the unresolved deep-web destination. Archived resources may be incomplete.
4. **Language and encoding assumptions:** plaintext may involve different languages, abbreviations, multiple symbols per rune, hidden intermediate code, and dependent image/text operations.
5. **Reproducibility of future candidates:** preserve raw ciphertext offsets, rune alphabet, key generation, parameters, held-out decryption tests, and failure controls. Cryptographically convincing evidence is required before promoting a candidate.

## Research organization and reading order

- `results/`: this authoritative synthesis of established findings.
- `im-results/`: detailed supporting research, exact measurements, and negative evidence.
- `sims/`: reusable analysis and cryptanalytic implementations.
- `workplace/`: active and unresolved hypotheses.
- `resources/liber-primus/`: original images `00.jpg`–`74.jpg` and checksums.
- `agents/`: persistent research-agent identities and continuity records.

External public papers and analyses are **context**, and any unreplicated claim remains attributed to its author. The repo's first verified local analytical result is the fixed homophonic information bound documented above. This summary will be rewritten when stronger evidence supersedes it.
