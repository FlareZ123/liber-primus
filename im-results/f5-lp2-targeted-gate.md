# F5 JPEG DCT gate: five original passwords rejected; M7 pole-cycle candidates pending

## Decision

No LP2 plaintext or key was recovered. The first run rejects five exact candidate passwords under the pinned F5 extractor. A second, source-derived M7 pole-cycle candidate is now being tested in its two natural representations. The statistical/structural detector does not provide a reliable absence result for the LP2 corpus, so **F5 as a method remains open**. Do not expand this into an unconstrained password dictionary search.

## Hypothesis and bounded inputs

F5 is a distinct JPEG DCT-domain steganographic method, separate from the already screened OutGuess and JSteg-style AC-LSB channels. The tested passwords were selected from existing Cicada source material rather than a dictionary:

| Candidate | Source basis |
| --- | --- |
| `CABALUOIDFORM` | 2013 `0_wisdom` p36/p55 route; the phrase had already been tested with OutGuess |
| `CABALVOIDFORM` | Literal English VOID spelling of the same route |
| `33011033` | Primary documented 2014 7×7/OpenPuff candidate; not authenticated as an F5 key |
| `33011103` | Alternative documented 2014 7×7/OpenPuff candidate; not authenticated as an F5 key |
| `MOBIUS` | Explicit 2013 `0_wisdom` table keyword; weaker candidate |

The workflow scanned the 75 original JPEGs (17 LP1 controls and all 58 LP2 targets, files `17.jpg`–`74.jpg`). Password extraction was restricted to the 58 LP2 pages, giving 58×5 = 290 attempts. The implementation was pinned to `github.com/0verkilll/f5 v1.0.0` (MIT), Go 1.26.0.

## Results

### Extraction control and candidate passwords

- The extraction positive control used original LP2 cover `17.jpg` (SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`).
- A 4,123-byte deterministic payload (SHA-256 `83a7b98feadb6ea468845a2036248f6a2c01fca8da5a633acbf4c938d4de8b04`) was embedded with `embed-x-libjpeg` and extracted **byte-for-byte**. The stego carrier SHA-256 was `c7d66357a41dead12ffe97b9b06f29c00a619f5b1f29b1b74483ff5f508918b9`.
- Across the 290 LP2 attempts, **0** returned a nonempty payload. Every attempt exited with code 1 and an error of the form `k parameter N must be between 1 and 8`; the five candidates each failed on all 58 pages. This is evidence against those exact passwords, not proof that no F5 message exists.

### Detector interpretation

The archived artifact's detector JSON suffixes were parsed for all 58 LP2 images:

- Final detector verdict: `CLEAN` on **58/58**; raw `detected` flag false on **58/58**.
- Statistical reliability: `unreliable` on **58/58**, confidence **0.4** throughout; β ranged from **0** to **1**. It was saturated on **53/58** and marked double-compressed on **56/58**.
- Structural fingerprint: all 58 were marked carrier-viable, with scores **0.1** or **0.25**. These signatures are specific to the f5.jar/PixelKnot encoder layouts, not a general proof against F5 embedded through another JPEG encoder.
- The extraction positive control itself was classified `CLEAN` (β=1.0, unreliable, structural score 0.25). It therefore validates extraction but **does not validate detector sensitivity**.
- Two LP1 controls (11.jpg and 12.jpg) had a raw `detected=true` flag, but their final verdicts were still `CLEAN`: the detector attributed the β signal to recompression because the f5.jar/PixelKnot structural fingerprint was absent. LP1 `05.jpg` was not decodable by this tool (`missing EOI marker`); this does not affect the 58 LP2 results.

### Harness caveat

The first run (42995341645) failed before the corpus scan because `image_meta` attempted to parse the nonnumeric positive-control filename as an integer. The succeeding run is [42995634330](https://github.com/FlareZ123/liber-primus/actions/runs/42995634330), with artifact `f5-lp2-targeted-gate` (artifact ID 13845471014).

That successful run exposed a second reporting defect: the helper clipped detector stdout to the last 3,000 characters, so `json.loads` failed and the archived JSONL stored `result=null`. The complete terminal JSON objects remained intact in the suffixes and are the basis of the 58-page aggregate above. The current reproducer is corrected to preserve full detector output, and its detector summary now records the raw `detected` flag, reliability, saturation and the actual `estimated_message_bytes` field. This code correction does not retroactively change the archived run.


## Follow-up: source-derived M7 pole-cycle password (pending)

The p50 second-column rank map assigns the 30 nonempty thirteen-dot fragments to (P^1(F_{29})). The source-derived p32 projectivity M7, starting at its pole rank 7, traverses ranks `7 → 29 → 11 → 16 → 10 → 8 → 2 → 7`, selecting fragments **#6, #2, #23, #24, #18, #5, #29**. Four fragments are short (3, 19, 3, 5 runes). Concatenating those four in forward-cycle order (#24, #18, #5, #29) yields exactly **30 GP runes**.

The exact source-derived password is tested in two representations: the original Unicode runes `ᛡᚳᛋᛗᛈᚣᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚᛚᛋᚳᛈᛈᛞᚦᚫᛄᛟᛋᚱ` (UTF-8 bytes), and its GP transliteration `IACSMPYLSOAAEHLEEOIMLLSCPPDTHAEJOESR` (36 ASCII characters). An earlier handoff omitted the final `SR`; the runtime source check now reconstructs the 30-rune sequence, verifies all seven pole-cycle fragment IDs/lengths, and rejects any transcription drift. The two new representations add 116 LP2 extraction attempts (58 images × 2) to the five previously tested candidates. Their result is pending; the original five-candidate run remains a separate, already-completed bounded negative.

## Interpretation and next action

The result is a **bounded password exclusion**: these five source-derived strings do not extract a payload from any of the 58 LP2 JPEGs with F5 v1.0.0. The detector result is inconclusive because its statistical estimate is unreliable for every LP2 image and its extraction positive control is also classified CLEAN. The structural score only tests recognizable f5.jar/PixelKnot layouts.

Do not treat this as a general exclusion of F5, a generic DCT-domain method, or image steganography. The current follow-up is limited to the two representations of one source-derived M7 pole-cycle password; no dictionary expansion is warranted. If it produces no payload, retain F5 as a method-level open question but stop password guessing until another independent source clue appears.

## Reproduction

- Script: [`sims/f5_lp2_targeted_gate.py`](../sims/f5_lp2_targeted_gate.py)
- Manual workflow: [`.github/workflows/f5-lp2-targeted-gate.yml`](../.github/workflows/f5-lp2-targeted-gate.yml)
- Successful run and 30-day artifact: [GitHub Actions run 42995634330](https://github.com/FlareZ123/liber-primus/actions/runs/42995634330)
