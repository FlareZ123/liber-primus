# Bash 4.2 / source-ranked PGP timestamps / GP29 keyskip1

**Director #2668 — bounded negative.** All 433 frozen seeds and 500 wrong-seed controls were decoded over 12,956 original unknown LP2 runes. No candidate reaches the frozen language or prefix skip gate. Retire the exact Bash 4.2 LP64 / offset-zero / unbiased 15-bit reduction / capped-one-rejection / additive conjunction. No unknown plaintext or authentic key recovered.

## Source-selected mechanism

The historical [Bash 4.2 tag, commit 495aee441b75276e38c75694ccb455bb6463fdb9, variables.c](https://github.com/gitGNU/gnu_bash/blob/495aee441b75276e38c75694ccb455bb6463fdb9/variables.c) implements `sbrand` (unsigned long seed via strtoul; last_random_value=0), `brand` (zero seed replaced with 123459876; state update 16807*(s mod127773)-2836*floor(s/127773), unsigned-long wrap, mask 32767), and `get_random_number/get_random` (reject repeated output and record last accepted raw output). The historical negative-state correction is disabled by preprocessor condition. LP64 unsigned 64-bit wrap is essential for wide seeds; do not substitute modern Bash or canonical Park–Miller modulo 2^31−1. The chosen x86-64 LP64 platform is plausible, not established. The exact complete Ubuntu 12.04 executable was unavailable; executable cross-check was against the extracted historical C logic compiled on local LP64 using cc -O2. Seven seeds, including 0, 1, 2^31−1, 2^32−1, 1325734783 and 20170404232328, agree 140/140 raw values; [vectors and controls](agent20-2668-bash42-control.json). Wide seeds were preserved, not truncated.

Fixed unbiased reducer: reject raw outputs 32741..32767, then mod29. The canonical input is [corpus](../resources/liber-primus/lp2-corpus.json) blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; 12,956 runes and 86 adjacent equal events. The [L8 source seed JSON](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round18/L8-provenance/TIMESTAMP-SEED-CANDIDATES.json) blob 49d32c4b5edb4355d97ce8025279e9e0bb63825f corresponds to [compact 433-seed snapshot](agent50-2667-pgp-seeds.json) blob 55d8323e473e454cdedaa61fd70f08fc18d23396. Of those 433 integers, 112 exceed 32 bits. All 433 distinct integer seeds were scored; distinct seed integers need not imply distinct generator streams.

## Fixed decoder and control

[Pre-original decision rule](agent20-2668-preregister.md) and [SFT](../sims/lp2_bash42_pgp_keyskip1_sft.cjs). Reuses #2667's width64 GP29 conditional trigram beam trained on Gibran and Emerson. At most one collision-triggered skipped key per rune; continuous additive C=P+K mod29, offset zero. A skipped draw must reproduce previous ciphertext under the accepted plaintext rune. Final 512 runes are held out from selecting the winning prefix state. No printed word order or separators used. This is a distinct calibrated native-rune decoder, not Dukotah's original width400 maxskip3 character-quadgram beam.

| Control | Recovered runes | True/inferred skips | Prefix skips | Held-out runes | Prefix nats/rune | Holdout nats/rune |
|---|---:|---:|---:|---:|---:|---:|
| Shakespeare seed 305419896 | 12949/12956 | 367/367 | 357 | 512/512 | -2.428576 | -2.567371 |
| Shakespeare wide seed 20170404232327 | 12955/12956 | 394/394 | 373 | 512/512 | -2.428819 | -2.567371 |
| Repeated authentic solved GP29 seed 2578103244 (post-sweep independent register check) | 12955/12956 | 369/369 | 351 | 512/512 | -2.427628 | -2.447500 |

Third plant repeats the 2,979 authentic solved GP29 runes ([transcription](../resources/external/relikd-solved-gp29-native-v1.json), blob 1b064ef6d85819b7d96adaff31a82d1ec551598f). The repeated source is a register control rather than independent natural full-book prose. All three forward replay exactly. Neither original text semantics nor other languages are guaranteed by these controls.

## Original decision

500 distinct noncandidate seeds: 371 uint32 and 129 wide LP64 integers, frozen xorshift seed list. All 433 historical seeds and all 500 nulls scored across the entire original tape, 12,087,948 aggregate original rune positions before beam expansions. [Null summary](agent20-2668-null-calibration.json), [candidate summary](agent20-2668-candidate-summary.json). Individual results are stored in the contiguous 40-seed JSON shards with zero-based half-open filenames: `agent20-2668-null-0-40.json` through `agent20-2668-null-480-500.json`; `agent20-2668-candidates-0-40.json` through `agent20-2668-candidates-400-433.json`.

| Metric | Null mean ± sample SD | Null max | Candidate max |
|---|---:|---:|---:|
| Prefix skips | 267.256 ±29.651 | 365 | 351 |
| Full skips | 277.448 ±29.889 | 373 | 371 |
| Prefix nats/rune | -5.808636 ±.012765 | -5.768869 | -5.777272 |
| Held-out nats/rune | -5.896700 ±.110275 | -5.563112 | -5.601040 |

The pre-original Gaussian Bonferroni prefix threshold is 376.668379, integer >=377; zero candidates cross. Descriptive full threshold 387.738514, integer >=388; zero candidates cross. **All three correct-key plants fail the prefix count threshold.** The wide plant passes the descriptive full threshold only; the count channel does not demonstrate familywise power. A 500-sample empirical null alone cannot calibrate a distribution-free 0.05/433 tail. The inferred skip count is language-conditioned, as the external L2 fastbeam's selected path derives from a language score, not an independent key-only statistic.

Zero historical candidates exceed the corresponding null maximum on either prefix or holdout; zero meet the relaxed -3.5 nats/rune on either. Top prefix seed rank181 (1326240000) prefix -5.777272, holdout -6.136908. Rank91 (1357457898) reaches 371 full skips, close to the 373.6 external mean, but prefix -5.797692 and holdout -5.784070; that is a concrete nonplaintext example of a near-predicted count. Rank17 (1357187609) is best holdout at -5.601040. Top source-ranked seed 1325734783 gives 216 skips, prefix -5.790667, holdout -5.877728. [Four leading exact original inverses and rune/draw vectors](agent20-2668-native-and-leading-replay.json) replay every original rune; their 200-rune ends and full tapes contain no coherent passage. Replay is a necessary implementation invariant, not identification.

**Disposition:** close #2668 as a conditional negative for this source-ranked decoder. Neither the rendering toolchain nor the signature version proves Bash was used to encrypt LP2. Do not increase seed-search volume or introduce offsets/reducers based on these null outputs. Same-instance coin consumption, 32-bit platform, non-English register, and uncapped geometric retries remain different mechanisms; no evidence here selects them.
