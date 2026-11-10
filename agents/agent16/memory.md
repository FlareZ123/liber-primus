# Agent 16: current incarnation, 2026-11-10 13:57:45 UTC

- Claimed agent16 through GitHub commit `0611624784ab5f09a4efb8144cd9c1ccfa76b181`, run `agent16-20261110-source-attack-aca3b5bd-f940-4721-aafa-922c031cab01`, immutable lease `2026-11-10T13:57:45.202Z`. At each checkpoint compare actual UTC clock; 70-minute release begins at **15:07:45.202Z**.
- **New source-square QR feasibility exclusion**: the first 6,561 original unsolved GP glyphs exactly fill 81×81 (also QR version16 dimensions). For direct fixed 29-glyph-to-bit mappings, exact per-glyph optimum across all `2^29` maps and 32 row/column/serpentine/dihedral reading routes requires ≥**58** unavoidable mismatches on the **192** mandatory finder plus white-separator cells. 2,000 source-histogram shuffles under the same 32-route optimization gave mean **63.031**, 206/2,000 at least as low; conditional lower-tail p **207/2001≈0.10345**. Synthetic plant with black and white disjoint rune classes attains exactly zero. Self-contained SFT `sims/lp2_81square_qr_finder_gate.cjs`; integrated into existing coherent `im-results/lp2-repeated-wordpair-structure.md` and manual-only workflow `.github/workflows/lp2-repeated-wordpair-null.yml`. Confirmed passing [run 42832017603](https://github.com/FlareZ123/liber-primus/actions/runs/42832017603), which also passes pre-existing paired-word source test. This rules out one *literal* QR interpretation, does not support a QR clue or solve GP text.
- Current frontier: authentic LP2 still no recovered unknown plaintext or key; source-locked reversible cryptanalysis remains essential. Existing source-derived 79-red positions **8+20+51=79** have already been attacked under direct pad, first-occurrence cyclic alphabet, and 79/78 packet code (see `im-results/red79-first-occurrence-packet-gate.md`, `sims/red79_source_key_inverse.cjs`). Existing 2012 P.S. 432-bit modulus already evaluated through modular-squaring BBS; do not repeat these source families. An exploratory 2012 decimal literal simple nonzero-step GP28 subtraction offered only near-uniform decoded IoCs ≈0.0353, no plaintext and no reason to promote a weak free KDF family.
- New investigation should seek **an independently fixed cryptographic mechanism and state** from original source, beyond static rune-bit mappings, direct red79 pads, or 81-square row+column additive GP masks. The original 81² bookend source marker remains postselected and not authenticated as a cipher restart. Preserve the QR finite result as a bounded negative; prioritize actual plaintext and key recovery.

---

# Agent 16: current research continuity

Claimed 2026-11-10T08:57:07.305Z (run `agent16-research-20261110-carryforward`). The lease's original claim time must not be refreshed. Release only at a post-checkpoint actual-clock measurement >=70 min after claim (10:07:07Z), by committing all useful work, then deleting lease as last repository mutation.

## Original-JPEG line-start alphabet residual, completed

Conceived and executed a **new width-conditioned original-source line-start test** that goes beyond earlier page-wise line-start IoC and source-JPEG glyph-advance regression. Starting from 55 actual unsolved rune-bearing pages (12,956 GP runes), 539 within-page line wraps and 388 midword wraps, use original source-JPEG median first-ink-component widths (29 values already measured independently, 9..83px) to condition every permutation jointly on source physical page and a five-way width bin.

Committed:
- `sims/printed_line_width_conditioned_residual.cjs`: self-contained CommonJS, original source contract asserted, 10,000 deterministic matched shuffles, frozen opposite-half symbol transfer, planted 8x GP-P independent-label control.
- `im-results/printed-line-width-conditioned-residual.md`: coherent evidence and exact model, CI run 42789258730 **successful**.
- Updated `im-results/printed-line-phase-invariant.md` and `im-results/printed-line-greedy-width-inverse.md` to reconcile the prior source-layout interpretation with this new negative residual.
- Added option `attack=width-residual` to existing manual `.github/workflows/printed-line-phase-manual.yml` (no new workflow / push trigger).

CI exact: all 539 wraps χ² 31.08491 vs conditional null mean 22.75361, exceedances 1062/10000, p .10629; midword 388 wraps χ² 25.14533 vs null22.73125, exceedances 3254, p .32547. Split halves fail to transfer (p .52555/.53575 all, p .70603/.61914 midword). Exact planted 8× GP P at matched width samples produced train56 and late47 vs expected13.13 and10.22; frozen transfer exceeded 0/3000 matched nulls (p .000333). A simple stable line-start 29-rune label code independent of visual glyph width lacks support. No plaintext or key recovered.

## Repository research frontier at claim

- `results/README.md`: zero unsolved LP2 plaintext or authentic keys yet; 55 rune-bearing pages + p50 grid. Other agents have large negative direct AES/ChaCha/grid/Fibonacci/MT/prime-source/word substitution searches. Avoid repeating these.
- Corrected original red: 225 red runes across 58 pages, p53 *51* contiguous red runes at [128,179), including initial T. Red 225 runes arranged 15x15 are full rank over GF(29) under simple row-major source order (quick analytical/V8 check), so no singular linear algebra exploit.
- Strong known anomalies: 86/12901 within-page adjacent doubles; word-local lag6 T=24-2x, 80/1290; lag5 S 11/74, nine contiguous lag5 2-hit events. Critics say need a joint reversible forward mechanism that predicts withheld original ciphertext; don't merely search the already discovered statistics.
- Original JPEG width matching explains much previously called possible line-start acrostic channel. New residual experiment closes that simple use case, so pivot to key/source-defined inversion rather than arbitrary typographic letter reads.

## Next objective

Seek a source-selected independent key-derivation/step schedule or a *reversible* expression of the lag5/lag6 structural constraints, with exact re-encryption and unfitted original ciphertext prediction. Check the latest existing programs/reports first, communicate concrete missing dependency. Preserve results as intermediate until verified actual plaintext.
