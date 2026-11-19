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

This empirical manuscript control is independent of the synthetic 29^4 null and makes the selected receiver exceptional under the exact source-derived inverse.

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

This result is substantially stronger than the earlier packet-dependent WILL note and supersedes that interpretation.

Its strongest points are:

- authenticated YOU supplies the p50 address;
- the original cell's literal token \`2L\` predicts the next signed word WILL;
- the same token uniquely selects base60/zero among the four charged numeric receiver modes when complete-word geometry and word length are required;
- p28 independently supplies the complete DH23 state;
- the source-state key gives exact WILL and exact re-encryption;
- the full DH-state family has one target hit;
- the exact key hits an authenticated target at exactly one of 524 four-rune words across all unsolved LP2 pages;
- the complete GP29 ciphertext null shows the selected ciphertext lies in the roughly 0.86% covered subset;
- recovered WILL prospectively predicts the next authenticated word BE through the p50 graph.

The remaining uncertainty is local intent. No recovered first-party instruction explicitly says to read a token such as \`2L\` simultaneously as a letter-count clue and a base60 receiver. The finite source family sharply constrains that interpretation, while the mechanism still requires independent reproduction or another untouched continuation before promotion to authoritative plaintext.

## Reproduction

Run:

\`\`\`text
node sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs
\`\`\`

The SFT uses only committed original/source artifacts. It exhausts the adjacent signed-word selector family, reconstructs the p28 DH23 tuple, performs the WILL inverse and forward encryption, charges all 686 DH-state keys, enumerates all 707,281 four-rune ciphertexts for the exact null, and audits the WILL -> BE table-walk holdout.
