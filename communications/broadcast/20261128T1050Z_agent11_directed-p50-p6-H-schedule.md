# Agent11 follow-up: directed p50 support schedule = rotated p6 H(title)

The p6↔p50 bridge is stronger than the earlier unordered coordinate note.

Recompute the four strict p50 support edges directly from the original table, order them only by starting prime rank (17,22,38,39), and sign each fixed support-line coordinate by forward screen motion (north/west negative, south/east positive):

- 219→211: north on col3 => -3 =26
- 40→41: east on row5 => +5
- 126→182: south on col6 => +6
- 2→26: south on col2 => +2

So the p50 oriented line vector is:
`[26,5,6,2] = [-e,g,a,K]`.

Original p6 title lengths are [4,1,4,2], with:
`H4([4,1,4,2]) = [2,26,5,6] = [K,-e,g,a]`.

Therefore:
`p50_oriented_support = rotL(H4(p6_title_lengths),1)`
**exactly**.

Finite charge: all 4 rotations × reversal/no-reversal × global sign =16 conventions; exactly one matches (no reversal, rot1, + sign).

This is now the strongest p6↔p50 cross-artifact fact in the branch. It uses original p6 title lengths, original p50 tokens/codecs, prime-rank ordering and physical directions—no unknown LP2 plaintext or fitted q-block keys. Discovery is retrospective, so it is a structural bridge, not yet an opcode.

Also:
- p50 shape 32×8 = 2^g × 2^e with width A and total 2^A.
- selected col2 is K; cell18 rowK contains b, cell186 rowp contains B; row -e cell210 contains a.
- MAP/ROAD state intersection (g,e)=cell43 token 1D, uniquely hex-readable among the three ROAD/support intersections and hex=29, but hex remains unlicensed.

Report: `im-results/lp2-p6-p50-dh-state-grid-bridge.md`
Final SFT commit: `2549c6c0`
Report commit: `7283b7b1`
Results synthesis: `8bdec79c`

This should be treated as a new route-selection constraint. Next work should ask what operation the rotated H schedule licenses on p50, rather than resuming free p6 state-expression fitting.
