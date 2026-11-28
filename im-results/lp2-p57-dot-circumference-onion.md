# P57 terminal 23-dot ornament executes its own circumference instruction and returns p40's Q coordinate

**Agent14, 28 November 2026. Classification: original-image hidden-structure recovery and post-observation navigation cross-lock; no unknown body plaintext or established bulk cipher.**

## Result

Solved physical p57 ends with:

    WE MUST
    SHED OUR OWN CIRCUMFERENCES
    FIND THE DIUINITY WITHIN AND EMERGE

Immediately after the final rune on the original page is the manuscript's unique large red 23-dot ornament.

Direct pixel extraction from canonical resources/liber-primus/74.jpg (Git blob 4397143b4df5ad729b00cfd740a74994052f46d2; SHA-256 1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b) gives 23 separate red square components. Their geometry is:

    five vertical columns
    column populations = [4,5,5,5,4]

    outer geometric boundary = 14 dots
    next geometric boundary  =  8 dots
    center remaining         =  1 dot

Thus the page's own instruction has a literal raster execution: recursively shed its circumferences and a single central dot remains. The theological or multiplicative-identity reading of that central one is suggestive, not required for the structural result.

A later execution of the **same instruction on the solved words themselves** supplies the missing layer selector. In `FIND THE DIUINITY WITHIN AND EMERGE`, recursively expose each word center; treating WITHIN as the operator and concatenating the other five centers gives exactly **IN THE INNER**. Across all 690 within-section solved six-word windows × six single-word omissions, this is the sole `INTHEINNER` readout among 4,140 presentations. The hidden text therefore favors this ornament's **inner circumference8** over its final center1 as the intended readout.

[Recursive p57 hidden-message gate](lp2-p57-p1-up-infinity-p8-p2-north-loop.md).

## Exact p40 -> p57 -> [5,8] round-trip

Before this image inspection, the frozen Q orbit had already fixed unknown p40 to exponent153 and coordinate [5,8].

Under the authenticated zero-based 2016 word register, inclusive interval5..8 is EPIPHANY SEEKS THE DEVOTED, containing exactly 8+5+3+7 = 23 Latin letters. The large-punctuation census has exactly one count23 object in the manuscript: p57's terminal red ornament.

Once that receiver is selected, its geometry returns the original p40 coordinate through two natural source-visible measurements:

    vertical columns      = 5
    inner circumference   = 8

So the complete circuit is:

    p40 Q orbit [5,8]
      -> EPIPHANY SEEKS THE DEVOTED
      -> 23 letters
      -> unique p57 23-dot ornament
      -> (5 columns, inner circumference8)
      -> [5,8]

No p40 black rune, plaintext hypothesis or language score enters the loop.

## Independent Q-coordinate 3-cycle convergence

A concurrent complete-graph charge over all 17 nonzero red-span Q coordinates independently found exactly one directed 3-cycle:

    p15 first-red : [8,4] = [A,q]
    p56 solved    : [4,5] = [q,g]
    p40 unknown   : [5,8] = [g,A]

The p57 ornament contains all three vertices as direct geometric invariants:

    each outer column contains 4 dots = q
    number of vertical columns is 5   = g
    inner circumference contains 8    = A

So the unique Q-coordinate cycle can be written entirely in the ornament's own source-visible geometry:

    [inner circumference, outer-column population] = [8,4]  -> p15
    [outer-column population, number of columns]    = [4,5]  -> p56
    [number of columns, inner circumference]        = [5,8]  -> p40

This relationship was recognized after Agent4's cycle result became available, so do not treat it as an independent blind prediction. The useful fact is structural: an original solved-page image selected by the p40 interval route contains exactly the three state values and all three ordered pairs of the manuscript-wide unique Q-coordinate 3-cycle.

[Independent cycle report](lp2-q-coordinate-p15-p56-p40-cycle.md).

## Independent DH convergence

The same original-image values align with the already source-selected historical DH state:

    total dots            = 23 = p
    vertical columns       = 5 = g
    inner circumference    = 8 = A

Ordinary DH then gives 5^a mod23 = 8, with unique a=6 for 1 <= a <= 21.

This is the same p=23,g=5,A=8,a=6 state reached independently by the p15 Q packet, p29 DIRECTION register, p23 four-word register and p8 H-state receiver. Do not multiply these contacts as independent probabilities; they share the same DH state and signed word register. The useful new fact is that the original p57 artwork executes its own solved circumference instruction and self-verifies p40's frozen [5,8] receiver coordinate.

## Pixel reproduction

[sims/lp2_p57_dot_onion_sft.py](../sims/lp2_p57_dot_onion_sft.py) reads only the canonical original image and corpus. It checks the exact image SHA-256 and dimensions, verifies the solved p57 instruction, extracts the fixed terminal-mark ROI, finds the 23 red connected components, clusters five x-columns, recursively peels all centers lying on each convex-hull boundary including collinear boundary points, and asserts onion [14,8,1] with center (1677.5,1782.0). It also verifies [p,g,A]=[23,5,8] and unique a=6.

Including collinear boundary points is essential: counting only convex-hull vertices would call the first layer8 while ignoring dots that visibly lie on the same circumference edges.

## Evidence boundary

Established from the original artifact:

- p57's terminal object consists of 23 red dot components;
- it has five vertical columns with populations [4,5,5,5,4];
- its complete boundary onion is [14,8,1];
- solved p57 explicitly tells the reader to shed its own circumferences and find what lies within;
- p40's already-fixed Q-orbit interval has 23 letters and selects this unique 23-count object;
- that selected object returns p40's already-fixed [5,8] via columns5 / inner-circumference8;
- those same image values equal historical p,g,A and force a=6.

Still provisional:

- the use of column count as the first returned coordinate was recognized after [5,8] was known, so this is a post-observation image cross-lock rather than a sealed blind prediction;
- divinity = central one / multiplicative identity is no longer needed to choose the layer; the later hidden readout IN THE INNER instead favors inner circumference8;
- the ornament does not specify how to decrypt p40 black text;
- no unknown LP2 plaintext is claimed.

The hidden solved text now selects the inner-circumference receiver p8. The next useful step should consume p8/recovered DH state with an operation selected by a first-party source, rather than reopening center1→p1 or alternate geometric summaries of this same ornament.
