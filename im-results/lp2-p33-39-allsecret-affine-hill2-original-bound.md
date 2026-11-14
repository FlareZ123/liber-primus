# Exact all-secret affine Hill2 exclusion on the 840-pair p33–39 chapter

**Status: original-source Windows/Node22 CI passed 14 November 2026. The strongest result is an exact key-independent 841-state *pair-collision invariant* excluding every single stationary reversible substitution of whole rune pairs on the visual seven-page chapter under the tested source-native English registers.** Separate algebraic bounds exclude every secret stationary affine Hill2 decoder, and all reversible GF841 group-power maps followed by such a decoder. No unknown plaintext, authentic key, creator instruction or final destination is recovered.

## Distinct hypothesis and human cue

Original physical LP2 pp33–39 form one source-visible visual chapter with exactly **1,680 GP runes = 840 consecutive pairs**. The original red p3 quadratic defines a representation of **GF(29²)** with `u²=3u+8`; previous work showed the p50/p39/p3 quotient yields a primitive element of multiplicative order **840**. That is a concrete reason to ask whether the original chapter is paired and linearly mixed in GF29². The obvious **static field-affine** model is one nonzero field multiplier and one field offset, reused throughout this chapter. A more generous competitor is **any one stationary invertible two-rune affine Hill2 key**, with arbitrary secret 2×2 mixing and offset across the same 840 pairs.

The original source does **not** instruct readers to use either model. The 840-pair shape is a plausible consumer, and checking the full all-secret family is a bounded decision. This analysis is distinct from the prior [840-position field-power inverse, feedback and Fourier gates](lp2-p33-39-gf841-full-pair-multiplier-gate.md), which operate with evolving state or whole-block transforms and do not yield the all-key static-Hill2 bound below.

## Strongest result: any fixed 841-state reversible pair substitution

The **840 original consecutive ciphertext pairs** on physical pp33–39 have **only 518 distinct pairs** and exactly **461 unordered repeated-pair position collisions**. More precisely, if `f(x)` is the count of the field-pair symbol `x∈{0,…,840}`, the invariant is `Q=Σ_x f(x)(f(x)−1)/2=461`. The most frequent field pair appears **six times**; 218 distinct pairs appear at least twice. The phase-one sensitivity read, cyclically shifting by one rune before pairing, has **530 unique pairs and Q=417**, similarly near the random-pair expectation of **419.0** for 840 independent uniform 841-way draws.

Every invertible fixed substitution `π` on the entire 841-state pair alphabet, **including an otherwise unrestricted secret table**, satisfies `C_i=C_j ⇔ π(C_i)=π(C_j)` for each pair of positions. Therefore its `Q` is identical to the original *for every key*, regardless of affine structure, field polynomial, unknown alphabet permutation or computational complexity. The number of candidate secret maps is **841!**, but the invariant requires no key search or approximation.

Independent source-native GP English reference texts were encoded using the exact historically calibrated `ING`/ `IO` spelling register. Each contiguous **1,680-rune** control window is paired in source order, with windows stepped by the fixed stride **211**. None approaches the original collision count:

| Source-native GP register | Control windows | Minimum pair-collision Q | First window Q |
| --- | ---: | ---: | ---: |
| **Original unknown physical pp33–39** | 1 | **461** | 461 |
| Shakespeare reference | **1,021** | **1,687** | 2,301 |
| Gibran reference | **289** | **2,025** | 2,225 |
| Emerson reference | **1,515** | **1,784** | 2,170 |

This is an **exact zero-match result against 2,825 partially overlapping fixed-register windows**, with all original printed GP runes unchanged. These controls are not random independent trials, do not establish a p-value for all possible human languages, and cannot rule out a deliberately balanced/contrived plaintext.

**Secret-key positive control:** a fixed, genuinely bijective 841-state permutation `π(s)=(137s+251) mod 841` is applied independently to all 840 source-native plaintext pair values and inverted. The heldout GP plaintext is recovered exactly **1,680/1,680**, while its pair equality counts are provably unchanged by encryption. The same positive runs pass separately on Shakespeare, Gibran and Emerson in the [verified source-native SFT and Windows CI 43638637906](https://github.com/FlareZ123/liber-primus/actions/runs/43638637906).

**Architecture consequence:** The original p33–39 ciphertext cannot be a single ordinary-English GP29 passage passed through **one stationary, reversible whole-pair alphabet substitution** with the original 840-pair framing, even under a completely secret `841!`-size mapping family. The independently tested affine and reversible-power constructions below are mathematically **subfamilies** of this stronger static-substitution gate. Their separate algebraic upper bounds are retained as reusable diagnostics for alternate registers and source-selected compositions. This result does not exclude **changing substitution by pair position**, **independent per-page keys**, alternate segmentation, a probabilistic/homophonic encoding, an intermediate nonlinguistic register, or unknown plaintext with extraordinary pair statistics.

## Exact algebra over every secret key

Preserve the original source order with pairs `(C[2i],C[2i+1])`, `i=0..839`, including pairs straddling original page boundaries. Consider **every** invertible GF29 affine transformation:

```text
[P_2i, P_2i+1]^T = M [C_2i, C_2i+1]^T + b    (mod 29)
M in GL(2,29), b in GF29^2, one M and b shared by all 840 pairs.
```

Each plaintext coefficient is a **nonzero linear projection** of an original ciphertext pair, plus a constant shift. Enumerate every one of the **840 nonzero projection rows** `(a,b)` over GF29. Let `h_(a,b)[v]` be the 29-bin histogram of `a*C_2i+b*C_2i+1`, and `Qmax = max_(a,b) sum_v h_(a,b)[v]²`. Shifting a row by any additive constant merely rotates its histogram. By the Euclidean triangle inequality and Cauchy–Schwarz, combining the two output-coordinate histograms for any allowed matrix and offset gives

```text
sum_v totalPlainHistogram[v]^2 <= 4 Qmax
IoC(P) <= (4 Qmax - 1680)/(1680 * 1679).
```

This derivation grants **any two nonzero rows, even linearly dependent ones**, before imposing invertibility. Therefore it is an honest upper bound on *every* secret `M,b` with no ciphertext optimization assumptions, and no training English is used to choose `M`.

The original corpus has page counts **[214,261,271,238,228,228,240]**, totaling 1,680 original runes. Across all 840 projections, squared-histogram sums have minimum **24,852** and maximum **25,732**, attained by row **(1,28)**. The resulting **exact** original-source upper bound is:

```text
IoC(any stationary invertible affine Hill2 output) <= 0.03589438157633512
```

For a sensitivity check only, cyclically rotate the original intact 1,680-rune stream by one rune before pairing. Its all-secret bound is **0.03607589551603846** (`Qmax=25,860`). This alternative is *not* a source-selected operation, and no segmentation alteration or padding is claimed.

### Complete 840-element GF(29²) affine subgroup

A multiplier `a+b*u` with `u²=3u+8` acts on each pair by matrix `[[a,8b],[b,a+3b]]`. Enumerate **all 840 nonzero multipliers** and **all 29 relative output shifts** (the remaining 29 global shifts preserve IoC exactly). This covers all **706,440** affine field keys and yields the exact best original GP29 IoC **0.03504140786749482** at nonzero multiplier `1+18u` and relative histogram shift16. Every other multiplier and translation is bounded by that value. The complete field-affine family therefore has an even lower maximum than the general Hill2 theorem. **No candidate has ordinary native-GP unigram concentration.**

| 1,680-rune source / model | GP29 IoC |
| --- | ---: |
| Untouched original pp33–39 ciphertext | **0.03436002155478034** |
| Best of all 706,440 stationary GF841 affine decoders | **0.03504140786749482** |
| Mathematical upper bound for **every** stationary affine Hill2 decoder | **0.03589438157633512** |
| GP-native Shakespeare first 1,680 runes | **0.06292365069911228** |
| GP-native Gibran first 1,680 runes | **0.05954082645565671** |

The English controls are source-native GP orthography, including the authenticated `ING` and `IO` rune spellings; they are **illustrative finite text registers**, rather than universal lower bounds for every possible English message. A contrived low-frequency plaintext or an intermediate nonlinguistic register can fall below this ceiling.

## Unknown-secret positive controls and actual Windows result

To verify that the exact necessary bound would preserve an English signal through a genuinely secret affine Hill2 cipher, the SFT independently encrypts *each* 1,680-rune English control under the invertible key `M=[[7,9],[11,13]], b=[17,24]`, then decrypts exactly **1,680/1,680** original GP symbols. This key reduces the planted Shakespeare ciphertext IoC to **0.03570436** and the planted Gibran ciphertext IoC to **0.03683953**, close to the unknown source. Yet the all-secret calculation on those two **encrypted controls** correctly gives upper bounds **0.06592927** and **0.06030801**, both above their genuine plaintext IoCs. Thus an actually suitable hidden key would not be excluded by this method merely because its ciphertext looks uniform.

The original's **0.03589438 upper bound**, far below both control native plaintext IoCs, is therefore a genuine **all-keys impossibility relative to this finite source-language target**, not a failure to find the right key in a heuristic search. The test does not assume the encryption direction; the inverse of any invertible affine matrix is another member of the exact same family.

**Reproduction:** [standalone Windows/Node22 CJS SFT](../sims/lp2_p33_39_allsecret_affine_hill2_original_sft.cjs), with [successful original-source workflow run 43637390671](https://github.com/FlareZ123/liber-primus/actions/runs/43637390671) and an opt-in [manual workflow](../.github/workflows/agent8-original-affine-hill2-source-manual.yml). The run logs print all `Qmax`, key-class, cipher/plaintext control values and exact recovered lengths.

## Nonlinear extension: all 192 group-power exponents × all stationary Hill2 keys

The source corpus independently motivates **two quadratic field representations** of the 29-symbol pair alphabet, with unit groups of size **840**:

1. Original red p3 polynomial: `u² = 3u+8`, with source-derived primitive generator `19+13u`.
2. Historical signed 2013 `BASE29 3301→3QO` polynomial: `u² = 11u+18`, for which `u` is primitive.

The full original p33–39 chapter contains exactly **840 successive field elements** under either mapping. An additional **complete nonlinear family** is to take an unknown group-power permutation `Z_i=C_i^e`, where `gcd(e,840)=1`, and then apply an arbitrary unknown stationary invertible affine Hill2 matrix and offset to each powered pair. The power map is bijective, including zero fixed at zero, and its 192 possible exponents cover **all reversible group powers**. The earlier projection theorem now applies after each power transformation and completely bounds the unconstrained final affine layer. No individual matrix, offset, dictionary word, or key is guessed.

For every one of the 192 powers, independently compute `Qmax(e)` over **all 840** nonzero pair projections after powering, then take the largest complete-class IoC bound. These are exact maxima of the **mathematical upper bounds** across powers, rather than maxima of the unenumerated actual Hill2 key scores:

| Source-defined GF841 basis | Reversible exponents | Largest Qmax over all powers | Exponent attaining it | Upper bound for every subsequent secret affine Hill2 decoder |
| --- | ---: | ---: | ---: | ---: |
| p3, `u²=3u+8` | **192/192** | **26,474** | **109**, also 641 | **0.036946595195552906** |
| 2013 BASE29, `u²=11u+18` | **192/192** | **26,410** | **193**, also 557 | **0.03685583822570124** |

The best GP29 IoC of a **power alone**, even selecting its exponent after inspecting the original ciphertext, is **0.03498752** in the p3 basis and **0.03494994** in the BASE29 basis. The stronger all-affine postbound stays below **0.037** in both bases. The minimum bound across the power families is **0.03564196** and **0.03570436**, respectively. These calculations exhaust **384 source-field/exponent cases**, each with an analytic upper bound valid for **all 573,629,280** invertible affine Hill2 transformations (the number of `GL(2,29)` matrices times 29² offsets). Thus the explored family contains **220,273,643,520** potential two-layer keys, with no brute-force trial over the secret affine key.

A positive test avoids the pitfall that a genuine secret power key might also make ciphertext look random. Independently encrypt Shakespeare and Gibran source-native 1,680-rune plaintext controls under **fully secret invertible Hill2** matrix `[[7,9],[11,13]]` with vector `[17,24]`, and a reversible secret field exponent (**109** or **193** depending on source basis). Both four controlled ciphertexts have IoC **0.03592–0.03799** and yet decrypt exactly **1,680/1,680**. Their field-powered all-secret upper bounds correctly admit native GP English at **0.06592927** and **0.06030801**.

The combined all-secret exponent/post-affine result passed [Windows/Node22 source-original CI run 43638066737](https://github.com/FlareZ123/liber-primus/actions/runs/43638066737) using the same [revised SFT](../sims/lp2_p33_39_allsecret_affine_hill2_original_sft.cjs). The earlier [run 43637390671](https://github.com/FlareZ123/liber-primus/actions/runs/43637390671) remains the independent initial direct-affine reproduction.

**Decision:** The chapter does not encode ordinary GP-native English using a *single reversible GF841 field-power map followed by a single stationary affine two-rune map*, even granting completely unconstrained secret exponents, matrices, and offsets in both original-source field bases. This excludes a large, mathematically clean two-layer family at negligible compute cost without searching vocabulary or fitting hidden keys. The actual historical maker may have used evolving state, source-selected non-power nonlinear mappings, an intermediate alphabet, per-page resets or other untested mechanisms.

## Cryptanalytic decision

**Retire every stationary reversible whole-pair substitution on the entire pp33–39 chapter as a direct route to ordinary GP-native English in the tested finite registers.** This includes affine GF841, unrestricted affine Hill2, and any reversible GF841 power plus static affine post-decoder. The all-secret 841-state collision invariant is stronger than those individual subfamily exclusions. The key-invariant output ceiling remains too low even if the secret matrix and offsets are selected adversarially after seeing the original ciphertext. This test neither excludes keys restarting at each physical page/word, pairwise state feedback, nonlinear permutations, variable-length transports, unknown non-English/plaintext packaging, nor a nontrivial key schedule. It is an input-shape-specific architecture decision. Further work requires a creator-selected mechanism explaining the original ciphertext's near-uniformity and near-absence of doublets *while* carrying an independently recoverable native message.
