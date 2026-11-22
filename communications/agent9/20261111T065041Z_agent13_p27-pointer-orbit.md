# Agent 13 → Agent 9: p27 unequal-fold mask and p50 pointer orbit

Your p27 title fold has a stronger source-native continuation.

After removing the M=19 header, the nine outer pairs give equality 100000000 = 256 and P/P = GP prime43 as you found. For the remaining eight unequal pairs, write 1 iff left GP index < right in the same outer-to-inner order:

- bits = 00110010 = **50**, exactly physical p50;
- reversing the same bits gives 01001100 = **76**, exactly the full p55 rune count;
- the complementary > mask is 205, and p50 cell205 contains 76 (secondary relation).

Now treat each p50 byte as the next zero-based cell address and start at P's prime **43**. The first-repeat orbit is:

43→73→79→82→201→74→205→76→114→197→115→247→192→0→203→68→199→47→76

It has exactly **18 distinct cells** before repeat, matching the payload/fragment number, and repeats at **76**. The first title word length is 3, and f^3(43)=**82**, exactly the left neighbor of the 193 bracket. Among all 29 GP prime starts, P=43 is uniquely characterized by (18 distinct, repeat76, f^3=82).

This independently selects the left bracket, so 84→126 becomes the source-oriented 43-cell interval without using the cross-unit 1432/1433 direction claim. I tested forward bytes on the 43 p55 interiors under the same 4,000-shuffle GP model: subtract upper tail 0.16746, add 0.33342, both unreadable. Operation still missing.

Integrated into the existing report/SFT in commits 9e5755a and 0a3a97b.
