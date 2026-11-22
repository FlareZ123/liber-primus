# GP30 SPACE-changing inverse: DIVINITY and an all-secret concentration exclusion

**Agent 10, 22 November 2026. Status: original-input negative plus exact conditional theorem; no unknown plaintext or recovered key.** This tests a distinct 30-symbol boundary-moving cipher family, separate from the previous whole-word BASE29→BASE30 integer conversion and secret short-history rune-only alphabets. The source-authentic clue motivates a particular candidate; the stronger second result holds for every independently secret GP30 alphabet in the stated clock classes.

## Original source, frozen operation, and plaintext gate

The genuine solved LP1 Vigenère section uses **DIVINITY** as its key. The original clear GP p57 PARABLE says **FIND THE DIVINITY WITHIN**, and the original GP chart shows 29 runes plus a blank slot. These inputs make a GP29-plus-SPACE test human-conceivable; **they do not constitute a Cicada-authored GP30 encryption instruction**.

Use the unchanged LP2 original-source 12,956 numeric GP29 runes and each of the 2,902 visually printed hyphen/period events as digit 29 (SPACE), preserving the original exact punctuation mark and all line/page/section layout as a sidecar. That yields **15,858** full-channel tokens. In particular, all 32 true cross-page carried words remain intact in the original source and the rune values agree exactly with the canonical source page arrays. For the single frozen historic-key proposal,

\[
P_i=(C_i-K_{i\bmod8})\bmod 30,\qquad
K=\operatorname{GP}(\mathrm{DIVINITY})=(23,10,1,10,9,10,16,26).
\]

The clock advances through all 15,858 tokens from first LP2 output, with no page reset or fitted offset. The full inverse is exactly \(C_i=(P_i+K_{i\bmod8})\bmod30\); source punctuation typography remains bit-for-bit reconstructible. A plaintext-dependent F transparent cipher rule is outside this fixed bijection. The historically attested F-bypass clock is investigated independently below, with every unknown bypass decision allowed.

| Original / solved span | Source tokens | Decoded SPACE tokens | SPACE fraction | GP rune IoC |
| --- | ---: | ---: | ---: | ---: |
| Original unknown p0–55 | 15,858 | 444 | 2.800% | 0.039362 |
| Original development p16–21 | 1,985 (1,613 runes) | 59 | 2.972% | 0.039585 |
| Independent p40–53 holdout | 3,677 (3,008 runes) | 106 | 2.883% | 0.038305 |
| Genuine **clear GP** p57 source benchmark | 115 (95 runes) | 20 | 17.391% | 0.062710 |

The p57 benchmark includes its terminal period as a separator event, exactly matching the tested tokenization; ordinary word-only spacing is 19/114. The frozen DIVINITY GP30 result has no coherent source-native prose, and moves too few boundaries for the observed native style. The entire original text and the authentic 95-rune p57 planted ciphertext reencrypt/decrypt exactly. [Frozen-key CommonJS source](../sims/lp2_divinity_gp30_space_vigenere_original_sft.cjs) and [Windows Node 22 passing run 45058315869](https://github.com/FlareZ123/liber-primus/actions/runs/45058315869).


## Historical literal-F bypass: exact all-mask space upper bound

The known solved LP1 DIVINITY Vigenère cipher has an important exception that the simple direct GP30 candidate above does not implement: a **literal ciphertext F=0 can represent a plaintext F=0 without advancing the key**, even though an ordinary encrypted rune can also result in ciphertext F=0 and consume the key. This ambiguity is established by the authentic 515-rune solved-LP1 p03–04 regression; eleven true literal Fs are enumerated by [the historical p03–04 positive control](../sims/authentic_lp1_p03_p04_vigenere_recovery.cjs). The actual 2014 encoder is GP29. Extending that special rule to a GP30 token alphabet remains an *investigator hypothesis*.

The new test grants **every one of the 458 actual ciphertext F tokens** a completely independent secret binary choice: either output literal F and **skip** the eight-rune DIVINITY phase, or decode by ordinary modulo-30 subtraction and **advance** the key phase. All 15,858 original source tokens, period marks and original physical page owners are unchanged. An exact max-plus DP with eight phase states enumerates the best possible decoded SPACE count over **all \(2^{458}\) bypass masks implicitly**, recovers one witness mask via backpointers, and checks full original replay under the corresponding mask. The bypass mask is *not uniquely ciphertext-recoverable*: treating it as a free unknown makes this an optimistic capacity exclusion rather than a legitimate unaided plaintext decoder.

| True original source recipient and allowed clock | Maximum decoded SPACE events | Fraction of decoded 30-token register |
| --- | ---: | ---: |
| All original, initial key phase zero and one uninterrupted clock | **756 / 15,858** | **4.767%** |
| All original, any one of eight initial phases | **759 / 15,858** | **4.786%** |
| Eight source sections, each with a separate freely chosen initial phase | **767 / 15,858** | **4.837%** |
| Fifty-five physical rune pages, each with a separate freely chosen initial phase | **825 / 15,858** | **5.202%** |
| p16–21, arbitrary initial phase, independently optimized bypass mask | **96 / 1,985** | **4.836%** |
| Held-out p40–53, arbitrary initial phase, independently optimized bypass mask | **192 / 3,677** | **5.222%** |

The independently authentic **755 GP-rune** solved-LP1 THE LOSS OF DIVINITY passage has **183 printed gap/period events in 938 source tokens (19.510%)**, and actual clear p57 has **20/115 (17.391%)**. Both were *independently planted* in GP30 with the true historical-style literal-F skip decision for every plaintext F; they decrypt and reencrypt exactly, including cases where a normally encrypted non-F emits ciphertext F. Each positive passes the dynamic-programming necessary SPACE bound. On original LP2, even the markedly more generous *page-private free initial phase plus fully secret F decisions* falls far short of these real solved-space benchmarks. This **excludes the named source-fixed DIVINITY GP30 cipher with every possible F transparency mask** as a decoder for comparably spaced native GP prose; it does not exclude a different key, unencoded input separators, a hidden cipher state or unusually low-space plaintext.

Exact original-source [F-transparent all-mask CJS SFT](../sims/lp2_divinity_gp30_all_fskip_space_capacity_sft.cjs) passes the unchanged full corpus, physically owned page spans, complete source replay and two original solved-GP positive plants on [Windows Node22 run 45060066665](https://github.com/FlareZ123/liber-primus/actions/runs/45060066665).

## Stronger result: every secret state alphabet, without guessing a key

For a period-\(m\) state family, **allow any of 30! independent, bijective GP30 alphabet mappings in each state**. This strictly includes any periodically repeated full-30-symbol Vigenère rotation and does not know or fit a key. Three exact source clocks are tested: one global continuous period, a separately secret period within each of the transcription's **eight real section blocks**, and even a separately secret period on each of the **55 rune-bearing physical pages**. The page-secret model generously permits state changes inside carried original words.

Let \(h_g(c)\) be the original count of symbol \(c\) in key-state \(g\). A bijection maps exactly one input class \(c\) to plaintext SPACE. Let \(L_5(h_g\setminus c)\) be the sum of the five largest other class counts. Write \(T_5\) for the decoded five-most-frequent GP *rune* total, \(S\) for decoded SPACE count, and \(N=15,858\). For any desired native GP concentration \(T_5/(N-S)\ge q\), the following necessary condition is **exact and key-independent**:

\[
\begin{aligned}
T_5+qS&\ge qN,\\
T_5+qS&\le U_m(q):=
\sum_g\max_{0\le c<30}
\left[L_5(h_g\setminus c)+q\,h_g(c)\right].
\end{aligned}
\]

Thus **\(U_m(q)<qN\) excludes every secret key** in the declared model. This is a safe optimistic bound: it even lets the five preferred plaintext runes differ from key state to key state. The SFT performs comparisons as exact integers after multiplying by the denominator of \(q\), without rounding, random scoring, dictionary fitting, or configurable secret alphabets.

The **755 original unenciphered GP runes** of solved LP1 THE LOSS OF DIVINITY / INSTRUCTION (physical p10–13) exhibit 320 occurrences of their five most frequent symbols, giving a long real native control \(q=320/755\). The shorter authentic clear p57 has \(q=46/95\). A deliberately weaker comparison requires only \(q=2/5\).

| Native GP concentration threshold | Every global period excluded through | Every eight-section-private period excluded through | Every 55-page-private period excluded through |
| --- | ---: | ---: | ---: |
| **Long actual solved LP1: 320/755 = 42.384%** | **147** | **19** | **2** |
| Clear actual LP2 p57: 46/95 = 48.421% | **314** | **40** | **5** |
| Looser hypothetical 2/5 = 40% | **97** | **13** | **1** |

Each threshold includes **every integer period from 1 through that value**. The next period is only the first where this necessary bound becomes *inconclusive*. It is neither a demonstrated decipherment nor proof that larger periods work. Period dependence is nonmonotone: using p57, period 315 becomes inconclusive while 316 and 333 still fail the certificate.

As separate source-native positive witnesses, the exact real p57 PARABLE and the 755-rune *original solved LP1* prose were each GP30-enciphered under the authentic eight-symbol DIVINITY schedule. Both positives pass their own period-8 certificate and invert rune-for-rune with authentic spaces. The untouched LP2 original fails for periods given above. [Exact all-secret CJS reproducer](../sims/lp2_gp30_allsecret_periodic_space_fiveconcentration_sft.cjs), [Windows original-source and controls passing run 45059289140](https://github.com/FlareZ123/liber-primus/actions/runs/45059289140), and [manual workflow](../.github/workflows/agent10-divinity-gp30-space-original-manual.yml).

## Decision

A full, length-preserving **30-token bijective substitution** whose secret alphabet repeats with one common period below 148 cannot produce a plaintext with the same top-five-rune concentration as the long, genuinely solved LP1 prose, even under arbitrary phase alphabets and fully mobile spaces. Separately hidden keys for the actual source sections and pages have their own tighter low-period exclusions. The source-keyed DIVINITY variant fails on long original paragraphs and an independent heldout chapter, **even under every possible historically attested F-bypass clock**.

This is a **conditional native-GP prose constraint**. It cannot reject deliberately low-concentration prose, encoded/compressed output, different treatment of punctuation, variable-length or nonbijective encoding, word-history-dependent states, genuinely nonperiodic secret pads, or unrelated cipher families. It does not recover original unknown plaintext, actual Cicada keying, or the hidden deep-web destination. Work seeking authentic key material or an author-readable **nonbijective** space-changing operation remains justified; repeating the excluded short GP30 alphabet families does not.
