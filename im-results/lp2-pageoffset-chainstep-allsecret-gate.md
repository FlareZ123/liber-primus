# Original LP2 shared page-offset *chain-increment* alphabet: exact all-key gate

**Agent11, 14 November 2026.** The untouched 55 rune-bearing physical pages 0–55 of Liber Primus 2 do not have the cross-page repeated differential-symbol pattern expected from natural GP29 English plaintext encrypted with a **reused per-page-offset chain-increment permutation**. Across 4,428 exact-page-length windows from three source-native English corpora, all have higher cross-page equality than the original. This is a key-independent, reference-conditional exclusion of the specified cipher architecture. **No unknown-page plaintext, historical key, or source-selected author operation was recovered.**

## Premise, competing explanation and original evidence

A deliberately stateful cipher is one possible explanation for the observed paucity of identical adjacent ciphertext runes (86 within physical pages in 12,956 original rune positions). The original source supplies meaningful physical page boundaries, and Cicada historically used page-local reset clocks. One proposed *reversible* family carries forward the previous ciphertext rune and adds a separately keyed GP29 substitution of the current plaintext rune. Its crucial testable assumption is that the position-wise key permutation is **reused** on successive physical pages. By contrast, the original may use genuinely page-independent keys, may not be ordinary GP prose, or may use an altogether different state model.

Write the original ciphertext at page `p`, local rune offset `i` as `C[p,i]` and corresponding plaintext as `P[p,i]`, all in GF29. Assume arbitrary GP29 bijections `pi_i` depending on `i` (not on `p`), and let

```text
C[p,0] = pi_0(P[p,0])
C[p,i] = C[p,i-1] + pi_i(P[p,i])  (mod 29), i >= 1
D[p,i] = C[p,i] - C[p,i-1]       (mod 29), i >= 1
```

Then `D[p,i]=pi_i(P[p,i])`. Since every `pi_i` is injective, for any two physical pages `p,q` containing offset `i`,

```text
D[p,i] == D[q,i]  iff  P[p,i] == P[q,i].
```

This equality identity survives **every possible secret permutation of all 29 symbols independently at each offset**, including every page-reused additive, affine, or otherwise position-indexed substitution. It requires no key fitting, rune frequency assumptions, or chosen transform sign. The first source rune on each page is omitted from the count, as its cipher predecessor is undefined under the proposed page reset. The cipher remains exactly reversible for any chosen bijective `pi_i`.

This gate differs from the previously published [direct page-offset alphabet test](lp2-pageoffset-allsecret-reuse-gate.md): that gate compares `C[p,i]` at equal offsets under a stateless substitution. The present gate compares `D[p,i]` under **ciphertext feedback**.

## Frozen untouched-source results

Input is `resources/liber-primus/lp2-corpus.json` with the source's original page numbers, 55 rune-bearing unknown pages, p50's no-rune interruption, and 12,956 unchanged rune indexes. The same source-native GP encoder used in the existing direct gate reproduces the separately solved original p57 text **95/95**, including source-attested single-rune ING/IO spellings. Original matches count unordered pairs of equal `D[p,i]` over all physical pages at each same local index `i>=1`.

| Original pages | Equal differential pairs / possible comparisons | Original rate | Native reference outcome |
| --- | ---: | ---: | --- |
| p0–55 (55 rune-bearing pages) | **11,006 / 309,647** | **0.03554369976** | **0 of 4,428** English windows at or below |
| p0–2 | 19 / 661 | 0.02874433 | 1 Shakespeare window at/below, none in two others |
| p3–7 | 87 / 2,093 | 0.04156713 | 0 across three corpora |
| p8–14 | 136 / 4,717 | 0.02883188 | 0 |
| p15–22 | 208 / 5,833 | 0.03565918 | 0 |
| p23–26 | 54 / 1,433 | 0.03768318 | 2 Emerson windows at/below |
| p27–32 | 102 / 3,122 | 0.03267136 | 0 |
| p33–39 | 158 / 4,770 | 0.03312369 | 0 |
| p40–53 | 526 / 15,291 | 0.03439932 | 0 |
| p54–55 | 2 / 75 | 0.02666667 | Many reference windows at/below; underpowered |

The exact physical-page lengths were overlaid on the three repository-pinned source-native GP English registers. Control windows advance in deterministic 127-rune steps; overlapping windows are intentionally **not claimed independent statistical trials**.

| Register | Native GP rune length | Source-matched windows (full 55 pages) | Smallest equality rate | Windows at/below original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 217,106 | 1,608 | **0.05600248024** | 0 |
| Gibran | 62,492 | 391 | **0.05829218433** | 0 |
| Emerson | 321,327 | 2,429 | **0.05920935775** | 0 |

The **six clear, source-original LP1 rune pages** p3, p8–11, p14 independently give **128/2,131 = 0.06006570** equal original GP glyph pairs when each source page excludes its first rune. This author's actual plaintext spelling differs in length and theme from LP2 and is a qualitative corroboration only.

The source-native Shakespeare span was also encrypted under a deliberately hidden GP29 affine bijection at *every physical-page position*, with `pi_i(x)=((1+7i mod 28)x+(11i+3)) mod29` and chained as specified above. The single-file test verifies every plaintext rune is exactly recovered by its inverse, and the differential-equality profile of the fully encrypted plant is **identical** to the known GP plaintext. The independent original p57 source orthography check is separate from this synthetic invertibility control.

## Decision and honest scope

The source's differential equality is close to the uniform alphabet reference `1/29`, whereas ordinary length-matched native GP English retains frequent matching plaintext symbols at equal physical-page offsets. Consequently the proposed *page-reused* chain-step alphabet cannot explain any of the 4,428 tested original-length native-English windows, whatever its secret keys. Eight of nine image-chapter groupings also have very low counts, though chapter p0–2 has one English lower control and p54–55 has only 75 comparisons.

**This does not prove the LP2 plaintext is English**, rule out an adversarial nonrepeating plaintext, exclude independently seeded page keys, allow a cross-page clock that ignores actual image boundaries, or forbid source-selected transposition/state-dependent nonbijective operations with authentic side information. The original source does **not** select this chain-increment cipher. It is a key-independent original-input architectural gate intended to prevent unproductive key searches within this finite hypothesis, **not a decoded message**.

**Reproduction:** [single-file CommonJS SFT](../sims/lp2_pageoffset_chainstep_allsecret_sft.cjs), read-only Node.js 22, original repository files and three pinned native references, Windows GitHub Actions [successful run 43584125801](https://github.com/FlareZ123/liber-primus/actions/runs/43584125801). The script asserts every original count, all three source-native lengths, original p57 95/95, fully reversible positive plants and original GP LP1 control.
