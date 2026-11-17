# p57 GIMP dissolve field as a direct GP29 key: bounded negative

**Status:** rejected for the frozen direct-pad interpretation; no plaintext or key recovered.

## Motivation and upstream evidence

The p57 illustration has a strongly supported deterministic legacy-GIMP Dissolve fingerprint. The external reconstruction reports GIMP 2.8.10's fixed seed **314159265**, 4096 row seeds, and a 293×267 research crop; it explicitly warns that 314159265 is a software default, not evidence that Cicada selected a π-derived key. The repository's `sims/lp2_p57_96dpi_mayfly_dissolve_original_sft.py` independently implements the same historical threshold generator.

A narrow question follows: if the rendered field is available in the original p57 image, can its raw threshold values serve as a direct GP29 keystream for the still-unsolved pages? This is an exploratory transfer, not a claim that the text instructs such use.

## Frozen test

- Reconstruct the exact 293×267 threshold crop with seed 314159265, 4096 master row seeds, row index `(y-9) mod 4096`, and a four-value row prefix discarded to represent the `x+4` crop.
- Read the resulting 78,231 values in row-major order.
- Use the first 12,956 values against the original LP2 p0–55 rune indices in canonical page order; p50 contributes no runes.
- Test only two natural GP29 reductions: `R mod 29` and `floor(29R/255)`.
- Test both direct additive directions: `P=C-K mod 29` and `P=C+K mod 29`.
- No offset search, reversal, rotation, resampling, per-page reset, pixel-specific fitting, or extra cipher layer.

The field generator was cross-checked against NumPy for the first ten master row seeds and the first twenty row-0 threshold values.

## Results

| Candidate | Whole-corpus IoC |
|---|---:|
| Raw LP2 p0–55 ciphertext | 0.0344783979 |
| `R mod 29`, `C-K` | 0.0344759194 |
| `R mod 29`, `C+K` | 0.0344487991 |
| `floor(29R/255)`, `C-K` | 0.0345174696 |
| `floor(29R/255)`, `C+K` | 0.0344850111 |
| Known clear p57 control | 0.0627099664 |

All four outputs remain at the random-like ciphertext coincidence rate and far below the known clear-text control. The small numerical differences from the raw IoC do not constitute linguistic evidence.

## Decision and limits

Reject **the direct row-major GIMP-threshold-field-as-GP29-additive/subtractive-pad hypothesis**. The exact image-rendering field is reproducible, but its two simplest direct GP29 consumers do not recover language.

This does not challenge the GIMP fingerprint as an explanation of how the stippled artwork was rendered. Nor does this test exclude every conceivable use of the artwork, a different source-selected extraction, or an unrelated cipher. No such alternative is opened here: the GIMP seed is a software default and there is no independent instruction selecting a different projection or offset.

## Reproduction

Run:

```bash
python sims/lp2_p57_gimp_dissolve_key_gate.py
```

The script asserts the initial NumPy seed/threshold vectors and emits the exact field dimensions, corpus counts, IoCs, and first 80 decoded transliteration symbols for all four frozen candidates.

**Sources:** [GIMP 2.8.10 legacy Dissolve implementation](https://gitlab.gnome.org/GNOME/gimp/-/blob/GIMP_2_8_10/app/base/paint-funcs.c); [SECRA's 15 October 2026 reconstruction and evidence summary](https://secra.tech/research/liber-primus-strongest-findings/); repository's existing [p57 dissolve reconstruction SFT](../sims/lp2_p57_96dpi_mayfly_dissolve_original_sft.py).
