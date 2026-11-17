# Source-visible GF29 affine plaintext feedback: original-p0 key recovery attempt

**17 November 2026, Agent16, Director [#1422](https://github.com/FlareZ123/liber-primus/issues/1422). Classification:** a finite, executable, nonperiodic GP29 feedback-inverse test, rejected on original plaintext evidence. The **56 LP2 unknown physical pages remain unsolved**; this study recovers no authentic unknown plaintext or creator key. It investigates one compact algebraic family distinct from the completed fixed-rune zero-step tests and 2,349-program basic signed-tap grammar. It does not justify expanding into arbitrary secret tables.

## Motivation and independently visible operation

The original 55 rune-bearing unknown pages contain **12,956** GP29 ciphertext runes across **2,896** printed words, with **32 actual physical-page word carries**. Their **86** adjacent equalities over **12,901** same-page comparisons are extraordinarily rare, while **104 of 2,105** within-word fifth-back comparisons match. The original p39 red triad and the signed 2013 BASE29 example also supply specific, historically accessible GF29 numbers. A short causal plaintext-feedback rule could, in principle, make immediate repeats rare when a particular *plaintext digraph relation* rarely occurs, yet use a nonperiodic state evolving with plaintext.

Test the entire reversible family, over (ℴ_{29}), for every (a,bin{0,ldots,28}):

```text
C[0] = initial_cipher
C[i] = C[i-1] + P[i] - a*P[i-1] - b (mod 29), i >= 1

P[0] = initial_plaintext
P[i] = C[i] - C[i-1] + a*P[i-1] + b (mod 29), i >= 1
```

The rule is a **two-register causal transducer**: only the previous ciphertext and plaintext symbols are required. Unless (a=1), its output-to-plaintext shift follows a changing, plaintext-driven state and need not have a short key period. The original red p39 quadratic (G(x)=27+5x+15x^2=15(x-24)^2) suggests inspectable pairs such as ((24,15)), ((5,27)), and the signed-2013 (H(x)=3+26x+24x^2) supplies ((26,3)), ((24,26)), ((3,26)). **Neither source explicitly instructs this emitter or chooses the particular affine pair.** All 841 pairs and all 29 initial plaintext rune values are therefore tested as a finite exploratory grammar, rather than accepted as Cicada operations.

This cipher has a sharp source-independent property: its adjacent repeats occur **exactly when** (P_i=aP_{i-1}+b). That makes its near-zero-repeat prediction measurable on independent native-GP English before looking at original decipherments. It cannot guarantee the whole-book 5-back effect through an additional independent tuning parameter.

## Original-source and native GP29 experiment

[Windows Node22/CommonJS SFT](../sims/lp2_affine_plainfeedback_joint_original_sft.cjs) · [successful exact original/positive workflow](https://github.com/FlareZ123/liber-primus/actions/runs/44180092400).

The program parses actual original source runes, separators and complete source-joined words, then freezes two source-shaped plaintext controls built independently from Gibran and Shakespeare. Each control has **exactly the original 2,896 printed GP-rune word lengths** and the original nine chapter/page locations, but each whole GP English word is selected from its source corpus without using unknown plaintext. Control selection uses fixed xorshift seeds. All 29 rune values remain representable: no secret skip, dropped glyphs, fake page joins or inserted filler.

Original acceptance requires both the unusually small page-local adjacency count and a within-word fifth-back excess. The two native controls give the following independent forward predictions, counting **all 55 original page-local adjacency boundaries and all 2,105 genuine within-word fifth-back sites**:

| Literal affine pair from source numbers | Gibran repeats / 5-back | Shakespeare repeats / 5-back |
| --- | ---: | ---: |
| ((a,b)=(24,15)) | 358 / 49 | 239 / 69 |
| ((5,27)) | 440 / 59 | 421 / 90 |
| ((26,3)) | 479 / 73 | 505 / 65 |
| ((24,26)) | 481 / 73 | 434 / 93 |
| ((3,26)) | 308 / 58 | 303 / 82 |
| **Original unknown LP2** | **86 / 104** | **86 / 104** |

For a deliberately permissive two-feature exploratory screen, grant ≤125 adjacency repeats **and** ≥90 same-word fifth-back matches in each entire 12,956-rune control. **Zero of the complete 841 affine pairs meets both criteria for both independent native controls.** The source-selected-looking pairs miss both original effects strongly. This is an empirical constraint under the specified native register, not a mathematical exclusion for every possible plaintext language or word encoding. Source word lengths are held fixed, so the difference does not arise from giving controls ordinary rather than ciphertext-like word lengths.

For an actual plaintext-recovery attempt, train one GP29 trigram score solely from the independently pinned Gibran text, then decode the **intact original p0–p2, 729 runes**, under each of **841×29 = 24,389** (a,b,P_0) combinations. Lock the best pair from p0 before testing the original **p40–53, 3,008 rune** chapter. In the latter holdout, allow all 29 possible fresh initial plaintext runes, giving the candidate the strongest separate-IV chance without refitting either affine coefficient.

| Entire original-input decoding decision | Mean log-probability per GP rune |
| --- | ---: |
| Unmodified original p0–2 | **−4.313730** |
| Best of 24,389 p0 decoders, (a=12,b=2,P_0=14) | **−4.152123** |
| Same (a=12,b=2), best independently reinitialized p40–53 holdout | **−4.274199** |
| Genuinely clear p57 native GP text | **−2.527986** |
| Independent 729-rune Shakespeare native GP control | **−2.549010** |

The top original p0 output begins `X E AE Y IA L E B E Y T D U J IA TH T A J F EO W NG F J W N U C J`, with no coherent plaintext passage. Its improvement over random-looking ciphertext disappears in the heldout chapter. The entire p0 original and untouched p40 heldout **reencrypt perfectly** under the selected inverse, as any correctly coded bijective family must.

The calibration is stronger than a roundtrip alone: independently take 729 consecutive source-native Shakespeare runes, forward encrypt them with **(a=24,b=15)** and a fixed nontrivial initial ciphertext seed, then run the identical blind 24,389-candidate search. The independent GP trigram scorer recovers **all 729/729 original planted plaintext runes, exact pair (24,15), and exact initial plaintext value**, with full forward reencryption. It therefore recognizes a genuine matching short-program key where one exists, under these language-generation assumptions.

## Decision for #1422

The entire **841-pair plaintext-driven affine feedback family** fails the joint source-native ciphertext-feature screen and fails actual original-cipher plaintext recovery. Its best original p0 fit is far short of authentic GP-native prose and fails a large untouched chapter, even when granted a separate free initial state. **Retire this specific compact automaton**, including all source-number pairings in the table, instead of adding phase offsets, arbitrary S-boxes or extra hidden states to rescue it.

The source-original red and signed-2013 polynomials are not invalidated as possible clues. They simply do not select a working **one-rune affine previous-plaintext feedback** receiver. Additional operations need a genuinely new source-selected cause for both adjacent-repeat suppression and word-local fifth-back behavior, plus original plaintext evidence. This negative does not close the broader Director #1422 architecture question.
