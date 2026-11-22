# LP2 preceding-word prime-sum compass traversal of the original 32×8 table

**Agent42, 13 November 2026. Conclusion: one fully specified, reversible source-motivated navigation cipher fails to recover linguistic plaintext from the 12,956 original unknown runes.** No authentic key, destination, or partial decrypted unknown text. This is a bounded original-cipher test and does not exclude other, independently instructed uses of the printed 32×8 table.

## Selection of one human-plausible decoder

The original 2014 LP1 *Some Wisdom* stage uses the sum of the first-29 Gematria Primus prime weights for each printed word. The signature-verified 2016 text states: “Its words are the map, their meaning is the road, and their numbers are the direction.” LP2 original pp49–51 print an **eight-column by 32-row** table. It is therefore possible to propose a single literal reading of those instructions as word-prime-sum compass navigation over the table. This remains an analyst-selected interpretation: neither the signed message nor the page explicitly demands a torus, byte-to-rune reduction, initial position or starting direction.

The proposed operation is **causal, deterministic, invertible, and parameter-free after the declared reading choices**:

1. Load all original pp0–55 GP ciphertext words using the canonical parser, preserving line wraps, **32 cross-page carried words**, punctuation and the rune-free p50. The original holds **2,896 complete words and 12,956 runes**.
2. Interpret the 256 two-digit printed table entries under the already established **hypothetical base60 reading**; use each resulting byte modulo29 as a GP29 key candidate.
3. Walk the 32×8 table as a wrapped rectangle, beginning at row0, column0, initial direction **north**. Subsequent word directions are the **previous ciphertext word's GP-prime weight sum modulo8**, with conventional clockwise values 0=N, 1=NE, 2=E, 3=SE, 4=S, 5=SW, 6=W, 7=NW. Advance exactly one grid cell before reading each rune's key.
4. Decode each rune as \`P=(C-key) mod29\`; encode as \`C=(P+key) mod29\`. The plus convention on encoding matches the already-solved p56 prime-totient additive cipher. Only the earlier **ciphertext** word changes the next direction, so both encoder and decoder have the same state and no guessed plaintext is required.

The CJS [reproducer](../sims/lp2_wordprime_compass_grid_causal_sft.cjs) pins the source and performs exact full-text round trips. The [manual-only workflow](../.github/workflows/lp2-wordprime-compass-grid-causal.yml) [passed in run 43379378885](https://github.com/FlareZ123/liber-primus/actions/runs/43379378885) on Windows/Node 22, checkout at original pushed commit \`d22d4eb39b5f4e4e02241d32894f10b90cc08ae3\`.

## Native-GP positive control and actual original output

The positive control is a source-independent 12,956-rune greedy GP transliteration of the existing Gibran *Prophet* reference, repartitioned at the **exact 2,896 original word lengths** so the model receives the same segmentation capacity. Encrypt the plant under the stated cipher and then invert it, without supplying plaintext or state to the decoder. Every rune recovers exactly. The wrong reversed grid does not recover the plant.

| Measurement | Original ciphertext | Native GP plant | Native encrypted plant | Original after proposed decryption |
| --- | ---: | ---: | ---: | ---: |
| GP29 global coincidence index | **0.0344783978645** | **0.0604207048671** | **0.0345809687010** | **0.0344711888315** |
| Within-word adjacent equal-rune pairs among 10,060 | **63** | **308** | **330** | **358** |

Both real and planted ciphertext have near-uniform symbol marginals, so marginal ciphertext coincidence alone does not distinguish them. The exact original inverse **does** restore a more ordinary number of adjacent repeats (358) but **fails to recover the native-GP marginal distribution** (0.03447 versus plant plaintext 0.06042). The first 80 decrypted GP symbols have no authentic phrase. The source result remains ciphertext-like, with full round-trip intact. Reversing the table, or shifting its halves by 128, yields similarly nearuniform original decoded coincidence indices (printed in the CI result).

The findings are stronger than a vague score failure: an authentic English GP plant with matching symbol count and word boundaries is perfectly reversible under this exact word-prime/table-walk mechanism, whereas applying that same mechanism to original runes yields no identifiable language despite a direct original re-encryption. The script asserts all source word counts and both round trips, and logs its first 80 decrypted symbols.

## Decision

This independently testable **previous-ciphertext-word prime-sum compass cipher** has **no positive original plaintext evidence**. It is not a solution, and the corpus gives no reason to adjust compass order, grid start, torus wrapping, sign, byte mapping or direction state to optimize scores. In particular, do not rescue the family by enumerating many unselected compass variants. A materially new decipherment route requires **a source-supplied change of operation/key** or a real original-plaintext crib that selects the state. This result is conceptually distinct from the already rejected simple previous-word GP29 Caesar shift and from self-indexed single-word row/column lookup.
