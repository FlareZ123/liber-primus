# 2014 HTML 133/331 as primary rows of the historical 2015 LP2 729-rune BWT

**18 November 2026, Agent3, Director #1477. Decision:** The fixed original 729-rune 2015 prime-difference register **cannot be a complete last column of a standard sentinel-free circular Burrows–Wheeler transform (BWT) for any primary row**. Its stable LF permutation has **five unequal cycles of lengths 320, 288, 91, 22 and 8**. In particular, neither unlabelled 2014 HTML integer **133** nor **331** produces a valid reversible BWT original-input inverse. This is an exact original-register obstruction, additional to the already established full-register GP-language histogram obstruction. No unknown LP2 plaintext, source-authenticated cipher key or continuation was found.

## Human-visible source premise and its limitations

The surviving contemporaneous 2014 Stage11 distribution HTML contains literal `<title>133</title>` and `<div id="331">` beside image links for the Liber Primus release. These numbers were visible before the 2015 ciphertext experiment, but the preserved HTML gives **no BWT opcode, row-index instruction, zero/one indexing rule, sentinel declaration or map into the encrypted runes**. Their possible interpretation as BWT primary rows is therefore an explicitly conditional hypothesis, not an authenticated author instruction. The distinct 2014 Cicada Stage08 bzip2 use makes BWT historically available to a solver. Bzip2 itself contains additional stages and framing, and a general bzip2 packet is not what is tested below.

An independent February 2015 participant witness proposed a prime-shift then first-difference register on original physical LP2 pp0–2. On the **729 source runes**, with the original GP29 indices `C[i]` and consecutive positive primes `prime[0]=2`, `prime[1]=3`, define

```
S[-1] = -2 mod 29
S[i]  = C[i] - prime[i+1] mod 29
D[i]  = S[i] - S[i-1] mod 29
```

This exactly reproduces the historically reported **40 adjacent equal D pairs**, versus four adjacent repeats in original ciphertext. The exact first-stage reverse reconstructs all **729/729 original cipher runes**. The 2015 operation itself is a participant-proposed intermediate with no known authentic second stage; its success in reproducing the repeat count is a provenance-locked *intermediate*, not English plaintext.

## Complete key-independent LF-cycle obstruction

For a hypothesized BWT last column `L=D`, count its 29 alphabet symbols; let `C[x]` count symbols strictly smaller than `x`, and let `rank(x,i)` count earlier occurrences of `x` before position `i`. Standard stable LF mapping is

```
LF(i) = C[L[i]] + rank(L[i], i)
```

This is a permutation of the 729 original row positions, determined entirely by the original D stream. The exact five LF cycles have lengths **[320, 288, 91, 22, 8]**, summing to 729.

For a **valid primitive/aperiodic circular BWT** of one 729-rune message, LF advances the rotation position by one in a cyclic source, yielding **one cycle of length 729**. A periodic source may create several cycles, but under the standard stable-occurrence circular BWT used here, every cycle has the same length as the primitive period. Unequal LF cycle lengths are therefore an exact obstruction even if an otherwise secret primary-row value were allowed. The result is not a statistical English-likeness judgment.

The two primary-row-specific walks, under the only tested frozen **zero-based** interpretation, give the following formal sequences. Because their 320-row cycles are shorter than 729, each walker revisits rows before reaching the declared 729-symbol output. Their output multisets do not equal the supplied D multiset, their 729-step walkers do not return to the starting rows, and forwarding either alleged output with the matching standard circular BWT fails to recover the actual original last column and row.

| Source HTML primary row | LF cycle length | Row after 729 LF steps | Output original GP-index SHA-256 | True complete BWT inverse? |
| ---: | ---: | ---: | --- | --- |
| **133** | **320** | **436** | `1b5a6cc22ea509fabe326a65dc9d59ac6ce05b331bec498a99675c229bdfec13` | **No** |
| **331** | **320** | **412** | `7f253542049ce4ba3032bd9c6f21382246406c9eb728abfe14f9b2bb0ab1fe28` | **No** |

The first formal 150-rune LF-walk output at **133**, split at the original p0 printed-word lengths for readability:

```text
TEANGYCXIEA WGCHT JLWB IADE FST JRJINTUJJBX OIAOEOOE FXFU AEHW EOS
LGLP GXA BYTACY OERWRAETHDREAEAH EOS UAE ECG YNGOE GOJEOOC WAEYHO
TUNTIOIAM BEA PTHEOY NGOE OEAIA WBD WTCOC NF YNA EWOED DJMH COELOELEA
NTHOIA THPTEOT
```

The corresponding **331** output begins:

```text
TUOTHPEOTJ NNGIANGI OEGRT EANGY CXI EAWGCHTJLWBIA DEFST JRJI NTU
JJB XOIAO EOOEF XFUAEHW EOSLGLPGXAB YT AC YOER WRAE THDREAEAHEO
SUAEEC GYNGOEGOJE OO CWAEY HO TUN TIO IAMBEAP THEO YNGOE OEAIAW BDWT
COCNFY NAEW OEDDJM
```

Both are formally computed walks on an *invalid* presumed BWT column; **neither is a decoded 729-rune message**. The full outputs are printed untruncated by the reproducer. Counting fragments or short words in them cannot rescue the failed full-output forward-inverse contract.

## Positive controls and exact source checks

The standalone [Windows Node.js 22 CommonJS SFT](../sims/lp2_2014_html133_331_bwt_2015D_original_sft.cjs) checks all 729 original p0–2 GP indices, first-stage exact reverse, page-aware printed-word alignment and historical D repeat count. The original 729-symbol D index-byte SHA-256 is `a2d1212fccbc311317003b4567a6f390679bb354679743b2b1d94153ace8530a`.

A **genuine source-native Gibran GP29 passage of 729 runes** is forward-encoded by the exact standard primitive circular BWT implementation. Its LF permutation has **one cycle of length 729**, the inverse recovers **all 729/729 original planted GP symbols**, and a second forward encoding returns the same full last column and primary index.

A separate deliberately periodic three-symbol GP sequence of length 729 yields **243 equal LF cycles, each of length 3**, and the circular inverse again reconstructs all 729 symbols. This distinguishes legitimate periodic multiple cycles from the source input's impossible **five unequal** cycles.

The original direct-BWT assertions **passed** on Windows Node.js 22 [CI run 44302775563](https://github.com/FlareZ123/liber-primus/actions/runs/44302775563); the consolidated exact four-MTF-variant and full staged positive assertions **also passed** on [CI run 44304197235](https://github.com/FlareZ123/liber-primus/actions/runs/44304197235) (successful `source-test` job). The SFT prints every full original output, primary index, step count, LF census and plant status for independent reproduction. Its inputs remain the original [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and the independent pinned original-era prime-D first-stage formula.

## The historically motivated MTF→BWT receiver is also invalid

The prior [Director #1468](lp2-2015-primeD-gp29-mtf-original-gate.md) predeclared four standard **29-symbol GP MTF** views on the same 2015 D register, in a source-natural chapter-wide clock or a reset at exactly the original 262/528 rune page cuts. The actual bzip2-inspired path takes D as **MTF ranks**, reverses standard MTF, then asks if the resulting last column is a BWT of a single 729-rune message. The previously pre-registered rival interprets D as symbols and *encodes* to ranks. No hidden secret GP order is introduced.

Apply precisely the **same 729-cell stable LF permutation criterion** to those four already-fixed MTF outputs. Every candidate has unequal cycle lengths:

| Frozen MTF interpretation of original D | Original physical-page resets | Exact complete LF cycle lengths | Valid 729-symbol circular BWT last column? |
| --- | --- | --- | --- |
| Decode D as ranks | No | **336, 187, 176, 26, 2, 1, 1** | No |
| Decode D as ranks | Yes, 262/528 | **432, 274, 15, 5, 3** | No |
| Encode D as symbols | No | **531, 114, 68, 5, 4, 4, 3** | No |
| Encode D as symbols | Yes, 262/528 | **342, 288, 61, 28, 4, 2, 2, 2** | No |

Every MTF tape is exactly invertible back to historical D and all 729 original source runes, but none is itself a **valid complete** circular BWT last column. In particular, the two primary rows 133 and 331 cannot repair the invalid LF cycle decomposition. This result is key-independent and does not depend on guessing English phrases or using the low original global IoC.

The **expanded same SFT** now constructs a true 729-rune native-GP positive: Gibran text → genuine circular BWT → 29-symbol MTF ranks → exact inverse historical prime-D recipher into synthetic source-shaped ciphertext. It then reconstructs historical D, reverses MTF and circular BWT to recover **729/729 planted native-GP runes** with one 729-cycle, under both source-frozen original-page-reset conventions. This is a full staged positive for the tested cipher route, with source-original negative input completely separate from the planted data.

This new exact extension closes the remaining four *pre-registered* direct MTF/BWT paths from #1468. It leaves all bzip2-framing, Huffman and run-length operations outside scope. Since the 2014 HTML does not select that missing packet framing, do not guess one to force a plaintext. The original source has neither an independently typed compressed packet nor a source-selected BWT last column.

## Decision and surviving paths

For the frozen complete-original **729-rune** D register, primary rows 133/331 are unnecessary to rule out ordinary circular BWT: the complete LF-cycle decomposition is already impossible for **every** zero-based primary row. No additional primary-row sweep is warranted. An alternative interpretation using an *incomplete* last column, a genuine bzip2 container with additional symbol/state transformations, a separately provided sentinel, or a different original register is outside this exact proof. Neither the original HTML nor the 2015 participant witness selects one of those alternatives. This scoped result complements the earlier [all-primary-row BWT histogram/native-English exclusion](lp2-2015-primeD-gp29-mtf-original-gate.md) without repeating its language comparisons.

**Director fork:** close #1477 as a finite rejection. Reconsider a BWT hypothesis only upon independent historical evidence specifying a complete typed BWT last column, its sentinel/framing and consumer. This original input offers no authentic unknown plaintext, decipherment key or final destination. The [overall established synthesis](../results/README.md) remains unchanged.
