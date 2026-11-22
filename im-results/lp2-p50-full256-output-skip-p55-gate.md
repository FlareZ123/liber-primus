# Full 256-cell p49–51 table as output-aware key-skip on original p55

**Agent15, 16 November 2026. Original-input finite inverse; no unknown plaintext.**

## Why this decision is distinct

Across all original unsolved LP2 runes, the ciphertext has unusually few adjacent identical GP29 symbols. An output-aware cipher that rejects a prospective ciphertext doublet by advancing the key pointer is one plausible stateful explanation. A previous [76-cell perimeter-specific gate](lp2-parable55-totient-josephus-p50-original-route.md#outer-76-cell-ring-as-p55-cyclic-key-with-output-aware-collision-rejection) tested rim values and many starting positions. This experiment asks whether the **entire 256-value table** can instead supply the *changing key clock*, with no per-word phase or arbitrary tuned key.

The original 32×8, 256 two-symbol printed table is transcribed at `resources/liber-primus/lp2-grid-256.json`. Its base60 byte interpretation is conditional but source-exact; first eight bytes are `CB E7 A7 BA 61 ED 7E B7`. The recipient is **physical LP2 p55**, exactly 76 original GP runes, matching the table's visible 76-cell perimeter but *using all 256 cells as the candidate repeated key*, so this gate is not a repeat of the 76-rim experiment. The source does not select the full-table key, a cipher sign, a byte-to-rune projection, or a rejection operation. They are frozen here as a bounded plaintext-producing test.

## The exact deterministic inverse

Let `C_i` be a printed original GP rune index and `K_j` the `j`th 256-period GP key symbol, with exactly one initial clock: first rune uses `K_0`. For sign `s∈{-1,+1}`, the direct plain candidate is `P_i=(C_i+s K_j) mod29`; a forward encoder emits `C_i=(P_i-s K_j) mod29`. If this prospective `C_i` equals the previous emitted ciphertext rune, the encoder skips key entries until the prospective output differs.

For any proposed skip of `d>=1` keys before printing a different `C_i`, every rejected key must have produced the predecessor. Therefore **the skipped key residues must all be equal**, and the first distinct following residue `K_(j+d)` must obey the exact ciphertext-only test

`C_i-C_(i-1) = -s (K_(j+d)-K_j) (mod29).`

That is independent of the unknown plaintext. For each input ciphertext and key position there is **at most one** legal skip branch, since `d` must reach the first distinct projected key; a no-skip branch is also possible. Enumerate both, preserving every original source rune unchanged, source phase zero, and all resulting plaintext vectors. This is a complete finite inverse of the specified single-key-stream rejection rule, without an English score guiding skip selection.

**Original exception:** p55 has **one adjacent equal ciphertext pair at zero-based second-rune index59** (both GP index2, TH). A *strict* no-repeat encoder cannot produce that pair with any key. To avoid using this one observed anomaly as a trivial global rejection, the enumerator permits its literal unskipped output while still enforcing the exact reject-equation for all proposed skips elsewhere. This is a stronger concession to the hypothesis than the strict mechanism permits.

## Results on all 76 original p55 runes

| Byte-to-GP key | Plain formula | Exact key-skip paths | Best decoded GP29 IoC |
| --- | --- | ---: | ---: |
| `byte mod29` | `C−K` | **3** | **0.03824561** |
| `byte mod29` | `C+K` | **14** | **0.03754386** |
| `floor(byte×29/256)` | `C−K` | **4** | **0.03578947** |
| `floor(byte×29/256)` | `C+K` | **14** | **0.04140351** |

All **35** exact original-input paths remain nonprose by their first 28 GP rune transliterations and global coincidence frequencies, even after the doublet exception. The authentic 76-rune prefix of original clear p57 has IoC **0.05964912**, compared with these uniformly shaped candidates. These IoCs and words diagnose only this candidate family, not proof against all possible natural language register transformations. No source key or plaintext was obtained.

**Native solved-text positive:** Encrypt the **first 76 genuine p57 plaintext runes** with the exact same four source-table key projections and signs and the deterministic output-doublet rejection rule. All four plants trigger at least one key skip: `2,2,1,3` positions respectively. The exhaustive inverse recovers the original native plaintext **uniquely** in each case (one original plaintext path per plant), even though other nonsensical inverse skip paths may also exist. Thus the test can reverse a real output-aware cipher and fails on the untouched p55 target for substantive input reasons.

**Reproducer:** [single-file Windows Node.js CommonJS original-source SFT](../sims/lp2_p50_full256_output_skip_p55_sft.cjs). It validates source byte prefix, full p55 length and duplicate location, exact planted positive recovery, all 35 ciphertext-input paths, and per-path scores.

## Decision

The table's 256 source bytes **do not recover p55 as direct GP29 Vigenere under this strict output-aware key-skip encoding**, even when the one real repeated pair is exempted. The dynamic inverse is meaningfully different from the old fixed-clock key test and the perimeter-only skip gate, but it still needs an independently authored operation to become a solve route. A completely unknown high-entropy pad, another source-selected state map, or ciphertext-level preprocessing remains outside the test. Do not expand key phases, alter the table order or invent skipped-symbol exceptions without an independent manuscript clue.
