# P32 blurred tree and the proposed four-child graph receiver

**21 November 2026, Agent10. Director #2097. Decision: the proposed p32 branch-to-four-key selector fails before ciphertext decryption. No original LP2 plaintext, authentic key, or cipher was recovered.**

## Independent original image read

Physical p32 is the original release scan [49.jpg](../resources/liber-primus/49.jpg), SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`. It shows **121 rune glyphs** over a large visibly blurred tree illustration. The source tree presents multiple blurred terminal twigs with no four numerals, marked cuts, ordered four leaves, or explicit branch labels.

The conditional p50 graph maps signed DIRECTION GP0=112 to original table cell112=73, while a specific largest-child-first inorder node map sends 73 to p32. Node73 has four graph children `[69,112,43,226]`, whose GP29 residue indices are `[11,25,14,23]`. The graph and its inorder page assignment remain **candidate interpretations**, so this visual test does not let those four numbers influence the tree segmentation.

## Frozen ciphertext-blind geometric test

Read only the original source JPEG pixels, using original-pixel tree ROI `(x750,y1900)–(x2000,y3200)`. Apply OpenCV Otsu binary inversion to its grayscale values, retain the largest connected dark region (the actual tree), and count its horizontal crossings at seven fixed relative heights measured between the detected tree's top and bottom. Ignore crossings narrower than eight original pixels to suppress isolated blur specks. The original Otsu cutoff is 192; the largest connected region has 235,550 pixels and source-pixel bounding box `(769,2249)–(1547,3131)`.

| Fixed height down the detected tree | Crossing count | Interpretation |
| ---: | ---: | --- |
| 20% | 3 | separate left, central and right limbs |
| 23% | **4** | a short-lived right-side blur splits into two components |
| 25% | 3 | those right-side components already merge |
| 30% | 3 | three broad crossing regions remain |
| 35% | 2 | lateral limbs merge into center |
| 50% | 2 | two broad crossing regions |
| 75% | 1 | trunk |

The **full original-coordinate crossing intervals and a read-only reproducer** are in [`sims/lp2_p32_tree_fourbranch_source_sft.py`](../sims/lp2_p32_tree_fourbranch_source_sft.py). The script also fixes the source SHA-256, crop, Otsu segmentation and output. Its executable reconstruction is the authoritative mask specification; it never reads any ciphertext or graph-child value. This diagnostic does not purport to count every tip or make botanical branch semantics objective; it tests whether **one stable, naturally ordered four-partition** is available for the claimed four-key rule.

The only transient exactly-four cut in this registered grid occurs at 23% height, and no original text marks 23% or indicates that these ephemeral components are the intended four branches. Choosing that height after noticing the four-child graph would introduce an unsourced parameter. Other handcrafted skeleton-pruning or visual groupings are similarly unconstrained. The image supports a tree illustration, **not** a uniquely sourced four-symbol cryptographic key.

## Research fork

The issue requires stopping at this source gate if the four ordered branches are not independently visible. Accordingly the post-gate additive `P=C±[11,25,14,23]` decoder was **not run**. The original p32's 121 runes remain undeciphered. The current p15 upper-red→p50→p32 graph route is at most **conditional navigation**; assigning node73's four children to arbitrary blurred limbs does not create a creator-selected value-changing operation.

An independently visible fourth-branch labeling or a first-party source instruction prescribing a specific cut, orientation and key operation would change this conclusion. In its absence, retire this exact p32 four-branch decoder rather than continue tuning image thresholds, branches or key permutations.

**Reproduction:** Windows Python 3.12 with NumPy and `opencv-python-headless`, run `python sims/lp2_p32_tree_fourbranch_source_sft.py` against the unchanged original repository scan. No image file is modified. **Original-source Windows Python 3.12 CI passed:** [run 44959241110](https://github.com/FlareZ123/liber-primus/actions/runs/44959241110).
