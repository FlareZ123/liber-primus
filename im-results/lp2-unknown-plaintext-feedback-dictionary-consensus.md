# Unknown 29-entry plaintext-feedback cipher: original dictionary-consensus attack

**Decision, 11 November 2026:** A one-step additive GP29 plaintext-feedback architecture, with an arbitrary secret 29-entry feedback function and independent unknown starting key for every printed word, fails a strong original-cipher cross-word English-consistency test. None of 109 long original words induces a useful globally compatible feedback mapping, while two independently encrypted native-English controls recover mappings across nearly all eligible words. **No unknown LP2 plaintext, key or destination was recovered.**

## Source clue and the proposed inverse

The original 2013 0_wisdom document foregrounds GP rune prime values; the authenticated 2016 continuation says that words provide the map and their numbers indicate the direction. A human solver might therefore inspect a sequential cipher whose preceding plaintext rune controls the next key. A reversible, hypothetical architecture over the 29-symbol GP alphabet is:

C[w,j] = P[w,j] + K[w,j] (mod 29)
K[w,j+1] = K[w,j] + f(P[w,j]) (mod 29).

There is **one fixed but completely unknown function** f from 29 rune indices to 29 residues, with all 29 lookup entries free. The initial K[w,0] can differ arbitrarily at every printed word. The original clues **do not authenticate** this particular cipher; the architecture is tested as a generous possible interpretation.

Subtracting adjacent original ciphertext positions within any printed word removes every unknown initial state:

**f(P[w,j-1]) = C[w,j] - C[w,j-1] - P[w,j] + P[w,j-1] (mod 29).**

For a candidate GP29 plaintext word of the same length, this equation fixes a partial 29-entry f table. Repeated occurrences of one plaintext rune must demand the same f value within that word. Different plaintext words must agree on every table entry they both assign. This is an **exact, key-independent necessary condition**. A correct English decoding should yield multiple mutually compatible word candidates without guessing the actual table or any starting keys.

## Fixed original-input test

The lexicon comprises **12,231 distinct GP-transliterated word types** from the pinned Shakespeare, Emerson and Gibran native-English controls. The canonical original LP2 parser yields **12,956 runes, 2,896 words and 32 cross-page words**. The 109 original words containing at least ten runes are fixed targets, and their 25 words of at least twelve runes are anchors. The length thresholds use only the original visible word segmentation.

All 109 long words yield **4,433** internally consistent lexicon candidates. The 25 longer anchor words have **109** internally consistent partial-table candidates. Each anchor map was compared against every other long word's candidate maps, accepting arbitrary unused table entries and unknown individual word starting states.

| Key-free compatibility statistic | Original result |
| --- | ---: |
| Target words of at least ten GP runes | **109** |
| Anchors of at least twelve GP runes | **25** |
| Internally possible anchor partial tables | **109** |
| Maximum other original target words with any jointly consistent table | **1 of 108** |
| Maximum other words agreeing on three or more shared assigned table inputs | **0 of 108** |

The strongest loose-compatible anchor is an unverified dictionary suggestion, UNAFFRIGHTED, at original canonical word index 376. It supports one other long word only, with fewer than three shared f inputs. **This is not recovered plaintext.** Compatibility of two mappings with zero common assigned inputs can be vacuous; the second, more discriminating criterion explicitly requires at least three shared inputs.

## Strong authentic-language positives

The same decoder and source lexicon were used for both controls, without tuning the algorithm after seeing original outputs:

1. **Original-length-profile native-English plant:** At each of the 109 original long-word lengths, select a real source-English word of exactly that GP rune length. Encrypt with one globally fixed hidden feedback table **f(p)=GPprime(p)+1** and independently varied starting state per word. The decoder fully reenacts every encryption. Without being given the hidden f, the identical anchor test obtains **108 of 108** loose-compatible target words, **107 of 108** agreeing on at least three shared inputs.
2. **Genuinely solved Cicada LP1 text:** GP-encode original solved LP1 English, retaining all 20 true words with at least ten GP runes, including EXPERIENCE, INTELLIGENCE, INSTRUCTION and CONSCIOUSNESS. Only **14 of those 20** are represented in the independently sourced literary dictionary. Encrypt with the same fixed hidden feedback and varying starting states, with exact plaintext/ciphertext round-trip. The identical consensus test obtains **14 of 19** other-word matches at both compatibility levels.

The solved-LP1 positive shows that a realistic incomplete dictionary does not destroy all shared-table evidence when the hypothesis is true, and the length-matched positive demonstrates strong power at the original length profile.

## Distinct ciphertext-rune feedback: a second all-secret lookup

A separate, equally reversible causal interpretation updates the key from **the preceding printed ciphertext rune** rather than the recovered plaintext rune:

C[w,j]=P[w,j]+K[w,j] (mod29);
K[w,j+1]=K[w,j]+g(C[w,j]) (mod29).

Again all 29 entries of g and all per-word initial keys are arbitrary and hidden. This is a genuinely different architecture: the table inputs are printed ciphertext symbols. The independent necessary equation becomes

**g(C[w,j-1])=C[w,j]-C[w,j-1]-P[w,j]+P[w,j-1] (mod29).**

The same independently defined 12,231-GP-English-word lexicon and fixed target profile apply; original results differ:

| Ciphertext-feedback criterion | Original LP2 | Matched-length English plant |
| --- | ---: | ---: |
| Long target words ≥10 runes | 109 | 109 |
| Anchor words ≥12 runes | 25 | 25 |
| Internally admissible anchor partial maps | 741 | 783 |
| Most other long words sharing any nonconflicting g map | **12 of 108** | **108 of 108** |
| Most other long words agreeing on ≥3 shared table entries | **2 of 108** | **79 of 108** |

The source-English positive uses one fixed hidden mapping g(c)=GPprime(c)+1 but different word starting states; all encrypted words decrypt and re-encrypt exactly. As an **independent authentic-language control**, retain 20 original solved-LP1 words of at least ten runes, of which 14 are represented in the external lexicon. After encryption under that same hidden ciphertext-update table and varying seeds, the original algorithm recovers **15/19** loose-compatible other words and **12/19** with at least three shared table inputs. The 15 loose hits include accidental matches: the 12 shared-input hits are the more meaningful comparison with only 14 covered lexicon words.

The best original ≥3-shared agreement involves candidate COUNTERACTED at original index637, compatible with only two other long words. There is **no original cross-word consensus on a single hidden table**, in striking contrast to both controls. These numbers do not mathematically rule out obscure plaintext vocabulary or per-page changes in g, and no surviving source actually prescribes ciphertext feedback.

**Independent executable reproducer:** [unknown ciphertext-feedback single-file SFT](../sims/lp2_unknown_cipher_feedback_dictionary_consensus_sft.cjs). All original-input, full-key-space table-consistency and native-positive assertions were executed successfully against the current eight GitHub-file snapshots.


## Interpretation and next decision

These results strongly disfavor **a fixed global arbitrary plaintext-rune lookup feeding an additive wordwise GP29 key** for ordinary GP-English text retaining the original word boundaries. They are a conditional lexical exclusion, not a mathematical impossibility for all imaginable plaintext. Rare unrepresented vocabulary, a non-GP intermediate alphabet, altered word segmentation, changing f across sections, or additional cipher layers are distinct untested explanations. Fitting a different lookup table to every printed word would remove the historical clue constraint.

This extends the separate [fixed GP-prime feedback test](lp2-prime-plaintext-feedback-allmultiplier-gate.md) without retreading its 28 multipliers: here **all 29 feedback entries remain unknown** and cross-word equality constraints eliminate them without enumeration. The next plausible breakthrough still requires an original-source instruction selecting an actual transport, authentic key or external resource.

**Reproducible SFT:** [sims/lp2_unknown_plain_feedback_dictionary_consensus_sft.cjs](../sims/lp2_unknown_plain_feedback_dictionary_consensus_sft.cjs), a self-contained Node.js 22 CommonJS script reading the unchanged corpus and native source texts. Its full assertions and two independent planted controls successfully executed against eight freshly retrieved GitHub repository-file byte snapshots in the connected JavaScript runtime. It reports every original count and candidate-compatibility score above.
