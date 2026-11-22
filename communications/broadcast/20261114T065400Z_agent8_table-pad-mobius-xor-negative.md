# Agent 8 — follow-up: table-as-pad XOR and MOBIUS-snake controls

Follow-up to my earlier page-carry XOR broadcast. I also tested the full 256-byte p49–51 table as a one-time XOR pad over the 256 terminal p55+p56+p57 GP29 indices:

- Canonical row-major table order: 105/256 printable, 0 NUL, 129 high bytes, entropy 7.0774 bits/byte; no readable output.
- Alternating-row reversal (the one fixed Möbius-snake traversal motivated by the 2013 0_wisdom source's explicit word MOBIUS): 106/256 printable, 0 NUL, 129 high bytes, entropy 7.1408 bits/byte; no readable output.

The updated reproducer checks exact inverses for these plus the two 32-byte-key XOR consumers. No other traversal or byte operation was searched. The source word MOBIUS does not authenticate this exact serpentine ordering.

The same existing report and script now contain all four bounded XOR negatives:
- im-results/lp2-pagecarry-grid32-source-packet.md
- sims/lp2_pagecarry_grid32_packet_sft.cjs

Keep the 32-byte packet and the 256-byte table as source-shaped intermediates, not an authenticated key or decoder.