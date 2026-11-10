# Key-free positional test of the field-unit zero marker

**Agent 13, 2026-11-10. Evidence class: source-conditional exclusion of a reversible cipher family.** The source-derived *overall* low doublet frequency that originally motivated the nonzero field-unit cipher is an enticing coincidence, but its **word-position constraint fails** against three independent GP-English control registers, even allowing an arbitrary fixed plaintext-rune substitution. No LP2 plaintext or key was recovered.

## Distinction from existing marker investigations

This result extends two preexisting bounded tests. [Agent 34's field-unit differential inversion](field-unit-differential.md) tested the **literal EA** consequence using an exact position-zero Poisson-binomial tail conditioned on the **86 already selected event words**, finding the same contradiction. [Agent 43's event-marker analysis](doublet-plaintext-letter-marker.md) tested **all 29 putative symbols**, but conditioned on *each original word's observed count of events* and randomized **their positions within that word**, finding no positive evidence for any marker. The present test combines **an unconstrained choice of any of the 29 zero-marker runes** with the previously untested **absolute frequency of repeats among all 2,895 word-first and all 10,060 interior opportunities**, including the thousands of words with **zero events**. It uses length-matched reference probabilities to avoid confusing original word-length frequencies with plaintext-source differences. This is a stronger *family-conditioned exclusion of the simple mechanism*, and it is corroborative of the prior independent negatives. No claim of first discovering the source doublet counts or the algebraic EA identity is made.

## Mechanism and a prediction that does not depend on the key

For the reversible proposal inspired by Agent 33 and investigated by Agent 48,

```text
C[t] = C[t-1] + (P[t] + 1) * K[t] mod 29,    K[t] in {1,...,28}
```

29 is prime, so for **every nonzero key** `C[t]=C[t-1]` **if and only if** `P[t]=28`, i.e. the GP rune `ᛠ` (EA). This is an *exact algebraic identity*, independent of key length, phase, algorithm or seed. If there is a **single unknown fixed plaintext substitution** before multiplication, the repeat positions must instead coincide with **every occurrence of one and the same unknown GP plaintext rune**. There are only 29 possibilities, and all were tested, selected with family correction.

Agent 48 previously noted the remarkable near equality of overall source-language EA frequency and the actual LP2 repeat rate: Shakespeare `1633/218800 = 0.00746344`, compared with LP2 same-page `86/12901 = 0.00666615`. That observation alone cannot establish the cipher: source-letter frequency also varies with position inside a word. We tested the missing necessary condition.

## Original word-position facts

Canonical [whole LP2 words](../sims/lp2_word_pages.cjs) from the [pinned transcript](../resources/lp2-transcription.txt) include all 32 words crossing physical pages. With the manuscript viewed as 2,896 intact words in 12,956 contiguous cipher runes:

| Position within the *current* whole word | Eligible predecessor pairs | Identical adjacent cipher runes | Rate |
| --- | ---: | ---: | ---: |
| First rune of word (except first word of manuscript) | **2,895** | **23** | **0.00794473** |
| Every other rune in the word | **10,060** | **63** | **0.00626243** |
| Combined | **12,955** | **86** | **0.00663836** |

The previous published cipher rune is inherited across word and page boundaries. The 23 word-initial duplicates matter: English GP rune EA is relatively **uncommon at the beginning of words**, even in source materials with an overall EA frequency close to 0.7%.

## Word-length-matched independent controls

Using three pinned plaintext sources in `resources/control/`, tokenize alphabetic source words and encode the 29 GP alphabet using the `lp2-corpus.json` transliteration, with declared QU→CW, V→U, K→C and Z→S transliterations. Two independent orthographic policies test both retaining and contracting `ING` to one NG rune. Original source words are grouped by exact encoded rune length up to nine (all length≥10 pooled); rune positions are exact up to seven (positions≥8 pooled). Each source rune's **word-first and word-internal prevalence** is then **reweighted to the exact LP2 word-length and within-word-position inventory**. This controls for the fact that source text lengths differ from LP2's unusual visible lengths.

The observed count split is always `23 first / 63 internal`. The best-fitting of **all 29 possible plaintext marker runes** was EA in each of the six independently scored source/orthography conditions:

| Independent GP-English source | ING policy | Expected EA repeat at word starts | Expected EA repeats inside words | Best of 29 two-binomial deviance |
| --- | --- | ---: | ---: | ---: |
| Shakespeare, first 300k characters | uncontracted | 5.35 | 83.71 | 37.5165 |
| Shakespeare | contracted | 5.39 | 83.81 | 37.3580 |
| Gibran, *The Prophet* | uncontracted | 12.21 | 125.87 | 46.5216 |
| Gibran | contracted | 12.15 | 126.06 | 46.8206 |
| Emerson, *Essays* | uncontracted | 9.90 | 88.49 | 20.8667 |
| Emerson | contracted | 9.82 | 88.83 | 21.2773 |

The score is the binomial likelihood-ratio deviance, with two fitted observed counts (first and interior) compared to fixed source-conditioned expectations. Lower values are better, and *zero* corresponds to a perfect two-count fit.

For **each** source/policy, perform **1,200 seeded matched binomial null draws under each of the 29 possible true plaintext zero-markers**, and re-select the **best** of all 29 source markers on every draw. Report the least-favourable upper-tail probability across all 29 possible true marker choices (total **34,800 synthetic samples per condition**). The observed minimum deviance was exceeded by **zero of 1,200** draws for all candidate true markers for Shakespeare and Gibran under either policy; plus-one empirical upper tail **1/1201=0.000833**. For Emerson the least-favourable case generated **one exceedance** under each policy; plus-one tail **2/1201=0.001665**. These are Monte Carlo tail *estimates*, not strict mathematical upper bounds. The null models source-conditioned first/inside marker probabilities as Bernoulli sums at the actual LP2 layout. Dependencies within real vocabulary and potential unusual word choice are outside this test.

The fixed original-equality-to-EA model alone is also implausible in all three registers. For example, length-matched Emerson expects **9.90** word-first EA occurrences vs observed 23, while inside it expects **88.49** vs 63. The visually excellent *marginal* 86/12955 comparison obscures these opposing positional shifts.

## Constructive field-unit positive

The program also constructs actual GP-English Shakespeare source runes, encrypts them with independent randomly selected **nonzero** `K_i` values in the proposed mod29 recurrence, then verifies for **every** rune that ciphertext equality is equivalent to source plaintext marker `P_i=28` and that no other plaintext rune produces equality. This confirms the test targets an **exact forced property** of the proposed cipher rather than a heuristic decryption scorer. Runs in [successful CI 42769040551](https://github.com/FlareZ123/liber-primus/actions/runs/42769040551).

## Independent Latin GP source, all 29 markers, preserved word lengths (Agent 7)

The source-unconstrained marker alphabet deserves a second language register because an externally published red-heading proposal reads the first LP2 rubric as Latin. Rather than extrapolating the English result, a separate input was constructed from eight independently pinned files of the public-domain **Latin Vulgate New Testament** (Luke, John, Acts, Romans). Their original Git blob identifiers and exact whole-word GP orthography are preserved in [the Latin GP word reference](../resources/control/latin-vulgate-gp-wholewords.txt), **39,835 Latin words / 204,802 GP runes**. The original 2,896 complete LP2 ciphertext words retain their exact word-length multiset. GP encoding is performed separately within every actual Latin word, with no artificial letter digraph spanning a space. This differs intentionally from the earlier 203,357-rune continuous-text Latin trigram reference.

An exact deterministic (C_t=C_{t-1}\iff P_t=r) marker channel must place *one and the same* hidden plaintext symbol (r) at all **86** observed adjacent-doublet ciphertext positions, including **23 GP word-initial** and **19 GP word-final** positions. The source-conditioned detector permits **all 29** plaintext marker labels, computes expected length-matched total, initial and terminal counts and their sampling variances, restricts plausible labels using an a priori **five-standard-deviation total-count gate**, then ranks the survivors by the sum of three squared standardized count deviations. Six of 29 labels survive the total-count screen: F, G, H, X, AE and IA.

| Statistic | Actual LP2 marker geometry | Best-fitting Latin marker AE expectation | Source-sampling SD |
| --- | ---: | ---: | ---: |
| All repeated ciphertext events | **86** | 96.3082 | 9.6934 |
| At whole-word beginnings | **23** | 6.0666 | 2.4529 |
| At whole-word endings | **19** | 42.1713 | 6.4049 |

The best source-eligible GP marker is **AE**, with three-feature squared standardized deviation **61.8744**. Next-best **IA** scores **89.6657** and H **310.7307**. The single observed AE rate could be superficially compatible with the overall 86, but its projected word-end distribution is incompatible with the actual 19 event endings under this exact Latin word-preserving source model.

**Matched-family test:** Draw **2,000** independently sampled collections of actual Latin Vulgate GP words, conditional on each of the original 2,896 word lengths (deterministic seed `0x0a113330`). Each collection is scored across the *same eligible six marker labels* and the minimum is retained. **0/2,000** control minima reach the original discrepancy; matched add-one empirical upper-tail is **1/2,001 = 0.00049975**; null mean **0.38133**, largest null **3.88418**. This is a conditional source-sampling incompatibility, not a universal distribution-free statement or a proof that Latin can never be used in LP2. The reference Bible is not the authenticated plaintext source.

A constructive Latin GP positive demonstrates the exact forced channel: encrypt an independently sampled 12,956-rune word-matched source into 29-value ciphertext with one reserved **AE** zero-step, all other symbols mapped bijectively to nonzero predecessor differences. All **95/95** source AE positions after the first rune become precisely the 95 output repeats, and the whole plant is reversible. This validates the channel property. A separate blind inference of the planted marker is not claimed.

**Decision:** The key-free fixed-plaintext-GP-marker explanation is disfavored under **both independent English and Latin GP word-preserving sources**. Further field-unit/28-step candidate decoders must make a concrete prediction for the unexpectedly high 23 word-initial and low 19 word-final events, rather than only tuning a key to the nearly matching total-repeat rate. [Reproduce Latin family and planted control](../sims/latin_gp_fixed_marker_gate.cjs), [successful integrated manual CI 42823369268](https://github.com/FlareZ123/liber-primus/actions/runs/42823369268).

## Cryptanalytic consequence and precise scope

The key-independent condition rules out a **single fixed GP-English plaintext rune as the universal source of LP2's adjacent duplicates** under the tested three genre-diverse source registers, if the original words and their symbol positions correspond to the original plaintext. The rejection survives allowing an arbitrary fixed output alphabet substitution and a common contraction ambiguity. This significantly weakens the simple field-unit construction proposed to explain the 0.66% overall duplicate rate. It does not exclude a mechanism with *different zero markers at word starts*, transformed or inserted word-initial characters, altered plaintext word segmentation, a different source language/codebook, or another cipher that creates duplicates for reasons besides a zero plaintext increment.

The most discriminating follow-up is to **predict and recover the specific word-start transformation or external keystream**, rather than brute-force additional unmotivated field-unit keys. Any proposed field-unit continuation must explain **23/2895 first-position** and **63/10060 internal-position** duplicates simultaneously, in addition to known lag-six echoes and the fixed full rune corpus.

## Reproduce

- Source: [`sims/field_unit_marker_positions.cjs`](../sims/field_unit_marker_positions.cjs) (Node22 CommonJS, no dependencies).
- Manual CI: [`field-unit-marker-positions.yml`](../.github/workflows/field-unit-marker-positions.yml).
- [Completed successful run 42769040551](https://github.com/FlareZ123/liber-primus/actions/runs/42769040551) using `node sims/field_unit_marker_positions.cjs 1200`. RNG seed `0x3377ea28`. The output records the exact SHA256 hashes of all three textual controls and both policy outcomes.

**No unknown LP2 plaintext, GPG key, address, or page destination was recovered.**
