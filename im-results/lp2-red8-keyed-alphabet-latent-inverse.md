# p54 red-eight keyed alphabet: exact latent-boundary inverse

**Decision (26 November 2026, Agent3):** no original plaintext or key. All eight fixed rubric-derived alphabet/mapped-shift receivers yield no coherent native prose on the corrected p54–55 body, even freeing every printed word boundary and word phase. This is a distinct fixed-source exploratory alternative to the arbitrary alphabet search in #2722, not a rejection of all common-cycle actions.

## Motivation and scope

The original p54 red heading is an enlarged A followed by eight red GP29 glyphs K=[19,21,23,27,2,14,10,19]. Classical mixed-alphabet construction deduplicates a keyword followed by the canonical alphabet. The visible rubric could therefore supply an alphabet as well as the shifts. The stronger rival is ordinary encrypted rubric prose. No first-party instruction selects this double use, and the authentic solved pages do not establish it. Earlier keyed-alphabet terminal calibration is withdrawn due to physical-fragment segmentation; this test uses the corrected body and removes both printed starts and the printed length inventory.

Freeze two prefixes (red8 or A+red8), two ways to fix F at coordinate zero (rotate a standard deduplicated keyword alphabet to F, or prepend protected F before deduplication), and both additive signs. The key is the original red8 mapped through the alphabet, with sign. Sender C=inv(pi(P)+k[j] mod29), with optional native plaintext-F bypass. Every true word independently chooses either ordinary or F-holding mode and any initial phase. This grants more freedom than a fixed continuous historical clock. Original input is the exact 299-rune black body, 64 complete printed groups including the 11-rune p54/p55 carry. Require 64 latent words, permit arbitrary lengths and starts. The 33,394-form register includes TextBlob GP forms under two contraction conventions, native solved words and all 29 singletons.

## Exact inverse and original outcome

At each offset enumerate all phases and both F modes through the dictionary trie. Visible ciphertext F may be held or consuming when legal. Because state is independent between true words, retaining the best-scoring lexical inverse for each length is sufficient. A shortest-path DP over (word count, rune offset) minimizes OOV words; OOV components are capped at 13 runes, the longest printed group, while lexical edges retain all lengths. A second DP allows unbounded OOV lengths and minimizes OOV rune count for exactly 0–3 unsupported groups. All reconstructed paths replay exactly. Score tie-breaks are diagnostic.

| Prefix length | Alphabet convention | Sign | Minimum OOV groups, cap13 | Longest lexical edge anywhere | Minimum unsupported runes for 1 / 2 / 3 unrestricted OOV groups |
|---:|---|---:|---:|---:|---:|
| 8 | rotate to F | + | 14 | 4 | 165 / 157 / 157 |
| 8 | rotate to F | − | 13 | 5 | 158 / 156 / 154 |
| 8 | F first | + | 13 | 4 | 156 / 149 / 148 |
| 8 | F first | − | 14 | 5 | 156 / 154 / 153 |
| 9 | rotate to F | + | 14 | 4 | 162 / 155 / 155 |
| 9 | rotate to F | − | 13 | 4 | 155 / 148 / 144 |
| 9 | F first | + | 13 | 5 | 160 / 150 / 148 |
| 9 | F first | − | 14 | 4 | 155 / 153 / 151 |

Zero-OOV paths do not exist. No map admits a dictionary word longer than five runes anywhere in the original. With three unrestricted OOV groups, at least 144/299 original runes must remain in unsupported intervals, even in the best model. One unrestricted OOV group can instead swallow a very long segment, explaining why a bare OOV-word count is misleading. These are necessary costs, not recovered plaintext.

Three controls encrypt genuine solved text under three frozen maps with independently generated per-word phases and F rules; boundaries are hidden, total word count is supplied. The lexicon includes donor words, so the controls calibrate inverse-path implementation, not independent language coverage.

| Source | Runes | Min OOV | Agreement of best witness |
|---|---:|---:|---:|
| 0_welcome | 255 | 0 | 255/255 |
| 0_loss_of_divinity | 270 | 0 | 268/270 |
| 0_koan_1 | 221 | 0 | 221/221 |

All witnesses replay; no original candidate is coherent. Retire these eight fixed rubric-keyed alphabets and mapped keys under the named count/register assumptions. Arbitrary secret alphabets, unrelated keys, different registers or true word counts remain outside scope. The data do not justify enlarging the fixed alphabet pool.

## Reproduction

`node sims/lp2_red8_keyed_alphabet_latent_sft.cjs` from root. [SFT](../sims/lp2_red8_keyed_alphabet_latent_sft.cjs), [raw outputs](lp2-red8-keyed-alphabet-latent-output.json). The same JavaScript core executed in connected V8 on pinned inputs; standalone Node wrapper not separately run. Input blobs: resources/liber-primus/lp2-corpus.json = 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; resources/liber-primus/lp2-page-groups-54-55-derived.json = 8960e113af36ee46186965e394ec6be18d69b74f; resources/control/english_wordfreq_textblob.txt = 140e1d22b5f8c45deddd2e8b25549d9d6307d938; resources/external/relikd-solved-gp29-native-v1.json = 1b064ef6d85819b7d96adaff31a82d1ec551598f. Related: [common-cycle decision](lp2-shared-gp29-cycle-action-calibration.md), [canonical all-q8 conserved-inventory test](lp2-u2b-periodic-q8-anchor.md).

## One rubric-mixed alphabet with all primitive q8 shifts (Agent1, 26 November 2026)

**Decision:** the conventional rubric-derived mixed alphabet used on exactly one side, with canonical GP29 on the other and **all** primitive eight-phase shift vectors, cannot yield 44/47 lexical training groups on p54 under the fixed 38,910-form register. Unlike the preceding fixed mapped-shift/common-alphabet model, this is a Quagmire I/II-style two-coordinate model and determines unknown shifts constructively. No original plaintext recovered. The rubric is a speculative source for the mixed alphabet, not an authenticated instruction.

Freeze the standard deduplicated keyword followed by canonical alphabet construction for the visible eight red runes or the enlarged A plus those eight. Use the resulting input alphabet A with canonical B or vice versa, four distinct models. For P != F, C=B^-1(A(P)+k[j] mod29), consume one phase; P=F emits literal zero, holds phase. Every complete word has an arbitrary initial phase. The sign is absorbed into unrestricted k; coordinate rotations are equivalent to changing k, not additional models. No carry-prefix fit: training consists only of the first 47 complete black-body groups (213 runes); withhold the entire 11-rune cross-page word and 16 complete p55 words (86 runes, including 10 p54 prefix runes).

### Complete key-domain receiver

For a group with at least eight nonzero ciphertext symbols, every legal plaintext consumes at least eight phases. Enumerate all equal-length forms in the independent TextBlob GP register (all legal digraph/ING parses, 38,910 distinct forms). The word and observed ciphertext determine k[j]=B(C)-A(P) on each consuming event, starting at an arbitrary canonical phase zero; reject inconsistent revisits or F under nonzero C. All eight shifts are determined, quotient by cyclic key rotation and reject nonprimitive keys. Pick four anchors based only on ciphertext nonzero count, length and original index. Any action with at least 44/47 lexical support has at least one lexical member in these four anchors. Thus the union of their complete key domains exhausts every qualifying action, not every possible q8 action. All remaining keys miss all four and have support at most 43. Test every seeded action on all 47 groups, admitting both legal ciphertext-F alternatives and every phase, require at least one legal inverse even at unsupported groups. Replay every lexical witness under its recorded phase. The original anchors are groups 45,12,0,13 (zero-based). No language score selects or changes the models.

### Blind action recovery on matched controls

Four separately keyed plants match all 47 training lengths, 213 runes, exactly three ciphertext F and two adjacent equalities. Two generated OOV groups include length-ten group45. The known model and ciphertext (not k or starts) enter the receiver. Entire carry and all 16 held words are independently encrypted. For each known family the solver returns exactly one qualifying action, equal to truth modulo rotation, and retains the true word in 17/17 held candidate sets. This is predictive action recovery given the fixed model, not proof of unique plaintext in every word or blind discrimination among alphabet families. Control support 45/46/45/45 reflects alternative legal lexical paths even in one nominal OOV group.

| Model | Control keys enumerated | Control unique exact action | Original anchor key counts | Original unique seeds | Original best support among seeds | Original >=44 actions |
|---|---:|---:|---|---:|---:|---:|
| red8 input | 10,839 | yes | 2,3,5412,5412 | 10,829 | 17 | 0 |
| red8 output | 10,834 | yes | 5,17,5412,5412 | 10,846 | 16 | 0 |
| red9 input | 10,864 | yes | 0,4,5412,5411 | 10,827 | 17 | 0 |
| red9 output | 10,840 | yes | 0,17,5412,5412 | 10,841 | 18 | 0 |

All 43,343 original anchor keys were tested. The strongest observed support among anchor-seeded actions is 18/47, not the global maximum over all 29^8 shifts. The exact global upper bound established here is 43/47, since an action outside the anchor union can miss all four. No training action qualified, so no held-original scoring was performed. This does not exclude another independently selected alphabet, different clock, word segmentation, source register or larger OOV allowance.

[Read-only CJS inverse](../sims/lp2_red_rubric_one_mixed_q8_inverse_sft.cjs) frozen at a8fea67f8a5b0c5fcee8a1869661d011604a5415; [matched controls](lp2-red-rubric-one-mixed-q8-control-output.json) c9f796f9c0e30821c6c8c341915dec74a44d9f17; [original complete domain outputs](lp2-red-rubric-one-mixed-q8-original-output.json) 2bdb13aa2d7e9abd46daf0b606f6b23cb9d28ea5. Exported core actually executed in connected V8 on pinned repository inputs, control before original; standalone Node wrapper not run. Related [two-alphabet oracle result and common-cycle calibration](lp2-shared-gp29-cycle-action-calibration.md). Do not enlarge the mixed-alphabet pool without a source-selected operand. This receiver is inexpensive if an independent future clue fixes both coordinate alphabets, and its exact anchor coverage also permits a bounded set of such pairs.
