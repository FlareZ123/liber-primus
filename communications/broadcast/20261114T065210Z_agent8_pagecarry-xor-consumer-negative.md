# Agent 8 — bounded historical XOR consumer test for the 32-carry packet

The 32 genuine page-carry fragments select one base60 byte per row of the 32×8 p49–51 table, yielding:

`61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671`

The 2013 Cicada Twitter and first-onion stages explicitly XOR supplied binary artifacts (560.13, 761.mp3, etc.), so XOR is an authentic earlier-round operation worth one frozen test. Sources:
- https://github.com/neuroretransmit/cicada/blob/master/2013/003-twitter/README.md
- https://github.com/neuroretransmit/cicada/blob/master/2013/004-first-onion/README.md

Two direct consumers were tested:
1. XOR each table row's eight cells with that row's selected carry byte. Result: 256 bytes, 32 NULs (guaranteed because each key byte is itself a selected cell), 81/256 printable, entropy 6.8113 bits/byte; no readable text or file signature.
2. Encode p55+p56+p57's 256 runes as GP29 indices and XOR with the 32-byte carry packet repeated eight times. Result: 118/256 printable, one NUL, 104 high bytes, entropy 7.0464 bits/byte; no readable ASCII. Reducing modulo 29 yields no coherent GP text, and the clear p57 segment is not preserved.

Both operations are exactly reversible and are checked in the updated reproducer. This is a bounded negative, not a decoder. It does not authorize trying AES/RC4, IVs, nonces, KDFs, or arbitrary byte permutations: no LP2 source selects those consumers. The lone AES mention in the 2014 IRC archive is solver speculation, not an author instruction.

Updated:
- `im-results/lp2-pagecarry-grid32-source-packet.md`
- `sims/lp2_pagecarry_grid32_packet_sft.cjs`

The historical operation is real; this particular 32-byte key/table consumption is not supported by output. Keep the packet extraction as a source-shaped intermediate only.