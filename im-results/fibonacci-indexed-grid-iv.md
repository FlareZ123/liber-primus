# LP2 page-15 Fibonacci selectors into the 256-byte grid: IV and master-key inversions

**Classification:** two source-constrained, independently executed **negative original-cipher decryption tests**. Historical page-15 square and 256-byte grid are genuine source inputs; proposed key roles are hypotheses. Agent 32's section-IV work and Agent 47's master-key/field-step extension were executed 10 November 2026. **Neither recovered an authentic LP2 key, unknown rune plaintext, or destination.**

## Exact source construction and two distinct ways to use it

The authentic page-15 4×4 square gives an independently documented Fibonacci-indexed-prime spiral. Its sixteen successive one-based prime ranks are

`[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]`.

The corresponding ordinary primes, square values `abs(3301−prime)`, and both rank conventions are legitimate finite selectors. LP2 physical pages 49–51 print a 32×8 base-60 table, interpreted as 256 bytes in [the derived source](../resources/liber-primus/base60-grid.json). Read that table in row-major or column-major order, then use sixteen indices chosen from (a) one-based ranks minus one, (b) one-based ranks, (c) prime values, or (d) printed square values, each modulo 256. Exactly **eight fixed 16-byte selections** result. The original square derivation predates this repository; neither choice of selection convention nor downstream key role is authenticated by a solved LP2 passage.

The two cryptographic models assign **different meanings** to those same selections, so their negative results do not duplicate one another.

## Model I: extracted 16 bytes as IV for eight 256-bit grid-column keys

**Decoder:** the table's eight 32-byte vertical columns are candidate AES-256-CTR or ChaCha20 keys for eight fixed ciphertext sections. The extracted sixteen bytes are candidate cipher IVs. The eight section lengths under this model are `[729,1145,1729,1903,1021,1524,1589,3316]`, including the documented nine-rune bridge merge; they sum to all 12,956 original unsolved LP2 runes. Test forward/reversed column keys, modulo-29 or scaled byte reduction, additive signs, both cipher algorithms, and optimize the entire eight-column-to-section bijection by exact dynamic programming.

Fit IV, algorithm and column assignment on only the first **400 runes of each section** (3,200 runes); evaluate the remaining **9,756** with unchanged parameter choices and continued stream offsets. Forty replacement-IV controls independently repeat the full search.

| Original-input measurement | Result |
| --- | ---: |
| Selected IV | row-major / rank one-based, `cbe7a7baed5c0489c550dc7deaed483b` |
| Selected algorithm and columns | ChaCha20, assignment `[2,6,5,3,4,7,1,0]` |
| Training weighted 29-rune IoC | 0.0357628446 |
| **Locked heldout weighted IoC** | **0.0344612464** |
| Wrong-IV holdout mean and maximum (40 replications) | 0.0344791975 / 0.0345986339 |
| Holdout upper-tail against wrong IV controls | 0.609756 |
| Uniform GP reference | 1/29 ≈ 0.03448276 |

A source-derived known-key control encrypts 12,956 independent Shakespeare GP runes with the true IV, AES-256-CTR and eight true columns, including **348** artificially rewritten adjacent ciphertext collisions. The identical fitted search retrieves all true key assignments, IV, cipher direction, and settings; its heldout IoC is **0.0586598399**. The authentic manuscript has neither that signal nor independently readable decrypted words.

[Executable Model I](../sims/fibonacci_indexed_grid_iv.cjs) · [Successful Actions run 42755680789](https://github.com/FlareZ123/liber-primus/actions/runs/42755680789) · [manual workflow](../.github/workflows/fibonacci-indexed-grid-iv.yml).

## Model II: extracted 16 bytes as AES-128 key for a reversible 28-state cipher

**Different key use:** the same eight sixteen-byte selections are now **AES-128 master keys**, with a fixed zero IV/counter. AES-128-CTR generates a pseudorandom byte stream over the 12,956-symbol ciphertext. A distinct original-source mathematical clue, the red GP prime-value sums on physical pages 40, 15 and 53, has quotients `[15,22,78]`. These satisfy `15² ≡ 22`, `22² ≡ 78 ≡ 20 (mod 29)`; 15 has multiplicative order **28** over the 29-element GP field. Those observations provide a finite, explicitly reversible *candidate* 28-step representation. Their use as actual encryption instructions remains an unproven hypothesis.

Within each physical page, plaintext GP index `p_i=28` (EA) is represented by an unchanged previous ciphertext rune; every other plaintext `p_i ∈ [0,27]` encodes a nonzero step

`c_i = c_(i−1) + 15^((p_i+k_i) mod 28) (mod 29)`.

The page-initial rune uses `c_0=(p_0+k_0) mod 29`. Decoding takes `log₁₅((c_i−c_(i−1)) mod29)`, subtracts the matching key value, and retains an explicit EA symbol at each repeated step. There are **86 within-page source doublets** and **55 page initials**; the model represents these without lossy collision overwrites. AES key bytes are reduced by modulo or scaling to 28/29 values, decoded with both signs, book-continuous vs section-restarted clocks and whether EA consumes a key byte. These choices give **8×2×2×2×2 = 128 fully source-fixed models**. The section-reset convention uses the alternative eight-group boundary set `[729,1145,1738,1894,1021,1433,1680,3316]` from the original `#`-delimited transcript; the more restrictive book-continuous modes require no section-boundary interpretation.

**Frozen test:** fit the 128-mode index-of-coincidence ranking to physical pages 0–27 (**6,761 runes**), freeze the top model, then decode physical pages 28–55 (**6,195 runes**) and score only the 28 non-EA, non-page-initial symbols. This 28-symbol score must be compared with **1/28**, not the 1/29 reference used in Model I.

| Original-input measurement | Result |
| --- | ---: |
| Train-winning master key | column-major / rank-one-based, `cb5c796d507a7af0ca9cd1a952442133` |
| Winning settings | sign −, scaled28, book-continuous, skip EA |
| Training 28-symbol IoC | 0.03585024109 |
| **Frozen heldout IoC** | **0.03566307691** |
| Highest heldout IoC retrospectively in all 128 candidates | 0.03586673225 |
| Uniform nonzero-step reference | 1/28 ≈ 0.03571428571 |

No coherent GP-English emerges and neither the selected model nor the retrospective best model produces substantial concentration. The **actual entire source ciphertext re-encrypts exactly** after decoding with the nominated model, proving the transformation is mathematically reversible; this is not evidence the produced symbols are the genuine plaintext.

**Blindly recoverable known-key control:** encrypt an independent late Shakespeare passage, GP-transliterated and held apart from all original ciphertext, with the first extracted AES-128 key under fixed reference settings. The same 128-model search ranks the exact actual model **first** and exactly reconstructs **12,956/12,956 original synthetic plaintext runes**. Its 28-symbol IoC is **0.05884866 on training** and **0.05763717 heldout**, demonstrating decisive detection power for this explicit mechanism and natural GP-English. Thus the negative authentic result does not arise from an inability of the scoring/decoder to recognize source-native text when the candidate is true.

[Executable Model II](../sims/fibonacci_grid_selector_rank28.cjs) · [Successful Actions run 42825870385](https://github.com/FlareZ123/liber-primus/actions/runs/42825870385) · [manual workflow](../.github/workflows/fibonacci-aes128-grid-manual.yml). The script asserts source size, distinct page boundaries, mode count, all repeated steps, planted true-key first rank, exact planted inversion, and exact re-encryption of real ciphertext.

## Consolidated research decision

Both direct candidate uses of the Fibonacci-extracted bytes fail **original-source heldout plaintext tests** under their precise, source-locked modes: the eight 256-bit column-key/16-byte IV interpretation and the complementary eight AES-128-master-key/zero-IV, reversible field-step interpretation. The success of their source-register controls establishes meaningful power for those models. Neither claimed numerical bridge supplies an authenticated original key, and no undeciphered LP2 symbol has been recovered.

These are **bounded exclusions**. Different byte index semantics, secret key material, a keyed derivation, a genuinely different plaintext alphabet or nonperiodic state, correlated unknown substitutions, additional key skips, and independent outer encodings have not been ruled out. In particular the zero-step GP-EA hypothesis is conditional, not a proven mechanism. Further work should first uncover a *specific source-prescribed key consumption or cipher inversion rule* with predictive leverage, instead of extending the same selection menu and reranking noise in a larger search space.
