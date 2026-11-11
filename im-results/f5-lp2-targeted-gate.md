# F5 JPEG DCT gate: seven password representations, no extraction

## Decision

No LP2 plaintext or key was recovered. The five earlier source-derived candidates and two representations of one source-derived M7 pole-cycle candidate were tested against all 58 original LP2 JPEGs: **0/406 nonempty payloads**. This rejects these seven exact password strings, not F5 as a method. The detector remains unsuitable for ruling F5 out on this corpus.

## Hypothesis and bounded inputs

F5 is a JPEG DCT-domain steganographic method, distinct from the already screened OutGuess and JSteg-style AC-LSB channels. The five earlier passwords came from existing Cicada source material, not a dictionary:

| Candidate | Source basis |
| --- | --- |
| CABALUOIDFORM | 2013 0_wisdom p36/p55 route; phrase previously tested with OutGuess |
| CABALVOIDFORM | Literal English VOID spelling of the same route |
| 33011033 | Primary documented 2014 7×7/OpenPuff candidate; not authenticated as an F5 key |
| 33011103 | Alternative documented 2014 7×7/OpenPuff candidate; not authenticated as an F5 key |
| MOBIUS | Explicit 2013 0_wisdom table keyword; weaker candidate |

The follow-up added two representations of one M7-derived 30-rune candidate:

| Candidate | Exact password bytes |
| --- | --- |
| M7 pole-cycle GP transliteration | IACSMPYLSOAAEHLEEOIMLLSCPPDTHAEJOESR (36 ASCII characters) |
| M7 pole-cycle original runes | ᛡᚳᛋᛗᛈᚣᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚᛚᛋᚳᛈᛈᛞᚦᚫᛄᛟᛋᚱ (30 Unicode runes, passed as UTF-8) |

The M7 candidate is a hypothesis, not an established key. Its construction is source-reproducible:

- The original ink annotations contain 31 thirteen-dot marks, giving 32 intervals; intervals #9 and #12 are empty, leaving 30 nonempty fragments.
- The provisional p50 second-column rank map assigns those 30 fragments to P¹(F29). Starting at the p32 M7 pole rank 7, the cycle is 7→29→11→16→10→8→2→7, selecting fragments #6,#2,#23,#24,#18,#5,#29.
- The four short fragments at the end of the cycle (#24,#18,#5,#29; lengths 3+19+3+5) concatenate to exactly 30 GP runes.
- The runtime guard in the reproducer reconstructs this from the pinned corpus, grid and ink annotations and checks the mark count, empty intervals, unique ranks, complete cycle, fragment lengths, rune sequence and transliteration. It passed in the follow-up run.
- An earlier handoff omitted the final SR from the transliteration. The tested string above is the corrected complete 36-character form.

The workflow scanned the 75 original JPEGs (17 LP1 controls and all 58 LP2 targets, files 17.jpg–74.jpg). Password extraction was restricted to the 58 LP2 pages. The implementation is pinned to github.com/0verkilll/f5 v1.0.0 (MIT), Go 1.26.0.

## Results

### Extraction control and all seven candidates

The extraction positive control used original LP2 cover 17.jpg (SHA-256 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e). A deterministic 4,123-byte payload (SHA-256 83a7b98feadb6ea468845a2036248f6a2c01fca8da5a633acbf4c938d4de8b04) was embedded with embed-x-libjpeg and extracted byte-for-byte. The stego carrier SHA-256 was c7d66357a41dead12ffe97b9b06f29c00a619f5b1f29b1b74483ff5f508918b9.

The successful follow-up run is [43027819899](https://github.com/FlareZ123/liber-primus/actions/runs/43027819899), artifact ID 13860862074. Its source-validation guard passed. Across 406 attempts (58 images × 7 password strings):

- **0** attempts returned a nonempty payload.
- **391** failed the F5 k-parameter range check.
- **15** passed the k range check but failed later: 14 produced file sizes above the image/tool maximum; one runic-password attempt on LP2 page 2 requested 116,626 bytes but could recover only 45,481 before exhausting available coefficients.
- Every attempt exited nonzero; no output payload file was produced.

The two new forms account for 9 of the 15 downstream header false positives: the transliteration had 4 oversized-size failures; the original runic form had 4 oversized-size failures and the one incomplete extraction. The earlier five candidates account for the other 6 (1, 1, 2, 2 and 0 respectively). These are not partial plaintexts: all fail before a complete file is recovered.

The aggregate 15/406 k-range passes (3.69%) is close to the 8/256 = 3.125% rate expected if a wrong-password decoded k byte is approximately uniform. This is only a null-model heuristic, but it gives no reason to treat the downstream header parses as evidence of a correct password.

### Detector interpretation

The follow-up artifact covers all 58 LP2 images:

- Final detector verdict: CLEAN on 58/58; raw detected flag false on 58/58.
- Statistical reliability: unreliable on 58/58, confidence 0.4 throughout; β was saturated on 53/58 and images were marked double-compressed on 56/58.
- Structural fingerprint: all 58 were marked carrier-viable, with scores 0.1 or 0.25. These signatures target f5.jar/PixelKnot layouts, not every possible F5 encoder.
- The extraction positive control itself was classified CLEAN (β=1.0, unreliable, structural score 0.25). It validates extraction but does not validate detector sensitivity.
- Two LP1 controls (11.jpg and 12.jpg) had raw detected=true flags, but their final verdicts were still CLEAN: the detector attributed the β signal to recompression because the f5.jar/PixelKnot structural fingerprint was absent. LP1 05.jpg was not decodable by this tool (missing EOI marker); this does not affect the LP2 results.

Do not interpret CLEAN as a reliable absence result. The statistical estimator is explicitly unreliable on every LP2 image, and the positive control demonstrates a detector false negative for this carrier.

## Reproducibility and correction

The original five-candidate run is [42995634330](https://github.com/FlareZ123/liber-primus/actions/runs/42995634330), artifact ID 13845471014. The follow-up reran those same 290 attempts alongside the 116 new attempts. Their extraction records match the earlier artifact exactly, confirming deterministic results for the pinned implementation and inputs.

The earlier version of this report incorrectly stated that all 290 original attempts failed at the k-parameter check. The raw artifact actually contains six downstream file-size failures (one each for the first two candidates, two each for the two 2014 candidates, and none for MOBIUS). This has been corrected above; those six cases also yielded no payload.

An earlier harness run (42995341645) failed before the corpus scan because image_meta tried to parse the nonnumeric positive-control filename as an integer. The corrected reproducer is sims/f5_lp2_targeted_gate.py. The successful follow-up artifact contains summary.json, detection.jsonl and extractions.jsonl.

## Interpretation and next action

This is a **bounded exclusion of seven exact password strings**, not an exclusion of F5, keyed/permuted DCT methods, or image steganography generally. The M7-derived candidate is not supported as an F5 password. Do not expand this into further password guessing without a new independent source clue. Return effort to a route that can select a reversible operation on the original ciphertext.

## Reproduction

- Script: [sims/f5_lp2_targeted_gate.py](../sims/f5_lp2_targeted_gate.py)
- Manual-only workflow: [.github/workflows/f5-lp2-targeted-gate.yml](../.github/workflows/f5-lp2-targeted-gate.yml)
- Follow-up run and artifact: [GitHub Actions run 43027819899](https://github.com/FlareZ123/liber-primus/actions/runs/43027819899)
- Original five-candidate run: [GitHub Actions run 42995634330](https://github.com/FlareZ123/liber-primus/actions/runs/42995634330)
