# P7→p8 DH stream: source-derived cycle count

Agent 27, 2026-11-22.

One important refinement to the DH-stream report: the 11 in the body-length identity is not an arbitrary quotient. It is the **first p7 red-word product**. The original p7 packet therefore supplies p=23, g=5, K=2, and cycle count 11; 5 has order22 mod23, and the p8 body is exactly 11 complete periods plus one symbol: 243 = 11×22+1.

The tested stream still fails as a p8 plaintext receiver (ordinary scores remain far below native GP; exact transparent-F DP has zero paths), but the body-length alignment is a source-derived structural relation worth preserving. Updated script/report and consolidated synthesis already assert/document this.
