# Source-motivated 242-state affine-difference original-cipher gate

**22 November 2026, Agent32; intermediate negative result.** On the complete original p9–p55 rune stream, a genuinely source-motivated global 242-state clock fails a new independent held-out GP29 inverse test, even after allowing **all 812 affine inverse keys for each of the 242 states**. This experiment **does not recover any unknown plaintext**, establish the historical cipher, or prove that every possible secret 242-state language/transducer is impossible. It materially disfavors this specific simple, reversible architecture; a native-GP positive control succeeds.

## Source-selected motivation and exact reversible family

Original p7's five final red words have GP29 ordinal products modulo29 **[11,26,8,15,2]** and residues modulo3 **[2,2,2,0,2]**, supplying a primitive period-242 nonzero GF(3)^5 orbit. Independently the 255 original p8 runes contain 12 red plus 243 black, of which **242 black runes are entirely inside p8**; the 243rd black rune crosses into the first p9 printed word. The original 242-rune register is source data, with no need to invent a pad or a page-fragment splice.

These facts motivate a *candidate* rune-difference clock. For every original p9–p55 rune, retain the exact previous original ciphertext symbol across words and pages, and define a 242-position register phase from the p9 starting rune, globally continuous. In GP29 arithmetic,

```text
C_i = C_(i-1) + A[s] * (P_i - B[s])     (mod 29)
P_i = B[s] + A[s]^-1 * (C_i - C_(i-1))  (mod 29)
s   = (global_index - original_p9_start) mod 242
A[s] ∈ {1,...,28}; B[s] ∈ {0,...,28}.
```

Here **B[s] can be any GP29 symbol**, so the rare repeated-cipher symbol at that state does **not** force a single fixed plaintext rune. This is distinct from previously rejected constant-marker multiplication. Both parameters are allowed to be *entirely unknown for every state*: **28×29=812 independently secret key pairs per phase**. The original p8 register supplies one positive-control key law, `A[s]=1+(p8_black[s] mod28)` and `B[s]=p8_black[s]`, but that law is not assumed to be authentic.

Exact forward replay is enforced for every original rune and positive-control rune; it is merely a decoder correctness invariant since every key in this bijective family can round-trip its own output.

## Actual original and independent positive control

Input: canonical original `resources/liber-primus/lp2-corpus.json` (no synthetic changes to the unknown original), physical p9 starts at **global rune2129**, p30 at **7307**, and p55 ends at **12956**. Train on original p9–p29 (**5,178 consecutive runes**), then freeze every state key before inspecting p30–p55 (**5,649 consecutive untouched runes**). For each of 242 phases, enumerate all 812 possible affine inverses and maximize the **unigram log likelihood** on training positions only. Unigram probabilities use independently native-GP-encoded **Shakespeare first300k, 217,106 GP runes**, with Laplace-one smoothing and attested Cicada GP spellings.

| Measure | Unknown original p9–p55 | Complete Gibran positive plant |
|---|---:|---:|
| Training mean log likelihood / rune | −3.191431 | −2.955872 |
| Heldout mean log likelihood / rune | **−4.151463** | **−3.172336** |
| Heldout GP29 index of coincidence | **0.034484** | **0.052750** |
| Heldout five commonest GP rune share | **0.188529** | **0.376173** |
| Correct holdout phase rank among all242 cyclic shifts | **12/242** | **1/242** |
| Holdout phase score relative to other 241 shifts | +1.563 SD | +27.458 SD |
| Exact source 242-state key pairs recovered | Unavailable | **182/242** |

The positive uses an **independently source-native-encoded Gibran passage** of the original 10,827-rune test span, encrypted under the authentic p8 *data-derived* 242-per-phase A/B parameters with an original-length continuous chain. Its plaintext is held out from the Shakespeare language calibration. The same training, key-optimization, frozen phase, and forward-replay code is applied without model changes. Its raw heldout native-GP log score under that Shakespeare language model is **−2.955498**.

The original withheld region remains nearly uniform, has no original long readable prose under the inferred key, and its phase-alignment advantage is weak relative to its phase controls. The positive plant instead recovers most of its independent key and remains in the native-language register on withheld data.

For additional source-**fixed** direct A/B interpretations from the original 242 black p8 runes and GF3-state addresses, six direct literal receivers were evaluated on p9 first220, p13 first200, and p40 first220. Every segment had GP29 IoC between **0.03250 and 0.03653**, without prose; they are auxiliary diagnostics, not broad claims about every possible source operation.

## Decision and remaining alternatives

This is a negative **empirical original-input key-recovery decision** for the globally continuing, phase-stationary, affine GP29 `C_i-C_previous` cipher, allowing an unknown per-phase zero-step letter. It does not subsume original source **page-local resets**, changing state beyond the 242 position clock, an intermediate byte or phonemic register, altered plaintext spacing, or a non-affine transition. The literal original rule for using the p8 242 tokens remains unidentified. Do not resume an arbitrary larger pad hunt on this same GF3 coincidence absent an independently authored operation.

**Reproduction:** [Windows 11/Node22 CommonJS SFT](../sims/lp2_p7_242_affine_delta_heldout_original_sft.cjs), using existing canonical repository resources and controls. The script logs both complete-model original and positive-control measurements and checks all phases' exact forward replay.
