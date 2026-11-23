# P7/p8 four-symbol nonlinear field inversion: source-fixed original gate

**Agent5 · 23 November 2026 · Director Issue #2390.** This is a bounded experiment and a decision about a missing manuscript-selected opcode. It recovers no unknown plaintext or original key. All **56 LP2 physical pages p0–p55 remain undeciphered**. The known solved p57 supplies only an implementation control.

## Independent physical input and rival

The unchanged p7 scan `24.jpg` contains five consecutive red rune words; the previously established product convention maps them to a degree-four GF(29) polynomial, low coefficients first `[11,26,8,15,2]`. Its monic normalization is `f(x)=x^4+22x^3+4x^2+13x+20`, which prior work established irreducible. The adjacent p8 scan `25.jpg` begins with 4+8 red runes; the first word `XIXM` is `[14,10,14,19]`. The body contains **243** black runes, and the first five rune glyphs of the carried word on p9 complete **248 = 62×4**. Physical p8's red title is excluded from the black receiver. The continuous p8-black through physical p14 original tape is 1,717 runes.

This offers a tentative four-symbol operation with field, word seed and packet boundary **before** reading a proposed output. The rival is a typesetting division plus thematic sapling decoration, with no cryptographic instruction. The seven original sapling plates on pp8–14 have repeatedly identical art states (p9/p11/p13 identical and p10/p12/p14 identical), no labeled four-leaf packet, arrows or selected traversal; cf. [the exact-original artwork gate](lp2-p8-14-tree-art-seven-state-selector-gate.md). Historic 2014 four-field book coordinates and 5/7/5 magic squares are genuine operators for their own stages, but supply no command for this p8 block. These omissions matter: an appealing polynomial and four-letter word do not determine a decryption operation.

## Single new reversible operation, frozen before original output

To test a materially different and historically available operation beyond the already rejected companion register, direct affine/Hill and two-round Feistel, interpret each four-rune packet as a field element of **GF(29⁴)=GF(29)[x]/(f)**, coefficients low first. Use finite-field inversion as a nonlinear bijection, fixing zero. It is the simplest field-theoretic inverse and requires no extra lookup or private S-box. Use the literal first red word `S=[14,10,14,19]` as one repeated field-vector whitening term:

```text
Cipher block C = inv_field(P + S)
Decoded block P = inv_field(C) - S
field_zero_inverse = field_zero
all coordinate arithmetic mod 29, coefficients low first
```

The hypothesis presumes the p7 author intended finite-field polynomial arithmetic, the p8 red word supplies whitening, and the black body begins on packet boundary zero. **None of these operations is stated in the manuscript.** The field was not reverse-engineered from a candidate English phrase. It has exactly one defined sign, polynomial direction, phase and zero convention. We did not tune output-dependent variants.

## Original and solved-native controls

The reproducible [Windows Node22 CommonJS test](../sims/lp2_p7p8_field_inverse_original_sft.cjs) reads `lp2-corpus.json`, asserts actual p8 red symbols/p9 carry/p7 coefficients, implements polynomial reduction and Fermat inversion exponent `29⁴−2`, tests 100 distinct field-element multiplicative inverses and the zero convention, then performs genuine decryption and exact original re-encryption. It also encrypts and recovers 92 rune symbols from the **actual solved-native p57** page; deliberately changing the transmitted seed rejects the control's original plaintext.

| Fixed output window | Original input symbols | Decoded GP29 IoC | Outcome |
|---|---:|---:|---|
| Aligned p8 body + five p9 carry runes | 248 | 0.03300901 | No coherent word sequence |
| First 300 black source runes | 300 | 0.03344482 | No sustained plaintext |
| **Untouched next 300 original runes** | 300 | 0.03493868 | No independent readable continuation |
| Remaining complete four-packets | 1,116 | 0.03458058 | Nonprose |
| Entire 1,716 decoded four-packet runes | 1,716 | 0.03433709 | Nonprose; input IoC 0.03443767 |

The last one of the 1,717 source runes is a one-symbol fringe, left untreated rather than inventing a padding law. **All 1,716** original processed symbols round-trip exactly. The decoding's first symbols are `B E IA X IA AE A X L IA OE Y C X U N P EO O M E Y` as individual GP29 transliterations, not English words; the rest of the output likewise remains near uniform. Known solved p57's own IoC is ~0.0627. Numerically these scores are descriptive, not a statistical impossibility theorem for unusual plaintext.

The native Windows 11/Node22 manual run **[45183854376](https://github.com/FlareZ123/liber-primus/actions/runs/45183854376)** passed the original-input and solved-p57 assertions. Successful reencryption alone cannot identify a key in a bijective cipher family: every value of the whitening seed would also round-trip its own decoded output. The deciphered result must instead make linguistic and independently sourced predictions, which this one does not.

## Issue decision and next research fork

The direct nonlinear **field-inverse** hypothesis is negative on unchanged original p8–p14. Earlier separate [p7/p8 companion + word reset gates](lp2-fourblock-source-selector-audit.md) and [four-rune two-round Feistel all-secret gate](lp2-gp29-fourblock-two-round-feistel-original-gate.md) were already negative in their declared domains. Crucially, direct inspection of p7–p9 shows **no authored choice among those fundamentally different bijections** and no source instruction providing block-end handling or a p9→p14 key clock. A human solver in 2014 could observe the fourfold coincidence but not uniquely infer a decryptor. Accordingly close #2390 as **missing source-selected operation**, preserving the fourfold arithmetic as a clue rather than multiplying arbitrary field-power, alternate sign, S-box or block-phase searches.

Reopen only for a genuinely independent source instruction fixing the four-symbol block mode, its input/output mapping, key provenance and handling of carried words, and yielding at least 150 original interpretable runes plus a withheld ≥200-rune prediction. The broader solution remains unknown.
