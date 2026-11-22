# P55 whole/fragment H aggregation: source-selection gate is negative

**Agent2, 19 November 2026. Director Issue #1887. Classification: reproducible conditional structure; no source-authenticated aggregator, decoder, or unknown-page plaintext.**

## Decision

The p55 whole/fragment H result is reproducible, including its manuscript-wide uniqueness under the reported rule. However, no first-party Cicada source or contemporaneous earlier-round convention found in the available record selects the exact aggregation:

1. apply H to the complete printed word;
2. apply H again to the prefix and suffix split by its physical line break;
3. concatenate all three outputs;
4. discard output order and duplicate multiplicity by converting to a set;
5. select the longest ascending linear run of consecutive GP29 residues.

The subsequent GP29-to-43-word lift and iterative page/word coordinate activation are also not specified by an authenticated source. Therefore the 0..42 reconstruction remains a **conditional structural correspondence to the known signed 2016 message**, not an authenticated source-register decoder or evidence of unknown LP2 plaintext. Close #1887 on this negative decision; do not extend dependent consumers without a new source selector.

## What is granted for this gate

This audit does not reopen the upstream page/word selections or the H pair arithmetic. Taking the existing premises as given:

- recursive circumference shedding selected p55 complete word7 as the 13-rune object;
- its original physical line break is 1|12;
- the existing H pair map is H(x,y) = (x-y, x+y) mod29, with odd centers retained;
- the authenticated 2016 signed message contains 43 words, indexed 0..42, including the phrase reconstructed by the reported p55 output;
- the original p55, p24 and p32 images show the physical line divisions used by the transcription.

The result under review is only the additional aggregation and the later extension rule.

## Source-selector audit

### The 2016 message is a broad clue, not the missing operation specification

The signature-verified 2016 text says:

> Liber Primus is the way. Its words are the map. Their meaning is the road, and their numbers are the direction.

This supports looking at words, meanings and numbers, and it makes ascending source-index order a plausible interpretation once values have been obtained. It does not specify:

- that a complete word and both of its physical fragments are three separate operands;
- that H must be applied independently to all three operands;
- that the outputs must be concatenated and then treated as an unordered set;
- that duplicate values are discarded;
- that the maximal ascending run, rather than the ordered H stream or another statistic, is the payload;
- that residues 0..13 should be lifted by +29 into a 43-word register;
- that newly recovered indices recursively activate every page/word cross-coordinate, or which overlap threshold should select the next receiver.

The source-selection distinction is consistent with the historical player solve-path audit in workplace/historical-player-solvepath-operator-contract.md: earlier successful Cicada stages paired recognizable clues with executable operations and supplied parameters (for example Caesar ROT-4, MIDI note/timing, BASE29/DH/NEXT, or explicit book coordinates). No documented earlier-round convention found here supplies this whole/fragment/set/run grammar.

### P57's circumference wording does not select the H aggregator

Solved p57 says to shed circumferences and find what is within. The earlier solved LP1 uses of “circumference” also give it a coherent semantic referent (the ego/self); see workplace/lp2-p57-circumference-source-semantic-decision.md. A geometric word-peeling interpretation is a plausible puzzle hypothesis and is granted for this bounded test. Even if it selects the p55 13-rune survivor, it does not select applying H to the complete word plus both fragments, unioning the outputs, or taking a maximal residue run.

### The physical line break is observable, but the three-object rule is not

Original p55 scan72 visibly splits the selected word 1|12; p24 scan41 visibly splits its selected word 6|1; p32 scan49 visibly splits its middle word 7|1. A player can notice those divisions. The images do not label the whole word, prefix and suffix as three H operands, nor instruct the solver to combine their outputs while discarding order and multiplicity.

## Finite alternative audit

The reproducer parses the repository's canonical transcription, preserves internal physical line breaks, and tests the same 388 complete p0–p55 words with exactly one internal line break. The H pair arithmetic and source objects remain fixed; only the natural aggregation choice changes.

### P55 word7

The exact outputs are:

~~~text
H(whole)   = [5,0,8,19,8,21,6,22,26,23,14,24,1]
H(prefix)  = [17]
H(suffix)  = [16,11,9,20,22,6,2,18,6,3,25,6]
~~~

| Aggregation | Longest ascending set-run |
|---|---:|
| Whole word only | 4 (21–24) |
| Prefix and suffix only | 3 (16–18) |
| Whole + prefix | 4 (21–24) |
| Whole + suffix | 9 (18–26) |
| Whole + prefix + suffix, then set | **11 (16–26)** |
| Preserve concatenated Hpair order | 1 |
| Preserve concatenated Hsplit order | 1 |
| Sort the full multiset but preserve duplicate occurrences | 7 (16–22) |

The full union contains residue 22 twice (once from the whole word and once from the suffix). Converting to a set removes that duplicate and is necessary for the 11-value run: with multiplicity preserved, the duplicate 22 interrupts the sorted sequence at 22. The prefix contributes the otherwise missing 17, bridging the isolated 16 to the 18–26 run. This is a real, exact correspondence, but it is highly specific to the chosen aggregation.

### Manuscript-wide alternative maxima

Across the same 388 line-wrapped words:

| Aggregation | Maximum run | Winning object(s) |
|---|---:|---|
| Whole only | 5 | p1 word32; p42 word47 |
| Prefix + suffix only | 6 | p48 word34 |
| Whole + prefix | 7 | p24 word37; p28 word19; p48 word34 |
| Whole + suffix | 9 | p55 word7 |
| Whole + prefix + suffix, then set | **11** | **p55 word7 only** |
| Ordered concatenated Hpair | 3 | p4 word42; p9 word49; p26 word19; p42 word47; p52 word17 |
| Ordered concatenated Hsplit | 3 | p9 word49; p18 word18; p44 word17 |

Only the full three-object set-union reaches a run of at least 9, and it does so once. The whole+suffix variant also singles out p55, but only for a 9-value run. The p24 word37 lower receiver yields 9..15 under whole+prefix as well as whole+both; it does not independently select the three-object rule. The p32 middle-word 0..4 result likewise uses the same unselected aggregator and is not an independent holdout of that operation.

These are exact finite counts, not a probability estimate. The unique maximum establishes conditional specificity of the chosen rule, not source selection of the rule.

## Upper lift and coordinate activation

If one assumes that H residues are addresses into the authenticated 43-word source, then values 0..13 have a second representative at residue+29. That arithmetic is deterministic once the mod-29-to-43-word address model is assumed. The source does not independently select that address model or instruct the solver to lift residues in this way.

The iterative closure then adds newly recovered indices to the page/word coordinate set, searches the newly enabled line-wrapped receivers, and applies an overlap-and-extension criterion to select later pages. This is a useful reproducible analysis procedure, but no source fixes the recursive activation rule, the complete cross-coordinate family, or the overlap threshold. The successful 0..42 closure therefore remains conditional on those choices.

## Human solve-path assessment

A contemporary solver could see the p55 line break, the solved p57 wording, and—after the 2016 publication—the signed “words are the map / numbers are the direction” message. Those clues make an investigation of words, physical segmentation and numeric ordering reasonable. They do not uniquely lead to the exact whole+prefix+suffix H-set-maximal-run operation. A human could equally reasonably preserve the H sequence, use only the complete word, or use only the two fragments; the finite audit shows those alternatives produce different and weaker maxima.

The result should therefore be retained as a strong structural correspondence and a useful hypothesis about the intended route, but not as an established source-selected operation. It yields no unknown-page plaintext, key, reversible cipher, or final Cicada destination.

## Reproduction

Run:

~~~sh
node sims/lp2_p55_linewrap_h_aggregation_gate_sft.cjs
~~~

Inputs: resources/liber-primus/lp2-corpus.json, resources/lp2-transcription.txt, and the signature-verified resources/historical/cicada2016-4gq25-outguess.asc. The exact original image line divisions can be inspected in p55 scan72, p24 scan41 and p32 scan49. The SFT verifies the canonical line-wrapped-word census, all alternative maxima, the p55 duplicate-22 effect, the p24 conditional receiver, and the p32 middle-word result.
