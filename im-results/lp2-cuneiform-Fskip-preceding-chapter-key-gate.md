# Original cuneiform bracket becomes previous chapter length after literal-F removal

**12 November 2026, Agent16. Source-exact novel alignment and one bounded failed decoder.** The physical chapter spanning pp27–32 has exactly **1,433** GP29 runes. The next chapter's cuneiform **body**, measured between its actually printed p33 local91 heading and p39 local119 red-triad boundary, has **1,468** runes, of which **35** are exact GP29 **F** (index0). Removing these gives **1,433** remaining runes. This is an original-input one-to-one pairing with the *immediately previous source chapter*. Direct GP29 addition/subtraction between paired rune values has been executed on **all 1,433 source positions** and is nonlinguistic. No key, unknown original plaintext or actual cipher operation is recovered.

## Why this is an independently recoverable candidate

The physical-page reading order, the p33 internal heading at local91, the p39 isolated red triad at local119, and the preceding p27–32 chapter start/end are source-visible. The original solved p56 decoder uniquely establishes that a **literal ciphertext F** can pass through without consuming its prime-totient keystream. Applying that previously demonstrated *type of interruption* to the later body yields the following count **without changing either input rune or moving a marked boundary**:

| Source-locked string | Original runes | Literal-F instances | Resulting key-consuming positions |
| --- | ---: | ---: | ---: |
| Physical pages p27–32, entire previous visual chapter | **1,433** | 52 | **1,433 if used as a key** |
| Cuneiform body p33:91 through p39:119 | **1,468** | **35** | **1,433** |

The first row remains 1,433 because the proposed previous chapter provides **key runes** (including its 52 Fs), whereas only the *later ciphertext* receives the p56-inspired literal-F nonconsuming treatment. That asymmetry is a model hypothesis. Solved p56 uses exactly one transparent F on its own page; the manuscript has no instruction to promote *all 35* F rune instances in this distinct chapter to transparent controls. The count match was noticed after source-partition inspection and therefore has a look-elsewhere caveat. It is a testable **source-selected alignment**, not a proven intentional link.

The cuneiform-body measurement is more source-faithful than the 1,680-rune aggregate p33–39 physical pages: that page aggregate includes an independent **91-rune p33 prelude** and **121-rune p39 red-triad/tail**. The bracketed body is separately established in [the p32→cuneiform boundary reconstruction](p32-cuneiform-redtriad-mobius-bridge.md) and [source visual section map](lp2-global-original-visual-section-map.md). The GP29 F interruption is anchored by [the solved p56 prime-totient method](../results/README.md), whose authentic rule also distinguishes F key consumption from merely deleting arbitrary runes.

## One immediate original-cipher consumer

Use **only** the original p27–32 GP29 sequence (K_i) in physical order as key, and the later bracketed original p33–39 body with its *35 literal F positions skipped for key advancement*. Take the consumed later symbols (C_i) in physical order, (i=0..1432), without phase optimization or independent relabeling. The original 2014 LP1 GP29 Vigenère method motivates the completely specified direct inverse (P_i=(C_i-K_i)\bmod29); the opposite sign is a direction control. The original marked F rune glyphs remain unchanged in the full physical layout.

| Original 1,433-rune comparison | GP29 IoC | First decoded GP transliteration |
| --- | ---: | --- |
| Previous chapter p27–32 | **0.034186202** | `MPYLSOAAEHLEEOIMLLSCPN...` |
| Marked later body with original F removed | **0.035429832** | `NGTHEOICOEEODBYIAY...` |
| Later minus previous, no phase fit | **0.034415240** | `THESMMMBIANGNXLWEJEPGURBONGTLCB...` |
| Later plus previous, no phase fit | **0.034519526** | `JSNULAEWMAEBTNJTFOEMDOMLFCCOEEAE...` |

The subtraction starts with **four runes transliterating TH–E–S–M**. The three-rune prefix TH–E–S is compatible with an English fragment, but subsequent symbols **M–M–M–B...** immediately destroy the interpretation. Against a much longer 1,433-rune segment, an isolated apparent prefix is insufficient evidence of decryption. Both complete readouts remain near independent uniform 1/29 (~0.034483), not native GP-English as illustrated by the solved p57 control's IoC ~0.062710. The source streams agree at **51/1,433 aligned rune identities**, near the chance value ~49 for random independent GP29 channels. There is no whole-source identity match or evident repeated key.

The [standalone CommonJS SFT](../sims/lp2_cuneiform_ftransparency_previous_chapter_sft.cjs) verifies the physical page lengths and brackets, **1,468/35/1,433** accounting, preserves all 35 literal Fs, decrypts both fixed signs, proves original **1,433/1,433** re-encryption and restores the exact entire 1,468-rune source layout. Its separate source-native p57 1,433-rune plant verifies the **known-hole**, source-conditioned Vigenère implementation under both signs; it does not claim to prove a general self-delimiting F-escape encoder, since a synthetic ciphertext could contain additional accidental Fs at nonreserved positions. Original input is `resources/liber-primus/lp2-corpus.json`; no synthetic language phrase is credited as recovered original plaintext.

## Research decision

The *source-created 1,433-position pairing* may guide a later explicit key/transport search, but the minimal, historically demonstrated Vigenère reuse of the preceding chapter is rejected in both directions. The count coincidence alone cannot select encryption, bit packing, byte register, or shared-pad reuse. A successor needs an independent period-available instruction about whether all cuneiform Fs are transparent and what reversible operator combines the previous chapter with the following body. No moving cut, phase search or letter-score optimization was attempted.

**Status:** source-exact structural hypothesis; an original-cipher null for two specified direct consumers; no new unknown plaintext.
