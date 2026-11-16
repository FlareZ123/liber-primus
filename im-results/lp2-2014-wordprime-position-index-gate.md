# 2014 word-GP-value × rune-position prime-index hypothesis

**Classification:** bounded original-input negative for one source-motivated word-local cipher. **No unknown LP2 plaintext, authentic key, or continuation recovered.**

## Historical motivation and scope

The pinned original 2014 #cicadasolvers log records a 7 May participant conjecture that a word's Gematria Primus value and a rune's position might jointly select a prime value or the index of a key/cipher rune. The adjacent claim relates a cipher-rune prime to a plaintext-word GP value. This is period-origin solver speculation, not a Cicada-authored instruction. See resources/external/2014-cicadasolvers-freenode-log-corpus.md, original lines 170978–983.

Agent6's earlier word-pointer study tested a different construction: after a word was decoded, its GP-prime sum advanced or reversed a continuous p56 key cursor. This test instead freezes one direct position-index interpretation of the 2014 suggestion. It does not repeat the cursor experiment.

## Frozen, reversible candidate

For each candidate plaintext word \(P=(P_0,\ldots,P_{m-1})\), let

\[
S=\sum_{j=0}^{m-1} \operatorname{GPPrime}(P_j)
\]

be the sum of its GP prime weights. Set a word-local key cursor \(q=0\). For each plaintext rune:

- If \(P_j=F\) (GP index 0), emit \(C_j=F\) and do not advance \(q\), using the authentic p56 transparent-F convention.
- Otherwise select the one-based prime \(p_{S+q}\), set \(K_q=(p_{S+q}-1)\bmod29\), emit \(C_j=(P_j+K_q)\bmod29\), then increment \(q\).

The word sum includes F; the key cursor does not. The cursor resets at each canonical printed word. No key offset, sign choice, alternate prime-index convention, page reset, fitted substitution, or additional cipher layer is introduced. The formula is a concrete interpretation, not a claim that the 2014 participant specified these details.

Because \(S\) depends on the unknown plaintext word, the direct test enumerates candidate words from a fixed dictionary, computes their GP encoding and prime sum, encrypts each candidate with the frozen rule, and checks for exact equality with the original ciphertext word.

## Original source and parser

The test uses the unchanged 12,956-rune p0–55 canonical corpus and the canonical word-boundary contract already used by the repository: explicit punctuation and hyphens separate words, while slash line wraps and page boundaries may occur inside a word. The parser matches all **12,956/12,956** original rune indices and recovers exactly **2,896** printed words.

Source Git blob identities are pinned in the reproducer:

- resources/lp2-transcription.txt: 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7
- resources/liber-primus/lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- resources/control/english_wordfreq_textblob.txt: 140e1d22b5f8c45deddd2e8b25549d9d6307d938
- resources/control/shakespeare_first300k.txt: 94c677ad9dd50771c6670e0c4e4dad9052b46d85

The dictionary contains **29,157** alphabetic entries. GP spelling uses the repository's established greedy digraphs and aliases (TH, EO, NG, OE, AE, IA, EA, plus the existing K/Q/V/Z normalizations).

## Results

| Original word length (GP runes) | Original words | Words with at least one exact dictionary match |
|---:|---:|---:|
| 1 | 83 | 53 |
| 2 | 448 | 85 |
| 3 | 720 | 21 |
| 4 | 513 | 2 |
| 5 | 317 | 0 |
| 6 | 256 | 0 |
| 7 | 216 | 0 |
| 8 | 156 | 0 |
| 9 | 78 | 0 |
| 10 | 52 | 0 |
| 11 | 32 | 0 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |

The candidate rule yields **161** matching original words, all of length one through four. It yields **zero matches for all 815 original words of six or more runes**. The few short hits are isolated possibilities, not a sentence or a recovered plaintext register. There are also no matches among the 317 five-rune words.

## Positive control and dictionary sensitivity

The same frozen encoder was tested on 1,000 source-native Shakespeare words of at least six GP runes, selected only when the exact word occurs in the fixed dictionary. All **1,000/1,000** planted words are returned by the exact dictionary inverse.

The dictionary contains **8,615 of 11,194** (76.96%) Shakespeare long-word tokens after the same GP normalization. Thus the zero original long-word matches cannot be explained simply by the dictionary lacking nearly all ordinary source-native English vocabulary. This remains a finite English-dictionary test; it does not establish that the unknown plaintext must be Shakespearean or even English.

## Decision

Retire this exact direct position-index interpretation: plaintext word GP value is the sum of its GP prime weights; key index is that sum plus the count of preceding non-F plaintext runes in the same word; key value is the p56 prime-totient residue; transparent-F/no-key-advance behavior is used; original printed word boundaries are preserved.

Do not rescue it with offsets, alternate signs, arbitrary word resets, a changed prime convention, or new dictionary fitting. The 2014 message does not uniquely specify those alternatives. This negative does not reject every use of word values and rune positions, ciphertext-derived word indices, non-English registers, changed segmentation, or other stateful ciphers. A successor needs an independent original clue that selects the additional operation before the ciphertext is scored.

## Reproduction

~~~sh
node sims/lp2_2014_wordprime_position_index_sft.cjs
~~~

The script verifies the four pinned Git blob identities, checks the canonical transcription against the original rune corpus, executes the exact candidate and dictionary search, and validates the 1,000-word positive control. It has no third-party dependencies.
