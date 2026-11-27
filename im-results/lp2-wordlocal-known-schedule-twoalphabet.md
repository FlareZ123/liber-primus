# Word-local known-schedule independent-alphabet inverse

**Research decision (27 November 2026, Agent10).** A supplied nonperiodic consuming-shift array can differ for every printed word, with independent word-start cursor resets and genuine plaintext-F holds. A pooled known-schedule inverse learns two shared GP29 alphabets without knowing the plaintext or relying on the order of words. Two full-length length-conditioned literary controls recover 6,512/6,534 frozen held runes, exactly matching the known-key Viterbi oracle and replaying every glyph. This is a receiver calibration for Agent20's independently supplied schedule question, not a source selector, new LP2 key, or claim that the printed groups are authentic words.

## Typed receiver and model

For printed word w, independently supply its finite shift array K_w (at least its printed length). Reset consuming index j=0 at the start of every word. For plaintext F, emit ciphertext F and do not advance j. Otherwise emit B^{-1}(A(p)+K_w[j] mod29), advance j. A and B are common unknown permutations, with A(F)=0. The word-specific K_w is given to the receiver; no search over schedules, no lexical or semantic key generation, and no assertion that a continuous cross-word F clock is equivalent to a reset clock. The model is applicable to H-shuffle conditional on independently specifying a schedule in the **printed** word order; it is not a solution to H-decoy.

The 2,896 original printed groups (12,956 runes) are parsed from the corrected transcription and checked against the canonical rune tape. Only their lengths enter the controls. Sample donor words independently conditional on those exact lengths, thereby discarding donor grammar and inter-word adjacency. For the synthetic control schedule, K_w[j] is the GP ordinal at (w+j) mod 2797 in the source-corrected LP1 plaintext tape used in the earlier known-schedule receiver. This is a chosen control convention, not an authenticated key for LP2. Two separate seeded arbitrary alphabet pairs, Shakespeare and Gibran donor inventories; all lengths supported in each, no fallback donor needed. The Emerson language model is trained on separate words. Fit 2,172 complete printed groups / 9,689 runes; freeze both alphabets before the last 724 groups / 3,267 runes.

## Constructive method

1. Collect consuming observations before the first visible F independently in every training word. Estimate a relaxed C|shift profile with 15 exact pooled forward/backward updates over the word-local hold counts. Per-word likelihoods marginalize every legal hold sequence (no hold-mask cap).
2. Seed B by minimum forbidden-cell assignment and the five strongest Fourier waves, refined by histogram profile assignment. For each seed, run 24 structured EM updates with progressively eliminated consuming F probability. Hungarian assignment optimizes B conditional on the expected histogram and A; sorted rank frequencies optimize A conditional on B. Final legal scoring uses exactly zero probability of consuming plaintext F.
3. For the four best distinct legal alphabet seeds, decode every training word with exact Viterbi on (hold count, last rune). Refine A using an aggregate within-word bigram plus first/last-rune objective via pair-swap annealing. No cross-word transitions enter the objective. Freeze the highest training scorer. Decode held words individually with the supplied K_w, frozen alphabet pair and fresh word-start cursor. Exact replay checks every word, but alone cannot identify a key.

## Results

| Donor | Visible F / true holds | Legal initial seeds | Fit runes | Frozen held runes | Exact held words | Replay |
|---|---:|---:|---:|---:|---:|---|
| Shakespeare | 654 / 278 | 3/3 | 9650/9689 | 3255/3267 | 717/724 | all |
| Gibran | 686 / 279 | 3/3 | 9636/9689 | 3257/3267 | 720/724 | all |

Both recovered solutions exactly match the corresponding known-key oracle's fit/held counts. Shakespeare recovers all 58 alphabet entries. Gibran recovers all 29 outer and all 27 **observed non-F** inner coordinates up to common translation +19. Its GP25 AE is never used. With A(F)=0, a translation can move an unused plaintext coordinate q to rank 0, then swap q and F's ranks to restore A(F)=0; shift all B coordinates by the same translation. All observed consuming actions remain unchanged and literal F still bypasses. This is an exact absent-rune ambiguity, not full 58-label identification. The raw output records the two keys, true observed support, gauge match and oracle parity. Genuine hold-path ambiguity accounts for residual decoding errors even with the generating key.

The implementation exposes `study(data,{rows:[{C,K},...],fitWords,seed})`, returning the frozen keys and fit/held decoded words with individual replay checks, or a null best when no legal fit is found. Each C and K is an ordinal GP29 array; supply an explicit independent word order, reset convention and shift array first. This API does not infer K. The completed controls were executed in connected V8; standalone Node CLI wrapper and the separately exposed request entry point have not yet been exercised independently.

## Decision and evidence

[Receiver and complete test](../sims/lp2_wordlocal_known_schedule_twoalphabet_sft.cjs) · [raw output and input blobs](lp2-wordlocal-known-schedule-twoalphabet-output.json). Code commit e65e79e17d8653d15abd56d6817810fea9e09286; raw commit b941498858506d5471be4ffd958aaf4dd430680b.

The existing canonical-alphabet semantic WordNet/frequency-rank sweeps do not test this receiver, but neither those sweeps nor this synthetic calibration authenticates their schedules. Do not apply it to arbitrary WordNet/LP1 codebook combinations or promote the control to unknown plaintext. A source-fixed per-word array and reset is the next prerequisite. If a different model keeps a single consuming clock across words, adapt the continuous known-schedule receiver and mask cross-word language transitions rather than treating a reset as established. No original ciphertext was fitted, no established frontier change.
