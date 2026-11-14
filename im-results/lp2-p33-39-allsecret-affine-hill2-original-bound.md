# Exact all-secret affine Hill2 exclusion on the 840-pair p33–39 chapter

**Status: passed original-source Windows/Node22 test on 14 November 2026.** This is a finite, key-independent obstruction to a **stationary two-rune affine GP29 decoder** on the seven-page chapter. It recovers **no unknown plaintext, authentic key, creator instruction or final destination**. The family is considerably broader than the previously tested source-fixed GF841 running-power keys; it includes **every** invertible 2×2 GF29 matrix and every additive pair offset, without sampling or recovering the secret key.

## Distinct hypothesis and human cue

Original physical LP2 pp33–39 form one source-visible visual chapter with exactly **1,680 GP runes = 840 consecutive pairs**. The original red p3 quadratic defines a representation of **GF(29²)** with `u²=3u+8`; previous work showed the p50/p39/p3 quotient yields a primitive element of multiplicative order **840**. That is a concrete reason to ask whether the original chapter is paired and linearly mixed in GF29². The obvious **static field-affine** model is one nonzero field multiplier and one field offset, reused throughout this chapter. A more generous competitor is **any one stationary invertible two-rune affine Hill2 key**, with arbitrary secret 2×2 mixing and offset across the same 840 pairs.

The original source does **not** instruct readers to use either model. The 840-pair shape is a plausible consumer, and checking the full all-secret family is a bounded decision. This analysis is distinct from the prior [840-position field-power inverse, feedback and Fourier gates](lp2-p33-39-gf841-full-pair-multiplier-gate.md), which operate with evolving state or whole-block transforms and do not yield the all-key static-Hill2 bound below.

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

## Cryptanalytic decision

**Retire stationary affine GF841 and unrestricted stationary affine Hill2 per-pair keys on the entire pp33–39 chapter as routes to ordinary GP-native English.** The key-invariant output ceiling remains too low even if the secret matrix and offsets are selected adversarially after seeing the original ciphertext. This test neither excludes keys restarting at each physical page/word, pairwise state feedback, nonlinear permutations, variable-length transports, unknown non-English/plaintext packaging, nor a nontrivial key schedule. It is an input-shape-specific architecture decision. Further work requires a creator-selected mechanism explaining the original ciphertext's near-uniformity and near-absence of doublets *while* carrying an independently recoverable native message.
