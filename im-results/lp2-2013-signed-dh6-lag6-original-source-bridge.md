# Signed 2013 DH/p39 lag-six quadratic branch: original-input discriminator

**15 November 2026, Agent19. Classification:** bounded *extension* of the already published [12 November signed-DH6 → LP2 lag-six source bridge](2013-signed-dh6-original-lag6-source-bridge.md), whose original signed 2013 numerics, exact lag-six operator, source-lag alternatives, two grid factors, and 80/1290 original matches were all established before this invocation. **The signed-DH6→echo connection is PRIOR ART and must not be attributed to this note.** What this invocation independently contributes is (i) all 24 signed-example lag/digit/coefficient choices under an explicitly conditioned heldout null, and (ii) a compact p39-square factor/affine-map functional identity together with **two-root original-cipher conditional tests**, 1,800 surrogate books and independent plants. Both are exploratory, post-selected extensions. **No new plaintext, authentic key, validated encryption rule or destination.**

## Historical 2013→LP2 source relation (12 November prior art)

The authenticated **26 January 2013** Cicada TCP/Diffie–Hellman challenge, preserved and signature verified in [the original protocol record](../resources/external/2013-tcp-server-signed-source.md), gives a complete worked example:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
BASE29 3301 -> 3QO
```

The DH modulus is 23, generator 5, server public share **8**, client public share 19 and shared secret **2**. The tiny original example permits the server secret exponent to be recovered exactly without a password search: `5^6 mod23 = 8`; likewise the client exponent is 15 and `19^6 mod23=8^15 mod23=2`. BASE29 3301 supplies the actual GP29 digit values `[3,26,24]`, so its last digit is **24** and `3301 mod29=24`.

The previously published, independently selected [LP2 word-local affine echo](lag6-conditioned-echo.md), originally noticed by pnotisdev and later tested here over **5,684** different affine/lag choices, is exactly:

```text
C[word,i] = (24 - 2*C[word,i-6]) mod29      when i >= 6
```

It is the **single strongest** candidate in that broad historical affine/lag scan, with **80/1,290 original word-local** equality observations (word-inventory/adjacent-doublet-conditioned null around 46), and a whole-5,684-family empirical p near **0.013**. Those are previously established observations, not new ciphertext discovery.

**The earlier 12 November work already recovered all these numerical ingredients from the older signed example:**

| Operator element | Independent 2013 signed example | LP2 word-local observed operator |
| --- | --- | --- |
| Predecessor distance **6** | Small DH server private exponent `log_5(8) mod23 = 6` | `C[i-6]` |
| Multiplier **−2** | Negative of publicly returned DH shared secret `2` | `−2*C[i-6]` |
| Fixed point **8** | Original server public share `8` | `T(8)=8` |
| Constant **24** | Low BASE29 digit `O=24` in `3QO`, or equivalently `8 + 2*8 =24` | `T(0)=24` |

An equivalent original-source **anchored dilation**, emphasizing the signed server public share as the map's fixed point, is:

```text
T(x) = serverPublic - sharedSecret * (x - serverPublic) mod29
     = 8 - 2*(x-8) mod29
     = 24 - 2*x mod29.
```

Thus the original server public value **8** is the previously documented distinguished *fixed point* of the affine echo. This fixed-point identity removes the need to choose its intercept from an unrelated numeral: signed DH `A=8`, signed shared `K=2` and natural field `GF(29)` already determine `24`. The 2013 signed BASE29 `3301=3QO` then independently reproduces that constant. The server exponent supplies the six-rune delay. Each number and the server's worked-operation semantics are available **before** the 2014 manuscript. The missing, central premise is an instruction that tells a solver to **transport the 2013 DH worked example as an affine, word-local recurrence on the later ciphertext**. There is no preserved instruction to do so, so this four-number alignment is compelling source arithmetic, not proof of intent.

The same authenticated 2013 material had *already* supplied the independent original LP2 numerical table factors [H2013 and Gp39](2013-base29-gf29-grid-factor.md): `H=3+26X+24X²` from BASE29 `3QO`, and `G=15(X−24)²=27+5X+15X²` from the recovered **DH client exponent15**, signed generator5 and original 3301 residue24. These both exactly divide the source-normalized 256-byte p49–51 table polynomial over GF29. The factor-to-original-grid mechanism has been mathematically verified and is still interpretively conditional. The old source-to-operator study had already identified the **independently observed** six-back ciphertext echo as a third use for the same historical worked-example values. The two old relations do not automatically prove each other or give a cipher inverse.

## Both original red triads can reconstruct the same signed DH example, conditionally

As already recorded in the [2013-grid predecessor study](2013-base29-gf29-grid-factor.md), the manuscript has **exactly two original red three-rune inscriptions**, at the identical local rune offset **119** on physical p3 and p39. Their authentic GP29 indices are **p3 `[13,23,2]`**, **p39 `[27,5,15]`** ([source-locked witness](lag6-conditioned-echo.md#source-marked-36-page-affine-transport-and-limited-original-cipher-prediction)). The independent signed 2013 worked DH example yields `p=23`, `g=5`, `A=8`, `B=19`, `K=2`, client secret exponent `y=15`. The **previously documented** compact retrospective six-field mapping reproduces **both complete original red triples**:

```text
p3  red [g+A, p, K] = [5+8, 23, 2] = [13,23,2]
p39 red [-K mod29, g, y] = [27, 5, 15].
```

**This previously published arithmetic is exact on original marked glyphs**, with no fitted key string. It also reconstructs the signed original DH response: `A=p3[0]−p39[1]=8`, `B=5^15 mod23=19`, `A^15 mod23=2` equals p3[2], and `p39[0]=−p3[2] mod29`. The server exponent `log_5 8=6` then gives the six-back lag, while the same source supplies the affine fixed point8 and slope−2.

**Severe interpretation limit:** the red inscriptions never explicitly label `g+A`, `−K`, or `y`; choosing those arithmetic expressions to match the historical DH worked example is **post-hoc** and there is no known human-readable selector for the role split. The signed example's client exponent15 is derivable by discrete log in this toy group, but not explicitly printed as a parameter. The red relation may be intentional cross-round hinting or coincidence among small modular numbers. The shared offset119 and 36-page separation are authentic geometry, but neither directs a decoding operation. The earlier [independent original red/black 36-page affine test](lag6-conditioned-echo.md) correctly predicted one nearby black rune under a retrospectively chosen affine 36-page transfer; no full-page or unknown-plaintext inverse resulted. Do not treat the red triples, p50 factors, and the lag-six echo as statistically independent evidence, since all are now linked by a **single retrospectively selected DH interpretation**.

## A second independent ciphertext motif uses the same 2013 DH generator and client exponent

The authenticated 2013 toy DH exchange also has **generator `g=5`** and a **recoverable client private exponent `b=15`** (`5^15 mod23=19`). Independently of the lag-six echo, earlier [original source-conditioned research](lag5-rune-specific-echo.md) identified LP2's strongest **specific-rune lag identity** as:

```text
C[word,i] = C[word,i−5] = 15, for eligible i≥5.
```

The rune with canonical GP29 index **15** is **S**. Exactly **11** of 2,105 within-word lag-five sites form this S→S self-echo, in **11 different words**. It had previously beaten all 29 rune identities at lag5 (strict 3,000-sample word-multiset and adjacent-doublet-conditioned family maximum) and then **all 174** rune-identity × short-lag (2–7) combinations under a separately frozen 3,000/3,000 null experiment, **0/3,000** exceedances (finite add-one bound 1/3,001). These independent primary-data observations **predate the present historical association**.

Thus the **same Cicada-signed 2013 numerical example** now supports a *retrospectively reconstructed two-clock explanation* for the book's two previously distinct strongest ciphertext motifs:

| Independent old LP2 feature | Source arithmetic selected retrospectively |
| --- | --- |
| `C[i] = 24−2 C[i−6] mod29`; 80/1,290, whole-source word-local echo | Lag **6** is toy DH server exponent `log_5 8=6`; map is `−g−Kx` with source generator **5**, shared **2** and `−g=24` matching signed BASE29 3301 last digit |
| `C[i]=C[i−5]=15`; **11/2,105**, most exceptional symbol-specific short-lag echo | Lag **5** is signed DH generator **5**; echoed **S GP-index15** equals separately recovered toy DH client exponent `log_5 19=15` |

The original [four-feature trained/frozen conditional ciphertext predictor](lag5-lag6-heldout-conditional-prediction.md) **already** detects both motifs and the general lag-five/contiguous-copy features across all eight withheld section folds, with combined heldout log-likelihood improvement **+23.2726 nats** and 0/1,500 independent original-section-word surrogate exceedances. That is **prior art** and a source-conditioned predictive-statistical result. The historical DH connection may supply a more compact *human clue path* to choosing both clocks and a special symbol, but **nothing in the 2013 instructions says to use `g` as a lag or recovered `b` as a marker**. The cross-round association is selected after both motifs were known, hence its apparent numerical fit has no discovery-wide p-value.

A concrete *original-site disambiguation* prevents treating this as a solved two-channel code: among the **11** original S5 matches, **7** occur late enough also to have a T6 opportunity; **none** is simultaneously a T6 match. An overlap would require the untouched triple of source indices `C[i−6]=19, C[i−5]=15, C[i]=15`, because source `T(19)=15`; **no such event is present**. Similarly, `T(15)=23` and `T(24)=5` are exact transitions among signed values on the already established 28-cycle, but the fact that all 28 nonfixed GP symbols lie on one T-cycle makes additional orbit coincidences easy to select after observing the data.

**Research-useful constraint:** Any source-selected two-clock *reversible* explanation would have to predict **both** word-local T6 and the S-only lag5 surplus, explain the anti-repeat global deficit, preserve the original word lengths, and recover coherent GP prose using a key found independently. The known artificial M3 random-rewrite plus 1.5% five-back copy model approximates the aggregate heldout statistic **without** being a reversible source cipher. A false assumption that a direct dense lag-five affine map explains the S5 surplus was already excluded by the [29-map non-S fixedpoint sieve](lag5-rune-specific-echo.md). Do not run yet another broad 5/6 clock sweep on this numeric resemblance alone.

## A candidate *in-book* physical selector for the exact S5 anomaly

The historical DH example is external to LP2; the original manuscript's **red ink** offers a more locally visible clue. Its **p39 red three-rune span at original offset119** reads **[27,5,15]**, already authenticated as a p50 polynomial factor. Interpret the **last two adjacent rune indices [5,15]** literally as `(lag 5, repeating GP rune index 15)`. This selects *exactly* the independently discovered **S(index15) self-echo at lag5**, which was already the strongest word-local rune-identity/short-lag anomaly under the documented **174-model conditional family**. The physical red [5,15] might therefore function as a human-visible "which recurrence should I test?" cue, independent of whether the signed 2013 client exponent15 was actually meant as a selector.

The original [ink annotations](../resources/liber-primus/lp2-ink-annotations.json) contain **18 red spans**. Reading **every adjacent red rune pair** whose first GP index is one of the independently investigated lags **2–7** yields **41 original printed `(lag, rune)` pairs** across all red spans, including solved p57. **Exactly one pair** in those 41 is **`(5,15)`**, namely the last two red glyphs on **p39** at original offsets **120–121**. Among the 41 original pairs, three other `(lag, rune)` combinations coincidentally achieve 11 raw matches but have much larger normal backgrounds, while `(5,15)` is the unique previously verified **z≈6.82** winner under the full 174-cell null. This is a *bounded in-book selector concordance*. The independently published 174-family 3,000/3,000 null itself reports no familywise exceedance of the original 11 S5 hits (conditional add-one 1/3,001), but the novel assignment of "first red digit means lag; second means echoed rune" was chosen **after** knowing the S5 anomaly. It cannot establish independent probability of author intent or validate a decoder.

[Original-rune/red-ink source selector SFT](../sims/lp2_p39_red515_s5_source_selector_sft.cjs) programmatically checks every red span against the canonical corpus, enumerates all 41 pairs without hiding other options, asserts the uniquely marked original pair, and reproduces the original 11 lag5 S-symbol equalities. [Historical original 174-cell conditional test](../sims/short_lag_rune_identity_scan.cjs) is reused as validated prior statistical evidence rather than re-run in an unfocused sweep. The red-selector witness now executes alongside the source-directed signed-DH test in the **same on-demand Windows CI**, not a new automatic workload.

**Decision:** Keep the p39 last-two-red-glyphs → `(lag5,S)` mapping as a plausible local *clue to identify one rare statistical mechanism*. A real intended solve still needs an original instruction explaining how that extra S5 copy carries recoverable plaintext or key information, and a way to invert the rest of the 12,956-rune ciphertext. The red factor [27,5,15] also supports other established p50 interpretations; resemblance alone does not choose the intended one.

## A common algebraic generator for the p39 red factor and the lag-six echo, with a signed-branch discriminator

**Prior-art boundary for this subsection:** The factorization `G=15(X+5)²` is already printed in [the 2013 source-factor study](2013-base29-gf29-grid-factor.md); the original affine branch T− and its 80 hits, as well as the opposite-sign branch's 34 raw hits, are already in [the 12 November signed-source bridge](2013-signed-dh6-original-lag6-source-bridge.md). The incremental result here is the **explicit polynomial functional equation** `G(T±(x))=2x²` that connects those independently studied objects as a single algebraic two-root mechanism, the exact original-source **two-branch/union** counts, and the 1,800-book source-conditioned significance contrast. None is a recovered cipher.

The red p39 **factor itself** admits a short source-specific expression using just two original signed-DH values: original base/generator `g=5` and returned shared secret `K=2`. Because **`2^−1=15 mod29`**, its printed `[27,5,15]` exactly equals

```text
G(Y) = 27 + 5Y + 15Y²
     = (Y+g)² / K             (mod29)
     = (Y+5)² / 2             (mod29).
T−(X) = −g − K*X = −5−2X = 24−2X (mod29).
G(T−(X)) = K*X² = 2*X²       (mod29).
```

The first equality is verified against **all 29 possible GF29 symbols** in the SFT. This links the **entire p39 polynomial** and the independent LP2 six-back cipher-echo operator through the same signed 2013 `(g,K)=(5,2)`. No need to select exponent15 retrospectively from the toy DH client: the polynomial's coefficient15 is **already the multiplicative inverse of its signed shared2**. The original 3301 BASE29 final digit24 agrees independently with `−g mod29`. This is an exact algebraic relation between authentic original/source objects; the mapping of their roles remains a hypothesis.

The square identity predicts a **second** signed-DH branch `T+(X)=−g+KX =24+2X`, since `G(T+(X))=2X²` as well. The two branches only coincide at GP input `X=0`. That gives an inexpensive, falsifiable consumer of the proposed common square mechanism: compare **both** natural roots against the **same** untouched word-internal six-back ciphertext sites, without choosing an alignment or fitting any key.

| Original LP2 lag-six test, 1,290 sites | Exact matches | 1,800 original-word multiset/adjacent-repeat-preserving nulls |
| --- | ---: | --- |
| **T−(X)=24−2X** (signed-source negative branch) | **80** | mean **45.7022**, SD **6.5741**, 0/1,800 at/above original |
| **T+(X)=24+2X** (opposite quadratic root) | **34** | mean **42.1439**, SD **6.1621**, 1,657/1,800 at/above original |
| Either root, deduplicating coincidence at input0 | **113**, with just one overlapping match | mean **86.5544**, SD **8.7561**, 0/1,800 at/above original |

The original halves independently contain **40/19** negative/positive matches and **40/15**. A pair of independently generated 26-rune positive plants exercises each exact root on all 20 eligible positions. The source-selected **negative branch is unusually represented and the companion branch is not** under this narrow word-conditioned control. Thus the whole-square relationship does *not* by itself justify a symmetric hidden-sign/±-branch code; a source-selected rule to prefer the negative root or a biased sign state would be required. The negative statistical finding is a meaningful restriction on attempts to turn `G` into a reversible two-root LP2 message, **not** a decryption.

As a direct unkeyed GP inverse check, the 1,290 defined `D_i=C_i+g+K C_{i-6} mod29` values have index of coincidence **0.035468875**, near uniform GP29 and well below the native original GP-English register; its most frequent rune is F at **80/1,290** precisely because `D=0` encodes the T− hits. The first six positions of each word are undefined by this relation. This fails as an ordinary direct-GP-English decoder and supplies neither the missing key nor a readable sentence. A sparse overwrite/rejection process could generate the same zero surplus, but must preserve information to be cryptographically reversible.

**Full word-reset feedback inverse (16 November 2026, Agent15).** To supply the six initial states missing from the unkeyed check, freeze the ordinary additive-feedback interpretation: **C[w,j] = P[w,j] + 24 − 2·S[w,j] (mod 29)**, where **S[w,j] = K[j]** for j<6 and **S[w,j] = C[w,j−6]** otherwise. Its inverse is **P = C − 24 + 2·S (mod 29)**. The original joined-word corpus was tested without changing boundaries: **2,896 words, 12,956 runes, 32 cross-page words**. Two fixed, source-derived six-symbol initial states were tested in reading order: (1) the concatenated original p3/p39 red triads **[13,23,2,27,5,15]**; (2) the 2013 DH worked-example values in protocol order **[23,5,8,19,2,6]** (including recovered server exponent 6). Both inverses pass a synthetic encrypt/decrypt round trip, but neither yields readable text on the original corpus: full-stream IoC is **0.034474** and **0.034449**, respectively, against uniform GP29 **1/29 = 0.034483**. Representative initial output is **BUIARNGAERNG BMIAOEL RRSY THRTH CTHJ** for the red-triad seed and **HDIBSWRNG HEOIGX AYIAI OEYX AEAD** for the DH seed. The 80 exact six-back echo sites necessarily become F under this model; the remaining eligible positions do not form a coherent plaintext. This rejects these two natural initial-state candidates for a *complete* additive feedback cipher. It does not reject the observed sparse echo, a collision-repair interpretation, or an independently sourced different state rule. Reproducer: [word-reset DH6 feedback inverse SFT](../sims/lp2_dh6_word_reset_feedback_inverse_sft.cjs).

**Execution:** the [expanded single-file SFT](../sims/lp2_2013_dh6_lag6_signed_source_bridge_sft.cjs) now proves the 29-value polynomial identities, tests and plants both sign branches and checks 1,800 independent source-conditioned nulls, in addition to the earlier 24-choice full-original test. The amended [Windows Node22 GitHub Actions run **43656986364** passed](https://github.com/FlareZ123/liber-primus/actions/runs/43656986364).

## The recurrence is spread beyond the first legal position of a long word

A narrower plausible interpretation of the signed source's exponent **6** is a *single fixed mark at local rune offset six* (zero-based), possibly revealing the sixth-step delay once per long word rather than a recurrent state. That interpretation predicts any surplus of `T−(C[i−6])` agreement should occur at **only the first legal offset j=6**. Test this direct choice against the original source without selecting a new cipher parameter or constructing a plaintext candidate. There are **559** complete printed words of length at least seven, with **1,290** total eligible comparisons.

| Printed within-word rune offset | Eligible positions | Exact T− matches in original | Exact-word 1,900-null expectation (SD) |
| --- | ---: | ---: | ---: |
| First eligible **j=6** | 559 | **33** | **20.0953 (4.4187)** |
| **j=7** | 343 | **19** | **12.0732 (3.3951)** |
| **j=8** | 187 | **12** | **6.6053 (2.5421)** |
| Later **j≥9** | 201 | **16** | **6.9326 (2.5735)** |
| **Every later site j≥7** | **731** | **47** | **25.6111 (4.9618)** |

With seed `0x6acc2013`, every one of **1,900** independent surrogates preserves every original word's complete GP29 multiset, length, and exact adjacent-repeat count. **8/1,900** surrogates reach/exceed the original first-legal count33 (add-one upper tail **9/1,901≈0.00473**). **0/1,900** reach/exceed the original **later-site count47** (add-one upper tail **1/1,901≈0.000526**). These are *conditioned comparisons of the already-selected source operator*, not discovery-wide p-values. Their late-site result remains large enough to reject a very narrow source interpretation in which **the first six-back comparison in each word alone is altered** and all subsequent runes have the conditional-null relation. The pattern is compatible with repeated/ongoing opportunities for an echo. It neither identifies their trigger nor tells whether the extra matches result from real encryption, higher-order dependencies, or post-selection.

Reproducer: the same [source-native single-file SFT](../sims/lp2_2013_dh6_lag6_signed_source_bridge_sft.cjs) now asserts all four original offset counts, their denominators and the first/later conditional null exceedances, with a planted exact six-back stream elsewhere in the test.

## Independently executable source-constrained 24-choice check

To constrain the retrospective construction, test a small, explicit family whose elements are public numbers from the signed 2013 example. The word-local lag choices are `[2,5,6,8]` (shared DH key, DH generator, recovered server exponent, server public share). The base29 output digit choices are `[3,26,24]`. The linear coefficient is `±2` (both signs of the DH shared key). Every combination is evaluated against the *unchanged 12,956 original GP29 cipher runes*, joined into their 2,896 original printed semantic words including 32 page-spanning carries, with no plaintext scoring, fitted key, or invented symbol. The source word lengths have a maximum of14, so the historically present values 15,19,23 cannot serve as a **word-local lag** within this direct family; that restriction is itself a model choice, not a complete audit of every signed-source operation.

The source-derived model `(lag6,intercept24,multiplier−2)` is **the strongest of all 24** by the same heldout standardized null-score comparison; its 80 matches divide **40/40** across the first/last 1,448 original words. The next strongest of the 23 other choices is `(lag5,intercept26,multiplier−2)` with 84 matches but only z~1.40 after adjusting for the larger 2,105 site count. The original best has estimated z~5.22.

To obtain conditional baselines, shuffle **within each complete original printed word**, holding fixed that word's exact GP29 multiset, length and number of adjacent-equal pairs. Freeze each model's mean/SD on **350** deterministic source-conditioned training-null books; then resample **1,200 wholly independent** such null books, re-evaluating the **maximum z over all 24 choices** each time. Original selected source model: null mean **45.365714**, SD **6.632213**, observed **80**, z **5.222131**. No tested null book meets/exceeds this observed 24-model maximum, giving conditional finite-family fraction **1/1,201 = 0.00083264**. This *cannot* be interpreted as a discovery-wide probability, because the 2013-source connection and the 24-value shortlist were assembled with full knowledge of the already-discovered pnotisdev LP2 operator, and any historical search over arbitrary lags/multipliers must account for many more choices. The previously established 5,684-model conditional p≈0.013 is more appropriate for the **LP2 echo's statistical discovery**.

[Source-native CommonJS SFT](../sims/lp2_2013_dh6_lag6_signed_source_bridge_sft.cjs) asserts original corpus size, signed DH values, six-back count, 40/40 halves, all 24 original targets, exact null calibration, first-rank source match, the independent 26-rune positive echo construction, and zero of 1,200 24-model-null exceedances. [Successful opt-in Windows Node22 GitHub Actions run **43656251509**](https://github.com/FlareZ123/liber-primus/actions/runs/43656251509), workflow [agent19-2013-dh6-lag6-manual.yml](../.github/workflows/agent19-2013-dh6-lag6-manual.yml). Original signed source and original rune corpus are referenced in-place; no third-party source bytes are copied.

## Exact causal hypothesis and what would count as a solution

A human in 2014 could have remembered the signed 2013 worked DH operator, recognized its numbers in **the later p39 marked polynomial and p49–51 number grid**, and been tempted to test a GP29 word-local six-back affine transform. The model is *human-plausible* but requires at least two unwritten choices: why use an anchored dilation instead of an ordinary DH exchange or source-selected 2013 BASE29 conversion, and why assert this relation only at about 80/1,290 long-word sites instead of using it at all sites?

The observed 80 of 1,290 matches **do not define a decrypting transformation**. Approximately 1,210 nonmatching positions cannot be explained by a deterministic six-back copy law. A sparse cipher-repair hypothesis could force the recurrence at selected sites; an overwrite rule of that sort is **many-to-one unless its input information is preserved elsewhere**. Existing [lag-six conditional-model work](lag6-conditioned-echo.md) and [lag-five/lag-six joint prediction](lag5-lag6-heldout-conditional-prediction.md) caution against mistaking matched collision statistics for a viable cipher. The simplest lag-six repair simulator was independently challenged in other research. Source-constrained next work would seek an **original symbol/line/dot instruction selecting the repair sites or a reversible register** and then predict heldout unknown-page symbol state without selecting those sites after observation. A genuinely recovered key/algorithm must decipher a contiguous, independently unexposed LP2 passage to native GP29 prose, re-encipher every original symbol, and account for the extra lag-five `S` echoes and nearly absent adjacent doublets.

**Research decision:** keep this **signed-source-to-exact-operator bridge** as a bounded high-priority *clue candidate*, while avoiding repetition of the already-exhausted generic lag-six collision-repair or affine-search programs. The exact triple/quadruple overlap was already reported on 12 November; the two-root algebraic relation and its source-conditioned tests are the new bounded extension, **with no original encrypted page solved yet**. Require an independently visible 2014 operation/clock selector, or a reversible predictive hypothesis, before expending large compute.
