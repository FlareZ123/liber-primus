# P57 rim-seven source pointer: LP1 scan03 OutGuess and inner-180 RC4 receiver decisions

**Agent4, 22 November 2026. Evidence class: two tightly scoped original-source receiver failures.** No previously unsolved LP2 plaintext, authenticated key, original decoder, or Cicada destination has been recovered. The original numerical readout is preserved as a *conditional* potential external pointer.

## A concrete original artifact with a period-available recipient

The solved **LP2 physical p57** has one red seven-rune title `PARABLE` followed by **13 red dots**. Its authentic text instructs `WE MUST SHED OUR OWN CIRCUMFERENCES`. The physical pp49–51 numerical object has **32 rows×8 columns**, exactly **76 cells on the outermost rectangular perimeter**. Clockwise from the top-left, one-based rim position13 (the visible red-dot count) begins seven conventional base60 bytes:

```text
Printed tokens   1G 1K 0p 1m 1M 15 0Z
Base60 bytes     76 80 51 108 82 65 35
Literal ASCII    L  P  3  l   R  A  #
```

This source-derived candidate seven-byte password is `LP3lRA#`. It was already observed and independently tested on *LP2 physical page3* original `20.jpg` without recognizable output, in [Agent23's prior report](lp2-p57-13dot-p50-perimeter-lp3seven-original-stego-gate.md). This report does not repeat that test.

The **new distinct recipient** is the *first release of Liber Primus physical 03.jpg*, whose independently solved `WELCOME` text says `LIKE THE INSTAR, IT IS ONLY THROUGH GOING WITHIN THAT WE MAY EMERGE`. The independently solved **LP2 PARABLE** itself begins `LIKE THE INSTAR TUNNELING TO THE SURFACE` and explicitly says `DIVINITY`, the actual historical key for LP1 scan03. A 2014 human player could know the earlier scan and the genuine historical **OutGuess 0.4** steganographic receiver. `LP3` still may mean a different page or no page pointer; the original manuscript never explicitly names this password or tells the player to run OutGuess on scan03.

## New frozen original LP1 scan03 OutGuess experiment

Read original [`resources/liber-primus/03.jpg`](../resources/liber-primus/03.jpg), **892,759 bytes**, under **one exact, unchanged** OutGuess 0.4 password `LP3lRA#`. No casing, suffix, length, offset, alternate page or ciphertext-derived tuning was attempted.

The pinned historical OutGuess implementation at Git commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` successfully decoded actual original default-key Cicada `00.jpg` and `08.jpg`; a newly embedded **47-byte** `79`-keyed message recovered exactly. Crucially, a synthetically generated **known empty JPEG** with the same `LP3lRA#` password falsely reported a valid-looking OutGuess seed **8511**, header length **18,830**, and returned exactly 18,830 nonrecognizable bytes. Thus a successful-looking seed/length is **not proof** of a true payload.

The actual `03.jpg` extraction under the source password returned an apparent header with seed **36,792**, length **33,152 bytes**, and SHA-256 `7603d7ccbf508d97845465d12190cc0f1b83ed8a250cdc34093c2212ff41a194`. Its first32 hex bytes are `a81a012a304f5a7ac494c623a30517dad21f0f870ed3bf69bf6c09d4f0dc8b2e`. Its printable-byte fraction is **38.1938%**, Shannon entropy **7.994725 bits/byte**, with **no recognizable text or standard PGP/ZIP/gzip/PNG header**. The old extractor's false empty-image header prevents treating this raw binary as authenticated. No historical key, plaintext or continuation was obtained.

**Exact successful original-image CI:** [run 45028960436](https://github.com/FlareZ123/liber-primus/actions/runs/45028960436), output binary and source/empty control metadata preserved as its uploaded [artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45028960436/artifacts/14756861809). Source-frozen [Node22 SFT](../sims/lp2_p57_13dot_p50_lp1p03_original_outguess_sft.cjs), [pinned OutGuess workflow](../.github/workflows/agent4-p57-lp3-lp1p03-outguess.yml). This excludes the historical recipient only for the exact password and original first-release scan03, without attempting to prove that no other keyed JPEG payload exists.

## Distinct typed inner-table interpretation: historical ARC4/RC4

A second *fully source-frozen* possibility uses the same seven ASCII bytes as an **RC4 key**, and uses the parable's literal `shed circumferences` as a separate **receiver selector**. Remove all 76 outer table cells, leaving an original row-major **30×6 = 180-byte interior**. Independently authenticated terminal physical p56 has **85 encrypted GP29 runes** with known plaintext/key, and p57 has **95 clear GP29 runes**. Their **85+95=180** alignment produces a stringent source-known holdout; it does not depend on a guessed unknown-page plaintext.

Freeze the original interior 180-byte row-major read and the seven-byte key `LP3lRA#`; use the standard 2014-available RC4 stream, initial state without a guessed drop count. Before reading output, allow only the two previously source-motivated literal numeral radices (**ordinary base60**, omit-unprinted-`f` **base59**) and three fixed, reversible byte-to-rune readouts: ordinary byte XOR, and `(table value ± RC4 byte) mod29`. The arithmetic alternatives are conditional GP29 transports, not historical commands. **Six** distinct tests and no phase/position or key searches.

| Printed numeric codec | RC4 readout | Match to all 180 known terminal rune values | Match to 95 clear p57 runes | Output in native rune range 0–28 |
| --- | --- | ---: | ---: | ---: |
| base60 | byte XOR | 1 | **0** | 21/180 |
| base60 | table − stream mod29 | 8 | 6 | 180/180 |
| base60 | table + stream mod29 | 6 | 3 | 180/180 |
| base59 | byte XOR | 2 | 1 | 20/180 |
| base59 | table − stream mod29 | 8 | 4 | 180/180 |
| base59 | table + stream mod29 | 3 | **0** | 180/180 |

The byte XOR path fails even the ability to represent all the already-known GP29 runes. Every modular path fails the independently known clear p57 with at most **6/95**, and the entire known terminal block with at most **8/180** exact matches. This is a discriminating source-known rejection before unknown p55 is touched.

The source-only implementation reproduces the standard RC4 `Key → eb9f7781b734ca72a7` nine-byte known test vector and recovers all95 authentic p57 known runes after a planted GP29 encryption under the same seven-byte RC4 clock. The original mismatch thus rejects the **declared direct recipient**, not the implementation.

[Original-source read-only CommonJS SFT](../sims/lp2_p57_lp3seven_arc4_p50_inner180_original_sft.cjs), [Windows Node22 original-input PASS 45029302015](https://github.com/FlareZ123/liber-primus/actions/runs/45029302015), [manual Windows Node22 workflow](../.github/workflows/manual-readonly-commonjs-sft.yml) with `script=sims/lp2_p57_lp3seven_arc4_p50_inner180_original_sft.cjs`. All original manuscript inputs are unchanged.

## Research decision

The p57→outer-rim13 `LP3lRA#` reading is internally consistent and points to two historically plausible pages, but selecting its *recipient* remains an independent unresolved problem. Both original-image historical OutGuess on LP1 scan03 and standard RC4 on the source's 180-byte interior fail to recover a meaningful signal under fixed, full-length original known-text tests. They should be **retired as typed receivers**, without rewriting the clue as authentic plaintext.

Useful further progress requires a **first-party author instruction identifying the recipient and exact consumer**, an archived authentic key file, or independently decrypted unknown-page text. Retuning passwords, source pages, output clocks or binary formats until one produces English would merely fit an exploratory label and should be avoided.
