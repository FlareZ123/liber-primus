# Five-back ciphertext echoes cannot be a single reserved plaintext rune under source-native English words

**Agent31, 14 November 2026. Decision: key-independent, source-conditional exclusion of one lossless five-back transport family; no unknown Liber Primus plaintext, actual encryption key, author-selected operation or destination recovered.** [Exact original-input and complete positive inverse](../sims/lp2_lag5_reserved_rune_triple_word_sft.cjs) · [Passing manually triggered Node22 run 43609954086](https://github.com/FlareZ123/liber-primus/actions/runs/43609954086).

## Source-clue and alternative

Original LP2 pp0–55 print **12,956 ciphertext runes** in **2,896 complete printed words**, including line/page-carry words. The source has **104 within-word equalities at five-rune lag among 2,105 possible positions**, with **nine contiguous equal-lag pairs** and one three-rune five-back copy. The five-dot illustration motif and solved p57's explicit instar language make a word-relative five-step memory worth examining, but no Cicada source commands this decoding rule.

A simple yet broad *lossless five-back marker* mechanism takes the first five plaintext runes of each printed word as an unconstrained initialization and, at positions j>=5, uses the ciphertext value C[j−5] as the special output for a single fixed plaintext rune m. The remaining 28 GP symbols map bijectively to all 28 other ciphertext outputs. **Every other output permutation may be secret, differ independently at every position, and depend on arbitrary external state.** More precisely:

    C[j] = C[j−5]  if and only if  P[j] = m.

This family can generate a flat-looking ciphertext alphabet and reproduce five-step echoes without revealing a key. Its simplest implementation is a reversible preceding-output-exclusion rank coder with a per-word, per-position 28-way key. This differs from the already tested five-phase fixed alphabet (where C[j]=C[j−5] means P[j]=P[j−5]), lag-five additive unknown phase keys, and adjacent-rune repeat sentinels.

The central drawback is an entirely key-independent consequence: **a run of three consecutive five-back ciphertext echoes forces a run of three identical plaintext runes**, with no way to repair it by choosing m or secret permutations.

## Exact source-original certificate

The original printed word **2722** (zero-based among all 2,896 whole words), on **physical LP2 p51**, at local rune offsets **43–50**, is:

    ᛋᛞᛝᚷᛚᛋᛞᛝ
    S D NG G L S D NG

It has eight GP29 runes, so within-word five-back comparisons exist exactly at positions j=5,6,7. All three equalities hold: the final three runes duplicate the opening three, with no page-boundary ambiguity. For **every one of the 29 possible fixed reserved plaintext runes m**, **every** cipher satisfying the above if-and-only-if rule therefore requires:

    P[5] = P[6] = P[7] = m.

Two independently checked native-English controls were encoded using the repository's source-attested GP spellings, including single **ING→NG** and **IO→IA** runes:

| Control | Source word tokens examined | Tokens with exactly 8 GP runes | 8-GP tokens ending in three identical GP runes |
| --- | ---: | ---: | ---: |
| Shakespeare first 300k characters | 55,407 | **2,328** | **0** |
| Pinned TextBlob frequency lexicon | 29,164 lines | **4,331** | **0** |

All **6,659 length-matched tokens** fail that one necessary original-cipher word shape. This is **an exact finite-lexicon exclusion** for unmodified printed-word native GP-English prose, with no key fitting or probabilistic model. The two lexicons overlap and their raw sample counts are not independent trials. This does not prove that no unusual invented word, Old English word, compressed source, changed word boundary or other text register could contain the forced triple.

## Invertibility and decision

The standalone CommonJS test consumes the unchanged canonical LP2 corpus and continuous transcript, independently checks **all 2,896 words / 12,956 runes**, **104/2,105** five-back events, the exact p51 eight-rune witness and the dictionary negatives. For a real encryption/decryption plant, it samples source-native English GP words of every original printed word length, leaves each first five symbols as initialization and uses separate deterministic secret 28-way permutations at later positions. Three distinct reserved symbols (F, E and EA) each produce exact **12,956/12,956** recovered GP symbols. Their **2,105** positionwise echo/marker equivalences per plant are asserted, **6,315** in all. This demonstrates that real prose can be encoded by the proposed general cipher, while the **specific original witness** is inconsistent with both native-English lexicons.

The model's all-secret conclusion is stronger than a failed choice of prime clock or specific source key: the original p51 witness is unchanged under every nonrepeat codebook. The original transcript contains other five-back matches; the book-wide doublet suppression still needs explaining.

**Retire the fixed single-plaintext-rune iff five-back ciphertext copy interpretation for intact GP-native English words.** Do not replace the marker separately at three adjacent positions or insert a second cipher solely to preserve this hypothesis. A future route could consider five-back equality as plaintext-to-plaintext equality, a true multi-rune backreference, or unrelated local artifact, conditional on independently recoverable historical instructions or key material. No LP2 unknown plaintext was identified.

Reproduce on Windows Node22: node sims/lp2_lag5_reserved_rune_triple_word_sft.cjs. Read-only and self-contained apart from the existing pinned source files and documented helper imports.
