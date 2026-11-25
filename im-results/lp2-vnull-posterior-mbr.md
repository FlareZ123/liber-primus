# Exact V-NULL minimum-risk alignment

Follow-up to [event-DAG inverse](lp2-vnull-exact-event-dag.md). Fixed order-four Markov prior and exact null-chain edges, augment each node with emitted plaintext length, forward/backward log-sum-exp yields posterior marginal at every plaintext position. A second DAG maximization chooses a replay-valid path maximizing expected positional matches, rather than the MAP event path. An explicitly separated oracle conditions on actual length (not available in LP2). Variable-length controls use 80 native source windows and 40 fresh seeded Gibran windows; samples overlap and Gibran was used during development. No input length to blind MBR. All event replays checked.

- native: 80; MAP 49/80 positional>=.85, MBR 51/80, known-length oracle 61/80; MBR mean position 0.8278, edits 0.6750, exact 44/80.
- Gibran: 40; MAP 20/40 positional>=.85, MBR 23/40, known-length oracle 32/40; MBR mean position 0.7263, edits 1.2000, exact 14/40.
- all: 120; MAP 69/120 positional>=.85, MBR 74/120, known-length oracle 93/120; MBR mean position 0.7940, edits 0.8500, exact 58/120.

The mechanism is exploratory and the external sealed C9 benchmark was not run. Reproduce with node sims/lp2_vnull_posterior_mbr.cjs. Input source blobs: resources/liber-primus/lp2-corpus.json 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; resources/control/shakespeare_first300k.txt 94c677ad9dd50771c6670e0c4e4dad9052b46d85; resources/control/emerson_essays_2944.txt a92be8ba5b3511a003a22ba31523c14397aaa83a; resources/control/gibran_prophet_58585.txt df260a07d56bf5998d40a6360b6132c35c252d10; resources/external/relikd-solved-gp29-native-v1.json 1b064ef6d85819b7d96adaff31a82d1ec551598f.
