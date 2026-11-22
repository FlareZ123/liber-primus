# Original LP2: nonlinear substitution of successive plaintext differences

**Agent 17, 22 November 2026. Classification:** newly tested full-secret-key original-cipher family, bounded negative for GP-native ordinary English. **No recovered unknown LP2 plaintext, authenticated key, author-selected cipher or continuation destination.** [Windows Node.js 22 PASS, manual run 44990072886](https://github.com/FlareZ123/liber-primus/actions/runs/44990072886).

## Motivation, rival, exact mechanism

The original printed Gematria Primus alphabet has 29 rune symbols and its solved material invokes prime and totient arithmetic. Among the 12,956 preserved unsolved LP2 ciphertext runes, equal adjacent runes are abnormally rare. The tempting claim that a predecessor difference itself represents an encrypted plaintext rune is already excluded in multiple stronger reports. There is a separate, algebraically distinct idea: **the cipher might act on the difference of two successive plaintext runes**, and then sum the resulting encrypted steps.

For every original printed word `w`, after an unconstrained initial rune `C[w,0]` and initial plaintext `P[w,0]`, consider

```text
D[w,i] = (C[w,i] - C[w,i-1]) mod29
D[w,i] = h((P[w,i] - P[w,i-1]) mod29), i >=1
P[w,i] = (P[w,i-1] + h_inverse(D[w,i])) mod29
```

Here **`h` is any one of the 29! possible bijections**, including nonlinear mappings where `h(0) != 0`. The entire secret map is held stationary over the book. We grant *independent free starts for every word*, so no assumed word-initial cipher seed creates a false obstruction. Original word boundaries, including words printed across page and line breaks, remain intact.

The main rival is an ordinary encrypted or random-looking source having this histogram by chance without any relationship to native English plaintext. The manuscript does **not** explicitly select this cipher, nor does its known prime-field arithmetic specify a 29-symbol `h`. Consequently the test is a necessary-condition gate only.

This family differs from earlier `D=h(P_i)`, `D=h(P_i +/- GPprime(P_prev))` and `D=k_i*(P_i-P_prev)` families: the last one requires `h(0)=0`, while the present model allows an arbitrary nonzero image of zero. Relevant separate reports are [word-local affine/projective output lookup](lp2-wordwise-firstdifference-affine-source-gate.md), [previous-plaintext prime feedback](lp2-delta-plainfeedback-source-gate.md), [variable multiplicative plaintext-difference gate](lp2-p27-plaintext-difference-allsecret-key-anchor.md), and [one-tap all-secret ciphertext-feedback spectrum](lp2-cumulative-difference-zero-symbol-gate.md).

## Exact all-secret alphabet invariant

Under any globally secret `h`, the histogram of ciphertext differences must be a **permutation** of the histogram of plaintext differences. It follows that the sorted 29-bin histogram is identical, irrespective of the unknown 29! key. In particular, the count in the most common ciphertext-difference bin must equal the count in the most common plaintext-difference bin.

The authoritative source [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [original printed word transcript](../resources/lp2-transcription.txt) yield **2,896 complete words** and **10,060 genuinely within-word predecessor transitions**. The exact original ciphertext difference counts in GP29 numerical order are:

```text
[63,356,373,354,338,349,325,372,328,397,377,362,343,381,369,
 365,333,313,349,368,373,366,334,390,371,352,349,380,330]
```

The largest original bin is only **397/10,060**, whereas the zero-difference bin is **63/10,060**. Both figures are exact original source measurements; no plaintext hypothesis enters.

Using the previously validated solved-LP1 GP spelling (including the genuine single-rune ING and IO), the pinned Shakespeare, Gibran and Emerson texts yield **149,072 native-GP English words** and **451,853 within-word predecessor differences**. The exact minimum total-variation distance over **all 29! alphabet substitutions** between those source differences and the original ciphertext differences is **0.13538428873525826**. This is an invariant frequency comparison, not a guessed key score.

## Source-length-matched English controls

To avoid relying on the length distribution of the full literary sample, construct **1,000 different hypothetical English books** under fixed xorshift32 seed `0x33012026`. Each has precisely the **2,896 original printed word positions and exact 12,956-rune total**, replacing every original word with a uniformly selected source-native English word of the *same GP length*. Each control produces exactly 10,060 within-word differences. No trial is trained on ciphertext or selected by plaintext readability.

| Measurement | Unchanged original LP2 | 1,000 native-GP controls |
| --- | ---: | ---: |
| Most populated delta bin | **397** | minimum **645** |
| Zero-difference count | **63** | minimum **253** |
| Best possible secret-permutation TV versus original | fixed | **0.1167992** minimum; **0.1312012** mean; **0.1465209** maximum |
| Trials with minimum TV below 0.03 | n/a | **0 / 1,000** |

The peak-bin mismatch alone is an exact obstruction to *all* secret permutations for every one of the 1,000 matched controls. The total-variation statistic proves that no alternative relabeling of histogram bins rescues those same texts. The trial minimum is a source-sample bound, **not a universal theorem about every possible English sentence**, and the 1,000 pseudo-random controls do not supply a discovery-wide probability.

A successful source-native positive plant separately encrypts a complete independent GP English book in all original 2,896 word slots under the genuinely nonlinear hidden map `h(d)=(7*d^5+3) mod29`. The inverse uses `h^-1(y)=(25*(y-3))^17 mod29` and a free initial rune for every word; all **12,956 / 12,956 planted plaintext runes are recovered exactly**. The planted plain and cipher delta histograms, when sorted, are identical. Thus the gate accepts a fully working instance of precisely this family.

## Direct original-cipher prime-field inverse

Two authorially recognizable numbers, **3301** and **3299**, suggest the finite-field exponent permutations `d^3301=d^25` and `d^3299=d^23` modulo29. Their inverse exponents are `9` and `11`, respectively. Apply each to every observed original page-local ciphertext difference; then integrate, taking free plaintext rune zero at each page start. Exact re-encryption restores **all 12,956/12,956 source runes** for either operation, verifying a complete functional inversion.

| Proposed source-number permutation `h` | Original decoded within-page GP29 IoC | Physical p0 24-rune prefix |
| --- | ---: | --- |
| `d^3301=d^25` | **0.034283638346** | `FNIAUOEIAPOFTHTHPNGIADCELOEJRPR` |
| `d^3299=d^23` | **0.034216733072** | `FGHTTHGNIAMFYEOTUDIHPDRGSNGS` |

The prefixes shown are GP transliterations and include multi-letter token names; they are the first **24 runes**. Neither whole-book inverse exhibits the pronounced native-English collision excess or coherent sustained language of the independently solved LP2 pages. Page-initial plaintext values are arbitrary by design, so the quoted collision rates are computed **within physical pages**, excluding cross-page pairs.

This exact source-parameter trial is a small explanatory subset of the all-permutation obstruction, not a separate reason to search other exponents.

## Nine independent visual-chapter secret permutations: stronger source-reset gate

An author might plausibly change the unknown nonlinear difference-alphabet `h` when the *original printed book starts a fresh visual chapter*. Grant **nine unrelated arbitrary secret permutations `h₁,…,h₉`**, one for each authentic chapter p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55, with the same freely chosen first rune in each printed word. This contains the global-key hypothesis but allows `(29!)^9` possible independent bijection choices. The physical page index is mapped explicitly after omitted runeless p50; neither the transcript's ordinal 50 nor a cross-page wrapped word is incorrectly treated as a different cipher stage.

For each actual chapter, compute the original within-word ciphertext-difference histogram. For a candidate ordinary GP-native English control of **exactly the source's 2,896 printed word lengths and physical chapter assignments**, find that chapter's minimum possible total-variation histogram distance over all 29! hidden substitutions by sorting its two 29-bin histograms. Weight the nine independently optimal distances by their authentic source transition counts; this is the **best conceivable aggregate histogram match** for the nine-secret-key family, with no key search:

| Physical visual chapter | Original complete words | Within-word transitions | Largest original difference bin |
| --- | ---: | ---: | ---: |
| p0–2 | 158 | 571 | 30 |
| p3–7 | 255 | 890 | 43 |
| p8–14 | 383 | 1,346 | 63 |
| p15–22 | 437 | 1,466 | 66 |
| p23–26 | 224 | 797 | 41 |
| p27–32 | 326 | 1,107 | 49 |
| p33–39 | 378 | 1,302 | 65 |
| p40–53 | 669 | 2,339 | 101 |
| p54–55 | 66 | 242 | 16 |
| **Total** | **2,896** | **10,060** | per-chapter only |

Under the same three pinned 149,072-word literary controls, the same independent fixed xorshift seed and 1,000 freshly sampled source-length-matched GP English books, the nine-chapter **all-secret lower bound** has:

- **Minimum attainable total-variation mismatch: 0.0893638170974155**
- **Mean: 0.10342604373757462**
- **Maximum: 0.11669980119284294**
- **Trials with TV ≤0.03: 0/1,000**

This tighter model grants **fresh arbitrary nonaffine substitution on every observed visual-chapter boundary**, unlike the first global-secret comparison. A separate true-English book is encrypted with nine distinct nonlinear GP29 bijections `h_s(d)=(s d⁵+s+2) mod29` for chapter number `s=1…9`. The corresponding exact exponent/power-field inverses recover **all 12,956 native GP source runes** and the sorted within-chapter histograms agree exactly before and after encryption. This establishes that the broadened gate accepts its own legitimate source-language family.

The original remains incompatible with **every one of these 1,000 independently drawn ordinary English books**, even after the most favorable unrelated key choice in all nine chapters. The lower bound is sample-conditional, and a specially constructed unknown English message, non-English intermediate source, or truly word-varying hidden key is not mathematically excluded. An image-selected change of keys alone does not repair this source-native mismatch.

## Cryptanalytic decision

The original ciphertext's within-word delta spectrum is far flatter than every matched native-English sample, after granting an entirely secret stationary nonlinear 29-symbol map. Therefore **retire a globally stationary or nine-visual-chapter-rekeyed `h(Delta P)` map across the printed word stream** as an explanation for ordinary GP-native English on the original unmodified LP2 pages. The original source does not provide a map or key to use downstream.

This exclusion does **not** cover different secret maps per word or short clock phase, changed word boundaries, a more complex multi-step codec, intermediate randomized plaintext, alternate linguistic registers, an external one-time pad, or actual 2014 crypto infrastructure. Such alternatives need independent source clues before another unconstrained parameter search.

Reproduce with the [read-only single-file CommonJS SFT](../sims/lp2_plaintext_delta_nonlinear_allsecret_original_sft.cjs), requiring only Node.js 22 and the checked-in source corpus. All original counts, 1,000 length-matched samples, two complete field-power inversions and the nonlinear native-GP plant passed on [Windows Actions run 44990072886](https://github.com/FlareZ123/liber-primus/actions/runs/44990072886).