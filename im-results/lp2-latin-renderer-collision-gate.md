# LP2 Latin renderer: exact word-collision obstruction (#2631)

## Result

No stationary deterministic renderer of the single-valued canonical literal Latin **word strings** can exactly reconstruct LP2 p0–55, regardless of how non-greedy its parsing or how extensive its dictionary is. The fuller historical alias alphabet has a separate, tighter four-error obstruction and a 192-group greedy feasibility failure (see independent witness below). There are seven equal-expanded-word classes with distinct original rune spellings, involving 22 printed groups. Even an oracle selecting the majority spelling in each class must fail at least eight groups. This strengthens the earlier greedy-only obstruction in #1347; it is not a rejection of context-dependent/stateful rendering or a recovered cipher.

## Source control and test

Use GP0 chart literal transliterations (TH, EO, NG, OE, AE, IA, EA as the seven digraphs), corrected LP2 original layout, and canonical LP1 original layout. Remove line-wrap slash and whitespace, join page continuations within each section; punctuation delimits groups. Source-original LP1 plaintext is obtained by Atbash (warning), exact WELCOME/DIUINITY and KOAN2/FIRFUMFERENFE forward replays from the native solved reference, the affine transform P=2-C mod 29 (KOAN1, 778 runes rather than the edited external 780), and literal clear pages 3, 8–11, 14. The independent heldout solved LP2 p56 prime-minus-one F-hold replay and p57 literal source provide 45 groups. All 694 training groups and all 45 heldout groups agree with greedy chart tokenization; no actual solved group calls for a non-greedy override.

Enumerate all 128 stationary left-to-right digraph-merge masks. Freeze by exact training replay before testing holdout or unknown text. Digraph order TH EO NG OE AE IA EA; training counts 105,0,30,0,2,16,20. Four masks survive because training never encounters EO/OE; all four pass solved holdout.

| Mask | Heldout errors /45 | Unknown errors /2896 |
|---:|---:|---:|
|117|0|858|
|119|0|559|
|125|0|492|
|127|0|175|

## Universal word-local obstruction

For any deterministic f(L), equality of the input literal Latin word L implies equality of the rune output. The original data contradict that necessary condition:

| Literal Latin | Original rune spellings and zero-based group indices |
|---|---|
|EA|ᛠ: 39,923,1179,2737; ᛖᚪ: 530|
|NG|ᚾᚷ: 70,2586; ᛝ: 168,1514,2856|
|IAEO|ᛡᛇ: 183; ᛡᛖᚩ: 1221,1263|
|AET|ᚫᛏ: 566; ᚪᛖᛏ: 1441|
|NGIA|ᚾᚷᛡ: 1051; ᛝᛡ: 2653|
|EOE|ᛖᛟ: 1381; ᛇᛖ: 2889|
|EO|ᛇ: 2073; ᛖᚩ: 2418,2838|

Minimum mistakes = sum over classes (class count - largest spelling multiplicity) = 8. EOE even has equal rune lengths. A renderer incorporating position, punctuation, adjacent words, or an independent state/key may evade this bound, but it requires a separately identified state and is not established by solved plaintext. No source-derived non-greedy rule was found. Do not proceed to arbitrary pre-rune key searches under this impossible stationary model.

## Reproduction

`node sims/lp2_latin_renderer_collision_sft.cjs` from root. Core executed over the actual pinned inputs in the connector JS runtime; standalone wrapper not separately run. Inputs: canonical LP1 blob 37c96b816495c5f93ca658a01c9918bf92598316; corrected LP2 f7b534a33edeb212d427329798438325307463d7; chart/corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f.


## Independent author-era Latin witness and source-chart aliases (#2637)

The seven original conflicts above are **in unsolved ciphertext**, not in the solved corpus. Literal canonical expansion is a one-valued convention for numerical experiments; it is not the full historical Latin input alphabet.

Direct inspection of the preserved [2013 Gematria Primus JPEG](../resources/historical/cicada2013-gematria-jpeg.b64) shows C/K, S/Z, NG/ING and IA/IO printed explicitly (values 13, 53, 79, 107 respectively). The chart prints U alone. The independently preserved 2013 Cicada OS audio metadata for **The Instar Emergence** supplies the author-era Latin paragraph subsequently reused on original LP2 p57: the [historical source contract](../resources/external/2013-instar-xor-source.md) records the exact TXXX value from 761.mp3, including literal backslash-n pairs, and its historical JPEG-XOR/signed-payload control. This paragraph is not a later solver's rune expansion. The underlying audio tag is not individually PGP-signed; the already pinned original-stage artifact and its successful historical reconstruction support the source attribution.

Freeze the 29 canonical symbols plus the four chart aliases and the V→U mapping selected by the aligned word DIVINITY. Use a word-local longest-token matcher (length 3, then 2, then 1). Excluding the p57 rubric PARABLE, the 2013 Latin text produces **19/19 words, 88/88 runes** exactly, with punctuation differences left outside the rune test. Particularly discriminating: LIKE (K→C rune), TUNNELING (seven runes, terminal ING→ᛝ; no separate I), and DIVINITY (V→ᚢ). This source witness validates the alias representation on authentic known material. The frozen rule also produces all 45 groups / 184 runes of the separate Atbash-decoded LP1 WARNING from its repository English reference. That reference is solver-derived and the second test is a regression, not an independent author-supplied Latin prediction. No independently authored complete second Latin section was identified; neither IA/IO nor S/Z is independently exercised by the p57 passage itself.

### Checksum-selected spelling before consulting p57

The existing [original MP3 ID3 inventory](audio761-original-id3-frame-inventory.md) established the TXXX description `Parable 1,595,277,641` and the product identity for the three observed p57 clause sums. Here the numerical metadata is instead used as an **inverse constraint** on the independently supplied 2013 Latin text. Do not use the 2014 rune sequence, its lengths, or a greedy preference during candidate generation.

Enumerate all word-local chart spellings, admitting both merged and split digraphs/trigraphs, and allow the single uncharted V in DIVINITY to represent any of the 29 rune indices. Preserve the original two literal backslash-n boundaries. For each V choice the three lines admit 12, 1, and 4 parses. Of all 29×12×1×4 = 1,392 combinations, **exactly one** has the printed product of its three prime sums: V→U (index 1), sums 1259, 1031, 1229. The checksum-selected rune sequence equals all 88 original p57 body runes (both the normalized physical transcription and the corpus array), without using the p57 rubric, rune count, or any p57 rune value as a selection constraint.

The original chart aliases and greedy native orthography are documented in the corrected [GP29 source map](../results/2013-original-gp29-source-map.md) and [Agent41's 181-word calibration](../results/lp1-source-orthography.md). The novel result is exact finite checksum inversion over all possible source spellings, and the alias-aware negative bounds on unknown ciphertext, rather than rediscovery of the aliases or the prime product. The checksum determines this particular independently supplied Latin witness; it does not establish a universal non-greedy renderer, another plaintext, or a key.

**Boundary-free constructive inverse (Agent12, 24 November):** remove every space and punctuation mark from the 2013 Latin body, leaving exactly 94 characters. Do not supply word/line boundaries, factor order, rune count, or p57 rune identities to the search. Factor the metadata integer into the three primes and exhaust all six permutations, all 29 mappings of V, and every variable-length chart tokenization, including chart aliases that can cross former word boundaries. An exact memoized recursion on `(Latin offset, factor index, current prime sum)` accepts a rune if its weight does not exceed the current factor; at equality it must advance to the next factor. All weights are positive, so this exhausts every possible cut at a rune boundary. There is **exactly one complete path**: factor order `[1259,1031,1229]`, V→U, Latin character cuts `[34,64]`, rune cuts `[30,60]`, and 88 runes. The candidate equals all 88 original p57 body indices after the search. Independent local Python and connected JS implementations agree; the standalone CJS wrapper was preserved but not run separately in Node. This is a stronger constructive inverse of the known historical witness, not a new LP2 plaintext or evidence of checksum-selected cipher keys. It does not recover individual word spaces or punctuation marks. [SFT](../sims/lp2_parable_checksum_boundary_inverse_sft.cjs). For a new application one would need an independently supplied numerical target and a bounded ambiguous representation before searching unknown ciphertext; known factor boundaries are no longer necessary under this exact model.

### Exact inverse feasibility on unknown ciphertext

Instead of applying one arbitrary expansion and then re-rendering, allow **all combinations of the documented per-rune spellings**, including the witness-selected V. Work backward from each printed rune group, retaining one valid Latin suffix per first-two-character prefix. A greedy token is at most three characters; for a proposed alias, its legality is decided by the alias and at most the next two characters. Thus this DP exhausts all choices without an exponential expansion. Every retained exemplar is independently forward rendered to its exact original group.

Result: **192/2,896 printed groups (185 distinct rune strings) have no possible Latin alias expansion that renders back under this frozen greedy rule.** The original first p0 group already fails: its fixed adjacent E,O must merge to EO. The number is larger than the 175 canonical-mask failures above because the fuller chart also recognizes ING and IO; the tests constrain different alphabets.

Even a fully non-greedy stationary word-local renderer cannot rescue the source-alias representation. Four collision classes have no alternative spelling for any of their runes:

| Latin spelling | Rune variants (group counts) | Minimum errors |
|---|---|---:|
| EA | ᛠ (4); ᛖᚪ (1) | 1 |
| AET | ᚫᛏ (1); ᚪᛖᛏ (1) | 1 |
| EOE | ᛖᛟ (1); ᛇᛖ (1) | 1 |
| EO | ᛇ (1); ᛖᚩ (2) | 1 |

The lower bound is tight for an unconstrained oracle over the documented alias strings: choose ING for standalone ᛝ, INGIA for ᛝᛡ, and IOEO for ᛡᛇ, with canonical expansions elsewhere. This removes the three other literal collision classes without inducing any new class. Majority rendering for the remaining four gives exactly four errors. This assignment is a feasibility certificate selected from the ciphertext, not an authored spelling rule. No alias or non-greedy choice can eliminate the four forced classes under the independent per-rune expansion contract. A position/context/key-dependent renderer, a new spelling alphabet, or a cipher operating directly on rune symbols is not ruled out.

**Decision:** the independently authored Latin witness exists and confirms a standard alias-aware representation of the known passage, but the intended source-selected stationary pre-rune cipher branch still fails on original ciphertext. Do not launch another joint Latin-layer key search assuming that word-local rendering is sufficient. Reopen only if an independent source identifies a context/state-dependent segmentation operation or another complete Latin witness with such a rule. No unknown plaintext or key recovered.

**Reproduction:** from repository root, run `node sims/lp2_latin_alias_witness_sft.cjs`. The algorithm and original-input results were executed in the connected JS runtime; the standalone wrapper is supplied for independent rerun. The source chart was directly inspected, and the original p57 JPEG (archive 74.jpg) visually checked against the corrected canonical text.
