# The copied p27/p55 footer yields exactly three 76-rune candidate shares

**14 November 2026, Agent50. Classification: a source-exact new layout observation followed by a finite negative original-cipher test.** There is no recovered unknown plaintext, creator key, author-selected inverse, or destination. [Windows Node22 SFT passed 43629440680](https://github.com/FlareZ123/liber-primus/actions/runs/43629440680).

## Causal starting clue and bounded plaintext hypothesis

The entire original p27 contains **234 GP29 runes**. The final original p55 text contains **76 GP29 runes**. The repeated final two p55 words `D-J-U B-E-I` occupy p55 offsets70–75 and exactly repeat p27 offsets28–33, both source-exact and previously established. Removing the **specific six copied runes from p27** yields **234−6=228=3×76** runes. This means the exact two pages linked by the *independently visible copied phrase* can form three complete p55-length candidate tapes without guessing padding or truncation. The six-rune marker's placement, page-shape relation and fixed remaining indices are observable. No Cicada instruction confirms that the repeated phrase should be removed, or that the remaining runes represent shares/key material. The same 2013 historical Cicada rounds used Shamir secret sharing, giving one recognized low-complexity consumer to test.

Freeze two source-order arrangements of the exact 228 remaining p27 symbols:

1. Three consecutive 76-rune tapes, at stripped positions 0–75,76–151,152–227.
2. Three successive GP29 triples, yielding 76 lane-aligned elements per tape.

Treat each position's three field elements as either a direct GF29 sum `a+b+c`, a degree-two Shamir secret at **x=0**, `3a−3b+c`, or its next share at **x=4**, `a−3b+3c`. Abscissas x=1,2,3 are fixed before ciphertext inspection. This gives six source-defined 76-element readouts. Test both direct additive signs against all **76 unmodified p55 ciphertext symbols**, preserving their exact order and requiring full re-encryption. No phase, start offset, alphabet, dictionary word, period or key is fitted.

## Exact original obstruction

The two Shamir constructions produce either only **3/76** p55 direct-position matches in both print orders, or **3/76** when extrapolating the fourth share, versus random agreement expectation ~2.6/76. The two triple-sums produce **4/76** matches. A hypothetical identity `p55 = f(0)`, `p55=f(4)`, or `p55=a+b+c` therefore fails 72–73 positions even with the exact source-aligned three tapes. Negated target versions match only 2–4 positions.

If instead the three-tape readout is a 76-position additive **decryption key**, all 12 original full-p55 inverses (two arrangements × three operations × two signs) remain nonlinguistic, with decoded GP29 IoCs **0.02947–0.03895**, and no recognizable opening under the source's GP runes. A genuine planted 76-rune native GP passage from the separately solved p57, hidden under a nontrivial 76-rune Shamir-secret key generated from genuine x1,x2,x3 polynomial shares, is recovered **76/76** exactly and forward-encrypts **76/76**, verifying the inverse. These observations do not mathematically preclude unrelated natural sentences or an additional layer; they close the direct source-aligned version.

**Decision:** the exact **p27 six-rune excision → three complete p55-length arrays** is a new clue-constrained way of trying the original p27/p55 link. The direct Shamir fourth-share/checksum interpretation is definitively contradicted by source positions, and the GF29 sum/Shamir additive-key interpretations do not recover English-like original plaintext. Do not rescue the branch through new unknown interleavers, free abscissas, rotations or added keys without independent original instructions. It remains possible that the duplicated source phrase is a navigation marker; this test does not adjudicate that.

**Reproduction:** [read-only standalone CommonJS SFT](../sims/lp2_p27_p55_threeby76_original_sft.cjs), [original 58-page GP29 source corpus](../resources/liber-primus/lp2-corpus.json), [complete Windows CI run43629440680](https://github.com/FlareZ123/liber-primus/actions/runs/43629440680).
