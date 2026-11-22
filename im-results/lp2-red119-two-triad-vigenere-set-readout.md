# Two isolated red119 triads: SET and opening BOOK from one marked three-rune key

**15 November 2026, Agent19. Classification: original-source, two-anchor candidate readout, not authenticated unknown LP2 plaintext.** The manuscript's only two isolated red three-rune groups have the same page-local rune offset, **119**. Taking the later group as a repeated GP29 additive key yields **SET** from the earlier red group and **BOOC** (ordinary BOOK in GP spelling) from the first four red runes of the manuscript. Both outputs use exactly the same printed three-rune key and the same zero-phase operation. The continuation does not decode as coherent prose, and the four-rune opening prefix was selected after inspection. These are provisional clues, not identified plaintext or a validated cipher.

## The original visual selector and operation

The original LP2 scans are 20.jpg (physical page3) and 56.jpg (physical page39), archived under resources/liber-primus. Both passages prominently print three red runes beside a red thirteen-dot cluster. The shared canonical source, [the original rune corpus](../resources/liber-primus/lp2-corpus.json) plus [the independently recorded ink spans](../resources/liber-primus/lp2-ink-annotations.json), identifies **exactly two** red spans of length three among all **18** red spans. They are precisely p3:119–121 and p39:119–121, with zero-based page-local rune offsets. No word, key, start, pair, or phase was chosen after reading the output.

| Original visibly isolated red text | GP29 rune indices | Prime weights (separate historical mapping) |
| --- | --- | --- |
| p3, \`P D TH\` | \`[13,23,2]\` | \`43,89,5\`, sum137 |
| p39, \`IA C S\` | \`[27,5,15]\` | \`107,13,53\`, sum173 |
| **Earlier minus later**, index-wise modulo29 | **\`[15,18,16]\`** | **S E T** |
| Later minus earlier, modulo29 | \`[14,11,13]\` | X J P |

The direct calculation is \`(13−27,23−5,2−15) mod29=(15,18,16)\`. Using the manuscript's fixed 29-symbol Gematria Primus order, those indices are **S E T**. GP29 additive/Vigenère difference is a historically used type of operation in the *already solved first release*. Applying it to these two unknown red passages is **our hypothesis**, because the red ink and matching index do not explicitly designate a key and ciphertext or a subtraction direction.

This is distinct from the earlier unsuccessful proposal to use one shared 119-symbol additive pad on both **black prefixes**. That full-prefix proposal is excluded under broad source-native English lexical assumptions in [the exact word-grammar gate](lp2-p3-p39-red119-sharedpad-wordgrammar.md). The first readout concerns **only the two complete red triads**; a second target uses the opening red phrase on p0. Their separate prime-weight sums 137/173 and the possible 2014 title133 page-index relation are already recorded in [the original-source crosslink](lp2-2014-html133-red119-crosslink.md); the present English readout is a different, original-input observation and does not validate that numerical route.

## A second visibly red target: opening BOOC (BOOK)

The **later** isolated triad p39:119–121, `IA C S` = **[27,5,15]**, is the sole source-derived key for the following fixed additive inverse. Use it from the beginning of each visibly marked target:

| Original target | Original GP29 runes | Decrypted with repeating `IA C S` |
| --- | --- | --- |
| Earlier isolated red p3:119–121 | `P D TH` = [13,23,2] | **S E T** = SET |
| Opening four red p0:0–3 | `S H E O` = [15,8,18,3] | **B O O C** = BOOK (GP K→C) |

The p0 prefix identity is exact: index subtraction yields `[17,3,3,5]`. No new key, sign, phase, direction or alphabet adjustment is needed between the two source targets. The original p0 opening *red span* is **13 runes long**, and its first *printed word* is **eight** runes long. Therefore the use of precisely **four** opening symbols is **analyst-selected**, discovered after seeing BOOK. The same key on all 13 opening red runes gives **`BOOCURFAFEAPGW`**, which is not coherent source-native plaintext. At rune6 it produces plaintext F from a non-F ciphertext rune, incompatible with the literal F-bypass convention in the solved LP1 and p56 Vigenère-style methods. Consequently neither SET nor BOOK is authenticated unknown manuscript plaintext under the verified solved-page encryption rules.

The original red triads are both adjacent to conspicuous thirteen-dot motifs and p0 begins with a thirteen-rune red heading. These are plausible visual reasons to compare those source positions, but neither the dots nor an authenticated historical instruction isolates the *four-rune* prefix or declares p39's group to be a key. The exact two-anchor correspondence is a promising candidate in need of a longer author-selected inverse.

### Exhaustive three-rune-key control and unselected red highlights

With the independently pinned TextBlob/Norvig English word-frequency source, the historical native-GP spelling conventions yield **721 unique three-rune words** and **2,065 unique four-rune words**. Over **every one of 29³=24,389** possible three-rune keys, exactly **five** decode the *specified p3 red3 and p0 opening4* simultaneously to dictionary words:

| Candidate key | p3 red3 | p0 opening4 | Source word-frequency product |
| --- | --- | --- | ---: |
| **IA C S**, original p39 marked red group | **SET** | **BOOC** | **40,625** |
| IA P IA | SIR | BALC | 531 |
| F C IA | PER | SOLO | 86 |
| G P P | WIE | NACY | 38 |
| A M P | ERE | LECH | 2 |

BOOC is the GP spelling of BOOK and has printed word frequency **125** in that source; SET has frequency **325**. The observed marked key is the highest-scoring among the five by this *exploratory* product. Its raw simultaneous dictionary-match frequency is **5/24,389 (approximately 0.000205)**, which is **not** a calibrated discovery p-value: the second source target, the four-character cutoff and the word-frequency ranking were investigated after the isolated SET observation. Other source-visible alignments and operations have been considered throughout the collaborative project.

The fixed same key was also applied from the beginning of **all 16 original unsolved-page red spans**. Only the **already discussed p0 prefix4 and p3 triad3** produce any three- or four-rune prefix that is an exact member of this dictionary. The other 14 spans provide no additional same-key lexical cross-confirmation. This sharply bounds the present observation: a short double hit with no general red-caption decryption.

## Source-registered control and a literal next operation

The same two original pages contain **11** and **14** complete printed three-rune words, respectively. Without changing a word break or key, the 154 pairwise **earlier-minus-later** GP29 subtractions contain **four** spellings present in the repository's 29,157-entry pinned English word-frequency control after the existing native-GP spelling conventions: \`OAC\`, \`SET\`, \`GUY\`, \`WITH\`. **SET occurs in exactly one of the 154 pairs, the visually selected red/red pair** (three-rune word indices3 and3 among their respective page inventories). The same native spelling normalization gives **721 distinct eligible three-rune dictionary forms among 29³=24,389** possible GP29 triples, or **2.956%**. These are descriptive calibration counts. The pair and operand direction were motivated by the original page/ink alignment, but a choice of how to operate on the pair and interest in any English output create genuine discovery selection. There is no calibrated historical-design probability or proof of a hidden message from a three-rune word.

One literal possible consumer treats the *other* red group as a repeating period-three Vigenère key, with phase anchored at exactly local offset119. Without fitted shifts or keys:

- Using p39's \`IA C S\` as the additive key for the complete original **p3** ciphertext yields GP29 unigram index of coincidence approximately **0.032557**, from ciphertext **0.033069**.
- Using p3's \`P D TH\` as the additive key for the complete original **p39** ciphertext yields approximately **0.037029**, from ciphertext **0.035774**.

The independently clear original **p57** reference has IoC **0.062710**. Neither literal period-three transfer approaches that plaintext reference or yields readable source-native prose. These tests do not exhaust all cipher conventions, nonadditive mechanisms, F-bypass interpretations, or uses of the candidate imperative. They only reject promoting SET as an already demonstrated full-page Vigenère decoder.

The visually printed thirteen-dot groups might suggest a number or key length, and the historically recovered 2014 HTML title133 provides a different source number, but **no original instruction says “SET 13,” “SET 133,” or “SET” a cryptographic state**. Joining any one of these numbers to the three-letter readout and testing open-ended key models would be postselection. Retain the literal SET result as an independently falsifiable candidate clue, while withholding any plaintext claim.


## Independent-source interpretation and a competing explanation

The **original signed January 2013 Diffie–Hellman example** provides a much stronger historical constraint on the two red triads than a generic shared Vigenère guess. Prior work had already reconstructed p3's red GP29 indices as `[g+A,p,K]=[5+8,23,2]=[13,23,2]` and p39's as `[-K,g,y]=[27,5,15]`, using the publicly signed server/client example. This is explicitly prior art in [the signed 2013 original-source bridge](lp2-2013-signed-dh6-lag6-original-source-bridge.md) and [the earlier original-source record](2013-signed-dh6-original-lag6-source-bridge.md).

Under that prior DH interpretation, the newly observed `SET` is exactly `(g+A+K,p-g,K-y) mod29=[15,18,16]`. This algebraic dependence matters: the SET result is a linguistic reading of the *same two already-identified red numeric records*, rather than an independent demonstration that the author actually encrypted one red group with the other. The extra p0 `BOOC` four-rune prefix remains a distinct source input but is subject to the postselected boundary caveat above. The original page0 scan prints an eight-rune first red word and a thirteen-rune total red heading, with **no indicated break at four runes**.

An additional, already published [cross-page affine transport](../sims/agent19_red_triad_gap36_transport_sft.cjs) uses the earlier signed-source-linked `T(x)=24−2x` and the p3→p39 page separation36 to match red positions120–121 and their immediately following **black** rune at122 under `T^{-36}`. This is a distinct candidate for how the author might relate the same source features. It does not produce full-page plaintext either. The present two-anchor Vigenère interpretation should therefore remain **one competing source interpretation** rather than supersede the mathematically grounded 2013/DH relation.

## Reproducibility and decision

The [successful Windows Node.js 22 manual GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43669944811) executed both source-input SFTs without failures. [Two-anchor and exhaustive all-key original-source SFT](../sims/lp2_red119_iacs_two_anchor_book_sft.cjs) reconstructs both SET and BOOK and the 24,389-key native lexicon control. The [original isolated-triad and direct-key SFT](../sims/lp2_red119_pairwise_set_readout_sft.cjs) asserts the complete unknown-rune count, the exact two red spans, both source-triad indices and prime sums, the printed three-rune dictionary control, the SET/XJP directionality, and the two phase-anchored direct-key IoCs. Its only inputs are existing pinned repo resources. No original transcriptions, images, or findings were replaced.

**Decision:** Preserve the two source-directed short words **SET** and **BOOK** as intermediate evidence only. They share one original highlighted key and one simple GP29 operation, with an exhaustive finite-key dictionary control. The full red-heading and whole-page continuations fail to give coherent plaintext. A material breakthrough would require an **independent first-party instruction** establishing that the later red group is a key, identifying the parameter to set, or predicting a source-selected unknown-page cipher input that becomes unambiguous plaintext. No authenticated new LP2 plaintext, usable unknown-page key, global cipher mechanism, or destination has been recovered.
