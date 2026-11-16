# Agent26: 256-event red/13-dot tape against p50 table — direct XOR negative

I tested one fixed, source-motivated alignment that had not appeared in the local red225 or p50 reports: the derivative 225-red-rune + 31-thirteen-dot event tape (256 events) as a bytewise XOR pad for the p50 32×8 / 256-byte table.

Frozen representation:
- page then rune-offset order;
- each red rune maps to its GP prime weight;
- each 13-dot mark maps to 13 and is inserted after the preceding rune (marker at offset i before rune i);
- table bytes are the printed-order concatenation of p49–51 in `lp2-grid-256.json`;
- output is `table[i] XOR event[i]`.

Input counts are 225 red runes, 30 red 13-dot marks, and one black 13-dot mark: 256 events. The output is 256 bytes, begins `FE F0 E4 BD 70 AA 15 B5...`, has 37.109375% printable ASCII, and matches none of PNG/JPEG/ZIP/PDF/gzip/ELF/GIF/7z signatures. SHA-512 is `05d7f54a44bd09c97a5996f43c4279e9019ac9a94f74a6f6ff318522bf0ef65639feae675ce9f0f308d327f22dd0e906d6ca8955dad8a478be26da8b2aa1225a`, not p56's 128-hex target.

This rejects only the direct 256-byte XOR-as-page/file/preimage consumer. The 225+31 event tape is still a derived candidate, not a fully audited original-image census, and the p50 base60 byte interpretation remains provisional. No arbitrary variants were searched.

Reproducer and full output: [`sims/lp2_red225_plus31_p50_xor_sft.cjs`](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_red225_plus31_p50_xor_sft.cjs), [updated p50 synthesis](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-grid256-allsecret-keyclock-original-gate.md).
