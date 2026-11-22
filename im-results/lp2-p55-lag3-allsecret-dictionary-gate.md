# P55 three-back difference: all-secret substitution cannot explain its 13-rune word

**Agent 17, 18 November 2026. Original-input, key-independent native-word obstruction.** The original LP2 p55 ciphertext remains unreadable; this is a bounded, genuinely new negative for the previously reported p55 third-back frequency anomaly, not recovered plaintext or an identified author cipher. The source-motivating lag3 observation and the provisional THOR interpretation are prior work in [the original p55 lag3 report](lp2-p55-thor-lag3-difference-candidate.md); the present contribution tests **all 29! secret substitutions** implicitly, without enumerating keys or fitting text.

## Why the operation was considered

The independently solved p57 arithmetic suggests THOR as an exploratory three-rune keyword. The original p55 third-back ciphertext difference is more concentrated than its untreated ciphertext: IoC **0.0525114** over 73 differences. A natural next question is whether the third-back difference already represents GP-native English under an unspecified **one-to-one secret alphabet**, rather than pursuing a fitted cascade of ciphers. Such a permutation preserves exact symbol equalities independently of its 29! unknown assignments. We test only this motivated family and its word-reset alternative.

## Exact necessary condition

Physical p55 is the final encrypted page and contains **76 authentic runes in 17 printed word fragments** with source lengths

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

The word at zero-based page offsets **23–35** has all 13 ciphertext runes distinct. Define the already proposed `D[i]=(C[i]-C[i-3]) mod29`. The source-derived global third-back differences on that entire word are

`[16,21,25,26,11,19,16,24,23,7,16,7,4]`.

Their equality pattern, where each new symbol receives the next integer, is

`[0,1,2,3,4,5,0,6,7,8,0,8,9]`.

Under an arbitrarily secret, fixed GP29 permutation `P[i]=pi(D[i])`, **every plaintext thirteen-rune word must have this exact equality pattern**. The test is independent of the secret permutation, its construction and the output rune identities.

To grant an even more favorable reset, let the cipher restart at *each printed word*, and allow its first three plaintext positions unconstrained. The other ten genuine third-back differences at positions 26–35 are

`[26,11,19,16,24,23,7,16,7,4]`

with equality pattern `[0,1,2,3,4,5,6,3,6,7]`. An independently secret permutation **on this single word** must preserve this ten-rune suffix equality. This is a stronger concession than sharing one key over a whole page or chapter. The original 13-rune word has its single literal ciphertext **F at p55@25**, within those three deliberately unrestricted positions. Consequently the word-reset obstruction already permits any treatment of that glyph as a copied F or an encrypted symbol under the separate solved-p56 convention; no assumption about a hidden F clock is needed for this word-local necessary condition.

## Exhaustive source-native English gate

Pin `cmudict==1.1.3`. It contains **117,493 unique purely alphabetic word spellings**. Examine all **2,876 words with 13–28 Latin letters**, including common longer words that may contract to exactly thirteen GP runes. The matcher checks every optional segmentation into native GP digraph/trigraph tokens `TH, ING, NG, AE, OE, EA, EO, IA, IO`, as well as uncontracted individual Latin letters. It also independently grants the conventional loose normalization `QU→CW, V→U, K→C, Z→S`, including both unnormalized and normalized spellings. The pattern matching is conservative: it permits raw spelling letters that do not have a literal GP rune, thus expanding rather than shrinking potential matches.

| Cipher interpretation | Raw alphabetic word spellings | Loose GP-folded spellings |
|---|---:|---:|
| Global lag3, full 13-rune pattern | **0** | **0** |
| Word-reset lag3, first three plaintext symbols free, 10-rune suffix | **0** | **0** |

## Disjoint historical-language controls

The repository also contains three source-pinned word registers independent of CMUdict. Running the same fixed equality-pattern criterion on all vocabulary entries yields:

| Additional native word source | Unique source vocabulary | Full 13-rune pattern matches | 10-rune word-reset suffix matches |
|---|---:|---:|---:|
| TextBlob English word-frequency list, optional GP contractions | **29,157** | **0** | **0** |
| Eight-book Latin Vulgate raw Latin26, optional GP contractions | **7,309** | **0** | **0** |
| Eight-book Latin Vulgate pre-encoded GP29 whole words | **7,305** | **0** | **0** |

The Latin GP29 file contains **39,835 word occurrences**, representing **7,305 distinct GP29 word types** after duplicate removal; its independent known-vocabulary equality profiles directly match the source alphabet. The lexical exclusion now covers two English word sources and Latin Vulgate, within their documented bounded registers. It still does not rule out arbitrary invented words or all languages.

This is a **complete all-secret-key exclusion** *conditional on* the frozen cipher family, original printed word boundaries, and this English vocabulary. Even granting a fresh unknown bijection separately for the 13-rune word cannot overcome the missing lexical equality pattern. It does not exclude a non-dictionary proper name, foreign-language text, a separate transposition or an independently selected different cipher.

## Positive and exact reproduction

A planted 13-rune **DETERMINATION** word is encoded using a seeded, undisclosed-in-the-inverse GP29 alphabet permutation, plus the same third-back feedback and three seed glyphs. The exact inverse reconstructs all 13 plaintext runes, and the same pattern gate accepts it under both global and word-reset modes. This shows the lexical test is not a universal rejector.

[Read-only Python3 SFT](../sims/lp2_p55_lag3_allsecret_dictionary_sft.py) checks the original p55 indices by SHA256 `9a991437b541673c35cca0ba877eddee719c6fad7ec68c495100d2e27c61529f`, parses every source printed word, validates exact ciphertext, computes both source patterns, and checks both normalizations against the pinned dictionary. [Manual Windows workflow](../.github/workflows/agent17-p55-lag3-word-gate.yml) provides an independent original-repository execution.

**Research decision:** retire the seemingly tempting “THOR/lag-three difference, then a secret substitution alphabet” explanation for ordinary GP-native English at p55, including a separate word-reset cipher. A later candidate must supply an *independently justified additional operation* or evidence that the 13-rune original word is outside the tested native vocabulary. The original p55 third-back IoC by itself is not a decryption signal.
