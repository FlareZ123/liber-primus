# GP29 predecessor-conditioned secret-row substitutions: whole-book original collision gate

**14 November 2026, Agent 30. Status:** key-independent **observable statistic** with a deliberately bounded, reference-conditional cipher-family exclusion. **No recovered LP2 plaintext, authentic key, or author-selected cipher.** An external source does not yet select this construction.

## Causal hypothesis and strongest objection

The source contains all 29 rune labels but only **86 identical immediate glyph pairs in 12,901 within-page adjacencies**. A plausible, low-complexity changing-alphabet explanation is that the *previous ciphertext rune* selects a secret substitution row. For each page, allow the author an **entirely arbitrary bijection for every possible preceding GP rune**, with independently reset page-IV and fully independent secret rows on every physical page:

```
C[i] = S[page, C[i-1]][P[i]]
```

This model has a valid lossless decoder once its secret tables and IVs are known. It could also use a global row table across the book. Its biggest weakness is that no visual clue or authenticated Cicada instruction selects such a predecessor-row table, and a secret alphabet does not typically flatten the nonuniform plaintext distribution.

Existing singleton-word capacity results [had permitted page-local predecessor rows](../sims/singleton_word_key_capacity.cjs): all 82 same-page-predecessor singleton ciphertext words are compatible with only two possible native GP plaintext singleton values under an arbitrary row permutation. The larger word interiors may impose a stronger constraint. This test examines **all 10,028 within-word within-page transitions**, not another singleton census.

## Exact observable, invariant under every arbitrary secret row

Fix a scope (one global book table or 55 independently keyed physical-page tables). For any eligible original adjacent rune pair, group the *current* rune by **(scope, actual preceding ciphertext symbol)**. For a group `g`, let `n[g,x]` count each current rune. Define

```
R = sum_g sum_x n[g,x] * (n[g,x] - 1)
    / sum_g N[g] * (N[g] - 1)
```

The numerator counts ordered same-output pairs conditioned on one predecessor state. The denominator is all ordered distinct-position pairs in that state. **Every 29-symbol secret bijection, even different per page and predecessor, preserves each group's equal-symbol pair count.** Conditional evaluation avoids guessing any alphabet row. We test (a) all 12,901 same-page adjacencies and (b) only **10,028 inside-word same-page pairs**, which also remains valid if the encoder has a separately handled word-start operation.

Use `resources/lp2-transcription.txt` for authentic word/punctuation/page boundaries and `resources/liber-primus/lp2-corpus.json` for numerical GP indices. The tool asserts 12,956 source runes, 2,896 complete words, the identical canonical rune stream and all 86 doublets. The runeless p50 is excluded automatically.

| Original unknown LP2 measurement | Numerator | Denominator | Collision rate |
| --- | ---: | ---: | ---: |
| Global row table, all within-page pairs | 202,956 | 5,738,428 | **0.0353678743** |
| Global rows, inside words only | 122,268 | 3,467,324 | **0.0352629290** |
| **Independent row table per physical page**, all pairs | 3,838 | 108,018 | **0.0355311152** |
| **Independent row table per page**, inside words only | 2,300 | 65,058 | **0.0353530696** |

The source is extremely close to the uniform GP29 collision benchmark `1/29 ≈ 0.03448276`, even after conditioning on the previous symbol and granting page-specific secret rows.

## Authentically word-length-matched English plaintext plants

Take independently selected real English word tokens from each of three archived corpora: Gibran's *The Prophet*, the first 300k Shakespeare bytes, and Emerson's essays. Normalize to the established GP29 transliteration, using longest rune digraphs and the ordinary `QU→CW, V→U, K/Q→C, Z→S` historical spelling conventions. The deterministic draw replaces **each of all 2,896 original words** with a real source word having exactly its original GP-rune length (lengths 1–14); its original print/punctuation and page placements stay fixed. This is a native-GP English *word register* control, **not a claim to reconstruct genuine English syntax**.

For each of **48** independent native word plants **per corpus**, encrypt the entire **12,956-rune** stream under a separate random secret GP29 permutation for each (scope, preceding-C) row. All **288** complete book/page ciphertexts invert exactly rune-for-rune under their own hidden tables. To enforce the source's conspicuous no-repeat clue even in positives, deliberately assign the predecessor output to the rare GP `J` or `NG` plaintext rune in each row (25%/75% respectively). This gives strong adjacent-equality suppression; the original **86** doublets lie within the page-keyed plant ranges for **all three** corpora. No deliberate suppression was applied to the original ciphertext.

| Word source (48 plants each) | Page-keyed, all-pair minimum / median | Page-keyed, within-word minimum / median | Page-keyed plant doublets, min–max |
| --- | --- | --- | --- |
| Gibran | **0.059449 / 0.063092** | **0.069996 / 0.075636** | 80–120 |
| Shakespeare | **0.058808 / 0.062644** | **0.072867 / 0.076483** | 50–91 |
| Emerson | **0.061746 / 0.063842** | **0.071329 / 0.075369** | 51–86 |
| Actual LP2 | **0.035531** | **0.035353** | **86** |

In **0/144** word-length-matched English controls did either page-keyed score fall to or below the source's flat conditional collisions. The global-book-row controls are also separated: the smallest all-pair rate was **0.061411** and the smallest within-word rate **0.073336**, versus original 0.035368/0.035263. This is an **empirical reference-class gap**, not a distribution-free p-value, and a secret table adversarially chosen around the specific source text was not exhaustively searched.

The experiment directly answers a stronger question than the earlier singleton-row capacity test. The 82 one-rune words alone permit page-local predecessor tables; those tables do not, in ordinary native-English positive controls, explain the almost perfectly flat conditional output distribution across the entire manuscript. The result supports looking for **a running key or genuinely evolving state beyond just the previous ciphertext rune**, or for an intermediate/plaintext register with different conditional frequencies. Such families remain live.

## Reproduction and limitations

- [Exact CJS/Node 22 input, source grammar and 288 reversible controls](../sims/lp2_prev_cipher_row_collision_allsecret_sft.cjs).
- [Successful 14-Nov-2026 GitHub Actions run 43539347553](https://github.com/FlareZ123/liber-primus/actions/runs/43539347553); the JSON includes all 144 control summaries, counts and checks.
- Seeded Xorshift32 base `0x4a11ca34` with per-reference offset `0x1000333`; 48 plants/reference. The three source file paths are encoded in the SFT.
- **Conditional scope:** fixed bijective GP29 row indexed by previous *ciphertext* rune, either shared for the book or independently reset per page. The within-word test also permits an arbitrary distinct word-start mechanism. Changing a row on every word/position, key streams with additional state, an alphabet outside GP29, homophonic/variable-length coding, a transposition, ciphertext-dependent insertions, and atypically balanced or non-English plaintext are not excluded.
- **Key quantifier:** the within-group equality statistic is mathematically invariant under *every* bijective row. The native-English reference outcome comes from random secret-table plants and preserved word lengths, and is **not** a theorem ruling out every adversarial choice of secret rows or every possible English passage.

**Decision:** retire a simple, page-static predecessor-ciphertext permutation as the explanation for the original flatness **within the three controlled native-GP source classes**. This does not itself determine an unknown author's key, operation, or plaintext. Treat an independent historical instruction selecting a changing key-state or a non-GP encoding as the next necessary evidence.
