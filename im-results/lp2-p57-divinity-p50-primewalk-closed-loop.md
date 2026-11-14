# p57 DIVINITY → p50 directional GEM cycle → byte-193 zero exit

**Agent12, 14 November 2026. Evidence classification:** newly observed exact original-corpus arithmetic and a bounded source-motivated navigation hypothesis. **No decrypted unknown LP2 rune, original decryption key, complete cipher mechanism, destination, or authenticated instruction has been recovered.** [Single-file original-source reproducer](../sims/lp2_p57_divinity_p50_primewalk_sft.cjs); [manual Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/43637355165).

## Why this specific start is available to a human solver

The original *solved* p57, the book's closing PARABLE, explicitly says **“FIND THE DIVINITY WITHIN AND EMERGE.”** DIVINITY is also the established, historically used Vigenère key in the earlier solved part of Liber Primus. This selects an already-meaningful **whole GP word**, independently of the previously identified p50 GEM path.

The eight **original printed p57** rune symbols for the word are *D I U I N I T Y* in GP transliteration (the U rune encodes Latin V): source original runes are \`ᛞᛁᚢᛁᚾᛁᛏᚣ\`. The exact GP-prime sum is

\[
89+31+3+31+29+31+59+103 = \mathbf{376}.
\]

The original pp49–51 physical table has exactly **256 printed base60 bytes** in a source-preserving 32×8 join (original printed tokens span 80+104+72 cells). The **candidate**, not author-signed, convention to turn the word number into a one-based table cell is \`376 mod 256 = 120\`.

The graph *operation* was already fixed by earlier independent work, not tuned in this investigation: split each canonical base60 byte into \`B = 29q+r\`, use the GP29 remainder \`r\` as a rune and \`q+1\` as a standard 3×3 keypad direction (1=SW, 2=S, 3=SE, 4=W, 5=stay, 6=E, 7=NW, 8=N, 9=NE). Follow the directed edge on the original finite 32×8 table, with no wrap, stopping before repeating a cell. The unsigned 2016 text's phrase **“their numbers are the direction”** is motivation for a directional interpretation; it never specifies this keypad, graph start, or stop convention. See [the existing complete graph analysis](lp2-p50-directional-functional-graph-prime-ordinal-starts.md).

## Exact original source readout

Applying the *unchanged* graph to the new solved-p57 word start **120** gives:

| One-based cell | Original token | Canonical byte | \`q\` | \`r\` | GP rune/prime | Keypad move and next cell |
| ---: | --- | ---: | ---: | ---: | --- | --- |
| **120** | \`34\` | 184 | 6 | 10 | **I / 31** | NW → 111 |
| **111** | \`0W\` | 32 | 1 | 3 | **O / 7** | S → 119 |
| **119** | \`0Z\` | 35 | 1 | 6 | **G / 17** | S → 127 |
| **127** | \`2h\` | 163 | 5 | 18 | **E / 67** | E → 128 |
| **128** | \`3D\` | 193 | 6 | 19 | **M / 71** | NW → 119 (first repeated cell) |

The exact five-rune path is **I O G E M**, then the existing unique three-cycle **G → E → M**. The original signed 2016 JPEG's width **563** is the 103rd prime; the already published source candidate starting at table cell103 follows **103→111→119→127→128**, readout **O O G E M**. These *different original selectors meet immediately at cell111* and then share OGEM. The earlier original p10 printed \`7\` next to a one-rune G likewise admits the previously studied 7×17=119 start at the GEM loop. These three addresses are not three independent validations: the graph/cycle is shared, and the address derivations contain analyst choices.

The new route admits an additional **exact, retrospective numerical closure**:

\[
\operatorname{GPprimeSum}(\text{I O G E M})
 =31+7+17+67+71
 =\mathbf{193}
 =\operatorname{byte}(\text{cell 128}).
\]

If, **as a newly hypothesized continuation**, that complete five-rune prime sum is treated as another one-based cell address, the original **cell193 contains literal token \`00\`**, byte zero. GP29 remainder zero is **F**, the historically observed transparent/bypassed symbol of solved LP1/p56 ciphers. Its quotient zero selects keypad SW, which immediately **exits the 32×8 grid** because cell193 is in its leftmost column (physical row25, col1). Thus the conditional route has a finite **zero/F exit** at a position numerically selected by the preceding path itself, with a thematic possible connection to p57's “emerge.” No source instructs the extra prime-sum-to-cell jump, or asserts that the terminal F is a decryption rule.

## Finite checks on the unchanged corpus

The [SFT](../sims/lp2_p57_divinity_p50_primewalk_sft.cjs) derives the source word from the original p57 line-break text, reads the canonical GP-prime table and 256 canonical base60 bytes, reconstructs every edge, checks the 2016 pre-existing cell103 route and enumerates **all 256** start cells under the identical no-wrap graph.

- Exactly **two starts**, 120 and 123, yield a path whose **complete un-repeated GP-prime sum equals the byte at the path's last visited cell**.
- Exactly **four starts**, 66, 120, 180 and 247, yield a complete-path prime sum that directly addresses **one of the original two zero-byte cells**.
- **Only start120** satisfies *both* properties simultaneously. Its full five-node path ends at the three-cycle and the zero lookup exits the grid. Exactly **one of p57's 20 original printed whole words**, DIVINITY, sends its unmodified GP-prime sum modulo256 into that three-cycle.
- The two original zero bytes are at table cells **193 and 230**. The first, uniquely used here, is situated on the left edge; SW exits rather than wrapping.

As an **exploratory, post-discovery diagnostic**, a deterministic seeded 100,000-trial Fisher–Yates shuffle of all 256 original base60 **bytes** (preserving the exact multiset and each byte's joint quotient/remainder) freezes start120, keypad, sum test and zero target. Seed: xorshift32 \`0x12010357\`. Raw counts: **538/100,000** path-sum-equals-last-byte, **675/100,000** prime-sum-index-points-to-zero, **2/100,000** joint, **0/100,000** joint with an exactly five-node cycle path. The source table meets the final version. These are **not confirmatory p-values**: the tested arithmetic closure, zero jump, graph encoding, stop and word-selection narrative were all noticed or selected during substantial prior exploration. The experiment measures the proposed conjunction within one frozen null only; it does not correct the many explanations tried or prove intentional construction. The zero-jump reference itself arises after looking at the unusually satisfying original terminal.

## Causal decision

This is a **new possible human navigation path** that intersects the existing p50 GEM marker and ends at a **source-zero/F exit**. It is worth preserving because the starting word is visibly commanded by a solved manuscript sentence, was already used as a real Cicada Vigenère key, and requires no invented high-entropy key. The two new numerical equalities are exact and mechanically reproducible.

The weakest assumptions are the **modulo256 conversion**, the previously exploratory **keypad interpretation** of the byte quotient, and particularly the *post hoc* **prime-sum-to-next-cell jump**. No original author artifact currently specifies their composition. The output IOGEM is a five-rune label, not a recovered unknown ciphertext word; no unknown page is decrypted by the route.

**Next discriminating task:** find an independent original 2014–2016 instruction or unmodified artifact that explicitly chooses the quotient/keypad and the prime-sum return-to-grid step, or supplies a direct use of the terminal F as a cipher instruction. Then freeze a decoder on an unsolved original rune passage before attempting plaintext. Do **not** rerun generic GEM-password stego, period-five DIVINITY Vigenère, p50 all-phase grid keystreams, or arbitrary keypad orientations: those were already extensively tested, and the present circuit does not improve their cryptographic case.
