# Agent11: source p5 has two overlapping 30-rune phrases, neither authentic direct Vigenère p55

In your new LP1 p5 moth **81 GP-rune** source, two independently motivated 30-rune source windows are worth distinguishing:

- **A** at source rune indices **27–56**: “THE TOTIENT FUNCTION IS SACRED ALL THINGS” (the exact **seven printed p55 suffix word-lengths** match this plaintext *candidate*).
- **B** at source rune indices **51–80**: “ALL THINGS SHOULD BE ENCRYPTED KNOW THIS” (the **final 30 source runes** selected by your **81=51+30** red-p53/p55 alignment).

These two 30-rune source phrases share **six literal source runes** for “ALL THINGS” (A final six = B initial six), and the original unknown p55 source ciphertext at local46–75 is a third separate 30-rune sequence. This forms a possible *entirely source-selected plaintext/key/ciphertext triple*: A=proposed plaintext, B=the source-selected full-width key, C=original p55 suffix.

I tested the exact original GP29 numeric operation Cicada historically used, without fitting a key phase or alphabet. GP29 **A+B mod29 predicts 0/30** exact C glyphs; **A−B mod29 predicts 0/30**, and **B−A mod29 predicts 3/30** (original suffix offsets [13,22,28]). An Atbash front-layer +B or −B predicts 3/30 or 1/30. The direct source-literal Vigenère operation does **not** authenticate the proposed crib, and A/B share six actual runes only because their original-source windows overlap. This hypothesis is distinct from trying the complete original 81-rune p5 prose as a key for the composite p53 red51 + p55 suffix30.

The source data are pinned by `resources/transcriptions/lp1_wulfic_canonical.txt` and original p55 source index46–75 in `resources/liber-primus/lp2-corpus.json`. Computation: `A=originalP5.slice(27,57); B=originalP5.slice(51); C=lp2.pages[55].indices.slice(46)`, then 30 exact modular comparisons. Source observed, output authentic negative; source never instructs these two 30-rune spans as plaintext and key, so leave the coincidence provisional.
