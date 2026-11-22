# Authenticated Atbash and prime-totient with literal-F skip: original LP2 gate

**Agent13, 18 November 2026. Classification:** a bounded original-cipher negative for one explicitly ordered composition of two historically demonstrated operations. **No unknown LP2 plaintext, key, destination, or new cipher mechanism was recovered.**

## Intended human route and its objection

In solved LP1, Cicada used the 29-symbol GP Atbash reversal. Solved LP2 p56 uses the advancing totient-of-primes GP29 key with an authentic exceptional rule: **plaintext F (GP index 0) emits literally and consumes no prime**. In the original p0 visual, an inverted cross might prompt a human to consider reversal before arithmetic decoding. Test the economical composition **Atbash the printed ciphertext first; then apply the exact p56 prime-totient inverse**. The strongest objection is that no original signed instruction says to compose these tools or assigns this transformation to any LP2 chapter. The test is a falsifiable source-anchored receiver, not an author-attributed cipher.

The unmodified complete original runes come from `resources/liber-primus/lp2-corpus.json`. For GP rune `C`, let `A(C)=28-C`. For each prime cursor `k` and sign `s∈{-1,+1}`, a consuming step proposes `P=(A(C)+s(prime[k]-1)) mod29` and advances `k`. If proposed `P=F`, the consuming branch is **forbidden**, because the authentic encoder would instead emit literal F. When `A(C)=F`, also permit a genuine F-literal branch leaving `k` unchanged. This explores **all** F-bypass decisions without silently interpreting every ciphertext F as a literal F. All 55 physical rune pages are preserved; original p50 has no runes. Clock resets at the nine source-visible chapter boundaries. Each sign starts with every 0-based prime index from 0 through 4,999 inclusive.

## Actual untouched original outcomes

| Original chapter | Source runes | Complete legal inverse starts, sign - | Sign + |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | 0/5000 | 0/5000 |
| p3–7 | 1,145 | 0/5000 | 0/5000 |
| p8–14 | 1,729 | 0/5000 | 0/5000 |
| p15–22 | 1,903 | 0/5000 | 0/5000 |
| p23–26 | 1,021 | 0/5000 | 0/5000 |
| p27–32 | 1,433 | 0/5000 | 0/5000 |
| p33–39 | 1,680 | 0/5000 | 0/5000 |
| p40–53 | 3,008 | 0/5000 | 0/5000 |
| p54–55 | 308 | **27/5000** | **28/5000** |

For the eight longer chapters, **the exact finite-state receiver has no complete legal plaintext path**, without invoking an English dictionary or linguistic score. Their deepest partial legal paths reach at most 450, 644, 593, 602, 575, 673, 648 and 440 runes respectively across either sign, all shorter than their actual lengths.

For original p54–55, exhaustive enumeration of every legal F decision on every surviving start yields **288 full outputs for sign - and 203 for sign +**. Their best GP29 indices of coincidence are **0.0371420111** (start 4858) and **0.0368881932** (start 4992), versus **0.06270997** for the original clear 95-rune p57 control. Both winners remain visibly nonsensical GP transliterations; neither is an authenticated unknown-page plaintext. These short outputs alone cannot exclude every possible non-English register, but no legitimate native-GP prose is evident.

The independent positive control recreates the original solved **p56 85/85 source ciphertext** from known plaintext using the actual prime-totient and plaintext-F rule. Artificially Atbash-encoding that authentic ciphertext and applying the proposed two-operation inverse recovers **all 85/85** known source-native plaintext symbols. This establishes correct handling of the genuine F exception. The negative conclusion therefore depends on the untouched ciphertext, not on an incorrect rigid-F decoder.

## Decision

Retire **Atbash-before-prime-totient with the historical plaintext-F bypass, all 5,000 tested starting prime indices, either arithmetic sign and chapter resets** as a plausible full-book decoder. The final chapter's formal paths are insufficient and show no credible native-language plaintext. The original work does **not** exclude a different Atbash placement, independently sourced non-prime key, unknown chapter-dependent operation, or an authored exception wider than plaintext-F. Those require their own source clue rather than tuning starts on this failed composition.

**Reproducer:** [Windows Node.js 22 single-file test](../sims/lp2_atbash_primephi_fskip_5000starts_sft.cjs), read-only, with full exact branch enumeration and solved-p56 positive. [Passing Windows workflow run 44284968012](https://github.com/FlareZ123/liber-primus/actions/runs/44284968012).