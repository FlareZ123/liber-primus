# Previous-plaintext-clause GP sum as a consecutive-prime cipher origin

**Agent35, 24 November 2026. Exact conditional original-cipher exclusion with planted native inverse controls.** No unknown LP2 plaintext.

## Model and source motivation

The authentic 2013 COUNT/Parable checksum gives prime-weight sums of clauses; LP1 WARNING explicitly protects both words and their numbers, and many known instruction/WISDOM bodies have prime sums. Original p15 independently uses prime ordinals. The solved p56 cipher uses consecutive prime-minus-one shifts with a transparent plaintext-F/no-advance clock. These ingredients motivate (but do not authenticate) a clause-fed numerical autokey distinct from #2634's full previous clause as literal cyclic key and the prior previous-word-sum clock.

For each plaintext unit P, the next unit starts at one-based prime ordinal S=sum(chart-prime(P)), and consumes shifts prime[S+j]-1 modulo29. A plaintext F emits F and does not consume; any other plaintext index adds its shift and advances. Physical punctuation cuts are fixed to the corrected transcript's . / & / $ separators; line/page wraps do not reset. Chapters independently initialize. S may be composite; no prime-valued-body condition is assumed on original unknown text.

## Complete inverse

For a candidate S, a clause has an ordinary branch only when (C-shift) mod29 is nonzero, and a transparent branch only at ciphertext F. Backward memoization over (physical position, consumed count) removes dead subtrees. Enumerate every legal branch, aggregate exact path counts by output GP sum, and propagate this sum as the only next-clause state. To score, retain the maximum reset-at-clause trigram score per incoming/outgoing sum pair and Viterbi across clauses; source training excludes each native control target. This is exact for the chosen additive scoring model and complete for legal path support.

For originals, omit the first unit entirely and grant every possible preceding sum from 2L through109L (a superset for its actual length L). Thus failure in the remainder is independent of any private first seed, lexicon or scoring. Source chapters cover exactly all 12,956 original runes.

| Physical pages | Last tested unit (zero-based) | Complete body paths | Terminal sums |
|---|---:|---:|---:|
| 0–2 | 8 | 213 | 21 |
| 3–7 | 7 | 0 | 0 |
| 8–14 | 11 | 0 | 0 |
| 15–22 | 8 | 0 | 0 |
| 23–26 | 5 | 0 | 0 |
| 27–32 | 10 | 0 | 0 |
| 33–39 | 9 | 0 | 0 |
| 40–53 | 22 | 0 | 0 |
| 54–55 | 1 | 6 | 6 |

Seven chapter suffixes are impossible even after granting arbitrary first-unit contents. On the two survivors, exact MAP scores are −3.61647 and −3.59064 nats/scored rune; output is nonprose. Enumerate all compatible first-unit inverses with any initial prime origin in 1–3301. Of 113 p0 heading paths (111 initial origins), **zero** have even one of the two 8+5 printed groups in the 36,718-form GP register. On p54, ten paths remain but none has a lexical 8-rune group after its first singleton. Therefore both remaining chapters fail the declared intact-group/finite-lexicon heading model even with every hidden first origin in that range. No arbitrary origin beyond 3301, OOV heading or different boundary grammar is excluded by this lexical subtest.

## Constructive native plants

- LP1 WARNING, initial ordinal3301. Train all other solved sections; enforce only primality (not exact sums) of its nine body clauses. Fit the heading and first five bodies, then freeze output sum 769. The body has no errors; the 6-rune heading/initial origin are ambiguous (30 complete prefix paths, same state; top incorrect seed1494). The four untouched following clauses recover **87/87** runes exactly; the full body is 178/178. This is body/state recovery, not exact initial key identification.
- LP1 LOSS OF DIVINITY, initial ordinal1033. No prime predicate, target excluded from training. Fit first eight units, recover actual hidden seed1033 and exact prefix with next state547; frozen-state prediction recovers **460/460** held-out runes, and full 755/755. Exact forward replay for both controls.

## Decision

Retire this particular clause sum → prime ordinal → consecutive-prime F-hold model with original cuts. The successful native plants demonstrate the constructive inverse and distinguish its initial-key ambiguity from state recovery. They do not authenticate the new cipher family. Do not generalize to other clause-fed functions, altered framing, arbitrary origins beyond the lexical subtest, or a universal prime-clause constraint.

Reproduce: `node sims/lp2_prevclause_primeindex_fhold_sft.cjs`. Full exact experiment was executed against connected repository inputs; final single-file wrapper is an equivalent implementation and no separate CI run is claimed.

## Stronger relaxation: independent private origins

Even granting independent private prime origins 1–3301 to every original punctuation unit of at least 50 runes, the exhaustive scan has 255,182 complete inverses across 93 units; the 375-rune unit 16 of chapter p15–22 has none. Maximum intact-group lexical rune coverage is 13/53 (24.53%); best trigram −3.34671 nats/scored rune is nonprose. Five section-excluded native plants recover all five origins with 14 total rune errors, and authentic p56 recovers origin 1 with six errors, demonstrating key selection but imperfect path selection. This is a finite independent-origin negative, not a rejection of all prime streams. [Machine results](lp2-private-clause-prime-origin-scan.json).
The same reproducer emits the full enumeration and controls; the exact connected-JS execution was completed. No further recurrence variants over this same origin/cut model are warranted.
