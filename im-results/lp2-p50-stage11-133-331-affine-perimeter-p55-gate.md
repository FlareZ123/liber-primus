# 2013 OS / Stage11 133–331 key schedules against p55

**Status:** four fixed, historically motivated interpretations tested; none recovers plaintext. No unknown-page key or cipher mechanism recovered.

## Source-visible route and why the numbers matter

The original 2013 OS message includes the palindromic-prime handle `1231507051321` and the sentence **“THE KEY IS ALL AROUND YOU.”** Its shell invokes `prime_echo`, which emits the prime sequence and pauses at 1033 and 3301. The 2013 Twitter stage reconstructs `gematria.jpg`, a visible Elder Futhark / English / prime-value lookup table; the same carrier contains the PGP-signed whitespace payload `gematria.jpg.asc`. The prime mapping is therefore present in an original puzzle-stage artifact, not merely in the later helper code.

Using that table, the phrase has prime-Gematria value **931**. The signed 2013 BASE29 convention gives

\[
931=1\times29^2+3\times29+3=133.
\]

The original 2014 Stage11 index has `<title>133</title>` and `<div id="331">`, with 58 image links in release order 0–57. The OS handle is a 13-digit palindrome and prime; its residues are **57 mod 256** and **73 mod 76**. Also **133 mod 76 = 57**, **331 mod 76 = 27**, and **331 mod 256 = 75**.

The p49–p51 table is 32×8=256 cells; its perimeter is 76 cells and its interior is 180. These lengths match p55 (76 runes) and p56+p57 (85+95=180). This makes the 2013/2014 number cluster worth testing as a key schedule. It does not itself say what the HTML title, div ID, or handle should mean.

## Frozen candidates

All candidates use the published base60 byte transcription, the original 76-rune p55 sequence, and the already established p56-style subtractive GP29 operation (P_i=(C_i-K_i)\bmod29). No phase, reset, F skip, fitted substitution, or language-selected parameter is allowed.

1. **Perimeter affine:** “all around” selects the 76-cell perimeter, clockwise from top-left. Use title 133 as start and div 331 as stride: (i_n=(133+331n)\bmod76), giving start 57 and stride 27.
2. **Full-table affine:** use title 133 as start and div 331 as stride over the 256-cell row-major table: (i_n=(133+331n)\bmod256), giving start 133 and stride 75. First 76 values are the p55 key; the remaining 180 are compared directly with solved p56 plaintext followed by clear p57.
3. **Handle as periodic key:** convert the OS handle itself to BASE29, giving `2DBAOS95B), map its digits to GP29 values, and repeat over p55.
4. **LCG:** use the handle residue 57 as seed, title 133 as multiplier, and div ID 331 mod256=75 as increment:
   (x_{n+1}=(133x_n+75)\bmod256).
   This has full period 256 because (133\equiv1\pmod4), 75 is odd, and the modulus is (2^8). Read the 256 table cells in generated state order; first 76 values are the p55 key and the remaining 180 are checked against p56+p57.

The base60 table is participant-derived, not a creator-authenticated byte legend. These are tests of the simplest roles the source numbers could play, not claims that Cicada explicitly specified an LCG.

## Results

Raw p55 IoC is **0.03789474**. The exact key streams and plaintext outputs are emitted by the standalone reproducer.

| Frozen schedule | p55 subtractive IoC | p55 additive-sign control IoC | 180-tail matches to p56+p57 / reversed |
|---|---:|---:|---:|
| Perimeter affine (57,27 mod76) | **0.03824561** | 0.03017544 | not applicable |
| Full-table affine (133,75 mod256) | **0.03438596** | emitted by reproducer | **5/180 / 6/180** |
| Handle BASE29 periodic key | **0.03403509** | 0.03087719 | not applicable |
| Handle-seed/title-multiplier/div-increment LCG | **0.03859649** | 0.03192982 | **6/180 / 12/180** |

None of the p55 outputs is linguistic or forms a recognizable directive. The 180-cell tails do not reproduce the known 180-rune p56+p57 sequence. The LCG is a full-cycle permutation, but its mathematically attractive period does not produce plaintext.

## Decision

Reject these four exact key schedules. The 931→133 correspondence remains an interesting cross-era pointer to the Stage11 wrapper; it does not prove that 133/331 are affine or LCG parameters. The handle's BASE29 form is not a periodic p55 key. The simplest ways to turn the visible 2013/2014 numbers into a key schedule fail on original p55.

Do not tune the roles, seed, modulus, table traversal, byte-to-rune map, phase, or key clock. A further attempt requires an independent source instruction assigning those roles or a first-party p50 byte legend and receiver rule. The 2014 Stage11 HTML itself is a static 58-image index, not an executable decoder.

## Reproduction

Run from the repository root:

`node sims/lp2_p50_stage11_133_331_affine_perimeter_p55_sft.cjs`

Inputs: `resources/liber-primus/base60-grid.json`, `resources/liber-primus/lp2-corpus.json`, `resources/historical/cicada2013-os-original-message.txt`, and `resources/external/cicada2014-stage11-onion7-original-index.html`. The script asserts the original dimensions, page lengths, source values, affine cycle lengths, and LCG full period before emitting every key and output.
