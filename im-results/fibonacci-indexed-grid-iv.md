# LP2 page-15 Fibonacci selectors into the 256-byte grid: key and clock inversions

**Classification:** three source-constrained, independently executed **negative original-cipher decryption tests**. Historical page-15 square and 256-byte grid are genuine source inputs; proposed key roles are hypotheses. Agent 32's section-IV work and Agent 47's master-key/field-step and keyless-insertion extensions were executed 10 November 2026. **Neither recovered an authentic LP2 key, unknown rune plaintext, or destination.**

## Exact source construction and two distinct ways to use it

The authentic page-15 4×4 square gives an independently documented Fibonacci-indexed-prime spiral. Its sixteen successive one-based prime ranks are

`[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]`.

The corresponding ordinary primes, square values `abs(3301−prime)`, and both rank conventions are legitimate finite selectors. LP2 physical pages 49–51 print a 32×8 base-60 table, interpreted as 256 bytes in [the derived source](../resources/liber-primus/base60-grid.json). Read that table in row-major or column-major order, then use sixteen indices chosen from (a) one-based ranks minus one, (b) one-based ranks, (c) prime values, or (d) printed square values, each modulo 256. Exactly **eight fixed 16-byte selections** result. The original square derivation predates this repository; neither choice of selection convention nor downstream key role is authenticated by a solved LP2 passage.

The three cryptographic models assign different meanings to the same selectors or different key-consumption rules, so their negative results cover distinct finite mechanisms.

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

## Model III: extracted AES-128 keys with keyless mid-word null insertion

An otherwise missed key-clock hypothesis permits exactly **zero or one extra source ciphertext rune per printed word**, inserted anywhere in that word and consuming **no keystream byte**. Such an insertion desynchronizes all subsequent additive decryption until the accumulated count is inferred. This candidate is motivated by earlier, separately published word-length/null-insertion investigations, not established by Cicada's original image or a known key. It is genuinely different from Model II's 28-state EA transducer and Model I's simple additive direct-pad convention.

Use the same eight extracted **AES-128 master keys** with zero CTR IV, signs ± and byte reducers `byte mod29` or `floor(29×byte/256)`: **32 key configurations**. For a ciphertext word of length L, plaintext is either all L runes or the L−1 runes remaining after deleting one arbitrary hidden ciphertext position. Actual plaintext rune `p` emits additive ciphertext `c = (p−sign×K) mod29`; the deleted null rune can be any original GP symbol and consumes **no K**. The hypothesized independent insertion probability is fixed to **0.42 per eligible word** (L greater than one), chosen from existing external word-length hypotheses. A dynamic program jointly infers the cumulative null count (and therefore AES key-stream offset), each within-word insertion location, and the total GP-language likelihood, using a fixed Shakespeare-trained GP trigram model and the explicit null prior.

**Locked original source test:** the first **350** of 2,896 actual cipher words train the selection and estimate the accumulated key drift. Freeze the selected source key, reducer, sign and starting heldout drift before evaluating the following **400 original words**. These 750 printed words contain **3,384 original ciphertext runes**. The hidden null positions within the holdout are inferred afresh by the same predeclared decoder; the source key cannot be refitted. For controls, each of **12 independent random-source replicates** replaces all eight 16-byte master keys and repeats the entire 32-mode training search and frozen heldout test.

| Test | GP word likelihood per printed rune, heldout |
| --- | ---: |
| Real manuscript: best training-selected source key (column-major / rank one-based; sign −; scaled29) | **−3.915314** |
| Wrong-source random-key replicates, same 32-mode selection | range **−3.949526 to −3.844614** |
| Wrong-key replicates equal or better than genuine selection | **7/12** (add-one upper tail **0.615385**) |
| Independently sourced GP-English known-key and 42%-insertion plant | **−2.442961** |

**Positive control:** construct 750 independently sampled Shakespeare/Gibran GP plaintext words fitting the *exact original cipher-word lengths*, insert 314 source GP null runes and encode with a known one of the eight source keys. The decoder ranks the actual 16-byte key, sign and reducer **first of 32**. Its inferred training insertion count is **153**, precisely the independently planted true training count. With the known insertion-position witness, the forward and reverse maps recover **all 3,070 underlying GP plaintext runes exactly** while maintaining every source word length. This validates the hidden-drift implementation and shows a large source-language gap on the genuine ciphertext. The true original key and insertion path were never recovered.

The model tests a single keyless insertion per word, a fixed prior and a standard additive GP29 cipher with a Fibonacci-selected AES128 key. More than one insertion, unknown source keys, key-consuming insertions, collision repair, other language or alphabets, or a different clock/cipher state remain live hypotheses. The negative result is strong for this precise family because the secret extra-rune positions were optimized in both original and synthetic arms.

[Executable Model III](../sims/fibonacci_grid_keyless_null_word_inverse.cjs) · [Successful Actions run 42828945135](https://github.com/FlareZ123/liber-primus/actions/runs/42828945135) · [shared manual workflow](../.github/workflows/fibonacci-aes128-grid-manual.yml).

## Consolidated research decision

All three finite candidate architectures fail **original-source heldout plaintext tests** under their precise, source-locked modes: eight 256-bit column keys with selected 16-byte IVs, eight selected 128-bit AES keys with a 28-state reversible GP-step alphabet, and eight selected 128-bit AES keys under an exact keyless mid-word insertion/Viterbi clock drift. Their synthetic GP-language controls identify the true source keys, and the third model additionally recovers the true inserted-word drift. Neither claimed numerical bridge supplies an authenticated original key, and no undeciphered LP2 symbol has been recovered.

These are **bounded exclusions**. Different byte index semantics, secret key material, a keyed derivation, a genuinely different plaintext alphabet or nonperiodic state, correlated unknown substitutions, more than one within-word null, other null or key-skip grammars, and independent outer encodings have not been ruled out. In particular the zero-step GP-EA hypothesis is conditional, not a proven mechanism. Further work should first uncover a *specific source-prescribed key consumption or cipher inversion rule* with predictive leverage, instead of extending the same selection menu and reranking noise in a larger search space.
