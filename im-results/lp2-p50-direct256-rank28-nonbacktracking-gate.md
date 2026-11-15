# Printed 256-byte table as a direct 28-state nonbacktracking differential key

**15 November 2026, Agent39. Decision: eight frozen source-simple original inverse variants yield no coherent unknown LP2 plaintext.** This is a finite candidate exclusion. The original table is sourced from the image-corrected `resources/liber-primus/lp2-grid-256.json` and the canonical unknown glyphs from `resources/liber-primus/lp2-corpus.json`; no hidden or optimized key is fitted.

## Why test this particular direct operation?

All 55 rune-bearing unknown pages contain **12,956 original GP29 runes** and **12,901 same-page predecessor transitions**. Of the differences `d=(current-previous) mod29`, only **86** are zero. The remaining 12,815 occupy exactly the 28 states `1..28`, with near-uniform empirical counts. A predecessor-excluding cipher can therefore use **28 possible next glyphs** given a previous glyph, plus a separately coded same-glyph exception. The printed terminal grid contains exactly **256 source numeric cells** that can supply an unmodified byte key. This motivates the *low-step hypothetical* key `k[i]=grid_byte[i mod256] mod28`. It is not a proven author selection.

Define hypothetical plaintext index `p=0` to be the equal-ciphertext exception and `p=1..28` to represent the other 28 states. The explicit invertible original step is:

- `d = (c_i - c_(i-1)) mod29`
- `p_i=0` when `d=0`; otherwise `p_i = 1 + ((d-1 + sign*k_i) mod28)`
- `d_i=0` when `p_i=0`; otherwise `d_i = 1 + ((p_i-1-sign*k_i) mod28)`, and `c_i = (c_(i-1)+d_i) mod29`

Each physical page's first original rune is its transmitted IV. We preserve 55 IVs and encrypt/decrypt 12,901 successor symbols. Source key order is either the literal printed stream or its complete reversal, sign ±1, and phase either continuous over all successor symbols or reset to zero at each physical page. This gives **2×2×2=8** finite settings without key-phase or plaintext-guided search. The bypass occupies the rune index of GP `F` but that assignment is an unproven marker convention.

## Exact original Windows result

The [source-input CommonJS SFT](../sims/lp2_p50_nonbacktracking_28ary_sft.cjs) and [successful manual Windows Actions run 43727652678](https://github.com/FlareZ123/liber-primus/actions/runs/43727652678) confirm:

| Frozen key clock | Byte order | Sign −1 IoC | Sign +1 IoC |
| --- | --- | ---: | ---: |
| Continuous | Printed | 0.035328720 | 0.035315092 |
| Continuous | Reversed | 0.035263320 | 0.035283966 |
| Physical page reset | Printed | 0.035247301 | 0.035282861 |
| Physical page reset | Reversed | 0.035291465 | 0.035257600 |

Each is effectively uniform-like: no original decoded 12,901-rune stream exhibits GP prose. All eight **12901/12901** original ciphertext successor symbols reencrypt exactly as the algebra requires. Independently, all eight **95/95** p57 native-clear GP glyphs recover from a planted encoding (including three zero marker events). This is implementation validation; every wrong bijective key also reencrypts perfectly.

### Interpretation and scope

The table's 256-byte width does not itself imply a repeating 256-step additive shift. The marker convention `F`, full-book/page key clock and reverse direction were exploratory. The original symbol output's equal-event count is frozen by source ciphertext (86) and does not reproduce normal GP-F frequency: source p57 has three literal F in 95 runes (about 3.16%), while the unknown stream emits just 86/12901 (about 0.67%) under this model. This is a further tension with the direct native-GP interpretation, though source p57 may have a different plaintext register.

This is distinct from earlier **AES256-CTR via the table's eight 32-byte columns** (`sims/grid_chain28_exact_inversion.cjs` and `sims/grid_rank28_cryptanalysis.cjs`) and the **unkeyed base28 enumerative byte codec** (`sims/lp2_enumerative_rank28_escape_transport_sft.cjs`). It excludes precisely the eight direct 256-byte repeating-key consumers and does not exclude nonlinear state, other sourced key schedules, or an authentic page-specific operator. No creator key, unknown plaintext, source-authored F marker or puzzle continuation was recovered.

**Research fork:** Do not broaden this family by tuning arbitrary 256 positions or selecting more rotations from language scores. Next test requires independently authored mapping, key offset, or new original clue. Other real-source routes can proceed independently.
