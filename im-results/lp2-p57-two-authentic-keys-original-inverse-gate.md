# P57's two creator-era Vigenere keys: original p55 two-layer inverse

**Status (Agent 14, 15 November 2026): exact two-key original-data negative, without a source-authenticated layer-order instruction.** No unknown LP2 plaintext, authentic p55 key or continuation recovered. The direct two-key composition is an independently motivated source-key route; this note deliberately does not re-run either single-key transfer.

## Why this is worth one frozen test

The **clear LP2 p57** says **"SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE."** These two unusually named concepts have exact creator-era counterparts in the *already solved first-release puzzle*:

- **FIRFUMFERENCE**, GP29 indices `[0,10,4,0,1,19,0,18,4,18,9,5,18]`, authentic source-implemented 2014 GP29 Vigenere key for LP1 image pages 107/167. The contemporaneous [Stage06 code](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/gematriaprimus.py) selects this exact spelling, versus the `FIRFUMFERENFE` variant printed in another README. Its **13-rune** clock advances on every unmarked rune, with no colon marks in LP2.
- **DIVINITY**, GP29 indices `[23,10,1,10,9,10,16,26]`, an independently verified **eight-rune** Vigenere key from solved LP1 pp03–04. Its actual known decryption sometimes treats F as literal and non-key-consuming.

The historical positive controls and the individual failed LP2 transfers are documented in [the FIRFUMFERENCE original-key gate](lp2-2014-firfumference-vigenere-gate.md) and [the DIVINITY original-key gate](divinity-key-reuse-lp2.md). The p57 sentence names both roots in the same order. That supports one new *direct two-layer* test on **immediately preceding unknown original p55**, without guessing a fresh keyword, key start, chapter partition or mathematical function. **It does not prove the author intended key reuse or two layers.** The source text may be purely philosophical.

## Fixed exact original receiver and two-key rule

Original p55 (the source `resources/liber-primus/lp2-corpus.json`, `pages[55].indices`) has exactly **76 GP runes**, including a single page-start word carry. Freeze index zero at that first original rune. Strip the source-authentic 13-symbol outer key, then the source-authentic eight-symbol inner key, both starting at zero and advancing once per rune:

```text
Q[i] = (C_p55[i] - FIRFUMFERENCE[i mod 13]) mod 29
P[i] = (Q[i]     - DIVINITY[i mod 8])       mod 29
```

There are **zero fitted parameters**. Both layers use the independently established historical GP29 sign. For the no-skip historical convention, exact forward reencryption reproduces all **76/76** original ciphertext positions. An independent **76-rune native plaintext plant from solved p57** encrypts and decrypts exactly under both layered keys.

| Candidate | IoC for 76 source-runes |
| --- | ---: |
| Original untouched p55 | **0.0378947368** |
| FIRFUMFERENCE outer only | **0.0378947368** |
| DIVINITY inner only | **0.0396491228** |
| Two historical keys composed | **0.0357894737** |
| Independently clear p57 95-rune English reference | **0.0627099664** |

The complete 76-rune proposed two-layer output, separated here into GP symbols, is:

```text
IA C X F Y S U EA NG T TH L AE NG EA EA R P Y A O OE EA J F U P M G L B Y X OE S P U F E U N S T Y P A W B T EA R W C S A NG L EO U O C T G L OE E EA C AE O B X E O EA L
```

It is neither source-native GP English nor an independently recognizable instruction. The IoC remains close to the 29-symbol-uniform reference. This is an exact negative of the **direct zero-phase two-key consumer**, not a general disproof of layered encryption.

## Source-heading clock across the complete 308-rune p54–55 section

A different zero-tuning historical clock start is the **original nine-rune red heading of physical p54**, which opens the entire final encrypted p54–55 chapter. The preceding p53 belongs to the earlier floral chapter, and the original p55 page break **does not start a new independently marked cipher section**. Historically verified LP1 Vigenere keys could continue across physical pages. Hence a legitimate rival to the initial p55-local zero clock is to start both keys at original **p54 offset 0** and carry through **232 p54 + 76 p55 = 308 original runes**, without any page reset, F mask, key phase optimization or changed layer order.

The full two-key inverse with both keys consuming every rune exactly reconstructs all **308/308** ciphertext runes, but its decoded IoC is **0.0344980752**, versus the original section **0.0338212276**. The 76-rune p55 tail has decoded IoC **0.0417543860** and remains nonlinguistic; the red p54 opening decodes as `U EA T P B TH IA A NG`, with no recognizable chapter heading. As a source control, independently clear p57 has IoC **0.0627099664**.

Enforcing the authenticated literal-F DIVINITY semantics yields strict contradictions in both fixed outer/inner orders:

- FIRFUMFERENCE outer then F-transparent DIVINITY inner: illegal encrypted-F outcomes at **chapter-relative indices [36,72,168,184,241,256,267,283,301,303]**.
- F-transparent DIVINITY outer then FIRFUMFERENCE inner: illegal encrypted-F outcomes at **[38,43,89,90,95,126,144,214,302,304,307]**.

The decisive p55-tail original positions are **[9,24,35,51,69,71]** and **[70,72,75]** respectively after subtracting p54's 232 preceding runes. The complete 308-rune tests passed the [source-exact Windows Node.js 22 run 43667061839](https://github.com/FlareZ123/liber-primus/actions/runs/43667061839); its temporary workflow was removed after verification. This excludes the particular **historically natural chapter-reset** interpretation as well as the page-reset interpretation in the prior section. Those are separate, source-explained clocks, not an exhaustive eight-by-thirteen phase search. Nothing authorizes inventing further shift phases or page-dependent exceptions to rescue them.

## F-transparent layer variants

The literal-F special case in the authenticated DIVINITY LP1 mechanism provides a second **source-selected** interpretation. Under a strict automatic plaintext-F passthrough rule, a cipher F decodes to F and consumes no DIVINITY position; a non-F cipher cannot legally decode to F because F would have been emitted literally.

- **FIRFUMFERENCE outer / DIVINITY F-transparent inner:** The outer-decrypted intermediate has F at indices **27, 66, 74**. The inner decoder consumes **73** key symbols but outputs impossible encrypted F at original p55 offsets **3, 24, 36**.
- **DIVINITY F-transparent outer / FIRFUMFERENCE inner:** The original ciphertext F offsets are **15, 25, 41**; the inner-authentic-F decoder consumes **73** key symbols but has impossible F at offsets **3, 27**.

Thus both natural automatic-F versions violate their **exact encoded-decoder semantics** on original p55 before language scoring; forcing those extra sites to bypass would invent a new, unsourced exception map. A manually chosen F mask may not be treated as a true source-selected decoder.

## Decision and reusable artifact

No actual unknown-page plaintext or external key was recovered. The p57 coupling is a genuine historical motivation, but the **untuned composition** of two authenticated GP29 Vigenere keys cannot explain original p55. Do not expand free key phases, invented F masks, byte transforms or layer orders on the strength of the verbal link alone. Reopen this route only if an original artifact supplies a **typed instruction** selecting different treatment.

[Read-only Node.js 22 SFT](../sims/lp2_p57_circumference_divinity_double_vigenere_sft.cjs) asserts exact source lengths, both historical keys, original 76-rune roundtrip, synthetic native-control roundtrip, actual IoCs and literal-F contradictions. It passed [manual Windows Node.js 22 verification, run 43666506563](https://github.com/FlareZ123/liber-primus/actions/runs/43666506563); the temporary CI workflow was removed afterward. 
