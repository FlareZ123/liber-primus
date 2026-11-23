# 2014 1033-square “CHANGE” eigenspace: source-selected change-of-basis inverse on original LP2

**Agent10, 23 November 2026. Classification: exact source-local two-square algebra and fully reversible original-cipher negatives. No unknown LP2 plaintext, key or continuation recovered.**

## Why a 2014 player might try this

The exact original Cicada 2014 Stage10 OpenPuff plaintext `resources/cicada2014-openpuff-magic-squares.txt` prints two **5×5** magic squares with row sums3301 and1033. Previous research identified the 1033-square's five distinct GF29 eigenvalues **{5,8,18,21,24}**. Reordering them as **[5,8,24,21,18]** maps them through genuine Gematria Primus index names to **C H A NG E**, the English word **CHANGE** (five GP runes). The word-order selection was made after seeing the eigenvalues and is **not** printed as an original instruction. A plausible human interpretation is to *change basis* using that square's exact eigenvectors. This is a mathematically different operation from directly multiplying ciphertext by either historical magic square as a Hill key, which prior p3–p7 research already rejected.

All eigenvalues are simple. In the selected GP-word order, fixing the first nonzero vector coordinate to1 uniquely normalizes the source-derived 5×5 eigenvector matrix:

```text
E =
  1  1  1  1  1
  0 24 11 18  1
  0  8  0 20  1
  0 24 18 18  1
 28  1 28  1  1
```

Exact GF29 arithmetic establishes `E^-1 B E = diag(5,8,24,21,18)`, for the 1033-square B. The same basis conjugates the independent original 3301-square A into an unusually sparse 2+2+1 representation:

```text
E^-1 A E =
 24  0  9  0  0
  0 17  0  9  0
 24  0  5  0  0
  0 23  0 12  0
  0  0  0  0 24
```

Its two 2×2 blocks are on positions (0,2) and (1,3) and have respective characteristic factors `x²−9` and `x²−3`; the last scalar eigenvalue is24, exactly the known 3301-square eigenvalue decomposition. This is coherent source algebra, partly explained by both squares' centrosymmetry. It is **not** independent evidence that the author instructed eigenbasis changes.

## Full original-cipher receiver

The source p3–p7 scroll has five physical pages and **1,145=5×229 original GP29 runes**. An independent source p8 page has **255=5×51 original runes**. Test the four complete reversible 5×5 matrices `E`, `E^-1`, `E^T`, and `(E^-1)^T`, under only the two source-simple full-register layouts (five adjacent rune positions or five equal contiguous rune bands). Both full original spans remain intact. Thus **8 original scroll inverse candidates + 8 physically disjoint p8 candidates**, with no ciphertext-fitted matrix coefficients, phase, rune omissions or additional cipher layers.

| Original full receiver | GP29 untouched original IoC | Maximum IoC among eight change-of-basis variants | Authentic source-native comparison |
| --- | ---: | ---: | --- |
| p3–p7, 1145 original runes | 0.034633706904 | **0.034694781201** | Previously pinned **701** independent complete GP-native 1145-rune windows have minimum 0.0558829816 |
| p8, 255 original runes | 0.034275127374 | **0.033966342442** | Genuine solved p57 native GP29 text has IoC 0.062709966405 |

All 16 original outputs remain nearly uniform and nonlinguistic under the native GP alphabet. Each exactly forward reencrypts the complete unchanged original ciphertext with its corresponding inverse, and **all16 independent native-text plants** built from authentic clear p57 rune indices recover exactly. The original failure therefore comes from the proposed operator, rather than singular matrices or incorrect finite-field arithmetic.

### Conditional 255-byte table bridge

A separate original visual match gives a finite key opportunity: the first p50 numeric table cell `3N` evaluates under the *inferred* base60 alphabet to203, which is **0 modulo29**. Reading it as a hypothetical packet header leaves **255 actual source bytes**. All 255 remaining bytes modulo29 can be transformed through the same eight source-`E` operators and aligned to all **255 original p8 runes**, with both direct GP29 additive signs `P=C±K mod29`. This exact 8×2=16 family gives **maximum decoded IoC 0.036066079975**; no coherent p8 text. A planted full-register native-GP source recovers **255/255** for each signed candidate. The 203 header is only a candidate: **seven** original table cells have zero residue mod29, and the independent author never labelled the first cell as a header.

No variant transforms 255 table bytes directly into the original p8 ciphertext either: the maximum exact same-position rune identity over the eight basis readings is **11/255**. This constrains the specific provisional source-header table-to-p8 key/lookup, without eliminating other table consumers.

## Decision

A physically present 2014 number square and its GP29 eigenvalue word make **one coherent exact change-of-basis experiment** affordable and source-motivated. It does not solve an unknown page under the two complete exact original geometries or the conditional table bridge. The historical square’s actual 2014 use was a website form challenge, and no first-party signer specifies eigenvalue ordering, an LP2 target or a 5×5 block cipher. Additional eigenvector permutation/phase scans would use hindsight to rescue a negative.

**Full source reproducer:** `sims/lp2_2014_square_change_eigenbasis_scroll_source_sft.cjs`; original 2014 two-square text, canonical original LP2 GP indices and original 256-cell table, all eigenvector calculations, exact conjugacy, 16 full-scroll/page inverse+positive tests, and all 16 signed p50-to-p8 original source candidates. Test under Node22 with the existing Windows SFT workflow.

**Related fixed routes:** original full-scroll direct square Hill5 and Shamir geometry in `im-results/lp2-p3-p7-five-scroll-product-original-gate.md`; earlier 3301 spectral original source `im-results/lp2-2014-3301-square-base29-spectral-original-gate.md`. Preserve these separate mechanisms and the full cipher negatives without promoting a retrospective word permutation into authenticated author instruction.