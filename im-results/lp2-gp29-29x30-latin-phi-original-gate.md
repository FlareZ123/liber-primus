# Lossless 29-rune to 30-Latin-letter block transport under the known prime-totient clock

**Agent 6, 22 November 2026.** Bounded original-cipher test on two untouched LP2 chapters. **No previously unknown plaintext, author-selected Latin key, or endpoint recovered.** This is a specific reversible mechanism and negative test, not a claim that Cicada used the construction.

## Independent human clues and genuinely different inverse

Cicada authenticated positional BASE29 arithmetic in 2013, and the historical Gematria Primus chart contains **29 distinct runes**. Every 29-rune positional base29 integer has a unique **30-digit base26** representation, with no loss of information or need to invent punctuation or digraph escape masks. The inequality 29^29 < 26^30 supplies exactly the required width. Convert every original 29-GP-rune block independently, using A=0,...,Z=25 in fixed-width Latin26. The source chapter beginning selects the start. A final shorter group of r original runes consumes the least base26 width whose capacity is at least 29^r. The strict reverse decoder reconstructs the exact r source runes including leading zero values; values above 29^r are explicitly rejected.

This block/radix candidate differs from both the already rejected **greedy literal digraph renderer** (im-results/lp2-prerune-latin26-divinity-original-geometry-gate.md), which fails to reconstruct 175 original source words, and Director #2264's **full-book 2042-bit quotient sidecar**, whose Latin remainder remains flat. The proposed 29-block opcode is still **unauthenticated**: source alphabet size alone does not tell a human to pack a block of 29, reset at each visual chapter, or decrypt in Latin26.

The independently solved original physical p56 gives an actual source-derived mathematical key operation. Its full **85 GP29 source ciphertext runes** decrypt exactly with successive prime(k)-1 modulo29, while the single literal F at source offset56 remains clear and does not consume a prime (84 successive prime shifts). The report's **new hypothesis**, explicitly distinct from that authenticated GP29 use, is to subtract successive prime(k)-1 **modulo26** from the Latin26 block stream, starting at the chapter's first Latin letter. No key or starting phase was fitted to unknown LP2 text.

## Actual untouched receivers

| Original GP29 chapter | GP runes | Expanded Latin letters | Resulting Latin26 index of coincidence | Decoded Latin blocks outside GP29 codebook |
| --- | ---: | ---: | ---: | ---: |
| Physical p16–21 | 1,613 | 1,669 | 0.038372178231 | 5/56, block indexes 4,7,13,45,55 |
| Physical p40–53 | 3,008 | 3,112 | 0.038492239578 | 14/104, block indexes 0,2,19,39,40,51,63,64,74,89,92,93,95,103 |

Both complete Latin26 decrypted source streams have near-random unigram statistics and no sustained readable plaintext. Every original ciphertext rune, including all original leading zero digit values and the final partial block, roundtrips exactly under the fixed Latin encryption and BASE26→BASE29 inverse.

The 19 decoded Latin blocks outside the image of the 29-rune codebook are exact contradictions **only for a model that requires plaintext to be stored as GP29 via the same radix codec**. An intended direct Latin plaintext need not have a GP representation. No authenticated first-party clue selects the pre-rune Latin26 key, so even a language-looking substring would require independent validation.

A genuine solved LP2 p57 native-source **87-rune** segment can be encoded, encrypted under the frozen Latin phi candidate, represented as new GP29 ciphertext, and recovered exactly **87/87**. Yet the same source's final 8-rune block overflows the GP29 codeword range after forward Latin encryption. This independently demonstrates that the proposed codec is not closed under arbitrary Latin substitution without an unprovided rejection/escape rule.

## Decision

Retire this exact 29-to-30 original-source BASE29/BASE26 encoding plus p56-derived Latin prime-totient receiver. It has an executable, testable forward inverse, but predicts nonprose on two disjoint long ciphertext chapters and has incomplete source-domain closure. Further arbitrary block starts or Latin passwords would be postselection. The unresolved route needs a **first-party 26↔29 framing and value-changing algorithm**, ideally with a genuine independent plaintext prediction. Direct GP29 encryption remains a viable rival.

**Reproducer:** sims/lp2_gp29_29x30_latin_phi_source_sft.cjs. Read-only Windows-compatible Node22 CommonJS, asserts exact p56 historical positive, all original source positions and block boundaries, source-native 87-rune p57 plant, the complete original re-encryption, and domain exclusions.
