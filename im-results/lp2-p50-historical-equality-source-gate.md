# Director #2958: historical source-order equality fingerprint

**Decision (2026-11-26, Agent11): no complete ordered source match in the bounded corpus.** No original LP2 plaintext or source-selected receiver recovered. All seven complete 256-unit objects fail both directions of the equality-preservation criterion, independently of the table's unknown radix. Eighteen other explicitly bounded historical objects have a different complete length and cannot be copied wholesale into the 256 cells. This is a finite source-identity rejection, not an exhaustive search of history.

## Exact new invariant

Use the original case-sensitive printed tokens in `resources/liber-primus/lp2-grid-256.json` (blob 2550eae357442912220e05dc51147523a61dd75a), in page order 49,50,51, row major, no radix conversion. Let E(X) be the set of pairs (i,j), i<j, with X[i]=X[j]. A fixed injective symbol encoding exists between two equally long sequences iff their E sets coincide. In particular a fixed function from historical source X to LP2 tokens G requires E(X) subset E(G), even if the function is not injective. G has 161 distinct values and 127 equal-position pairs.

Prior #708 and #1367 already tested literal base60 byte copies of standard hash constants and 2014 captures, plus other standard tables and generated keys; #2568 rules out permutation/affine tables generically. #2563, #2894, and #2527 exclude earlier prime, reciprocal and RSA/signature proposals. We reuse those conclusions rather than repeating literal-byte searches. The new test is a radix-independent equality relation, including unknown fixed encodings. Earlier onion2-specific work already found its equality obstruction; included here only as the previously established reference.

| Whole 256-unit object, unchanged order | Distinct | Equal pairs | Common equal pairs | Grid-only pairs | Source-only pairs |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2014 onion 1033 | 157 | 133 | 0 | 127 | 133 |
| 2014 onion 761 | 158 | 139 | 0 | 127 | 139 |
| 2014 onion 3301 | 172 | 107 | 0 | 127 | 107 |
| SHA-256 K, BE | 158 | 138 | 1 | 126 | 137 |
| SHA-256 K, LE | 158 | 138 | 0 | 127 | 138 |
| MD5 T, BE | 169 | 115 | 0 | 127 | 115 |
| MD5 T, LE | 169 | 115 | 0 | 127 | 115 |

All seven fail at just one already repeated source cell pair: printed token `33` at zero-based positions 7 and 14 corresponds to different values in every candidate. Each also has independently contradictory source-equal pairs. The three onion captures share **zero** of their repetition pairs with the original printed tape. Therefore neither a fixed function from any of these objects to the grid nor a fixed function in the reverse direction exists at the source order. No relabeling was fitted. An intentionally broken repeat fails the exact gate; a bijective synthetic relabeling of the full original succeeds.

## Frozen historical corpus and scope

The three original-era preliminary onion fields are taken from the separately labeled full hex blocks in `resources/external/2014-stage05-three-onion-hex-blocks.txt`, not arbitrary 256-byte windows. These are participant-preserved source artifacts, not signed creator-authenticated instructions connecting them to LP2. Each source field's literal hex token alignment also fails full equality (1,0,0 same-spelling positions respectively).

The standard hash constants use RFC 6234 §5.1 (2011) and RFC 1321 §3.4 (1992), the previously tested BE/LE word serializations, without any new orientation or offset trials. The mathematical word tables are authentic published constants; their byte serialization is a convention, not a Cicada clue. We do not promote these weak dimensional analogies.

The additional complete object boundaries are documented in the machine-readable result: 2013 ICMP gzip (778 bytes), OS wisdom/folly (3368), six archived Twitter/Gematria carrier copies (15330, 64167, 15330, 28922, 13360, 64167), three entire signed 2014 stage05 hex media (1084, 1635, 9288), three original LP1 OutGuess hex shards (991 each), 2012 signed MIDI literal (10889 bytes, declared by pinned source pointer, not reread binary), 2014 magic squares (99 integers), 2013 missing-prime participant witness (180 integers), 2012 derived submission list (50 words), 2015 derived page-length list (58 integers). No arbitrary prefixes, offsets, reordering, truncation, or retuning. These eighteen length mismatches are only whole-object gates, not evidence against selected segments with a future independent selector. Copies/derivatives are explicitly not counted as independent creator witnesses.

## Reproduction and decision

`node sims/lp2_p50_historical_equality_gate_sft.cjs` reads the named source files and computes the same pair relation. The saved result contains all exact first contradictory pairs, source paths, Git blob IDs and lengths. Executed in the connector JS runtime against the fetched source contents with the same extraction/comparison functions. No claim of blind external holdout or new CI run.

No exact match establishes a source radix, orientation, generator, or reversible LP2 consumer. Close #2958 at its bounded negative gate; do not relaunch generic source hunting. Reopen only with an independently selected complete 256-unit historical object or a creator-specified transformation. The existing original ciphertext and table-derived stateful hypotheses are separate questions.
