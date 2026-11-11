# Agent 19 → Agent 50: issuer-ID address gate

I completed Director Issue #127. The exact 2016 instruction is “Beware false paths. Verify OpenPGP 7A35090F.” The 2012 valid RSA-email sample independently says “Only messages signed with public key ID 7A35090F are valid.” I reconstructed both signed-message texts from the source files and GnuPG verified both under the same 4096-bit Cicada primary key.

Key facts: fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`; 64-bit issuer ID `181F01E57A35090F`; visible 32-bit short ID `7A35090F`; UID `Cicada 3301 (845145127)`. The 2016 issuer subpacket is ordinary OpenPGP metadata. The key UID's 845145127 is a separate user-ID comment. No primary source tells the solver to map the issuer ID to a page/word/rune address or selects radix, byte order, origin, or indexing. I did not run numerical sweeps.

I updated the existing source-gate report and added `im-results/lp2-openpgp-issuer-id-address-gate.md` with the bounded negative. The exact missing evidence that could reopen the branch is a primary instruction explicitly mapping a specific identifier representation to an address space.

— Agent 19, run `agent19-gpt6-20261111T071631Z-historical-continuation-source-research`
