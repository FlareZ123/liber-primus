# P0 141..144: source-constrained WILL recovery from authenticated YOU and p28 DH23

**Agent9, 19 November 2026. Classification: strong local crib/candidate, not established plaintext. The authenticated YOU→WILL adjacency and p50 token 2L yield a selective local receiver candidate; the p28 DH state gives a reproducible candidate inverse, but no first-party source fixes the dual token semantics or the four-symbol key schedule. This result does not revive a global p50-numeral -> LP2-offset architecture.**

## Decision

Retain **WILL** as a strong local crib/candidate for p0 offsets **141..144**; do not promote it as established plaintext.

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

## Positive-digit YOU/2L selector subfamily (not the complete literal-token family)

The original p0-local test below deliberately restricts the count stage to positive digit+letter tokens. That is a useful restricted hypothesis, but no first-party instruction says to exclude zero. Its uniqueness is therefore conditional.

Within the positive-digit subfamily, charge every adjacent pair in the authenticated 2016 signed message. For each current word:

1. take its canonical GP0 as a zero-based p50 address;
2. require the original p50 token to have positive digit+letter form;
3. require the digit to equal the number of occurrences of that letter in the next signed word;
4. interpret the token under base60/base59 and zero/one origin;
5. require the result to be exactly a p0 complete-word start;
6. require the selected p0 word length to equal the next signed word's canonical GP rune length.

There are 42 signed adjacencies; 34 have a positive digit+letter token at the current word's GP0 address. The positive-only literal count test has two hits:

~~~text
ITS -> 1O -> WORDS has one O
YOU -> 2L -> WILL has two Ls
~~~

After the numeric receiver and word-length requirements are applied across all four radix/origin modes, exactly one positive-only compound hit remains:

~~~text
YOU -> p50[30] = 2L -> base60/zero 141
p0 offset141 = zero-based word32, length4
WILL = four GP runes
~~~

For this restricted token family:

| reading | resulting p0 position | receiver status |
| --- | ---: | --- |
| base60 / zero | **141** | **start of word32, length4** |
| base60 / one | 140 | interior of preceding length6 word |
| base59 / zero | 139 | interior of preceding length6 word |
| base59 / one | 138 | interior of preceding length6 word |

This is a discriminating local relation, not proof that positive-only tokens are the creator's rule.

### Zero-inclusive receiver census (#1739)

The later full audit admits digit zero and charges both p0 word starts and word ends. Before p0 geometry is opened, exactly five of the 42 source adjacencies satisfy the literal digit/letter-count relation:

~~~text
DEVOTED -> LIBER : 0W, LIBER has zero W
ITS     -> WORDS : 1O, WORDS has one O
YOU     -> WILL  : 2L, WILL has two Ls
FOUND   -> GOOD  : 0s, GOOD has zero s
GOOD    -> LUCK  : 0d, LUCK has zero d
~~~

After both numeral alphabets, both origins, start/end boundaries and next-word length are charged, three logical edges survive:

~~~text
YOU   -> WILL : 2L, base60/zero, p0 start141, length4
FOUND -> GOOD : 0s, base59/one,  p0 end52,    length4
GOOD  -> LUCK : 0d, base60/zero and base59/zero, p0 start39, length4
~~~

The zero-count GOOD -> LUCK edge is a real receiver alternative, not a second decryption under the p28 686-key family. GP0(GOOD)=35 selects p50[35]=0d; both base59 and base60 give offset39. The selected p0 word is ciphertext [8,17,9,27] (HBNIA), a complete four-rune word matching LUCK's length, but none of the 686 admitted DH-derived keys maps it to LUCK. FOUND -> GOOD lands at the end boundary52. The unused DEVOTED -> LIBER edge was sealed before its p0 check and fails: offsets31/32 are interior to p0 word5 (23..33), whose length11 does not match LIBER's five runes.

The exact familywise controls in [the #1739 audit](lp2-found-good-luck-navigation-familywise-audit.md) show a two-edge run in 25/256 intact-token rotations and 11/262 p0 boundary phases. The literal digit-letter rule is therefore **not licensed as a reusable navigation operator**. Preserve the local YOU/2L receiver as a cross-check only; do not claim that it is the unique receiver in the complete zero-inclusive family.

## DH23 state-derived candidate key (key schedule not authenticated)

The proposed inverse does not use the conditional READOUT packet as an input; it uses the independently reconstructed p28 DH23 state. This makes the arithmetic reproducible, but does not by itself authenticate the key schedule.

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

The candidate four-symbol key is then the compact state expression:

\`\`\`text
K*a mod29 = 2*6 = 12
a = 6
H(A,B) = H(8,19) = [18,27]

key = [12,6,18,27]
\`\`\`

No packet lookup or p50 text-offset assumption enters this candidate key formula. However, no first-party source specifies this KDF: the signed 2013 protocol returns K as an integer and does not define a DH-to-GP29 conversion or the composition [K*a, a, H(A,B)]. See the existing [DH-to-GP29 type gate](lp2-readout-dh-adjacent-p0-type-gate.md) and [authenticated 2013 source summary](../resources/external/2013-tcp-server-signed-source.md).

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

The original start-only, positive-digit census has nine matching-length p0 receiver rows; within that restricted family, only YOU → WILL satisfies the literal count, receiver-start and next-word-length conjunction, and only that row decrypts to its authenticated next word under the 686-key family. This is not the full literal-token family: the zero-inclusive #1739 audit admits FOUND → GOOD at p0 end52 and GOOD → LUCK at p0 start39 as additional compound receiver edges. The latter's ciphertext [8,17,9,27] has no LUCK inverse under any of the 686 keys. The older start-only census also lists FALSE → PATHS at p0 offset141, but it does not satisfy the source literal count.

**Blind BE successor fails as a value-changing prediction.** Keep the same GP0 source address, base60/zero interpretation, and exact four-symbol key:

~~~text
GP0(BE)=35
p50[35]=0d
base60/zero = p0 offset39
p0 word at 39..42 has 4 GP runes
next authenticated word FOUND has 5 GP runes
~~~

The length gate therefore fails. Applying the frozen WILL key [12,6,18,27] to that four-rune word produces AEJLF, not an authenticated target. The already observed two-hop WILL → BE path reaches p0 word 117..121 of length5, matching FOUND's length, but no value-changing inverse or plaintext is recovered there. This remains navigation only.

**Decision:** retain WILL as a strong local crib/candidate with an exact inverse, but do not describe the positive-only YOU/2L selector as globally unique. The later p38 state packet independently selects WILL in two output types and reconstructs the exact key before the p0 ciphertext is consumed ([cross-page report](lp2-p38-to-p0-will-crosspage-inverse.md)); this strengthens the local recovery without authenticating a general p50 digit-letter grammar. The zero-inclusive #1739 audit retires that grammar as a reusable router. The 2L/A1Z26 cross-check and the 686-key family remain unauthenticated as a general key source; no manuscript-wide p50 offset rule follows.

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

## Source-selector decision (#1889; Agent4, 19 November 2026)

The first-party materials support a motivated local hypothesis, but they do not specify the complete dual-use token interpretation and key schedule.

**What the sources do support**

- The OpenPGP-signed 2016 message says “Its words are the map, their meaning is the road, and their numbers are the direction” and “Seek and you will be found.” It contains the adjacent words **YOU → WILL**. GP0(YOU)=30 selects original p50 cell30, visibly **2L**. The literal reading “two Ls” matches WILL, while base60/zero value141 selects p0 word32, whose four-rune length and ordinal match WILL/YOU. This is the only hit in the restricted positive-digit, p0-word-start subfamily, not the complete literal-token family: the zero-inclusive #1739 audit finds three compound edges (YOU→WILL, FOUND→GOOD, GOOD→LUCK) and familywise controls retire the literal rule as a reusable router. The p38 packet later selects WILL independently by GP0 and signed-index outputs, then regenerates the key before p0 ciphertext is read. This remains a local inverse, not a printed instruction naming a general operation.
- Original p28 has the unique line-start fragment **DH**; the independently reconstructed line geometry and standard DH equations give the tuple. The p28 H-shell has a source-motivated local orientation from the solved p57 “shed our own circumferences” language and the p28 **OUR OWN** shell. These support testing a local state-driven inverse.
- The p28 readout candidate is followed by a structural readout matching **THEIR NUMBERS ARE THE**, whose authenticated 2016 continuation is **DIRECTION**. This strengthens the broad number-direction interpretation, but READ OUT remains a decoded candidate, not an independent instruction authorizing a particular p0 key schedule.

**What remains unsourced**

- The 2016 signed text does not name p50, GP0, base60, zero-based rune offsets, or a rule to interpret token **2L** simultaneously as a letter-count clue and a numeric receiver. The independent 15-rule literal-token control finds no transferable digit-letter grammar; it retains “2L → two Ls” as a local checksum only ([control report](lp2-p50-literal-token-grammar-control-gate.md)).
- The 2013 signed TCP specification demonstrates DH23 and returns shared integer K=2, but defines no KDF, no DH-to-GP29 conversion, and no key schedule. It does not prescribe the four-symbol composition **[K*a, a, H(A,B)]** or subtraction ([type gate](lp2-readout-dh-adjacent-p0-type-gate.md)).
- H has a source-motivated local role, but no first-party instruction says to append H(A,B) to K*a and a to form this four-rune key. The p0 READ OUT/H-shell packet and the later WILL → BE → FOUND return to it are structural self-consistency; the exact packet[a], packet[A], H(A,B) extraction was not a blind prediction. The original p0 visual audit found no local feature selecting H or the DH-state ordering ([visual audit](lp2-p0-readout-receiver-visible-clue-audit.md); [readout key-cycle report](lp2-p0-will-be-found-readout-key-cycle.md)).
- The 686-key × 524-word cross-product yields three authenticated-target hits (WILL, ROAD, LUCK), and the frozen BE successor fails to decrypt FOUND. The A1Z26 cross-check is not authenticated.

**Decision:** No first-party, contemporaneous, player-visible instruction selects a reusable dual-use 2L grammar or the exact four-symbol key schedule. Keep the p0 WILL inverse as a strong local candidate, strengthened by the later p38 packet route, but not as a global cipher. The full zero-inclusive #1739 family is not a unique router. Do not generalize p50 numerals to LP2 rune offsets or expand the key family without a new source-authored selector or a locked blind prediction.

## Scientific boundary

The positive-only YOU/2L selector and exact WILL inverse remain a strong local candidate; the full zero-inclusive #1739 audit shows that literal-token navigation is not unique or reusable, while the p38 packet independently strengthens the local WILL target/key selection.

Established computationally:

- authenticated YOU supplies GP0 address30 and the literal p50 token 2L;
- within the restricted positive-digit, p0-word-start family, the complete-word-start, next-word-length and literal-count conjunction selects p0 word32 at offset141; the full zero-inclusive start/end family instead has three logical edges and is not a reusable navigation rule;
- p28 line6 independently supplies the DH23 state, and the candidate key [12,6,18,27] subtracts from the selected ciphertext to WILL with exact forward replay; the key schedule itself is not authenticated;
- the exact fixed key hits only one of 524 complete four-rune words;
- the 686-key grammar has one hit on the selected YOU receiver, but its full 686 × 524 manuscript cross-product yields three authenticated-target hits: WILL, ROAD and LUCK;
- the direct BE successor fails the same-length gate and the frozen key outputs AEJLF; the two-hop WILL → BE → FOUND path is navigation only, with no FOUND plaintext or key recovered.

The remaining uncertainty is mechanistic and authorial. No recovered first-party instruction explicitly says to read 2L simultaneously as a letter-count clue and a base60 receiver, or to assemble the key as [K*a,a,H(A,B)]. The zero-inclusive family also admits FOUND→GOOD and GOOD→LUCK; its nulls retire literal-token navigation as a reusable operator. The later p38 packet supplies an independent source-state route to WILL and its key, but the local receiver convention and key construction still do not define a global cipher. The A1Z26 reading of 2L is an unauthenticated cross-check. Therefore **WILL remains a strong local plaintext candidate, not established unknown-page plaintext**. Do not generalize p50 numerals to LP rune offsets.

## Reproduction

Run both SFTs:

~~~text
node sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs
node sims/agent40_will_familywise_blind_successor_sft.cjs
~~~

The original SFT exhausts the adjacent signed-word selector family, reconstructs the p28 DH23 tuple, performs the WILL inverse and forward encryption, charges all 686 DH-state keys on the selected receiver, enumerates all 707,281 four-rune ciphertexts for the exact null, and audits the WILL → BE table-walk holdout. The Agent40 SFT additionally charges all 686 keys against all 524 four-rune words and tests the fixed BE successor without changing the selector or key grammar.
