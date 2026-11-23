# LP2 page-private alphabet-isomorphic repeated-passage gate

**Status: exact restricted exclusion, no new plaintext.** A monoalphabetic 29-symbol substitution that is independent for each physical page preserves equality patterns within any contiguous span of that page. The unchanged 55 unsolved rune-bearing LP2 pages contain **no two within-page 21-rune windows with the same equality pattern**, even after allowing different unknown bijections for each page. This excludes an exact duplicated plaintext span of 21 runes or more *when both instances fall entirely inside individual physical pages* and are each encrypted with one fixed bijective alphabet for that page. It does not exclude evolving alphabets, a nonbijective encoding, transposed plaintext positions, spans crossing page boundaries, or two different plaintext passages.

## Original-source input and exact invariant

- Source: `resources/liber-primus/lp2-corpus.json`, SHA-256 `58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338`, 55 nonempty unknown physical pages, **12,956 runes**. LP2 physical p50 is a numerical table and has no rune sequence.
- Printed separators: `resources/liber-primus/lp2-transcription.txt`, SHA-256 `5e0003aa7f7dde3b238d17c5f964790dbf6bf9db5edacc4a5ec0bad81c6f4bce`. The SFT independently confirms every GP29 rune matches the canonical page-array input. Literal `-` and `.` encode word breaks; `/` only marks a line wrap, which can split a word. All page starts and ends remain intact.
- The equality pattern of a window labels each rune by the ordinal of its first appearance. For example, `X,Y,X,Z` becomes `A,B,A,C`, unchanged by any injective relabeling of the alphabet.
- If two equal underlying plaintext spans are encrypted by arbitrary *page-private but fixed* bijections, the two ciphertext patterns must agree. This is a mathematical necessity, independent of the key. Agreement alone is insufficient evidence of matching plaintext.
- Only windows fully contained within one source physical page were compared. The 32 actual carried words are retained in the source transcription, but a 21-rune span spanning a page break is outside the stated theorem.

## Original window census

| Rune length | Same-page matching pairs | Cross-page matching pairs | Cross-page pairs with identical internal word-break positions |
| --- | ---: | ---: | ---: |
| 20 | 2 | 19 | 0 |
| 21 | 0 | 0 | 0 |
| 24 | 0 | 0 | 0 |
| 28 | 0 | 0 | 0 |
| 32 | 0 | 0 | 0 |

**Longest pattern equality: 20 runes.** All 19 cross-page 20-rune matching pairs have incompatible printed internal word-break masks. Thus, under a page-private bijection which also preserves the source's word boundaries, *even the 20-rune matched pairs cannot represent the same printed plaintext phrase*. This is a page-private shared-register and repeated-phrase exclusion, not an original plaintext decryption.

For each 20-rune collision, the reproducer derives the unique partial ciphertext-alphabet correspondence and attempts an independently untouched next-100-rune continuation. **17 pairs** have at least ten held-out symbols whose mapping was fixed by the header; **all 17 fail**, and the maximum number of held-out symbol agreements across all 19 pairs is only **three**. The other two pairs have too little comparable continuation for a meaningful holdout. One has no errors because its sole next glyph was unseen in the header and therefore unpredicted; it provides no evidence.

A positive test uses the authentic solved p57 GP-rune stream repeated as a source-native synthetic message, encrypted under two independently generated secret 29-symbol alphabets. From a 32-rune header, the fixed mapping makes **83 correct predictions among 100 untouched symbols**, with zero errors. This validates the mapping detector and holdout test; it is explicitly a synthetic control.

## Calibrated conditional null

The SFT generates **256** deterministic independent page-wise MCMC controls. Each copy preserves page length, all 29 rune counts per page, all **86** original adjacent-equal locations within pages, the entire printed boundary mask, and the first and last rune of each page. It uses 12 page-lengths worth of constrained swaps per page, with 9.73896 accepted swaps per source rune per replicate. The controls are a conservative conditional emission baseline; they are not a guessed creator algorithm.

| Statistic | Original | Control mean | Control median | Control range |
| --- | ---: | ---: | ---: | ---: |
| Cross-page 20-rune pattern matches | 19 | 17.347656 | 15 | 2–92 |
| Cross-page 21-rune pattern matches | 0 | 2.636719 | 2 | 0–15 |
| Cross-page 20-rune matches with identical word-break masks | 0 | 0.003906 | 0 | 0–1 |

For the original 20-rune collision total, the Monte Carlo add-one upper-tail is **0.3385214**. The original absence of 21-rune matches occurs in **17.1875%** of controls. The absence of word-aligned 20-rune matches occurs in **99.609375%** of controls. Thus, the observed shorter coincidences are consistent with source-calibrated constrained random layouts; there is no evidence for a shared hidden plaintext register.

## Causal decision

Retire searching for a **copied exact ≥21-rune passage within two physical-page intervals under a secret fixed alphabet per page**. The model has no original matching shape to anchor even a hypothetical alphabet transfer. Searching more candidate plaintext quotations cannot reverse this exact invariant for that model.

The negative does **not** constrain the important changing-state, private multirune block, word-reset, or space-changing cipher classes. Any future shared-plaintext proposal using a different architecture needs an independently source-selected operation and a held-out original-cipher prediction.

## Reproduction

- Original-input Windows-compatible single-file test (Node 22 CommonJS): [`sims/lp2_page_private_equality_shapes_original_sft.cjs`](../sims/lp2_page_private_equality_shapes_original_sft.cjs).
- Manual workflow: [`.github/workflows/agent14-page-private-equality-shapes.yml`](../.github/workflows/agent14-page-private-equality-shapes.yml).
- Successful run: [GitHub Actions run 45094193759](https://github.com/FlareZ123/liber-primus/actions/runs/45094193759), 2026-11-23, all assertions passed.
- No original LP2 plaintext, authentic key, or intended destination was recovered.
