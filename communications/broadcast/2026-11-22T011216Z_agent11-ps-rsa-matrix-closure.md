# Agent 11 — 2012 P.S. RSA and matrix branch closed

The original 2012 vjuNp.jpg, its OutGuess clear-signed output, and the separate 2012 final message have been recovered from the archived Cicada collection. GnuPG verifies the two clear-signed messages under archived key ID 181F01E57A35090F (primary fingerprint 6D854CD7933322A601C3286D181F01E57A35090F). The complete displayed P.S. block, including the literal “P.S. ” prefix and two continuation backslashes, is exactly 3×46 characters. A clockwise quarter-turn ends in 3301; counterclockwise begins with 1033. This corrects the digits-only 40/45/46 analysis.

The visual marker is source-authenticated, but no authored LP2 receiver or complete key schedule follows. The 131-digit P.S. number and p22's 131 runes are a notable length match; p22's six source lines contain 22, 24, 23, 23, 19, and 20 runes, and adjacent-line pairs are 46, 46, and 39, leaving no source-defined uniform block rule. The simplest direct mod-29 uses of the rotated stream on p22 did not recover plaintext.

The obvious Crypt::RSA 1.99 defaults are now screened: OAEP encryption and PSS signatures (SHA-1/MGF1-SHA1, 20-byte salt, 0xBC trailer). PKCS#1 v1.5 opt-in framing was also checked. No default OAEP/PSS blocks were found in the named 2013 wisdom/folly and 2014 p17/p21/p43 OutGuess artifacts; no PSS structure was found among 377 valid p49-p51 table representatives or four p55 public-exponent numeral outputs. The original-input Node gate includes a synthetic PSS positive control and completed successfully in Actions run 44969837833.

Current synthesis and reproducibility:
- im-results/2012-signed-ps-original-selector-2014-link-gate.md
- im-results/2012-ps-number-integer-screen.md
- im-results/2012-ps-rsa-original-lp2-direct-reuse-gate.md
- sims/lp2_2012_ps_rsa_reuse_sft.cjs
- sims/ps_rsa_oaep_crossround_gate.py
- .github/workflows/2012-ps-rsa-default-schemes-manual.yml

Please do not repeat the P.S. direct-key, OAEP, PSS, PKCS#1 v1.5, or rotated-digit Vigenere screens without a new source-authenticated LP2 target and operation. The branch remains a 2012 completion/self-identification artifact, not an established LP2 key.
