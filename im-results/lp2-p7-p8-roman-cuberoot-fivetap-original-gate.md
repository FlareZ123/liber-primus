# P7 five-product / p8 Roman cube: an original-cipher nonlinear five-tap receiver

**Agent 3, 21 November 2026. Evidence classification:** bounded, source-derived cryptanalytic model with exact reversible original-cipher and native-GP positive tests. No unknown LP2 plaintext, authentic keystream, creator-selected update rule, or endpoint is recovered.

## The human-visible candidate route

Original physical LP2 p7 ends with **five red words and five black dots**. Preserve the five complete printed red word boundaries and multiply each word's GP29 **indices**, not prime weights, modulo 29. The exact words, in printed order, are:

| Rune indices | Product modulo 29 |
| --- | ---: |
| [23,3] | 11 |
| [22,16,2,25] | 26 |
| [5,7,11] | 8 |
| [14,28] | 15 |
| [6,28,19] | 2 |

Thus the frozen five-tap weights are **[11,26,8,15,2]**. The immediately next physical LP2 page, p8, opens with a red12 title. Its first eight indices **[14,10,14,19,1,14,19,5]** are from the Roman-numeral alphabet; its first four are `XIXM`, visibly containing `XIX` = **19**. The **complete second red word** of eight runes, **[1,14,19,5,2,13,3,17]**, has product **3** in GF29. These are prior-reported facts (see [the p7 and p8 Roman source study](lp2-p6-p7-redgap-28cycle-inversion-gate.md)), not new discoveries here.

In GF29, cubing has inverse exponent **19** since `3 × 19 ≡ 1 mod 28`. Repeated cubing of p7's final product 2 gives the complete six-element orbit **2 → 8 → 19 → 15 → 11 → 26 → 2**, with all five original p7 products present and **19** supplied by the next red heading. This supplies a concrete original-image clue to a possible five-tap, cubed-or-cube-rooted feedback cipher. It is substantially more constrained than blindly searching numerical keys: the coefficient values and powers are entirely fixed before ciphertext inversion.

**Decisive uncertainty:** the original image provides neither a written command to use a *five-lag ciphertext-feedback cipher* nor a unique order for applying cube/root and feedback. The cube relation selects mathematical operands but is insufficient to authenticate an algorithm.

## Frozen reversible update families

Let `c_i` be the original ciphertext GP29 ordinal and `h_j=c_(i-j)` the five previously printed **ciphertext** runes. Coefficients `w_j=[11,26,8,15,2]` are assigned in printed order to lags 1–5; the reverse lag order is the only orientation alternative. Define the source-shaped families over GF29:

- **Root before sum:** `p_i=c_i^19 + σ Σ w_j h_j`.
- **Root after sum:** `p_i=(c_i + σ Σ w_j h_j)^19`.
- **Cube prior taps:** `p_i=c_i + σ Σ w_j h_j^3`.
- **Root after product:** `p_i=(c_i + σ Π(h_j+w_j))^19`.

Signs are `σ∈{−1,+1}`; all arithmetic is mod29. These are 4 operations × 2 signs × 2 orientations = **16 distinct fixed transforms** for each of **two source-boundary registers**:

1. **Carry p7:** consume all original **1,729** runes of p8–p14 continuously, with the five final original p7 runes as the initial ciphertext history.
2. **P8 red as IV:** keep p8's first **12 red runes** outside the output and decode the following **1,717 original black/body runes** through p14, using original p8 red runes 7–11 as the five-rune ciphertext IV.

There are precisely **32 full original inversions**, with no fitted phase, learned alphabet, plaintext crib, secret coefficients, loose page selection, or later parameter rescue. Both scopes follow immediately after the p7/p8 source packet and retain the visible p8–p14 tree-motif chapter; this is the closest plausible recipient. Each candidate has a unique exact forward encoder because the feedback depends only on already observed ciphertext.

## Original results and exact implementation controls

For the complete original 1,729-rune p8–p14 chapter, untouched GP29 IoC is **0.03446048347**. The independent genuine clear p57 source gives **0.06270996641**. Across all 32 source-fixed inverses (both scopes), the **highest decoded IoC is 0.03478447722**, at carry-p7, cubed-prior-taps, printed coefficient order, positive sign. Every decoded opening remains nonlinguistic GP29 rune text. In particular, no model turns the complete p8–p14 original ciphertext into ordinary native-GP English.

The peak candidate begins, as exact GP transliteration, `B F P L TH OE D H P TH O P S EO L TH C A W A T X OE W`, rather than sustained English. The original inverse prefix and full statistics are emitted by the executable SFT.

All **32** independent native-source positive controls first encrypt the exact **95 original clear p57 runes** using the specific candidate model and its original five-rune IV, then recover all **95/95** runes exactly. The same 32 inverse outputs forward-reencrypt **100%** of their original source ciphertext, in their respective lengths. These are mechanism implementation controls, never evidence that one of these ciphers was used by Cicada.

[Single-file native-Windows Node22 reproducer](../sims/lp2_p7_p8_roman_cuberoot_fivetap_sft.cjs) reads the unchanged canonical `lp2-corpus.json` and red-ink annotations. It asserts original page lengths, title and source coefficients, the complete 6-orbit, all 29 modular cube/root inverses, exact original replay and the known-source plants.

## Decision

**Do not pursue these four direct five-tap cube architectures on the unchanged p8–p14 chapter without an independently visible missing operation.** The original-source 5-product/3/19 relationship remains a potentially intentional clue, while none of these 32 natural, source-fixed ciphertext-feedback consumers recovers unknown plaintext. This does not exclude a keyed nonlinear cipher with a different source-selected receiver, a non-English alphabet, an additional cryptographic layer or short native-text islands. No conclusion is made about all possible 5-tap algorithms.

The next productive challenge is to obtain a **source-selected state update or preserved ciphertext/plaintext relation** capable of predicting an untouched passage, rather than enlarging the model menu with arbitrary phases, output substitutions or higher polynomial degrees. Existing direct p8 scalar, ternary and circulant negatives are in the linked p7/p8 source study. The present exact five-ciphertext-tap update is a different, explicitly reversible hypothesis, with the same negative original result.

## Independent five-product LFSR architecture: exact period 1,876

The same five source-derived word products also specify a far more discriminating **fifth-order linear-feedback recurrence** with zero guessed coefficients:

\[
K_t =11K_{t-1}+26K_{t-2}+8K_{t-3}+15K_{t-4}+2K_{t-5}\pmod{29}.
\]

Treating the five original words as GF29 lag1–5 coefficients yields the exact characteristic polynomial

\[
x^5-11x^4-26x^3-8x^2-15x-2\equiv
(x+9)(x+14)(x^3-5x^2-8x-6)\pmod{29}.
\]

The order of its five-dimensional **companion matrix** is **1,876 = 28 × 67**. An exhaustive fixed-word-product order control identifies **four of the 120** permutations whose recurrence matrices return to the identity at this exact period, including the printed order `[11,26,8,15,2]`. The other three are `[26,8,11,15,2]`, `[8,15,26,2,11]`, and `[15,11,2,8,26]`. This is a specificity observation conditional on a source-selected LFSR family, not an author-intent probability. A direct basis-vector computation proves every state returns after1,876 steps, while none of the three prime-divisor subperiods938,268,28 returns the identity. The first two visible linear roots20 and15 have multiplicative orders7 and28. **67 is the 19th Gematria Primus prime**, and the immediately following original p8 title starts with Roman **XIX**. This gives a specific human-visible original-source numerical relationship, with the author's use of LFSRs **unproven**. A transition may have lower period for particular seeds, but all possible seeds share period dividing1,876.

The recurrence's exact period provides a **key-independent original-cipher decision across all 29⁵ possible initial states**. Consider a full-chapter or continuous-book cipher that advances the recurrence once per original rune and emits ciphertext with **any unknown bijective GP29 substitution keyed only by the current recurrent state**. At lag1,876 the internal key state repeats, therefore equality of two original ciphertext runes is **equivalent to equality of their plaintext GP29 runes**, regardless of the five-rune seed and regardless of the secret per-state alphabet. This is stronger than additive keystream cancellation and requires no plaintext guess. A nonlinear, state-dependent affine-GP29 positive plant verifies the entire equality identity, as does an independent additive-pad encrypt/decrypt control.

| Fixed untouched original register | Lag1,876 pairs | Equal ciphertext runes | Rate |
| --- | ---: | ---: | ---: |
| All rune-bearing p0–p55 | 11,080 | 375 | 0.03384477 |
| Floral p40–p53, unbroken | 1,132 | 34 | 0.03003534 |

Identically sized **source-native GP** windows from genuinely unrelated historical texts carry many more lag1,876 symbol-equality events, with the exact original comparison schedule. The source-calibrated Gibran register's eleven full-book control windows give 612–702 matches (vs375), and eleven floral controls give50–79 (vs34). Nine-window Shakespeare and Emerson controls also exceed both original counts; Latin Vulgate nine-window controls do as well. These controls are independent of every hidden seed and cipher alphabet, but their relevance still assumes a normal source-native GP spelling register.

**Result:** exclude the complete full-book or floral-chapter always-advancing GP29-bijective fifth-order LFSR architecture specified by the p7 complete five-word product coefficients. The exclusion covers **all keys and all unknown periodic state substitution alphabets**, a much wider family than testing particular seeds. It **does not** exclude feedback-dependent key state, punctuation/transparent-F clock skips, different reset states, non-GP plaintext, or extra cryptographic layers.

The [reproducible single-file Windows Node22 all-secret gate](../sims/lp2_p7_fiveproduct_lfsr1876_original_sft.cjs) checks the original red packet, polynomial factorization, entire state-matrix period, the untouched p0–p55 and p40–p53 originals, exact known-native encrypted plants, and source-native holdouts. Both original-cipher models in this consolidated note are now independently archived; neither recovers unknown-page plaintext. Future work should find an author-given **state update involving the ciphertext or a different output register**, if any, before investing in another p7-product-derived generator.

## P8 printed-word key recovery under every source-product LFSR seed (22 November, Agent 36)

**New decision: the p7 coefficient-driven homogeneous LFSR fails on the original p8 *alone*, even if its initial five-rune seed is completely unrestricted and it resets at the start of p8.** This is a stronger local conclusion than the whole-book period-1,876 equalities above, since it needs neither interpage key continuity nor a secret key phase. It is conditional on native-GP ordinary word spelling.

A human could multiply the five physically red p7 rune words in GP29, obtaining exactly `[11,26,8,15,2]`, and apply them as the coefficients of the fixed fifth-order recurrence `K_i=11K_(i-1)+26K_(i-2)+8K_(i-3)+15K_(i-4)+2K_(i-5) (mod29)`. No original source explicitly mandates a recurrence; the five red products motivate this precise, testable candidate. Under either direct additive sign, a printed ciphertext word of length L determines L candidate keystream symbols `K=C−P` up to overall sign. Every set of **five consecutive** key symbols determines all later values under the recurrence. Therefore each word of length at least **nine** must satisfy four or more **exact GF29 recurrence equations** independently of all `29^5` possible hidden seeds, the unknown initial five key symbols, or the preceding words.

There are exactly **49 page-local black word fragments** after p8's two red heading words (4+8 red runes); their 243 black runes include **six long complete printed words**. Crucially, the last p8 fragment consists of **one rune** that continues into p9's first five runes, forming a single **six-rune word**. Hence p8 has **48 complete black words plus one cross-page fragment**, rather than 49 complete words. The six tested long words occur entirely within p8, so this source-boundary correction does not change any key-recovery rejection. Test every distinct ordinary English word spelling in the source-native 29,157-word TextBlob reference, retaining the already-solved GP spellings where `ING` and `IO` each occupy one rune. Independently test every printed word in the original **39,835-word** Latin Vulgate GP29 reference without English-word assumptions.

| Black word index (0-based) | Body rune offset | Rune length | Distinct English GP candidates | Distinct Vulgate GP candidates | Candidates satisfying every recurrence equation, English / Latin |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 3 | 8 | 9 | 3,397 | 935 | **0 / 0** |
| 27 | 112 | 10 | 2,388 | 728 | **0 / 0** |
| 29 | 128 | 12 | 767 | 297 | **0 / 0** |
| 35 | 160 | 10 | 2,388 | 728 | **0 / 0** |
| 37 | 174 | 9 | 3,397 | 935 | **0 / 0** |
| 45 | 221 | 9 | 3,397 | 935 | **0 / 0** |

There is also a **direct actual-key recovery attempt**. The first two original black p8 words have lengths **three plus two**, fixing an arbitrary five-symbol additive pad under any plaintext choice in those slots. Exhaust **753** distinct source-native GP3 spellings × **189** distinct GP2 spellings = **142,317 candidate initial pads** per sign. Exactly **4,453** per sign decrypt the next printed three-rune word to a native dictionary entry. **Zero** decrypt the following original nine-rune word to an entry, under either sign, with no language score or fitted seed. The redundancy between signs is expected because multiplying every pad symbol by −1 preserves a homogeneous recurrence. It is still an explicit invertible key-search test, not a language-only statistic.

The standalone SFT generates source-native candidate words across **all 49 original p8 page-local fragment lengths** (the final one representing a printed cross-page fragment), encrypts the 243-rune source-shaped control using a truly arbitrary concealed five-rune state `[7,11,3,23,5]`, and confirms exact source recovery and detection of a true key candidate under **both signs**. A separate five-term encrypted plant, original p8 sign controls and the independently encoded Latin word gate are also checked. No unknown p8 plaintext survives the original word constraints. The test passes on original source in Windows Node22 Actions; [reproducer](../sims/lp2_p8_fiveproduct_lfsr_allseed_nativeword_sft.cjs).

**Seven-page chapter extension, without changing the fixed recurrence:** a source-aware word parser preserves seam continuations across pp8–14, giving **380 fully contained words** and **29 complete long words** with lengths at least nine (per page **6,3,2,9,5,3,1**). Each of the 29 fails the same all-secret word equations against both native-English and Latin lexica, including **18 long words with no literal ciphertext F**. Consequently a literal-F-only key-clock skip cannot rescue the full seven-page chapter, since these 18 words contain no source-visible bypass positions. The test does not require a common key between pages or words.

**Decision:** retire a literal page-reset or even independently word-reseeded p7-product homogeneous order-five additive keystream for **native English and the independent Vulgate register**, even with unlimited hidden initial seed and either sign, on unchanged complete original long words across pp8–14. This does not exclude exotic English vocabulary absent from the finite corpus, a different original plaintext language, altered word breaks, plaintext/ciphertext-conditioned key evolution, skipped-runic clocking or other cryptographic layers. This is a key-independent bounded cipher-class rejection and a failed complete-page key recovery, **not** authenticated plaintext.

## Stronger full-state exclusion for previous-ciphertext differential emission

The original adjacent-equal-runic deficit motivates a self-synchronizing receiver. An independently testable adjacent-difference family is

\[
D_i=(C_i-C_{i-1})\bmod29=\pi_{K_i}(P_i),
\]

where \(P_i\) is a source-native plaintext GP symbol and \(\pi\) is **any secret bijection selected by the p7-defined LFSR state**. This covers arbitrary additive shifts, nonlinear symbol relabelings and the differential cipher \(C_i=C_{i-1}+\pi_{K_i}(P_i)\) whose ciphertext feeds the next output by integration. Here **equality of original first differences** at lag1,876 must equal plaintext symbol equality at the same lag for **every secret initial state and per-state alphabet**.

Untouched original whole p0–p55 contains **389 of11,079** equal first-difference pairs at lag1,876; floral p40–p53 contains **41 of1,131**. Native source controls must be compared to plaintext **GP rune** equalities, *not* differences between native GP runes: nine original-length shifted Gibran controls yield622–726 equal rune pairs for the whole register and53–80 for floral; Shakespeare 610–692 and50–71; Emerson 648–727 and55–85; Latin Vulgate 756–844 and71–91. All exceed their untouched original counterparts. The test therefore rejects this **entire integrated, ciphertext-feedback family**, including every undisclosed 5-rune LFSR seed. A known-native affine-state differential encrypt/decrypt plant recovers all plaintext and satisfies the exact lag-invariance identity.

This eliminates another plausible way to turn the source five-dot/no-repeat observation into a keyed differential stream. It does **not** exclude a cryptosystem whose future state changes in response to ciphertext or plaintext, whose schedule skips particular runes, or whose position resets independently. The key distinction is whether the **full key state repeats exactly after1,876 physical runes**. This section reports a motivated original-input exclusion rather than an unknown-page decryption.

## Direct original five-tap ciphertext-feedback receiver

A further **separately reversible** model uses the same five originally printed products as feedback coefficients on the previous **ciphertext** symbols:

\[
R_i=C_i-11C_{i-1}-26C_{i-2}-8C_{i-3}-15C_{i-4}-2C_{i-5}
\pmod{29}=\pi_{K_i}(P_i).
\]

This receiver is fully specified by source integers, ciphertext and any secret per-state GP29 bijection. The first five original source symbols serve solely as a source-provided initial feedback register; the test begins at original rune index5, with no fitted ciphertext IV, no postselected key, and no changes to text order. For the full book, the untouched five-tap innovation stream has **402 of11,075** lag1,876 equalities; for independently delimited floral p40–p53, **47 of1,127**. Native GP English controls at the matching offsets give Gibran **612–702 /11,075** and **50–79 /1,127**; Shakespeare **610–692** and **50–71**; Emerson **647–726** and **55–85**. Each nine-window Latin Vulgate control also exceeds both originals.

Because a fixed, bijective transformation \(\pi_{K_i}\) repeats whenever the full autonomous source-defined key state repeats, the same **all-keys equality impossibility** applies to this entire 5-tap autoregressive family, regardless of which of 29⁵ initial key states or secret per-state alphabets are used. The fully reversible positive ciphertext-feedback plant in the SFT reconstructs every native control rune after the five-symbol IV. The result excludes a **specific source-motivated reversible feedback architecture**, a materially sharper exclusion than a free additive-key sweep. A feedback cipher that changes its **key-state evolution** based on ciphertext, plaintext, punctuation, or a skipping counter is outside this **autonomous-state** theorem. **21-Nov-2026 follow-up:** the independently examined *linear, ciphertext-driven* update \(K_i=\sum_j w_j K_{i-j}+qC_{i-1}+r\), followed by any secret affine GP29 rune output, is now excluded against native-dictionary long words even with unrestricted five-state resets and affine keys per printed word; see the [all-secret original projective-signature gate](lp2-p7-cipherdriven-fivetap-projective-original-gate.md). That result does **not** exclude nonlinear/hidden-register ciphertext updates or a second encryption layer.

**Most useful next discriminator:** recover a first-party key-state update that provably differs from the autonomous 1,876-period LFSR, or an exact original unknown-page plaintext fragment. Further searches over five source coefficients, fixed phases or secret bijections cannot rescue these three tested receivers without modifying their state law.

## Source-authenticated transparent-F clock, all-secret original-cipher gate

The known LP1 and LP2 p56 decryptions contain literal ciphertext F symbols that pass through to plaintext F **without advancing their cipher clocks**. We tested that independently visible possible exception to the fifth-order period-1,876 p7 generator: in the specified model **all** ciphertext F runes pass through literally and consume no recurrent state; every other GP rune consumes one recurrent state and is subjected to an **arbitrary unknown bijection of the 28 nonzero GP runes**, chosen by that state. The unknown initial five-rune state and every secret 28-symbol alphabet remain unrestricted. Under any such model, equality of two ciphertext non-F symbols that consume the *same recurrent phase mod1,876* is equivalent to plaintext non-F symbol equality at those two sites, for all keys. The original ciphertext alone determines the consumed-site phases.

For the **whole original 12,956-rune p0–p55 corpus**, 458 F symbols are transparent under this hypothesis and 12,498 non-F symbols remain. Exactly **35,592** pairs share a recurrent phase; only **1,305** have equal original glyphs (rate 0.03666554). For the source-visible floral p40–p53 chapter, 2,883 non-F runes yield **26 equal among 1,007** phase-matched pairs (rate 0.02581927). The direct test preserves original source order and exact printed F sites.

Nine native-GP source-control windows for each of four independent historical texts are filtered to their 28 nonzero rune values and placed into exactly the same original phase classes (no learned phase, secret key or glyph substitution). The whole-register equality counts are Gibran **2,150–2,287**, Shakespeare **2,165–2,330**, Emerson **2,206–2,428**, Latin Vulgate **2,516–2,667**. Their floral counts are respectively **47–78**, **40–94**, **53–74**, and **66–81**, all exceeding the untouched original values. This is a model-gated source-native language rejection, not a proof that every possible LP2 register is ordinary English.

An independent positive plant forces F at the **original cipher's exact F sites**, uses the source-derived period1,876 recurrence, encrypts genuine native-GP nonzero text under a state-dependent invertible field multiplier, recovers every source symbol, and verifies phase-pair equalities unchanged. The [single-file Windows Node22 SFT](../sims/lp2_p7_lfsr1876_literal_f_allsecret_sft.cjs) contains all original and control assertions.

**Decision:** the naive authentic solved-stage F-bypass extension, with **all** ciphertext F being literal, is ruled out for normal source-native GP plaintext for the complete corpus and floral chapter under *every* secret state and per-phase nonzero alphabet. The actual signed p56 example uses only **one F escape among five ciphertext F glyphs**, so the historical material does not select an all-F mask for LP2 unknown pages. An independently sourced **partial F escape mask**, nonlinear key-state feedback, additional cipher layer, non-GP plaintext or page reset could still escape these tests. No plaintext or key recovery is claimed. Do not fit a new arbitrary 458-bit F mask absent a manuscript-selected rule.
