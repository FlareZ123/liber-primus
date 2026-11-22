# Page55 source-shaped 35-rune H-sum branch: weak nonrandomness, no decrypted plaintext

**Agent20, 22 November 2026. Intermediate candidate, not an established cipher mechanism or plaintext.** The test finds one sharp *local* symbol-frequency anomaly that may justify a source-constrained receiver later. It also closes the obvious direct use of the five interior survivors as a simple repeating key on this branch.

## Exact original input and source-informed operation

Unchanged physical LP2 p55 has **76 GP29 runes**. Its leading **NG** is a printed cross-page word continuation and is excluded from the 16 locally complete words, whose rune lengths are **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]** (75 GP29 runes). The *hypothesis* is the reversible pair mapping on successively shed word circumferences, **H(x,y)=(x+y,x-y) modulo29**, taking each word's outermost pair first. This is inspired by the documented p55 inside-out shell route; Cicada has **not** authenticated the H equation.

There are **35 outer pairs** and **5 central singletons**. H produces two independent full 35-rune branches, plus exactly the five untouched survivor runes **[1,6,2,11,18]** in source word order. The complete wordwise GP29-sum branch is

`O.F.O.R.J.X.F.U.O.EO.J.F.M.NG.OE.D.A.M.EA.NG.OE.L.U.X.A.A.R.R.X.A.M.R.F.A.IA`

The complete difference branch begins `E.N.IA.A.M.I.EO.EA.OE.W.O.C.H.H.G.Y.X.M`; both sequences are preserved as machine-readable GP29 indices by the reproducer. The inverse H recovers every original paired rune via division by2 modulo29, with the five centers untouched: **75/75 exact original source reconstruction**.

## Observed distributional surprise, calibrated narrowly

| Extracted source | GP29 runes | IoC | Original E |
|---|---:|---:|---:|
| Page55 wordwise H **sum** branch | **35** | **0.058823529412** | **0** |
| Page55 wordwise H difference branch | 35 | 0.026890756303 | 1 |
| Native solved-p57 GP29 control | 95 | 0.062709966405 | 15 |

The sum branch is concentrated, with GP29 `A`, `F`, `O`, `R` and `X` recurring. Its E-free profile and fragmented output provide **no** legible GP-native English. GP29 IoC by itself proves neither language nor a key.

**Word-boundary-specific exact obstruction:** If the 16 shell outputs retain their printed source word boundaries, the seven one-rune sum-word outputs are `[3,4,11,1,24,24,27]`, comprising **six distinct ciphertext rune identities**. Any single unknown fixed invertible GP29 substitution of ordinary English singleton words A/I (even generously including O) produces at most **three** distinct outputs. Thus a plain monoalphabetic substitution of these **16 unaltered sum-word groups** cannot give ordinary GP-native English; this exact bound does not constrain the unspaced concatenated 35-rune stream, changing substitutions, or a separate recoding layer. Do not fit one alphabet to the visible `OF` prefix and treat a short match as plaintext.

Under the **fixed original p55 word lengths and each word's exact GP29 rune multiset**, 20,000 pseudorandom within-word shuffles, additionally conditioned to preserve **each word's observed number of adjacent doubles**, exceed the H-sum IoC in **207/20,000** cases (add-one tail **0.01039948**). The null's mean IoC is **0.03661151**, standard deviation **0.00765948**. Source seed `0x33017765`, shuffled by the existing deterministic xorshift32/Fisher–Yates routine; this is a fixed within-word null, not a random book or fitted language model.

The identical H-sum formula applied to all **55 runic unknown physical pages** (p0–55, excluding runeless p50) gives p55 the highest simple uniform29-length-standardized statistic **z=3.253956867**, with second p44 **z=1.91557**. The source-input correct comparison must charge the **entire 55-page search**. I held fixed each page's exact original words, rune multisets, lengths and within-word adjacent-equality counts; shuffled within every word without changing punctuation/page boundaries; recomputed all 55 H-sum scores per simulated manuscript; and took the maximum standardized score. Among **5,000 deterministic synthetic manuscripts** with source seed `0x33019998`, **1,052/5,000** had *at least one page* score ≥ the original top page55. The add-one familywise tail is **0.2105578884**, so **the observed book-wide H-sum maximum is not exceptional** under this matched null. Page55's own conditional same-location tail under this replication is **49/5,000**, add-one **0.0099980**, consistent with the preceding 20,000-page-only test. The synthetic manuscript maximum has median **z=2.6380**, 75th percentile **z=3.1401**, and 95th percentile **z=4.1300**. A single preselected p55 source-typed decode might still be legitimate, but a 55-page winner from exploratory H-sum arithmetic does **not** independently promote the H function as Cicada-authored. Preserve the rank as source geometry, not a cryptographic discovery. [Complete source-only 55-page SFT](../sims/lp2_p55_hsum_familywise_55page_original_sft.cjs). **Independent Windows Node22 PASS:** [run 45010567738](https://github.com/FlareZ123/liber-primus/actions/runs/45010567738), including exact original and 5,000-manuscript null assertions.

## Frozen first plaintext receiver, negative

The source supplies five central survivor GP29 indices **[1,6,2,11,18]**. Their corresponding GP primes are **[3,17,5,8,9]** and prime totients are **[2,16,4,7,8]**. Because the sum branch has exactly **35=7×5** runes, their literal continuous five-phase additive ± mod29 consumers are an inexpensive source-typed next step. **All six original sum-branch inverses fail to reveal a complete intelligible message.** The direct GP0 variants have output IoCs **0.04874** and **0.04370**; the GP-prime and totient variants range **0.03361–0.03697**, without genuine English phrases. The same finite six controls on the difference branch are likewise negative. No offset, free key, or plaintext crib was fitted.

The historical 2016 signed prose and the solved-p57 GP text also fail to give a uniquely patterned full-length monoalphabetic crib for the 35-rune sum branch; short 10–14-character arbitrary relabeling matches are non-discriminating. No authentic substitution alphabet has been recovered.

## Decision

The reversible 35-pair/5-center source geometry remains a **conditional candidate**; the manuscript-wide 55-page null now shows its peak concentration offers **no compelling independent evidence for an intentional H-sum carrier**. The exact page55 shell operation and its unambiguous five survivors are worth retaining for a future source-directed readout, but **do not prioritize the elevated IoC itself** as an unlock. Its 35 symbols contain **no decoded language**, and the candidate H operation itself lacks an authenticated author instruction. A future positive needs an **independently source-selected** nontrivial remapping of the *unchanged* 35 GP29 values that exposes substantial contiguous plaintext and predicts a second untouched source. Do not tune an arbitrary 29! substitution or select a better H family member by output language.

**Reproducer:** [Windows 11/Node22 original-source SFT](../sims/lp2_p55_hsum_gp29_source_sft.cjs). It reads only canonical repo files, reconstructs the entire 75-rune input, scans the unmodified original page framing, and implements the conditional seeded null. **Independent Windows Node22 execution:** [GitHub Actions PASS run 45009894153](https://github.com/FlareZ123/liber-primus/actions/runs/45009894153). No change to authoritative `results/README.md` is justified.
