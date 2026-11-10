# Liber Primus research: authoritative state

**State as of 2026-11-10:** The unresolved second release of Liber Primus (LP2 pages 0–55) is **not decrypted**. Neither a validated general decryption method nor the associated keys or intended destination have been recovered in this repository. The 56 unresolved pages include one table/diagram page with no rune text; the other 55 pages comprise 12,956 ciphertext runes. LP2 pages 56–57 are previously solved. The earlier Liber Primus release has established partial/complete plaintexts.

## Strongest current cryptanalytic conclusions

### Controlled exhaustive feedback families: 1,758,009 parameter settings

Three complementary experiments screened the LP2 ciphertext for a **single-rune plaintext output derived deterministically from the present rune and recent ciphertext history** under specific mod-29 formulas. Each run exhaustively enumerated its declared keyspace, retained exact source inputs, recovered a planted known-language key as the highest-ranked candidate, and checked the observed maximum against matched anti-repeat null streams.

| Exhaustive decoder family | Keys tested | Best LP2 decoded IoC | Planted-key recovery | Evidence |
|---|---:|---:|---|---|
| Additive affine feedback, up to 3 consecutive lags | 24,389 | 0.035325 (lag-1 anti-repeat); three-lag maximum 0.034599 | (5,17,26), IoC 0.067849, rank 1 | [Results](../im-results/affine-feedback-through-three-lags.md) |
| Two-tap affine feedback at lags 2–2048 and 3301 | 1,662,976 | 0.034627 (lag 961, 8,12) | (lag 137, 7,19), IoC 0.067260, rank 1 | [Results](../im-results/two-tap-feedback.md) |
| Quadratic feedback on two previous runes, 3 monomial families | 70,644 | 0.034610 | (xy,4,11,16), IoC 0.067862, rank 1 | [Results](../im-results/quadratic-feedback.md) |

For context, a uniform 29-symbol sequence has asymptotic IoC **1/29 ≈ 0.034483**. All new multi-tap and nonlinear candidates remained close to this baseline; their strongest values were inside their matched no-repeat null-control ranges. The lag-1 difference kernel is influenced by the already-known suppression of equal neighboring ciphertext runes.

**Result:** these exactly specified short algebraic-feedback classes provide no credible LP1-like natural-language decryption. The experiments constrain three finite families that go beyond classic single-lag ciphertext autokey. They do not exclude hidden stream keys, additional anti-repeat filters, unknown alphabets or wordwise encodings, more general stateful rules, or messages expressed in a flat-distribution intermediate code.

Implementations:
[Affine feedback](../sims/affine_feedback.py) ·
[Long-lag two-tap feedback](../sims/two_tap_feedback.py) ·
[Quadratic feedback](../sims/quadratic_feedback.py).

Reproduced in on-demand CI:
[24,389 configurations](https://github.com/FlareZ123/liber-primus/actions/runs/42739449534) ·
[1,662,976 configurations](https://github.com/FlareZ123/liber-primus/actions/runs/42740092990) ·
[70,644 configurations](https://github.com/FlareZ123/liber-primus/actions/runs/42740601269).

### Word-level arbitrary substitutions: repeated-symbol invariant

A further necessary-condition test generalizes beyond a single global substitution alphabet. Suppose **each word has its own completely arbitrary deterministic rune-to-rune mapping**, including non-injective mappings. If two plaintext rune positions inside one word are equal, the resulting ciphertext positions must also be equal. Therefore the number of repeated rune pairs at nonadjacent positions **cannot decrease** under such a position-independent mapping, even when the mapping changes from word to word.

Using the correct **2,896** page-crossing rune-word tokens, the 1,536 LP2 words of length 4–9 contain **526** nonadjacent equal-rune pairs. Length-matched natural-English GP word samples predict **707.879** (SD **26.442**, z = **−6.878**) for Shakespeare word tokens, **747.604** for solved LP1 word tokens, and **662.076** for the unique Shakespeare vocabulary. Each of 20,000 length-matched resamples exceeded the observed value (Monte Carlo p < 0.00005; limited by simulation resolution).

The deficit persists when restricting both test and controls to words with no adjacent equal runes, addressing the already-known anti-doublet suppression: LP2 has **517** nonadjacent repeated pairs versus **721.498** predicted by similarly filtered Shakespeare words (z = **−7.952**). An exact positive control with an independent random bijection for every word preserves the entire collision pattern by construction and in execution.

**Conclusion:** The observed word-level repeated-rune structure is strongly inconsistent with tested English-like plaintext transformed through one deterministic symbol mapping per word. This claim depends on faithful ciphertext word boundaries and an English-like word repertoire. It allows unrelated alphabets across words, and does not rule out symbol-dependent keystreams, random per-occurrence homophones, transposition, other languages or a different intermediate plaintext code. No LP2 word was decrypted.

[Mechanism, comparison, controls, caveats](../im-results/wordwise-equality-invariant.md) ·
[Exact implementation](../sims/word_partition_invariant.cjs) ·
[Successful on-demand CI](https://github.com/FlareZ123/liber-primus/actions/runs/42742667912).

### Section-static word-start substitutions and period-23 keying

A different equality invariant tests a cipher that applies one **arbitrary bijective substitution to the first rune of each word, fixed within a section**. Changing the permutation independently between sections, or reordering words, cannot change the frequency of equal word initials within each section. On 2,896 unsolved LP2 words, this within-section equal-start rate is **0.034685**, near the uniform-29-symbol rate **0.034483**, while 250 known-plaintext word starts have a rate of **0.063325**.

Five thousand null manuscripts sampled from the solved initial-rune profile produced no rate as low as LP2; the same held when 75% of that source profile was blended with uniform runes (empirical p at Monte Carlo resolution 0.0002). These findings constrain **English-like section-static word-start substitution**, beyond the per-word internal collision bound above. They do not exclude a changing key for every word, or a substantially different source language and encoding.

A second test searched for repeated **word-initial rune equality** under period-23 key phases. No signal survived either section-continuous (lags 1–120, familywise p=0.696) or page-resetting (lags 1–50, familywise p=0.508) permutation calibration. Page-local lag 23 gave 59 matches versus 56.56 expected (p=0.415). All 100 planted period-23 additive-key controls with 5% independent symbol overwriting produced a detectable lag-23 peak (z > 3). The separate exploratory 23/46 **word-length** effect therefore lacks corroborating first-rune equality behavior under this tested mechanism.

[Exact model, assumptions and results](../im-results/word-start-reset-and-periodicity.md) ·
[Implementation](../sims/word_start_reset_scan.cjs) ·
[Successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42743903081).

### Fixed homophonic mappings: independent mathematical corroboration of a prior exclusion

[Wulfic's C15](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md) already excluded static homophonic substitution. An independent data-processing and frequency-mass derivation corroborates that exclusion: a fixed deterministic mapping from each of the 29 ciphertext runes to one decoded alphabet symbol is inconsistent with the measured adjacent-character statistics of LP1-like English. This covers **all many-to-one static rune-to-letter maps**, without having to enumerate them. It does **not** exclude state-dependent or keystream-based ciphers.

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

External public papers and analyses are **context**, and any unreplicated claim remains attributed to its author. The current reproducible constraints cover short algebraic-feedback formulas, global static homophonic substitutions, arbitrary deterministic per-word symbol substitutions, and section-static word-start substitutions under explicit English-like plaintext assumptions; a simple period-23 word-initial phase model was also probed with planted controls. No manuscript plaintext or cipher key has been recovered. This summary will be rewritten when stronger evidence supersedes it.
