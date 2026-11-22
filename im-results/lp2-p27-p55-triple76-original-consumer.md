# The copied p27/p55 footer yields exactly three 76-rune candidate shares

**14 November 2026, Agent50. Classification: a source-exact new layout observation followed by a finite negative original-cipher test.** There is no recovered unknown plaintext, creator key, author-selected inverse, or destination. [Windows Node22 SFT passed 43630599417](https://github.com/FlareZ123/liber-primus/actions/runs/43630599417).

## Causal starting clue and bounded plaintext hypothesis

The entire original p27 contains **234 GP29 runes**. The final original p55 text contains **76 GP29 runes**. The repeated final two p55 words `D-J-U B-E-I` occupy p55 offsets70–75 and exactly repeat p27 offsets28–33, both source-exact and previously established. Removing the **specific six copied runes from p27** yields **234−6=228=3×76** runes. This means the exact two pages linked by the *independently visible copied phrase* can form three complete p55-length candidate tapes without guessing padding or truncation. The six-rune marker's placement, page-shape relation and fixed remaining indices are observable. No Cicada instruction confirms that the repeated phrase should be removed, or that the remaining runes represent shares/key material. A complete source census over **every ordered pair of distinct rune-bearing physical LP2 unknown pages** finds **exactly one** pair satisfying the integer length relation `L=3S+6`: **p27(234) and p55(76)**. That same unique pair also has the p55 six-rune suffix copied exactly inside the longer page at offset28. This is an exact corpus-wide coincidence, not a measured discovery-wide chance probability; in particular the relation was noticed *after* finding the repeated phrase, so no independent multiple-comparisons significance follows.

The same 2013 historical Cicada rounds used Shamir secret sharing, giving one recognized low-complexity consumer to test.

Freeze two source-order arrangements of the exact 228 remaining p27 symbols:

1. Three consecutive 76-rune tapes, at stripped positions 0–75,76–151,152–227.
2. Three successive GP29 triples, yielding 76 lane-aligned elements per tape.

As a **distinct source-led rival**, the solved p57 PARABLE expressly says to **shed our own circumferences**. Since p27 also has **234=3×78** runes, one can subdivide the entire unchanged p27 into three 78-rune rows and discard the first and last rune of **each row**, yielding a second natural **three×76** register without deleting the repeated six-rune anchor. An alternative read treats the 234 original symbols as **78 printed triples**, and drops the first and last triple, again producing three length76 lanes. Neither 78-wide layout is itself printed or authenticated: the p57 instruction selects *trimming*, whereas the choice of three rows remains an analyst hypothesis. These two independent boundary-trim arrangements were added to the frozen positive-control SFT and tested without new keys or offsets. They yield the same negative direct Shamir and additive results: **0–4 exact p55 matches** per fixed readout and no recognizable complete plaintext under either sign (highest 76-rune IoC **0.04280701754**).

Treat each position's three field elements as either a direct GF29 sum `a+b+c`, a degree-two Shamir secret at **x=0**, `3a−3b+c`, or its next share at **x=4**, `a−3b+3c`. Abscissas x=1,2,3 are fixed before ciphertext inspection. This gives twelve source-defined 76-element readouts across the two original phrase-excision layouts and the two separate p57 circumference-trim layouts. Test both direct additive signs against all **76 unmodified p55 ciphertext symbols**, preserving their exact order and requiring full re-encryption. No phase, start offset, alphabet, dictionary word, period or key is fitted.

## Exact original obstruction

On the phrase-excision layouts, Shamir interpolation at x0 and extrapolation at x4 each produce only **3/76** direct p55 positional matches; the two triple-sums produce **4/76**. On the circumference-trim layouts, the same exact consumer family produces **0–4/76** matches. Random-symbol agreement would be about 2.6/76 on average. A hypothetical identity `p55 = f(0)`, `p55=f(4)`, or `p55=a+b+c` therefore fails at least 72 positions for each of the twelve source-derived tapes. Negated target versions match only 2–5 positions.

If instead the three-tape readout is a 76-position additive **decryption key**, all 24 original full-p55 inverses (four arrangements × three operations × two signs) remain nonlinguistic, with decoded GP29 IoCs **0.02947–0.04281**, and no recognizable opening under the source's GP runes. A genuine planted 76-rune native GP passage from the separately solved p57, hidden under a nontrivial 76-rune Shamir-secret key generated from genuine x1,x2,x3 polynomial shares, is recovered **76/76** exactly and forward-encrypts **76/76**, verifying the inverse. These observations do not mathematically preclude unrelated natural sentences or an additional layer; they close the direct source-aligned version.

## Historical three-share XOR rival

Cicada's actual 2014 challenge combined three external byte shares using **bitwise XOR**. Thus a period-authentic rival uses the three p27-derived **GP29 indices** as literal five-bit inputs, computes `K_i=a_i XOR b_i XOR c_i`, and tests (a) `K_i=C55_i` or (b) `P_i=C55_i XOR K_i`. Both are unkeyed and exactly reversible in five bits. A decoded original LP2 rune can only be an integer **0–28**; any decoded value 29, 30, or 31 is a hard incompatible symbol under this exact GP29 plaintext model.

| Fixed original three-share layout | Literal XOR matches / 76 | XOR key symbols outside GP29 | Decoded plaintext symbols outside GP29 |
| --- | ---: | ---: | ---: |
| Phrase excision, three consecutive tapes | 0 | 4 | **10** |
| Phrase excision, interleaved tapes | 3 | 3 | **6** |
| Three 78-rune rows, drop row endpoints | 2 | 9 | **6** |
| Seventy-eight triples, drop outer triples | 4 | 3 | **8** |

Every original layout therefore fails **strict source-register feasibility**, with 6–10 non-GP29 decoded values. A separate positive encodes and completely recovers **all 76 authentic solved-p57 GP29 runes** under three genuine nonzero GP29-valued XOR shares whose output stays inside the same source alphabet. The exact inverse and forward recovery pass. This exclusion is specific to a direct 2014-style XOR on original rune indices. Packed bytes, variable length or separate 5-bit escape symbols would require an author-selected additional transport, absent here.

**Decision:** both exact **p27 six-rune excision** and independently prompted **p57-style three-row circumference trim** yield three complete p55-length arrays, supplying two clue-constrained ways to explore the original p27/p55 link. The direct Shamir fourth-share/checksum interpretation is definitively contradicted by source positions, and the GF29 sum/Shamir additive-key interpretations do not recover English-like original plaintext. Do not rescue the branch through new unknown interleavers, free abscissas, rotations or added keys without independent original instructions. It remains possible that the duplicated source phrase is a navigation marker; this test does not adjudicate that.

**Reproduction:** [read-only standalone CommonJS SFT](../sims/lp2_p27_p55_threeby76_original_sft.cjs), [original 58-page GP29 source corpus](../resources/liber-primus/lp2-corpus.json), [complete Windows CI run43630599417](https://github.com/FlareZ123/liber-primus/actions/runs/43630599417).
