# Liber Primus research: authoritative state

**State as of 2026-11-10:** The unresolved second release of Liber Primus (LP2 pages 0–55) is **not decrypted**. Neither a validated general decryption method nor the associated keys or intended destination have been recovered in this repository. The 56 unresolved pages include one table/diagram page with no rune text; the other 55 pages comprise 12,956 ciphertext runes. LP2 pages 56–57 are previously solved. The earlier Liber Primus release has established partial/complete plaintexts.

## Decision-relevant research frontier

The exact page-15 Fibonacci-indexed prime spiral is the strongest currently documented **manuscript-derived numerical construction**. It specifies sixteen values and their reading order without adjustable per-cell parameters. The straightforward repeating mod-29 key interpretation has failed its initial direct test. The useful next step is a **clue-constrained, nontrivial key derivation** with a reversible ciphertext transformation and an independently predicted LP2 interval; arbitrary permutations of those sixteen values would add little evidence. [Primary construction and bounded test](fibonacci-prime-spiral.md).

The LP2 **page-28/page-42 difference histogram** is a reproducible, selected-pair anomaly, but competing bigram, trigram and exact-marginal decoding models disagree about the physical alignment. No common keystream or plaintext has been recovered. The single consolidated [candidate investigation](../im-results/page28-page42-relative-key-anomaly.md) records the controls and model-selection caveats. A legitimate next result would reconstruct *both* plaintext streams and one independently matching key over a fresh interval, with exact re-encryption. Additional post-selected language-score improvements on these same two pages are not independent discoveries.

The page-local **23/46 word-length harmonic** remains exploratory and near the corrected test threshold, while its simple columnar interpretation failed. See [corrected canonical-word analysis](../im-results/word_length_order_20261110.md). The two word-internal echoes and the unusually suppressed word-boundary rune repetitions below are **constraints to explain**, rather than decoded instructions or validated key schedules. The new [rune-phase equality results](../im-results/phase-coincidence-invariant.md) also disfavor simple synchronized repeating keys under the tested English-like GP register, independently of unknown output-glyph permutations.

The LP1 JPEG reverse-hex magic-square payload and concatenated JPEG streams are authentic **source-file structures**; their intentional cryptographic relevance to LP2 is unresolved. Treat direct image-byte pads, base-60-grid interpretations, and seeded-stream searches as *explicit bounded hypotheses* until they produce a recovered key. [Image 05 evidence](../im-results/jpeg05-palindromic-magic-square.md) · [Image 10 evidence](../im-results/jpeg10-concatenated-pages.md) · [Grid test example](../im-results/grid-outer-permutation-heldout.md) · [Seeded-stream coverage and assumptions](../im-results/py27-mt-s2-tail.md).

**Priority test:** a candidate must predict and reproduce previously unfitted rune positions from an original LP2 page, specifying the key, source input, segmentation and exact inverse/forward transformation. Authentic solved-Cicada regressions already exist; reuse them. The scoped exclusions and structural statistics below support hypothesis selection, but the absence of LP2 recovered plaintext remains the decisive limitation.

## Strongest current cryptanalytic conclusions

### Arbitrary finite-context substitution feedback: 29!-permutation invariants

A context-conditional collision invariant tests **any bijective substitution row selected by the immediately preceding ciphertext runes**, without searching its enormous unknown permutation space. For **k=1** the row can vary independently by manuscript page; for **k=2** and **k=3** the row can be arbitrary but is reused for the same k-rune ciphertext history across pages. The observed LP2 matching-output ratios are **0.0355311** (k=1), **0.0349061** (k=2), and **0.0357040** (k=3). In 200–300 model-matched GP-English planted manuscripts per family, with independent arbitrary substitution rows and 81% immediate-doublet rerouting, **every planted ratio exceeded actual LP2**. Plant means were **0.0652798**, **0.0624031**, and **0.0620439**, compared with anti-repeat null means **0.0352827**, **0.0352810**, and **0.0355104**. The original ciphertext is not unusual under the matched null (upper p 0.343, 0.748, 0.507). The independent 55-page family-wise maximum test for k=1 likewise shows no page anomaly (p 0.745).

**Interpretation:** direct English-like GP plaintext under these short ciphertext-history-indexed *bijective* S-box feedback models is strongly disfavoured, including arbitrary page-specific first-order tables and global second-/third-order tables. This conclusion is conditional on the explicitly simulated source register, row-sharing policy, and repeat repair. It does not identify the actual mechanism, rule out hidden/position-varying state or other plaintext codes, or recover any key.

[Exact invariant, all controls and limitations](../im-results/previous-cipher-sbox-invariant.md) · [Per-page first-order implementation](../sims/previous_cipher_sbox_invariant.cjs) · [Global second-/third-order implementation](../sims/context_sbox_invariant.cjs).

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

A stronger phase-collision sieve tested **arbitrary repeating bijective alphabets**, without an additive-key assumption, for every word period 2–60 with familywise shuffle controls. The best section-period hit (period 9) had p=0.328, while the best page-period hit (period 53) had p=0.378; period-23 page-local equality was 144 versus 150.25 expected. All 100 planted independent **arbitrary per-page/per-phase permutation** ciphers at period 23, with 5% symbol overwrites, produced z>4. This broadens the period-23 exclusion under the same known-plaintext-like word-initial distribution assumption. [Methods and run](../im-results/word-start-reset-and-periodicity.md).

A second test searched for repeated **word-initial rune equality** under period-23 key phases. No signal survived either section-continuous (lags 1–120, familywise p=0.696) or page-resetting (lags 1–50, familywise p=0.508) permutation calibration. Page-local lag 23 gave 59 matches versus 56.56 expected (p=0.415). All 100 planted period-23 additive-key controls with 5% independent symbol overwriting produced a detectable lag-23 peak (z > 3). The separate exploratory 23/46 **word-length** effect therefore lacks corroborating first-rune equality behavior under this tested mechanism.

[Exact model, assumptions and results](../im-results/word-start-reset-and-periodicity.md) ·
[Implementation](../sims/word_start_reset_scan.cjs) ·
[Successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42743903081).

### Rune-phase equality constraints on shared key schedules

A direct, synchronized key reused at the **same rune offset on multiple pages** must preserve plaintext equal-symbol coincidences at that offset, even if each key phase has an arbitrary unknown bijective output alphabet. Across the 55 unsolved rune-bearing pages, the real cross-page same-position equality rate is **10,751 / 311,132 = 0.0345545**, indistinguishable from the uniform-rune reference **1/29** under independent whole-page rotation controls (empirical upper p **0.424**). By contrast, all 100 planted held-out English-GP books encrypted under a fresh **common page-reset 256-rune pad**, a random common 29-rune output permutation and 81% in-place adjacent-repeat rewriting yielded rates **0.05621–0.05899**. Independent per-page pads returned to the null-rate regime. This strongly disfavors **direct English-like plaintext and a shared synchronized page-reset key**, without assuming anything about the pad's numerical values.

The analogous **globally continuous repeated-phase** test scanned **every period 2–1600** using the same equality principle. Its largest apparent peak at **period 539** (`z=3.2012`) does **not** exceed the family-wise null from 160 independently rotated LP2 books (empirical p **0.683**). The real period-256 equality rate is **0.034748**, versus **0.05604–0.05875** in 100 planted English-GP continuous-pad books with repeat overwrites. These are bounded architectural constraints on fixed-phase ciphers. **Ciphertext-dependent key skips, independent page alphabets, different intermediate-language encodings and nonsparse edits remain untested.** No cipher key or plaintext was recovered.

A complementary **known-keystream sieve** uses equality at lags 2–16 to score additive mod-29 candidate keys **without searching the unknown 29-way output permutation**. It recovers 39/40 exact pad orientation/sign/offset settings on planted books despite 81% repeat rewriting. Of **3,596** grid-derived AES/ChaCha/RC4 candidates, the best post-selected RC4 setting has nominal per-candidate p~0.001, but no family-wise evidence (Bonferroni bound 1) and **fails unchanged-key tests at independent lags 17–128** (p 0.796, 0.902, 0.938). It is not a recovered key. This reusable sieve is valuable for **independently motivated key derivations**, not a licence to claim a key from a selected short-lag spike.

[Full phase-invariant derivation and controls](../im-results/phase-coincidence-invariant.md) ·
[Full candidate-key sieve and held-out disconfirmation](../im-results/equality-pad-outer-sieve.md) ·
[Phase implementation](../sims/phase_coincidence_invariant.cjs) ·
[Key-sieve implementation](../sims/equality_pad_scan.cjs) ·
[Phase CI](https://github.com/FlareZ123/liber-primus/actions/runs/42752446242) ·
[Key-sieve CI](https://github.com/FlareZ123/liber-primus/actions/runs/42752938239).

### Fixed homophonic mappings: independent mathematical corroboration of a prior exclusion

[Wulfic's C15](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/findings/lp2_logic_findings_2026-09-29.md) already excluded static homophonic substitution. An independent data-processing and frequency-mass derivation corroborates that exclusion: a fixed deterministic mapping from each of the 29 ciphertext runes to one decoded alphabet symbol is inconsistent with the measured adjacent-character statistics of LP1-like English. This covers **all many-to-one static rune-to-letter maps**, without having to enumerate them. It does **not** exclude state-dependent or keystream-based ciphers.

The calculation uses the 12,956 unsolved runes and a 3,101-letter sample of previously solved English. Over 12,901 within-page ciphertext pairs, the empirical lag-one mutual information is **0.071174 bits**, compared with **0.819409 bits** over 3,007 adjacent pairs of the solved reference text. For any fixed decoder f, the data-processing inequality requires I(f(C_i);f(C_(i+1))) <= I(C_i;C_(i+1)). Additionally, each of the 29 ciphertext runes occurs at least 399 times, so any one-output-symbol-per-rune static decoding necessarily assigns every used plaintext symbol a frequency of at least **3.07965%**. Eleven used letters in the solved English reference are below this floor.

A phase-conditioned form of the inequality applies to known, fixed phase schedules, including short periodic mappings; phase-conditional reference comparisons for periods 2–8 also show large dependence gaps. These are necessary-condition comparisons against a specific language register, not a proof of the actual cipher class.

Full derivation, inputs, simulation controls, caveats, and reproduction:
[Homophonic information bound](../im-results/homophonic-information-bound.md) ·
[Python implementation](../sims/homophonic_information_bound.py) ·
[Successful on-demand CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42737967287).

### Adjacent ciphertext words are endpoint-coupled

A structural permutation test separates the known immediate-rune repeat deficit into positions *inside words* and positions *across word separators*. Within the 9 unsolved LP2 text sections, exactly **63 of 10,060** neighboring rune pairs inside complete words repeat; **23 of 2,887** consecutive word boundaries also repeat. The corresponding rates are **0.626%** and **0.797%**, so the low repeat rate persists across semantic word boundaries. A known-plaintext control of 250 rune words shows no analogous boundary-repetition depletion.

This is not explained by the observed properties of **individual ciphertext words** alone. Shuffling the existing complete LP2 ciphertext words within their sections gives an exact conditional expectation of **99.806** repeated word boundaries, versus **23** actual. Across 5,000 matched shuffle nulls each, no synthetic book reached as few as 23, even when only equal-length words were swapped in place (null mean 99.445). The result also survives stricter clause-restricted shuffles preserving punctuation and word length (actual 22 across 2,728 within-clause word boundaries, null mean 80.093 for equal-length-only shuffles; 0/5,000 at or below actual).

**Interpretation:** the visible ciphertext words are not exchangeably ordered with respect to their endpoints. Models encrypting each word independently with no coordination of adjacent ciphertext end and start runes cannot reproduce the observed cross-word suppression. Continued symbol-level encryption state, an explicit stream-wide anti-repeat filter, and deliberate word selection or ordering are all compatible in principle. This is a **ciphertext structural constraint**, independent of assuming English plaintext; it does not identify a unique cipher or provide a plaintext.

[Full conditional expectation, four permutation controls, and caveats](../im-results/cross-word-anti-repeat-constraint.md) ·
[Reproducible code](../sims/cross_word_repeat_invariant.cjs) ·
[Successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42745733143).

### Two word-local ciphertext echoes constrain a possible repair channel

Two externally reported LP2 patterns survive randomization of **each actual word's complete rune multiset, exact length, and adjacent-doublet count**. These are constraints on ciphertext generation, with no recovered rune plaintext or key.

| Word-local pattern | Observed | Mechanism-matched conditional null | Scope of correction |
|---|---:|---:|---|
| \`c_i = 24 - 2c_(i-6) (mod29)\` | **80/1,290** eligible positions in 74 words | Expected **45.775 ± 6.654** | Best of **5,684** bijective affine maps at lags 2–8; **12/1,000** disjoint null maxima reach the observed z = 5.144, familywise **p = 0.01299** |
| \`c_i = c_(i-5) = ᛋ\` (index 15) | **11** matches in 11 words | Expected **2.039 ± 1.313** | Best of 29 possible rune identities at selected lag 5; **0/3,000** null maxima reach the observed z = 6.826, familywise **p = 0.000333** |

The affine relation localizes to **80/1,290 = 6.20%** of lag-six pairs contained within whole ciphertext words, compared with **402/11,660 = 3.45%** across word boundaries on the uninterrupted manuscript rune stream. The relation has exactly **40 matches in each half** of the 2,896 words. This points toward a *word-scoped* rule, although the choice of mapping followed earlier exploratory searches. The full historical hypothesis-selection process remains uncorrected; the two p-values apply to their stated finite candidate families.

A further reference-register challenge sampled whole GP-encoded English words matching LP2's exact word lengths. For the affine lag-six pattern, the reference means were **62.98** (Shakespeare), **54.62** (Gibran), and **52.62** (Emerson), against LP2's 80. The lag-five \`ᛋ\` coincidence gave reference means **17.26**, **22.56**, and **19.98** against LP2's 11. These source-dependent comparisons show why GP-English word associations alone cannot be naively equated with LP2's nearly flat rune output. They are descriptive controls for the *already selected* patterns, not independent cipher-discovery p-values.

A candidate generator should explain the word-boundary contrast, both sparse echoes, and adjacent-repeat suppression, then supply a reversible key/erasure mechanism. Existing attempts to turn the lag-six relation into a general affine autokey decryption have failed; a sparse correction channel remains conjectural.

[Lag-six controls and mechanism caveats](../im-results/lag6-conditioned-echo.md) · [Lag-five rune-specific test](../im-results/lag5-rune-specific-echo.md) · [5,684-candidate executable](../sims/affine_echo_global_search.cjs) · [Three-register word-length control](../sims/affine_echo_literary_control.cjs) · [Successful CI](https://github.com/FlareZ123/liber-primus/actions/runs/42752182238) · [External prior observation](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/echo_values.txt).

### The known low-dependence ciphertext profile

The ciphertext's 29 rune frequencies are nearly flat, and immediate rune repeats are rare: **86 of 12,901** within-page adjacent pairs. A matched no-repeat Markov model reproduces the measured mutual information without a detected excess (600 replicates; upper-tail p ≈ 0.278). The raw uniformity and repeat deficit were already established in independent public work. These statistics favor mechanisms with substantial symbol-by-symbol mixing or state dependence, but do not uniquely identify a generator, key schedule, or encryption mechanism.

[Independent historical analysis and tested negative candidates](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/MEASURED-CEILING.md) ·
[External consolidated dossier](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/SOLVERS-DOSSIER.md).

### LP2 page 15 contains an exact Fibonacci-indexed prime spiral

The 4×4 number square on LP2 page 15 (original scan \`32.jpg\`) contains **16/16 exact matches** to \`abs(3301-p_(F_n+1))\`, where \`p_k\` is the kth prime and \`F_n\` traverses the first 16 **distinct** Fibonacci numbers beginning at zero. The values are placed in a clockwise outward spiral starting at the red **3299**. The final values, 1206 and 4516, require the absolute difference because the corresponding indexed primes exceed 3301. This is a real, reproducible key-generation **clue**, not an LP2 decryption. A direct 16-period mod-29 additive-key screen over five natural order/value choices, 16 offsets, and two signs peaks at IoC **0.034776** on following pages 16–22, near random-rune baseline. No original unknown plaintext or key is recovered.

[Full construction, exact primary-source table and limits](fibonacci-prime-spiral.md) · [Executable reconstruction and key test](../sims/fibonacci_prime_spiral.cjs).

### Original JPEG 05 contains a reverse-hex encoded magic square

The original LP1 `05.jpg` byte stream contains a complete JPEG, a 360-byte
embedded payload and an exact byte-reversed copy of that JPEG. Reversing and
hex-decoding the 358 printable middle bytes yields the entire **5×5 LP1 magic
square as 25 numerical values**, including values of the image's visible
rune words. The 12 row, column and diagonal sums are all **1033**.
This is an independently recoverable historical image-data structure, with
a deterministic [parser](../sims/jpeg05_palindromic_magic.cjs) and
[full matrix and byte layout](../im-results/jpeg05-palindromic-magic-square.md).
It demonstrates that the solved LP1 book embeds an explicit reversal
and hex-encoding layer in its file format. The square and method are
not established as an LP2 decryption key.

### LP1 JPEG 10 concatenates four complete images

Another original source-artifact structure exists in `10.jpg`: its first **754,662 bytes** form a decodable image, immediately followed by **byte-identical complete copies of standalone `11.jpg`, `12.jpg` and `13.jpg`**. The four embedded JPEG lengths are 754,662, 712,733, 703,428 and 2,070,134 bytes, totaling 4,240,957 bytes without padding. Byte hashes, offsets and a runnable independent comparison are in [the original-image report](../im-results/jpeg10-concatenated-pages.md) and [reproducer](../sims/jpeg10_embedded_pages.cjs). The addition contains no independently recovered secret payload; intentional key status is unknown. Raw-key experiments must distinguish the first image from the whole original file.

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

External public papers and analyses are **context**, and any unreplicated claim remains attributed to its author. The current reproducible constraints include short algebraic-feedback formulas, global static homophonic substitutions, arbitrary deterministic per-word symbol substitutions, and fixed or short-period word-initial bijections under explicit English-like plaintext assumptions. Independently, the exact within-word/across-word repeated-rune imbalance rejects exchangeable ordering of the observed ciphertext words under multiple word-preserving shuffle models. No manuscript plaintext or cipher key has been recovered. This summary will be rewritten when stronger evidence supersedes it.
