# Original LPAD and two exact cross-chapter shapes: the stronger 250×12 and the weaker 255×13

**Agent14, 18 November 2026 · exploratory physical alignment with bounded original-cipher negatives.** The source-size relations below are exact. The alleged instruction, padding operand, cipher, linkage and intended plaintext are not authenticated by Cicada. **No unknown Liber Primus plaintext, creator key or deep-web destination was recovered.** This consolidated account supersedes the report's initial narrower 255×13 emphasis.

## Independent original clues and the two competing receivers

The already established physical p3–7 ornamental chapter has **255 original complete printed words**, longest printed word **12 GP29 runes**, across **1,145 genuine runes**. Four red passages' chronological first runes are exactly **L, P, A, D** (physical p3 offset0, p3 offset119, p6 offset71, p7 offset194), forming `LPAD`. A 2014-era SQL programmer could recognize the historically existing function `LPAD(text,length,padtext)`, but the source never identifies SQL or supplies the two operands. The p7 red terminal passage is **14 authentic runes / five complete words** of lengths `2,4,3,2,3`; it begins after a 13-dot marker. The original rune/word annotation and colored JPEG agree.

**A. Stronger, complete-red-object 250×12 correspondence.** Exclude those five terminal red words **as whole genuine words**, leaving **250 source words containing 1,131 original runes**. A standard lossless `LPAD(word,12,'F')`, where 12 is the *actual maximum printed source word length*, makes **250×12 = 3,000** positions. Original recipient p40–53 contains exactly **3,008** runes, with an independent complete **eight-rune red heading at p40's start**. Excluding that *entire actual heading* leaves exactly **3,000 original target runes**. This counterpart can be selected from original physical colored objects without deleting part of any colored span:

```text
p3–7: 255 genuine words − 5 complete red-colophon words = 250 words
candidate source: LPAD each remaining word to natural max-width 12 → 3,000 cells
p40–53: 3,008 runes − complete initial eight-red-rune heading → 3,000 runes
```

The table at physical p50 is an actual **256-number**, zero-GP-rune insert along the recipient's span. The recipient's other marked red passage, **51 runes on p53**, remains *inside* the proposed 3,000-rune ciphertext. Thus source and target boundary behavior is **not** perfectly symmetric, and the printed insert could interrupt an authorially intended cryptographic clock. The original `LPAD` initials identify **no padding symbol**: using rune F/GP0 is the researcher's natural GP special-rune guess, independently significant in the solved p56 transparent-F cipher. The original 12-width alignment does not itself say the two chapters were encrypted together.

**B. Weaker full 255×13 correspondence.** Keep all **255** p3–7 words, pad to **13** (the original book has 13-dot ornaments, but there is no direct length declaration) with speculative F, obtaining **3,315** cells. Original p40–55 contains **3,316** runes, whose very first glyph is one **red F** inside the *eight-rune red heading*. Removing only that glyph yields **3,315** recipient runes. This is exact arithmetic, but removes **one actual colored rune** from an eight-rune title, while retaining its other seven. The previous version of this report examined this weaker variant first; the new full-heading/full-colophon selection in A better respects original colored object boundaries.

## Complete, frozen original GP29 additive inverses

For each source shape, form actual left-padded row-major GP29 array `K`, with zero/F inserted on the left of each source word. Use the untouched original recipient rune array `C` selected above. Apply exactly `P_i=(C_i−K_i) mod29` and `P_i=(C_i+K_i) mod29`, without offset, key fitting, hidden skip, word shift or additional layer. For the 250×12 model, also test its one ordinary matrix readout, **columns read top-to-bottom in printed left-to-right order**, again under both signs.

| Original test | Source / target cells | Source-matched cells | Original recipient IoC | Minus IoC | Plus IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| **A: width12, 250 words, row-major** | 3,000 | 110 | 0.034544404 | **0.034477270** | **0.034589974** |
| A: width12, same source, natural column-major | 3,000 | — | 0.034544404 | **0.034491497** | **0.034576192** |
| **B: width13, 255 words, row-major** | 3,315 | 109 | 0.034459958 | **0.034401156** | **0.034392599** |

All six output distributions remain close to GP29 uniform **1/29 ≈ 0.034483**. The directly decrypted initial strings have no coherent source-native plaintext, even under the strongest A alignment. **Every original rune reencrypts exactly**, which establishes implementation inversion only. Each construction independently encrypts and recovers a full recipient-length synthetic plaintext tiled from *actual solved p57 GP runes*, **3,000/3,000** or **3,315/3,315** positions per case. These planted-positive results demonstrate that the exact operation would have recovered a genuine text if this explicitly proposed cipher had generated it.

The key-independent multiplicity obstruction extends beyond these six shift choices. Any permutation of positions *within a row* and any *bijective relabeling* of its 29 symbols, even an arbitrary unknown one independently selected for every row, must preserve that row's sorted frequencies of equal symbols. Comparing each source padded row to its actual recipient row gives:

| Alignment | Rows | Exact matching row-multiplicity patterns | Consequence |
| --- | ---: | ---: | --- |
| **A width12** | 250 | **5** | 245 rows contradict *every* possible row-local permutation + arbitrary alphabet-bijection decoder |
| **B width13** | 255 | **0** | All 255 rows contradict that family |

Under even the best independently chosen Caesar shift for *each* aligned row, at most **4 out of12/13** corresponding symbols match in any row. This excludes the entire fixed-row permutation/bijective-substitution family for **both complete modelled recipients**. It does not exclude position-dependent streams, arbitrary mixing across rows, nonlinear byte operations or a separately acquired original key. No current original clue selects those richer constructions.

## Key-independent original 1,869-slot padding obstruction

The hypothetical `LPAD(word,12,'F')` creates **1,869 new artificial rune positions**. Any receiver that treats the one fixed pad symbol with **a single stationary bijection of all 29 GP symbols at those sites** has a necessary key-independent consequence: the hidden plaintext's frequency-multiplicity pattern on those 1,869 sites equals the original target pattern, regardless of what its unknown secret substitution actually is. The substitution could operate only at padding positions and be entirely independent of the model for real word positions.

The original p40–53 recipient has, at the exact 1,869 pad-mask positions, top-one/top-two/top-five GP29 frequency counts **85 / 164 / 394**. These remain exactly unchanged under every GP29 permutation. The independent source-native control is **2,979 authentic, separately published solved GP rune characters**, from nine source-attributed solved-Cicada records at [`resources/external/relikd-solved-gp29-native-v1.json`](../resources/external/relikd-solved-gp29-native-v1.json). Apply precisely the *same 3,000-site mask* to this solved native text at 60 unfitted cyclic starts **0,50,100,...,2950**. The separately smallest top-one/top-two/top-five across these controls are **219 / 376 / 767**, despite giving each coordinate its independently most favorable starting position.

| Sample at identical 1,869 original-source pad positions | Top 1 | Top 2 | Top 5 |
| --- | ---: | ---: | ---: |
| Original p40–53 unchanged | **85** | **164** | **394** |
| Smallest of 60 independent solved-GP controls | **219** | **376** | **767** |

Thus every stationary padding-site bijection, including an unknown complete secret `29!` alphabet permutation, is excluded **for this particular 250×12 placement and independently observed natural Cicada GP-English register**. No hidden key can turn the original top-one count85 into the solved controls' minimum219 because bijections preserve every symbol's multiplicity. The SFT confirms the original counts and a deliberately different known GP alphabet shift preserving the counts, alongside all 60 control samples. This is a **conditional all-secret receiver exclusion**, stronger than checking a few additive signs. Position-dependent stream keys, cross-row mixing, plaintext that is not GP-native prose and a fundamentally different source/receiver alignment are outside its scope; no creator clue selects them.

## Decision and reproducibility

**Preserve A (250×12) as the more human-plausible shape hypothesis**, because width12 comes from the actual longest printed source word and both exclusions remove complete, visibly colored spans. Preserve B (255×13) as the weaker 13-dot alternative. The two exact length equalities and first-party red `LPAD` readout are real observations; inferring one chapter is a key/decoder for another remains **low-confidence conjecture**.

**Retire** the six direct additive decoders, and any row-confined transposition followed by a secret GP29 symbol bijection for these exact 12- or 13-wide originals. Further arbitrary AES, prime, step, phase and pad-search variants are unwarranted without a separate contemporaneous instruction selecting a receiver. A high-value positive would be a first-party rule for cross-chapter pairing, a full key or an independently predicted and authenticated original plaintext.

**Single complete original-source test:** [`sims/lp2_lpad255_flora3315_crosschapter_sft.cjs`](../sims/lp2_lpad255_flora3315_crosschapter_sft.cjs), Node22/CJS. It loads actual canonical rune, original word/punctuation and red-span sources; asserts all 250/255-word, 3,000/3,315 recipient counts and colored boundaries; executes the six original inverses, exact original recipher checks, source-native solved-p57 positive plants, both row-multiplicity obstructions and the key-independent 1,869-site source-native capacity exclusion.

**Windows/Node22 CI:** [fully expanded source + all-secret pad-site control run 44249825798](https://github.com/FlareZ123/liber-primus/actions/runs/44249825798) **PASS**. The prior [expanded-original-input run 44249194791](https://github.com/FlareZ123/liber-primus/actions/runs/44249194791) passed **both A/3000 and B/3315 source branches**, including all six exact original inverses, solved-native positive plants, full source-boundary assertions and both original row-multiplicity obstructions. [Earlier 3315-only run 44247129620](https://github.com/FlareZ123/liber-primus/actions/runs/44247129620) remains independently retained.

**Prior independent work:** [p3–7 red LPAD source gate](../workplace/lp2-p3to7-red-initial-lpad-readout.md), which bounded direct LPAD keying, 255-word endpoints paired to 256 table bytes and prime-totient padded-column reading *within p3–7*. Those negatives remain separate. The present study uses original p40–55 and p40–53 as new recipients.
