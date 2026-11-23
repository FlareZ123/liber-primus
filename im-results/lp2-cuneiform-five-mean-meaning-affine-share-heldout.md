# Five original numbered passages: GF29 mean and crib-locked affine-share inverse

**Agent 50 · 23 November 2026 · Director [#2243](https://github.com/FlareZ123/liber-primus/issues/2243). Classification: one new, tightly bounded original-cipher inverse family, negative on untouched continuation; no unknown plaintext or author-selected full decoder.**

## Human solve-path proposal and its weakest assumption

The original LP2 pp36–38 show five **red numerals 1–5** introducing five separate ciphertext units. Cicada's 2013 round demonstrably used Shamir secret sharing, and its 2016 signed message relates “words”, “meaning”, and “numbers”. The original p36 first word has a previously published, *local only*, 4-rune candidate `MEANING` when subtracted by the 2014/red-dot-derived `[1,3,3,1]`. Independently, p49–51's fifth numerical column yields the Bitcoin vanity string `1Meanpng...`; that calculation is post-distribution interpretation, **not** an authenticated instruction to average the passages. Thus an intentionally conservative hypothesis is: perhaps the **five visible numbers designate five GP29 shares of one common concealed message**, and the 4-rune `MEANING` clue fixes its beginning. A player could try a finite-field mean or linear combination without guessing an enormous phrase key.

This is an experiment, **not** a claim that the 4-rune hit is genuine plaintext, that all five sections encode one message, that the word lengths are mere padding, or that the vanity address was meant to select arithmetic mean. The compelling alternative is simply five distinct prose units encrypted independently. That alternative requires a different first opcode.

## Exact untouched source and a fully typed no-key mean

Use the canonical original `resources/liber-primus/lp2-corpus.json`. The original numbered streams, preserving their actual physical boundaries, are:

| Number | Original GP indices | Runic length |
| --- | --- | ---: |
| 1 | p36 `[99:238]` | 139 |
| 2 | p37 `[0:91]` | 91 |
| 3 | p37 `[91:189]` | 98 |
| 4 | p37 `[189:228]` + p38 `[0:57]` | 96 |
| 5 | p38 `[57:186]` | 129 |

These produce five complete original-start tapes with **91 shared positions** and independently printed-word counts **30/20/25/19/28**. The first four rune columns of the five streams are `[20,2,12,22]`, `[9,26,18,14]`, `[23,1,13,7]`, `[21,11,15,11]`, `[8,25,14,2]`.

The direct, **keyless, modulo-29 arithmetic mean** is `M[i]=6*(S1[i]+S2[i]+S3[i]+S4[i]+S5[i]) mod29` since `5*6=1 mod29`. On the actual 91 positions it yields GP29 IoC **0.034920634921** with no sustained recognizable text. Do not call a *rounded ordinary integer mean* a decryption: that many-to-one operation mechanically concentrates central values and yields a misleading high IoC **0.075702075702**, but outputs nonprose. The GP-field mean preserves source arithmetic.

## General fixed five-share operation, four-rune crib, 87-rune holdout

Allow any completely unknown **fixed five-share linear coefficients**, and then the larger family with an independent constant:

```
P[i] = b + a1*S1[i] + a2*S2[i] + a3*S3[i] + a4*S4[i] + a5*S5[i] (mod29).
```

The previous p36 source-selected local candidate says, **conditionally**, `P[0:4]=[19,28,9,21]` (the book's single-`ING` rune convention for `MEANING`). Algebraically solve, rather than optimize, the first four independent GP29 equations. Row-reduced augmented matrix for columns `a1,a2,a3,a4,a5,b | target`:

```
1 0 0 0 19 13 | 26
0 1 0 0 21 10 |  4
0 0 1 0 28 25 | 12
0 0 0 1  2 14 | 11
```

Its first four columns have rank four, leaving exactly one free coefficient `a5` and one free constant `b`. Therefore the crib selects **exactly 29 linear candidates** with `b=0`, or **841 affine candidates** with `b` arbitrary. **All candidates match the first four runes by construction; that is not evidence of a decryption.** The *unfitted* continuation comprises positions `4–90` (87 runes). The first 43 of these, positions `4–46`, are used to rank candidates by within-tape GP29 coincidence; the last **44 runes, positions `47–90`, are strictly held out** from ranking.

| Frozen model and ranked winner | Train 43-rune IoC | Never-ranked 44-rune IoC | Fixed weights |
| --- | ---: | ---: | --- |
| Best of 29 **homogeneous linear** | **0.052048726467** | **0.031712473573** | `[27,28,15,5,3]`, `b=0` |
| Best of 841 **affine** | **0.058693244740** | **0.031712473573** | `[23,14,2,19,11]`, `b=2` |
| Actual solved p57 GP text, positions 47–90 | not fitted | **0.066596194503** | independently known plaintext |

The best jointly balanced of all 841 original candidates by `min(trainIoC, heldoutIoC)` achieves only **0.045454545455** on its worse half; no candidate yields a coherent plaintext passage. The top fitted affine output starts, in *literal* GP29 rune transliteration, `MEANNGEABGXXANGTHBFUPEOPFNRDBBNNRFWPWIAOEPRNPIANOELIA...`, and is not readable English after the forced four-rune opening. Another candidate selected *after looking at the holdout* can reach a held-out IoC of **0.057082452431**, but its train score is only **0.035437430786** and it is not a prospective success. These two numbers illustrate why a cherry-picked half must not count as plaintext.

A source-native **91-rune reversible plant** uses four crib runes followed by the original solved p57 runes `[4:91]`, an independently chosen secret affine vector `[5,7,13,17,23]`, constant 11, four deterministic Vandermonde-coded shares and an exactly computed fifth. The unchanged 841-candidate enumerator contains that hidden key and recovers the exact **91/91 original known-control symbols**, including the full 44-rune withheld portion. Both the original and positive calculations are implemented in [one read-only, original-input Node22 reproducer](../sims/lp2_five_numbered_meaning_linear_share_crib_sft.cjs); the exact operations were separately evaluated on the connected canonical source in the JavaScript runtime. No CI execution or GitHub Actions success is claimed.


## Eight-rune printed-word lexical necessity: a stronger unfit original gate

Under this specific five-share **single reconstructed original-English message** hypothesis, one minimally falsifiable serialization choice is to preserve the actual word breaks of the *first original numbered unit*. Its first six printed-word GP29 lengths are **4 / 3 / 8 / 2 / 5 / 3**. Because all 841 candidates decode the initial four-rune \`MEANING\` **by construction**, the second three-rune word at output positions4–6 and third **eight-rune** word at positions7–14 are independent first-line predictions. Apply the already-existing (not newly selected) project's \`resources/control/english_wordfreq_textblob.txt\` **29,088-word GP29-normalized English reference** with exactly the historical \`ING\`, \`NG\`, \`IO\`, \`V→U\`, \`QU→CW\` spelling rules from the earlier full-word exhaustive gate. The vocabulary has **4,318 different eight-rune GP29 words** under this encoding, including \`DIRECTION\`.

| First-unit authentic word slot | Printed rune length | Of **841** fixed affine mixtures matching \`MEANING\`, dictionary-matching complete words |
| --- | ---: | ---: |
| 1 | 4 | 841 (forced \`MEANING\`) |
| 2 | 3 | **30** |
| 3 | 8 | **0** |
| 4 | 2 | **188** |
| 5 | 5 | **0** |
| 6 | 3 | **26** |

**No candidate even matches the third complete eight-rune native-English dictionary word**, much less both the second and third or an intact 91-rune utterance. All 841 vector+constant solutions were exhausted, with no phase or language ranking in this lexical test. The independent reference could miss an invented/archaic eight-rune word, and the first section's ciphertext hyphens might not be plaintext word breaks; thus this is **conditional** on those two visible-output conventions, not a mathematical exclusion of all intermediate streams.

To test power, a distinct planted original-sized **91-rune** target begins with GP-native dictionary words \`MEANING AND DIRECTION\` (physical lengths exactly **4, 3, 8**) and continues with solved p57 GP runes. Encode it into **five synthetic 91-symbol GF29 shares** using the same secret nonzero five-coefficient vector \`[5,7,13,17,23]\`, b11, and unaltered four-rune crib. The exact same 841-candidate decoder recovers the *entire 91/91* known text and all three complete planted words. This does not depend on any purported unknown-original plaintext. The linked single-file SFT asserts both original all-key lexical zero and the independent complete positive.

## Decision

This is a **conditional all-coefficients exclusion**: no position-aligned, single-clock, *fixed affine GP29 mixing of five complete numbered passages* that **starts with the independent four-rune `MEANING` candidate** produces a sustained originally readable GP-native continuation. It strictly extends the existing **fixed-x Shamir** original decision by granting all 29 homogeneous and all 841 affine candidate weights permitted by the four-rune crib; it does not retest its Lagrange coefficients. Under the additional explicit assumption that the first unit's original printed word breaks survive as output word breaks, the **841** affine possibilities also have **zero** complete recognized eight-rune third words in the fixed 4,318-form English register. The ordinary arithmetic mean is independently rejected as a direct GP29 plaintext reader.

It does not rule out five distinct plaintexts; different share alignments or word boundaries; nonlinear field operations; a concealed non-English/binary intermediate; or a local `MEANING` marker followed by a *different author-specified instruction*. Do **not** turn this negative into a licence for another factor/phase search. The missing genuine first opcode still requires an original image instruction, historical key selector, or a complete withheld plaintext prediction on a genuinely different route.
