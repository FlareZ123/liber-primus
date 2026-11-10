# The 32×8 LP2 table is not a literal TEA/XTEA round-state trace

**Evidence classification:** original-source, exact and key-independent bounded exclusion with source-true synthetic cipher controls, 10 November 2026. **No unknown LP2 plaintext, key, encryption architecture or destination was recovered.**

## Why this is a human-solver hypothesis

Liber Primus physically prints **32 rows × 8 base-60-decoded byte values** on LP2 pages 49–51. This is exactly the shape of 32 consecutive **64-bit states**, suggestive of a 32-round 64-bit block cipher. The solved part of the manuscript explicitly tells readers that all things should be encrypted; LP2 page15 prints a Fibonacci-indexed prime spiral. The 32-round **Tiny Encryption Algorithm (TEA)** uses a fixed 32-bit step `0x9E3779B9` derived from the golden ratio. Its successor **XTEA** uses the same constant, 64-bit state size, 128-bit secret key, and 32 full rounds. Thus TEA/XTEA is a concrete source-motivated idea, though no clue explicitly names either algorithm or says the table consists of intermediate states.

A 32-state trace gives 31 adjacent transitions. This is sufficient for an exact *necessary* condition for TEA/XTEA even if the initial or last round state was omitted. There is **no need to guess, search, or brute-force any of the 2^128 keys**.

## The all-key parity identities

Let row `r` hold two unsigned 32-bit words `(a_r,b_r)`, let `(a_{r+1},b_{r+1})` be the next row, and let `Δ=0x9E3779B9` be odd. Standard TEA first updates the running sum `S_r=S_0+(r+1)Δ`, and then updates

```text
a_(r+1) = a_r + (((b_r << 4) + k0) xor (b_r + S_r) xor ((b_r >>> 5) + k1))  mod 2^32.
```

Taking only the least-significant bit annihilates all carry terms and the unknown higher key bits. Define `d_r=(a_{r+1}-a_r) mod 2^32` and the observable binary statistic

```text
Q0[r] = (d_r xor b_r xor (b_r >>> 5) xor r) & 1.
```

Because `Δ` is odd, `(S_r & 1) xor (r & 1)` is constant. **For every possible 128-bit TEA key and every initial sum, `Q0[r]` is constant over all 31 transitions.** The analogous second update gives an independently necessary constant

```text
Q1[r] = ((b_(r+1)-b_r) xor a_(r+1) xor (a_(r+1) >>> 5) xor r) & 1.
```

For standard XTEA, the first half-round instead updates

```text
a_(r+1) = a_r + (((b_r << 4) xor (b_r >>> 5)) + b_r xor
                     (S_r + k[S_r & 3]))  mod 2^32,
S_r = S_0 + rΔ.
```

The identical `Q0[r]` now equals `(S_0 & 1) xor (k[S_r & 3] & 1)`. Since `Δ` is odd, `S_r & 3` traverses the four key indices in a fixed cycle. **Every 128-bit XTEA key and every initial sum must give `Q0[r]=Q0[r+4]` whenever both sides exist.** This is a period-four constraint, with the four hidden bit values left entirely unrestricted.

These identities are necessary conditions for *literal consecutive round states*, not an attempted plaintext decoding. Key-dependent, endian-dependent or earlier-image byte streams that are outputs of some other encoding are not addressed by them.

## Exact source-original exclusions

Consider all 16 basic ways of serializing the **original printed 32×8 table as 32 two-word states**: row-major versus column-major flattening/regrouping, forward versus reverse row order, big- versus little-endian 32-bit word bytes, and original versus swapped word halves. For each model, let the secret constant or secret four-bit cycle take whichever values minimize the number of contradictory transition equations.

| Constraint, over all 16 source orientations | Minimum contradictory equations with all 256 printed bytes | Minimum contradictions *unaffected* by five alternate-token readings |
| --- | ---: | ---: |
| TEA first-half `Q0` constant | **11** | **7** |
| TEA second-half `Q1` constant | Nonzero in every orientation | Nonzero in every orientation |
| XTEA first-half `Q0` four-periodic | **7** | **5** |

The robustness column completely removes any round equation whose current or next eight-byte row contains one of the five previously suggested alternative physical-byte readings at zero-based printed indices **45, 50, 165, 172, 246**. Depending on serialization, **21 or 23 of 31 adjacent state pairs** remain entirely unaffected. Even if all five bytes are allowed to take **arbitrary values**, no choice can repair the untouched contradictions. Those five proposals have separately been rejected by direct source-image glyph adjudication; discarding their effects here is deliberately generous.

For the direct printed row-major, forward, big-endian and unswapped-word interpretation alone, at least **13 TEA** first-half and **13 XTEA** first-half equations are inconsistent; discarding ambiguous-byte-sensitive equations still leaves **10 TEA** and **7 XTEA** contradictions. The minimum across all orientations is the more permissive bound in the table. Contradictions count **necessary equations**; the numbers should not be described as minimum changed bytes or independent statistical events.

The failure cannot be repaired by choosing another secret key, initial plaintext block, or initial `sum` value under the tested TEA/XTEA recurrence. It also does not rely on natural-language resemblance, confidence thresholds, or source-grid byte distribution.

## Genuine TEA/XTEA forward controls

The reproducer itself generates 32 consecutive **real synthetic round states** for each algorithm with hidden 128-bit key words `[13579bdf,2468ace0,11223345,89abcdef]`, initial sum `6a09e667`, initial words `[deadbeef,01234567]`, and all 31 cumulative transitions. It independently evaluates the same untouched-bit certificates:

- TEA synthetic `Q0`: **0 contradictions**, a constant bit.
- TEA synthetic `Q1`: **0 contradictions**, a constant bit.
- XTEA synthetic `Q0`: **0 contradictions**, a four-periodic sequence.

All 16 original-table orientations fail the same checks. There is no fit to the ciphertext or extra liberty in the positive controls. See the [passing GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/42906569746).

## Conclusion and precise scope

The original printed 256-byte table **cannot be 32 consecutive literal round states of standard TEA or XTEA**, under any 128-bit key, initial sum, natural row/column readout, direction, word endian or half-order, even allowing the five historical alternate-token sites to change without constraint.

This is a **new finite all-key exclusion**, not evidence for an authentic different cipher. A TEA-derived *key schedule*, ciphertext rather than intermediate states, hidden byte transforms, altered round order, skipped rounds, or a structurally different Feistel cipher remain open. Further ciphertext inversions should be motivated by additional source-specific clues rather than seeking TEA/XTEA keys for the excluded trace.

**Executable source:** [`sims/grid_tea_xtea_allkey_trace_gate.cjs`](../sims/grid_tea_xtea_allkey_trace_gate.cjs), Node22, `node:assert/strict`, source JSON and 31 local state differences, manual-only [workflow](../.github/workflows/agent5-tea-trace-manual.yml). [Successful original-input and true-cipher controls](https://github.com/FlareZ123/liber-primus/actions/runs/42906569746). The script reports every orientation and all contradictory-bit counts as JSON.
