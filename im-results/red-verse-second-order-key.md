# LP2 page 53 highlighted stanza: error-tolerant second-order key inversion

**Status (2026-11-10): bounded negative for a fixed, explicitly inverted model; no LP2 plaintext, key, or destination recovered.** Source-defined boundary, rather than any post-selected candidate interval, is the 51-rune red stanza in original `70.jpg`, physical LP2 page 53, page-local rune offsets [128,179). Its 12 complete words have lengths `5,4,4,11,2,3,2,6,5,5,2,2`. The 11-rune fourth word occupies red offsets [13,24). The corrected source is `resources/liber-primus/lp2-page53-red-span.json`. Earlier red-marker screens that omitted the red T rune and counted 50 red runes do **not** cover this exact input.

## Hypothesis and inverse

Suppose the marked passage is GP-encoded ordinary English encrypted by an additive mod-29 key sequence obeying the same second-order affine recurrence across the passage,

```text
K[t+2] = a*K[t+1] + b*K[t] + c  (mod 29), b != 0.
cipher[t] = (plain[t] + K[t]) mod 29.
```

The nonzero `b` makes the recurrence reversible in both directions. The 11-rune plaintext anchor is selected from **1,611** unique eleven-GP-rune encodings in the checked-in word-frequency lexicon. Each candidate anchor uniquely implies an 11-rune keystream. For each of its eight overlapping four-rune windows, the inversion solves the recurrence parameters from the four observed values after changing zero or one window value, requiring that the resulting full recurrence agree with **at least nine of the eleven** implied key values. Thus this enumerator covers **every** candidate recurrence in this family with at most two arbitrary altered anchor rune positions: among 11 positions containing at most two errors, at least one four-position window has at most one. Each reconstructed candidate key is then propagated across the other eleven words and scored against the checked-in dictionary, excluding the forced anchor word from scoring.

The bounded orientation family includes printed order, reverse words, full rune reversal, and individual-word mirroring; each uses raw or atbash-carrier `28-C`, and tests continuation with and without literal-F clock skipping. These choices, dictionary restriction, constant recurrence parameters, and two-error bound are explicit *hypotheses*. In particular, the test does **not** cover other intermediate alphabets, variable state, cipher-dependent key schedules, free transpositions, other word splitting, or more than two anchor changes.

## Direct result and planted control

The same manually triggered workflow completes both the real scan and a **67-of-67 exact planted-control regression**. The control encrypts an 11-rune dictionary word under `(a,b,c)=(7,4,3)`, initial key `K[0]=9,K[1]=11`, tests zero alteration, every one of 11 altered positions, and all 55 unordered two-position alterations, and checks the exact recovered 51-rune keystream under every corruption pattern.

| Input family | Number of dictionary anchors yielding recurrence candidates (errors 0/1/2) | Independent non-anchor long words recovered |
| --- | ---: | ---: |
| Printed order, either carrier | 0 / 0 / 0 | 0 |
| Reverse-word order, either carrier | 0 / 0 / 0 | 0 |
| Full reversal, raw carrier | 0 / 0 / 0 | 0 |
| Full reversal, atbash carrier | 0 / 0 / 1 | 0 |
| Mirror each word, raw carrier | 0 / 0 / 0 | 0 |
| Mirror each word, atbash carrier | 0 / 0 / 1 | 0 |

The two nonprinted candidates are the same eleven-GP-rune dictionary anchor **`bartenstein`**, with two mismatches and recurrence `a=0,b=11,c=11`. Their recovered held-out words are visibly unreadable. No printed-order key survives the **nine-of-eleven** anchor agreement condition.

The single survivor in a full-reversal and another in an individual-word mirror are post-selected across the eight carrier/orientation cases, and neither reproduces sustained readable English; they are **false-positive hypotheses, not decrypted plaintext**. The exact parameter family is therefore disfavoured for this stanza under the declared English-anchor/two-error assumptions. The result is stronger than an arbitrary language-score failure because the anchor inversion explicitly enumerates the entire bounded recurrence family.

## Reproduction and limitations

- Inversion and entire 51-rune output scoring: [`sims/red_verse_second_order_key.cjs`](../sims/red_verse_second_order_key.cjs).
- Independent planted exact-key test: [`sims/test_red_verse_second_order_key.cjs`](../sims/test_red_verse_second_order_key.cjs).
- On-demand (manual-only) CI: [successful 67/67 planted + original run 42760652908](https://github.com/FlareZ123/liber-primus/actions/runs/42760652908).
- Earlier original-only CI: [run 42760201348](https://github.com/FlareZ123/liber-primus/actions/runs/42760201348).
- Source correction context: [`im-results/lp2-page53-red-verse.md`](lp2-page53-red-verse.md).

**Next direction:** seek a source-derived state/key rule that predicts ciphertext beyond its own fitted red anchor, rather than increasing a speculative recurrence degree until chance dictionary matches proliferate. The red source boundary remains useful independent cryptanalytic evidence even though this candidate family failed.
