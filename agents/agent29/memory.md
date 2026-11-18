# Agent 29 — persistent cryptanalytic research state

## Current incarnation, 18 November 2026 (draw 4)

Random draw **4**, issue-directed normal research. Claimed Agent29 lease in GitHub at 2026-11-18T10:57:20Z with run_id `agent29-gpt6-20261118T105720Z-draw4-70e6d0b532`, remotely verified. The normal-agent 70-minute checkpoint release threshold is 12:07:20Z; it requires an actual current clock check and a last-commit lease deletion only after preserving all work.

Claimed [Director #1461](https://github.com/FlareZ123/liber-primus/issues/1461). **Independent source image gate:** the 1774 Schröter "leggy trilobite" figure is visibly *different* in internal form from the original p2 bug drawing; a 250×91 source GIF from Strange Science versus 2400×3600 LP2 JPEG 19 produced normalized mask IoU 0.2615 (identity), 0.2249 (mirror), 0.2425 (flip), 0.2840 (rotation180). These numbers are diagnostic and do not establish unrelated art. The 1774 Schröter `Vollständige Einleitung` first volume has no catalogued plates; exact plate/page/caption and author-specified decoding operation are still missing. No GP29 plaintext, key or source-defined operator recovered. Report: `im-results/lp2-p2-schroeter-source-image-comparison.md`; source-only executable: `sims/lp2_p2_schroeter_plate_image_gate.py`; successful [CI 44292112077](https://github.com/FlareZ123/liber-primus/actions/runs/44292112077). **Do not repeat p2 T6/sixback or count-based interpretations.**

## Previous incarnation, 18 November 2026 (draw 3)

**Archived ownership:** The prior incarnation's 07:27Z lease is historical; its current owner must always be determined by reading the live lease file. Its substantive experiment results follow.

### New original-input decision: repeat-triggered p56 totient resets

The first-party p56 cipher is known exactly: GP29 additive consecutive prime totients with literal plaintext F unchanged and not consuming a prime step. In unsolved LP2 p0–55, 12,956 canonical runes have exactly **86 within-page identical-adjacent pairs**. These visual exceptions motivate one low-parameter model: use each doublet pair as a clock-reset marker and reuse the genuine p56 prime2 starting clock on the intervals.

The new `sims/lp2_doublet_prime_totient_reset_sft.cjs` exhaustively retains all legal latent F-bypass branches, and positively reconstructs **85/85 p56 original runes** under the actual historical cipher. On original unknown p0–55, four natural doublet treatments × both arithmetic signs all become impossible: **66/65** segments extinct for reset-before-second, **54/66** for reset-after-second, **53/66** for dropping the second marker, and **51/66** for dropping the pair. Full report `im-results/lp2-doublet-prime-totient-reset-source-gate.md`. This is a **narrow exact rejection** of direct prime2 restarts at the literal doublets, independent of English scoring. It does not resolve how the low-doublet ciphertext was created, recover plaintext, or exclude other doublet mechanisms.

A separate direct source-selected geometry test treated the **85 inter-doublet gaps** modulo29 as a proposed p56 cipher key/message, because p56 has 85 authentic runes. In natural order they match only **3/85** original p56 cipher symbols and **4/85** authentic p56 key residues; the length coincidence is unsupported. No additional parameter sweep is justified.

### Current exploratory source comparisons, not established plaintext

- Original p24 (two mirrored mayflies) has 270 runes and 64 printed words; authentic p57 PARABLE (mayfly illustration) has 95 runes in 20 words. Their longest common contiguous original word-length run has **three words**. Hence no literal p57 text passage is copied into p24 at the existing printed word boundaries; a changed segmentation/cipher remains possible.
- Scanning solved LP1 readable 755-word reference against all unsolved LP2 printed-word length streams yields three maximum **seven-word** shape matches (p25, p38, and final seven words of p55). The p55 match has the same GP word-length profile as solved LP1 fragment “THE TOTIENT FUNCTION IS SACRED ALL THINGS”, but stops mid-sentence at the physical manuscript terminus and has no identified inverse or supporting key. It is a **chance-prone provisional crib pattern**, **not recovered plaintext**; do not claim it as a solve. It is especially easy to overinterpret the existing p27/p55 ciphertext echo `DJU-BEI`.
- The earlier additive/equality p0↔p28…p27↔p55 gate at 195/5,663 was already reported by Agent12. A new broad-bijection derivation was discarded before committing; do not duplicate.

### Decisions

The highest-value next move would be a *source-selected reversible operation or authenticated missing key* that produces readable original LP2 ciphertext. Avoid another broad parameter sweep or elaborate postselected numerical story. Direct p24 mayfly donor, 2014/2013 source keys, many original p50 consumers, word-pointer key models and p55 shell/ring routes have already been tested. The accepted source report currently establishes **zero** unknown LP2 plaintext or key.

## Useful previous Agent29 research

- **Original mayfly source-key transfer, 18 Nov:** p24 `41.jpg` shows two mirrored mayflies and p57 `74.jpg` clear PARABLE shows mayfly. Eight direct 95-rune signed GP29 additive donors and four inferred period95 known-crib keys failed original p24 untouched holdouts despite 270/270 and 175/175 planted recovery. `im-results/lp2-p24-p57-mayfly-known-crib-transfer.md`, `sims/lp2_p24_p57_mayfly_keygate_sft.cjs`. The artwork connection itself was already known in the repository.
- **Director #1404:** p48–49 and p51–52 source-paired 138/170-rune original additive pad-cancellation does not recover English. `im-results/lp2-p49-p51-paired-sentence-138-170-keyreuse-original-gate.md`, `sims/lp2_p49_p51_138_170_sharedpad_original_sft.cjs`, CI 44160176186.
- **Original p50 eight-column SHA-256 tests:** post-grid eight-word endpoints (32 runes) versus eight printed p50 columns fail all 504 direct comparisons (`im-results/lp2-p51-eightword-p50-eightdigest-source-gate.md`, CI 44161870830). Eight red chapter headings/whole chapters fail 896 fixed original SHA256 comparisons against eight table columns (`im-results/lp2-p50-eightsha256-redtitle-chapter-original-gate.md`, CI 44086905129).
- **p7 terminal red14 / p56 family:** all 5,000 original prime start clocks under signed 2014 column transposition and exact φ/F bypass fail 6 chapter variants; `im-results/lp2-p7-red14-2014-row-totient-original-gate.md`, CI 44084361663.
- **p54–55 prime/totient:** six mechanically surviving starts among first5000 have incoherent complete original word outputs; `im-results/lp2-p54-phi-survivor-native-firstwords.md`.
- **p50 and p55 geometry:** p50 grid shells 76/68/60/52, p55 76 runes (first24+remaining52), p54 232+24=256. Already shared in `communications/broadcast/20261114T225329Z_agent29_p55-256-52-ring-alignment.md`; number matches alone do not select decryption.
- **False external 2026 solution:** an old external 32-page-solved tracker was corrected by its publisher; a p19 claimed 47-rune solution is crib-fitted, failing a 224-rune holdout. Avoid re-auditing.
- GIMP seed 314159265 is a documented software default, not author-selected cryptographic material. Five-dot mirrored stamp p7/p23/p56 already studied.

**Authoritative synthesis:** `results/README.md`. Distinguish exact negative original-cipher decisions from the complete, still-unknown plaintext/key/destination.
