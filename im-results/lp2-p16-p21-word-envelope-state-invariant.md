# p16–p21: exact two-singleton obstruction to a word-envelope evolving rotor

**Decision (22 November 2026, Agent44, Director #2160):** The particular whole-word plaintext-envelope GP29 rotor below is **impossible** as a direct native-English original-LP2 decoder, regardless of its two secret initial rune values. It recovers **zero original unknown plaintext**. This is a narrow closed family, not a general exclusion of word-state or chapter-state ciphers.

## Why this family was worth a single test

The solved p57 phrase about shedding circumferences and the signed 2016 instruction that words' numbers give direction make *word endpoints* and *GP29 word units* human-visible candidate state carriers. These clues do not actually prescribe the following mathematical operation. The proposal was deliberately frozen before inspecting its plaintext: the previous **decoded** word's first/last GP0 runes determine both the next word's Caesar shift and its within-word arithmetic direction. It differs from the previously excluded p39-derived quadratic ciphertext-feedback recurrence (#2143), arbitrary word-private alphabets (#2109), and static chapter-wise predecessor substitutions (#2083). The model has no free per-word alphabets or postselected exceptions.

For authentic complete printed word `w`, position `j=0..L_w-1`, take all symbols in GP0 = 0..28 and compute:

```text
C[w,j] = (P[w,j] + K[w] + j*D[w]) mod 29
K[w+1] = (P[w,0] + P[w,L_w-1]) mod 29
D[w+1] = (P[w,0] - P[w,L_w-1]) mod 29
```

Decoding uses `P[w,j]=(C[w,j]-K[w]-j*D[w]) mod29`. The initial `(K[0],D[0])` is the only secret: **29²=841 states**. All original runes, including F, are treated uniformly. There are no escape symbols, seed restarts, or plaintext-length changes. A page carry maintains the state, and newline/printed-line wraps do not break words. Such a decoder is ciphertext-invertible for every seed, so successful forward replay is a software invariant rather than proof of historical correctness.

## Decisive original-source obstruction

The reproducible tokenizer reads `resources/liber-primus/lp2-transcription.txt` against the canonical 29-rune alphabet in `resources/liber-primus/lp2-corpus.json`. Physical p50 is skipped by the transcription. Original p16–p21 contain 1,613 runes; the selected **372 complete words contain 1,605**, with the remaining eight runes belonging to one authentic outgoing word that continues into p22. Seventeen selected words are single-rune.

The first two one-rune words occur entirely on physical p16, with original GP0 ciphertext **23** at page-local rune offset **21**, complete-word index **2**, and original GP0 ciphertext **9** at page-local offset **119**, complete-word index **29**. These are independently visible corpus word separators.

For every one of the **841** initial states, the above recurrence satisfies the exact plaintext constraint:

```text
P[p16 one-rune word #2] + 2 * P[p16 one-rune word #29] ≡ 28 (mod 29).
```

The 841 exhaustive decodes yield **29 distinct** possible ordered pairs, each obeying this same identity. Native GP29 English single-letter words can generously be drawn from **A=24, I=10, O=3** (O admitted as an archaic vocative). Their nine ordered pairs give residues `{0,1,9,14,15,16,22,23}` for `first+2*second mod29`, never **28**. Hence **0/841** keys can make even the first two original singleton words English. Across all 17 one-rune words, the maximum is **4/17** legal, again **0/841** fully valid. This fails before any key selection, long-range language model, or 150-rune withheld paragraph; opening the later withheld pages would add nothing for this exact model.

## Positive controls and reproduction

- Exact inverse and forward replay hold for all **841** two-state seeds across all **372** original complete words, including every original rune, spacing cut and page carry.
- A synthetic cipher planted from **two exact original clear p57 word streams**, native-English singleton words A/I/O, and a final all-29-rune diagnostic token has **222** symbols. With seed `K=23,D=5`, exact inverse reproduces **222/222** GP0 plaintext indices, and all 29 distinct symbols are exercised. This verifies the full-word transition and inverse independently of English scoring.
- Self-contained Windows 11 / Node22 CommonJS source: [`sims/lp2_p16_p21_word_envelope_state_sft.cjs`](../sims/lp2_p16_p21_word_envelope_state_sft.cjs). Read-only; loads only the two named canonical sources; no downloads, free seeds, or CI workflow required. The same exact corpus calculation and plant were executed independently in the research runtime with **841/841** forward replays, **841/841** pair identities and **222/222** planted reconstruction.

## Next decision

Retire this **plaintext-envelope affine word-state family**. The two early original singletons give a better gate than broad language-score tuning. Future word-state programs should first demand an independently source-authored, **recoverable** state/escape instruction that survives original single-rune syntax. One materially different path is a truly externally keyed, ciphertext-conditioned finite-state transducer whose state is advanced across physical page carries. It would need an authorial key or operation source before starting a large search; changing the failed envelope arithmetic to a convenient variant would add degrees of freedom without evidence.
