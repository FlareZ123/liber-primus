# P6 exceptional blocks: the adjacent black-seven operand does not serialize their complete keys

**Agent38, 28 November 2026; Director #3406. Classification: finite original-cipher negative, not a solved unknown page.** The source-selected exceptional p36, p41 and p42 receivers and their page-key checksums remain valid conditional structural evidence. The natural full-seven-vector affine/truncation consumer tested here fails to recover any complete authenticated word. This result does not rule out a different source-specified nonlinear/stateful opcode.

## Source-native route and exact input

The original physical p6 has the uniquely four-word red title with widths `[4,1,4,2]`, a large Fehu (GP0 `F=0`) and the **immediately following complete seven-rune black word** at p6 offset82, `R=[6,9,28,25,6,21,23]`. The already fixed outside-in transform gives `H(R)=[12,0,17,1,22,5,25]`; the alternative adjacent-pair `Hadj` is mechanically defined in the reproducer. This is an independently source-selected operand, not a word found by searching for target-key agreement.

The p6 `[q,1,q,K]` schedule and separate target-blind index-diagonal marker rules select the following **original** objects. All indices are within physical pages; the checked marker rune is removed before the possible key inverse.

| Page | Original full object | Marker removed | Prepared ciphertext | Pre-existing key-sum target |
| --- | --- | --- | --- | --- |
| p36 start169 | `[2,22,4,1,20]` | center `q=4` | `[2,22,1,20]` | 10 |
| p41 start178 | `[27,12,5,0,17,13,19]` | center `F=0` | `[27,12,5,17,13,19]` | 5 |
| p42 start211 | `[10,0,14,1,3,26,8,2]` | rune1 `F=0`, addressed by p42 word43 `H([16,0,14])=[K,1,F]` | `[10,14,1,3,26,8,2]` | 18 |

These objects and checksum targets were published before this experiment in [the q/F ordinal selector](lp2-p6-schedule-qF-numbered-receiver-grammar.md) and [joint p6 address/key-sum grid](lp2-p6-red13-joint-address-keysum-matched-null.md). The source seven-rune word has exactly the p42 prepared arity; p36 and p41 require a four- or six-position clipping rule, motivating a bounded rather than a single retrospectively chosen projection. The seven-vector key hypothesis is **not** already authorized by the source.

## Pre-target complete key family, frozen before opening the signed words

Use one common p6 black-seven base, three pre-existing simple presentations (direct / canonical outside-in H / adjacent-pair H), forward/reverse presentation, global sign `±1`, and four explicit contiguous clipping conventions (prefix, suffix, centered-left, centered-right). This is `3 × 2 × 2 × 4 = 48` labeled and **48 distinct complete key triples** on the original three receivers. All are computed without authenticated GOOD/VERIFY/OPENPGP rune values, language scoring or fitted coordinate keys.

For a prepared receiver of length `n∈{4,6,7}`, let `x` be the clipped signed vector, and let `σ` be its independent page-key sum. Apply the **unique equal-coordinate checksum projection**

```text
d = (σ - Σx) / n mod29
key_j = x_j + d mod29
raw_j = preparedCipher_j - key_j mod29
```

Here `n` is always invertible mod29; key sums and forward reencryption hold by construction. A checksum-conforming decoder is not thereby a historically authentic decoder.

The source-only generator was committed as [`sims/lp2_p6_exceptional_black7_projection_sft.cjs`](../sims/lp2_p6_exceptional_black7_projection_sft.cjs) in `c2442c2856e88e630d9b42217699de6ba6d43a58`. All 48 complete **raw original-input outputs** were separately committed before target grading as [`lp2-p6-exceptional-black7-pretarget-output.json`](lp2-p6-exceptional-black7-pretarget-output.json) in `f57aa4c2e856fa7991a87675fdfbba2b384309ad`. The natural forward/H/positive/prefix choice emits:

| Page | Key | Raw inverse |
| --- | --- | --- |
| p36 | `[7,24,12,25]` | `[24,27,18,24]` |
| p41 | `[13,1,18,2,23,6]` | `[14,11,16,15,19,13]` |
| p42 | `[7,24,12,25,17,0,20]` | `[3,19,18,7,9,8,11]` |

## Post-commit grade and strengthened algebraic boundary

The [separate grader](../sims/lp2_p6_exceptional_black7_projection_grade_sft.cjs) reads the authenticated 2016 signed plaintext only **after** the raw inverse output commit. It canonicalizes `V→U` in the 29-rune alphabet and compares the fixed words at signed-source indices36, 41 and42 with the frozen outputs. The expected GP0 arrays are `[6,3,3,23]`, `[1,18,4,10,0,26]`, `[3,13,18,9,13,6,13]`.

**Result:** zero of 48 decoders recovers even one complete source word; best positional agreement is **3/17** across the combined three prepared receivers. The rune-hit histogram is `{0:19, 1:20, 2:5, 3:4}`.

A broader **post-target** exact finite exclusion grants **every** scale `a∈GF(29)` instead of just `±1` and allows an **independent scale on each page**. For any p6 presentation/window `x`, the affine key has form `K_j=a x_j+b`; the frozen checksum fixes `b=(σ-aΣx)/n` uniquely. Exhausting `3 × 2 × 4 × 29 = 696` labeled affine candidates **on each receiver independently** still gives:

| Receiver | Full fitted-key hits / 696 | Maximum matching key coordinates |
| --- | ---: | ---: |
| p36, n4 | 0 | 2/4 |
| p41, n6 | 0 | 3/6 |
| p42, n7 | 0 | 2/7 |

This stronger fit-space result is **not** a new blind prediction. It shows that even supplying arbitrary per-page secret affine scales cannot save these clipped p6 seven-vector presentations. It does not exclude arbitrary per-coordinate permutations, nonlinear transforms, independent source operands, or missing-state side information.

## Decision and reproduction

**Retire the exceptional-block direct/H/adjacent-H clipped-seven vector with uniform checksum correction and its arbitrary-scalar affine extension.** It explains neither a genuine source-selected key nor any authenticated source word. The p6 4/5/4 visual grid remains a plausible receiver-and-checksum mechanism, not a proven ordered-rune cipher. Future work should demand a separately visible, complete coordinate opcode rather than further scales, clip phases or target-conditioned relabelings on this operand.

Run `node sims/lp2_p6_exceptional_black7_projection_sft.cjs` to regenerate the pre-target JSON (one compact JSON line). Run `node sims/lp2_p6_exceptional_black7_projection_grade_sft.cjs` against the committed source transcript to reproduce the target comparison, original-offset checks, full-space affine enumeration and exact invariants. The grader normalizes Windows CRLF in the signed source. No CI workflow was added.
