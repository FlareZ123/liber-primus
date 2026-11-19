# Authenticated 2013 DH response names bridge the two manuscript DH states into p57

**Agent5, 19 November 2026. Classification: source-constrained cross-instance semantic bridge. This result links authenticated 2013 protocol words to the independently reconstructed DH23 and DH151 states under the already established GP0 to p50 address grammar. It does not supply a p0 KDF or recover additional unknown plaintext.**

## Frozen source inputs

The authenticated 2013 TCP specification defines the procedures RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT and GOODBYE, plus the response names WELCOME, OK, ERROR, DATA and GOODBYE. Its worked DH example is:

`DH 23 -> OK 5 8 -> 19 -> DATA 2`.

The repository source record verifies the signed specification independently and already treats the printed DH23 tuple as semantic control.

Separately, manuscript-native work fixed two DH states before this test:

- direct p28 DH23: `p=23,g=5,a=6,b=15,A=8,B=19,K=2`;
- secondary p28/p57 DH151: `p=151,g=35,a=21,b=55,A=107,B=66,K=87`.

The latter derives `K=87` from `35^(21*55) mod151`; the word DATA played no role in obtaining that value.

The table grammar used below is also upstream: canonical whole-word GP0 sum selects a zero-based p50 cell, and the manuscript-wide MUST/SHED transition selects the forward base59 alphabet after the switch.

## Finite authenticated vocabulary census

Use the 12 distinct authenticated protocol words:

`WELCOME, RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, GOODBYE, OK, ERROR, DATA`.

QUINE and CODE collide at GP0 address49, so these words occupy 11 distinct p50 addresses.

Under the frozen GP0 -> p50 address -> base59 rule, exactly three protocol words decode to any solved p57 word:

| authenticated word | GP0 | p50 token | base59 | solved p57 word |
|---|---:|---|---:|---|
| KOAN | 41 | `1O` | 83 | EMERGE |
| DH | 31 | `2D` | 131 | CIRCUMFERENCES |
| DATA | 87 | `15` | 64 | SHED |

None of the 12 words reaches a solved p57 word under base60.

This family count is modest evidence by itself. Across the exact p50 token multiset, 25/256 tokens decode under base59 to any p57 GP0 word sum. Drawing 11 distinct addresses without replacement gives an exact hypergeometric tail of **0.0803466665** for at least three hits. The value of the result lies in the typed relationships below, not in the raw hit count.

## DH and WITHIN select the complete duplicated 2D class

Authenticated `DH` has GP0 sum31.

Clear p57 `WITHIN` has GP0 sum38.

The p50 table contains token `2D` exactly twice, at cells **31 and38**. Thus the authenticated protocol word and the clear manuscript word select the complete duplicate class:

`DH=31 -> p50[31]=2D <- p50[38] <- WITHIN=38`.

Under the selected base59 state, both decode identically:

`2D -> 131 = GP0(CIRCUMFERENCES)`.

This independently supplies the same CIRCUMFERENCES target already reached from WITHIN. It also reconnects the p28 center-I route, because the central I has GP-prime31 and was already known to address the other 2D copy.

## DATA is the DH151 shared secret as a word

Canonical GP0 gives:

`DATA = D+A+T+A = 23+24+16+24 = 87`.

The independently derived DH151 shared secret is also:

`K151 = 87`.

The signed protocol specifies that a DH result is returned as:

`03 DATA [k]`.

Therefore the manuscript-derived DH151 state would be serialized by that authenticated grammar as:

`03 DATA 87`.

This is a source-defined integer-to-response context in which the response name has exactly the same canonical GP0 number as the shared integer. The equality was discovered retrospectively, so it is a bridge and semantic lock rather than a blind probability claim.

The same address is already functional in the manuscript state machine:

`DATA=87 -> p50[87]=15 -> base59 64 = SHED`.

Thus the authenticated response label names the independently derived shared value and lands on the exact p57 operation already selected by that value.

## DATA 2 joins the two manuscript-native DH shared secrets

The historical worked example ends with the literal signed response:

`03 DATA 2`.

Under the canonical manuscript number map, that two-part payload carries:

`GP0(DATA)=87 = K151`

followed by the literal integer

`2 = K23`.

So the authenticated phrase `DATA 2` contains, in order, the shared secrets of the two independently reconstructed manuscript DH instances:

`[87,2] = [K151,K23]`.

This observation was not used to discover either shared secret. It gives the previously separate DH151 and DH23 constructions a compact historically authenticated cross-instance bridge.

A second response-name check is consistent but weaker: `GP0(OK)=8=A23`. Among the five authenticated response names WELCOME/OK/ERROR/DATA/GOODBYE, only OK equals a DH23 state value and only DATA equals a DH151 output.

## Relation to the clear p57 clause

The clear clause:

`WE MUST SHED OUR OWN CIRCUMFERENCES`

already supplies the DH151 private exponents from OUR/OWN and receives WE/SHED from the DH151 outputs. The new source bridge fills the remaining semantic edge:

- `DATA=K151=87 -> SHED`;
- `DH=31 -> CIRCUMFERENCES`.

The clause is therefore tightly connected to a single operation family from both manuscript geometry and the authenticated historical protocol.

This does not authorize arbitrary reuse of 2013 session values. The authenticated procedure still defines no GP29 stream cipher or KDF, and no additional p0 key symbols follow from this report.

## Decision

Preserve the authenticated protocol as an **operation and state-label bridge**:

`DH -> CIRCUMFERENCES`

`DATA / K151=87 -> SHED`

`DATA 2 -> [K151,K23]`.

This strengthens the intended-solve-path interpretation of the two DH constructions and gives K87 a source-authenticated textual type. It does not close the missing state-to-GP29 key schedule for adjacent p0 ciphertext.

Reproducer: `sims/lp2_2013_dh_response_p57_bridge_sft.cjs`.
