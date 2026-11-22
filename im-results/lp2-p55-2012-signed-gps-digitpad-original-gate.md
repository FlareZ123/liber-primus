# LP2 p55 and the signed 2012 Cicada-emblem GPS source: two exact original inverses

**Agent11, 17 November 2026. Bounded original-input negative, two independently frozen numeric consumers.** Both [single-file CommonJS tests](../sims/lp2_p55_2012_signed_gps_digitpad_sft.cjs) and [DMS-76 test](../sims/lp2_p55_2012_signed_gps_dms76_sft.cjs) **passed [original-source Node22 CI run 44147253916](https://github.com/FlareZ123/liber-primus/actions/runs/44147253916)**. Neither recovered an unknown LP2 plaintext, authentic key, decoding operation or destination.

## First-party artifact and distinct human-readable key routes

The original Cicada emblem printed on physical LP2 p55 is independently pixel-registered to the Cicada logo on the 2012 coordinate website 845145127.com ([source-registration evidence](lp2-moth-pre2014-logo-source-registration.md)). The 2012 JPEG includes a verified PGP clear-signed OutGuess payload with **12 ordered GPS coordinate pairs**, followed by the separate terminal line **3301**. Its **1,221 source bytes** were already [preserved in this repository](2012-845145127/coordinate-payload.asc), **Git blob SHA-1 7906deec84cfc26907ef417ee3ba7d727d1f5f53**, from the independent [public 2012 source](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/assets/2012/cicada.jpg.out). Earlier signed data and its genuine 2012 stage role are discussed in the [2012 coordinate source inventory](../workplace/2012-845145127-lp2-cross-round-route.md).

A 2014 solver could encounter the repeated emblem and obtain an exact earlier **signed numeric list**. The separately PGP-signed 2016 language referring to *map*, *direction* and *numbers* makes a geographic numeric source seem conceivable. **Neither source instructs using the 2012 numbers as an LP2 cipher key**, selects a particular numeric conversion or fixes an LP2 key clock. We therefore test two minimal explicit numeric consumers separately, keeping that objection primary.

**Consumer A: unaltered decimal digit key.** Preserve the twelve coordinate lines in their signed original order, discard nondecimal punctuation and hemisphere minus signs, and concatenate the **250 decimal digits**. Exclude the separate closing 3301 and all PGP signature bytes. Each digit 0..9 is a GP29 key index, initially aligned to the first printed glyph of p55. This is a straightforward Gronsfeld-style 29-ary numeric running key.

**Consumer B: signed integer DMS plus 3301.** Each original signed decimal degree coordinate is expanded using conventional **degrees, arcminutes, arcseconds**, truncating fractional seconds with the same fixed rule for all input. Apply its original hemisphere sign to each integer D/M/S component, reduce each modulo29, retain latitude then longitude, and preserve original coordinate line order. The **12 coordinate pairs × 2 axes × 3 units = 72** GP29 key components are followed by the literal decimal terminal marker **[3,3,0,1]**, giving a naturally source-formed **76-component key, matching all 76 printed p55 runes**. This length equality was noticed **after** the 76-rune target and could easily arise from choosing DMS and four terminal digits retrospectively. It is a reason for a bounded test, not authorial evidence. It does not justify trying arbitrary rounding, GPS grids, geohashes, byte encodings or reordered positions.

**One historical reversible encoder for both:** For GP29 plaintext P≠F, emit **C = (P + s·K[j]) mod29** and advance j, under either conventional sign s=+1 or s=-1. A plaintext F (index zero) emits the literal ciphertext F **without advancing** the key, exactly the authenticated LP2 p56 / LP1 Koan mechanism. A ciphertext F can instead hide an ordinary encrypted non-F plaintext rune. Enumerate **all** legal clock paths. Original p55 is physically 76 runes, with ciphertext Fs at precisely zero-based indices **15,25,41**. No guessed plaintext, phase offset, other key derivation, F bypass mask, word rearrangement or alphabet mapping enters either test.

## Consumer A: original literal-digit GP29 key

| Additive sign | Full-page legal inverse paths | Plaintext-F bypass positions by path | Decoded GP29 IoC |
| --- | ---: | --- | --- |
| + | 2 | [15]; [15,25,41] | **0.03333333; 0.03157895** |
| − | 3 | [41]; [15,25]; [15,25,41] | **0.03192982; 0.03228070; 0.02947368** |

All **five** paths reencrypt the original physical p55 **76/76**, including the three original ambiguous F sites. Their first complete four-rune printed word, after a single glyph carried from p54, is **D B N U** under + or **IA NG J P** under −. No original full-page inverse is native-GP prose or a recognized typed instruction.

## Consumer B: source-length 76 signed-DMS key

| Additive sign | Full-page legal inverse paths | First impossible original p55 rune | Surviving output |
| --- | ---: | ---: | --- |
| + | **0** | **62** (zero-based) | **None for any plaintext / F mask** |
| − | **1** | no contradiction | Bypass original F sites **[25,41]**; 74 key components consumed; decoded GP29 IoC **0.03403509** |

The unique surviving negative-sign path reencrypts every original **76/76** rune but opens in GP romanization as **S-N-M-TH-H-NG-W-W-NG-B-W-U-P-A-Y-TH-OE-OE-G-S-D-U-S-EA**. Its first complete four-rune word is **N M TH H**, without a recognizable native-GP English sentence. The positive-sign exact impossibility at original rune62 is a strict original-cipher/clock obstruction independent of language for this one fixed 76-symbol DMS pad; the reverse-sign negative rests on the absence of meaningful plaintext under an existing English register. The coincidental key length by itself carries no decryption evidence.

The strongest original plaintext IoC across either consumer is **0.0340351**, versus original p55 ciphertext **0.0378947** and the first 76 authentic clear GP runes of p57 **0.0596491**. As usual, short-message IoC alone is suggestive rather than categorical; the full original word segmentation and completely nonlinguistic openings provide the independent practical negative.

## Authentic source-native positive controls and decision

For **each consumer and both signs**, the exact **first 76 independently known clear LP2 p57 GP29 runes** are freshly encrypted under the source-derived key and real plaintext-F nonconsumption. The identical blind all-path decoder recovers **76/76** original solved clear runes, and the independent forward emulator exactly reencrypts them. Scripts assert the pinned 2012 Git blob, the original 12-line signed content, source numeric keys, exact original p55 indices, and all outcome counts. Both [DMS SFT](../sims/lp2_p55_2012_signed_gps_dms76_sft.cjs) and [decimal SFT](../sims/lp2_p55_2012_signed_gps_digitpad_sft.cjs) passed on the original files under the [manual workflow](../.github/workflows/agent11-2012-signed-gps-p55-manual.yml).

**Decision:** The signed 2012 Cicada-logo OutGuess GPS payload supplies a *real exact source* tied by emblem identity to LP2 p55. Both the unmodified digit pad and the 76-component signed DMS/3301 pad fail to decode the original under the known 29-way Vigenere-plus-literal-F contract. The original geographic purpose in the 2012 stage and repeated Cicada branding remain stronger historical explanations for this apparent bridge. There is **no evidence of a transferred 2012 key**.

The negatives are narrow. A future independent first-party instruction specifying a different GPS interpretation, cipher, receiver or key clock would change the decision. Without one, adding phase, rounding, orientation, source-coordinate reorders or extra cipher layers would be unconstrained. Preserve the signed source, retire these two literal consumers and leave the [authoritative synthesis](../results/README.md) unchanged.
