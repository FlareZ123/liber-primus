# P57 word-circumference stripping as an exact 76-rune p55 key

**Classification:** original-input negative for 12 source-sized, reversible finite decoders. No recovered p55 plaintext. This is a direct word-boundary key construction distinct from the earlier stationary 19-block affine code exclusion.

## Fixed source-selected framing

Physical p57 (already solved in ordinary GP29) contains a **seven-rune PARABLE heading** followed by **19 separate body words totaling 88 runes**. Its 95 original runes are thus `7+88`. Physical p55 contains **76** original runes. A literal reading of the p57 phrase “shed our own circumferences” suggests removing *one outer rune per body word*:

`7 (unchanged heading) + (88 − 19) = 76.`

Exactly two directional choices are admitted: retain the PARABLE heading, and remove either the *first* or the *last* rune from each of the 19 body words, using the original printed word segmentation. Each resulting 76-rune GP29 stream becomes a candidate full-length key for the original 76-rune p55 ciphertext, in source order. The sentence and manuscript do not actually command this key transfer. The matching length makes it a bounded hypothesis worth testing once.

Earlier [19×4 / 19×5 affine-code work](terminal-p55-p57-19block-affine-obstruction.md) rejected fixed secret block matrices on unsegmented pages; it did **not** cover removing first/last glyphs from the *printed* body words. The broader [circumference report](instar-circumference-edge-strip.md) tested other ring and repeat-key interpretations, but did not test these specific 76-rune keys against p55 under the two established differential rank conventions.

## Twelve frozen complete-page decoders

Two source-derived keys are each evaluated under exactly six reversible operations:

- Original GP29 additive cipher, with `P_i = C_i ± K_i mod29`, two signs.
- Anti-doublet GP28 ciphertext-difference encoder, with `Δ_i = (C_i-C_(i−1)) mod29`, `C_(−1)=0`; nonzero differences are converted either by `Δ−1` or by the discrete logarithm base 15 in GF29; `Δ=0` emits the reserved EA symbol; the two key signs are tested for each rank convention.

All twelve models completely re-encrypt **76/76 original source runes** and recover **76/76 planted known GP29 plaintext runes**, with a forced EA sentinel testing the zero-difference channel. The differential model has a p55 ciphertext repeat at one noninitial position, handled without loss. No phase/offset/word reset, key permutation or unrestricted alphabet fit is introduced.

The strongest candidate is *remove-last, GP28 ordinal difference, positive key sign* with decoded IoC **0.04385964912**. The next relevant simple direct-GP29 candidate (remove-first, subtraction) reaches **0.04035087719**. All other source candidates lie from **0.03122807018** through **0.03894736842**. Every decoded transliteration is nonlinguistic.

As a matched-length native-language comparison, the repository's solved LP1 reference provides **3,504** greedily encoded GP29 runes, and **3,429** consecutive 76-rune windows. The **lowest** reference IoC is **0.04561403509**. All twelve original candidates remain below that floor, including the highest GP28 candidate. This benchmark describes the tested GP-native register; it does not forbid an unknown language, compressed intermediate or a separate source-provided transform.

## Decision

**Retire these specific p57 one-edge-stripped keys as stand-alone GP29 additive or protected-zero GP28 differential decryptors of p55.** The 95−19=76 source-length equality and the explicit printed 19-word segmentation survive as observations, but do not license further fitted trims, key schedules or cipher menus without an independent instruction.

[Single-file, dependency-free CommonJS reproducer](../sims/p55_p57_oneedge_76_key_gate.cjs) uses the pinned original runic transcription, GP alphabet, solved p57 and p55 physical page indices, and solved LP1 reference. It asserts the exact source counts and all original/plant round-trips.
