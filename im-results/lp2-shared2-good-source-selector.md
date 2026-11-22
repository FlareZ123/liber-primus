# Shared2 uniquely preselects authenticated GOOD before the p2 receiver

**Agent12, 18 November 2026. Classification: retrospective source-selection advance.** The independently reconstructed DH shared value `K=2` uniquely selects GOOD from the authenticated 2016 vocabulary under an exact next-index equation, after which the frozen GP0/p50 grammar lands on the existing prospective p2 receiver. The equation was noticed after GOOD had already been proposed, so it strengthens the causal route without authenticating plaintext.

## Source selector

Index the 43 alphabetic words of the authenticated 2016 message from zero. For each word with a successor, test the literal integer equation

```text
GP0(word) + K = index(next word)
```

with the independently reconstructed DH shared value `K=2`.

There is exactly one hit:

```text
GOOD: GP0=35
35 + 2 = 37
index(LUCK)=37
```

None of the other reconstructed DH23 values `5,6,8,15,19,23` gives an exact hit in any of the 42 source adjacencies. Reducing only modulo29 is weaker because NUMBERS becomes a second residue hit. The exact integer relation is the selective statement.

## Receiver chain

Apply the already frozen navigation grammar to the source-selected GOOD:

```text
GOOD -> GP0 35 -> p50[35]=39
     -> p2 word9 ends exactly at local offset39
     -> receiver length4 = GP rune length(GOOD)
     -> receiver ciphertext GP0=37 = index(LUCK)
     -> p50[37]=80
```

The existing exhaustive receiver-family census across p0-p55 already shows that exact receiver endpoint, equal length, receiver GP0 equal to the next source index, and byte80 leave only p2 GOOD/LUCK.

This changes the causal order: shared2 selects GOOD first, then the unchanged table grammar finds the receiver. The original receiver sum37 exceeds `GP0(GOOD)=35` by exactly `K=2`.

## Exact local reflection-pair inverse candidate

A later exact-value candidate now exists for the same four original runes. Horizontal reflection pairs a four-rune key as outer `(k0,k3)` and inner `(k1,k2)`. Using four independently source-derived state values, impose `outer sum=-K=-2`, `outer difference=NG=21`, `inner sum=vertical signed-ray magnitude=4`, and `inner difference=DH modulus p=23`. Over GP29 this uniquely solves to `[24,28,5,3]`, and

```text
U TH H Y - A EA C O = G O O D
```

with exact forward reconstruction. Across all 384 signed assignments of the four selected residues to the four pair slots, this is the only GOOD hit; an expanded 126,720-assignment state pool has four hits, all residue-equivalent via `-8=21` and `-6=23`.

The open defect is causal ordering: no first-party clue yet assigns those four state values to those four sum/difference slots. The candidate was formulated after GOOD was known, and repeating the key on the next p2 word does not yield LUCK. Treat it as an exact reversible candidate, not authenticated plaintext. [Report](lp2-p2-good-reflection-pair-key.md) · [SFT](../sims/lp2_p2_good_reflection_pair_key_sft.cjs).

## Evidentiary boundary

The original p2 ciphertext is `U TH H Y`; conditional GOOD is `G O O D`. This result supplies a source-selected word-level checksum and vocabulary choice, but no letterwise inverse. Direct additive DH, prime/totient, half-turn, low-degree coordinate, monoalphabetic word, and small linear-feedback consumers tested in this invocation did not reproduce the four rune values.

Because the equation was recognized after GOOD was already known, it is retrospective. A decisive promotion still requires a reversible operation fixed before the four plaintext runes are read, or a fresh receiver predicted from the same exact K-selected source grammar.

Reproducer: `sims/lp2_shared2_good_source_selector_sft.cjs`.
