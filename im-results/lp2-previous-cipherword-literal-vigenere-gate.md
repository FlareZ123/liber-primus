# Previous ciphertext word as the next Vigenère key: original LP2 inverse gate

**Agent18, 15 November 2026; Director #984. Bounded negative, source-motivated but not author-selected. No original unknown plaintext or key.**

## One historically plausible, exactly reversible rule

The historically solved 2014 Cicada stages employed GP29 Vigenère word/phrase keys, and the authentic January 2016 signed continuation points to words and numbers. One minimal interpretation is to take the **entire immediately preceding published ciphertext word as the next printed word's Vigenère key**, cycling shorter words across longer. This is a hypothesis; **no signed source explicitly instructs a previous-word key handoff** (see the [prior historical audit](lp2-word-prime-feedback-historical-precedent-gate.md)).

The frozen model over complete printed GP29 words is

```text
C[0,j] = P[0,j]
C[w,j] = P[w,j] + C[w−1, j mod length(C[w−1])] mod 29   (w>0)
P[w,j] = C[w,j] − C[w−1, j mod length(C[w−1])] mod 29   (w>0)
```

The first word has an empty previous key and is transmitted unchanged. The key is the previous **ciphertext** word (available to both encoder and decoder), as in a causal self-keying construction. Whole words remain intact across original line wraps and **32 physical-page carries**; physical pages do not reset the key. All 29 GP indices participate. The sign is source-compatible with historical GP Vigenère subtraction; no F-interrupter ambiguity is introduced in this particular model. The model was frozen before examining plaintext scores.

## Exact original-cipher result

The original manuscript contributes **2,896 typographic words / 12,956 GP runes**, with **83 one-rune words**. The decoder yields:

| Exact test | Untouched original LP2 decode | Source-native GP plant |
| --- | ---: | ---: |
| Recovered GP runes with exact forward recipher | 12,956 (algebraic identity) | **12,956 / 12,956 true plaintext** |
| GP29 index of coincidence | **0.0344477982** | **0.0601644327** |
| Dictionary matches of 2,896 GP words against the combined pinned three-source native lexicon | **103 / 2,896 (3.56%)** | **2,896 / 2,896 (100%)** |
| One-rune words decoded to A/I/O | **11 / 83** | **70 / 83** |

The native control plant is sampled from source-orthography-encoded **Gibran, Shakespeare and Emerson** tokens, matched to the exact original rune-word length inventory. The source lexicon also contains unusual one-rune GP spellings beyond A/I/O; the A/I/O fraction is a conservative ordinary-English readability diagnostic rather than a claim of an absolute language law. **The full dictionary failure and flat original GP29 distribution** are separate, stronger evidence that this exact model does not decode original native-GP prose. Re-enciphering the original output is expected for any reversible model and cannot prove the historical key.

The entire original-input code, original source and native control assertions passed under Windows Node.js 22: [successful CI run 43665154772](https://github.com/FlareZ123/liber-primus/actions/runs/43665154772), [source-exact SFT](../sims/lp2_previous_cipherword_literal_vigenere_original_sft.cjs). The prior intermediate Windows runs 43664914095 and 43664985755 exposed and corrected two **test assertion** errors (initial-word default and the actual one-rune source dictionary); they did **not** change or tune the cipher formula. The final run independently records the full metrics above.

## Decision and remaining input

Retire this **single literal preceding-ciphertext-word Vigenère recurrence** for the original source-preserved GP29 word stream. It fails credible original plaintext on the whole book and specifically cannot map the 83 different ciphertext singletons to ordinary English one-rune words. Neither the 2016 sentence nor the prior successful GP word-key ciphers establishes any next-word handoff; the **missing typed selector is the rule connecting a particular word's value to the next word's key, including when its clock starts and whether printed breaks survive encryption**.

The failure is **not** evidence against independently source-specified context-dependent keying, changed word segmentation, meaningful non-GP payloads, or an external key. In particular, there is no justification to extend this branch into word hashes, arbitrary rotations, alternate prime-valuations, free seeds or a Vigenère sign search. Related existing negatives are [previous ciphertext prime-sum Caesar](lp2-previous-cipher-wordprime-original-inverse.md), [word-prime nonce with ciphertext feedback](lp2-previous-word-prime-nonce-original-gate.md), and [previous plaintext word modulo28 step](lp2-previous-plainword-log28-source-gate.md).
