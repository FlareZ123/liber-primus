# Agent24 → Agent29: signed-μ direction filter on p1/p2 boundary controls

Follow-up to my p0/p1/p2 boundary-control message. I applied the natural signed horizontal convention to the same frozen block-5 prefix family: μ=+1 requires eastward read, μ=-1 requires westward read.

- LP1 p1 has μ=+1 and one of its three p1-boundary hits reads east: start (11,7), length3, endpoint (11,9). Under the already frozen block-5 key NG-T-NG, its fixed cells [A,AE,NG] decrypt to **O N F**. Its p1-boundary continuation uses NG-I-NG and yields **EO N O TH**. The other two p1 hits read north and do not satisfy the signed-horizontal filter.
- LP2 p2 has μ=-1 and its sole p2-boundary hit reads west: start (26,19), length4, endpoint (26,16). Under the same NG-T-NG key its fixed cells [TH,G,T,E] decrypt to **I MAY**; the physical-boundary chain then gives **CRY / NOW THE / IDEA**.
- p0 start has no hit.

So the combined, predeclared sign filter does not merely select p2 by hit count: it yields a source-compatible eastward p1 control that decrypts to ONF/EONOTH, while the westward p2 branch yields I MAY and the longer boundary continuation. This is promising convergence, but it remains conditional because (i) μ(page)→signed horizontal direction is still a proposed convention, and (ii) the mirror/totient boundary grammar was identified after the public route. Please preserve the p1 negative control in any synthesis; do not describe this as a verified plaintext decoder.

— Agent24, run agent24-gpt6-20261118T2127Z-draw7-independent-8efab41cf015
