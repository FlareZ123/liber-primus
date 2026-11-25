# Single-writing of consonantal geminates as a plaintext-side GP register

**25 November 2026 · Agent 5 · Director issue [#2737](https://github.com/FlareZ123/liber-primus/issues/2737).** Classification: bounded orthographic and original-cipher negative. No unknown LP2 plaintext or key recovered.

## Decision

Retire the precise conjunction **single-writing normalization + word-preserving p56 prime-minus-one/F-hold receiver at chapter-origin zero**.

The proposed register is easy to define and measurably lossy, but the historical rationale is not a strong fit for Anglo-Saxon practice, the manuscript's own clear-GP prose preserves consonant geminates, and the fixed receiver has no lexical path through even the first four complete words of the original p54 black body. The first four words contain no ciphertext F, so no hidden F-branch choice can rescue them. The same result holds with the raw and normalized dictionaries at zero OOV; a generous three-OOV allowance still dies at word four, before the p54/p55 seam. There is no candidate path to freeze and no p55 prediction.

This closes only this exact register/cipher conjunction. It does not prove that no author could ever use a single-writing convention, and it does not exclude other clocks, ciphers, segmentation rules or source-selected mechanisms.

## Frozen register and source classification

Use the printed GP29 values. Vowels are U, O, I, EO, E, OE, A, AE, Y, IA and EA. The remaining values F, TH, R, C, G, W, H, N, J, P, X, S, T, B, M, L, NG and D are consonants. Within each true word, collapse adjacent identical consonantal glyphs to one. Retain vowel doubles, nonidentical digraphs, punctuation and every word boundary.

Apply this after the established native GP tokenization, including its existing ING→NG and IO→IA alternatives. This is not a free orthographic grammar. The inverse lexicon retains all source spellings; a normalized form is never treated as a unique recovery of its original spelling.

## Historical fit

The 1988–89 reference cited by the issue makes a broad observation about older Germanic runic practice; it does not establish a rule for this modern GP text. Fernández Cuesta's 1994 study of double spelling on the Ruthwell Cross is the more relevant Anglo-Saxon counterpoint: it treats the single-rune-for-geminate pattern as associated especially with Scandinavian inscriptions, notes exceptions, and discusses the prevalence of double runes in Anglo-Saxon material. Neither source establishes author intent.

- [1988–89 reference](https://revistes.urv.cat/index.php/utf/article/view/2306)
- [Fernández Cuesta 1994, Double Runes on the Ruthwell Cross](https://riull.ull.es/xmlui/handle/915/30665)

## Native compliance and information loss

The six clear-GP LP1 pages (physical pages 3, 8, 9, 10, 11 and 14) contain 1,001 runes in 231 words. They have 19 within-word equal adjacent pairs: 16 consonant doubles and 3 vowel doubles. The rule removes 16 runes, affects 16 words and shortens the sample by 1.60%.

Clear LP2 p57 contains 95 runes in 20 words. Its only within-word equal pair is the consonantal NN in the original GP spelling TUNNELNG. The rule removes that rune. This is a direct first-party counterexample to universal single-writing in the manuscript itself.

| Untouched held-out donor | Words | Runes | Consonant doubles removed | Words affected | Length reduction |
|---|---:|---:|---:|---:|---:|
| Gibran | 2,515 | 9,496 | 144 | 142 (5.65%) | 1.52% |
| Shakespeare | 11,082 | 43,571 | 794 | 782 (7.06%) | 1.82% |
| Emerson | 14,974 | 61,788 | 1,040 | 1,011 (6.75%) | 1.68% |

**Symbol support is invariant.** Removing one copy from a repeated pair leaves one copy of that same rune in the word. Therefore no rune disappears from a word or from the corpus; per-word and global distinct-symbol support are unchanged. Frequencies and lengths change, not alphabet support.

The frozen native lexicon reuses the established TextBlob + native-GP register: 10,842 training types from the 80% donor prefixes and target-excluded solved-GP sections, 33,369 external TextBlob forms (both established GP tokenizations), and the 29 single-rune forms. It contains 35,944 raw GP forms and 35,654 normalized forms. The collapse creates 279 normalized forms with multiple raw GP spellings (569 raw variants in those groups). In the TextBlob spelling map, 107 raw GP forms already have multiple English spellings; after collapse, 354 normalized forms have multiple English spellings, including 247 geminate-related groups. Examples include IN/INN, HIS/HISS, OF/OFF, BUT/BUTT, ALL/AL, DESERT/DESSERT and LONG/LONGING. The last collision also illustrates interaction with the existing NG/ING tokenization. Normalization cannot uniquely restore the original Latin or GP spelling.

## Original p54–p55 receiver gate

The source selection is fixed by the image annotation: p54 has a nine-rune red title followed by 223 black body runes; p55 contributes 76 runes. The body-plus-p55 target is 299 runes in 64 true words. The final p54 body word is open at the page edge; p55's first rune completes it. The target has six ciphertext F symbols.

The receiver is exactly the authenticated p56 rule: start at ordinary prime 2, subtract prime[k]−1 modulo 29, and allow plaintext F to pass unchanged without consuming a prime. At ciphertext F, test both the literal-F hold and consuming-non-F branches; at non-F ciphertext, only the consuming branch is legal. No offset, sign, register or boundary is fitted.

The first four complete p54 body words contain no ciphertext F, so their inverse is deterministic:

| Word | Cipher GP tokens | Plain GP tokens under the fixed clock |
|---:|---|---|
| 1 | IA D P NG U W A M | Y NG N S L A H U |
| 2 | T A NG | D AE L |
| 3 | NG TH IA W S H | X L X M NG H |
| 4 | I C | H Y |

None is in either the 35,944-form raw lexicon or the 35,654-form normalized lexicon. Exact reachability gives:

| Lexicon | Arbitrary OOV allowance | Result |
|---|---:|---|
| Raw | 0 | No path at word 1 |
| Normalized | 0 | No path at word 1 |
| Normalized | 1 | No path at word 2 |
| Normalized | 3 | No path at word 4 |

The OOV budget is granted to the p54 prefix alone, so the three-OOV test is at least as generous as three arbitrary words across the complete 64-word target. The first failure occurs before any p54 end-state can be frozen; p55 is therefore not scored.

## Positive and negative calibration

The same implementation forward-replays authentic solved p56 exactly (85/85 runes) and uniquely recovers all 25 known plaintext words under the normalized lexicon.

The clear p57 text supplies a matched native control. Encrypting its collapsed register with the p56 stream gives a unique 20/20-word recovery. Encrypting the uncollapsed source spelling fails at word 5, the NN geminate in TUNNELNG.

Three fresh contiguous windows from the held-out Gibran, Shakespeare and Emerson tails were also tested. Their collapsed plants uniquely recover 78/78, 70/70 and 82/82 words (286, 285 and 291 runes). Matched uncollapsed negatives fail at the first consonant geminate (word indices 10, 2 and 26 respectively). These controls show that the decoder distinguishes the proposed register when it is actually present; they do not validate the register on the original.

## Reproduction and disposition

Run: node sims/lp2_singlewrite_geminate_p54_prime_minus_one_sft.cjs

The standalone Node 22 script reads pinned repository sources, asserts the alphabet classification, lexicon sizes, source spans, positive controls and negative outcomes, and prints machine-readable JSON. The computation was executed in connected JavaScript and then passed the repository's manual read-only Node 22 workflow: [run 45583294315](https://github.com/FlareZ123/liber-primus/actions/runs/45583294315), commit 897f83081d1ec640db2414aa6f840f5e4fcd06d2.

**Disposition:** close #2737 as completed and retire this exact normalization/cipher conjunction. Do not widen the rule into an unconstrained orthographic grammar or tune the prime origin to rescue it.
