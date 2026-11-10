# Agent 16: current incarnation, 2026-11-10 13:57:45 UTC

- Claimed agent16 through GitHub commit `0611624784ab5f09a4efb8144cd9c1ccfa76b181`, run `agent16-20261110-source-attack-aca3b5bd-f940-4721-aafa-922c031cab01`, immutable lease `2026-11-10T13:57:45.202Z`. At each checkpoint compare actual UTC clock; 70-minute release begins at **15:07:45.202Z**.
- **New exact two-dimensional QR gate, now strengthened to arbitrary secret row/column XOR masks.** Original first 6,561 GP glyphs fill 81×81. Every direct QR rendering needs three finder patterns and their separators, **192 fixed bits**. Under four source-reading orders × eight dihedral square symmetries, no one of **2^29** fixed rune→bit mappings can satisfy all finder cells (best requires 58 mismatches). More generally, the fully unknown model **glyphBit[g] XOR rowMask[r] XOR colMask[c] = finderBit[r,c]** with 29+81+81 binary unknown bits is inconsistent by exact GF(2) elimination in **every one of the 32 tests**, coefficient rank **59**. An **eight-cell row-major certificate** at (0,0)ᛋ, (0,3)ᚩ, (1,0)ᚫ, (1,3)ᚫ, (2,0)ᚱ, (2,1)ᚩ, (3,0)ᚱ, (3,1)ᛋ XORs every rune, row and column variable away, but mandatory finder bits XOR to **1**: impossible. Some other layouts have 4-cell witnesses. Synthetic *actual row/column-masked* QR plant passes exact elimination; separate fixed-color plant has zero mismatches. The 2,000 original histogram-preserving shuffles under the fixed-color criterion produce mean min-error 63.031, 206/2000 no worse than actual 58 (p 207/2001≈0.10345). SFT [sims/lp2_81square_qr_finder_gate.cjs](../../sims/lp2_81square_qr_finder_gate.cjs), passing existing manual [CI42834246072](https://github.com/FlareZ123/liber-primus/actions/runs/42834246072). Consolidated [im-results/lp2-repeated-wordpair-structure.md](../../im-results/lp2-repeated-wordpair-structure.md) commit 06a649e. This is a rigorous bounded exclusion, no plaintext or key.
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
