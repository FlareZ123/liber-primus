# Inter-word carried state: exact all-secret internal equality obstruction

**Agent28, 22 November 2026. Classification: original-source combinatorial theorem with source-native English calibration, not recovered plaintext.** This resolves a bounded architecture in Director [#2247](https://github.com/FlareZ123/liber-primus/issues/2247). The class encompasses **every independently secret GP29 symbol permutation per complete printed word**, chosen from an arbitrarily changing and persistent inter-word cipher state, and also arbitrary **within-word positional permutations**. Neither a guessed key, table, cipher phase, feedback recurrence nor a word nonce is needed for the result.

## Original-source premise and exact all-key theorem

The canonical unknown LP2 pp0–55 contain **12,956 original rune indices and 2,896 complete printed words**, including **83 one-rune words, 448 two-rune words and 32 carried across physical page breaks**. The numeric-only physical p50 has no runes and has no own text segment in the supplied transcription. The SFT removes only original printed line/page wraps and asserts exact equality of all 12,956 parsed runes against the independently indexed canonical source. Complete word boundaries are original hyphens, full stops and printed section delimiters.

For any complete GP29 word P of length L, grant **an arbitrary unknown symbol permutation π_w over 29 rune identities** and an arbitrary **permutation σ_w of its L physical positions**. These may depend on the author's secret seed, the full preceding cipher stream, the source-visible chapter and word ordinal, or any persistent state mutated between printed words. The proposed output C_i=π_w(P_{σ_w(i)}) is reversible for any choice. However bijection implies the exact internal equal-rune pair invariant:

\[
E_w(P)=\sum_{0\le i<j<L}\mathbf1[P_i=P_j]
=\sum_{r=0}^{28}\binom{\mathrm{count}_w(r)}2
=E_w(C).
\]

Position shuffles alter adjacency, but they cannot change any word's multiplicity histogram, the number of *internal equal pairs*, or whether that word contains any repeated rune. The equality holds for every word individually and survives all 29! alphabet choices, all L! slot choices, entirely independent new dictionaries after every word, and all possible inter-word feedback clocks. It covers per-word affine/Vigenère, arbitrarily nonlinear alphabet tables, changing per-word substitution with a true ciphertext-carried secret, and word-local anagramming before substitution. A different permutation at each *rune* inside a word, vector/polygraphic encryption, resegmentation or variable-length coding is outside this theorem.

## Original internal equality fingerprint

| Complete original GP word length | Source words | Internal equal-rune pairs | Words with an internal repeat |
| ---: | ---: | ---: | ---: |
| 1 | 83 | 0 | 0 |
| 2 | 448 | 1 | 1 |
| 3 | 720 | 42 | 42 |
| 4 | 513 | 64 | 61 |
| 5 | 317 | 78 | 76 |
| 6 | 256 | 118 | 102 |
| 7 | 216 | 118 | 97 |
| 8 | 156 | 123 | 95 |
| 9 | 78 | 70 | 52 |
| 10 | 52 | 92 | 46 |
| 11 | 32 | 44 | 26 |
| 12 | 18 | 43 | 17 |
| 13 | 4 | 10 | 3 |
| 14 | 3 | 8 | 3 |
| **Total** | **2,896** | **811** | **621** |

Original equality count splits into **63 adjacent within-word pairs and 748 nonadjacent**. There are 30,281 possible within-word pairs, with iid29 expected **1,044.17** (of which **346.90 adjacent**). The original source's adjacent-repeat deficit is known from earlier reports; the **811-pair invariant plus 621 repeated-word count** establishes a *new key-independent obstruction even when word positions are freely shuffled and a fresh secret alphabet follows every word*. The earlier line/page whole-word collision theorem instead compares equality *between different words*; it does not preclude a word-to-word changing secret table. This test directly addresses that alternative.

## Exact word-length-matched GP-native controls

Three independent checked-in donor texts were GP29 encoded using the historically source-calibrated solved-LP1 orthography, including ING→NG and IO→IA. For each donor, **500** full sequences were sampled with replacement *inside each original word's GP rune-length bin*, with fixed independent XorShift32 seeds and no choice based on original ciphertext or a proposed key. Shakespeare and Emerson have complete 1–14 symbol inventories, so each sample exactly matches **all 2,896 original word lengths** and yields **12,956 runes**. Gibran contains no length14 GP word, so only its **2,893** matching slots were compared, excluding the three unmatched genuine original words, without inventing substitutes.

| Word-length-matched source native GP | Real original equal pairs on same slots | Donor minimum equal pairs across 500 | Donor maximum equal pairs | Donor minimum repeated words |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, 2,896 words | **811** | **1,193** | 1,426 | **780** vs original 621 |
| Emerson, 2,896 words | **811** | **1,206** | 1,406 | **757** vs original 621 |
| Gibran, 2,893 words | **803** | **1,205** | 1,437 | **723** vs original 618 |

**Zero of 1,500** English control books has an equality fingerprint compatible with the original ciphertext. Even the closest full-inventory donor differs by **at least 382** within-word pairs, and every donor's first, nonadjacent, long-word and repeated-word measures exceed the actual same-slot original. These controls are correlated, source-sampled literature, not a theorem excluding every possible deliberately nonrepetitive English manuscript or a second plaintext register. They are a finite native-GP-English test of the complete all-key cipher family.

## True carried-word reversible positive

An independently implemented **GP29 affine cipher with a persistent word-to-word evolving state** takes the preceding *ciphertext* word's final rune, the previous word length and an evolving seed, selects a new invertible multiplier/offset, and applies that one affine alphabet to the next complete word. Initial seed is illustratively 761 mod29 = 7, from the known 2013 title number, without claiming Cicada selected this algorithm. **One-rune and two-rune words carry genuine GP plaintext** without embedded independent nonce overhead. Physical page breaks do not reset the clock. A separate positive also reverses and cyclically rotates each word's rune positions using the same carried state, then applies the new alphabet; the inverse exactly undoes both operations.

Both models fully encrypt, decrypt and reencrpyt every donor's complete native-GP word-shaped plant, including all original 2,896 length slots for Shakespeare/Emerson. They preserve **every source-native donor internal equal-pair count**, with adjacency preservation asserted only for the no-shuffle variant. The same two true changing-state cipher families independently encrypt and decrypt **all 95 native GP runes and 20 words of genuine solved LP2 p57 PARABLE**, preserving its internal repeat counts exactly. Positive roundtrips establish the inverse is implementable and handles the actual short-word / carried-state obstacle. They do not authenticate the historical cipher.

## Result and next causal decision

**Under ordinary GP-native English and unchanged printed word boundaries, an arbitrary secret per-word symbol alphabet with persistent inter-word state, even combined with an arbitrary secret per-word position permutation, is excluded by original ciphertext equality invariants.** More word-alphabet key entropy, more preword nonces or different carry recurrences cannot overcome the missing ~400 internal repeated pairs without changing the operation *inside* a printed word. This is a substantial narrowing of #2247's proposed carried-state path and differs from the previously excluded standalone nonce and static line-dictionary models.

The unselected ingredients are now precise: an **original-source instruction for a genuinely rune-by-rune changing state inside words**, a polygraphic/word-vector operation that changes equality, altered plaintext word segmentation, or an independently justified alternative plaintext register. An authentic decoder must still recover original paragraphs and pass an unseen continuation. No actual ciphertext plaintext, source-authenticated key or final Cicada destination follows from this exclusion.

**Executed original-source reproducer:** [Windows 11 Node.js22 CommonJS SFT](../sims/lp2_carriedword_symbolpermutation_allkey_sft.cjs) and [successful GitHub Actions run 45019887953](https://github.com/FlareZ123/liber-primus/actions/runs/45019887953). All 12,956 original runes are asserted against the independent numeric corpus, as are 2,896 word lengths, 1,500 matched-native sources and 95 first-party p57 positive runes.
