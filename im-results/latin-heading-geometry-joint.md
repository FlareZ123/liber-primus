# LP2 red heading: exact proposed Latin inverse with a coupled geometric key chain

**Agent 24, 10 November 2026. Classification: new deterministic coupling hypothesis and complete original-source conditional calibration of an independently published plaintext guess. Not an authenticated LP2 decryption.**

The first two plaintext guesses, their keys and the underlying first-729-rune geometry originated in [an external 27×27-route proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/red-heading-SEQUENDI-RATIO.md). We independently reconstructed the literal original-input inverse, identified a **new simple coupling from the first source key into the second**, and calibrated its complete two-word key production against **1,000,000** inventory-preserving null squares. The coupler is *hypothesized after inspecting the proposed source key* and receives no independent-authentication status from its rare null score.

## Proposed plaintext and exact original-input inverse

The first physical LP2 page starts with two red words of **8 and 5 original rune cells**. The first 13 ciphertext indices in the original Gematria Primus order are:

```text
First eight: [15,8,18,3,6,19,27,0]     read right-to-left
Last five:   [15,26,18,21,5]           read left-to-right
```

Applying mod-29 subtraction with repeated four-rune key `[14,9,14,5]` to the **reversed first eight**, and with repeated three-rune key `[11,2,2]` to the **forward second five**, returns original-register GP sequences:

```text
[15,18,5,1,18,9,23,10] → SECUENDI
[4,24,16,10,3]         → RATIO
```

The GP `C/K` rune of index 5 in `SECUENDI` is read as Latin Q, yielding the conjectural **SEQUENDI RATIO**, approximately *method of following*. Both inferred GP plaintext strings **re-encipher to all 13 original ciphertext indices exactly** under those two keys, with original directions and word-boundary reset preserved. The Latin reading was chosen in the independent earlier proposal, so this by itself only confirms its arithmetic.

Build the 27×27 key square from precisely the **729 consecutive original runes on LP2 physical pages 0, 1 and 2** with page lengths `[262,266,201]`. The opening root is the external route's `J=11` at one-based **(13,12)**. GP values here are **rune indices**, not assigned prime values.

## Exact original geometries and new coupled pointer rule

The selected four-rune key is the four corners of an axis-aligned rectangle in clockwise order from the upper left:

| Source corner | Cell | Original GP index |
|---|---|---:|
| NW | (6,3) | X = 14 |
| NE | (6,9) | N = 9 |
| SE | (24,9) | X = 14 |
| SW | (24,3) | C/K = **5** |

The NW and SE X corners have **equal squared Euclidean distances** from the opening root J at (13,12). Across every possible nondegenerate rectangle satisfying these values and the fixed-root equal-distance constraint, the original 729-rune matrix has **one** instance: this exact rectangle.

The formerly independently selected three-rune key source is `J(13,12)–R(18,17)–TH(23,22)` with original indices `[11,4,2]`. Transform only its center by Euler's totient, **φ(4)=2**, to get `[11,2,2]`. Of every rooted equally spaced three-rune line across eight directions and radius1–13, the original square also has exactly **one** literal J–R–TH match.

**New, simpler source-derived coupling conjecture:** Treat the final (SW) rune index of the four-corner key as the movement step `s=5`. Use the **NW→SE orientation of the rectangle's two equal X corners** to choose the southeast direction. Starting at the external J root, take exactly one and two steps of that size along the southeast grid diagonal:

```text
step = last_rune_index(K4) = 5
center = (13+step, 12+step)   = (18,17) = R, index4
last   = (13+2*step,12+2*step) = (23,22) = TH, index2
K3     = [index(J), phi(index(center)), index(last)]
       = [11,2,2]
```

The second key is therefore recoverable **directly from the first rectangle and opening root** without independently searching for J–R–TH triples. With this *now frozen* explicit rule, the second red word decrypts to RATIO, and both proposed words reverse exactly. The link is conspicuous but postselected: the external route did **not** derive this two-stage key chain in advance, no manuscript instruction establishes `s=last key symbol`, and the rectangle direction and fixed root were also chosen retrospectively.

## Matched complete key-chain randomization

Fix the **first 13 original red ciphertext rune cells** and the published J root at (13,12). Uniformly permute by seeded Fisher–Yates the remaining **715** source cells, preserving the complete 729-rune multiset and source heading values. For each shuffled 27×27 square, independently enumerate every matching equidistant-root X–N–X–C rectangle. For the original earlier *uncoupled* model, also scan all rooted J–R–TH straight lines across eight directions and radii1–13. For the **new coupled model**, derive each candidate second key by the rectangle's southwest source rune step, take the southeast axis and apply the center totient, then ask whether the complete source-generated key is **[11,2,2]**. Accept the center's original index as any of **3, 4, or 6**, since all three have totient2. This correctly tests the **derived key**, rather than requiring the previously selected raw center letter R.

A fixed 32-bit xorshift32 seed **0x24131329**, 1,000,000 independent pseudorandom shuffles and the same complete model-selection family for every null produced:

| Frozen source property | Original square | Randomized squares passing /1,000,000 | Add-one empirical upper tail |
|---|---:|---:|---:|
| Any matching X–N–X–C rectangle | 1 | **1,731** | **1732/1000001 ≈ 0.001731998** |
| Any J–R–TH straight source | 1 | **59,557** | **59558/1000001 ≈ 0.059557940** |
| **Both independently sourced structures** | yes | **116** | **117/1000001 ≈ 0.0001169999** |
| **One first-key rectangle generates second key through the coupled step rule** | yes | **9** | **10/1000001 ≈ 0.00000999999** |

The selection of the already-proposed Latin plaintext, specific rectangle labels, source root, equal-distance test, last-rune step rule and southeast direction used **the same original square**. As a result the conditional rarity, including the 9/1,000,000 coupled observations, is **not a discovery-wide significance level or probability that this is Cicada's actual cipher**. The null preserves source-symbol inventories while destroying page words, line spacing and adjacent rune relationships; results do not generalize automatically to other input distributions. The 32-bit PRNG and modulo choice are fully specified for reproduction, not a mathematically exact uniform random permutation sampler.

**Reproducibility:** [original-source CommonJS script](../sims/latin_heading_geometry_joint_null.cjs) with run argument `1000000`, containing all GP inputs, both forward/inverse tests, exact location assertions and full model-family null; [manual Windows Node 22 workflow](../.github/workflows/latin-heading-geometry-joint.yml); [successful completed 1,000,000-shuffle CI run 42809328896](https://github.com/FlareZ123/liber-primus/actions/runs/42809328896). The earlier [100,000-shuffle run 42808098193](https://github.com/FlareZ123/liber-primus/actions/runs/42808098193) independently confirms the initial uncoupled calculation at an older commit.

## Cryptanalytic consequence and decisive remaining experiment

This identifies a **compact two-stage, source-derived candidate decoder for the entire first 13-rune red heading**, in which one geometric key generates the next. It remains a *postselected fit*, however, and does **not** disclose an authenticated plaintext, a general page key, or a continuation cipher. Specifically, neither the first X–N–X–C rectangle nor the J root is selected by an original unambiguous manuscript instruction independent of the target words. The proposed Latin phrase was already available before the source geometry was searched.

A credible breakthrough would require that this now-frozen coupling **predict another previously uninterpreted original LP2 span** and its source keys, recover readable GP plaintext and reproduce the ciphertext exactly without choosing source geometry or vocabulary after seeing that span. Until such a holdout works, preserve this report in `im-results/`, with no promotion to the authoritative `results/` solved-plaintext index.
