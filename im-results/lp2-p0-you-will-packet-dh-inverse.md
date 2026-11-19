# P0 141..144: source-constrained WILL recovery from authenticated YOU and p28 DH23

**Agent9, 19 November 2026. Classification: strong source-constrained local plaintext candidate. The selected p50 cell carries a literal clue that transfers on solved Liber Primus plaintext, locally selects both the next signed word and one numeric receiver interpretation, and feeds a key derived from the independent p28 literal-DH line. This result does not revive a global p50-numeral -> LP2-offset architecture.**

## Decision

Retain **WILL** as a strong local plaintext candidate for p0 offsets **141..144**.

The complete route is:

\`\`\`text
authenticated YOU
  -> GP0(YOU)=30
  -> p50 cell30 = literal token 2L

literal reading:
  2L predicts two Ls in the next authenticated word
  next signed word = WILL

numeric reading:
  base60(2L)=141
  zero-based p0 offset141 is a complete four-rune word
  WILL has four GP runes

independent p28 DH23:
  p=23, g=5, a=6, b=15, A=8, B=19, K=2

key:
  [K*a, a, H(A,B)]
  = [12,6,18,27]

cipher:
  [19,16,9,18] - [12,6,18,27] mod29
  = [7,10,20,20]
  = WILL
\`\`\`

Exact forward reconstruction returns the original four ciphertext runes.

A prospective downstream check also succeeds:

\`\`\`text
GP0(WILL)=57
p50/base60: 57 -> 118 -> 35
GP0(BE)=35
\`\`\`

**BE** is the authenticated word immediately after WILL. A complete adjacent-word census described below makes WILL -> BE the sole two-hop base60 hit.

## Architecture correction after Director #1725

Director task #1725 tested the broad coercion:

\`\`\`text
p50 numeral -> conventional base60 integer -> LP2 rune offset
\`\`\`

on solved/source controls. It failed transfer and lacked first-party support. The repository therefore rejects that rule as a general architecture.

This report uses a narrower source-selected event.

The authenticated word **YOU** supplies p50 address30 through the independently retained whole-word GP0 -> p50 address primitive. Original cell30 is visibly:

\`\`\`text
2L
\`\`\`

The same untouched token is evaluated in two ordinary ways before any p0 decryption:

1. its literal digit-letter form is tested against the next authenticated signed word;
2. its conventional base60/base59 numeric readings are charged with zero/one origin and must land on a complete p0 word whose rune length matches that next signed word.

The token itself therefore supplies a local discriminator that the failed global offset family lacked. This result authorizes no other p50 numeral as a text offset.

## Solved Liber Primus control for 2L

The literal interpretation of \`2L\` now has an independent solved-text control.

Across the solved Liber Primus plaintext corpus, **YOU occurs 22 times**. Three of those occurrences are followed by **WILL**. For every occurrence, GP0(YOU)=30 addresses the same original p50 token:

\`\`\`text
p50[30] = 2L
\`\`\`

All three solved YOU WILL adjacencies therefore realize the same literal relation used by the signed carrier:

\`\`\`text
YOU -> 2L -> WILL contains two Ls
\`\`\`

Charging every solved plaintext adjacency with a positive digit+letter token gives 34 literal matches in total, mostly digit1 cases. Requiring a nontrivial digit of at least2 leaves four occurrences:

\`\`\`text
YOU -> WILL -> 2L
YOU -> WILL -> 2L
DEEP -> WITHIN -> 2i
YOU -> WILL -> 2L
\`\`\`

Thus there are only two distinct solved nontrivial word-pair relations, and **YOU -> WILL** is one of them. The authenticated 2016 message independently repeats that exact pair.

This control authenticates the literal \`2L\` reading as a transferable source relation. It does not by itself authenticate interpreting base60(2L)=141 as a p0 offset; the compound local selector below supplies that additional discrimination.

## Complete YOU/2L selector family

Charge every adjacent pair in the authenticated 2016 signed message.

For each current word:

1. take its canonical GP0 as a zero-based p50 address;
2. require the original p50 token to have positive digit+letter form;
3. require the digit to equal the number of occurrences of that letter in the next signed word;
4. interpret the same token under base60/base59 and zero/one origin;
5. require the result to be exactly a p0 complete-word start;
6. require the selected p0 word length to equal the next signed word's canonical GP rune length.

There are 42 signed adjacencies. Thirty-four have a positive digit+letter token at the current word's GP0 address.

The literal count test alone has two hits:

\`\`\`text
ITS -> 1O -> WORDS has one O
YOU -> 2L -> WILL has two Ls
\`\`\`

After the numeric receiver and word-length requirements are applied across all four radix/origin modes, exactly **one** compound hit remains:

\`\`\`text
YOU -> p50[30] = 2L -> base60/zero 141
p0 offset141 = zero-based word32, length4
WILL = four GP runes
\`\`\`

For the selected token:

| reading | resulting p0 position | receiver status |
| --- | ---: | --- |
| base60 / zero | **141** | **start of word32, length4** |
| base60 / one | 140 | interior of preceding length6 word |
| base59 / zero | 139 | interior of preceding length6 word |
| base59 / one | 138 | interior of preceding length6 word |

Thus this local source token selects both the conventional radix and zero-offset interpretation.

## Independent source-derived DH23 key

The value-changing key no longer depends on the conditional READOUT packets.

Physical p28 has one manuscript line whose first fragment is literally **DH**. The independent p28 source reconstruction gives:

\`\`\`text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
\`\`\`

from that line's visible fragments, line number, fragment count, and the already fixed reversible operation:

\`\`\`text
H(x,y)=(x-y,x+y) mod29.
\`\`\`

The standard Diffie-Hellman equations verify the tuple exactly.

The source line exposes the key structure directly at its tail. The penultimate fragment has outer-H output `[23,12] = [p,K*a]`, while the final fragment has outer-H output `[8,19] = [A,B]`. The physical line number supplies `a=6`.

The WILL key is then the compact source-state expression:

\`\`\`text
K*a mod29 = 2*6 = 12
a = 6
H(A,B) = H(8,19) = [18,27]

key = [12,6,18,27]
\`\`\`

No packet lookup or p50 text-offset assumption enters this key derivation.

## Exact inverse

The source-selected p0 receiver is:

\`\`\`text
p0[141..144] = [19,16,9,18]
\`\`\`

Subtract the source-state key:

\`\`\`text
[19,16,9,18] - [12,6,18,27] mod29
= [7,10,20,20]
= W I L L
\`\`\`

Re-encryption is exact:

\`\`\`text
[7,10,20,20] + [12,6,18,27] mod29
= [19,16,9,18].
\`\`\`

## Cross-object 2L-to-DH key check and ordinal alignment (Agent6 independent reproduction)

The selected p50 token carries an additional consistency relation with the independently reconstructed p28 state:

- The authenticated 2016 message has 43 words. **YOU** is zero-based word index32, and it is followed by **WILL**.
- GP0(YOU)=30 selects p50 cell30, whose literal token is **2L**. The token is duplicated at p50 cells30, 133, and241, but among all 43 signed-message words only YOU's GP0 address selects any of those occurrences.
- The p28 line6 outer-H values independently give H(D,H)=[b,K]=[15,2] and the penultimate fragment [p,K*a]=[23,12], with a=6 from the one-based line number.
- Under conventional A1Z26, L=12. Thus the selected token's two characters match **[K,K*a]=[2,12]**. Since K=2 is invertible modulo29, the token recovers a=12/2=6, matching the p28 line number. This cross-checks the first two components of the proposed key [K*a,a,H(A,B)] before the p0 inverse.
- The same base60/zero interpretation of 2L gives offset141. That is p0 word32, so the selected p0 word has the same zero-based ordinal as YOU in the signed message. Across all 43 signed-message word positions and all four base59/base60 × zero/one modes, the only same-ordinal receiver is YOU→p0 word32 under base60/zero. It is also the only compound receiver satisfying the positive digit-letter count and next-word GP-length conditions.
- WILL contains exactly two Ls; the selected p0 word has four GP runes; subtracting [12,6,18,27] gives WILL and exact forward replay.

This is a new cross-object constraint, not an authentication of the A1Z26 convention. A1Z26 is ordinary and human-accessible, but no recovered first-party instruction yet requires it here. The token 2L also has three occurrences in p50, so the selector is the signed word YOU→GP0 address30, not global uniqueness of the token. The new SFT checks the complete finite source family and preserves these caveats.

Reproduction: `node sims/lp2_p0_you_will_dh_token_crosslink_sft.cjs`.

## Charged DH-state family

To avoid preserving a key formula only because it yields the desired word, charge the same form over the complete seven-field DH state.

For every DH field \`x\` and every ordered DH pair \`(y,z)\`, test:

\`\`\`text
[K*x, x, H(y,z)]
\`\`\`

with both additive signs.

This gives:

\`\`\`text
7 * 7 * 7 * 2 = 686 configurations.
\`\`\`

The target family is every distinct authenticated 2016 word represented by exactly four GP runes. There are nine distinct rune sequences.

Across all 686 configurations, exactly one hits any target:

\`\`\`text
x = a
(y,z) = (A,B)
sign = subtraction
key = [12,6,18,27]
target = WILL
\`\`\`

## Manuscript-wide exact-key control

The exact source-derived key is also selective on original unknown-page material.

Apply the fixed key:

\`\`\`text
[12,6,18,27]
\`\`\`

by subtraction to **every complete four-rune word** on all unsolved LP2 pages. Score only against the same nine distinct authenticated four-rune signed-word targets used in the charged DH family.

There are **524** complete four-rune words.

Exactly one decrypts to any authenticated target:

\`\`\`text
p0 word32, offset141
cipher [19,16,9,18]
-> [7,10,20,20]
-> WILL
\`\`\`

No other four-rune word anywhere in p0..p55 hits the target family under this fixed key.

This is fixed-key uniqueness only: it does not establish that the 686-member key grammar is unique across the manuscript. The complete key-by-manuscript cross-product below is the required familywise control.

## Full key-by-manuscript cross-product and blind BE successor (Agent40)

The previous controls separately tested all 686 keys on the selected YOU receiver and the exact selected key on all 524 four-rune words. Those are not the full joint family. The new SFT charges every admitted key against every four-rune word across all unknown pages:

~~~text
524 complete four-rune words × 686 DH-key configurations
= 359,464 word/key combinations
~~~

The authenticated four-rune target vocabulary remains the same nine distinct GP sequences. The complete cross-product has **three** hits, at three distinct ciphertext locations:

| LP2 page | word index | rune offset | authenticated target | key expression |
|---:|---:|---:|---|---|
| p0 | 32 | 141 | WILL | x=a, H(A,B), subtraction → [12,6,18,27] |
| p2 | 28 | 150 | ROAD | x=B, H(g,a), subtraction → [9,19,28,11] |
| p47 | 58 | 270 | LUCK | x=K, H(g,b), subtraction → [4,2,19,20] |

Thus the key grammar is **not globally unique**: it generates two additional authenticated-word hits when every key is tried against every four-rune word. The exact WILL key still hits only p0 word32 among the 524 words, and the combined source selector still has only one authenticated next-word key hit. But the familywise cross-product is broad enough that key-grammar uniqueness alone cannot support plaintext promotion.

The full source-word/receiver census has nine matching-length p0 receiver rows across all 42 adjacent signed-word pairs and four base59/base60 × zero/one modes. Only YOU → WILL also satisfies the positive digit-letter count condition; only that row decrypts to its authenticated next word under the 686-key family. Other matching-length rows include GOOD → LUCK at p0 offset39 and FALSE → PATHS at p0 offset141, but neither satisfies the literal-count condition or yields the corresponding next word under the frozen key family.

**Blind BE successor fails as a value-changing prediction.** Keep the same GP0 source address, base60/zero interpretation, and exact four-symbol key:

~~~text
GP0(BE)=35
p50[35]=0d
base60/zero = p0 offset39
p0 word at 39..42 has 4 GP runes
next authenticated word FOUND has 5 GP runes
~~~

The length gate therefore fails. Applying the frozen WILL key [12,6,18,27] to that four-rune word produces AEJLF, not an authenticated target. The already observed two-hop WILL → BE path reaches p0 word 117..121 of length5, matching FOUND's length, but no value-changing inverse or plaintext is recovered there. This remains navigation only.

**Decision:** retain WILL as a source-constrained crib/candidate with an exact local inverse and a unique compound receiver selector. Do not promote it to established plaintext. Retire the 2L/A1Z26 cross-check and the 686-key grammar as an established key source; they remain unauthenticated supporting hypotheses. The p50 numeric offset interpretation remains local to this candidate and does not become a manuscript-wide output rule.

Reproduction: run the new SFT with node sims/agent40_will_familywise_blind_successor_sft.cjs. GitHub Actions PASS: [run 44441856115](https://github.com/FlareZ123/liber-primus/actions/runs/44441856115).

## Exact GP29 ciphertext null

Configuration uniqueness alone can be misleading. The same frozen 686-configuration family and the same nine signed-word targets were therefore charged against the complete four-rune GP29 ciphertext space.

There are:

\`\`\`text
29^4 = 707,281
\`\`\`

possible four-rune ciphertexts.

The frozen family reaches at least one signed target for:

\`\`\`text
6,094 / 707,281 = 0.008616094593238048
\`\`\`

of them.

Exactly one family/target configuration hits for:

\`\`\`text
6,014 / 707,281 = 0.008502985376392127
\`\`\`

of all ciphertexts.

The selected original p0 ciphertext \`[19,16,9,18]\` has exactly one hit, the WILL construction above.

These fractions are exact finite coverage rates for this charged family. They are structural calibration, not authorship probabilities.

## Prospective WILL -> BE holdout

After WILL is recovered, use its number without touching later p0 ciphertext:

\`\`\`text
GP0(WILL)=57
p50[57] base60 = 118
p50[118] base60 = 35
GP0(BE)=35
\`\`\`

BE is the authenticated word immediately after WILL.

Charge every adjacent authenticated signed-word pair, both source-supported radices, and fixed table-walk lengths one through four. The full hit set is:

\`\`\`text
base60, one hop: THE -> DEVOTED
base60, two hops: WILL -> BE
base60, three hops: none
base60, four hops: none
base59, one through four hops: none
\`\`\`

So **WILL -> BE** is the sole base60 two-hop adjacent-word edge in the complete charged family. This downstream check uses p50 as a table graph and does not require a p0 offset interpretation.

## Scientific boundary

The combined YOU/2L receiver selector and the exact WILL inverse remain a strong local candidate, but the full familywise and blind-successor controls narrow the claim.

Established computationally:

- authenticated YOU supplies GP0 address30 and the literal p50 token 2L;
- across all 42 adjacent signed-word pairs, both live radices and both origins, the complete-word-start, next-word-length and literal-count conjunction selects only p0 word32 at offset141;
- p28 line6 independently supplies the DH23 state, and the frozen source-state key [12,6,18,27] subtracts from the selected ciphertext to WILL with exact forward replay;
- the exact fixed key hits only one of 524 complete four-rune words;
- the 686-key grammar has one hit on the selected YOU receiver, but its full 686 × 524 manuscript cross-product yields three authenticated-target hits: WILL, ROAD and LUCK;
- the direct BE successor fails the same-length gate and the frozen key outputs AEJLF; the two-hop WILL → BE → FOUND path is navigation only, with no FOUND plaintext or key recovered.

The remaining uncertainty is mechanistic and authorial. No recovered first-party instruction explicitly says to read 2L simultaneously as a letter-count clue and a base60 receiver, or to assemble the key as [K*a,a,H(A,B)]. The A1Z26 reading of 2L is an unauthenticated cross-check, not an established key source. The key grammar is not globally unique, and its blind BE successor does not decrypt. Therefore **WILL remains a source-constrained crib/candidate, not established unknown-page plaintext**. Do not generalize p50 numerals to LP rune offsets.

## Reproduction

Run both SFTs:

~~~text
node sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs
node sims/agent40_will_familywise_blind_successor_sft.cjs
~~~

The original SFT exhausts the adjacent signed-word selector family, reconstructs the p28 DH23 tuple, performs the WILL inverse and forward encryption, charges all 686 DH-state keys on the selected receiver, enumerates all 707,281 four-rune ciphertexts for the exact null, and audits the WILL → BE table-walk holdout. The Agent40 SFT additionally charges all 686 keys against all 524 four-rune words and tests the fixed BE successor without changing the selector or key grammar.
