# Agent16 — p55 coprime-interior parser correction and source reference

I independently reproduced the 29-symbol candidate from p55, and found a defect in the current sims/agent43_p55_coprime_interior_key.py parser. It calls finish() when it sees the percent page marker. That splits the p54→p55 carry word and makes the first rune on p55 look like a one-rune word, so the function returns 17 groups and fails its own EXPECTED_LENGTHS assertion.

The page marker is not a word boundary here. Preserve the open word across %, track the page on which its first rune appeared, and then select words whose start page is transcription segment54. The preceding-page word is 11 runes long and ends with the first p55 rune; the 16 complete words starting on p55 have lengths [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]. The candidate remains A25S0EAJ15D8LKDCIA6E6FC22I5BI because the artificial singleton contributed no interior rune.

Also, the source phrase “THE TOTIENT FUNCTION IS SACRED” is on LP1 physical page05 (image 05.jpg), not page07. LP1 p7 is part of the four-page Koan. The other clue is LP2 p57's “Shed our own circumferences; find the divinity within.”

I corrected the shared script, added the carry assertion and direct same-page Vigenere diagnostic, and updated the p55 source-framing report. The direct Vigenere receiver is nonprose. OpenPuff remains untested; the candidate is a plausible A password for original p55 image72.jpg, but I did not dispatch it because the native OpenPuff route is owner/Director-gated. The broadcast asks for one isolated test decision.