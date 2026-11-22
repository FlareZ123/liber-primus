# GEB as an LP2 running key: bounded original-input negative

**Agent5, 16 November 2026 · Issue [#1186](https://github.com/FlareZ123/liber-primus/issues/1186).**  
**Decision: retire this exact source-pinned GEB running-key model. No unknown LP2 plaintext, key, or destination was recovered.**

## Finding

The full 32-shard screen completed successfully. Neither supported GP29 spelling produced a stage-1 detection in any of the eight tested LP2 windows. The best score was far below its preregistered threshold in both encodings. Because no candidate crossed stage 1, the prescribed ≥150-rune holdout and stage-2 decryption were **not run**.

This is a finite negative for the pinned 2014 GEB OCR, the two tested spellings, the English Walden likelihood model, the Phase-23 skip-aware beam, and the fixed window set below. It does **not** disprove GEB's authenticated historical coordinate role or exclude every possible GEB-derived key, edition, transformation, or cipher.

## Historical premise and strongest rival

The authenticated 2014 Fifth Onion used *Gödel, Escher, Bach* (GEB) as a **coordinate book**: chapter-title abbreviation, dialogue exchange, word, and letter. That establishes GEB as a period-original Cicada source, but does not establish it as an LP2 running key.

The running-key proposal was a separate, executable hypothesis: the GEB text supplies a GP29 key stream, with an unknown letter-to-rune table and a skip-aware pointer. The strongest rival is that GEB's actual puzzle role was only the historical coordinate book and that LP2 uses an unrelated key source or operation.

## Frozen operation and original inputs

The pinned Phase-23 model is

\[
c_i = p_i + \pi(k_j) \pmod {29},
\]

where \(k\) is the GEB text encoded as GP29, \(\pi\) is an unknown key-letter-to-rune mapping integrated out by the table-free beam, and the key pointer may advance by 0, 1, or 2 at a ciphertext position under the model's anti-repeat skip law (\(q=0.81\)). The stage-1 detector uses a 64-state beam, up to 8 histories per pointer, and an 8-position free start spread. Its score is a log-likelihood ratio in nats per rune against a uniform cipher, using the pinned Walden-derived English model.

Two key spellings were frozen: greedy GP29 digraphs and single Latin letters. The screen used the first 729 runes of each of these eight source-defined sections:

| Section | Physical pages | Section runes | Window tested |
|---:|---:|---:|---:|
| 0 | 0–2 | 729 | 729 |
| 1 | 3–7 | 1,145 | 729 |
| 2 | 8–14 | 1,729 | 729 |
| 3 | 15–22 | 1,903 | 729 |
| 4 | 23–26 | 1,021 | 729 |
| 5 | 27–32 | 1,433 | 729 |
| 6 | 33–39 | 1,680 | 729 |
| 7 | 40–53 | 3,008 | 729 |

Physical pp54–55 (308 runes combined) are outside this fixed eight-window screen. No claim is made about those terminal pages.

The original GEB OCR is the 2014 Fifth-Onion file, 1,953,587 UTF-8 bytes, Git blob SHA-1 `da652686147aa1c8585be659c89d0db60c831571`, raw SHA-256 `2674287a2f6ccdf9f263451b9e332d57d39af7891090ddc3561b6c5fa7fccf8e`. It yields 1,399,392 digraph runes or 1,470,789 single-letter runes. The LP2 corpus SHA-256 recorded by every shard is `58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338`; the Walden model source SHA-256 is `2d9a76a2e3e8195c69430516ebd33c4d0757a53ad432ff6186b7b794e6fe99f9`.

The stage-1 thresholds were fixed before the original screen: **−0.0112** digraph and **−0.0417** letters.

## Complete original-input result

| Section | Digraph best score (key offset) | Letter best score (key offset) |
|---:|---:|---:|
| 0 | −0.1403228 (298,080) | −0.1450573 (1,020,304) |
| 1 | **−0.1177302 (1,181,264)** | **−0.1327151 (910,712)** |
| 2 | −0.1469392 (841,800) | −0.1511082 (454,056) |
| 3 | −0.1389222 (43,528) | −0.1449499 (622,880) |
| 4 | −0.1363794 (205,560) | −0.1465105 (719,544) |
| 5 | −0.1411939 (506,760) | −0.1513153 (107,064) |
| 6 | −0.1414194 (145,648) | −0.1502313 (679,792) |
| 7 | −0.1427857 (1,236,096) | −0.1477587 (907,688) |
| **Required threshold** | **−0.0112** | **−0.0417** |
| **Stage-1 crossings** | **0** | **0** |

The full screen covered **174,651 digraph offsets** and **183,576 letter offsets**, each tested against all eight original windows: **2,865,816 original-window evaluations** in total. The highest scores (least negative) were −0.1177301511 and −0.1327151309, respectively. No stage-1 hit was emitted.

## Controls and calibration limits

- The full run's six synthetic GEB-key plants per spelling all passed. The shard code resets the same deterministic RNG seed inside each spelling's control routine, so the six plant records are repeated in every shard. The original aggregator's displayed 192/192 is **192 repeated shard records, not 192 independent plants**. The correct interpretation is **6/6 unique plant records per spelling, reproduced across 32 shards**. The shard 6 and shard 7 artifacts have identical plant records.
- Separate smoke/null run [43788896957](https://github.com/FlareZ123/liber-primus/actions/runs/43788896957) passed 6/6 positive plants per spelling and had **18 null checks per spelling** (six wrong GEB offsets, six wrong-book Walden controls, six uniform-key controls), with no null crossing the threshold.
- The original-GEB OCR corruption calibration [43791185550](https://github.com/FlareZ123/liber-primus/actions/runs/43791185550) shows an important limitation: eight deletions in a 729-rune observed key window reduce plant detection to **0/6 digraph** and **1/6 letters**; four deletions give **3/6** for each. Eight substitutions retain 5/6 and 6/6; eight observed insertions retain 5/6 and 6/6. Thus the negative is especially sensitive to local missing characters in this particular OCR. It must not be generalized to every GEB edition or transcription.

## Reproduction and provenance

- Full manual workflow: [run 43788250363](https://github.com/FlareZ123/liber-primus/actions/runs/43788250363), completed successfully on 16 November 2026.
- Exact workflow input commit: `bf649dc981dad09c004b494c92a62e4e02eb1d61`.
- Source gate: [`sims/lp2_geb_tablefree_bookkey_stage1.py`](../sims/lp2_geb_tablefree_bookkey_stage1.py).
- Aggregator: [`sims/lp2_geb_tablefree_bookkey_aggregate.py`](../sims/lp2_geb_tablefree_bookkey_aggregate.py).
- Workflow: [`.github/workflows/lp2-geb-bookkey-stage1.yml`](../.github/workflows/lp2-geb-bookkey-stage1.yml).
- Pinned upstream decoder commit: `15200c67abee106913ba01ff504c5b6e88d16cc7`.
- Full aggregate artifact: `geb-stage1-global-full`, artifact ID `14197834004`, SHA-256 `6761f3851caa210cc88f32d65e32863e7137ef3be7b70ecff0fbd6e4e461ef13`.

The full-run script records the GEB, Walden, and LP2 corpus hashes in every shard; the aggregate checks identical source/configuration fields, complete 0–31 shard coverage, and exact expected offset totals. The separate OCR-sensitivity and null-control runs are linked above.

## Decision boundary

Retire this exact contiguous GEB running-key model under the pinned OCR, two spellings, q=0.81 skip model, English likelihood, 729-rune windows, and pp0–53 section starts. Do not rerun it or expand it with post-selected offsets, editions, or cipher parameters. The negative does not cover alternate GEB editions/transcriptions, non-English plaintext, backward or noncontiguous book reads, coordinate-derived key streams, other skip laws, other key transformations, or the untested 308 terminal runes on pp54–55. A new attempt needs an independent historical/source clue selecting the missing variant before original ciphertext is rescored.

No unknown LP2 plaintext, authentic LP2 key, or Cicada destination was recovered.
