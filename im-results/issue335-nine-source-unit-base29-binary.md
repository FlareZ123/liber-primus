# Issue #335: nine original titled GP29 passages as whole-number BASE29 binary

**Decision (11 November 2026):** The frozen, source-delimited nine-unit **GP29 integer → minimal big-endian byte** interpretation yields **no recognized self-delimiting file/container, UTF-8 text, JSON, or readable instruction**. It establishes a finite exclusion of this exact interpretation, not of all BASE29 encodings, binary payloads, encrypted content, other alphabets, or alternative section/key clocks. No unknown LP2 plaintext or key was recovered.

## Mechanism selected before testing

The [GPG-verified 26 January 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) demonstrates BASE29 conversion; the visible runes of LP2 provide 29 symbols. This motivates a direct integer interpretation, but the 2013 command does not establish that LP2 is an integer or assign rune digits. Test exactly the existing canonical GP order F=0,...,EA=28, with **all title runes included** in each of the nine original-layout units as specified by [the source-clock crosswalk](../workplace/lp2-section-clock-ambiguity.md).

Use canonical GP indices for physical pages 0–55 in order. Nine zero-based global rune starts are
`[0,729,1874,3612,5506,6527,7960,8051,9640]`. The unit lengths are
`[729,1145,1738,1894,1021,1433,91,1589,3316]`, summing to 12,956.
The first title on p15 starts at local offset 9 because the preceding section carries its first nine runes. Original red-ink title spans are checked against the [annotation corpus](../resources/liber-primus/lp2-ink-annotations.json).

For a unit `d0 ... d(n-1)`, evaluate `N = Σ d_i·29^(n-1-i)` and serialize `N` as the **minimal, big-endian** byte array. No endian switch, offset scan, alternate alphabet, padding, compression guess, key, KDF, or plaintext optimization is admitted. Original rune count is used **only on the inverse check** to restore leading-zero GP digits; it does not create or prepend bytes. The ninth unit starts with one leading zero GP rune.

## Original-input results

All nine serialized arrays were reproduced by [the runnable source test](../sims/issue335_nine_base29_binary_sft.cjs) in the [successful manual CI run 43093396166](https://github.com/FlareZ123/liber-primus/actions/runs/43093396166). Full first/last-32-byte readings and fingerprints follow; hex is unspaced. The unit numbers refer to original-layout sections, not physical pages.

| Unit | Rune length | Bytes | Printable ASCII | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| 1 | 729 | 443 | 172/443 (38.83%) | `a2274e9d0e711ac9f4bb0007cf6de23f281b0b68f813ab203634e0db4d9981d1` |
| 2 | 1145 | 696 | 265/696 (38.07%) | `c0c9a87062059502e48180a35acefd83df0bee98dd0db75338aee7fb7c7d1a9f` |
| 3 | 1738 | 1056 | 414/1056 (39.20%) | `cd59bf2bc1beca36cc630d578041b147e4edbe3180db67f04754aa0dbcf6c920` |
| 4 | 1894 | 1151 | 440/1151 (38.23%) | `efbe45424775b9f5ecaab0dcade77cfa481107e2ac94e3d529c16a3ebad954f2` |
| 5 | 1021 | 620 | 226/620 (36.45%) | `1309cad7861832db63fba2beb8e0cf4cb19556c445c505eab5938aed0b178707` |
| 6 | 1433 | 871 | 351/871 (40.30%) | `ad15adf1c932f26a84a5759423b153f239e85f00f7865c8d28aabf6edf4e73fe` |
| 7 | 91 | 56 | 31/56 (55.36%) | `99f802f341cc323bcefaff66c8a9a72c15088347afa45dc0e36896197d6852ad` |
| 8 | 1589 | 965 | 363/965 (37.62%) | `218e33bd02e75f90b4ea1cd461c6dc2ba1e43a3963e34240ba27d4fe735f5ec4` |
| 9 | 3316 | 2013 | 758/2013 (37.66%) | `f8a34a004685cdde67a03a929b99307461f6ceaec898e27d00e8c0c0168b3651` |

```text
unit first32Hex                                                        last32Hex
1    1759b774a590ef75c921dd8fcc0a47335b20ab2493dfc3d61946bff063549db7   4c56f36a14d66301ef3fbc992a201d51f55e365a81f3505ec2727e741ca79b19
2    03ae7c53329e6a19c89ec6f1859e8ae90f81d550a02dd8e7c4eccc26340d4d1f   b0d0e105843d0d7b0ccaa7a0ae034c3532b6df94bfa914c46846226deeda741b
3    0475e204b453634d64f172b586cbf0621998cc2b30b8760ec2246a268abef2d2   d549d773e572c4f4b74a490d6445e61f52f335d99631cc29e216fb84f7fd894a
4    01661c4cb765b4c62b738b8bdd28ba89e9ae7fb379935ea84a7bedff2db8aade   cbff13f55428300882699ceab97e9f72b413ffff4d33a8bd4bc83fd94ccaa17b
5    1032d4e90101414aecf22671166a02a6aae87650b07c98100a21c1ec39f8ed76   b832a127aca9be714bc3ee0a0c58c0da3a5201161b83b13c1429708cbf09f62b
6    01e1f098bfb6f84a365058a55cae35e033a9c3b921f0bf722edf16f94433c4fc   79d9fafa69e7957b80fb32b4068ee6f55a54c60592c1da62e0d3770318e36813
7    0368428cbddd04380e54e2502b1b25c9623d706773f9aebd6c9659123f557aa0   6c9659123f557aa054604c170dff4f6c7c70e421371618f2edcc2b20bb5120c8
8    751f5286128468c733cbed1abbd2e9ec05691b13863fbae27adcedf163ec3ad6   c22cc44528dd0e6d0dba02c3b1449a8576704d284e13787143675304ed1a3550
9    62b31ecde70f0f8736b1bd66319534f12f278adfb2166e3f0919a69d5151d410   e369a687f7e42cd5f0c2af0052a393122f7ce541dad7d1f7d6c8bc404adb1bf3
```

Each original byte sequence fails strict UTF-8 decoding and strict JSON parsing. The frozen signatures/structure tests find **zero** PNG/IHDR, GIF screen, PDF/EOF, ZIP/EOCD, valid gzip, BZip2, XZ, 7z, JPEG SOI/EOI, ELF, PE, SQLite, tar, or RIFF length-confirmed objects. Their use is intentionally a *finite container test* rather than unrestricted file-carving or entropy-based speculation. The 56-byte seventh section has an elevated printable-ASCII fraction but also fails UTF-8 and container checks; it is not a candidate plaintext.

## Controls and interpretation

- **Exact positive control:** encode a synthetic **71-byte valid GZIP** payload to 117 GP29 digits, decode it back byte-for-byte and recognize the GZIP stream. All nine original source units also round-trip exactly to the supplied GP29 indices when the original known rune length restores any leading zeros.
- **Source-preserving wrong-unit control:** rotate each whole title+body unit left by one rune without changing its length or rune multiset. All nine rotated arrays also produce zero verified container signatures. This does not support the hypothesized source serialization.
- A cryptographic hash or encrypted binary stream may naturally lack familiar signatures. No statement is made about such unframed streams. The historical BASE29 demonstration also does not force the original GP rune-value ordering. A new independent source instruction must select any further decoding variant before additional search is warranted.

**Director decision:** Close #335 under its frozen criteria. A successor is justified only by an independent original-era instruction identifying another exact serialization, a key, an authentic format, or a decoding rule that makes a checkable original-byte prediction.
