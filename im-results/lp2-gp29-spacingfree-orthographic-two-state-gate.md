# Spacing-free native-GP orthography under a two-state predecessor-class inverse

**Decision (28 November 2026, Agent6, Director issue [#3288](https://github.com/FlareZ123/liber-primus/issues/3288)):** Exact, calibration-limited **negative** for using this hard local grammar as a stand-alone key/plaintext discriminator. It is a valid finite-state *candidate constraint* conditional on the source-native spelling model, but the original receiver leaves 30 nonprose complete keys, five of six independent English controls retain their true key yet leave 82–153 complete alternatives, and one independent true English control is wrongly rejected. No authentic LP2 key, plaintext, operator or destination is established.

## Historical spelling and pre-declared receiver

- [Canonical LP2 source](../resources/liber-primus/lp2-corpus.json) fixes the 29 rune indices, independent of the proposed cipher.
- [Source-native spelling calibration](../sims/lp2_native_gp_source_orthography_sft.cjs) reconstructs **181/181** original LP1 physical p10–13 words and the independent **95/95** p57 original runes, with ING represented by `ᛝ` / index21, IO sometimes by `ᛡ` / index27, and the fixed original normalization QU→CW, V→U, K/Q→C, Z→S.
- Greedy normalization gives exactly **16 adjacent rune-pair label combinations** which cannot be part of *one* greedily encoded word: O+EO, O+E, O+EA, N+G, I+O, I+OE, I+A, I+AE, T+H, E+O, E+OE, E+A, E+AE, A+EO, A+E, A+EA. **They are not prohibited in a continuous unknown-space stream:** the finite-state machine can insert a boundary there.
- Vowel-like symbols are rune indices `[1,3,10,12,18,21,22,24,25,26,27,28]`. Including index21 (NG/ING) as vowel is deliberately permissive, not a claim about pronunciation. A candidate word is 1–24 runes, has at least one vowel (except singleton I/A), maximum consonant-like run6 and vowel-like run8, and no one of the 16 pairs internally. A shortest-path dynamic program over every possible hidden word boundary decides exact admissibility without trusting original printed groups, using a fixed vocabulary-free grammar and no English word scores. The run limits were chosen to admit the solved control register and not prohibit most long independent prose, but they are **not universal author rules**.
- One compact reversible, complete-stream two-state cipher is tested, with only `a,b∈{0,…,28}`: `C[i] = (P[i]+(V(P[i−1]) ? b : a)) mod29`, `V(P[−1])=0`. Its inverse is deterministic: for given `a,b`, recover `P[i]` from `C[i]` and the previously recovered plaintext class. Each result has exact forward replay, which alone cannot distinguish correct from incorrect keys. The predecessor vowel/consonant state and a two-offset schedule are a **research hypothesis**; no original LP2 image, rubric or signed statement chooses them.

The source index and hard constraint are different from the historical p56 *prime* arithmetic with a literal F hold, the earlier q8 word-clock lexical searches, and conventional plaintext-feedback affine recurrence. There are **no plaintext-F holds** and **no printed-word phases** in this tested sender. Scope is this precise two-state construction, not every finite-state cipher.

## Exact executed calibrations and complete original inverse

The committed [Node20+/CommonJS SFT](../sims/lp2_gp29_spacingfree_orthographic_fsa_two_state_sft.cjs) was actually executed in connected V8 on the exact checked-in sources and authentic donor text (no external network). Source-native LP1 p10–13: 181/181 exact printed words, 755 runes, admissible with minimum 35 hypothetical words. Independently solved LP2 p57: 95/95 source runes exact. All nine source-native solved sections in the pinned GP control file are admissible by the vocabulary-free grammar. These are orthographic/source checks, not cipher-recovery controls.

For the six independent 3,008-rune English donor texts (Shakespeare, Gibran, Emerson), use the true sender with the fixed key pair printed below. The fit is the first 1,400 runes; the full interval is tested without changing key or boundary grammar. The table lists the count of *all* 841 key pairs admitted by exact dynamic programming.

| Donor, arbitrary key | Fit keys / 841 | Full keys / 841 | True key survives whole? |
| --- | ---: | ---: | --- |
| Shakespeare A, (5,17) | 221 | 82 | Yes |
| Gibran A, (11,2) | 244 | 126 | Yes |
| Emerson A, (20,24) | 292 | 152 | Yes |
| Shakespeare B, (1,14) | 274 | 152 | **No** (the unmodified native source is not admitted; escape needed) |
| Gibran B, (22,7) | 286 | 153 | Yes |
| Emerson B, (13,9) | 200 | 96 | Yes |

Matched wrong-family controls encrypted under the separate alternating positional shifts +7/+13 nevertheless leave **121, 98, 111** whole-message false keys under the proposed receiver, respectively. Thus full-stream admissibility under this grammar neither uniquely recovers keys on controls nor independently authenticates a particular family. Requiring the literal source-native unescaped grammar causes a **1/6** false-negative rate in this six-window test. This does not establish a population error rate. Adding a freely placed escape would increase ambiguity; a *source-typed* escape would need an independently defined channel.

The original test uses **every original rune of physical pages p40–p53 inclusive: 3,008 runes**. Frozen key-space and DP grammar, no printed spaces, fit first 1,400 runes and inspect complete 3,008 runes:

- Fit prefix: **149 / 841** key pairs admit a segmentation.
- Whole source: **30 / 841** key pairs admit a segmentation. They have minimum 155–166 words under 24-rune maximum; this shortest segmentation is not a recovered word order.
- All **30 exact complete original rune outputs and transliterations**, each with inverse inputs/keys, plus a frozen adjacent p54–p55 continuation, are preserved in [machine output](lp2-gp29-spacingfree-orthographic-fsa-two-state-output.json), with no winning text edited or selected. All 30 are nonprose. For the 308-rune next physical chapter p54–p55, **17/30** keys pass the same grammar under continuation with the previous recovered class and **17/30** under an independent class reset; this neither selects a key nor yields coherent text.
- Original admissible fraction **3.57%** is *lower* than all six donors' full-key fractions (**9.75%–18.19%**), even though those donors include one true-gate failure. This is a calibrated diagnostic of mismatch, not a significance proof or exclusion of all two-state senders. No result depends on an adjusted word-length segmentation.

## Causal decision

**Reject** treating these vowel/consonant-run and greedy-token restrictions as a reliable *exact* plaintext/key acceptance criterion. The strongest competing explanation—ordinary long English with rare long consonant-like runs or a different GP register—produces counterexamples, while hundreds of wrong keys pass realistic matched native controls. The original 30 are exhaustively identified **only under this fixed cipher+hard-grammar pairing**; they must not be promoted to source-derived keys. The model has no historical operation selector and does not decrypt the book.

A productive successor requires an **independently observed stronger hard orthographic/state cue**, e.g. an authenticated worked example specifying word-end or escape syntax, before conditioning a new cipher inverse. Do not re-run a loose word-vowel scoring or add an unobserved exception tuned to the original. Retain the reproducible DP and authentic spelling counterexample for future conditional tests.

### Reproduction

```sh
node sims/lp2_gp29_spacingfree_orthographic_fsa_two_state_sft.cjs
node sims/lp2_gp29_spacingfree_orthographic_fsa_two_state_sft.cjs --all-readouts
```

Inputs are pinned under `resources/liber-primus/`, `resources/transcriptions/`, `resources/external/`, and `resources/control/`. The file uses only Node built-ins and performs no writes; the JSON output file separately preserves full original inverses and the frozen continuation. Original physical page coordinates, no title/rubric exclusion, and fixed GP29 alphabet are explicit.
