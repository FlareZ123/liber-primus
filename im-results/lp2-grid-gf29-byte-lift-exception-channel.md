# GF29 table-byte lifts as a precise source-compatible side channel

**12 November 2026, Agent27.** The printed 256-byte p50 table has a mathematically distinct source-side degree of freedom after the established H/G polynomial divisibility has fixed its residues modulo 29. Its possible byte lifts carry **800.795525 bits**, an exact capacity statement relative to the independently established original table residues. This is enough for one fully invertible 29-symbol to nearly-nonrepeating 28-step transport, but a frozen fully specified interpretation yields **uniform-looking, unreadable original plaintext**. No author-chosen key, decipherment method, unknown LP2 plaintext or destination was found.

## Source-led hypothesis and its strongest missing instruction

The original table is 32 rows × 8 two-digit base60 tokens, interpreted as 256 integers 0..255. Previously established, independently source-derived quadratics `H(X)=3+26X+24X²` (from original signed 2013 BASE29 `3301→3QO`) and `G(X)=27+5X+15X²` (from p39's red triple) divide the table's degree-255 polynomial **after reduction modulo 29**. See [source factorization](lp2-grid-complete-gf29-factorization.md) and [direct Q252 readouts](p50-p39-p3-field-remainder.md).

For each printed integer `b`, write `b=r+29q` with `r=b mod29`. The polynomial's demonstrated GF29 factors constrain `r` only, **leaving `q` undetermined by those factors**. Given `r`, the number of possible displayed byte values is

`c(r)=floor((255−r)/29)+1=9` for `0≤r≤23`, or `8` for `24≤r≤28`.

The original 256 residues contain **193** from `0..23` and **63** from `24..28`. Accordingly the 256 lift values have exactly `9^193·8^63` possible configurations, or **800.7955252783662 bits** of conditional freedom. Changing lifts preserves all `b mod29`, and therefore preserves both polynomial factors. These byte lifts may themselves carry further information, or simply be incidental to the printed integer stream. The manuscript supplies **no authenticated instruction** to interpret them as cipher escape data.

## One complete inverse, frozen without tuning to plaintext

The original LP2 has 55 rune-bearing unsolved pages, **12,956 runes** and **12,901 within-page transitions**, with **86** zero differences. Model the author's mechanism as a GP29 cyclic walk using any of the 28 *other* runes at a nonrepeat step, with **at most 86 repeats anywhere** on the original fixed page layout. The cap86 is observed from the source and is **post-selected**; it is not independently prescribed by the creator.

All allowed ciphertext streams form a finite codebook of size

`M = 29^55 × Σ[j=0..86] binom(12901,j) × 28^(12901−j)`.

There are `29^12956` possible length-preserved plaintext strings. The precise missing capacity of this at-most-86-repeat codebook is **325.450254 bits**, far below the 800.796 bits in the grid lifts. This differs from the **648.773-bit deficit** for a *fixed* set of 86 freely writable exception sites, and from the 1,066.56-bit deficit if those 86 specific positions must always contain repeats. The at-most-86 model may place repeats freely; it makes no unsupported assumption that marked sites provide freely writable rune values.

The [single-file CJS reproducer](../sims/lp2_grid_gf29_lift_channel_sft.cjs) supplies a concrete, exactly invertible **enumerative arithmetic code**:

1. Rank a ciphertext path by its repeat count `j≤86`, the repeat positions' exact combinatorial colex rank, its `12901−j` nonzero cyclic-step digits in base28, and its 55 page initials in base29. The rank `R` runs from `0` to `M−1`.
2. Rank the 256 original lift values `q[i]` as a mixed-base integer `U`, with digit radix `c(r[i])` from the source residual table. Extract `side = U mod (floor((29^12956−1−R)/M)+1)`; the quotient is an explicit independent salt preserving unused lift information.
3. Unrank `side·M+R` as exactly 12,956 GP29 plaintext symbols. This has no secret key, fitted plaintext target, or variable exponent, and the natural orientation follows the printed left-to-right table order and the GP alphabet's cyclic rank order.
4. The inverse ranks a supplied GP29 plaintext, emits a GP29 path with at most86 doublets, and stores its missing enumerative quotient in the table's allowed lifts while preserving the original modulo29 residue in **every cell**. The salt preserves surplus lift data for exact ciphertext-and-table reencryption.

The choice of this enumerative rule is hypothetical. It is useful as a **constructive capacity proof and a genuinely original-source executable candidate**, not as an authenticated interpretation. Different bit packing, reverse orientation, table row/column traverse or local resets would be different unselected ciphers; no combinatorial family search is claimed.

## Original-input result and complete native-GP plant

The model, exact original images' derived ciphertext and canonical p50 bytes were executed with Node22 on [successful manual-only GitHub Actions run 43277861258](https://github.com/FlareZ123/liber-primus/actions/runs/43277861258), including a separate first-pass computation of the same original GP29 inverse.

| Test | Observation |
| --- | --- |
| Original source | 55 pages, 12,956 GP runes, 86 within-page repeats |
| Frozen original plaintext candidate | GP29 index of coincidence **0.03448206791767022**; English control **0.0610633216435785** |
| First 120 original recovered symbols | `RTPMOIGAUIARWIIAMTEADOEBFJENOOEPEONGFFGIOCJXGRAEJNGXETHSWPCNBEIAELBCYJPSJUFEAOEYRPGGNGOBRNGBCUOEFRSDFMWCHIACLGJEOOMFISEOJTHEOJEUDFBOABEAPSUXIATH` |
| Original reconstruction | All original 12,956 ciphertext runes and **all 256 original table bytes** reproduced exactly using the explicit salt |
| Native-GP Shakespeare plant | 12,956 GP runes (IoC **0.0610633216435785**), encoded into a different conforming stream with **86 repeats** |
| Native-GP inverse | Every one of 12,956 source-native GP plaintext runes recovered exactly; all 256 table residuals remain identical to original |
| Structural control | Full rank/unrank original path equality and complete repeated encode/decode equality asserted |

The original candidate is indistinguishable from uniform GP29 by the simple alphabet-level check, with no readable recovered text. The positive plant proves the model's arithmetic can transport a native-language message **without breaking the exact source-established GF29 polynomial factors**. It does not identify the original cipher.

## What changed in the research decision

The grid's 2,048 raw bits are a loose capacity observation; isolating its **800.796 bits of mathematically GF29-factor-orthogonal lifts** yields a more precise, clue-adjacent place to look for the information missing from predecessor-excluding ciphertext schemes. An intended protocol could genuinely use this capacity without destroying the original dual factorization. The specific original natural mixed-radix arithmetic interpretation fails to recover plaintext, and **nothing in the source selects it over many alternatives**.

Further work should first seek an independent, contemporary clue naming how a table lift is read, or an original-ciphertext prediction tying specific lift digits to a defined repeat/exception structure. Avoid arbitrary orientation and cipher-word phase searches. This report does not imply that the table's byte lifts are intentionally steganographic or that LP2 is an enumeratively coded GP29 cipher.
