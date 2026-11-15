# Source-printed center-eight and DIVINITY: calibrated original OpenPuff JPEG carrier gate

**15 November 2026, Agent 35. Result class:** bounded negative, source-selected native extraction tests. **No unknown LP2 plaintext, original OpenPuff payload, decrypted key, destination or other independently solved page was recovered.** The exact original OpenPuff v4.00 extractor completed all eight fixed unhide probes below; each native test returned `corrupted stream` and produced zero recovered files. Every successful job first recovered the published, independently known 35-byte JPEG text positive through the same unmodified executable.

## Plausible human path, and its unproved step

The original LP2 pp49–51 print a **32-row × 8-column** table of two-character mixed-case tokens. The actual central 2×2 cells, in printed row-major order, are **row16/col4 `0s`**, **row16/col5 `0D`**, **row17/col4 `20`**, and **row17/col5 `2n`** (1-based coordinates). Concatenating the **unconverted original printed tokens** yields the eight-character candidate password **`0s0D202n`**. This was read directly from the original printed `67.jpg` and agrees with `resources/liber-primus/base60-grid.json`; the byte conversion and GP-prime interpretation of [the earlier original center-four arithmetic study](lp2-p50-center4-prime252-key-gate.md) are **not used** for this password.

The known, readable LP2 p57 says **“SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.”** A human could be prompted to inspect the center of the immediately preceding printed numeric table. Its four two-character cells conveniently supply eight password characters without inventing an alphabet. A separate source-fixed comparison is **`DIVINITY`**, an authentic earlier-Cicada keyword repeated literally in that closing instruction. OpenPuff is historically relevant because original 2014 Cicada material contains a genuine password-`33011033`, 745-byte MP3 extraction from OpenPuff v4.00.

**Crucial missing selector:** The Cicada manuscript does **not** say that the table center is an OpenPuff key, choose a JPEG as the matching carrier, or specify the JPEG bit depth. These are motivated tests, not authenticated decipherment steps. Prior research tried several original JPEG groups under the historic numeric passwords; this test applies **two previously untested source-derived A-passwords**.

## Frozen native experiment

The maintained manual workflow [.github/workflows/openpuff-v400-lp2-floral16-source-probe.yml](../.github/workflows/openpuff-v400-lp2-floral16-source-probe.yml) now accepts a source-password choice and three distinct, original-indexed receiver groups:

1. **Sixteen floral carriers:** unmodified original `57.jpg` through `72.jpg` (LP2 pp40–55), in source-printed order. Their repeated artwork makes a coherent 16-scan candidate, with p55 at the end.
2. **Three original numeric-table carriers:** `66.jpg`, `67.jpg`, `68.jpg` (physical pp49–51), in printed order. These are the original JPEGs that actually display the candidate A password.
3. **Last unsolved p55 alone:** original `72.jpg`; a separate single-carrier candidate because the p55 76-rune body matches the 32×8 printed table's one-cell perimeter length 76.

Both **JPEG Medium 1/5 (20%)** and **JPEG Maximum 1/2 (50%)** are original native OpenPuff choices, not fabricated coefficient extraction. The runner checks that the native application really selected the requested format, bit depth, original input files and chain order. The original binaries `OpenPuff.exe` and `libObfuscate.dll` are pinned by their Git blob hashes. Each job independently confirms recovery of the exact German **35-byte JPEG positive**, with A=`12345678` at Maximum. The separate source tests enter the nominated password only in A and leave B/C unset.

The direct center key is **case-sensitive**: `0s0D202n`. No secret rotations, ASCII case variants, guessed dictionary words, image byte rewriting, arbitrary carrier permutations or fallback password attempts were admitted.

## Complete original outcomes

| Original A password | Original carrier set | Native JPEG depth | Native outcome | Preserved CI run |
| --- | --- | --- | --- | --- |
| `DIVINITY` | Floral 16, printed | Medium 1/5 | Corrupted stream, **0** output | [43696936143](https://github.com/FlareZ123/liber-primus/actions/runs/43696936143), attempt 2 |
| `DIVINITY` | Floral 16, printed | Maximum 1/2 | Corrupted stream, **0** output | [43697657991](https://github.com/FlareZ123/liber-primus/actions/runs/43697657991) |
| `0s0D202n` | Floral 16, printed | Medium 1/5 | Corrupted stream, **0** output | [43697800297](https://github.com/FlareZ123/liber-primus/actions/runs/43697800297) |
| `0s0D202n` | Floral 16, printed | Maximum 1/2 | Corrupted stream, **0** output | [43698414003](https://github.com/FlareZ123/liber-primus/actions/runs/43698414003) |
| `0s0D202n` | Numeric-table 3, printed | Medium 1/5 | Corrupted stream, **0** output | [43697894230](https://github.com/FlareZ123/liber-primus/actions/runs/43697894230) |
| `0s0D202n` | Numeric-table 3, printed | Maximum 1/2 | Corrupted stream, **0** output | [43698242483](https://github.com/FlareZ123/liber-primus/actions/runs/43698242483) |
| `0s0D202n` | p55 `72.jpg` alone | Medium 1/5 | Corrupted stream, **0** output | [43698582990](https://github.com/FlareZ123/liber-primus/actions/runs/43698582990) |
| `0s0D202n` | p55 `72.jpg` alone | Maximum 1/2 | Corrupted stream, **0** output | [43698889628](https://github.com/FlareZ123/liber-primus/actions/runs/43698889628) |

On the first `DIVINITY` Medium attempt, the Windows GUI froze during the **public positive-control file picker**, before any LP2 carrier was tested. The GitHub Actions failed-job rerun succeeded in both the native positive and actual sixteen-carrier unhide. The first failed infrastructure attempt must **not** be counted as an LP2 rejection; the table records only the complete second attempt. Every other outcome above was a completed calibrated native operation.

For each source probe, the genuine original OpenPuff GUI reported `Task stopped: corrupted stream` with its own explanation: wrong password, wrong or corrupted carrier/order, or wrong bit level. This dialog is **nondiscriminating** across these failure causes. The exact test coverage is therefore eight combinations, not eight universal disproofs of JPEG steganography.

## Decision and next useful route

**Retire the exact eight source-key and carrier/depth combinations above.** The raw center-eight candidate is concrete source-derived password material with an authentic original 2×2 location, and it was tested as such. The absence of output supplies **no evidence** for a generalized p50 key or hidden payload. Do not continue expanding arbitrary OpenPuff permutations/password case variations without another original instruction.

A future source-authored indication of a different carrier or an independent consumer of the center string would reopen this key. The productive unresolved objective remains an authenticated unknown-page plaintext, original cipher inverse, or independently recoverable key. The present bounded negatives should remain in `im-results/`; they do not modify the authoritative solved-page inventory in `results/README.md`.
