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
