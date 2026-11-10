# Exact arbitrary predecessor-row source-crib inversion on the original LP2 pages

**Classification: completed conditional known-source search, with complete synthetic positive inversions. No unknown LP2 plaintext, actual Cicada key, general cipher mechanism or destination was recovered.** This experiment searches for copied historical source passages while granting the unknown cipher substantially more freedom than monoalphabetic substitution.

## Question and exact cipher family

Could an entire unsolved physical page be a contiguous source excerpt encrypted with a secret substitution table selected by the **immediately preceding ciphertext rune**? For each physical rune-bearing page, admit an entirely independent secret key consisting of **29 arbitrary permutations** over the 29 Gematria Primus symbols:

```text
C[0] = arbitrary page IV
C[t] = S_page[C[t-1]][P[t]]        (t >= 1)
```

This is a lossless model: knowing the row tables recovers every plaintext symbol after the page IV and reproduces every ciphertext rune exactly. We do **not** constrain the 29 rows by the numeric grid, prime sums, word lengths or one another. We allow a new 29-row key at every page, so failure is an especially permissive exclusion of a literal historical quotation within this model. The plaintext source's first GP symbol is not constrained because C[0] is an IV.

For any proposed source alignment, there is an exact necessary-and-sufficient key existence test. For each fixed predecessor glyph `a=C[t-1]`, the observed pair `(P[t],C[t])` must be part of a **bijection**. Therefore:

- Identical `(a,P[t])` may not produce two different ciphertext symbols.
- Identical `(a,C[t])` may not arise from two different plaintext symbols.

If no contradiction occurs, fill the unused input/output positions in each row with any remaining one-to-one assignments. This completes **29 full permutations** and exactly re-encrypts the putative page. Thus the test directly solves the existence question for **all** possible unknown row keys, without trying any key values.

For speed, repeated directed ciphertext edges `(C[t-1],C[t])` impose equality requirements on their proposed plaintext runes. Checking these requirements first safely reduces the number of source windows requiring a full table-consistency test. The final result still inspects **all** alignments, with no probabilistic screening, heuristic threshold or candidate-pruning error.

## Exact original-source exhaustive search

Input: the canonical [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), physical pages 0–55, omitting the runeless table page 50 and solved pages 56–57. The **55** cipher pages contain **12,956 original ciphertext runes**. The four fixed source editions, already stored in this repository, are normalized to native GP tokens with the published QU→CW, V→U, K→C and Z→S spelling rules. Their spaces and punctuation are ignored: candidates may start and finish anywhere in the source rune stream.

| Complete source edition | Native GP runes | Exact original page-49 matches |
| --- | ---: | ---: |
| [Solved LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt) | 3,736 | 1 |
| [Shakespeare](../resources/control/shakespeare_first300k.txt) | 218,800 | 24 |
| [Gibran](../resources/control/gibran_prophet_58585.txt) | 63,114 | 8 |
| [Emerson](../resources/control/emerson_essays_2944.txt) | 324,630 | 29 |
| **All four** | **610,280** | **62** |

All **55 × 4 = 220** source/page combinations and **33,513,796** legal contiguous source windows were examined. Exactly **62** complete row-key-consistent matches survive, **all on short physical page 49** (66 ciphertext runes). The other **54 physical pages have zero exact full-page matches** across all four editions. The result includes pages with red marked passages and the 2014 section boundaries; neither layout type is removed.

The 62 short-page matches are **ambiguous key fits**. Page 49 has only **two independent duplicate-directed-edge equalities** and its 65 transitions constrain 63 unique row entries out of a possible 841. Its 62 matching source excerpts have unrelated English contents and individually admit completed exact permutation keys. The historical puzzle supplies no reason to privilege any of them. Even the solved LP1 text produces one such accidental fit. They are **not** recovered plaintext, keys or evidence that a source quotation appears on page 49.

The no-match claim is finite and definitive only for the exact four stored editions, contiguous GP reading and the stated row-cipher model. It does not cover an unseen book or manuscript, changed transcription, different language encoding, added/deleted nulls, plaintext interleaving, secret clocks or higher-order cipher state.

## Full synthetic inverse and sensitivity

The [reproducer](../sims/previous_cipher_permutation_source_crib.cjs) additionally creates a wholly independent **55-page synthetic manuscript** with exactly the original 55 page rune lengths and a held-out Shakespeare source excerpt on each page. For each page, a seeded xorshift32 generator (`0x1729cc01`) shuffles **29 independent unknown predecessor-dependent GP29 substitution rows**. The rows send GP EA to the predecessor glyph, so they naturally produce a sparse repeated-output state, and otherwise permute the 28 non-self outputs.

Without knowing the generated secret tables or planted offsets, the identical exhaustive source scanner recovers **the exact true source offset on every one of the 55 pages**. For every recovered true alignment it constructs a *new* complete 29-row key only from the plaintext/ciphertext constraints and **exactly re-encrypts all published synthetic runes**, including every first-page IV. These assertions are independent of the original puzzle's zero-hit conclusion. The positives test that this scanner can actually identify and invert genuine copies under the declared highly flexible cipher.

The complete scanner, original-source cardinality assertions, page-49 survivor counts, all planted offsets and all exact forward re-encryptions **passed** in [manual GitHub Actions run 42837027262](https://github.com/FlareZ123/liber-primus/actions/runs/42837027262). The corresponding [manual-only workflow](../.github/workflows/previous-cipher-source-crib-manual.yml) never runs on ordinary commits.

## Implication for decryption research

The proposed architecture would make cribbing an unknown 29×29 secret substitution table from a sufficiently long verbatim passage straightforward **without a single guessed key byte**. The experiment closes that route for literal, contiguous excerpts from these four source editions on 54 original pages. Page 49 is too short to establish identity under such an enormous key family. Future searches should supply a historically justified **new source text** or a **different cipher architecture**, then demand a recovered coherent plaintext and exact forward re-encryption. These results should not be reported as a solution to LP2.
