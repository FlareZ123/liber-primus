# P57 circumference instruction exposes a manuscript-wide red-punctuation morphology register

**Agent14, 28 November 2026. Classification: exact original-raster morphology census plus a post-discovery DH-state interpretation; no unknown body plaintext.**

## Discovery

The solved p57 instruction says to SHED OUR OWN CIRCUMFERENCES / FIND THE DIUINITY WITHIN AND EMERGE. Its unique terminal 23-dot ornament literally supports recursive circumference peeling.

A corpus-wide raster charge now shows this is not an isolated shape. Using one fixed red-pixel/component detector on every original LP2 source image 17.jpg through 74.jpg, the detector recovers exactly the red large-punctuation census already recorded independently in the canonical ink annotations:

    count13 red marks: 30
    count10 red marks:  4
    count23 red marks:  1

(The annotation corpus has one additional black 13-dot mark on p7; the image scan here is red-only.)

Every detected class has a single morphology signature:

    mark count   x-column populations   circumference onion   multiplicity
    ----------   --------------------   -------------------   ------------
        13             [4,5,4]               [10,3]               30
        10             [3,4,3]                [8,2]                4
        23          [4,5,5,5,4]             [14,8,1]               1

There is no shape variation inside any red count class under the fixed detector.

## Literal circumference readout

Applying the operation explicitly taught on solved p57 gives immediately visible interiors:

    every red 13-mark: shed outer circumference10 -> 3 dots remain
    every red 10-mark: shed outer circumference8  -> 2 dots remain
    unique red 23-mark:
        shed outer circumference14 -> 9 dots remain
        shed next circumference8   -> 1 center remains

The 23-mark is source image74/p57, exactly as the annotation census says.

This establishes a genuine hidden structural grammar in the original artwork: the large punctuation values are not merely totals. Their internal layouts were drawn as fixed peelable lattices.

## DH-state convergence

Under the independently selected signed-2013 DH procedure and the already established p29/p15/p23/p8 state dictionaries, the morphology exposes:

    p = 23  unique terminal mark total
    g = 5   number of columns in the 23-mark
    A = 8   inner circumference of the 23-mark
    e = 3   invariant interior after peeling every 13-mark
    K = 2   invariant interior after peeling every 10-mark

Those five source-visible values are sufficient to recover the rest without tuning:

    b = e^-1 mod(p-1) = 3^-1 mod22 = 15
    5^a mod23 = 8     -> unique a=6 in 1..21
    B = 5^15 mod23    = 19

and the shared-key equations verify:

    8^15 mod23 = 2
    19^6 mod23 = 2.

So the morphology reconstructs the full ordinary state:

    (p,g,a,b,A,B,K,e)
      = (23,5,6,15,8,19,2,3).

It also contains the q/g/A values of the independently discovered unique Q-coordinate 3-cycle: each outer column of the 13- and 23-marks has four dots (q=4), the 23-mark has five columns (g=5), and its inner circumference has eight dots (A=8).

## Why this materially changes the route

Before this result, p=23, g=5, A=8, e=3 and K=2 were recovered through several algebraic/state routes, while the large dot marks were mostly used as counts.

The original raster now supplies a single human-visible operation, explicitly stated on solved p57, that organizes all red punctuation classes and reproduces the same state values. This is much closer to an intended puzzle mechanism than treating 10/13/23 as independent decorative counts.

It also strengthens the p40 receiver round-trip:

    p40 Q orbit [5,8]
      -> signed interval EPIPHANY SEEKS THE DEVOTED
      -> 23 letters
      -> unique p57 23-mark
      -> five columns / inner circumference8
      -> [5,8].

The receiver is therefore self-checking at the image level.

## Reproduction

[sims/lp2_punctuation_circumference_morphology_sft.py](../sims/lp2_punctuation_circumference_morphology_sft.py) runs the complete source-image census.

Fixed detector:
- source images 17.jpg through 74.jpg;
- red threshold R>150, G<80, B<80;
- square-component area40..100 pixels and width/height6..11;
- punctuation clustering by center distance <=25 pixels;
- only the source-established 10/13/23 classes are retained;
- geometric boundaries include collinear points within1 pixel of the convex-hull edges.

It cross-checks the raster multiplicities against lp2-ink-annotations.json before interpreting geometry, then asserts the three unique morphology signatures and reconstructs the DH state.

The exact local execution on the canonical uploaded original-image archive returned those counts/signatures and the state above.

## Evidence boundary

Exact observations:
- the red raster census matches the independent red annotation census: 30x13, 4x10, 1x23;
- all members of each count class have exactly one shared column/onion signature;
- the p57 23-mark executes the solved circumference instruction literally;
- the peeled/interior values are exactly 3, 2, 8 and 1 as stated;
- together with total23 and five columns, the values close the historical DH equations exactly.

Interpretive boundary:
- p57 explicitly tells its own page to shed circumferences; extending that operation to the visually identical punctuation family across the book is strongly motivated but still an inference;
- assigning the resulting 23/5/8/3/2 specifically to p/g/A/e/K uses the already established DH state and is post-discovery, not a blind key recovery;
- the result identifies hidden state structure and an intended-looking visual mechanism; it does not yet specify the black-body cipher or recover unknown plaintext.

Do not mine additional raster thresholds or alternate geometric summaries to fit more state labels. The productive next step is to use this fixed morphology grammar to select an operation or receiver prospectively.
