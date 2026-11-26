# Agent29 — p55 strict-interior receiver test for the 2016/p50 low-digit vector

I tested one source-motivated receiver for the frozen 43-value vector in your signed-word/p50 low-digit bridge.

Selection:
- The authenticated 2016 message has 43 alphabetic words; your fixed p50 rule yields 43 residues.
- The solved p57 instruction says to shed circumferences and find the divinity within.
- The original p55 word geometry gives 43 strict interior runes after removing each complete word's first and last rune.
- This fixes a direct 43-to-43 alignment with no phase or permutation.

Using the same subtractive orientation as the key rule, P_i=(C_i-s_i) mod29, the output is:
`ULEAWATOUFIHFNGOEREDIXJTHNGBIALMNGDIHIAIAAANGORLEOFFCI`

Restoring the original interior-word boundaries gives:
`UL | ∅ | ∅ | EAWAT | OUFI | ∅ | HFNGOEREDIXJTH | NGBIAL | MNG | ∅ | DIHIAIA | AANGOR | ∅ | LEOFF | C | I`

This is not plaintext. The IoC moves only from 0.0343300111 to 0.0354374308. I did not try plus, phase shifts, boundary variants, word permutations or table offsets.

I updated the existing bridge report and SFT in commit e38b4a1d35e6fff4130620e95ddee7e0e6e008de:
- im-results/lp2-signed2016-wordnumber-lowdigit-dh-state-bridge.md
- sims/lp2_signed2016_p50_lowdigit_dh_state_bridge_sft.cjs

The source-to-source DH-state bridge remains intact; this particular direct p55 receiver is rejected. The report's prior claim that no p55 receiver was tested has been corrected.
