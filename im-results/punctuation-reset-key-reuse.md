# Sentence- and page-reset common substitution: key-independent collision test

**Status: scoped negative on original LP2 ciphertext, with powered synthetic English control. Agent 38, 10 November 2026. No plaintext, key, or verified mechanism recovered.**

## Proposed mechanism and invertible invariant

Consider a segmentwise reset in which, for the same absolute offset `t` following a printed full stop or physical-page break, `C[s,t] = sigma_t(P[s,t])`. Each `sigma_t` is an **arbitrary bijection of the complete 29-rune alphabet**, independently different at other `t`, yet reused across segments `s`. Repeated source symbols at a fixed offset must yield repeated ciphertext symbols at that offset, without knowing the key, substitution table or even the particular rune labels. This model subsumes absolute-offset repeating/additive pads, affine position-specific maps, and any unrestricted 29! independent substitution row per offset, provided they reset identically across the tested segments.

For the first 64 runes of each segment, let `n_t` be the number of segments reaching position `t` and `h[t,r]` the number carrying ciphertext rune `r`. The score

`Q = sum_{t=0}^{63} (sum_{r=0}^{28} h[t,r]*(h[t,r]-1) - n_t*(n_t-1)/29)`

is twice the positional equal-rune-pair excess over a flat 29-rune baseline. The first term is **exactly invariant** under an independently arbitrary full-alphabet output permutation at each offset. Higher `Q` means cross-segment repeated letter identities, as strongly expected from shared GP-English position-specific character distributions. The subtraction is constant for a fixed layout and only centers the result.

Three independently source-defined segment boundaries were tested, always preserving the exact original 12,956 unsolved runes: full stops (175 segments), physical page boundaries (55), and the union (219). Printed line wraps and ordinary hyphen word boundaries are retained *inside* segments, with only runes contributing to offsets. The rune-free physical page 50 is absent, and both solved final pages are excluded.

## Executed original-source experiment

For each boundary type, generate 3,000 independent null transcriptions by rotating all rune labels within every intact segment by an independently selected random mod-29 offset. This rotation preserves that segment's complete rune multiset, all internal repeated-rune relationships and immediate doublets, and its length and original punctuation placement. It breaks shared rune labels across reset positions, as needed to test a common output-key phase. It does **not** preserve cross-segment rune adjacency, and the test does not model a specific keyskip or T6-repair generator.

| Prespecified reset | Segments | Observed Q | Null mean ± SD | Original z | Nulls at least as high | Add-one upper-tail p |
|---|---:|---:|---:|---:|---:|---:|
| Period only | 175 | 93.0345 | 3.7551 ± 259.4390 | 0.3441 | 1087 / 3000 | **0.36255** |
| Physical page only | 55 | 83.5172 | −0.8248 ± 111.1416 | 0.7589 | 696 / 3000 | **0.23226** |
| Period or physical page | 219 | 308.3448 | 7.3015 ± 306.5711 | 0.9820 | 505 / 3000 | **0.16861** |

None has a positive signal outside the matched null; even the most favorable of the three has upper-tail p ≈0.169 before correcting the choice of boundary type.

## Positive mechanism controls

Independent Shakespeare GP-runic plaintext fills the **exact original length** of each segment, starting after 30,000 encoded reference runes. Encrypt using a **new random 29! bijection at every absolute offset**, fixed across all segments, and independently replace 81% of adjacent tentative repeated ciphertext symbols with a distinct random symbol. These substitutions retain no conventional letter-to-rune marginal relationship.

Every control is vastly stronger than every original input. In the three row orders above the planted Q values are **25,511.0345**, **4,907.5172**, and **36,996.3448**, with z **97.23**, **42.94**, and **116.31** against independent 3,000-permutation nulls; all have 0/3000 exceeding the control. The original-page layout plant has **86** surviving adjacent ciphertext repeats, matching the total observed 86 in real LP2, despite the much greater positional collision score.

These controls establish substantial power against *this precise reused positional bijection on ordinary GP-English* while incorporating aggressive immediate repeat suppression. They do not demonstrate power for all plaintext codebooks, all bijective block ciphers, concealed segment offsets, symbol insertion/deletion, nonidentical per-section keys, or arbitrary multistage rewrite channels.

## Cryptanalytic decision

The unmodified LP2 input lacks the positional equality that a common substitution reused at every sentence or page reset generates on GP-English, even when independently permuting all 29 outputs at each absolute character position. A simple "the same substitution schedule restarts at every sentence/page" route is unsupported, and further fixed-key brute-force searches in that *same* model are low priority. The original-source negative does not establish a universal impossibility for sentence-local or page-local encryption.

**Exact reproduction:** [CommonJS experiment](../sims/punctuation_reset_collision_invariant.cjs); [successful manually dispatched GitHub Actions run 42784132723](https://github.com/FlareZ123/liber-primus/actions/runs/42784132723). Canonical source SHA-256: `5e0003aa7f7dde3b238d17c5f964790dbf6bf9db5edacc4a5ec0bad81c6f4bce`. JS script asserts 12,956 original runes, exact segment counts, and positive-control empirical p under 0.01 for each tested boundary type.
