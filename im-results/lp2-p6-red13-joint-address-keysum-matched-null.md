# P6 red13 joint address + key-sum grid: charged whole-corridor matched null

**Agent10, 28 November 2026. Classification: target-rune-blind matched structural/checksum result inside a fully charged post-discovery p6 visual family. It materially strengthens the provisional p30-p42 / SEEK...OPENPGP corridor, but the two grid grammars were recognized after the corridor existed and therefore do not yet authenticate unknown plaintext.**

## Decision

The original p6 page can now be read as a 13-cell state transition. The original scan and source-exact ink census place a large red13 mark at each endpoint of the unique p6 four-word red span (offsets71 and82), with the exceptional large Fehu and the four-word red packet between those boundaries. This gives a first-party visual topology of **13-cell state -> p6 Fehu/title transform -> 13-cell state**.

Numerically that topology is realized by two coupled 4/5/4 programs:

1. an **address grid**, already reported, that serializes the 13 local receiver-ordinal deltas;
2. a **key-sum correction** induced by the intervening p6 fields, taking the first grid to a second 13-cell checksum state.

The important new test does not grade either program only on the favored corridor. It charges the visible role/sign/orientation freedoms, crosses every authenticated 13-word source window with every physical 13-page interval, rebuilds receiver candidates from original LP2 groups, and then asks whether ciphertext GP0 minus the predicted key sum reproduces the candidate source GP0.

No fitted coordinate key and no target rune equality enters the test.

## Original p6 fields

The four-word red title has widths:

~~~text
[q,1,q,K] = [4,1,4,2]
H4(widths) = [K,-e,g,a] = [2,26,5,6].
~~~

The fixed large 13-dot stencil has columns:

~~~text
[4,5,4].
~~~

The two q-words are:

~~~text
W1 = [24,16,14,17]
W3 = [ 6,27,15,17].
~~~

Their coordinatewise sums and differences are:

~~~text
W1 + W3 = [1,14,F,5]
W1 - W3 = [18,18,-1,F].
~~~

So coordinate2 is uniquely the **opposite** q-word pair and coordinate3 is uniquely the **equal** pair. Those are source-visible Fehu-zero relations, not target-key labels.

## Grid A: receiver-address deltas

For signed/permuted H roles [r0,r1,r2,r3] and signed singleton u:

~~~text
L = [ r1, u, -r1, r0 ]
C = [ r1, u, F, u, -r1 ]
T = [ -r3, r2, -r0, u ]
R = L + T.
~~~

The natural printed roles/orientation give:

~~~text
D = L || C || R
  = [26,1,3,2, 26,1,0,1,3, 20,6,1,3].
~~~

For source index j, lane i requests local-word ordinal residue:

~~~text
(j + D_i) mod29.
~~~

The operation class is fixed by lane rather than by target spelling:

- ordinary complete word on direct lanes;
- adjacent 2+3 packet on the p35 lane;
- center-q removal on the singleton p36 lane;
- center-F removal on the p41 lane;
- the already established [K,1,F] marker, +K words, rune1=F removal on the p42 lane.

Candidate source-word **arity** is allowed, because the matched null recomputes it independently for every source window.

## Address-family charge across the whole book

Charge exactly the obvious p6-visible freedom already used for the grid:

~~~text
24 H-role permutations
x 16 independent H-role signs
x 2 singleton signs
x 2 horizontal stencil directions
x 2 vertical stencil directions
= 3,072 address grids.
~~~

All 3,072 numeric delta tapes are distinct.

Cross every grid with:

~~~text
31 authenticated contiguous 13-word source windows
x 44 physical 13-page intervals
= 1,364 source/page alignments.
~~~

Require all thirteen lanes to contain at least one original complete-group receiver of the candidate source arity under the lane's fixed operation class.

Result:

~~~text
full 13-lane receiver configurations: 4
source starts represented:              {30}
physical page starts represented:       {30}
~~~

The four surviving address tapes differ only in the p39/p40 terminal-side values:

~~~text
... | 20, 6,1,3   canonical
... | 20,25,1,3
... |  3, 6,1,3
... |  3,25,1,3
~~~

Thus the fully charged p6 address family itself selects **source30/page30** as the only complete 13-lane placement before any plaintext GP0 equality is applied.

## Grid B: p6-only key-sum correction

For the same H roles, singleton sign, and stencil orientation, define:

~~~text
L2 = [ -r3, 2q, u, -r0 ]

C2 = [ -r1, -r2, r0*r2, r3, r1 ].
~~~

The right-column transition uses the two q-word coordinates independently singled out by Fehu zero:

~~~text
opposite pair = W1[2], W3[2] = [-b,b]
equal field   = W1[3] = W3[3] = K+b.
~~~

Under the natural role order:

~~~text
U = [-b,b,e,K+b] = [14,15,3,17]
R2 = L2 + U.
~~~

This yields:

~~~text
E = L2 || C2 || R2
  = [23,8,1,27, 3,24,10,6,26, 8,23,4,15].
~~~

The proposed page-key checksum tape is simply:

~~~text
S = D + E mod29
  = [20,9,4,0,0,25,10,7,0,28,0,5,18].
~~~

These are exactly the previously frozen p30-p42 additive-key sums, but that equality is **not** used as the decisive matched-null grade below.

## Joint family charge after the receiver gate

For each of the four address-family survivors, charge a deliberately broader right-column transition family:

~~~text
2 directions of the unique opposite q-word pair
x 24 coordinate permutations of [opposite-left, opposite-right, e, equal]
= 48 correction transitions.
~~~

So only 192 labeled joint schedules survive to the checksum test.

For every lane, the original prepared receiver gives a ciphertext GP0 total C_i. The joint grid predicts S_i. Require only:

~~~text
C_i - S_i mod29 = GP0(candidate source word_i).
~~~

This uses the authenticated source word's GP0 scalar, not its rune spelling, and no fitted coordinatewise key.

Result:

~~~text
192 labeled schedules tested after the receiver gate
2 labeled aliases survive
1 numeric schedule survives
~~~

The two labels are the same numeric transition: swapping the opposite pair and compensating with its coordinate permutation.

The unique numeric winner is:

~~~text
sourceStart = 30
pageStart   = 30

D =
[26,1,3,2,26,1,0,1,3,20,6,1,3]

S =
[20,9,4,0,0,25,10,7,0,28,0,5,18].
~~~

All thirteen prepared receivers are unique after the checksum condition.

Their prepared ciphertext GP0 totals are:

~~~text
C =
[18,7,5,28,6,3,16,9,1,18,25,6,6].
~~~

Therefore the p6-predicted plaintext GP0 tape is:

~~~text
C - S =
[27,27,1,28,6,7,6,2,1,19,25,1,17],
~~~

exactly the GP0 tape of:

~~~text
SEEK AND YOU WILL BE FOUND GOOD LUCK BEWARE FALSE PATHS VERIFY OPENPGP.
~~~

## Evidence boundary

This is substantially stronger than another fitted-key coincidence:

- all 56 unknown physical pages remain untouched at the rune-coordinate plaintext level;
- all 31 authenticated 13-word source windows are allowed;
- all 44 physical 13-page placements are allowed;
- every visible role/sign/orientation variant in the 3,072-member address family is charged;
- the surviving address ambiguity is then charged through a broader 48-way correction-transition family;
- no fitted full key, target rune equality, or language score is used.

The result therefore establishes a **conditional checksum-level source/receiver alignment**: once the two post-discovery p6 grid syntaxes are admitted, the original source30/page30 corridor is the sole numeric survivor of the charged matched null.

It still does not establish SEEK...OPENPGP as decrypted LP2 plaintext. The reason is chronology and model selection: both grid syntaxes were recognized after the corridor and checksum tapes were already visible in the research record. The charge measures how selective the frozen syntax is, not how many other syntaxes could have been invented.

The remaining decision is now narrower but has **two** live models. One is the stronger decryption interpretation: derive the ordered per-rune key coordinates from an original clue. The other is a checksum/navigation interpretation in which the p6 bracket maps and verifies the authenticated source tail without claiming that the target-conditioned vectors C-P are an authored keystream. The most literal 56-law H-pair lift and every total-degree<=2 GF(29) coordinate law in (D,E,arity,position) fail all complete page keys, so the aggregate result does not automatically imply a rune-key serializer. A genuinely prospective receiver/checksum prediction can strengthen the second model; a source-selected ordered vector operation can distinguish the first. [Coordinate-lift gate](lp2-p6-grid-coordinate-lift-gate.md).

## Reproduction

Run:

~~~text
node sims/lp2_p6_red13_joint_schedule_matched_null_sft.cjs
~~~

The SFT parses the canonical LP2 transcription and authenticated 2016 source, reconstructs all operation-class receiver candidates, enumerates the complete 3,072 address family over all 1,364 source/page alignments, charges the surviving correction schedules, and asserts the unique numeric winner above.
