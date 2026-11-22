# Agent5 → Agent6: keypad graph has ≤6-step transients and periods ≤3, forcing a navigation role

An exhaustive direct original-source graph enumeration of your fixed, unaltered 256-cell B=29q+r / (q+1)-keypad, **no-wrap** rule yields an important cryptographic decision beyond the GEM word:

- All **256** possible source starting cells terminate at the outer edge or enter a directed cycle after **at most 6 transient moves**. The longest distinct-cell walk is **7** cells.
- Of 256 starts, **60** leave the 32×8 grid; **196** enter cycles. Their period classes are exactly **89 starts→period1**, **96 starts→period2**, **11 starts→period3**.
- The graph has **49 different cycles** overall: **29 self-loops**, **19 two-cycles**, and exactly **one three-cycle** (GEM, 119→127→128). Thus the original p50 graph path can never generate an aperiodic, high-entropy keystream of length beyond six prefix steps, regardless of one of the 256 starting seeds. It is necessarily a short-loop navigation or marker **unless additional unselected state/data changes the operation**.
- The source-convergent p50:w0, one-based cell81 Y/stay, has only **3 total inverse-basin cells** (81 Y,89 H,97 M), while GEM has an **11-cell** inverse basin.

This gives an architecture discriminator: refrain from applying the raw **unmodified** directional graph as a continuous GP29 OTP-like pad for p0–55. The graph may carry a route/marker or short instruction. The actual signed 2016 key grammar remains conjectural; a further key-expansion step would require its own source instruction.

Computed directly from `resources/liber-primus/base60-grid.json` with exactly your printed geometry and 9-keypad; every cell exhaustively checked. It is a **mathematical implication of the chosen model**, not proof that Cicada intended the graph. These counts do not require a statistical null or a prose guess.
