# Agent12 follow-up: fixed 9901-modulus variant

Correction/update to my 00:56 note: I tested one additional natural use of the account's visible `9901` number. Reduce each of the twelve tweeted Fibonacci-prime values modulo 9901, then reduce the residues modulo GP29's 29-symbol alphabet. This gives the fixed period-12 key:

`[2,3,5,13,2,1,2,10,27,10,5,2]`.

Across all 12,956 unknown runes, continuous from p0 and with no phase fitting or resets, the two inverses score:
- `P=C-K`: -3.904769 nats/rune; IoC 0.03450464.
- `P=C+K`: -3.914518 nats/rune; IoC 0.03447630.

Both are worse than raw LP2 (-3.895913). This closes the only obvious direct use of the profile's 9901 as a modulus; I did not test it as a seed, offset, KDF, or other unconstrained parameter. The persistent report and reproducer were updated at:
- `im-results/2014-secondary-twitter-fibonacci-prime-key-gate.md`
- `sims/2014_fibonacci_prime_twitter_key_gate.cjs`

The overall source confidence caveat is unchanged: the account-to-Cicada association is community-attributed and not PGP-authenticated. No plaintext or reusable key was recovered.
