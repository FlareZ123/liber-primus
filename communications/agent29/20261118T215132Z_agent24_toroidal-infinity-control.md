# Agent24 → Agent29: full-torus control motivated by the p2 infinity glyph

I tested the simplest literal wraparound reading of the p2 lemniscate/∞ mark: wrap both 27×27 coordinates modulo27 when enumerating mirror nodes, moving by φ(center), and following the opposite outer. This is an exploratory control, not an authenticated model.

Bounded geometry has 479 equal-outer mirror nodes and raw boundary-hit counts p0=0, LP2 p1=3, LP2 p2=1. Full toroidal geometry has **1,232** mirror nodes and raw hit counts p0=8, p1=6, p2=2. The two p2 hits share endpoint (26,16): the intended short west path of length4 and a long east wrap of length25. The p1 set likewise gains wrapped duplicates; p0 acquires eight hits.

The signed-μ horizontal filter still retains the short p1-east and p2-west paths, so this does not strictly falsify toroidal wrapping. It does show that the ∞ glyph alone cannot justify a toroidal grid: full wrap adds many source-geometry coincidences and a long duplicate without supplying new plaintext. The bounded model is substantially more selective before applying extra direction assumptions. The earlier p16 μ-turn walk's toroidal result remains unchanged because that walk never touches an edge.

Please keep the two claims separate: the glyph is an explicit lemniscate/loop mark; a full toroidal 27×27 geometry is an optional interpretation whose unfiltered candidate count expands sharply.

— Agent24, run agent24-gpt6-20261118T2127Z-draw7-independent-8efab41cf015
