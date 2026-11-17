# Terminal black299: source-mode-separated word-direction prime/F test

**Agent43, 17 November 2026.** This is a required original-source refinement of the [whole-word reversal gate](lp2-word-reverse-prime-ftransparent-original-gate.md) and the [bidirectional prime pointer gate](lp2-bidirectional-prime-F-singleton-original-gate.md). Both earlier full-terminal tests applied one common mode across the p54 **red nine-rune heading** and all subsequent printed text. That first red one-rune title was responsible for many conditional English-grammar exclusions. This report removes that assumption and checks the **299 original black-text runes only**. No unknown plaintext or new key is recovered.

**Exact runnable [Windows Node22 single-file test](../sims/lp2_terminal299_worddirection_phiF_sft.cjs)**. GitHub Actions manual source runner: [agent43-word-reverse-prime-original-manual.yml](../.github/workflows/agent43-word-reverse-prime-original-manual.yml).

## Source-selected receiver and fixed tests

Original p54 contributes 232 runes, original p55 76; p54 local rune offsets 0–8 form two red heading words of lengths **1 and 8**, then the black body begins precisely at **p54 rune offset 9**, the start of a genuine printed word. Remaining p54 body plus p55 is exactly **299 runes, 64 complete printed words**, including one black printed singleton at **black-local offset 113**. The original transcription and 12,956-rune corpus agree exactly; cross-page words remain joined. No new word boundaries, ciphertext changes or display-extracted glyph guesses enter.

Using the authenticated p56 **phi(prime) modulo29 key stream and plaintext-F transparent nonconsumption**, examine two historically intelligible senses of the signed 2016 numbers/direction clue. Mode R reverses complete original ciphertext words on a fixed parity/prime rule, then reads a normal forward key stream. Mode P preserves ciphertext order and lets each printed word move the prime-key pointer +1 or −1 per consumed non-F rune according to the same fixed rule. For each, test no-redirect baseline plus both orientations of source word length parity, prior ciphertext word GP-prime-sum parity, prior sum primality, and black-body word ordinal parity; the preceding-word initial condition is source-neutral. **18 distinct mode/rule choices × 5,000 prime starts = 90,000 original hypotheses**, each with **every legal historical F-bypass path**. Neither mode includes a freely fitted unknown keyword or table; both use no additional movement at word breaks, and pointer mode does not wrap.

Apply a conditional but independent *source-printed native-GP English singleton* constraint: the one black single-rune word at local113 must decrypt as A, I or O (GP29 {24,10,3}). This is a necessary condition for retaining unchanged English word cuts and orthodox GP spelling; it is not authenticated plaintext.

## Exact search and original-language outcomes

| Original black299 receiver | Mechanical complete paths (all F histories) | Paths meeting the independent black singleton |
| --- | ---: | ---: |
| Reverse source words, then forward prime/F | **56** | **5** |
| Key pointer moves +/− per source word, original ciphertext order | **27** | **3** |
| **Total across 90,000 settings** | **83** | **8** |

The five word-reversal survivors are: reverse on odd/even *current source word length* polarity true, prime start **4008**; previous ciphertext GP-prime sum even polarity false, prime start **2295**; previous sum prime polarity true, start **2296**; alternate printed-word ordinal polarity true, starts **3954 and 3955**. The three pointer-direction survivors are: previous sum even with negative orientation, starts **3541,3542**; previous sum prime with positive orientation, start **4253**.

Every one of these eight legal singleton-compatible candidates was exactly inverted using a fixed native-GP29 English bigram Viterbi model trained **only on 718 solved LP1 words (2,995 GP runes)**, α=0.2; the inferred plaintext was then **forward reencrypted to every original ciphertext rune** under its actual word direction and F-consumption choices. All eight correctly reencrypt. **None is coherent prose.** Best mean log score **−4.464291/rune** (word reversal, previous sum even, prime start 2295), IoC **0.0359139**, 0/64 full words exactly matching the source-native LP1 training vocabulary. Best pointer candidate scores −4.464925, IoC 0.0352630, with just 1/64 training words. All eight best-path IoCs lie **0.03365–0.03628**, and the best path scores lie **−4.4643 to −4.6315**, against genuine original solved p56 −2.8537 and clear p57 −2.7669. Illustrative false opening under the highest-ranked path: AEOAEIAOWXE TPY IABOIPR YW IAEAEON UNOE IEO AEBA SDSTU TXIAWSDH, which has no continuous native sentence.

Original solved p56 85-rune ciphertext still reproduces **exactly** under the implementation's real prime-totient/F-transparent encoder. A successful mechanical forward/reverse roundtrip is an implementation integrity check, **not** authentication of a real LP2 key. The eight survivors have one source grammar site only, so even their grammar success is weak evidence. No genuinely plaintext-looking candidate emerged.

## Consequence for the full-terminal result

The red-heading A/I/O exclusion in both earlier full p54–55 reports is strictly **same-mode conditional**. Removing the red title leaves eight legal native-singleton candidates, none linguistically convincing. The full black299 cannot be claimed mathematically impossible merely because the p54 heading was treated as encrypted in the same register. It remains unsupported as a direct historical prime/F inversion.

Retire the fixed tested direct p56-word-direction transfers as promising whole-text decoders; seek an independent authored key/operation or a previously unknown language-bearing black-text output. This is orthogonal to the still-running original historical 581-key collision-skip pointer campaign under [Issue #1329](https://github.com/FlareZ123/liber-primus/issues/1329).
