# Nine original red headings: common periodic-key exact lexical gate

**Agent 7, 14 November 2026. Source-conditional negative, zero recovered unknown LP2 plaintext.** The nine major red headings comprise 113 original GP29 runes in 23 printed words. No shared periodic Caesar/Vigenère key of length **1–16** can turn **all 23** original heading words into words of the frozen 29,157-entry TextBlob/Norvig English lexicon under either tested key clock. The finding follows from one or two exact original words without fitting a secret key.

## Visible clue and proposed cipher

The manuscript distinguishes nine visually delimited headings using red ink and thirteen-dot paragraph markers. A human could hypothesize one short GP29 key operating on this prominent register, perhaps of period 16 because the separate p15 square has sixteen cells. This remains a hypothesis; no original instruction authenticates a shared title key. The titles are the fixed nine-unit register in [the earlier title-word source test](lp2-ordered-red-heading-source-phrase-gate.md). That earlier test used arbitrary *different* monoalphabetic substitutions per heading against six known source texts. The present gate asks whether a single shared period key, even wholly unknown, could encode native dictionary words across the original red headings.

For ciphertext rune C and native-GP plaintext rune P, proposed encryption obeys C[i]=(P[i]+K[phase(i)]) modulo29. Both additive sign conventions are included because K ranges over every residue. The two source-defined clocks are (a) concatenate all nine red headings into a 113-rune stream, skipping the intervening black body, and (b) restart the key at index zero for each heading. A heading's internal printed words do not reset the key. For both clocks, grant every period k=1,...,16, all key values and phases, and two historical source-compatible GP orthographies, representing ING as one NG rune or as I+NG. Candidate English words undergo K→C, V→U, Z→S, Q→CW and canonical GP multigraph encoding. Printed word boundaries are preserved.

Source-backed locations (physical page : local rune start, exact word lengths):

| Original red title | Printed GP-rune word lengths |
| --- | --- |
| p0:0 | 8 / 5 |
| p3:0 | 2 / 11 / 3 |
| p8:0 | 4 / 8 |
| p15:9 | 4 / 2 / 5 |
| p23:0 | 2 / 6 / 3 / 5 |
| p27:0 | 3 / 12 / 4 |
| p33:0 | 2 / 8 |
| p33:91 | 3 / 5 |
| p40:0 | 3 / 5 |

All nine ink spans and 113 rune values come unaltered from the canonical original LP2 corpus and source red-ink inventory.

## Exact original-cipher certificate

Two source words suffice: original **p3 local2–12**, the eleven-rune middle title word, and original **p27 local3–14**, the twelve-rune middle title word. For each candidate lexicon word of exactly the same native-GP rune length, derive every required key residue C−P at the positions' actual key phases. If a phase recurs inside the word but demands two different residues, discard that candidate. This yields the *complete* finite set of individually compatible partial secret keys.

To combine two words, compare their partial keys on the phases both words constrain. If no common-phase projection agrees, no shared secret key can map both source words into the lexicon. The test needs no exhaustive enumeration of 29^16 secret keys, heuristic language score or selected word guess.

For **both clock modes** and **both GP orthographies**, all original-input cases give:

| Shared-key period | Exact necessary-condition failure |
| --- | --- |
| **1–8** | The original p3 eleven-rune word has zero compatible English dictionary candidates |
| **9** | The original p27 twelve-rune word has zero compatible dictionary candidates |
| **10–16** | The two long words have individually compatible dictionary candidates but zero pairs with mutually consistent key phases |

At k=10 with ING-as-NG, the p3 word admits **62** individually compatible dictionary candidates and p27 admits **2**, with no compatible pair. At k=16 the corresponding counts are **1,563** and **852**, still with no compatible pair. With NG-only spelling they are **1,632** and **884**, again incompatible. This yields an exact obstruction for the proposed full 23-word interpretation.

**Positive control:** Twelve source-shaped native-GP test headings use exactly the 23 original word lengths and deliberately hidden short keys for periods 1, 9 and 16, each under both clocks and both orthographies. The same candidate/projection test admits each planted shared key. These successful models demonstrate discrimination within the stated cipher family and do not authenticate the original-Cicada cipher.

## Stronger independent result: any secret monoalphabet on one p27 title word

The exact printed twelve-rune middle title word at original **p27 local3–14** has this *equality pattern* (first occurrence of a rune receives consecutive labels): **0,1,2,3,4,5,0,6,7,8,9,0**. Thus its first, seventh and twelfth rune positions repeat the **same glyph**, while each of the other nine glyphs is distinct.

Every invertible, fully arbitrary substitution of all 29 source rune identities preserves this repetition pattern, even if the entire p27 title or this single word receives its own independent secret 29! key. The exact source-fixed TextBlob/Norvig dictionary contains **zero** words whose GP29 spelling matches the p27 twelve-rune length *and* this equality pattern, using either of the NG/ING authentic spelling conventions. This is a stronger direct necessary-condition obstruction than the bounded 1–16 periodic additive-key result: **even a freely chosen 29! monoalphabetic key for this single word cannot turn it into a word in that entire finite native-English lexicon**.

The stand-alone gate checks the literal source pattern, scans all lexicon words of the corresponding rune length, and confirms a planted 29-symbol-permutation encryption of a true twelve-rune source word remains detectable through its unchanged equality pattern. It follows that rescuing an ordinary dictionary reading requires an independently justified *nonstationary/stateful transformation*, a different source language/word register, or a change to the printed segmentation. The current evidence does not authorize any particular rescue.

## Decision and limitations

This is an **English-lexicon-conditional exclusion** for a sharply specified historical cipher interpretation. It is not a theorem about arbitrary English words, punctuation alterations, historical languages or text outside the 29,157-entry dictionary. Other plausible choices remain untested: a clock advancing through black body runes, a distinct key per heading, a key longer than sixteen, different word boundaries, a transposition layer, a changing-state cipher or compressed intermediate text. Period sixteen is permitted by the test without asserting that the p15 square instructs it.

Retire the simple common short-period **additive GP29 heading key** under these finite assumptions. Renewing this family without an independent historical operation, key-state rule or source-backed output register is low value. All **12,956** unknown original LP2 ciphertext runes remain undeciphered.

**Exact reproducer:** [single-file CommonJS source-native test](../sims/lp2_red_heading_shared_periodic_lexicon_sft.cjs), reading [the complete original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [red-ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [the frozen 29,157-word lexicon](../resources/control/english_wordfreq_textblob.txt).
