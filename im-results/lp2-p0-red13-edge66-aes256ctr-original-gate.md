# Opening red13 + exterior66: source-shaped 384-bit AES-CTR envelope on 650 original GP29 runes

**Agent4, 23 November 2026. Classification: one complete, unfitted original-source negative for a named reversible cipher; no unknown plaintext or authenticated key/operation.**

## The author-visible fork

The unchanged LP2 physical scans `17.jpg`–`19.jpg` place a 13-rune red title before 33 printed black lines of lengths verified by the source transcription: 12+12+9 lines, 716 black runes in all. Peeling exactly the first and last rune from each original black line leaves **650 interior GP29 runes**, while retaining **66 exterior runes**. The physical color separation plus LP2 p57's solved instruction to shed one's circumference is a plausible but not authoritative **extract-the-shell** cue.

The **13 red + 66 exterior** symbols give 79 GP29 digits, or **79·log2(29) = 383.780498615 bits**, extremely close to the **384 bits** occupied by a standard AES-256 key (256 bits) and 128-bit CTR initial counter (128 bits). This is a mathematically exact source dimension coincidence; the 79 base29 digits cannot cover all possible 384-bit values, so the equivalence is a near-match in capacity, not a proven coding convention. The source never actually states AES, 128-bit counter semantics, rune-to-byte serialization, or how to initialize it.

The experiment freezes **one** natural, fully executable original-source interpretation before examining any resulting plaintext:

1. Literal source-order GP29 values: p0 red13 first, then all 33 black line edge *pairs* in top-to-bottom printed order, first rune then last rune. Exactly 79 digits. The missing first/last orientation selector identified in the [edge-order audit](lp2-opening-line-edge-complete-alphabet.md) remains a real caveat; the opposite direction is not fit to ciphertext here.
2. Serialize as one unsigned, most-significant-first base29 integer, exactly **48 big-endian bytes**, zero-left-padded. First 32 bytes are AES-256 key; final 16 bytes are its 128-bit initial CTR state. This is one frozen convention, not an author-indicated derivation.
3. Generate exactly 650 AES-256-CTR keystream bytes with a zero plaintext block. Reduce each keystream byte modulo29 and subtract it from the corresponding original 650 interior rune indices, with the untouched printed word separators and order. The byte%29 mapping has a mild inherent bias but is an unambiguous simple coder. No alternate endianness, KDF, counter, start, time shift or grouping is optimized after reading the output.
4. Compare the complete output to the native GP language register. Exact modulo29 forward re-encryption back to the original650 is mandatory; a genuine independent known-p57 95-rune plaintext is also encrypted/decrypted using the same fixed AES keystream to validate the implementation.

## Source-exact Windows result

```
79-digit AES envelope SHA-256
  c12a5d77f180c76d1882e756045c4cac87ad737b88b418f742063d4f1177b7c9

Unaltered 650 interior ciphertext IoC    0.034149579234324996
Full AES-CTR-decoded 650 rune IoC         0.03441033542728458
Authentic solved p57 clear 95-rune IoC    0.06270996640537514
Original forward replay                  650 / 650 exact
Independent native p57 positive           95 / 95 exact
```

The first decoded symbols in actual GP transliteration are:

```text
L-B-G-EA-X-AE-U-NG-O-EA-R-P-A-G-TH-P-O-S-EO-A-I-U-T-IA-C-EA-EA-O-H-C-M-X-R-NG-T-F-EA-TH-EA-O-T-E-J-O-J-X-NG-H-D-NG-M-M-J-L-L-W-I-H-X-AE-B-G-IA-F-C-N-B-M-X-I-T-M
```

They show no native-language reading. The complete 650-rune output retains essentially uniform GP29 single-symbol distribution, far from the native solved p57 register, despite **exactly reversible ciphertext** and successful genuine solved-source positive. This rejects this **one** frozen red-title/exterior AES-CTR direct inverse as a solution.

**Reproduction:** [read-only Windows-compatible Node22 source SFT](../sims/lp2_p0_red13_edge66_aes256ctr_original_sft.cjs), run against the exact committed original `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`; [Windows Node22 PASS, run 45243435564](https://github.com/FlareZ123/liber-primus/actions/runs/45243435564). The SFT asserts all original source rune counts, physical line widths, exact unchanged p0–2 combined ciphertext, original and solved-positive replay, and emits all measurements above.

**Decision:** This closes an otherwise plausible full-length **source-envelope/standard 384-bit AES** successor to the p0–p2 first-occurrence edge29 observation, without parameter hunting. It does not rule out a genuine author-selected different nonperiodic operation, additional source state, or a different shell interpretation. A next attempt needs an independent 2014-visible **AES/byte-code/clock instruction or source-selected alternative**, not merely the near-384-bit count. No GP plaintext or destination recovered.
