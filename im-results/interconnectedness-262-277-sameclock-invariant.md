# 2014 audio 262/277 selectors: all-secret shared-key necessary-condition test

**Status (Agent 1, 11 November 2026): intermediate original-ciphertext exclusion for one source-motivated same-key model. No LP2 plaintext, cipher, key, or continuation recovered.** The audio-to-page correspondence is retrospective, not an authenticated instruction.

## Independent clue and exact original source

The historical signed 2014 **Interconnectedness** recording lasts approximately **277.159 seconds** and repeats its opening forward noise waveform after **11,559,607 samples / 44,100 Hz = 262.122608 seconds**. Its GP title sum is **772**, reversing to the recording's floored duration 277; the sound measurements and artifact provenance are published in [SECRA's 2026 audit](https://secra.tech/research/liber-primus-strongest-findings/). The separate [2014 archived MP3](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/media/audio) is not the 2013 761.MP3.

In the canonical original `resources/liber-primus/lp2-corpus.json` of **55 rune-bearing unsolved pages**, physical LP2 **p0 has 262 runes** and **p29 has 277 runes**, each a unique page length; 277 is the largest page count. Both audio timings require taking whole-second values. P29 separately has an original ciphertext/table double-root relation documented in [the marked-quadratic audit](lp2-page29-marked-quadratic-crosslink.md). These are links for exploratory route selection, not proof of deliberate author instruction.

## What can be tested without knowing any key

Suppose both nominated pages were encrypted using the same arbitrary **262-position additive GP29 tape clock**, so that `C0[i]=(P0[i]+K[i]) mod29` and `C29[i]=(P29[i]+K[i]) mod29` for all original rune positions `i=0..261`. Then **every** possible unknown shared key cancels:

`D[i]=(C0[i]-C29[i]) mod29=(P0[i]-P29[i]) mod29`.

The exact original 262-rune difference histogram by residue 0..28 is

`[12,5,13,8,12,9,10,7,7,10,15,14,11,11,7,15,7,9,9,11,9,4,6,5,5,11,6,6,8]`.

There are **12/262 exact rune equalities** at aligned offsets. The full difference sequence provides a stronger source-language test than the equality count alone. The identity holds for any private additive pad (29^262 choices), and requires synchronization; different key phases, encryption alphabets, hidden skips, non-GP plaintext and word transpositions are outside it.

## Frozen native GP29 difference-language controls

The [standalone CommonJS reproducer](../sims/interconnectedness_audio_page_sameclock_gate.cjs) trains two **independent** models, each on the *first* portion of one reference and evaluates original ciphertext once using **fixed** parameters. The models learn source bigram joint frequencies `B[x,y]`. For two independently drawn source passages, the joint distribution of successive difference runes is `J[d,e]=Σ_(x,y) B[x,y]·B[(x-d) mod29,(y-e) mod29]`. From it derive `R[d]=Σ_e J[d,e]` and `M[d,e]=J[d,e]/R[d]`. Unigram score is `Σ_i ln(29·R[D_i])`; bigram score is `ln(29·R[D0])+Σ_(i>0) ln(29·M[D_(i-1),D_i])`. Both are source-trained log contrasts against uniform GP29 differences, and neither looks at LP2 when training.

The Shakespeare reference has **217,644** GP runes, with **113,174** training and **104,470** heldout runes; **12,000** disjoint-within-pair heldout text-window pairs are sampled with fixed seed `0xa213c14a`. Latin Vulgate GP reference has **204,802** runes, **110,593** training and **94,209** heldout; **10,000** heldout pairs are sampled with seed `0x1a71a277`. Windows within each pair are nonoverlapping; different samples may overlap.

| Reference | Model | Original score | Native mean | Native minimum | Native controls at/below original |
|---|---|---:|---:|---:|---:|
| Shakespeare GP-English | Unigram | **−7.501020** | +4.902621 | −7.224622 | **0/12,000** |
| Shakespeare GP-English | Bigram | **−9.600620** | +5.716676 | −8.743828 | **0/12,000** |
| Latin Vulgate GP | Unigram | **−13.107748** | +12.264480 | −9.061131 | **0/10,000** |
| Latin Vulgate GP | Bigram | **−19.309406** | +14.189457 | −9.159460 | **0/10,000** |

Finite plus-one conditional lower tails are **1/12,001** and **1/10,001**. The references and samples are not independent draws from the unknown true author distribution, and the audio clue/this mechanism were selected after inspecting available research. These values do **not** give a discovery-wide significance bound.

**Positive planted inversion:** the identical script encrypts each of two fresh native GP reference windows under a single arbitrary random 262-symbol pad and verifies the resulting ciphertext differences recover all **262/262 true plaintext differences exactly**. The full committed script was executed with the original repository files under an equivalent Node CJS module runtime and its native controls passed as reported.

## Cryptanalytic decision

A direct **same-phase shared additive 262-symbol audio key** with two ordinary English/Latin GP29 prose plaintexts is unsupported and strongly separated from both native reference samples. This is an **all-secret, constrained architectural negative**, not proof that audio is irrelevant. An audio timing might select p0/p29 while a different operation, separate keys, or a non-GP register carries the message. Continue only with a further authentic clue specifying those missing choices, and insist on recoverable plaintext and exact re-encryption.

**No original LP2 unknown runes decrypted.**
