# p32 source-axis 2D prefix-sum inverse

**Classification:** bounded original-input negative; no plaintext, key, or authenticated cipher recovered.

## Human solve-path hypothesis

The signed January 2016 tree image reuses the tree illustration on original LP2 physical p32 (JPEG 49.jpg) and measures 563×569 pixels. In the original p32 11×11 row-major rune square, GP-prime weights sum to 563 across the top row and 569 down the left column. These are unique among the eleven row and column sums:

- Row sums: `[563, 617, 287, 540, 743, 513, 577, 579, 603, 537, 486]`
- Column sums: `[569, 429, 641, 669, 518, 611, 463, 690, 378, 578, 499]`

A solver could therefore identify the first row and first column as the two axes of the map. Treating their 21 distinct runes as boundary/initial conditions leaves a 10×10 interior of 100 runes. A simple cumulative-sum encoding on a 2D map is a plausible operation to test once; the source does **not** explicitly say prefix sum, cumulative sum, integration, or finite difference. The test is motivated by the image-selected axes, not by an exploratory language-score sweep.

## Frozen inverse family

For source matrix (C), with zero-based (r,c=1,ldots,10), the six candidates are:

- Horizontal: (P_{r,c}=s(C_{r,c}-C_{r,c-1})pmod{29})
- Vertical: (P_{r,c}=s(C_{r,c}-C_{r-1,c})pmod{29})
- Mixed: (P_{r,c}=s(C_{r,c}-C_{r-1,c}-C_{r,c-1}+C_{r-1,c-1})pmod{29})

where (sin{-1,+1}). The first row and first column remain unchanged as edge IVs. The forward encoder is the exact inverse recurrence for each case.

## Original-input results

The trigram model is trained on the first 50,000 GP symbols of the repository's Emerson control after the frozen longest-match GP transliteration. The raw score is the 100-cell p32 interior; candidate scores cover each decoded 10×10 matrix.

| Variant | GP-trigram mean (nats/rune) | First three decoded rows (GP transliteration) |
|---|---:|---|
| Horizontal − | −11.8551068544 | `UMIAROERHEOCS / DLMDBXTHFYU / CPURWPHALG` |
| Horizontal + | −12.0178180329 | `EAITHAEWAENGBAX / GNIGEOSIAFOEA / ATEAAEOETNGCND` |
| Vertical − | −12.0327205896 | `AHBIHABWXX / EAFNGJGTIIAMC / CIANMNHXNOH` |
| Vertical + | −11.9439632803 | `CNGEOMNGCEOOESS / UFHEDPMTHIA / ATHLILNGSLYNG` |
| Mixed − | −11.7831018678 | `EOPNOEIATOEMWF / OEUNGMAIDBNGS / JOEJIMEAGADC` |
| Mixed + | **−11.6403115486** | `BTLWTHPWIOEF / WEAHICMGEOHX / EWEMIUDCGA` |
| Raw interior | −11.8364227252 | — |

The six decoded matrices below give the exact ten rows of ten GP runes for each inverse. Each rune is one matrix symbol; no spaces, insertions, or alphabet edits were applied.

### Horizontal, sign −

```text
ᚢᛗᛡᚱᛟᚱᚻᛇᚳᛋ
ᛞᛚᛗᛞᛒᛉᚦᚠᚣᚢ
ᚳᛈᚢᚱᚹᛈᚻᚪᛚᚷ
ᚱᚳᛉᚹᚫᛒᛈᛉᛈᛄ
ᛗᚹᛈᚱᚪᛟᛏᚫᚪᛗ
ᛄᛗᛏᛈᛗᛞᛈᚾᚾᛝ
ᛚᛟᚫᛚᛞᛠᛒᚫᚦᛄ
ᛞᚢᛖᛈᚦᛏᚹᚻᛡᚷ
ᚪᛄᚱᚾᚠᚦᚢᚳᛁᚫ
ᚷᚫᛉᛏᛖᚪᛝᛖᛖᚳ
```

### Horizontal, sign +

```text
ᛠᛁᚦᚫᚹᚫᛝᛒᚪᛉ
ᚷᚾᛁᚷᛇᛋᛡᚠᚩᛠ
ᚪᛏᛠᚫᛟᛏᛝᚳᚾᛞ
ᚫᚪᛋᛟᚱᛇᛏᛋᛏᛖ
ᛁᛟᛏᚫᚳᚹᛈᚱᚳᛁ
ᛖᛁᛈᛏᛁᚷᛏᛚᛚᚻ
ᚾᚹᚱᚾᚷᚢᛇᚱᛡᛖ
ᚷᛠᛄᛏᛡᛈᛟᛝᚦᛞ
ᚳᛖᚫᛚᚠᛡᛠᚪᛗᚱ
ᛞᚱᛋᛈᛄᚳᚻᛄᛄᚪ
```

### Vertical, sign −

```text
ᚪᚻᛒᛁᚻᚪᛒᚹᛉᛉ
ᛠᚠᛝᛄᚷᛏᛁᛡᛗᚳ
ᚳᛡᚾᛗᚾᚻᛉᚾᚩᚻ
ᛋᚹᛚᛞᛇᛏᛝᛄᚱᚾ
ᛚᛟᛝᛖᛒᛟᚫᚹᛖᚣ
ᛟᚳᚻᛒᛇᛈᛁᛞᚻᛁ
ᚩᚷᛋᛟᚣᚦᚷᛟᛋᚳ
ᚻᛏᚾᚦᛁᛡᛒᚠᚫᛚ
ᛖᛠᛉᛁᚻᛞᛒᛉᚣᛏ
ᚹᛝᚦᚾᛡᛚᛄᚪᚩᛇ
```

### Vertical, sign +

```text
ᚳᛝᛇᛗᛝᚳᛇᛟᛋᛋ
ᚢᚠᚻᛖᛞᛈᛗᚦᛁᚪ
ᚪᚦᛚᛁᛚᛝᛋᛚᚣᛝ
ᛉᛟᚾᚷᛒᛈᚻᛖᚫᛚ
ᚾᚹᚻᛄᛇᚹᚱᛟᛄᚩ
ᚹᚪᛝᛇᛒᛏᛗᚷᛝᛗ
ᚣᛞᛉᚹᚩᛡᛞᚹᛉᚪ
ᛝᛈᛚᛡᛗᚦᛇᚠᚱᚾ
ᛄᚢᛋᛗᛝᚷᛇᛋᚩᛈ
ᛟᚻᛡᛚᚦᚾᛖᚳᚣᛒ
```

### Mixed, sign −

```text
ᛇᛈᚾᛟᛡᛏᛟᛗᚹᚠ
ᛟᚢᛝᛗᚪᛁᛞᛒᛝᛋ
ᛄᛟᛄᛁᛗᛠᚷᚪᛞᚳ
ᛠᛝᛈᚩᛖᚱᚳᛗᛟᚳ
ᛋᚦᛠᚣᛠᚳᚩᛄᛄᚻ
ᛝᛇᚩᚾᚪᚢᚣᛈᛉᚦ
ᚾᚩᚾᚹᚱᚳᚱᛏᛟᛗ
ᚩᚻᛟᛟᚻᛒᛗᛇᚫᚪ
ᚢᛁᛋᚫᛡᛋᛞᚣᛇᛗ
ᛄᛉᛁᚹᛖᛟᛚᛈᚻᚾ
```

### Mixed, sign +

```text
ᛒᛏᛚᚹᚦᛈᚹᛁᛟᚠ
ᚹᛠᚻᛁᚳᛗᚷᛇᚻᛉ
ᛖᚹᛖᛗᛁᚢᛞᚳᚷᚪ
ᚢᚻᛏᚣᛄᚫᚪᛁᚹᚪ
ᛉᛡᚢᚩᚢᚪᚣᛖᛖᛝ
ᚻᛒᚣᛚᚳᛠᚩᛏᛋᛡ
ᛚᚣᛚᛟᚫᚪᚫᛈᚹᛁ
ᚣᛝᚹᚹᛝᛇᛁᛒᚱᚳ
ᛠᛗᛉᚱᚦᛉᚷᚩᛒᛁ
ᛖᛋᛗᛟᛄᚹᚾᛏᛝᛚ
```

## Controls and familywise calibration

- All six original inverses re-encode the entire original 11×11 p32 matrix exactly (121/121 symbols per variant).
- For each variant, a 100-rune native-GP English plant was encoded under the same source edge IV and then decoded; all six recover all 100/100 runes exactly. The native plant score is **−8.0070723630**.
- The 1,000 raw Emerson 10×10 calibration windows have score min/median/max **−8.7604992780 / −7.8849376351 / −7.2052255239**. All 1,000 raw windows score above the best original candidate, so the raw-window upper-tail empirical p is 1.000.
- To account for selecting the best of six variants, a matched maxT calibration uses 1,000 disjoint 11×11 Emerson windows (starts 70,000 + 187i). Each window is passed through all six inverse variants; the maximum of its six scores is retained. The maxT distribution has min/median/max **−11.9627507149 / −11.5870331136 / −10.9178104365**. **627/1,000** per-window maxima are at least the best original score; the plus-one upper-tail empirical p is **(627+1)/(1000+1) = 0.6273726274**. The original candidate is below the median familywise maximum and is not distinguished from the matched controls.
- The original interior's raw GP-trigram score is **−11.8364227252**. The best transformed score, mixed positive, is only **−11.6403115486** and its preview is not coherent language.

## Decision and limits

The source dimensions select the first row and first column as a plausible pair of axes. They do not select the prefix-sum operation. All six predeclared direct horizontal, vertical, and mixed finite-difference inverses fail to recover readable plaintext and are control-level after familywise correction. Retire exactly this six-variant family; do not extend it to higher differences, rotations, transpositions, fitted edge keys, S-boxes, or other transform families without a distinct source-visible instruction.

The experiment does not exclude other operations on p32, a different use of its 11×11 structure, or a cipher whose state/key is independently sourced. No p32 plaintext, authentic key, or general LP2 mechanism is recovered.

## Reproduction

- Existing source implementation: `sims/p32_source_axis_2d_prefix_inverse_sft.cjs`
- Existing manual-only workflow: `.github/workflows/grid-256-tests.yml`, dispatch input `probe=tree-2d-prefix`
- Canonical inputs: `resources/liber-primus/lp2-corpus.json` and `resources/control/emerson_essays_2944.txt`
- The six equations, original scores, source checksums, forward reconstruction, and synthetic plant were reproduced in the connected JavaScript execution runtime using the current repository inputs. The script and workflow were left unchanged; no GitHub Actions run was dispatched during this invocation.
