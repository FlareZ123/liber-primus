# Original p15 four-rune chaining: exact inverse and key-independent output-CBC gate

**13 November 2026, Agent 1. Classification: bounded original-cipher exclusion; no recovered plaintext or key.**

The original physical LP2 p15 prints a **4×4** Fibonacci-prime numeral square. The seven immediately following original pages **p16–22** contain **[267, 273, 260, 271, 269, 273, 131] = 1,744 runes**, an exact multiple of four. A 4×4 GF(29) Hill cipher operating on consecutive four-rune blocks with ciphertext-block feedback is therefore a concrete human-executable candidate, though neither the word "Hill" nor a feedback rule is printed. Unlike a stationary 4-rune substitution, chaining can conceal repeated plaintext blocks.

This study tests that alternative against **untouched, original p16–22 ciphertext**. It makes no key inference from candidate plaintext and does not extend the trial to fitted phases, page permutations, or alternative matrices. The already established [stationary four-block source gate](lp2-p15-fourblock-allsecret-collision-gate.md) does **not** cover the feedback families studied here.

## Source-locked two-law trial

Reduce the four original printed decimal rows modulo 29 to obtain the invertible matrix

```text
10   3  20  22
 1  22  21  25
11  17  19   7
21  17  12  22
```

Its exact inverse is

```text
19   1   6   3
11   7   8  22
 2  10  15  28
25   4   1  15
```

Let `P_b` and `C_b` be four-rune vectors, with all coordinates in GF(29), and let `M` be the printed matrix. Two elementary ciphertext-feedback systems are:

1. **Input feedback:** `C_b = M(P_b + C_(b−1))`, hence `P_b = M⁻¹ C_b − C_(b−1)`.
2. **Output feedback:** `C_b = M P_b + C_(b−1)`, hence `P_b = M⁻¹(C_b − C_(b−1))`.

The fixed source alternatives are `M`, `Mᵀ`, `M⁻¹`, and `(Mᵀ)⁻¹` as the forward matrix, crossed with the two laws and two observable initial states: all-zero four-rune vector, or the original final four runes of p15 **[17, 3, 28, 13]**. This specifies **16** complete 1,744-rune inversions.

**Result:** all 16 direct original-input inverse streams remain near the flat 29-symbol baseline. Their rune collision IoCs range from **0.0342391848** to **0.0346826362**; original p16–22 ciphertext has **0.0345095980**, and an independently sourced Shakespeare-native GP29 plaintext plant has **0.0631477417**. Every direct candidate is below a conservatively predeclared **0.045** prose-screening threshold. Both cipher laws, all matrices, both IVs, and the complete original ciphertext re-encrypt exactly; all 16 source-native 1,744-rune synthetic plaintext plants recover exactly. Such round trips validate the implementation, **not** the historical key choice. The bounded direct grid-key inversions yield no readable p16–22 plaintext.

## Stronger key-independent exclusion for the output-feedback law

For **output feedback**, grant an *arbitrary secret, fixed bijection* `F` of the entire (29^4)-element four-rune alphabet, rather than any specific Hill matrix:

[
C_b=F(P_b)+C_{b-1}pmod{29}.
]

The solver can subtract each directly observable preceding ciphertext block:

[
D_b=C_b-C_{b-1}=F(P_b).
]

Because `F` is injective, **two difference blocks `D_b` are equal if and only if their original four-rune plaintext blocks `P_b` are equal**. The equality count is therefore fully independent of the unknown key and of its actual bijection table.

The **436** p16–22 original difference blocks contain **zero equal unordered four-block pairs** with either source-visible IV. More strongly, dropping block 1 leaves **435 mutually distinct original difference blocks**. This last observation is independent of **any completely unknown IV**: changing the IV can change only the first difference block, which can add **at most one** equal pair to the total.

The independent, checked-in GP29 English controls use the authentic solved-LP1 GP orthography, including single-rune ING and IO where appropriate. For each control, test complete **1,744-rune disjoint windows** under the identical four-block register, with no selected ciphertext key:

| Native GP29 control | Disjoint windows | Minimum equal four-block pairs | Minimum after removing first block |
| --- | ---: | ---: | ---: |
| Shakespeare | 124 | **10** | **10** |
| Gibran, *The Prophet* | 35 | **26** | **25** |
| Emerson essays | 184 | **11** | **11** |
| **Original p16–22 differences** | 1 | **0** | **0** |

Every one of the **343** finite English-reference windows retains at least **10** equal four-block pairs even after dropping its first block. The original differences have zero such pairs; with *any* IV their maximum count is one. Thus no **chapter-stationary bijective four-rune output-feedback map**, with any secret key and any initial state, can map any one of these exact native-English reference windows to the unchanged original p16–22 ciphertext. This exclusion does not assume the p15 matrix is the actual key.

This is a bounded source-native-English comparison. It does not establish an impossibility result against all conceivable plaintext languages, unusual register encodings, per-page rekeys, a changing `F`, a transposition stage, or unknown nonlinear *input-feedback* mechanisms. In particular the key-independent difference-block invariant **does not apply** to the input-feedback law, for which only the 16 directly source-matrix-keyed variants above have been excluded.

## Reproduction and next decision

[Original-source CommonJS SFT](../sims/lp2_p15_cbc4_difference_sft.cjs) reads the pinned GP29 corpus and the three previously committed independent English controls, asserts all 16 original/plant full inverses, and checks the complete key-independent difference-block statistics. The file contains every source matrix entry and comparison bound.

**Decision:** retire both directly printed p15-matrix CBC conventions on the following 1,744 runes. Retire the much wider **fixed-bijection output-feedback** family for the checked native-English source register, even if its secret key and IV are arbitrary. A new route would need independent original evidence specifying a changing cipher state, a different transport, or an authentic decoder/key. No unknown LP2 plaintext, key or final destination has been recovered.
