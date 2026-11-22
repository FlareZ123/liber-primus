# Full-LP2 source-crib search from original printed word lengths

**13 November 2026, Agent 7. Decision: no recovered plaintext.** This is a whole-manuscript, source-constrained plaintext-copy test, complementing the separate source-selected p55 moth phrase (#729) and the five-paragraph p36–38 source search (#705). The test makes no assumptions about a plaintext-to-ciphertext key, and therefore cannot authenticate a coincidental word-length match.

## Causal idea and source inputs

LP2's original printed word boundaries sometimes appear preserved under encryption. Solved p57 literally repeats a 2013 Cicada passage, so reusing authorial text is historically plausible. A contiguous independently recognizable plaintext passage from solved LP1 or a pre-2014 philosophical/literary source could supply a **frozen full-length crib** even under a strong cipher. For this, identical successive word lengths would be a necessary first indication.

Use the exact rune-word segments on **all 55 rune-bearing unknown physical LP2 pages p0–55** (p50 has no runes): 12,956 runes. Compare original LP1 canonical runic words from [the solved source manuscript](../resources/transcriptions/lp1_wulfic_canonical.txt) against the unknown pages. For three already available independent literary corpora, search both the **source-calibrated GP29 English spelling** (ING and IO as proved in [solved LP1](../results/lp1-source-orthography.md)) and **uncontracted Latin26** words. The latter matters because a separately observed near-English Latin word-length profile does not authenticate the native-GP plaintext register.

The literal source corpora are:
- Shakespeare, **55,407 words**, checked-in first-300k text
- Gibran, **15,733 words**, checked-in *The Prophet*
- Emerson, **77,932 words**, checked-in essays
- All available original LP1 sections, **not normalized to invented modern spellings**

Printed LP2 word separators are kept, and matches remain on their original physical pages. Page-continuing words are not silently merged into artificial source words. The script seeds five-length tuples, then extends matches until their first genuine difference, preserving complete consecutive words.

## Exact outputs

| Source | Longest source-native GP words | Longest literal Latin26 words |
| --- | ---: | ---: |
| Shakespeare | 9 | 9 |
| Gibran | 9 | 9 |
| Emerson | 9 | 10 |

The longest GP-native matched passage is **9 words / 37 runes** (p5 word20 versus Emerson). The longest Latin26 passage is **10 words / 41 printed runes** (p17 word19 versus Emerson, starting *thoughts and laws in his own breast he studies the*); a different **10-word / 32-rune** Emerson phrase matches p46 word5. Each match fails at its immediately following word. No 12-word/40-rune or longer contiguous source passage occurs in these frozen corpora.

Two independent **seven-word** matches arise from solved LP1 *original rune-word lengths*:
- LP2 physical **p55, word11–17**, 30 runes, versus solved LP1 page5's *THE TOTIENT FUNCTION IS SACRED ALL THINGS*, as previously documented by the source-linked moth-illustration hypothesis (#729).
- LP2 physical **p25, word46–52**, 29 runes, versus solved LP1 page1's *BE TRUE TEST THE KNOWLEDGE FIND YOUR*. This second exact seven-word length coincidence has **no identified independent illustration/key selector or cipher transport**; it is useful evidence of the ambiguous meaning of a seven-word match.

A separate exploratory primary-message screen compared all 21 archived 2012–2017 Cicada-signed-message files from [krisyotam's public corpus](https://github.com/krisyotam/cicada3301/tree/main/pgp/messages) against all unknown pages under both registers; **none attained eight complete words**. That supplemental external-source screen includes armor/header tokens and must not be presented as a full archival text-normalization proof. The reproducible local SFT covers the pinned original LP1 and three literary corpora described above.

## Reuse and research decision

The [single runnable complete-source test](../sims/lp2_fullbook_source_crib_sft.cjs) reads the checked-in files, checks the 12,956 original runes and both language-register maxima, prints the strongest passages, and asserts the two LP1 seven-word coincidences. It performs no file writes and introduces no automatic CI trigger.

**Next causal decision:** these specific full-book literal-source cribs do not yield an independently identifiable plaintext fragment. The shared LP1 p5 / p55 moth image is a genuine historical artwork link, but the seven-word length match alone remains equivocal, as the separate p25 match demonstrates. A new author-selected historical text, exact 12+ consecutive-word correspondence with at least five additional held-out words, or a source-attested cipher mapping could justify reopening a bounded crib. Search scores, editable word boundaries and seven-word coincidences by themselves do not recover plaintext or a key.
