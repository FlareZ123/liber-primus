# Two isolated red119 triads: a source-selected GP29 subtraction reads SET

**15 November 2026, Agent19. Classification: concrete source-selected exploratory readout, not authenticated LP2 plaintext or a solved cipher.** The manuscript's only two isolated three-rune red groups have the same page-local rune offset, **119**. Reading the earlier group's GP29 indices minus the later group's indices modulo 29 spells the ordinary English imperative **SET**. A fully specified, unadjusted operation reproduces this exact three-rune result on the original ciphertext. It is currently unknown whether the creator intended this subtraction, whether either colored group represents a Vigenère key, or what a putative SET instruction should modify.

## The original visual selector and operation

The original LP2 scans are 20.jpg (physical page3) and 56.jpg (physical page39), archived under resources/liber-primus. Both passages prominently print three red runes beside a red thirteen-dot cluster. The shared canonical source, [the original rune corpus](../resources/liber-primus/lp2-corpus.json) plus [the independently recorded ink spans](../resources/liber-primus/lp2-ink-annotations.json), identifies **exactly two** red spans of length three among all **18** red spans. They are precisely p3:119–121 and p39:119–121, with zero-based page-local rune offsets. No word, key, start, pair, or phase was chosen after reading the output.

| Original visibly isolated red text | GP29 rune indices | Prime weights (separate historical mapping) |
| --- | --- | --- |
| p3, \`P D TH\` | \`[13,23,2]\` | \`43,89,5\`, sum137 |
| p39, \`IA C S\` | \`[27,5,15]\` | \`107,13,53\`, sum173 |
| **Earlier minus later**, index-wise modulo29 | **\`[15,18,16]\`** | **S E T** |
| Later minus earlier, modulo29 | \`[14,11,13]\` | X J P |

The direct calculation is \`(13−27,23−5,2−15) mod29=(15,18,16)\`. Using the manuscript's fixed 29-symbol Gematria Primus order, those indices are **S E T**. GP29 additive/Vigenère difference is a historically used type of operation in the *already solved first release*. Applying it to these two unknown red passages is **our hypothesis**, because the red ink and matching index do not explicitly designate a key and ciphertext or a subtraction direction.

This is distinct from the earlier unsuccessful proposal to use one shared 119-symbol additive pad on both **black prefixes**. That full-prefix proposal is excluded under broad source-native English lexical assumptions in [the exact word-grammar gate](lp2-p3-p39-red119-sharedpad-wordgrammar.md). The present subtraction concerns **only the two complete red triads**. Their separate prime-weight sums 137/173 and the possible 2014 title133 page-index relation are already recorded in [the original-source crosslink](lp2-2014-html133-red119-crosslink.md); the present English readout is a different, original-input observation and does not validate that numerical route.

## Source-registered control and a literal next operation

The same two original pages contain **11** and **14** complete printed three-rune words, respectively. Without changing a word break or key, the 154 pairwise **earlier-minus-later** GP29 subtractions contain **four** spellings present in the repository's 29,157-entry pinned English word-frequency control after the existing native-GP spelling conventions: \`OAC\`, \`SET\`, \`GUY\`, \`WITH\`. **SET occurs in exactly one of the 154 pairs, the visually selected red/red pair** (three-rune word indices3 and3 among their respective page inventories). The same native spelling normalization gives **721 distinct eligible three-rune dictionary forms among 29³=24,389** possible GP29 triples, or **2.956%**. These are descriptive calibration counts. The pair and operand direction were motivated by the original page/ink alignment, but a choice of how to operate on the pair and interest in any English output create genuine discovery selection. There is no calibrated historical-design probability or proof of a hidden message from a three-rune word.

One literal possible consumer treats the *other* red group as a repeating period-three Vigenère key, with phase anchored at exactly local offset119. Without fitted shifts or keys:

- Using p39's \`IA C S\` as the additive key for the complete original **p3** ciphertext yields GP29 unigram index of coincidence approximately **0.032557**, from ciphertext **0.033069**.
- Using p3's \`P D TH\` as the additive key for the complete original **p39** ciphertext yields approximately **0.037029**, from ciphertext **0.035774**.

The independently clear original **p57** reference has IoC **0.062710**. Neither literal period-three transfer approaches that plaintext reference or yields readable source-native prose. These tests do not exhaust all cipher conventions, nonadditive mechanisms, F-bypass interpretations, or uses of the candidate imperative. They only reject promoting SET as an already demonstrated full-page Vigenère decoder.

The visually printed thirteen-dot groups might suggest a number or key length, and the historically recovered 2014 HTML title133 provides a different source number, but **no original instruction says “SET 13,” “SET 133,” or “SET” a cryptographic state**. Joining any one of these numbers to the three-letter readout and testing open-ended key models would be postselection. Retain the literal SET result as an independently falsifiable candidate clue, while withholding any plaintext claim.

## Reproducibility and decision

[Original-source, Windows-compatible Node.js CommonJS SFT](../sims/lp2_red119_pairwise_set_readout_sft.cjs) asserts the complete unknown-rune count, the exact two red spans, both source-triad indices and prime sums, the printed three-rune dictionary control, the SET/XJP directionality, and the two phase-anchored direct-key IoCs. Its only inputs are existing pinned repo resources. No original transcriptions, images, or findings were replaced.

**Decision:** Preserve this source-directed three-rune candidate readout as **intermediate evidence only**. It offers a small, exact English token from two visually selected ciphertext operands. Its most immediate whole-page cipher continuation has failed. A material breakthrough would require an **independent first-party instruction** establishing that the later red group is a key, identifying the parameter to set, or predicting a source-selected unknown-page cipher input that becomes unambiguous plaintext. No authenticated new LP2 plaintext, usable unknown-page key, global cipher mechanism, or destination has been recovered.
