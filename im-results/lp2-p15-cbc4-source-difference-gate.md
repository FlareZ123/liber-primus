# Original p15 four-rune chaining: complete Hill4 input/output feedback gates

**13 November 2026, Agent 1. Classification: bounded original-cipher exclusion; no recovered plaintext or key.**

The original physical LP2 p15 prints a **4×4** Fibonacci-prime numeral square. The seven immediately following original pages **p16–22** contain **[267, 273, 260, 271, 269, 273, 131] = 1,744 runes**, an exact multiple of four. A 4×4 GF(29) Hill cipher operating on consecutive four-rune blocks with ciphertext-block feedback is therefore a concrete human-executable candidate, though neither the word "Hill" nor a feedback rule is printed. Unlike a stationary 4-rune substitution, chaining can conceal repeated plaintext blocks.

This study tests that alternative against **untouched, original p16–22 ciphertext**. It makes no key inference from candidate plaintext and does not extend the trial to fitted phases, page permutations, or alternative matrices. Both chained laws receive complete first-class unknown-key tests under a source-native English reference register. The already established [stationary four-block source gate](lp2-p15-fourblock-allsecret-collision-gate.md) does **not** cover the feedback families studied here.

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

This remains a bounded source-native-English comparison; the known writer may use a different language or register. The all-secret difference-block result concerns one chapter-stationary map and cannot exclude hidden varying-state or per-page operations.

## New exact all-key exclusion for the input-feedback law

The input-feedback family survives the difference-block argument above because its equation is different. However, granting an *unknown invertible GF(29) 4×4 matrix* yields a different exhaustive and key-independent necessary condition. Let **a** be the arbitrary first row of the unknown inverse matrix (M^{-1}). For every complete four-rune block after the IV-affected first block,

\[
P_{b,0}=a_0 C_{b,0}+a_1 C_{b,1}+a_2 C_{b,2}+a_3 C_{b,3}-C_{b-1,0}\pmod{29}.
\]

Any genuine input-CBC plaintext has this form for some **a**. Enumerating **all (29^4 = 707,281) vectors**, including zero and rows of singular matrices, grants more freedom than any invertible key permits and requires no guessed matrix. Drop the initial four-rune block completely so the test is valid under **every possible IV**. The source then leaves **435 first-coordinate plaintext candidates per key**. The observable GP rune coincidence index `IoC` of those 435 symbols is invariant under a constant alphabet relabeling, and a simple exact collision-count implementation can find its *global maximum* across all keys.

**Original result:** the unique maximizer is **a = [7, 0, 2, 4]**, with **7,408 ordered equal-rune pairs**, yielding **maximum IoC = 7,408/(435×434) = 0.03923936649**. That is the exact best obtainable after optimizing **every possible first inverse matrix row** on the original untouched p16–22 ciphertext, not a particular printed key.

The 343 independent English controls are supplemented by **27 corrected, source-native Old English Beowulf windows** and **one separately source-pinned Latin Vulgate GP heldout window**. These five controls span **371 disjoint 1,744-rune windows**. Their **minimum IoCs on the same 435 first-column positions** after discarding the first block are:

| Reference text | Disjoint 1,744-rune windows | Minimum ordered rune collisions | Minimum first-coordinate IoC |
| --- | ---: | ---: | ---: |
| Shakespeare | 124 | **9,752** | **0.05165527835** |
| Gibran, *The Prophet* | 35 | **10,142** | **0.05372106573** |
| Emerson essays | 184 | **10,210** | **0.05408125430** |
| Corrected Beowulf Old English GP | 27 | **9,822** | **0.05202606070** |
| Latin Vulgate heldout GP | 1 | **12,978** | **0.06874304783** |
| **Original, maximum over all 707,281 secret rows** | 1 | **7,408** | **0.03923936649** |

This is a clean source-reference exclusion under *any* secret GF(29) Hill4 key: every original inverse row is too flat to match **even one** of the 371 independent GP reference windows in this predeclared position register. The source-native controls are text excerpts, so this does **not** prove impossibility for every possible undiscovered language, every document genre, or an intermediate/compressed representation.

**Blind decoder-power positive control:** construct a source-native 1,744-rune Shakespeare plaintext, encrypt it under actual p15 `M` using **input CBC**, and search the same 707,281 row candidates without revealing the key to the scorer. The **unique highest-scoring row** is the true inverse row **[19, 1, 6, 3]**, with **11,354** ordered equal-rune pairs and **IoC 0.06014089729**. The planted plaintext reproduces the exact score. This is a genuine recoverability check for the key-family test, while no analogous original plaintext has emerged.

## Reproduction and next decision

The [original-source 16-inverse and all-bijection output-CBC SFT](../sims/lp2_p15_cbc4_difference_sft.cjs) runs direct printed-matrix inverses and the algebraic source-difference test. The distinct [exhaustive all-key input-CBC SFT](../sims/lp2_p15_cbc4_allkey_firstrow_sft.cjs) enumerates all 707,281 first inverse rows on the original 435-block stream and on the separately encrypted source-native positive plant, with exact integer score assertions. Both read the pinned GP29 original ciphertext and the three independent historical English controls; the latter SFT additionally uses a previously corrected 48,012-rune Beowulf GP reference and an independently pinned 2,400-rune Vulgate GP heldout sequence. No fitted phases, per-page clocks or freely estimated plaintext enter either experiment.

**Decision:** retire both literal p15-matrix CBC laws on p16–22. Under the five-source GP reference register, retire **every secret chapter-stationary GF(29) Hill4 input-CBC key and every secret bijective four-rune output-CBC map**, regardless of IV. Those are two materially different chained cipher architectures that stationary-block tests had not excluded. Other stateful, rekeyed, nonlinear, transposed, compressed or differently authored plaintext mechanisms survive. No unknown LP2 plaintext, authentic key or continuation destination has been recovered.
