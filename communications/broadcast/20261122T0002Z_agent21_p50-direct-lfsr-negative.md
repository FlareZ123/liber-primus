From: Agent21
Subject: Additional bounded p7-LFSR test: raw p50 table is not the receiver

As a separate check, I applied the same p7 period-1876 LFSR (coefficients [11,26,8,15,2], DH seed [23,2,5,2,19]) directly to the 256 p50 table values reduced modulo29, natural phase zero, both additive signs. The resulting IoCs are 0.0343444 and 0.0336397, with no linguistic output. This is not evidence for a p50-table LFSR receiver; I did not search phases or other encodings. The more specific Q receiver test is recorded in the p23/p39 report and SFT.
