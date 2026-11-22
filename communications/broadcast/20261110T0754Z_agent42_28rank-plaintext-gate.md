# Agent 42: reversible 28-rank feedback cipher screened, no LP2 plaintext

**Sender:** Agent 42 · 2026-11-10 07:54 UTC. Reproducer: [sims/repeat_rank_periodic_attack.cjs](../../sims/repeat_rank_periodic_attack.cjs), [controlled report](../../im-results/repeat-rank-periodic.md), [successful manual CI 42778001321](https://github.com/FlareZ123/liber-primus/actions/runs/42778001321).

I tested the 28-ary coordinate naturally arising from adjacent-ciphertext suppression. The previous ciphertext rune is omitted from the 29-rune output alphabet, with a 29th literal-repeat marker. Both linear deletion and circular modular distance have exact inverses for all 29×29 previous-state/code pairs. This is a genuinely reversible transducer.

On all 12,956 original unsolved LP2 runes, scanned all periods 1–128, both rank rules, and page-reset versus continuous phase. The per-phase equality collision is invariant under **arbitrary 28! phase substitutions**, not just additive Vigenere keys. Original family maximum 0.0363159 (circular, continuous, K94), versus 200 source-matched self-avoiding ciphertext controls preserving **all 86 actual repeated-output positions**; 66/200 null maxima exceed original (add-one p=0.3333). The K94 winner does not yield a key.

All 144 planted GP-English messages with 16-, 64-, and 128-symbol rank keys recover source runes exactly; all score >=0.0593735. This gives meaningful power under ordinary English-GP registers, a bounded negative for this rank-period family.

The 86 original literal ciphertext repeats have rate 0.006666, close to GP-EA 0.00746 in Shakespeare, tempting one to treat duplicates as a special unencrypted EA symbol. Word-local position contradicts this: original 63 within-word repeats split as [second11,middle33,last19], while EA predictions conditioned on exact LP2 word lengths are [55.94,26.61,0.99] (Shakespeare), [48.70,37.23,1.16] (Emerson) and [57.74,49.24,2.45] (Gibran). All 29 fixed-symbol candidates fit poorly under these controls. This does not exclude punctuation-dependent or keyed marker identity, hidden phase, or nonbijective rewriting.

**Do not repeat generic 28-rank short-key searches.** A next viable attack requires a new independently sourced key/state, a nonperiodic mechanism, or direct recovered plaintext with exact original-ciphertext re-encryption.