# Corrected literal-F capacity: the original F-count exclusion is withdrawn

**Corrected 13 November 2026 (Agent1). Evidence class: exact original-source cipher-direction correction to a finite-corpus necessary-condition test.** The previous version of this report incorrectly inferred that **every ciphertext F is an unchanged plaintext F**, and used that premise to exclude 562,060 native-English windows as unknown LP2 plaintext. This was a substantive mistake about the historical cipher, directly refuted by already-solved Cicada ciphertext. **The count-based exclusion has been retracted.** No unknown LP2 plaintext, source-selected key or destination was recovered by this correction.

## Authentic direction: plaintext F forces ciphertext F

The solved LP1 WELCOME/DIVINITY (515 native GP runes) and LP2 p56 AN END (85 runes) use a **plaintext-F bypass** in their known keyed ciphers:

- If the **plaintext** GP rune is **ᚠ = F = 0**, the encoder outputs ciphertext F **and consumes no key symbol**.
- A non-F plaintext rune consumes a key symbol and is normally encrypted by addition modulo29. Depending on the key shift, an ordinary non-F plaintext rune can produce **ciphertext F**.

Consequently the valid necessary implication is

```text
P[i] = F  =>  C[i] = F.
```

The converse **C[i] = F ⇒ P[i] = F** is false on verified solved originals. For LP2 p56, the exact original ciphertext Fs at page-local positions **35, 47, 51, 56, 74** correspond to native-GP plaintext **A, I, D, F, C**. Thus only index56 is a bypass and **four of five original ciphertext Fs are ordinary encrypted non-F letters**. Independently, solved LP1 WELCOME has **25 ciphertext Fs** but only **11 plaintext-F bypasses**, with 14 ordinary encrypted non-Fs resulting in F. These are exact source evidence, not a guess about unsolved-page encryption.

The [authentic p56 32-mask certificate](../sims/lp2_p56_plaintext_fehu_ambiguity_sft.cjs) uses the actual known prime-totient stream to show that **22 different F-clock masks** can each encode strictly forward to exactly the same 85 genuine p56 ciphertext runes. The [independent known-key lexical decoder](lp2-ftransparent-word-lexical-viterbi.md) resolves all actual bypasses on **710/710** solved runes across three historical keys, without accepting ciphertext F as necessarily literal.

## What the original unknown-page F counts really imply

Original LP2 unsolved physical pp0–55 contain **12,956** runes with **458 ciphertext Fs**. The original visual chapter **pp40–53** has **3,008** runes with **125 ciphertext Fs**. Under the **same plaintext-F transparent encoder**, the only full-book count condition is

```text
plaintext_F_count <= 458,
and (for the independently keyed pp40–53 chapter)
plaintext_F_count_in_pp40_to_53 <= 125.
```

Both inequalities follow by inclusion of plaintext-F positions among the ciphertext-F positions. A correct count-only exclusion would need an independently fixed plaintext containing **more** than 458 Fs (or more than 125 Fs in the chapter), not fewer.

The repository's original source-calibrated 29-rune GP English encoder, with single-rune ING/IO, produces these unchanged **maximum** F counts over **every possible contiguous original-length window**:

| Independently sourced native-GP prose | Whole-length 12,956-rune windows | Maximum native plaintext F count | Section-length 3,008-rune windows | Maximum native F count |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 204,151 | 321 | 214,099 | 96 |
| Gibran, *The Prophet* | 49,537 | 390 | 59,485 | 109 |
| Emerson, *Essays* | 308,372 | 432 | 318,320 | 119 |
| **Total** | **562,060** | **all satisfy the actual ≤458 bound** | **591,904** | **all satisfy the actual ≤125 bound** |

**Correct result:** every one of the 562,060 reference windows satisfies the *correct necessary whole-book F count* and every one of the 591,904 reference windows satisfies the *correct necessary section F count*. This means only that **counts do not exclude them**. Their actual positional F masks, word shapes or other encryption properties might still reject specific plaintext windows, and no source tells us that any source passage is an LP2 original plaintext.

The former interpretation took `max(reference plaintext F) < observed ciphertext F` as a contradiction. Under the original validated encoder it is perfectly possible, because ordinary encrypted non-F symbols can contribute the additional ciphertext F occurrences. Indeed, the previous synthetic F-positive generated a **stricter artificial F-exclusive output code** by forcing every non-F to encrypt to a non-F, thereby making `P_F = C_F`. That positive control validated the artificial stricter model only; it did not justify attributing the stricter invariant to Cicada's known cipher.

## New, separately stated statistical constraint: independent-uniform random key plus plaintext-F bypass

The correction above restores all candidate English windows under the **deterministic F-count necessary condition**. A **stronger, explicitly stochastic cipher hypothesis** does produce a meaningful whole-book constraint. Assume that the original p0–55 plaintext is any contiguous source-native GP-English window in the three frozen reference corpora; the historical **plaintext F** is copied verbatim without consuming key, while every non-F plaintext GP symbol is added to an **independently uniform 29-valued key symbol**, then output modulo29. This is the canonical missing-key/random-pad model with the authentic Cicada F exception. Independence of the key from the plaintext and across ordinary positions is essential; nonuniform, feedback or constrained-output keys fall outside this model.

For fixed plaintext length `N` and plaintext F count `f`, the **number of ciphertext Fs** has the exact distribution

\[
C_F=f+\operatorname{Binomial}(N-f,1/29).
\]

An entire-book source-native GP English window of length **12,956** contains **at least 203 F runes** across all 562,060 reference windows (Shakespeare minimum203; Gibran255; Emerson294). Lower plaintext F count makes low ciphertext F outcomes more likely, so using the global minimum **f=203** is the most permissive bound for this null. Under this most favorable native-English candidate, the source ciphertext F count would have expectation **642.7586**, standard deviation **20.6057**. The original contains only **458** Fs. Its exact probability is

\[
\Pr[C_F\le458]\;\le\;
\Pr[\operatorname{Binomial}(12753,1/29)\le255]
=1.905185396\times10^{-22}.
\]

A union bound over **all 562,060** fixed corpus windows is at most **1.07083×10⁻¹⁶**, despite their overlapping dependency. This is a **conditional rejection of an independently uniform modulo29 pad combined with plaintext-F transparency** for source-native ordinary English of the kind represented by these three corpus segments. It is not the old incorrect hard count exclusion, not a general key-independent impossibility, and not a discovery of unknown plaintext. The known genuine **85-rune** p56 example has **one plaintext F** and **five ciphertext Fs**; under the same iid-key assumption, the probability of at least five ciphertext Fs is **0.32917**, which is unexceptional at this short length and does not contradict the historical local cipher.

The [new standalone exact CJS SFT](../sims/lp2_ftransparent_iid_pad_Fcount_sft.cjs) recalculates all three source-native minimum F counts from original archived prose, evaluates the binomial lower tail through a numerically stable recurrence, checks the complete union bound, and runs the authentic short-page comparison. [GitHub Actions run43433482418 passed](https://github.com/FlareZ123/liber-primus/actions/runs/43433482418). **Research fork:** if the unknown book does retain plaintext-F transparency, a naive independent uniform per-rune missing pad is disfavoured for native-GP English; look instead for a **source-selected nonuniform/key-correlated or stateful output mechanism**. An altogether different unknown LP2 cipher remains equally possible. No creator-authenticated route selects any of these mechanisms yet.

## Reproducible correction and operational decision

The [corrected CommonJS source SFT](../sims/lp2_literal_f_fullbook_native_capacity_sft.cjs) reads the exact original 12,956 LP2 cipher indices and their 3,008-rune chapter, recomputes all three native prose F-count maxima, asserts **the corrected inequality direction** for every window, and includes both the exact p56 F-position witness and a native-GP positive plant in which plaintext F remains literal while some non-F letters also encrypt to F. This is a narrow **source-based correction**, not a new cipher-search sweep. The exact F counts and window maxima from the earlier report remain usable descriptive observations after the inference is corrected.

**Decision:** withdraw the blanket all-secret unknown-LP2 English exclusion that was based on ciphertext-F-as-literal-F. Reopen the broader **plaintext-F transparent** cipher possibility only when a separate original clue selects its key and stream clock; do not infer that LP2 actually uses it. For any future proposed true plaintext, use the correct **positional necessary condition** `{i : P[i] = F} ⊆ {i : C[i] = F}`, then the known-key lexical clock decoder and exact forward encoding. The restriction on plaintext F positions can be useful on an independently supplied real crib, while the F **count alone** gives no contradiction for the control corpora.

## 25 November extension (Agent4): the F-count obstruction survives arbitrary collision-only suppression

The preceding binomial formula assumes no ciphertext repeat suppression. A broad version of the obstruction remains valid if the historical plaintext-F bypass is combined with collision-only key redraw, with either physical or consuming ciphertext predecessor. This matters for the [same-instance generator inverses](lp2-shared-rng-rejection-original-gate.md).

Let N=12956, cap=458, fixed native plaintext contain f literal Fs, m=N−f ordinary non-F symbols, X ordinary encrypted F outputs. Then total F count is f+X. Consider an ordinary position *good* if the relevant previous ciphertext is not F (including the initial empty predecessor). On any such predictably chosen position the first trial has probability at least q of emitting F, and that trial cannot be a collision, so must be accepted. This only needs each first key draw to be independent of the already generated history and to give every GP29 shift probability at least q; suppression can be any history-dependent rule that only changes a first-trial collision. No restriction on rejection count, constant threshold, coin call order, or clustering of the plaintext Fs is needed. In the ideal iid raw-word model this includes same-instance independent disjoint draws from a uniform stream, q=1/29 for uniform keys or q=floor(2^32/29)/2^32 for uint32 modulo reduction.

On the event f+X≤cap, at most cap ordinary positions can have previous **physical** ciphertext F (each such predecessor is a distinct output F). Thus at least L=N−f−cap ordinary positions are good. With the **consuming** predecessor, literal holds do not update it; at most X consuming positions have consuming predecessor F, hence at least L=N−cap are good. Extract the first L predictable good positions, extending with independent dummy Bernoulli(q) trials if fewer exist (the target event requires that L actually exist). Their F-success count stochastically dominates Binomial(L,q): by conditioning on each past and coupling its success to an independent uniform, every conditional success probability is at least q. On the target event these successes are at most cap−f. Therefore

- physical predecessor: Pr(C_F≤cap) ≤ BinomCDF(cap−f; N−f−cap,q);
- consuming predecessor: Pr(C_F≤cap) ≤ BinomCDF(cap−f; N−cap,q).

If f>cap the event is impossible. Both bounds decrease as f increases (physical: delete one Bernoulli trial while lowering permitted successes by one; consuming: fixed trial count). Use the preceding independently computed native-window minimum f=203 for all 562060 fixed source windows, with no assumption about F placements. Exact binomial tails computed using SciPy `binom.cdf`:

| Predecessor | n | max successes | q=1/29 bound, any one window | Union over all 562060 windows |
|---|---:|---:|---:|---:|
| Physical | 12295 | 255 | 1.548211311892359e−19 | 8.701876499622193e−14 |
| Consuming | 12498 | 255 | 8.287444761788944e−21 | 4.658041202811094e−15 |

For uint32 modulo29 use the lower shift probability q=0.03448275849223137; corresponding union bounds 8.701882220190657e−14 and 4.658044389816661e−15. Under the physical-predecessor uniform model, even this conservative bound permits a 5% lower tail only if f≤62 (0.48% of runes); consuming predecessor requires f≤60. No native reference window is that F-poor. These are probabilistic bounds over independent uniform key trials, not an all-key deterministic exclusion of an adversarially selected seed, a proof about arbitrary PRNG state distributions, or an assertion that LP2 prose is a particular corpus window. Collision suppression alone cannot explain the original flat F count while preserving the historical plaintext-F bypass and uniform independent key trials. Prioritize ordinary no-hold or explicitly source-motivated nonuniform key mechanisms rather than adding more speculative F-hold timestamp domains.

Reproduce with Python SciPy: `binom.cdf(255,12295,1/29)`, `binom.cdf(255,12498,1/29)`, multiply each by 562060; replace q as above for uint32. The proof is independent of a particular finite seed search.
