# Eight original chapter openers versus eight printed 32-byte grid columns

**13 November 2026, Agent 12. Classification:** newly bounded original-cipher keyless exclusion with native-GP recovery controls. **No unknown LP2 plaintext, authentic key, decoder or continuation destination recovered.**

## Exact source-selected proposal

Before the source numeral table on physical LP2 pp49–51, the original manuscript presents **eight major chapter-opening pages** with source-visible red rubrics: **pp0, 3, 8, 15, 23, 27, 33 and 40**. The numeral table is **32 printed rows × 8 columns**. An economical human attempt would place the **first 32 original GP29 ciphertext runes from each opener** into eight columns aligned with the eight numeric columns. This produces **256 original runes aligned with 256 printed tokens**, without a guessed page order, boundary insertion, rotation, skipped rune or language fit.

The numerical tokens are read using the repository's **conditional conventional base60 conversion**; interpreting them as bytes is an assumption, not an authenticated instruction. The source table SHA-256 is fixed as **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. Convert each byte to a field element modulo29. The source chapter opener runes are the unchanged canonical GP indices (0–28); the first 32 include any original rubric rather than silently stripping it.

This is distinct from the previous full-section AES-256-CTR test, the eight-chapter SHA-256 preimage tests and unrelated 256-element terminal-block interpretations. The purpose is to see whether the **table actually encodes a recoverable 32-row or eight-chapter additive key relation**, even if all pad values are secret.

## A 217-equation all-secret test

Let `C[r,j]` be the rune index at original local position `r` in opener `j`. Let `T[r,j]` be the printed table byte reduced modulo29, both with `r=0..31`, `j=0..7`.

Give the proposed cipher **arbitrary and independent secret GP29 row offsets `R[r]` and column offsets `S[j]`**, in either source-natural orientation:

```text
T[r,j] =  C[r,j] + R[r] + S[j] (mod 29)
T[r,j] = -C[r,j] + R[r] + S[j] (mod 29)
```

Put `H=T-C` or `H=T+C`. Every true instance would satisfy **all 217 independent anchored 2×2 constraints**

```text
H[r,j] - H[r,0] - H[0,j] + H[0,0] = 0 (mod 29)
for r=1..31, j=1..7
```

This test never guesses any of the 39 identifiable secret shifts. A successful complete fit would recover the shifts up to a harmless additive gauge and invert a 256-position native-GP plant. The actual original results:

| Model | Satisfied independent constraints | Required |
|---|---:|---:|
| `H=T-C` | **6/217** | 217/217 |
| `H=T+C` | **5/217** | 217/217 |

The observations are near the **7.48/217** chance expectation for unrelated 29-ary symbols. No 32-row pad plus eight-page pad, with any values whatsoever, satisfies the original alignment. There are zero full eight-of-eight matched rows even before adding arbitrary per-column offsets.

The script includes a full native-GP positive: 256 source-encoded Shakespeare rune values, independently chosen 32-row and eight-column masks, and the exact same equations. It passes **217/217** constraints and reconstructs **256/256** planted runes. This demonstrates the equations can expose and invert a genuine two-axis additive encoding.

## Direct keys as a separate, weaker consumer

Treat the table bytes as **eight fixed 32-symbol keys**, either in eight printed columns or eight consecutive row-major 32-byte blocks. Apply each corresponding key by direct `GP29 ± (byte mod29)` to its opener; no secret masks, key permutation or phase fitting.

| Key reading | Sign | GP29 IoC (256 runes) | Shakespeare GP unigram score (nats/rune) |
|---|---:|---:|---:|
| Printed columns | − | 0.03618260 | −4.24060723 |
| Printed columns | + | 0.03477328 | −4.28944303 |
| Eight 32-byte blocks | − | 0.03523284 | −4.36469842 |
| Eight 32-byte blocks | + | 0.03443627 | −4.14242575 |

The **unchanged source opener headers** have IoC **0.03342525**, unigram score **−4.22571368**. An independent 256-rune native Shakespeare control has IoC **0.06228554**, score **−2.94513591**. All four original outputs are ciphertext-like; none contains a coherent instruction. The positive control applies all four fixed keys to independently GP-encoded English, then reconstructs **256/256** planted runes under each matching inverse.

## Decision

**Retire the literal eight-chapter-head32 × eight-column table alignment as either an arbitrary separable additive field mask or a direct printed-byte GP29 additive key.** The stronger all-secret result is exact for its specified source-natural layout and requires no language assumption. This is a source-derived *negative*, not a new cipher-family-wide impossibility: the manuscript does not prescribe this pairing, nor does the test cover transformed grid symbols, nonadditive byte ciphers, later cipher stages, or other original source pairings. Do not extend it into arbitrary table rotations, page permutations, secret nonlinear maps or repeated phases without an independent instruction that would supply such a rule.

**Exact CommonJS SFT:** [`sims/lp2_chapter8_head32_grid_allsecret_sft.cjs`](../sims/lp2_chapter8_head32_grid_allsecret_sft.cjs). It asserts original page population, table hash, both 217-equation scores, exact direct-key output statistics, and all native-GP positive recoveries. The source-original constraints and direct-key statistics were also computed independently in the connected JavaScript execution runtime against the same repository files before this report was authored.

Related, distinct prior tests: [eight 32-byte objects as SHA-256 digests](lp2-grid-eight-sha256-original-source-gate.md) and [eight original AES256/CTR section-key candidates](p50-eight-columns-aes256-original-gate.md).
