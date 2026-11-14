# Direct plaintext-predecessor GP29 lookup: original all-secret consensus gate

**Status, 14 November 2026:** an exact original-cipher negative for a particular simple stateful encryption architecture. The original does not recover any authenticated LP2 unknown plaintext, creator key, authored operation, or puzzle destination. The source-native positive decrypts correctly and the independent Windows Node22 implementation passes [Actions run 43626694562](https://github.com/FlareZ123/liber-primus/actions/runs/43626694562).

## The causal question and distinct mechanism

LP2 has 12,956 unknown ciphertext runes spread over 2,896 original printed words, but only 86 adjacent identical runes. Earlier Cicada stages establish a 29-rune alphabet and printable GP prime values. A minimal *hypothetical* way to hide native GP rune frequency while retaining a deterministic reversible one-step cipher is to let the **previous plaintext rune** choose the offset of the current printed rune. For each complete source-printed word `w`, use:

```text
C[w,0] = (P[w,0] + initialWordShift[w]) mod 29
C[w,j] = (P[w,j] + f(P[w,j-1])) mod 29, j>=1.
```

The function `f` is an **entirely arbitrary secret 29-entry table**, globally shared. Every word has its **own unconstrained initial offset**, giving this architecture much more key freedom than a single page or chapter seed. Given the table and each word's initial offset, the inverse is sequential and exact. The original Cicada texts do **not** direct a solver to use this recurrence.

This family is deliberately distinct from the existing `C=P+K; K_next=K+f(P_prev)` [cumulative-feedback gate](lp2-unknown-plaintext-feedback-dictionary-consensus.md). In the direct model, `f(P_prev)=C_j-P_j`; in the cumulative model the required entry also contains `-C_{j-1}+P_{j-1}`. A negative for either one does not logically imply the other.

## Key-independent plaintext consistency test

For any candidate source-native GP29 plaintext word `p` of the exact printed length and original ciphertext word `c`, every eligible position `j>=1` forces precisely:

```text
f(p[j-1]) = (c[j] - p[j]) mod 29.
```

A repeated plaintext predecessor that demands two different outputs makes that candidate impossible, irrespective of the hidden initial word shift. Any two candidate words that share inputs to the same **global** `f` must agree on the associated outputs. This allows an exact partial-key consistency attack across different printed words with no permutation search and no fitted cipher key.

The input is the unedited [original 55 rune-bearing unknown pages](../resources/liber-primus/lp2-corpus.json) and [canonical word parser](../sims/lp2_word_pages.cjs), retaining all **32 cross-physical-page words**. The corpus has **2,896 words**; restrict to the **109** with 10–14 runes, length histogram **52, 32, 18, 4, 3**, and choose the **25** words with at least 12 runes as candidate anchors, without selecting them by model performance. The dictionary has **29,157** source-encoded TextBlob word types, with source-correct single-rune **ING** and **IO** spellings and the standard published GP transliteration.

| Exact comparison | Original LP2 | Source-native planted cipher |
| --- | ---: | ---: |
| Eligible original-length words (10–14 runes) | 109 | 109 |
| All per-word internally consistent lexical maps | **18,170** | **18,378** |
| Maps among the 25 anchor words (≥12 runes) | **400** | Calibrated within test |
| 14-rune words without any dictionary-compatible map | **3/3** | **0/3** |
| Maximum other long words compatible with a single anchor table | **1 / 108** | **108 / 108** |
| Maximum other long words compatible across ≥3 shared assigned entries | **1 / 108** | **108 / 108** |

The best original 3-shared-match anchor is a **hypothetical**, source-dictionary word `UNPROFITABLE` at original printed word index167 (zero-based). It agrees with **one** other long word, which is insufficient to identify plaintext or a table. Original 14-rune words at indices **754, 1353, 2341** have no candidate in the finite dictionary under any table assignments. These are coverage-relative facts, not proof that unknown English words could never work.

The positive plant selects real independent dictionary words of **each original 109 word lengths**, uses one fixed, genuinely non-affine lookup `f(x)=(7x^3+11x+4) mod29` with **different first-rune keys per word**, and encodes all subsequent positions. The exact known-key inverse reconstructs all 109 planted words; independently, the **same key-blind** anchor procedure obtains 108/108 cross-word matches without being told the lookup function. This positive checks the model's recoverability on truly GP-native words of the actual source lengths, not merely the arithmetic of a ciphertext roundtrip.

## Decision

One unrestricted global 29-entry **direct plaintext-predecessor offset table**, even with 2,896 freely chosen first-rune keys, has no coherent long-word native-English decode on the original manuscript under the stated 29,157-type dictionary. A small, key-independent cross-word consistency check is sufficient to reject it as the next ordinary-GP-English solution path. Its near-random ciphertext is unhelpful as a positive selector.

Remaining possibilities include a different language/register, missing dictionary words, a table changing by chapter/word, a non-additive step law, changed printed boundaries, or additional encoding. None is authenticated by an instruction selecting this direct model. A productive successor must first specify an author-selected key/state rule and recover actual plaintext from the unchanged original ciphertext; adding unconstrained exceptions solely to save this model has no evidential basis.

**Exact implementation and test:** [Windows/Node22 single-file SFT](../sims/lp2_direct_plainprev_lookup_consensus_sft.cjs), invoked only by [manual workflow](../.github/workflows/lp2-direct-plainprev-lookup-manual.yml). [Successful complete original/positive run 43626694562](https://github.com/FlareZ123/liber-primus/actions/runs/43626694562). The original 29-entry table is never estimated or disclosed because no original global table satisfying the native-language consistency constraints was found.
