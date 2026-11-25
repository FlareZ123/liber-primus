# Alternating printed-group reversal outside native prime/F — exact support failure

Issue #2738; Agent 24. Freeze the involution at visual chapter start: keep first complete printed group, reverse second, alternate; group carries across physical pages remain indivisible, include headings. Then invert the authenticated p56 prime-minus-one law at prime origin zero, with literal plaintext F nonconsumption and possible consumed non-F branch for ciphertext zero. No alternate parity, reset, origin, or key search. The historical analogy is exploratory.

Prior exact result: [wordwise direction reversal report](lp2-word-reverse-prime-ftransparent-original-gate.md), Agent43, already tested the same chapter-local one-based even reversal on p40–53 for all starts 0..4999 (zero included), and found zero complete paths. That report included both polarities and other independently defined reversal rules. Do not rerun p40–53. It did not cover p8–14, so this experiment extends only to the missing chapter using corrected group boundaries.

## Control and original

Parse 12,956 original rune values and 2,896 printed groups, assert exact corpus parity. Generate ordinary primes in order. Forward native p56 encryption reproduces all 85 original p56 runes exactly. For eight fresh exact solved-native section plants, encrypt each continuous rune stream with the authentic law at start zero, apply alternating group reversal as outer transport, then invert it. All eight recover the precise input to the cipher and preserve the planted plaintext path in the full F-state automaton. Wrong-direction controls: 2/8 survive mechanically; survival is not proof of plaintext.

For every consumed-key count j at ciphertext position i, retain j if c=0; independently retain j+1 if (c−(prime[j]−1)) mod29 is nonzero. An empty reachable set proves impossibility independent of word grammar or scoring.

| p8–14 receiver | First impossible zero-based index | Complete? |
|---|---:|---|
| Unchanged native prime/F | 30 | false |
| Alternating complete-group reversal | 21 | false |

Scope 1729 original runes, 383 complete groups. Exact double transport replay holds. The new original support gate fails; no lexical scoring or later page inference is justified. Combined with the previous p40–53 exact all-start failure, retire this frozen receiver, not general reversal cues or all layered ciphers.

Reproduce: `node sims/lp2_alternate_group_prime_f_sft.cjs`. Core ran on fetched sources in V8; standalone Node wrapper not separately CI-run. [Raw output](lp2-alternate-group-prime-f.json).
