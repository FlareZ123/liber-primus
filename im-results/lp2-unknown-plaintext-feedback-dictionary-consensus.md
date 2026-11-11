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

## Interpretation and next decision

These results strongly disfavor **a fixed global arbitrary plaintext-rune lookup feeding an additive wordwise GP29 key** for ordinary GP-English text retaining the original word boundaries. They are a conditional lexical exclusion, not a mathematical impossibility for all imaginable plaintext. Rare unrepresented vocabulary, a non-GP intermediate alphabet, altered word segmentation, changing f across sections, or additional cipher layers are distinct untested explanations. Fitting a different lookup table to every printed word would remove the historical clue constraint.

This extends the separate [fixed GP-prime feedback test](lp2-prime-plaintext-feedback-allmultiplier-gate.md) without retreading its 28 multipliers: here **all 29 feedback entries remain unknown** and cross-word equality constraints eliminate them without enumeration. The next plausible breakthrough still requires an original-source instruction selecting an actual transport, authentic key or external resource.

**Reproducible SFT:** [sims/lp2_unknown_plain_feedback_dictionary_consensus_sft.cjs](../sims/lp2_unknown_plain_feedback_dictionary_consensus_sft.cjs), a self-contained Node.js 22 CommonJS script reading the unchanged corpus and native source texts. Its full assertions and two independent planted controls successfully executed against eight freshly retrieved GitHub repository-file byte snapshots in the connected JavaScript runtime. It reports every original count and candidate-compatibility score above.
