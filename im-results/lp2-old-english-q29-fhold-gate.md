# Old English surface-register gate (#2558)

The exact GP29 order matches the 29 stanzas of the Anglo-Saxon rune poem, but does not establish the plaintext language.

## Frozen inputs and model

Bruce Dickins, *Runic and Heroic Poems of the Old Teutonic Peoples* (1915), pp.12–23, [Old English column](https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples/The_Runic_Poems/The_Anglo-Saxon_Runic_Poem), and independent Heyne/Socin/Harrison/Sharp *Beowulf*, Gutenberg 9701, [pinned source](https://github.com/GITenberg/I.-Beowulf--an-Anglo-Saxon-poem.-II.-The-fight-at-Finnsburh--a-fragment._9701/blob/a104fd97be68a06f4d4d50f33143b6016cac34d1/9701-0.txt), blob 73715dc75871bd4026f66d82c470974a0bfc4637, lines437–3789. Preserve all 3184 verse lines, excluding modern English headings and verse numbers; preserve poem stanza/line boundaries.

Normalization declared before inference (issue comment 7127366748): lowercase NFD, remove combining marks including vowel length, retain bracket-restored letters, join editorial in-word hyphens, keep inflections. þ/ð→TH, æ→AE, œ→OE, ƿ→W, k→C, io→IA; greedily consume GP29 digraphs TH/EO/EA/NG/OE/AE/IA. No alternate spellings or generated inflections. Poem: 546 words/2,533 runes; Beowulf: 17,387 words/82,644 runes; union 5,669 distinct surface spellings. Rune unigram/bigram/trigram pseudo-counts 0.5/0.3/0.1. No translation or original LP2 input in the OE vocabulary or LM.

Reuse exact word-relation CSP from #2537: continuous period29 phase0, additive consuming symbols, transparent plaintext F without advance. Arbitrary initial phase absorbed in key rotation. Control vocabulary is included but its order is not a constraint, so this calibrates in-vocabulary key recovery.

## Results

| Control | Prefix runes | Withheld correct | Key correct | Held LM nats/rune |
|---|---:|---:|---:|---:|
| Dickins opening | 207 | 105/105 | 29/29 | −2.33645 |
| Beowulf opening | 206 | 105/105 | 29/29 | −2.05493 |
| Beowulf midpoint | 207 | 107/107 | 29/29 | −2.09097 |
| Separate English KOAN1 | 206 | 105/105 | 29/29 | −1.42268 |

Four independent hidden keys recover exactly, with one full lexical path each and exact replay. The OE controls recover 317/317 withheld runes. English control uses solved native English vocabulary and LM. Scores are within the training register, not held-out-corpus calibration.

Original p54–55 frozen 205-rune/45-word prefix, 103 untouched runes: 23,102 initial relations, **zero keys by propagation alone**, one node/pass, 8,667 row visits; no relation at zero-based word18. No cap. No key means the original continuation is unused. All twelve seeded symbol shuffles preserving target word lengths and ciphertext histogram likewise give zero keys by propagation.

## Out-of-vocabulary lower bound

Enumerate the eight hold masks of the three ciphertext Fs. Each fixes consuming phases and imposes nonzero plaintext. Two words whose projections onto shared key slots are disjoint cannot both be in vocabulary. Exact minimum vertex cover lower-bounds OOV count, plus mandatory OOV words.

| Mask | Mandatory | Edges | Min cover | OOV lower bound |
|---:|---:|---:|---:|---:|
| 0 | 0 | 72 | 17 | 17 |
| 1 | 0 | 74 | 19 | 19 |
| 2 | 1 | 67 | 17 | 18 |
| 3 | 0 | 81 | 19 | 19 |
| 4 | 0 | 77 | 18 | 18 |
| 5 | 0 | 75 | 18 | 18 |
| 6 | 1 | 62 | 16 | 17 |
| 7 | 0 | 81 | 18 | 18 |

Every possible key requires >=17/45 OOV words. This lower bound permits arbitrary OOV content; it is not the achieved optimum. Old English productive inflection/compounding can cause high OOV rates, so this does not disprove Old English generally. Retire only the frozen q29 intact-word F-hold lexical family. No original key/plaintext.

[Executable SFT](../sims/lp2_old_english_q29_fhold_sft.cjs) · [Executed output](lp2-old-english-q29-fhold-output.json) · [Poem](../resources/external/dickins1915-rune-poem-old-english.txt) · [Beowulf verse](../resources/external/beowulf9701-old-english-verse.txt). Executed on repository inputs in connected JS.
