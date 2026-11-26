# Encrypted message-key indicators and LP2 rubric framing (#2880)

**Decision:** no authored selector for the historical doubled Enigma indicator; the six-symbol format is absent at every original red span. A nine-symbol successor procedure has two length matches but lacks the independently specified rotor/mapping/master key and a source-typed receiver. Do not convert these into free wrapping-key fits. No original key or plaintext recovered.

## Historical positive
The pre-September-1938 Enigma procedure distinguishes (1) common daily rotor order/ring settings/plugboard/ground position, (2) chosen three-letter message setting, (3) six-letter encrypted repetition of that setting, and (4) body cipher reset to the recovered message setting. The repeated clear key is an independent error check after unwrapping. Historical overview: [University of York course](https://www.futurelearn.com/info/courses/the-mathematics-of-cryptography-from-ancient-rome-to-a-quantum-future/0/steps/384917), [1991 IMA Bulletin historical discussion](https://cdn.ima.org.uk/wp/wp-content/uploads/2024/09/Classical-Cipher-Machine_Bulletin_1991.pdf). The course is a modern exposition of a pre-2014 procedure, not a Cicada-visible artifact.

Actual published example (University of York): III/I/II left to right, plug pairs CD GI HZ OX PT RY, ground YRK, repeated message setting QQQQQQ. Standard B reflector, zero ring offsets, pre-step/double-step implementation reproduces MFKFXT, and after rotor reset QQQ produces UPGFSMERGZ for HELLOTHERE. Inverse exactly recovers QQQQQQ and HELLOTHERE. This distinguishes the master wrapping operation from body clock rather than treating indicator bytes as a raw body pad.

## Original fields
Use exact annotated source spans from corrected GP29 ink data. Unknown red spans: lengths 13,16,3,11,14,12,9,11,16,19,10,8,3,8,51,9. Nine chapter-opening lengths (first contiguous span, p15 split at actual red 13-dot): 13,16,12,9,16,19,10,8,9. No six-symbol span; including both p15 headings gives 20, not 6. p0 is physically red8+red5, not red8+black5. Thus the literal six-symbol repeated indicator cannot be the entirety of any known original red span under one-rune/one-symbol framing. The solved red spans p56/p57 are five/seven runes; p56 decrypts to AN END under continuous prime-totient clock and p57 is literal PARABLE. The source does not license taking arbitrary six-symbol windows within a colored title.

From September 1938 until May 1940, a different procedure supplied a clear ground setting plus the six wrapped message-key symbols, a total of nine letters. The two length-compatible source spans would split:
- p15 first rubric: [0,1,20] + [19,24,28,26,22,24]
- p54 rubric: [24,19,21] + [23,27,2,14,10,19]

These are raw original rune indices, not recovered keys. The real Enigma alphabet has 26 symbols whereas GP29 has 29; no original Cicada instruction specifies a GP-to-rotor alphabet or rotor construction, daily configuration, ring settings, or the clear three-symbol ground setting interpretation. In fact p15 wrapped data includes rune index28. Index truncation would be arbitrary. Field length alone does not identify the receiver. A repository text search for Enigma produced no hits; this is not exhaustive historical proof of absence. #2181/#2423 and #2869 supply independent rubric context but no such selector.

## Bounded GP analogue (not historical Enigma)
Even grant arbitrary half-width message keys and a common phase-reset additive wrapping mask applied to the doubled key. For same total width, the elementwise modular difference between second and first halves cancels the unknown message key, requiring the same vector across all same-width indicators.

Original p3 and p23 initial red16 give [5,0,4,6,16,11,28,6] versus [9,22,3,20,10,3,16,20]. They disagree at all eight coordinates. Original p33 inset red8 and p40 opening red8 give [8,3,10,2] versus [6,14,6,11], disagreeing at all four. This is an exact all-master-shifts contradiction for those common-reset same-width paired candidates. In contrast, arbitrary distinct per-position bijections are NOT excluded: both same-width pairs have no equality mismatch between corresponding halves. No claim against variable starts, arbitrary per-position wrapping, or metadata mixed with semantic headings.

## Reproduction and next action
[Executable](../sims/lp2-wrapped-indicator-format-gate.cjs) reproduces the full historical example, reads the immutable corpus and annotations, outputs all field lengths, nine-symbol splits and bounded GP analogue constraints. [Raw output](lp2-wrapped-indicator-format-gate.json). Actual connected JS executed; standalone CI not run. The explicit missing input is an authored wrapping operation and symbol/framing convention. No black-body language scoring was performed with unselected keys. Retire this indicator grammar; a real authenticated selector can reopen it.
