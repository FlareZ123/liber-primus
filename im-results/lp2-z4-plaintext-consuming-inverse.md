# Plaintext-consuming silent-symbol inverse (Round 48 Z4 alternative)

Agent12, 2026-11-27. This is a concrete known-key constructive test of an expanded-alphabet erasure channel, distinct from [the prior silent-retry test](lp2-round48-z4-exact-law-and-prime-retry-gate.md), in which a silent accepted candidate retries the same plaintext. Here a silent accepted candidate consumes a plaintext rune. This tests one realization of the newly proposed 36-symbol latent picker; neither the latent alphabet nor this key transport is authenticated. No new plaintext or key recovered.

## Sender and receiver

Latent symbols 0..35; only 0..28 are printed. For each GP29 plaintext rune p, propose c=(p+K[t]) mod36. Advance the cyclic key phase for each attempt. If c equals the last accepted latent symbol, retry the same plaintext until c differs. Otherwise accept c, remember it and consume p, printing c only if c<29. The candidate keys are the known LP1 GP ordinal vectors DIUINITY (8) and FIRFUMFERENFE (13), transported to mod36 as a deliberate hypothesis. No F interruption, reset inside the interval or punctuation consumption. Initial latent state is a sentinel; all initial key phases are allowed. Controls use fixed independently selected initial phases.

The exact best-path decoder uses states (phase, last latent c, last plaintext p). For each observed rune, max-priority closure explores arbitrary numbers of silent edges, followed by one edge emitting the required rune. Bigram log probabilities are strictly negative, so Dijkstra-style max-score relaxation over this finite state space terminates and produces the maximum joint plaintext-path score for the fixed model. It is not the marginal probability of the observed string. All returned paths are forward-replayed exactly. No terminal silent suffix is inferred, since it can never improve the joint score; control truth is truncated to its last visible emission. Add-0.5 GP29 bigrams trained on first five records of native solved corpus; remaining four records are independent native-text test controls (not independent historical ciphertext under this channel). No search over invented keys, alphabet sizes or target resets.

## Results

|Key|Target|Visible|True plain length|Decoded length|Edit distance|Joint log score / visible rune|Observed repeats|
|---|---|---:|---:|---:|---:|---:|---:|
|DIUINITY|jpg107-167|260|319|310|70|-2.992108|1|
|DIUINITY|jpg229|78|88|89|9|-2.776929|0|
|DIUINITY|p56|69|85|82|22|-3.120838|2|
|DIUINITY|p57|80|95|90|13|-2.954066|0|
|FIRFUMFERENFE|jpg107-167|292|319|318|14|-2.841638|1|
|FIRFUMFERENFE|jpg229|84|89|89|0|-2.705809|0|
|FIRFUMFERENFE|p56|75|85|84|9|-3.000504|0|
|FIRFUMFERENFE|p57|86|95|93|8|-2.771849|0|
|DIUINITY|original p0 black–p2|716|—|931|—|-4.094681|—|
|DIUINITY|original p54 black–p55|299|—|377|—|-3.974496|—|
|FIRFUMFERENFE|original p0 black–p2|716|—|836|—|-3.881506|—|
|FIRFUMFERENFE|original p54 black–p55|299|—|363|—|-3.937046|—|

All twelve decoder paths replay their corresponding visible tape. Control phase recovery 5/8; exact plaintext recovery 1/8. Even a known-key receiver has substantial erasure ambiguity. No claim of key recovery. For both original intervals the scores are below every control for the corresponding key, and previews are nonprose. Example q13 opening: THIDAEEWRYOSNEAIANBABGJROIOUIANADILYYHNNPWCEOIMATYOBXPBPNEYBXTTHEGPTTYNULTYOINDYHAPUCTOSNOTTHPISYHPMPAYHIANGDJEALMNTHINOEYOTYAENGIAPWEMY. This is a best joint path, not a candidate solved passage. Original tape is canonical; opening removes 13-rune red title, terminal removes 9-rune title; remaining page boundaries are continuous.

**Decision:** direct transport of these two authentic LP1 key vectors to this mod36 plaintext-consuming channel gives no useful original recovery. The lower original scores are descriptive only, not a calibrated rejection threshold, since plant sizes and hidden fractions differ. The known-key control is incomplete: erasure/retry ambiguity can destroy recovery even when the key is correct. Do not use this result to exclude other silent-symbol constructions or the historical keys under other receivers. A genuine source-selected latent clock or independent side information would justify stronger recovery instruments; no such selector has been established. This is not an explanation of T7.

Reproduce: [sims/lp2_z4_plaintext_consuming_inverse_sft.cjs](../sims/lp2_z4_plaintext_consuming_inverse_sft.cjs), commit 48d7e556a7c259709fc87423a5407004c78ac778. Actual connected V8 execution of the committed experiment function; standalone Node wrapper not executed. Inputs: canonical LP2 corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native solved corpus blob 1b064ef6d85819b7d96adaff31a82d1ec551598f.


## Receiver-independent ambiguity certificate

The control errors motivate an exact injectivity test independent of the bigram decoder. For each initial phase and each possible incoming latent symbol (36 ordinary labels and the fresh sentinel), exhaust every length-two GP29 plaintext string. Bucket results by (visible ciphertext sequence, final phase, final latent symbol). A collision gives equal-length distinct plaintexts that remain indistinguishable under every common suffix, including one whose state is independently revealed. Require nonempty visible output. Separately enumerate the 272 distinct nonempty native GP word tokens extracted from all nine solved records, comparing only equal-length tokens with identical outputs and endpoints.

|Key|Initial states incl. sentinel|States with nonempty-output length-two collisions|States with native word collisions|Native word pair/state collisions|
|---|---:|---:|---:|---:|
|DIUINITY|296|287|181|423|
|FIRFUMFERENFE|481|418|175|176|

Concrete exact witnesses (cipher indices are zero-based GP):

- DIUINITY, phase 0, incoming latent 0: HERE [8,18,4,18] and WERE [7,18,4,18] both emit [28,5,28], end phase 4 and latent 28.
- Same initial state: WE [7,18] and HE [8,18] both emit [28], end phase 2 and latent 28.
- Same initial state: GO [6,3] and NO [9,3] both emit [13], end phase 2 and latent 13.
- FIRFUMFERENFE, phase 1, incoming latent 0: MAY [19,24,26] and DAY [23,24,26] both emit [28,26], end phase 4 and latent 26.

These collisions prove the two fixed senders are not injective even conditional on known exact initial and final states, visible output, and plaintext rune count. Visible token boundaries would not distinguish these native word pairs either. Identical future ciphertext under a common suffix follows from equal end state. This is stronger than a failure of a particular statistical decoder. It does not establish that any of these words occurs in unknown LP2 plaintext, or rule out the sender under additional linguistic constraints or a separate side channel.

Reproducer: [sims/lp2_z4_plaintext_consuming_collision_sft.cjs](../sims/lp2_z4_plaintext_consuming_collision_sft.cjs), commit 234479ce9317cd66c9ed47164df51712ca58b063. Exact connected V8 enumeration and forward assertions executed; standalone Node wrapper not run. Same pinned corpus inputs as above.

## Word-level exact inverse and terminal red-heading receiver (Agent12, 27 November 15:30 UTC)

**Decision:** preserving the physical printed groups materially improves the fixed-key receiver on native plants but excludes the tested mod36 sender on the actual terminal black-body interval under a finite native/English lexical model. This includes the source-motivated p54 red8 vector, without asserting that red8 is an authentic key or that printed groups are plaintext words.

Use the corrected p54–55 grouping: 47 complete p54 black groups, one eleven-rune cross-page carry, 16 complete p55 groups (64 total, 299 visible runes). The source fixture is `resources/liber-primus/lp2-page-groups-54-55-derived.json`; the flattening is asserted equal to the canonical corpus after the nine red heading runes. The receiver traverses a 33,390-form GP29 trie (TextBlob frequency lexicon normalized under the two specified ING/IO spelling choices, plus all nine native solved records, maximum word length 24). State is (phase, previous accepted latent symbol). An edge for a printed group exhausts every lexical word and every silent latent emission compatible with that group, retaining the highest-frequency word per final state. Entirely erased lexical words are handled by exact maximum-score epsilon closure. The DP minimizes OOV groups, then maximizes summed log lexical frequency. An OOV group is deliberately granted an arbitrary outgoing state: this is a relaxation yielding a necessary lower bound, not a valid replay of an unknown word. Exact zero-OOV control paths are forward-replayed; no beam clipping or key fitting.

The first two known-key native-plant results improve from 1/8 exact plaintext recoveries in the earlier bigram instrument to 3/8, with 6/8 initial phases recovered and only 15 total rune edits; all eight replay. The four native texts appear in the lexicon and the encryption is synthetic under this proposed channel, so these are instrument controls, not independent historical decryptions or held-out vocabulary tests. Additional source red8 plants with supplied phases and incoming latent 24 yield one exact plaintext and five rune edits across four controls; all replay. No claim of blind phase recovery for those four.

| Key vector | Fit minimum OOV / 47 | Full minimum OOV / 64 | Independently arbitrary incoming state: no lexical word / 47 | Independently arbitrary incoming state: no lexical word / 64 |
|---|---:|---:|---:|---:|
| DIUINITY | 35 | 45 | 35 | 45 |
| FIRFUMFERENFE | 35 | 46 | 34 | 44 |
| Original p54 red8 [19,21,23,27,2,14,10,19], enlarged initial A=24, phase 0 | 34 | 44 | 34 | 44 |

The last two columns are stronger receiver-independent coverage statements: every one of q×37 possible initial (phase, previous latent) states is allowed **independently for every printed group**, including the fresh sentinel. The 44–45 impossible groups cannot be repaired by a different incoming clock, arbitrary intervening silent words, or resets at the printed boundaries, if each printed group must derive from one in-register plaintext word under this fixed sender. The FIRFUMFERENFE continuity relaxation adds two incompatible groups beyond the independent lower bound. No recovered original word is authenticated; the relaxed partial paths with [ ? ] placeholders are not complete decodings. All tested keys require at least 68.75% of original groups to be outside the finite lexical model even with independent state relaxation. Do not extend these three fixed-key lexical receivers or fit arbitrary reset policies. Changed word membership, arbitrary unknown keys or another sender are not excluded.

Artifacts: [shared exact trie inverse](../sims/lp2_z4_wordlex_inverse_sft.cjs), [red8-only wrapper](../sims/lp2_z4_wordlex_red8_sft.cjs), [historical-key raw](lp2-z4-wordlex-inverse.json), [red8 raw](lp2-z4-wordlex-red8.json), [independent-state raw](lp2-z4-wordlex-independent-state.json). First two historical controls executed in connected V8 at 3015c774c1284b44786da83037d81b825fe35ab8, red8 at 206f0edd0e63b1360111984d41557289d9d65503, independent-state historical coverage executed separately using the consolidated implementation; standalone Node wrapper not executed. Source input blob IDs recorded in each raw output.

## Unknown q8 key recovery from long original groups (Agent12, 27 November)

**Decision:** under this exact mod36 sender, a shared cyclic eight-digit key over 0..28 cannot explain both of the two longest complete p54 black-body groups as in-register words with at most two silent accepted plaintext runes each. Even permitting one anchor to be OOV or have more erasures, every key recovered from the other anchor fails broad terminal word coverage.

The search exhausts dictionary words of lengths 10–12 (5,844 distinct GP29 forms), arbitrary incoming latent states, cyclic starting phases, and every possible collision retry. Rotate the unknown key to the phase of the first accepted visible rune, enumerate the at most two preceding erased plaintext positions, and branch on visible, silent, or repeated candidates for the first eight attempts. The first visible rune fixes the first key digit. From that point at least ten accepted visible emissions remain including the first, so a full cycle is always determined. Once all eight digits are assigned, forward-replay the remainder, then replay the entire proposed word for every initial phase and predecessor to establish an exact witness. A repeated visible pair necessarily requires an intervening silent accepted rune; that requirement gives a safe pruning bound. The original initial-attempt enumeration reached its 40M node cap before finishing either control; that is an instrument failure, not a negative result. The rotated search completed all four cases under the revised 160M ceiling.

| Anchor | Nodes | Distinct rotation classes | Complete |
|---|---:|---:|---|
| Synthetic native INTELLIGENCE, two erasures | 15,078,058 | 3 | yes |
| Synthetic native INSTRUCTIAN, one retry | 30,828,347 | 64 | yes |
| p54 black group 12 (zero-based), n78hl0o5b1 | 17,527,680 | 1 | yes |
| p54 black group 45, 8so5ajebji | 23,968,492 | 2 | yes |

The planted intersection uniquely recovers the true rotation class [3,28,8,17,6,11,4,20]. The original intersection is empty. Both synthetic native words are in the finite register by construction, with no independent-vocabulary claim. Both original anchors are in the 47-group p54 training prefix. No p55 words participate in key generation.

The three single-anchor key classes and their exact dictionary witnesses were subsequently passed to the full all-state trie receiver, now allowing any number of silent accepted runes within any in-register word (length up to 24). Each group is granted every incoming state independently:

| Single-anchor key rotation | Witness | No lexical word / 47 p54 fit | No lexical word / 17 remaining | No lexical word / 64 |
|---|---|---:|---:|---:|
| 0,25,20,28,3,7,1,16 | OSCILLATIAN | 32 | 10 | 42 |
| 3,25,15,26,28,15,13,23 | CONSERUATION | 31 | 11 | 42 |
| 0,10,13,23,3,25,15,25 | CONTINUATION | 34 | 11 | 45 |

These isolated words are accidental compatible inverses, not recovered plaintext. A shared q8 sender with either eligible anchor therefore requires at least 31 out-of-register p54 groups, even granting independent incoming states. The 17-group continuation, including the crossing group, was untouched during key construction. No universal rejection of other periods, segmentation, vocabulary, or erasure rates; no new original key or plaintext.

Artifacts: [optimized exhaustive anchor search](../sims/lp2_z4_unknown_q8_anchor_inverse_sft.cjs), [initial capped run](lp2-z4-unknown-q8-anchor-inverse.json), [complete first-visible run](lp2-z4-unknown-q8-anchor-inverse-first-visible.json), [single-anchor union and coverage](lp2-z4-unknown-q8-anchor-union-coverage.json). Complete actual V8 execution at 3b7e52505164d665bd6a2353d36f3f22fd64b70d; union coverage at c38cb9127a0c45298d3849d5cc3e5ec126c00868. Standalone Node wrapper not executed. Do not repeat this q8 two-anchor model without independent evidence that both anchors fall outside the <=2-erasure finite register.
