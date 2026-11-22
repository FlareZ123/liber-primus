# LPAD/five-dot bookend alignment against the original 256-cell table

**Agent25, 18 November 2026. Intermediate original-cipher experiment. The identified cross-object clock alignment is conditional, and both direct inverses fail to recover any authentic unknown LP2 plaintext, key or next destination.**

## Source-visible route to a finite test

The original scroll-framed physical p3–7 chapter supplies four red-span starts, **L P A D**, first recognized and checked in [the separately established source study](../workplace/lp2-p3to7-red-initial-lpad-readout.md). Original p7 also depicts **five black dots**, but no adjacent instruction labels the dots as a cipher-clock skip count. The only repeated six-rune cross-page unknown-region phrase occurs at absolute GP offsets **6555 (p27 rune28)** and **12950 (p55 rune70)**:

`DJU-BEI` in original GP transliteration. Its raw distance is **6395** rune positions, as documented in the [pre-existing bookend study](lp2-bookend-6395-sharedpad-gate.md).

The separately printed physical p49–51 grid has **256** base60 two-character cells. Treating **LPAD** provisionally as an instruction to advance a cyclic key clock by the five original black dots before the second echo makes

```text
p55 echo offset - p27 echo offset = 12950 - 6555 = 6395
proposed five key-padding positions   = 5
adjusted distance                    = 6400 = 25 * 256
```

Therefore both copies of the six-rune echo would use the **same six key-table positions** in a 256-periodic key. The exact table positions are **155–160**, yielding GP29 residues **[25,23,19,17,16,1]**. This is a source-constrained geometric alignment, with one unproven operator: no first-party clue says to apply LPAD's putative five positions to the *key clock* rather than the message, or that a five-dot mark on p7 applies to the distant p55 echo. Also, once the five-step correction has been imposed, identical ciphertext under identical direct keys must produce identical candidate plaintext; matching both echoes is **not independent plaintext confirmation**.

## Exact original-phrase inverse

Use the printed row-major grid's conventional base60 byte reading, modulo29. Subtract or add the source key on the complete preserved original phrase. Both echo copies yield the same GP29 transliterations:

| GP29 inverse | Original six-rune proposed plaintext |
| --- | --- |
| Subtract key | `IA B J F TH N` |
| Add key | `M C L C C J` |

Neither is native GP-English as a complete unchanged six-rune phrase, and neither supplies a new key or an independently recognizable continuation. The direct arithmetic alone provides no basis for selecting an additional operation.

## Stronger seventh-rune known-plaintext holdout

The source's six-rune `DJU-BEI` echo actually has a seventh matching rune across the physical **p55→p56** page seam. P27 local34 and p56 local0 both print **AE**. Crucially, p56 has been independently solved by the original prime-totient/F-transparent algorithm: its first ciphertext **AE** is authentic plaintext **A** (GP index24), requiring a direct subtractive shift of **1 modulo29**.

The proposed LPAD-five key clock addresses table slot **161** at this seventh source position. The original table supplies `byte[161] mod29 = 14`, yielding **J** with the subtractive interpretation or **I** with the additive interpretation, versus the independently solved **A**. Thus **both signs fail a genuine known-plaintext test at 1/1 separately held-out rune**, and the seventh symbol cannot corroborate this putative shared direct table key.

This is a narrow exact obstruction to extending **this same table-pad mechanism across the p55/p56 seam**. The original p56 is known to use a different cipher method, so the observed mismatch does **not** exclude a p55-only cipher or other structural meanings of the repeat. The broader source-seven-rune boundary and authentic-p56 restart tests already existed in [the independent seam report](lp2-p27-terminal-bookend-p56-prime-restart-gate.md); the contribution here is specifically the original LPAD5/256-byte key's failure on that established seam.

## Full original-page test and decision

Keep the absolute original rune clock for p27, and advance the same clock five extra positions for p55, without changing any original ciphertext or printed word boundaries. Two possible conventional GP29 additive signs produce the following **complete-page** results. Each is exactly reversible by the specified inverse; those round-trips are implementation controls only.

| Inverse sign | p27 original source page IoC | p55 original source page IoC |
| --- | ---: | ---: |
| Subtract | **0.03415135174791827** | **0.02701754385964912** |
| Add | **0.03741608891823484** | **0.04105263157894737** |

The numerical values stay near ciphertext-like rather than the much higher IoC of source-calibrated clear GP-English; neither complete readout provides coherent plaintext. The terminal p55 page begins, under subtraction, `OE U EO TH M L Y I OE B G T E B L R U NG X EA AE C E O`, and under addition `L L Y E A I H E T P E AE EA T U AE A IA L J G N M TH`; both fail to read as consecutive ordinary words.

**Decision:** the original first-party artifacts admit a compact, reproducible **LPAD-five-step 6400/256 echo registration**, but do not select the clock-insertion operation. Its natural direct page-key consumer fails on the full original ciphertext. Retire this specified additive inverse. Future work on an equivalent alignment needs independent authorial selection of a value-changing operation, source-origin time clock, or a blind original-page plaintext prediction. An arbitrary re-keyed decoder fitted to the bookend alone would have no discriminating evidence.

[Standalone original-source Windows Node.js 22 SFT](../sims/lp2_lpad5_bookend256_original_inverse_sft.cjs) verifies the literal original LPAD red initials, two unmodified echo positions, the seventh cross-page AE rune and independently solved A, 6395/6400 clock geometry, all seven source key residues, original readouts, and exact forward reencryption. [Successful Windows Node22 GitHub Actions run 44252226574](https://github.com/FlareZ123/liber-primus/actions/runs/44252226574), job `134625413922`.
