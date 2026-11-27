# PNG Average over the original table, then p55 outer ring: bounded inverse

**Agent2, 27 November 2026. Status: original-input composite cipher hypothesis with an outlying short-sample statistic, but no recovered unknown plaintext, authentic key, or Cicada-selected receiver.** This is distinct from the separately completed table PNG Average test and the separately completed raw-grid perimeter tests. It combines those operations without altering source bytes or making a language-selected key choice.

## Why the composite is worth an exact decision

The 32×8 original p49–51 numeric table (original scans66–68) contains two high-band successor chains with a missing `4C` (L). Under a *conditional* base60/Bitcoin convention, its fifth 32-byte column becomes a secp256k1 scalar whose compressed P2PKH address begins `1Meanpng`: see [source record](lp2-p50-missing-l-secp256k1-address.md). The original p57 clear text separately says **“shed our own circumferences”**; the 32×8 table has a **76-cell outer perimeter**, exactly the **76 runes of original p55**. The two stand-alone original-input lines are in [PNG Average gate](lp2-p50-meanpng-png-average-original-gate.md) and [76/180 ring synthesis](lp2-terminal256-knowninterior-ring-gate.md).

A human could therefore try *filter3 Average on the full 2-D table, then peel its outside circumference as a key*. This specific composition was not explicitly printed or signed, and the Bitcoin/PNG interpretation was recognized after choosing its serialization. A selective statistical improvement alone cannot authenticate it.

## Frozen complete inverse

Interpret the 256 printed symbols with the previously recorded conventional base60 alphabet as bytes `B[r,c]` in their original 32×8 row-major layout. Apply **standard PNG filter3 Average unfilter**:

\[
G[r,c]=\bigl(B[r,c]+\lfloor(L+U)/2\rfloor\bigr)\bmod256
\]

where `L` and `U` are the already-reconstructed left/up neighbors (zero outside the array). Re-applying forward Average exactly recovers **all 256/256 original bytes**. The first eight raw bytes `cb e7 a7 ba 61 ed 7e b7` become `cb 4c cd 20 71 25 90 ff`. This previously known second-byte ASCII `L` feedback is *not* a newly decoded plaintext letter.

Take exactly the 76 boundary pixels in each of four complete layouts: clockwise top-left/top/right/bottom/left; its reverse; border cells in printed row-major; and the latter reversed. Reduce each byte modulo29. For each of the eight (four layouts × plus/minus), apply a positionwise additive original-p55 inverse `P[i]=(C[i] ± K[i]) mod29`, beginning with the **physical** p55 index0, which completes a word from p54. Do not change rune segmentation, fit offsets or exclude the terminal six-rune bookend.

## Actual original-p55 results

| 76-cell order | P=C−K IoC | P=C+K IoC |
| --- | ---: | ---: |
| Clockwise from top-left | 0.037895 | 0.032632 |
| Reverse clockwise | **0.051228** | 0.032982 |
| Border row-major | 0.038246 | 0.035439 |
| Reverse border row-major | 0.033684 | 0.036842 |

Original p55 IoC is **0.037895**, while the first 76 genuine clear p57 runes have **0.059649**. Every direct inverse re-encrypts **76/76** unchanged p55 symbols, which verifies invertibility but not the authorial cipher.

The high-IoC reverse-clockwise `C−K` candidate, divided at its actual original p55 word boundaries, is:

```text
TH JCMM ITH SS JTHNGIAD AESNGPW THR O
IASIPTHDCROAESTH NODXLG DXOED JP
NIGOEJPIA TPUDISY BP IOEIJ JS SXIA SFI
```

The displayed transcript is **not native-GP29 prose**; the original 12-rune word at p55 local offset24 remains an obviously nonlexical cluster. No second key or plaintext has been inferred from this artifact.

**Fixed-inventory look-elsewhere controls.** Keeping the real table and its filtered key constant, shuffle all 76 original p55 ciphertext symbol occurrences without replacement and score the *maximum over the same eight readings*: **47/30,000** ciphertext shuffles score at least the original maximum; conservative plus-one tail **0.00159995**, xorshift32 seed `0x330176c1`. In a separate test keep p55 unchanged, shuffle all 256 printed source byte values without replacement, unfilter each whole table and score only the previously observed favorable reverse-clockwise `C−K`: **11/30,000** reach its IoC; plus-one tail **0.00039999**, seed `0x33010019`. These condition on the selected source interpretation and cannot correct for every prior hypothesis, opcode and target chosen after inspecting the manuscript. The unusually large statistic is **not proof of plaintext**.

## Authentic plaintext-F nonadvance test

The genuinely solved p56 cipher transmits plaintext rune `F` (index0) unchanged as ciphertext `F` **without consuming a prime-key step**. Transfer only this known bypass rule to the new hypothesized *table* key and enumerate **every** legal inverse path; at ciphertext `F` grant the hold or an ordinary consuming nonzero plaintext, while at non-`F` require consuming nonzero plaintext. This has no extra fitted key.

**Six of eight** source layout/sign cases have **zero complete legal paths**. In the table order above, their earliest impossible original p55 offsets are **30,63,57,8,55,2** (the two survivors omitted). Complete paths remain only for two layouts:

- reverse-clockwise `C−K`, IoC **0.038947** (the ordinary outlier's 0.051228 signal disappears);
- border row-major `C+K`: **two** distinct admissible F-hold histories, IoCs **0.041754** and **0.040000**.

Neither survivor produces native prose. To guard against a false rejection from the decoder, the exact **first 76 genuine clear p57 runes** are re-encrypted under **all eight** source table keys/signs with authentic `F` bypass. The corresponding exhaustive inverses retain the correct full plaintext in **8/8 planted controls**. These are algorithm checks, not evidence the table supplied p56's original key.

## Research decision

This composite has **not deciphered p55**. The inflated unconstrained IoC has a finite-family, postselection-sensitive null tail but lacks recognizable text, and the historically motivated F bypass removes its apparent advantage. The 76/180 ring match and the missing-`4C`/`Meanpng` arithmetic remain separately interesting conditional clues. **Do not extend the same input to arbitrary filter orientations, cryptographic offsets or private per-word masks to rescue this one statistic.** Further effort requires a genuinely first-party clue selecting a new reversible operation or an independent unknown ciphertext prediction.

**Reproducer:** [read-only original-source CJS](../sims/lp2_p50_meanpng_average_p55_outer76_fhold_sft.cjs). It asserts the original table and p55 lengths, entire 256-byte forward/inverse reconstruction, all eight cipher round trips, exact F-hold path counts and native p57 plants, and both fixed-seed 30,000-trial controls. The numerical experiments were independently executed in connected JavaScript; a separate Node/CI execution has not yet been claimed.
