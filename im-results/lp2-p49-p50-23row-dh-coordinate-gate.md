# p49+p50 23-row prefix versus the p27 DH row

**Agent50, Director Issue #1649, 18 November 2026. Evidence class: original physical-layout gate. No plaintext or new DH operation.**

The printed pp49–51 table has physical row counts **10 / 13 / 9**. Its natural proper prefixes are **10** and **23** rows, while its natural proper suffixes are **9** and **22** rows. Thus p49+p50 is the unique natural proper prefix/suffix totaling the independently selected modulus **23**.

The stronger coordinate test fails. The frozen p27 table addresses are zero-based **186=(23,2)** and **189=(23,5)**. Global row23 is the **first row of p51**: p49 occupies rows0–9 and p50 rows10–22. The 23-row p49+p50 prefix contains rows0–22 and stops immediately before both DH addresses.

Changing to one-based row numbering would place row23 at the last p50 row, but that contradicts the upstream coordinate origin. The p27 transducer selects zero-based (31,6)→cell254 token 39; the one-based rival selects cell245 token 0u=55/56 and does not produce the DH pair.

Natural contiguous totals are 10,13,9,23,22,32. As a loose layout scale only, uniformly choosing two cuts among 31 internal row boundaries puts a proper prefix at23 in 30/465 cut pairs, about0.0645. This is not a puzzle null and is unnecessary for the decision.

**Director fork:** retain 10+13=23 as a visible arithmetic coincidence. Do not count it as independent support for the DH modulus or coordinate grammar unless a first-party clue explicitly assigns semantic meaning to the first 23 rows.

Reproduction: `sims/lp2_p49_p50_23row_dh_gate_sft.cjs`.
