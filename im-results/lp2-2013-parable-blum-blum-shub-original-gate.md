# 2013 Parable factors as a Blum–Blum–Shub key for the original LP2 table and rune ciphertext

**Agent15, 17 November 2026. Classification: original-source-motivated cryptographic hypothesis with decisive direct-consumer negatives; no plaintext or creator key.** Reproducer [`lp2_2013_parable_bbs_original_sft.cjs`](../sims/lp2_2013_parable_bbs_original_sft.cjs), [passing Windows Node22 Actions run 44165046666](https://github.com/FlareZ123/liber-primus/actions/runs/44165046666).

## Authored cross-round input and independent mechanism

An independently reported original-source relation links the authentic 2013 `761.MP3` ID3 `Parable 1,595,277,641` number to the three genuinely clear p57 body-clause Gematria Primus prime sums: `1259 × 1031 × 1229 = 1595277641`. These exact factor/sum identities and the corrected `TUNNELING` NG transcription are documented in the [p57 source-to-DH report](lp2-p57-find-must-base59-dh151-35-primitive-root.md). **Additional cryptographic fact:** 1259 and 1031 are both primes congruent to **3 mod4**, while 1229 is a distinct prime congruent to **1 mod4**. The first two therefore form a valid **Blum modulus** `M=1259×1031=1298029`; the third is a natural, independently supplied, nonzero and coprime seed `s=1229`. This selects a **complete, conventional Blum–Blum–Shub (BBS)** bit generator without fitting an unknown ciphertext:

`x0 = s² mod M = 212412; x_(j+1) = x_j² mod M; bit_j = x_j mod2.`

The manuscript never names BBS, proves this is the intended operation, or tells a reader to use BBS against the original byte table. The first-party factorization and the two Blum primes make this a *plausible tested candidate*, not a recovered key.

The 32×8 source numeric table holds 256 two-character values; under its conventional base60 byte interpretation this is **2048 bits**, exactly enough to compare to 2,048 BBS output bits. Test the ordinary 1-bit-per-state stream under the two conventional choices of emitting the initial square or the next square and both within-byte bit packing orders. Preserve the original row-major table layout and also evaluate the missing-f alternate base59 interpretation.

## Exact original p50 byte and direct XOR decisions

| Frozen BBS convention | Exact original base60 bytes matched /256 | base59 matched /256 | Printable ASCII after full base60 XOR /256 |
| --- | ---: | ---: | ---: |
| initial, low-bit first | 1 | 3 | 97 |
| initial, high-bit first | 0 | 2 | 96 |
| after-square, low-bit first | 0 | 1 | 101 |
| after-square, high-bit first (standard) | 1 | 0 | 92 |

The same 256-byte direct XOR under base59 yields only 95–104 printable ASCII bytes, with no complete readable instruction or ordinary file header in the first bytes. The generator fails as a **direct reproducer** of the original printed byte table, or as a directly usable **XOR pad exposing ASCII** in this complete four-format class.

A stronger structural exclusion is available for the frozen seed. Its modular-square state returns to its start after exactly **612 steps** (no earlier repeat); thus the standard emitted bitstream has period612. Any direct eight-bit byte packing of those bits must repeat at a **153-byte** lag (1224 bits=2×612), independent of initial bit offset and bit orientation. Yet the **authentic base60 table has 0/103 equal byte pairs at lag153**, as does the alternate base59 reading. This is incompatible with **any directly copied consecutive byte trace** of this fixed BBS seed in the printed order, regardless of which prefix byte is aligned first. A secretly permuted or nonlinear postprocessed stream is outside scope.

## Direct full-manuscript GP29 receiver

The same exact source-derived BBS state can generate arbitrary-length GP29 pad candidates using either (i) five sequential bits per symbol with unbiased rejection of 29–31, or (ii) eight sequential bits modulo29. Both use one continuous key clock from the beginning of unknown physical p0 through unknown p55, including all **12,956 authentic encrypted runes** and zero symbols from the runeless p50.

For each transport, test the same four emission/bit-order conventions and both ordinary GP29 additive signs: **16 source-frozen full-corpus decodes**. All original IoCs lie in **0.034458–0.034517**, close to the 29-symbol uniform value 0.034483, and show no continuous native-English GP29 text. By contrast, the independently clear p57 first76 rune segment has IoC **0.059649**. Each of the 16 implemented decoders recovers a planted known-clear p57 sequence **95/95** with the same generator and exact additive inverse. These complete direct decodes do not apply plaintext-F bypass; the separate p55 tail test below explicitly allows that known historical rule.

The smallest original recipient p55 contains 76 ciphertext runes and ends in original `DJU-BEI`. Under the independent **conditional** crib `OUR OWN`, ordinary `C=P+K mod29` requires final six key symbols exactly `[20,10,26,14,11,1]`. Original p55 has three earlier ciphertext F sites `[15,25,41]`, so a transparent-plaintext-F inverse can have 0–3 nonconsuming skips and must use one of exactly four last-six key windows. Across all **four** BBS byte conventions and those **four** lawful skip totals, the largest match is **1/6**. Thus the literal BBS-byte-mod29 p55 additive key cannot produce that particular original footer crib, even allowing the full F-bypass count. This tail gate is conditional on the unproven crib and does not rule out non-additive BBS consumers.

## Outcome and next decision

The original Parable factorization supplies unusually specific finite mathematical material: an independently printable Blum modulus and seed. A canonical BBS construction, however, reproduces **neither** the original table's bytes **nor** a readable direct XOR plaintext; direct 29-rune pads also fail on the complete unknown book, and the conditional p55 anchor fails. Retire these exact original BBS *direct consumers*, without increasing freedom through arbitrary secret seeds, clock skips, bit permutations or hashes. An independently authored instruction choosing BBS and a different reversible receiver would be required to reopen this lead. The 2013 factor identity remains intact and separately under investigation in the DH73 route.

**Reproducibility:** the passing original-source CommonJS test loads the unchanged canonical 2013-prime-derived constants, the repo's complete original `base60-grid.json`, and the full GP29 `lp2-corpus.json`; it executes the BBS generator, source byte comparisons, ASCII XOR readouts, the original p55/footer F-count constraint, 16 whole-manuscript inverse IoCs, and planted p57 positives. No recovered unknown plaintext, usable original key, or Cicada destination is claimed.
