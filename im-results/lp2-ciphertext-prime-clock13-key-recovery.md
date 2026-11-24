# LP2 ciphertext-prime-weighted period-13 key recovery (#2552)

## Model and necessary key constraints

Use native zero-based GP29 indices, exact printed rune order, no F bypass, and
(C_i=P_i+K_{j_i}\pmod{29}), (j_{i+1}=j_i+\operatorname{GPprime}(C_i)\pmod{13}).
Initial phase zero is without loss for arbitrary key slots. This is a conjectural
public clock, distinct from the plaintext-prime latent clock of #2544.
The exact original transcription yields 12,956 runes and 83 complete singletons;
words crossing physical page boundaries are carried.

For each phase, intersect the possible shifts C−P from each singleton under
P∈{A,I} (or the sensitivity set {A,I,O}). The whole-book continuous key has empty
domains at all 13 phases under either alphabet. Even independently keyed
continuous chapters 3–7, 8–14, 15–22, 23–27, 28–32, 33–39, 40–53 are impossible
under both singleton alphabets. For instance, global offsets 1025 and 1250
in p3–7 occupy the same chapter-local phase 10, with ciphertext indices 7 and
27; their difference 20 is impossible between A/I/O.

For each k=1,2,3, exhaust all k-element plaintext symbol sets S. The exact
maximum attainable count of symbols in S is the sum, over phases j, of the
maximum of sum_{s∈S} H_j[(s+K_j) mod29], over singleton-compatible K_j.
Maximize that sum over S. This bounds the sorted top-k plaintext mass for
every surviving key. With A/I domains, p0–2 gives 58/104/142, below every one
of 79 length-matched native windows (minima 92/162/217). p54–55 gives
38/60/80 versus minima 30/56/80 in 1,141 native windows; four WELCOME windows
at offsets 25–28 meet all three bounds. This is a reference-register
comparison, not an all-English theorem.

## Constructive prediction

Freeze p54 (232 runes) as training, p55 (76 runes) as untouched prediction.
The crossing word is omitted from both lexical scores, not from the rune
model or forward replay. Build sparse key assignments from dictionary words
occupying at least six distinct phases; intersect anchor pairs with at least
two shared slots and at least eleven jointly covered slots. Fill remaining
slots from the top four unigram shifts. Add the unigram optimum and 64 seeded
random ranked starts. Rank by smoothed native trigram likelihood plus twice
the length of each exact dictionary hit of length >=3; coordinate-ascend
the best 24 starts for at most 12 sweeps. The original dictionary has 28,673
distinct GP forms before native augmentation. Training unigram/bigram/trigram
smoothing constants are 0.5/0.3/0.1. The native control target is excluded
from both language estimation and native dictionary augmentation.

Four independent native plants, each 308 runes with different hidden keys
and an identical 232/76 split, recover all 13 slots and all 304 held-out
runes, with exact forward replay. Their withheld scores are −2.62608,
−2.59443, −3.22585 and −2.62942 nats/rune; complete word matches are
17/17, 20/20, 16/16 and 21/21.

Original p54 produces eight sparse anchors, 837 eligible hash lookups,
zero compatible near-complete anchor joins, and 65 starting keys.
The training winner is [0,22,4,27,9,12,14,27,26,25,2,26,26] with objective
−760.6274; the runner-up is [0,0,0,10,4,25,16,27,15,0,11,26,10]
with −762.5549. The winning training prefix has 9/49 complete-word
matches and zero >=4-rune matches. The frozen p55 prediction has
−3.673137 nats/rune, 1/16 complete words and zero >=4-rune matches.
Native rendering:

    JNGXX BL COE OIANYFNG OCSSLT JF BOWTPNGCHTINGIAT OEGJFEAIA LJFW XOE THLIARNGIS AEBOBCLO BAE WUPMLF UXEA BOEP

The key re-encrypts all 308 runes exactly, as any key in this reversible
family necessarily does. It is not a recovered original key.

## Decision

Exclude the declared whole-book and seven independently keyed chapter
models conditional on intact native singletons. The p0–2 reference capacity
failure is empirical; the p54–55 predictive failure is a finite-candidate
result, not an exhaustive exclusion of every chapter-private key.
No unknown LP2 plaintext follows. Do not tune the weight or reset after
this negative holdout without an independent source selector.

[Executable CommonJS SFT](../sims/lp2_ciphertext_prime_clock13_key_recovery_sft.cjs) ·
[Raw executed result](lp2-ciphertext-prime-clock13-key-recovery-output.json) ·
[Initial code/result commit](https://github.com/FlareZ123/liber-primus/commit/567930af6871b1a5a8754590c2a62baee0b6d6eb).
Executed on actual repository inputs in the connected JavaScript runtime.
