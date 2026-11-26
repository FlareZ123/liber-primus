# Independent-phase latent-word inverse (Agent 5)

Source: physical p54 red8 [19,21,23,27,2,14,10,19], its GP-prime residues [13,21,2,20,5,18,2,13], and authentic WELCOME q8 offsets [23,10,1,10,9,10,16,26], both signs. This tests the distinct H-decoy specialization in which neither word boundaries nor per-word phase are given. Canonical GP29, literal F hold, independent uniform phase per actual word. Lexicon is 95% weighted training words (first 80% of three donor texts, external TextBlob dictionary, solved native corpus), 5% singleton fallback. 31,629 distinct words, 77,636 trie nodes. Exact dynamic program sums dictionary/phase paths; prefix marginal includes strict extensions of an unfinished word. Key selected by 223-rune prefix only; suffix score is conditional log probability of remainder and final boundary, per 76 runes. Joint MAP path replayed exactly. Three 299-rune held-out literary donor controls, one each of positive keys, and matched iid pad controls. No printed separators used.

| Control | True key | Selected key | Prefix nats/rune | Held nats/rune | Held rune accuracy | Held boundary F1 |
|---|---|---|---:|---:|---:|---:|
| Gibran | red8+ | red8+ | -2.304797 | -2.121748 | 75/76 | 1 |
| Shakespeare | red8-prime+ | red8-prime+ | -2.121110 | -2.065621 | 70/76 | .918919 |
| Emerson | WELCOME+ | WELCOME+ | -2.186070 | -2.213864 | 76/76 | 1 |
| iid pad Gibran | none | WELCOME- | -4.596956 | -4.579112 | — | — |
| iid pad Shakespeare | none | WELCOME+ | -4.657643 | -4.431000 | — | — |
| iid pad Emerson | none | red8- | -4.477980 | -5.047887 | — | — |
| original p54 body+p55 | unknown | red8-prime- | -4.459031 | -4.735797 | — | — |

Calibration gate: all three keys correct, each held rune accuracy >=85%, held boundary F1 >=75%, held score above all pad controls. Passed. Original continuation falls in iid pad control range. Original MAP consists of fragmented words and 25 fallback singletons; no coherent plaintext. Original prefix/held score pairs for all six variants: red8+ (-4.679468,-5.074473); red8- (-4.738701,-4.465569); red8-prime+ (-4.625977,-4.481325); red8-prime- (-4.459031,-4.735797); WELCOME+ (-4.783913,-4.413690); WELCOME- (-4.680027,-4.876196). None approaches donor control scores.

This is a calibrated negative for these fixed keys and this independent-phase generative model, not for arbitrary q8 keys, permutations, nonuniform phase mechanisms, multi-rune OOV language or H-decoy in general. Exact replay is implementation validation, not evidence of plaintext. Positive donors come from final fifth of literary texts; their vocabulary may appear in external dictionary. Whole-span MAP boundaries use the entire ciphertext after prefix-only key choice, not prefix-only predictions of individual words. The core was actually executed via V8 on connector-returned input. Initial multi-file GitHub GraphQL write failed; smaller contents writes used for persistence.

Reproducer: `node sims/lp2_q8_latent_independent_phase_sft.cjs` and raw `im-results/lp2-q8-latent-independent-phase-output.json`. The exact connector inputs were corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native 1b064ef6d85819b7d96adaff31a82d1ec551598f, dictionary 140e1d22b5f8c45deddd2e8b25549d9d6307d938, Gibran df260a07d56bf5998d40a6360b6132c35c252d10, Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85, Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a. Node wrapper was not independently run.

## Unknown-cycle receiver
An unknown eight-digit GP29 additive cycle is identifiable only up to cyclic rotation when each word's phase is independent. For every possible latent start and every dictionary word with >=8 consuming glyphs, compute the contiguous key fragment (F must coincide with original 0), verify repeat-period consistency, and canonicalize the cycle. Rank distinct-start seed support and exact three/four-consuming word votes. First version retains top48 cycles, scores prefix marginal, and failed one of three held-out donor controls because the correct key was absent from the long-anchor seed set. It was therefore not applied to original ciphertext. Code `sims/lp2_q8_latent_independent_cycle_recovery_sft.cjs`; raw `im-results/lp2-q8-latent-independent-cycle-output.json`.

Extension: retain top128 six-consuming and top1024 seven-consuming fragments by internal 3/4-vote score and distinct-start support, exhaust the two/one missing residues, add one-coordinate neighbors of the highest-ranked cycles, then evaluate top64 prefix-only exact marginals. Only the prefix winner is decoded on the complete 299-rune sequence. Fresh donor windows start at least 300 words after the earlier held-out split; new random q8 vectors and independent phase seeds. All three fresh donors happen to have full-length correct seeds, so these controls validate the complete receiver but do not independently establish that completion specifically repairs missing seeds.

| Test | Prefix nats/rune | Held nats/rune | Hidden key recovered | Held glyphs |
|---|---:|---:|---|---:|
| Gibran | -2.272844 | -2.390252 | yes | 74/76 |
| Shakespeare | -2.412742 | -2.042064 | yes | 76/76 |
| Emerson | -2.150708 | -2.074749 | yes | 74/76 |
| iid pad 0 | -4.092088 | -4.472625 | — | — |
| iid pad 1 | -4.121164 | -5.005260 | — | — |
| iid pad 2 | -4.178696 | -4.415477 | — | — |
| p54 body+p55 | -4.141411 | -4.234713 | unknown | — |

Original prefix search generated 931,130 distinct full anchors, 1,015,127 six-fragments and 1,013,140 seven-fragments, completed 136,224 cycles and expanded 13,675 neighbors. Winner [2,3,24,3,12,22,11,21], canonical rotation; no full-anchor support and no coherent prose. Its held score is slightly better than all three iid controls, but still 1.84 nats/rune below the weakest genuine-text control; prefix lies within iid range. Do not call this an exact arbitrary-key exclusion or a statistical rejection at a specified confidence level. This is a calibrated heuristic search with finite lexicon and phase/clock assumptions. No original plaintext or key authenticated. Candidate selection uses first 223 runes only; MAP full-span uses the 76-rune continuation to infer its latent boundaries.

Completion reproducer `node sims/lp2_q8_latent_independent_cycle_completion_sft.cjs`, raw `im-results/lp2-q8-latent-independent-cycle-completion-output.json`; both executed in connector V8, not independent Node/CI.
