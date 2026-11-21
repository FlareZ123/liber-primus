# P15 next Fibonacci prime closes on full LP2 length and the solved LP1 SHADOWS value

**Agent30, 21 November 2026. New exact arithmetic cross-artifact identity, one original-cipher negative; no recovered unknown plaintext, key or destination.**

## Source-motivated single-step prediction

The original LP2 physical p15 scan32 contains a 4×4 number square with one red **3299**; its already-recovered complete generator, traced from the red-centered spiral through all sixteen printed cells, is `N(i)=abs(3301−prime(F_i+1))`, where the **distinct Fibonacci sequence** starts `F_i=0,1,2,3,5,8,...` (see [established p15 decoder](../results/lp2-p15-fibonacci-prime-spiral.md)). The immediately **next unprinted** Fibonacci value after F15=987 is **F16=1597**. It selects the 1598th prime **13,477**, giving a predicted next printed-grid number `abs(3301−13477)=10,176`. That direct mathematical continuation was frozen before applying it to unknown ciphertext.

The complete original LP2 manuscript contains **13,136 runes**: 12,956 original encrypted symbols in p0–55, 85 in solved p56 and 95 in solved p57; physical p50 is a rune-free numeral page. Thus the selected prime exceeds the actual full-runic manuscript count by **341**. The original solved LP1 WISDOM 5×5 square explicitly prints the real word **SHADOWS** over the numeral **341**, its GP-prime value: `S=67,H=23,A=97,D=89,O=13,W=59,S=67`; these prime weights total341. Consequently, the following equation is exact and independently reproducible:

`prime(F16+1) − sum_rune_count(LP2_p0..p57) = 13477−13136 = 341 = GPprime(SHADOWS)`.

**Interpretation caution:** The generator and the LP2 rune count are source-defined, while choosing to subtract total runes and recognizing *SHADOWS* within the historical WISDOM square are **retrospective analyst operations**. There is no source instruction to extend the spiral beyond sixteen cells, compare a prime to the whole-book rune count, or select the LP1 word as a key. The possible link is a follow-up candidate rather than authenticated key material, and numerous numbers/words have been inspected in prior work. A false discovery cannot be ruled out by the exact equality.

## Single original-cipher recipient and operation

The p15 layout itself selects one adjacent text receiver: skip only its original red9 title **above** the square, begin at the red11 text printed **below** that square, then continue in source page order through physical p22, the end of this chapter. This gives **1,894 unchanged GP29 ciphertext runes**. The candidate key is precisely the historical `SHADOWS` GP0 sequence **[15,8,24,23,3,7,15]**. The historically evidenced LP2 solved-p56 and earlier 2014 GP Vigenère operation motivates a direct, cyclic seven-position GP29 additive inverse; freeze both arithmetic signs at the source beginning, without fitted phases or plaintext-dependent substitutions.

| Original 1,894-rune recipient | GP29 index of coincidence |
|---|---:|
| Unmodified ciphertext | 0.034494896163 |
| `P_i=(C_i−SHADOWS[i mod7]) mod29` | **0.034342609436** |
| `P_i=(C_i+SHADOWS[i mod7]) mod29` | **0.034315833748** |

Both original decoded streams remain near the random-GP29 rate **1/29=0.034482758621** and contain no coherent runic-English opening. The subtraction starts `C OE Y S TH D TH D H C IA W D A S X U B Y E S...`; addition starts `G N T O H H O A A A S P H AE T U L C O O T...`. Both variants exactly forward re-encode all 1,894 original symbols, and independent full-length source-native solved-p57 cipher plants recover all 1,894 runes under the same routines. Round trips establish implementation correctness only.

## Decision and reproduction

The **new numerical closure** is a precise, independently rerunnable puzzle-structure conjecture. The most immediate typed original-cipher use of SHADOWS as a cyclic seven-rune GP29 additive key **fails**. No evidence presently selects a different key schedule, another target, or an entire-length decoder. Retain this equality in intermediate research only, and do not tune phases, clocks, symbolic spellings or extra layers without an independent original-human clue.

[Source-reconstructing Node22 CommonJS SFT](../sims/lp2_p15_f17prime_lp2length_shadows_key_sft.cjs), executed successfully on the Windows GitHub Actions runner [44932671283](https://github.com/FlareZ123/liber-primus/actions/runs/44932671283), checks every one of the 16 printed source numeric cells, calculates prime1598=13477, verifies LP2 full-rune count13136 and LP1 SHADOWS=341, asserts the 1,894-runic recipient, and tests both exact originals plus source-native cipher plants.
