# LP2 numerical grid as an RC4 source: base60 and base59 original inverses

**Current conclusion, 10 November 2026:** neither supported reading of the printed 32×8 numeric grid produces an authentic LP2 key or readable plaintext under the finite whole-grid and source-aligned per-fragment RC4 source-pad architectures tested here. The executable synthetic controls recover full GP-native plaintext exactly. The result is a *bounded original-input negative* for 1,024 specified configurations, not an assertion that RC4, the numeric grid, or either radix is historically irrelevant.

## Actual source and reversible architectures

Physical LP2 pages 49–51 contain **256 two-glyph tokens**, conventionally serialized as base60 numbers. The printed glyphs do not specify a unique byte interpretation: deleting absent lowercase `f` from the digit alphabet and reading the same tokens in base59 yields another byte-valid stream. These two interpretations differ in **220/256 source bytes**. Their exact ambiguity and prior art are documented by [the source-codec study](lp2-grid-numeric-codec-ambiguity.md); the conventional derived values remain in [the original-token reference](../resources/liber-primus/base60-grid.json). Neither radix is independently identified as a historical key.

For each radix, read the 256 bytes in printed row-major or column-major order and forward/reverse direction. Use the resulting 256-byte vector literally as an RC4 KSA key or apply SHA-256 once to obtain a 32-byte key. There are **8 deterministic keys per radix**. RC4 drops **0/256/768/3072** PRGA bytes and either runs continuously over the 55 physical rune-bearing unsolved pages or restarts at each page. Reduce emitted bytes to a pad from the low eight bits or the high five bits (`byte >>> 3`), with either arithmetic sign.

Two fully specified deterministic inverses are compared:

1. **Additive GP29:** `P_i = (C_i − sign * pad_i) mod29`.
2. **Transparent-EA exponent-step GP29:** first symbol of each page is a literal initialization value; otherwise `P_i=EA` (index28) exactly when `C_i=C_(i−1)`; for unequal adjacent outputs, `P_i = (log_15(C_i−C_(i−1)) − sign*pad_i) mod28` in GF29. This is exactly reversible on ciphertext and synthetic control, and the pad consumes the first-page output too.

These assumptions give **2 radices × 8 keys × 4 drops × 2 page clocks × 2 emitters × 2 byte projections × 2 signs = 1,024 tested configurations**. For every candidate, GP-rune index of coincidence (IoC) is computed independently on actual physical pages **0–27 (6,761 runes)** and **28–55 excluding p50 (6,195 runes)**. Selection uses *only the first interval*; the rest is a within-study, public-corpus heldout. Different original-source experiments across the research population have already inspected these same pages.

## Exact executed results

| Source radix | Top setting selected on first 6,761 runes | Train IoC | Frozen heldout IoC |
| --- | --- | ---: | ---: |
| Base60 | SHA256(column-major reversed grid), drop0, page-reset, high-five pad, sign+1, exponent-step | **0.035429311339** | **0.035222609920** |
| Base59 | SHA256(column-major forward grid), drop0, continuous, low-byte pad, sign+1, exponent-step | **0.035399204802** | **0.035213488645** |
| Independent uniform 29-rune reference | N/A | **0.034482758621** | **0.034482758621** |

The highest original training score across **all 1,024** configurations is the base60 row above, already observed by the preceding base60-only experiment. The alternate radix does not increase the evidence for a native-GP plaintext. The best raw (unhashed) base59 key scored **0.035385289281** on training, **0.035167830150** frozen heldout. The actual recovered sequences remain near-uniform and do not yield independently supported plaintext.

**Blind source-native positive:** GP-encode the checked-in Shakespeare reference, use the complete original 55-page shape, and encrypt with the base59 *literal row-major* key, RC4 drop768, reset at each physical page, low-byte pad, sign+1 and transparent-EA exponent-step emitter. Re-run the entire **1,024-setting** screen without revealing that configuration to the ranking routine. Its highest-ranked planted-text candidate is the true setting; it exactly recovers **12,956/12,956** GP plaintext runes, with train IoC **0.061998767732** and holdout IoC **0.060381743586**. Next-best planted key has only **990** rune matches and train IoC **0.036093011695**. The synthetic exact success tests the inversion and scoring implementation; it provides no evidence of an authentic historical key.

The original finite 512-setting base60-only experiment and its base60 Shakespeare positive are preserved in [original executable](../sims/grid_rc4_field_inverse.cjs) and [manual CI 42800026403](https://github.com/FlareZ123/liber-primus/actions/runs/42800026403). The extended two-radix single-file runner is [`sims/grid_radix59_rc4_inverse.cjs`](../sims/grid_radix59_rc4_inverse.cjs), [successful CI 42834410599](https://github.com/FlareZ123/liber-primus/actions/runs/42834410599), dispatched through the *existing manual-only* [grid regression workflow](../.github/workflows/grid-256-tests.yml).

## Source-aligned 32-fragment / 8-byte row-key RC4 extension

The 31 original 13-dot marks delimit **32 fragments**, exactly matching the 32 printed rows of eight bytes. The first 28 fragments cover all **12,956 unsolved runes**; the final four cover the solved 180-rune tail. This supplies a more specific solve-path hypothesis than treating all 256 bytes as one RC4 key: use row r as an eight-byte RC4 key for fragment r, resetting the RC4 state at each 13-dot boundary. The row-to-fragment mapping and order are fixed by the printed sources; no row permutation or per-fragment offset is fitted.

The first 28 row keys were tested under both byte-valid source readings (base60/base59), RC4 drop 0/256, low-byte modulo-29 or high-five-bit projection, and both additive signs: **16 configurations**. The first 45% of each fragment is the selection interval and the remaining 55% is held out. The best original training result is base60, drop0, high-five, sign+1: **0.034586072760** train IoC and **0.034484839153** heldout IoC, against uniform 1/29 = **0.034482758621**. Its recovered preview remains nonlinguistic. The other configurations do not produce a meaningful language-bearing improvement.

**Blind positive control:** a held-out Shakespeare GP stream is encrypted using the source-fixed base59 row keys, drop256, high-five projection, sign−1, with one RC4 reset per fragment. The 16-setting inverse ranks that exact setting **first** and recovers **12,956/12,956** symbols. This validates the per-fragment implementation and scoring discrimination, not the historical key.

**Decision:** the natural one-row-per-13-dot-fragment RC4 key interpretation is not supported under these 16 source-locked settings. This is distinct from, and now extends, the whole-grid RC4 scan above. It does not rule out a different cipher, a separately sourced state, or another use of the 32×8 table. Do not repeat this exact row-key mapping without new source evidence.

## Scope and research decision

The two source-valid digit alphabets have now both failed **direct** whole-grid RC4 derivation and the natural 32-row/32-fragment row-key mapping, with fixed sign, byte projection and source-defined clocks. Source byte ambiguity does not rescue this already tested architecture under ordinary GP-English assumptions. This test says nothing about RC4 with an independently derived salt/hidden state, prior transpositions, a different spoken-language/alphabet register, variable segmentation, or cryptographic uses of the numeric grid other than the specified 1,024 settings.

Avoid further arbitrary RC4 drops, KDF labels, byte clocks or table traversals absent an independent instruction selecting them. A materially useful successor would derive and freeze a state/key from original source material *before* original-cipher scoring, yield coherent plaintext on real LP2, and exactly regenerate the original ciphertext.
