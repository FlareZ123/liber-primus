# Latent-cut moving-escape rank28 inventory gate

Agent43, 26 November 2026. No unknown LP2 plaintext or recovered authentic key.

## Scope

The earlier [contextual escape rank28 gate](lp2-contextual-escape-rank28-lexical-gate.md) used printed word boundaries. Here remove those boundaries entirely, preserving only the global original length inventory and rune order. The original's rare adjacent repeats motivate a nonrepeating successor rank mechanism; this does not establish a particular historical encoding.

For each candidate word independently grant arbitrary escape E at every internal position, arbitrary first plaintext rune, and a private invertible affine decoder on discrete-log ranks modulo 28:
- D=(C[j]-C[j-1]) mod29.
- D=0: any plaintext rune P[j] is possible (choose E=P[j]).
- D!=0: r=(a log_15(D)+b) mod28, where gcd(a,28)=1. P[j] must be r or r+1, realized by choosing E respectively greater or smaller than P[j].

All 336 affine rank keys are included. Changing primitive roots merely changes the unit multiplier and does not expand this set. The escape sequence is unconstrained, so this is an envelope over every state law which chooses only E. It does not cover a general arbitrary 28-symbol permutation or within-word rank-key updates.

## Actual computation

Build a suffix trie of the same permissive 36,612-form register used in the [latent polynomial test](lp2-latent-affine-polynomial-fhold-inventory-gate.md), omitting words shorter than 7 and ignoring the first rune. The trie has 65,492 nodes. For every original contiguous start, traverse the trie under every affine key, branching only over r and r+1 at unequal transitions, or all children at equal transitions. Record whether each length 7–14 has a witness. This is exhaustive over the finite dictionary and the relaxed key/escape model. Original source alignment is exact at 12,956 runes and 2,896 complete printed groups. All 106 solved-native controls of length 7–14 have a witness under their planted affine key; 97 representative witnesses are the original word, the rest are alternate compatible words. Control words are included in the register, so this validates the inverse mechanism rather than blind generalization.

| Length | Original inventory | Matching printed slots | Matching windows at arbitrary starts |
|---:|---:|---:|---:|
| 7 | 216 | 42 | 2831 |
| 8 | 156 | 5 | 306 |
| 9 | 78 | 0 | 24 |
| 10 | 52 | 0 | 2 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |

Of the 187 length-nine-or-longer slots, at most 26 can have compatible vocabulary words, even after all cuts move and every slot uses a distinct secret key and escape sequence. Therefore at least **161 OOV slots (5.56% of all 2,896 words)** are mandatory; the 5% budget is 144. The relaxed family is excluded at that tolerance, independently of any particular escape-selection law or the original printed boundaries. This is not an exclusion of different plaintext length inventories. No new source-selected key follows.

The output includes the first 100 matching original windows with candidate word, affine key and per-position escape values; each replays exactly from its granted initial ciphertext rune. They are incidental local witnesses rather than recovered plaintext. This constructive replay is conditional on the escape sequence; it is not a complete independently keyed manuscript decoder.

[Standalone SFT](../sims/lp2_latent_moving_escape_rank28_inventory_sft.cjs) · [Actual V8 output and source blob SHAs](lp2-latent-moving-escape-rank28-inventory.json). Core executed against original sources and preserved, standalone Node wrapper assembled but not separately executed.
