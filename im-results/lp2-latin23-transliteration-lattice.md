# Joint Latin Vigenère / ambiguous GP29 observation inverse

**Decision for Director #2579:** the 2012 Reddit Latin Vigenère key followed by an ambiguity-preserving GP29 encoding does not yield prose on physical LP2 p54–55. A genuine joint inverse substantially outperforms canonical greedy expansion on planted native plaintext controls. No unknown LP2 plaintext or key was recovered. The mechanism is not historically selected for LP2 itself.

## Source-motivated law and limits

The authentic 2012 Reddit sequence `a2e7j6ic78h0j7eiejd0120` supplies the 23 shifts [10,2,14,7,19,6,18,12,7,8,17,0,19,7,14,18,14,19,13,0,1,2,0], i.e. KCOHTGSMHIRATHOSOTNABCA under A=0. See the [period walkthrough and ciphertext](https://3301cicada.wordpress.com/2012-2/) and [archived 2012 source explanation](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/README.md). The 2012 usage establishes the Latin Vigenère operation and exact historical key, not a 2014 reuse instruction. This is a fixed transfer hypothesis, not an exhaustive Vigenère search.

Encrypt ordinary Latin letters with the 23-shift key, advancing on each Latin letter, then encode ciphertext Latin into GP29. Retain printed word boundaries and allow arbitrary initial cyclic phase. The first 49 complete original words ending on p54 are the fit scope; the 17 complete words on p55 use the fitted ending phase. The 308 total runes come from the unchanged canonical original transcription; word count and global 12,956-rune/2,896-word alignment are asserted. No phase reset between these pages.

## Executable joint relation

A finite transducer consumes one or more Latin ciphertext letters per observed rune: U/V; C/K/Q; S/Z; NG/ING; IA/IO; ordinary chart singletons and ligatures; plus QU -> C,W as a source-native spelling convention. All other spellings are rejected by the relation. The chart aliases are independently documented in the [GP table](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/gematria_primus.md) and the repository's native spelling gate `sims/lp2_uncontracted_latin_wordorder_sft.cjs`. This intentionally liberal grammar admits all chart-compatible segmentations, including non-greedy ones; exact native compositor segmentation is not claimed. Different edges can consume different numbers of letters and thus change the subsequent Vigenère phase. A QU edge consumes two Latin characters and two runes.

For every word of the pinned 29,157-word TextBlob frequency lexicon and each of 23 start phases, encrypt it and traverse the trie of observed rune words through every valid spelling edge. Each accepted candidate contributes a word-frequency weight and a start/end phase. Dynamic programming over the printed-word sequence maximizes the number of lexicon-covered words, then the sum of log word frequencies. For every OOV word, retain **all** attainable end phases from its letter-length lattice, with a representative compatible Latin witness. This makes the covered-word count a finite-lexicon upper bound, rather than an artifact of dropping ambiguous paths. The held-out decoder receives only the fit's ending phase; its words are decoded from their ciphertext, not predicted without it. Every selected word is forward encrypted and accepted by the original rune-word relation. Replaying the relation establishes implementation consistency, not uniqueness of spelling or historical key.

## Calibrated positive controls and original result

Three nonoverlapping 75-word windows from the repository's solved LP1 Latin reference (two A KOAN windows, one WELCOME window) were encrypted with the fixed historical key and concealed phases 3,11,19. The decoder receives the observations and the known key, with all 23 start phases; it does not receive the planted phase or target sequence. The first 45 words fit phase and the last 30 are held out. This is blinded **phase** recovery conditional on the known key, not recovery of an arbitrary 23-letter key. The synthetic observations use longest available chart spellings; the inverse admits all spellings. TextBlob is an external frequency lexicon, not a sequence model.

| Trial | Initial phase recovered | Fit exact words | Joint held-out exact | Greedy held-out exact |
|---|---:|---:|---:|---:|
| KOAN first | 3/3 | 44/45 | 29/30 | 14/30 |
| KOAN second | 11/11 | 45/45 | 27/30 | 13/30 |
| WELCOME | 19/19 | 44/45 | 29/30 | 15/30 |
| Total | 3/3 | 133/135 | **85/90** | **42/90** |

All three fitted ending phases equal their actual phases. The joint solver covers 224/225 words with the finite lexicon; errors such as A AM and MATTER instead of MASTER show genuine transliteration nonuniqueness. The native controls replay all 905 observed runes under the relation. No contextual reranker was fitted to these failures.

| Original | Fit p54 | Held-out p55 | Full retrospective maximum |
|---|---:|---:|---:|
| Joint | 7/49 | 2/17 | **9/66** |
| Greedy | 6/49 | 0/17 | not computed |

The joint original witness replays **308/308** original runes. Nevertheless it is nonlinguistic and needs at least **57/66 OOV words**, even when all starting phases, word spelling alternatives and latent OOV length clocks are allowed across both pages retrospectively. The seven and two covered words include fragments/abbreviations such as CO, HA, TY, LI, KM, not a candidate sentence. The raw witness and all control strings are in the output JSON.

## Decision and next step

Retire the fixed 2012 23-shift key, continuous Latin clock, printed-word receiver on p54–55, conditional on the stated lexical/native-language model. This does not exclude other Latin keys, changed boundaries, non-English plaintext, another cipher family, or a source-selected different segmentation rule. Because the historical Vigenère source supplies no LP2 reuse selector, searching other arbitrary Latin keys would not satisfy the source gate. Preserve the joint finite relation as a reusable component if an independent LP2 source fixes a Latin cipher/key law; do not repeat greedy expansion or this 23-phase scan. The original alternative remains unsolved.

Reproduce: `node sims/lp2_latin23_transliteration_lattice_sft.cjs`. [Output](lp2-latin23-transliteration-lattice-output.json). Executed the same JS function in the connected JS runtime against repository inputs. An initial implementation accidentally supplied a 40-word third control; it was corrected and the full three 75-word trials rerun before the decision. No Windows CI run claimed.


## Spacing-free character-context inverse (independent continuation)

The strongest objection to the intact-word result is that original printed word boundaries might be encrypted or moved. The same fixed historical Latin key can be tested without trusting any printed spaces. The follow-up implements a Viterbi decoder over **(rune position, Latin phase, three-character context)**. Each edge consumes one chart rune and emits any allowed Latin spelling after Vigenère inversion (including the two-rune QU→CW arc). A smoothed character four-gram model is trained exclusively on 406,895 normalized Latin characters from the pinned Gibran and Emerson corpora, with no target LP1 sequence training. The DP maximizes total log likelihood including variable-length emissions; it is exact for this model, with no beam pruning. It fits the initial phase on the first physical page and transfers only its final phase/context to the second page. Printed word separators and original line breaks are entirely ignored.

Three continuous 360-letter native LP1 plants (two KOAN segments and one WELCOME segment) are encrypted and greedily transliterated **after removing spaces**. The decoder recovers all three concealed start phases and all three fit ending phases. Fit edit distances are 4,4,5; held-out edit distances are 4/121, 2/120 and 3/122 (9 edits over 363 held-out letters). All outputs replay every observed rune via the explicit relation. Exact native Latin recovery is not guaranteed by the ambiguous channel, but the positive strings remain readily legible.

| Spacing-free inverse | Fit log score/rune | Holdout log score/rune |
|---|---:|---:|
| KOAN first plant | −1.941 | −1.992 |
| KOAN second plant | −2.005 | −2.114 |
| WELCOME plant | −1.913 | −1.915 |
| Original p54→p55 | **−6.469** | **−6.879** |

The original p54 fit consumes 232 glyphs, selects phase3 and ends at phase14. Its highest-likelihood inverse begins `TTHORBSCHEBYQAKCIMEUMYYMHHOWGYCHPTIATPPADNAUEAFPUMCMOXFFOFRFOWEZCKD`; the untouched p55's 76 glyphs begin `UVSHRMHUSRVYLLIORMZJEMBAINRHWQZEQDJBTOKDAAWGSXAULKVOODBXCADLIMSTW`. Neither is prose, despite exact relation replay and arbitrary chart-compatible spelling choices. Native holdout scores span −1.915 to −2.114 nats/rune, while original is −6.879. This also retires the same fixed historical key and continuous Latin clock for the spacing-free receiver under this language model; it does not establish that printed spaces are genuine or exclude other key laws.

The spacing-free inverse is a separate reusable component, not a new key sweep. [SFT](../sims/lp2_latin23_spacingfree_lattice_sft.cjs) and [exact output](lp2-latin23-spacingfree-lattice-output.json). Executed directly in the connected JS runtime, no CI claim.


## Unknown-key constructive attack, period 23

A separate exploratory attack removes the assumed historical key entirely. Period 23 has two independent motivations (the actual 2012 23-shift Latin Vigenère key length and the terminal 23-dot LP2 p57 mark), neither of which establishes a Latin-layer period instruction. The candidate is a continuous additive Latin26 key of 23 arbitrary unknown shifts, followed by the same GP spelling relation, with no printed boundaries. It fixes period only; the key is inferred from ciphertext.

For each possible NG/ING length mask, build a position-aligned spelling lattice. Every other alias has fixed length; adjacent C,W also accepts literal CW/KW/QW or the QU contraction. Rank masks by an optimistic unigram objective maximizing each phase independently over all 26 shifts and local character options. Retain the top 24 masks (all if fewer). For each mask run three deterministic starts of alternating key-coordinate and spelling-coordinate maximization using the independently trained Latin four-gram model. Refine the best fit with exhaustive adjacent pair and triple block updates. Crucially, the final key profiling maximizes **all latent aliases exactly conditional on the selected length mask** via a context trellis for every candidate single shift and all 676 adjacent-pair assignments. The held-out page is decoded with exact variable-length Viterbi, with the fit key and ending phase/context frozen. Forward replay checks every chosen spelling edge. This is a constructive finite-budget key search, not a global all-key bound.

| Calibration | Initial coordinate key correct | After fixed-alias blocks | After exact alias profiling | Fit edits | Held-out edits |
|---|---:|---:|---:|---:|---:|
| KOAN 1 | 20/23 | 22/23 | **23/23** | 4 | 2/119 |
| KOAN 2 | 20/23 | 20/23 | **23/23** | 7 | 2/120 |
| WELCOME | 21/23 | 23/23 | **23/23** | 2 | 2/120 |
| Total | 61/69 | 65/69 | **69/69** | 13 | **6/359** |

The controls are three 360-letter solved LP1 plaintext plants with distinct pseudorandom 23-letter keys derived from fixed seeds, no crib, and continuous Latin-letter advancement. All three true length masks are rank1 and contain no ING expansion; the calibration therefore establishes unknown-key recovery on these relatively sparse length-ambiguity examples, **not** recovery under nine or more ambiguous NG glyphs or arbitrary masks. Algorithm development used these control examples; they are development/calibration controls, not independent external validation.

The original p54 has nine NG/ING glyphs and all 512 length masks are ranked. The top 24 receive the declared key search. Best mask96 emits 285 latent Latin characters for 232 original runes. The inferred 23 shifts are [23,0,13,0,3,9,3,19,12,19,22,6,7,20,22,22,10,0,17,0,13,0,0]. The fitted candidate begins `DMAGAZLAVEMGBGHTDGEWNMTDNTNDKEPODWBBIEIFANGBMIDEBTTFCFIANNAPIEUKWENCEDEEOROADVIRAYGONLOSINEALLTHYLGEORAC`. Its p55 continuation begins `UKUXSMAPBGMMEOJDGHXVCPCHFENCVFUAOXVMUNPUNDCBVAGHCHVJFXEXCROEHARIDODGSGIIMNXLUSCHBECHAVMNOAQIIIC`. Neither is prose. Original fit/held-out scores are **−4.779/−6.910 nats/rune**, compared with calibrated native fit −1.987 to −1.930 and held-out −2.035 to −1.840. All 308 original runes replay through the chosen relation, which is not evidence of authentic plaintext.

Do not promote the fitted original key. The initial top24-mask run was a failed transfer. The high-ambiguity calibration and full-mask continuation below supersede that coverage limitation; local maxima and other key laws remain possible. Preserve the genuine key-recovery improvement of conditional alias profiling, which converts 0/3 full planted keys from the initial coordinate method to 3/3. [Executable](../sims/lp2_latin23_unknown_key_lattice_sft.cjs) · [final exact outputs](lp2-latin23-unknown-key-lattice-output.json). The intermediate implementation outputs are superseded; no Windows CI claim.


### High-ambiguity calibration and all 512 original length masks

To close the initial calibration gap, an additional, previously unused LP1 LOSS OF DIVINITY/PRESERVATION native 360-letter passage is encrypted with a deliberately constructed arbitrary key. Independent phase constraints force at least three ING and six NG emissions in the fit area (first eligible fixed seed). This is an adversarial length-ambiguity plant, not a uniformly random key or a match to every LP2 property. It has **nine observed NG/ING glyphs**, 512 possible masks, and true mask266 containing three ING expansions. Its true mask ranks second on the unigram screen. The unchanged optimizer recovers mask266 and **23/23** shifts, with four fit edits and **1/116** held-out edits; held-out −1.88048 nats/rune. The original source still has many more other ligatures, so this does not establish calibration of every original distribution. [Shared solver's high-ambiguity control](../sims/lp2_latin23_high_ambiguity_control_sft.cjs) · [output](lp2-latin23-high-ambiguity-control-output.json).

With that positive, expand the original fit search to **all 512 masks** (1,536 starts). Partition the frozen unigram rank order into four 128-mask ranges; for each mask run the same three alternating optimizations, then refine the three best raw-fit candidates per range with key blocks and exact conditional alias profiling. Across all twelve refined candidates, select by p54 fit score only. The winner changes to mask120 (unigram rank162), 287 latent Latin letters; fitted shifts [0,0,12,3,10,2,0,0,6,19,8,8,2,15,16,12,13,1,21,0,0,20,19]. Original best fit improves from −4.779 to **−4.7350556 nats/rune**, still far below the native controls. Freeze this candidate and decode p55 independently: **−6.5249856 nats/rune**, exact 308/308 rune relation replay across both pages, no prose. It begins `ALRKSZHBSBDTSECDTRHAYMASYMAJJQGEALEIMINFFINASWGKDNWNOKBHKVCECBUYEIAEYKCDOCGGYHEFAHOSHUYIMEEVBSMOW`. Do not infer a key from its fit score.

Full raw coverage and top refined candidates: [ranks 1–128](lp2-latin23-fullmask-range-000-128.json), [129–256](lp2-latin23-fullmask-range-128-256.json), [257–384](lp2-latin23-fullmask-range-256-384.json), [385–512](lp2-latin23-fullmask-range-384-512.json); [frozen winner and held-out output](lp2-latin23-fullmask-final-output.json). Reproduction: run the shared SFT with `--range 0 128`, `--range 128 256`, `--range 256 384`, `--range 384 512`, then supply the best fit candidate JSON object to `--candidate`. The high-ambiguity wrapper imports the same solver to avoid duplicated infrastructure. Actual JS execution, no CI claim.

**Current decision:** all four distinct planted keys recovered exactly (92/92 shift positions); seven edit errors over 475 held-out Latin letters. Yet the original all-mask finite-budget search remains nonlinguistic. Retire this bounded q23 continuous additive Latin receiver as an active route unless an independent LP2 clue supplies a concrete key/operation or a demonstrably different search mechanism. All masks were searched but only twelve were fully profiled, so no global all-key/all-mask optimum or mathematical exclusion is asserted. No original plaintext, authentic key, or validated LP2 layer has been recovered.
