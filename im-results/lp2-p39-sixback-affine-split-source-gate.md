# p39 red-field six-back affine recurrence: original split replication and direct receiver

**Original-source decision, 18 November 2026 (Agent18), Director Issue #1453.** Original LP2 ciphertext has an unusually stable six-back affine relationship: its unique global best transform is also independently the unique best transform in each of two disjoint physical-order halves of the unsolved manuscript. The precise map can be expressed using original p39 red-number field data. An explicit, fully reversible global six-back feedback inverse nevertheless produces uniform-looking nonlinguistic output on all 12,956 original runes. **The source has not selected a six-rune feedback clock or an extraction opcode; no original plaintext, key, or destination is recovered.**

## What a first-party solver could see

The p39 original image carries three isolated red runes with exact GP29 indices [27,5,15]. Earlier analysis established the high-degree-first polynomial G(X)=15X²+5X+27 = 15(X−24)² over GF29. The same repeated root 24 divides both the independent p29 rune polynomial and the original p50 byte-table coefficient polynomial. Its leading coefficient 15 has inverse 2 modulo29, and its first red symbol 27 represents −2 modulo29. A particularly economical *candidate* map combining these values is:

T(x) = 24 − 2x (mod29).

This map fixes one GP symbol, H=8, and cycles all remaining 28 symbols in one orbit. The 28-cycle follows from the multiplicative order of −2 modulo29. Such a rotor could conceivably interest the puzzle designer, given the original GP29 alphabet, the visible p39 coefficients, and earlier Cicada prime/totient clues.

**Independent-source objection:** the original triad itself offers no instruction to apply this map six positions backward. Neither choosing the root as the intercept, the reciprocal coefficient as the negative slope, interpreting a repeated root as a six-step lag, nor using raw original ciphertext as the state has first-party authorization. Also, the map was first *found* by fitting all 812 invertible affine transformations to the global original six-back data and was later noticed to relate to p39. That order of discovery must remain explicit; the factor is source evidence, not retrospective authentication of the decoder.

## Fixed original-affine replication with original layout

The source [CJS single-file test](../sims/lp2_p39_sixback_affine_split_original_sft.cjs) reads untouched original pp0–55 GP29 indices and the source printed-word transcription. It reconstructs 2,896 complete words, including source page carries, containing exactly 12,956 runes, and evaluates the same 812 possible affine maps on each true within-word pair six runes apart. Split globally by printed rune position at 6,478, with entire words and absolute positions unchanged:

| Frozen original registration | Eligible within-word pairs | Matches of T(x)=24−2x | Best over all 812 maps |
| --- | ---: | ---: | --- |
| First half, original positions 0–6,477 | 644 | **40** | **Unique (27,24)** |
| Second half, original positions 6,478–12,955 | 646 | **40** | **Unique (27,24)** |
| Complete original | 1,290 | **80** | (27,24), as previously established |

The two halves are descriptive splits of a whole-corpus previously fitted map, so their agreement is evidence of *stability*, rather than a prospective, blinded confirmation. Every complete match is recalculated from the untouched original text.

A second, separate original-input fingerprint is the map's heterogeneity. The first ciphertext page p0 has **4/26** eligible T6 matches; the concluding physical p54+p55 original register has **0/35**. Only **three** pairs of consecutive six-back-hit positions occur inside words. This is inconsistent with a simple deterministic instruction that every position must satisfy C_i=T(C_(i−6)); the relation is sparse and not universally operative.

An exploratory scan across lag values 1–13 found that six was the only lag whose maximum affine map independently agreed on both halves. Since the global six-back fit and this scan were discovered through original-cipher exploration, no discovery-wide probability is attributed to the coincidence.

## Null control and scope

To quantify exact two-half winner stability under a *different* original-controlled null than Agent42's keyed Quagmire plants, the SFT performs **3,000 deterministic seeded Fisher–Yates shuffles within every original printed word**. Each null preserves all 2,896 printed word lengths, the original per-word multiset of rune identities, and the rune slots at every original global position, while destroying within-word rune order. Seed is 0x14530018. For every null, it recomputes all 812 affine maps on the same two halves, retaining unique/tied winners with deterministic ordering.

| Event | Original | 3,000 word-preserving nulls |
| --- | --- | ---: |
| Two halves pick an identical best affine map | Yes | **4** |
| Both halves pick the original fixed map (27,24) | Yes | **0** |
| Original fixed map reaches at least 40 hits in each half | Yes | **0** |
| Original fixed map reaches at least 80 total | Yes | **0** |

The familywise two-half same-winner null frequency is 4/3,000 for this particular word-shuffle model. It is **not** a pre-registered discovery p-value and does not exclude structure caused by another cipher layer, word-source bias, or a different nonuniform plaintext. The original best model had been selected using all original positions before the split; it cannot legitimately be counted as independently discovered on each half.

Agent42's earlier [3,000 forward-keyed Quagmire controls](lp2-clock-quagmire-full-affine-original-model-gate.md) supply a separately motivated model-specific benchmark. They already show that the original full-corpus 80 six-back affine maximum is unusual under that cipher family. Neither their forward controls nor this new within-word permutation null provides an authenticated inverse.

### Exact-page-bigram counterpart

A more conservative second null now directly preserves **every original page's directed adjacent-rune bigram inventory**, its original endpoints and the authentic printed word positions. The existing [exact-page-bigram Euler-trail reproducer](../sims/lp2_sixback_affine_exact_page_bigram_sft.cjs) previously screened the 812-map *global* six-back maximum; the follow-up adds the **independent two-half winner statistic** to exactly the same 1,500 seeded source-shaped controls, without changing its existing tested generator or its original global assertions.

The two genuine original halves still independently select the unique **(27,24)** winner with 40 matches each. In **1,500 exact-page-bigram-preserving** counterfactual books (seed 0x712623a5), only **1/1,500** selects any identical best affine map in both halves, **0/1,500** selects the original (27,24) map in both halves, and **0/1,500** puts at least 40 fixed-map matches in both halves. The original full-book 80 maximum also remains above all 1,500 null maxima, with the preserved previous maximum null score 78 and mean **66.70733**.

**Successful native Windows Node22 run:** [44280555984](https://github.com/FlareZ123/liber-primus/actions/runs/44280555984). This supplements rather than replaces the within-word permutation control. Each null preserves page-level adjacent transition counts, but it does not simultaneously preserve every word's own rune histogram. The original selected map and six-back lag are still retrospective choices. More tightly conditioned controls constrain mundane local-correlation explanations, without producing a cipher inverse or prospective first-party clue.

## Original plaintext-directed inverse

A concrete low-complexity, fully reversible receiver is ciphertext feedback over the same original field, with the first six runes left unmodified and either sign selected before reading output:

P_i = C_i ± T(C_(i−6)) mod29, for all i≥6.

The corresponding encoder uses the recovered ciphertext state recursively; the SFT reconstructs every original position for both signs and reverses the operation on an authentic p57-native-GP plant of the same 12,956 symbols. Thus a native-GP message using this specific six-back operation would be recovered exactly.

| Original sign | Mean native-GP trigram log score | GP29 IoC |
| --- | ---: | ---: |
| Subtract T(C_i−6) | **−4.628619301** | 0.034495914 |
| Add T(C_i−6) | **−4.625983046** | 0.034484177 |

The held-out 400-rune native-GP Shakespeare reference windows score from **−2.631086226** to **−2.161779733**, all far above the original outputs. These scores are computed from a separate first-75%-training fourth-order-free trigram model frozen in the code; no original text supplies its language model or tuning. Both first-page renderings are ungrammatical, and there is no 150-rune original-language span. Extracting the 80 values at six-back matches in original order also produces no readable native-GP passage. A simpler direct cipher-recurrence receiver is therefore rejected on original ciphertext, despite the interesting statistical motif.

**Reproduction:** native Windows Node22 [successful workflow run 44279871313](https://github.com/FlareZ123/liber-primus/actions/runs/44279871313), committed [CJS test](../sims/lp2_p39_sixback_affine_split_original_sft.cjs). It prints every original score, two-half winner and null comparison and asserts all native plants. The first half-only, pre-receiver version also passed [run 44279372786](https://github.com/FlareZ123/liber-primus/actions/runs/44279372786).

## Six-step source rotor under an unrestricted secret alphabet

A stronger **positive causal mechanism** for the same sparse six-back matches arises if every six consecutive symbols are subjected to an additional application of T, with the underlying plaintext encoded through any fixed secret GP29 substitution S:

C_i = T^(floor((i + phase)/6))(S(P_i)).

In this model, any same-word pair six runes apart satisfies C_i=T(C_(i−6)) precisely when its two plaintext symbols match, irrespective of the secret substitution alphabet S. The 80 original affine matches could therefore reflect ordinary six-apart repetitions of letters in intelligible prose. Unlike the direct ciphertext-feedback inverse, this is a plausible pathway from the observed statistic to a full plaintext receiver if the correct rotor and clock were creator-selected.

**Positive control actually supports the proposed event count.** Constructing 100 independent native GP29 English books from each of Shakespeare, Gibran and Emerson, sampling actual English words matched **exactly to every original printed LP2 word length**, gives mean six-apart repeated-plaintext counts **78.59, 80.12 and 84.60**. The original 80 T6 events are well within these native-English ranges. This demonstrates that the statistic is specifically consistent with the six-block rotor's intended *effect*. It does not establish that LP2 uses this cipher.

The independent necessary **frequency invariant decisively rejects the complete simple receiver**: undo the known public 28-cycle power at each source-natural location and inspect the resulting register. All unknown GP29 static alphabet bijections preserve the index of coincidence. [The original-source rotor SFT](../sims/lp2_p39_sixstep_rotor_allsecret_frequency_sft.cjs) tests all 36 predeclared simple readers: global, physical-page-local or printed-word-local six-slot clock; both T directions; and six possible first-block phases. Across every original 12,956-rune decoded register, **GP29 IoC is only 0.03444856–0.03454205**. By contrast, **300** genuine native-GP original-length and original-word-shaped controls, each encrypted by the rotor through an independent arbitrary secret starting alphabet, reverse exactly and exhibit an IoC of **at least 0.05905962**. A secret static substitution cannot close this gap; every proposed original output is far too uniform to be the GP English source model.

**Successful native Windows Node22 test:** [44281462002](https://github.com/FlareZ123/liber-primus/actions/runs/44281462002). The source map T and its cycle type are exact. The six-symbol block clock, initial phase and static-base alphabet interpretation are hypotheses, not author instructions. The failed IoC certificate rules out this fully specified low-description-length six-block rotor for all secret starting alphabets on native GP English. It does not exclude changing keys, a separate nonlinear encoder, external encodings, or messages whose symbol frequencies differ drastically from native-GP English.

**Per-page secret alphabet extension (same original source):** A stronger adversarial model gives *each* of the 55 rune-bearing original pages an unrelated secret GP29 starting alphabet. De-rotating each candidate still preserves its **within-page collision rate**, whatever those unrelated substitutions are. The amended SFT tests this invariant in the same 36 source-natural clock/phase/orientation readers and in 300 source-word-shaped native-GP rotor plants with independent random per-page secret permutations. All original de-rotated, weighted within-page IoCs are **0.03411481–0.03454813**, while every positive has weighted within-page IoC **≥0.05892041** and recovers its exact plaintext under the matched page clock. This excludes the direct six-step rotor for arbitrary static **page-specific** alphabets as well as a single fixed whole-book alphabet, for native GP English. [Original-input Windows PASS 44282046091](https://github.com/FlareZ123/liber-primus/actions/runs/44282046091). An evolving per-word or per-rune key is outside this certificate.

## Research decision for #1453

Retain the source-level six-back affine relationship as a bounded, unusual, independently re-computable original ciphertext motif. **Do not promote it to an author-intended feedback cipher, a source-selected key, or a recovered message.** The decisive missing ingredient remains a first-party opcode identifying the relevant six-rune clock, its application scope/segmentation, and how a 28-cycle transform should produce plaintext rather than 80 isolated events. The red triad by itself fails to supply these operands.

The fully recoverable direct feedback and static-base 28-cycle six-block rotor receivers have both failed. A broad changing-state decoder would risk consuming the established motif as a fitted coincidence; parallel unconstrained MDL cipher reconstruction is already owned by Director Issue #1422. The present source-gate task can be closed. Reopen this family only on an independently dated first-party instruction or a frozen prediction of authentic, untouched non-fitted plaintext under a uniquely defined six-back state transition.