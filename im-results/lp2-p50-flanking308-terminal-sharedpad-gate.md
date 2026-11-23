# Original p50-flanking 308 vs terminal 308: stationary shared-pad cancellation gate

**Result (23 November 2026, Agent34):** The original, complete sentences enclosing the numeric table have **138 + 170 = 308** GP29 runes; the complete original terminal p54–55 chapter independently has **232 + 76 = 308** runes. This fixes a zero-offset two-text receiver without cutting words or inventing a numerical table interpretation. A source-aligned **same, synchronized, additive GP29 keystream** is sharply disfavored by an exact key-cancellation necessary condition. No plaintext, pad or independently selected reason to equate the keys is discovered. This is a conditional exclusion of one attractive reusable-key attack, not an exclusion of other historical transducers.

## Original physical source, alignment and hypothesis

The p50 grid is 256 printed two-character cells on original image 67.jpg, with 66.jpg and 68.jpg supplying adjoining source text. Original complete pretable sentence: p48 last 72 runes and p49 all 66 runes, **138** runes/33 words. The independently complete posttable sentence: p51 all 92 and p52 first 78, **170** runes/40 words. The table separates these sentences visually. An independent illustrated terminal rubric contains p54 **232** and p55 **76** runes. Original source register: `resources/liber-primus/lp2-corpus.json`, with page-crossing word repair from the actual manuscript, original scans `65.jpg`–`69.jpg` and `71.jpg`–`72.jpg`. The juxtaposition of 308 and 308 was recognized in research, not a documented first-party instruction.

Freeze the concatenation in printed order, preserving the real complete sentence boundaries and the source terminal page order:

- `A = p48[-72:] || p49[:] || p51[:] || p52[:78]` (308 rune indices).
- `B = p54[:] || p55[:]` (308 rune indices).

Hypothesis `A_i=(P_i+K_i) mod 29` and `B_i=(Q_i+K_i) mod 29`, same unknown `K_i` at each of 308 equal zero-phase positions. Necessarily `A_i-B_i ≡ P_i-Q_i (mod 29)`, with no pad assumption otherwise. Recoverability would require the difference profile to resemble two authentic independently written GP-native passages; such a collision could nominate simultaneous plaintext decoding without searching the key itself.

## Decisive original-input result

The complete **29-bin original difference histogram** `A-B mod29` is

```text
[14,11,8,9,12,10,9,16,10,11,10,16,11,7,10,10,11,13,6,7,6,9,9,10,9,16,15,10,13]
```

Its zero difference occurs **14/308** times (4.545%). Genuine LP1 native-GP plaintext independently has single-symbol coincidence probability 0.06212885; other independent language controls are close. Zero difference alone is a weak exclusion, so we instead test the *complete 29-bin native-letter expected difference spectrum*.

For each genuine-language control, compute its native GP29 letter marginals `p` and the exact shared-key difference null `q[d]=sum_u p[u]p[(u-d+29)%29]`. Calculate `LLR = sum_d observed_count[d]*ln(29*q[d])` against uniform GP29 differences. Under the shared-pad model the keystream cancels exactly, even if it has arbitrary entropy. For calibration, sample **3,000 nonoverlapping pairs of length-308 source-native text excerpts**, independently encrypt both with the **same independently randomized per-position additive GP29 key**, assert the 29-bin cancellation identity, and compare the positive-control LLR. Random sources without key sharing are additional original-book registration controls.

| Source-native language | GP29 reference runes | Original LLR | Lowest of 3,000 genuine same-pad positives | Positives at or below original |
| --- | ---: | ---: | ---: | ---: |
| Solved LP1 original text | 3,287 | **−10.0616** | −5.5530 | **0/3,000** |
| Gibran prose | 63,114 | **−8.6191** | −5.4855 | **0/3,000** |
| Shakespeare prose | 218,800 | **−7.7654** | −9.4667 | **1/3,000** |

The unusually flat original differences are in the typical independently keyed/unrelated-original regime, rather than paired prose under a shared additive pad. The three controls derive from authentic source-language files, though Gibran and Shakespeare serve as approximate orthographic controls and are not claimed to be the actual hidden plaintext. They are corroborating calibrations with overlapping English assumptions rather than three independent historical proofs. The Monte Carlo counts test this frozen architecture and should not be inflated into an unadjusted probability of every possible cipher.

**Disposition:** reject direct synchronized zero-origin GP29 additive-key reuse between the authentic p50-flanking 308 and p54–55 terminal 308 unless a new independently authenticated source explicitly selects a different operand/phase or introduces additional reversible layers. Do not try fitted shifts, tune alphabet labels or infer English from the equal-length coincidence. This does not rule out a stateful reading of either complete sentence, an independently chosen different ciphertext key, or any p50 byte operation.

## Reproduction

- [Windows Node 22 CI PASS 45095049789](https://github.com/FlareZ123/liber-primus/actions/runs/45095049789)
- [Complete CommonJS source-only single-file test](../sims/lp2_p50_flanking308_terminal_sharedpad_sft.cjs), deterministic seeds `0x33010001`, `0x33010002`, `0x33010003`.
- Direct inputs `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp1-plaintext-reference.txt`, `resources/control/gibran_prophet_58585.txt`, `resources/control/shakespeare_first300k.txt`.
- This is a bounded negative original-cipher test. It should remain in `im-results/`; the authoritative `results/README.md` correctly continues to report no newly decrypted LP2 pages.
