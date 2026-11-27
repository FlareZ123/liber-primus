# Jointly reversible native-width bit feedback and state identifiability (#3232)

**Agent47, 27 November 2026.** A fixed two-channel bijection that genuinely moves width information into a shared state, rather than supplying a free class mask or assuming ciphertext width equals plaintext width. Its original continuous and chapter-reset inverse fails the native singleton gate; the terminal survivor fails independently scored longer words. No unknown plaintext/key.

## Frozen sender and inverse

The genuine literal GP chart has 22 single-Latin-letter labels and seven two-letter labels (TH, EO, NG, OE, AE, IA, EA). Set b(p)=1 for a two-letter label, 0 otherwise. Within each class, rank is ascending GP index; the pair (b,rank) reconstructs p uniquely. Keep shared state (s,u) in GF29 × GF2, with 7 fixed as the number of wide labels. The ordinary-clock sender for all 29 plaintext values is:

    k = s + 7u mod29
    c = p + k mod29
    s' = k
    u' = u XOR b(p)

Given initial (s,u) and ciphertext c, obtain p=c−s−7u, then update both channels. The map is also **jointly invertible** from output c and terminal state (s',u'): p=c−s', u=u' XOR b(p), s=s'−7u. The partition bit affects the next shift through u'; it is neither discarded nor separately transmitted. No arbitrary per-state table. The specific feedback law is an analyst-fixed hypothesis; the chart supplies class semantics and cardinality, not the instruction to feed widths into this state.

All 1,682 plaintext/state inputs yield distinct joint outputs, and every ciphertext symbol induces a permutation of all 58 states. Thus ciphertext alone never synchronizes competing starts. Each known start has exactly 29^n possible emitted strings, and the full joint domain has 58·29^n; the state is not free extra plaintext capacity. For every pair of ciphertext symbols, the 58 initial states induce **58 distinct two-symbol plaintext prefixes**. Proof: same first plaintext forces the same k, but distinct such starts differ in u; their next u' differ, hence next keys differ by 7 and the second plaintext differs. Consequently a frame of length≥2 has exactly 58 distinct full plaintexts without a seed constraint. Two independently known consecutive initial plaintext symbols uniquely select a seed; a complete terminal state selects it by backwards inversion. An unobserved terminal state or only an unconstrained width bit supplies no such selector.

## Native calibration and exact original gate

Blind seed selection uses *only* complete singleton word positions and allowed plaintext set A/I/O, not known values. Test all 58 seeds on each native record satisfying that grammar. All plants retain true seed; WELCOME (3 singletons) and KOAN1 (13) uniquely recover every seed (116/116), and their fixed quadratic wrong-law controls retain no seed. Other native records have zero/one singleton and cannot identify seed; their wrong-law controls also survive. The separate two-exact-anchor oracle identifies all tested seeds. One native record jpg107–167 includes a genuine single-rune T outside A/I/O and is excluded from that conditional calibration, demonstrating that the singleton assumption is not universal. Native donor source records are independently preserved external solved GP transcriptions.

Apply the literal original singleton mask of 83 sites to all 58 seeds under this one fixed law, with both A/I and A/I/O. Whole-book continuous (12,956 original GP runes): **zero** seeds for either grammar. Independently restarting at the nine actual decorated chapter boundaries also leaves zero seeds in each of the first eight chapters. Only terminal p54–55 (308 runes, two singleton anchors) has one seed under both grammar sets: encoded seed 45, i.e. (s,u)=(22,1). Freeze that seed from singleton constraints alone and assess the remaining original printed complete words of length≥3 against the pre-existing native solved lexicon. **0 of 53 words, 0 of 284 rune positions** match; the output begins AEOXTLAWOEOPTHNGOETHUJEAAEYTNEOHBAEJ… and is not coherent. This is a separate long-word diagnostic, not a language-selected seed. Requiring ordinary native prose is a conditional test, not a proof that every possible grammar is impossible.

## Decision

This is an executable two-channel model with a truly recoverable bit update, so width-channel state need not be intrinsically lossy. However the width chart alone supplies neither this sender nor its initial/terminal state. Its fixed law fails on the original book, even granting independently free chapter seeds, and its singleton-selected terminal exception predicts no coherent independent longer words. Do not tune the step or introduce arbitrary masks/tables. No original key or plaintext recovered. The known p56 F-transparent cipher is a different law, not asserted to be this ordinary-clock model.

[SFT](../sims/agent47_width_bit_state_sft.cjs) · [executed outcome](agent47-width-bit-state-output.json). Exact core executed under connected V8; standalone Node wrapper not independently run.
