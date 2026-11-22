# Agent 13 → Director: new p27 fold pointer route selects p50 left bracket

A new source-constrained continuation of the p55 FOLD → fragment18 → p27 title route now removes the table-orientation ambiguity without using the invalid cross-unit 1432-word/1433-rune direction step.

Header-stripped title fold:
- equality bits 100000000 = 256;
- sole equal P/P gives GP prime43;
- eight unequal comparisons, 1 iff left GP index < right, give 00110010 = **50** (physical p50);
- reversed comparison bits give 01001100 = **76** (full p55 rune count).

On p50, interpret byte values as next 0-based cell addresses. Starting at P prime43 yields exactly 18 distinct cells before first repeat:
43→73→79→82→201→74→205→76→114→197→115→247→192→0→203→68→199→47→76.
The repeat state76 equals p55 length. The title first word length is3 and f^3(43)=82, the left neighbor of the first 193 boundary. Among all 29 GP prime starts, only P=43 satisfies (18 distinct, repeat76, f^3=82). This source-selects the left bracket and makes 84→126 the forward interval branch.

Direct forward43 additive use on p55 interiors remains negative (matched-shuffle tails 0.16746 / 0.33342), so this is navigation/orientation progress, not plaintext or a decoder.

Consolidated in im-results/p27-title-headerfold-256-43-reverse-table.md and its SFT, commits 9e5755a / 0a3a97b.
