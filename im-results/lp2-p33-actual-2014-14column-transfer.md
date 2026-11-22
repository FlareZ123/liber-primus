# Original p33 black 196-rune direct transfer of the documented 2014 fourteen-column order

**Agent18, 22 November 2026. Decision: fixed historical column permutation fails to recover unknown p33 plaintext. This is one bounded original-cipher negative; it is neither a general exclusion of transposition nor evidence for a replacement cipher.**

## A human-visible, historically motivated trial

Original LP2 p33 scan `resources/liber-primus/50.jpg` has 214 runes. The independent physical ink inventory identifies ten initial red runes at offsets `[0,10)` and an eight-rune red subheading at `[91,99)`. Strip those **18 red rune positions** without trimming or selecting text for language, leaving **196 black rune positions, exactly 14×14**. The original complete black words are **21 above / 28 below** the red subheading, with black-run tape lengths **81 and 115**. Their seam is black offset81, i.e. column11 of zero-based 14-wide rows; the original layout therefore does **not** itself print a single uninterrupted 14×14 black matrix. The tempting square size warrants the trial, but is an inferred serialization rather than an author's explicit grid.

The historical operation comes from the documented 2014 Cicada fourteen-column stage, [participant solution and its exact cipher text](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3). Its **fixed zero-based within-row column order** is `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`: within each 14-symbol row, output the input symbols at those columns in that order. The order and original 70-character source cipher are historical, independent of LP2 p33; the 2014 reconstruction itself is not a Cicada-signed instruction to apply it to p33.

Running this row operation on the documented 2014 source five rows recovers the exact 70-character contemporary solution:

```text
GOODWORKULTIMA
TETRUTHISTHEUL
TIMATEILLUSION
JOINUSATFV7LYU
CMEOZZD5J4ONIO
```

This uses the **real historical row-wise permutation**, not a classical arbitrary 14-column rectangular readout, a guessed order from the p33 ciphertext, or a newly derived key.

## Fixed original unknown-cipher receiver

The same operation applied **once** in original p33 black-source order to all 196 untouched ciphertext runes, with no phase or direction search, emits fourteen consecutive 14-rune rows. The printed strings below are conventional GP29 transliterations; `TH`, `EO`, `NG`, `IA`, `AE`, `EA`, and `OE` each designate one rune.

```text
FIASOEEANYEOEATEOEAG
RMYAETRBIAMXOTHWD
HHSJLTHIAOEIAWAEUNGF
WMLIEAWTHOUWTTNS
JDPAJWEGYWAEJMIA
HGJUBYDNGIAEWESL
UMIYRWDNTHEYIAREO
HWNBEOIFJIANCXAM
OPEAOWJBOEJSEOTP
NGTFEADEAJMCTWUOU
XTLOBIAIGDOTHXBEO
FWDEIAWSUESEAAPD
SIANDRAFJLUNGTHGX
FAEAMDBOEHRRTHYAG
```

No coherent original GP29 English plaintext appears, including in the **unoptimized final 49-rune holdout**:

```text
GDOTHXBEOFWDEIAWSUESEAAPDSIANDRAFJLUNGTHGXFAEAMDBOEHRRTHYAG
```

The original black IoC is **0.03354264782836212**; the transformed IoC is **identical**, as necessarily occurs for any pure permutation. This near-uniform monogram distribution contrasts with an authentic solved-LP1 196-rune control IoC of **0.059497645211930926**. The comparison illustrates why a pure transposition by itself cannot restore ordinary prose-like GP29 symbol frequencies from this ciphertext. It cannot prove that every possible non-English textual or intermediate output is absent.

The test provides two exact forward/backward positives: the historical 2014 70-character source returns **70/70** characters, and an independently taken 196-rune authentic solved-LP1 text planted through the inverse row order returns **196/196**, including its final 49 positions. Original p33 black tape also reconstructs **196/196** exactly through inverse replay. The original word parser disregards typographic slash/newline and respects all true punctuation; it confirms **49 complete black words**, no invented line-split words.

## Decision and reproducibility

The only rejected claim is that the historically recovered 2014 14-column row order directly deciphers p33's black196 symbols. It returns no contiguous phrase or untouched continuation. Keep the 214/18/196 and 81+115 original-print observations as possible navigation clues, but do not search fabricated column permutations or rescue this result with a post-hoc section phase or an extra unmotivated pad.

**Exact offline original-input SFT:** [`sims/lp2_p33_historic_14column_transfer_sft.cjs`](../sims/lp2_p33_historic_14column_transfer_sft.cjs), Node22 CommonJS, reads checked-in original corpus, ink, transcription and solved-LP1 rune source. **Windows CI run:** [44978951007](https://github.com/FlareZ123/liber-primus/actions/runs/44978951007). **Director decision:** [#2153](https://github.com/FlareZ123/liber-primus/issues/2153). No unknown LP2 plaintext, reusable unknown key or destination recovered.
