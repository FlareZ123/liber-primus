# LP2 p33–39: all-secret sexagesimal-phase cipher gate

**11–12 November 2026, Agent 13. Classification: bounded native-GP ciphertext exclusion. No recovered unknown plaintext or authentic key.** A finite source-prompted candidate, using one fixed 60-phase alphabet per column, is incompatible with every tested native-English GP reference window even after granting all 29! secret relabelings and arbitrary within-column transposition. This is not evidence that a period-60 cipher was intended.

## Source path and weakest assumption

Physical LP2 pp33–39 contain `[214,261,271,238,228,228,240]` ordinary GP runes, **1,680 total = 28×60**. The chapter prints an unmistakable two-row Babylonian numeral motif, conventionally interpreted as `(17,13)_60 = 1033` and `(55,1)_60 = 3301`. A human might consequently try a 28-row by 60-column reading. The operation considered here is the unusually permissive model **one independent substitution alphabet for each of the 60 columns**.

**Critical source limitation:** the cuneiform numeral appears *after* the first **91** p33 runes, rather than at the absolute beginning of this 1,680-rune phase clock. Excluding that initial passage leaves 1,589 runes, not a 28×60 rectangle. The 28×60 interpretation is thus an exploratory whole-chapter frame; no printed instruction selects its offset or its 60 columns. Prior 7×227 and 5-numbered-passage gates address different frames and should not be confused with this test.

## Exact all-secret obstruction

For each `j∈[0,59]`, take `C_j=(c_j,c_(j+60),…,c_(j+27·60))`. For each 29-symbol GP index `g`, count its multiplicity `h_j(g)`. Any **secret bijection on all 29 symbols**, independently for each column, preserves the *sorted* 29-bin multiplicity vector. Even arbitrary **reordering of the 28 rune positions within each column** preserves it.

This gives two exact necessary conditions for any proposed original native-GP plaintext `P` encrypted under the entire permitted family:

1. Its 60 within-column equal-pair total `Σ_j Σ_g choose(h_j(g),2)` must equal the ciphertext total: **797**.
2. Allowing arbitrary row permutations and hidden alphabet bijections, the exact minimum number of symbol changes needed to turn a particular candidate `P` into the original ciphertext is `Σ_j Σ_k max(0, sort(h^C_j)_k − sort(h^P_j)_k)`, with both 29-vectors sorted descending. A genuine lossless member of this family must require **zero** changes.

All **1,680-rune** native-English GP windows below are formed by the same Greedy GP29 transliteration convention used by the repository's other source controls; they are scanned with fixed stride **29**, with no search over the original offset, secret alphabets, or word segmentation.

| Pinned source control | GP runes | Windows | Lowest equal pairs | Lowest exact required edits |
| --- | ---: | ---: | ---: | ---: |
| Kahlil Gibran, *The Prophet* | 63,114 | 2,119 | **1,253** | **227 / 1,680** |
| Ralph Waldo Emerson essays | 324,630 | 11,137 | **1,265** | **223 / 1,680** |
| Shakespeare sample | 218,800 | 7,487 | **1,214** | **212 / 1,680** |
| Original LP2 pp33–39 | 1,680 | 1 | **797** | **0** |

Thus, for the closest source window in this finite panel, **at least 212/1,680** symbol replacements are necessary even under the larger model permitting 60 arbitrary secret rune alphabets and full within-phase reordering. All 20,743 native reference windows also have more within-phase equal pairs than the original. These are **finite control exclusions**, not bounds on every conceivable plaintext.

A deterministic positive control encrypts a held-out native Gibran window with **60 secret random 29-rune permutations plus 60 secret random 28-position permutations** (fixed xorshift32 seed `0x20143301`). It exactly recovers all **1,680/1,680** source runes with the planted inverse, has zero minimum edit distance, and preserves the phase equality count. This demonstrates that the gate can accept the declared cipher family.

## Cryptanalytic decision

**Retire this particular 60-phase, column-stationary, one-rune-in/one-rune-out native-GP decipherment**, including an arbitrary secret 60-period Vigenère/Gronsfeld alphabet and any private fixed symbol substitution on each 60-rune phase. More exhaustive key hunting within that precise family cannot repair its key-independent equality obstruction. The result does **not** exclude secret per-position key evolution, nonlinear alphabet changes inside columns, format-changing/fractionated plaintext, or an intended 60-clock commencing at another source-marked boundary.

The stronger original-source lead in this chapter remains the independently established **1033/3301 numeral and 2014 7×7/5×5 squares**. That link has no direct recovered plaintext. No arbitrary new 60-lane key family is justified until an original clue selects the clock and operation.

**Reproduction:** `node sims/lp2_cuneiform60_allsecret_source_gate.cjs` (Node 22, no packages); exact original corpus, controlled source documents, fixed stride, secret-alphabet plant, and assertions. [Successful CI run 43145203555](https://github.com/FlareZ123/liber-primus/actions/runs/43145203555).
