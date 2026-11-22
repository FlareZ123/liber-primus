# Cuneiform chapter: five numbered shares to p33 red-boundary 91-rune receiver

**Status: exact original-input conditional negative (22 November 2026, Agent39, Director #2243). No recovered unknown LP2 plaintext, authenticated key or creator-selected operation.**

## Source and hypothesis

- LP2 p33, original JPEG 50.jpg, contains a red title of ten runes, an 81-rune black paragraph, then a second red title at canonical **rune offset91**. Its intact first title-to-title source span is exactly **91 GP29 runes**. This cut is an actual ink boundary; including the red title in the receiver is a consequential, unproven cipher assumption.
- Original LP2 pp36–38, JPEGs 53–55.jpg, physically number five passages 1–5 of **139/91/98/96/129** GP29 runes, sharing exactly **91** aligned prefix positions. Their fourth passage crosses the p37/p38 physical seam. In Cicada's earlier rounds Shamir sharing was used, making a five-share interpretation a recognizable, although unselected, human operation. The historical 2014 cuneiform header repeats throughout the same chapter.

Earlier source-exact work already computed that the full five-share x=0 GP29 Shamir interpolation does not itself spell native prose; see [five-numbered Shamir original decision](lp2-five-numbered-shamir-original-gate.md). The **distinct newly checked receiver** uses its 91 reconstructed runes as a direct key against the ink-selected p33 first91 runes, never previously aligned as a Shamir-key recipient in that report.

Freeze the standard x=1,2,3,4,5 degree-four finite-field interpolation at x=0:

    K[i] = (5*S1[i] - 10*S2[i] + 10*S3[i] - 5*S4[i] + S5[i]) mod29

for each of the first 91 printed positions i of the five source passages. The resulting full91 source key has GP29 IoC **0.0390720391**. The complete p33 source ciphertext receiver is [0,91), selected by the second printed red heading and no language tuning. Interpret the historical key as a standard direct GP29 additive pad and test only **P=C−K** and **P=C+K**.

## Complete original results

| 91-rune untouched p33 source | Decoded IoC | Forward source replay | Genuine solved-p57 GP plant |
| --- | ---: | ---: | ---: |
| C−K | **0.0319902320** | **91/91** | **91/91** |
| C+K | **0.0315018315** | **91/91** | **91/91** |

The unchanged original minus output begins (GP-native multigraph spelling) **AE NG W E T O H A Y O U B S Y I NG U J AE T J S NG G A G O J X F C EA F L M T EA R D O E L A M P M IA OE P L W W EO W...**. Both complete outputs are nonprose. The input key and receiver are entirely source-frozen; no offset, alphabet permutation, key/word boundary reset, cipher sign optimization, or after-the-fact phrase selection is allowed. The synthetic positive encrypts 91 actual native-GP runes of authenticated p57 with the very same source K, then recovers all **91/91** independently under both signs.

[Original-source, read-only CommonJS/JSDoc reproducer](../sims/lp2_p33_91redboundary_fiveshare_directpad_original_sft.cjs) passed **Windows Node.js 22**: [GitHub Actions #45068238522](https://github.com/FlareZ123/liber-primus/actions/runs/45068238522).

## Decision

The recognizable source chain five printed numerals → 2013 five-of-five Shamir → 91-rune interpolated stream → exactly 91 printed p33 title-to-title runes is a bounded, historical-code hypothesis. Its weakest unsupported premise is that Cicada intended to use **the 91-rune interpolated stream as a GP29 additive pad on this earlier printed interval**. Neither the original source nor the historical instruction chooses that recipient or the field. The actual output does not recover plaintext, and no inferred continuation handles the remaining length tails.

Retire this exact p33 recipient of the existing five-share stream. A genuine 2014 signed instruction or another independent creator-selected operation is needed before testing different receivers, phases, or secondary ciphers. The five numbered passages remain undeciphered.
