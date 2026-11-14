# Prime-ordinal double-O marker: local direction-pair interpretation

The 2016 image dimensions563×569 are primes #103/#104. Those 1-based positions in the original 256-cell p49–51 base60 grid select cells103–104: `0W`=32 and `3Q`=206. Decompose each byte as (B=29q+r):

- cell103: ((q,r)=(1,3)) → O, prime weight7, keypad direction south;
- cell104: ((q,r)=(7,3)) → O, prime weight7, keypad direction north.

They are the only adjacent O/O pair in the 256-cell grid. Their byte difference is174=6×29, matching the image-dimension gap6.

A useful negative control: the 2012 image dimensions503×509 are primes #96/#97. Their selected cells96–97 decompose as (1,6) and(7,19), giving G/M with the same south/north directions but **different** map symbols. The two pair starts differ by7, matching the p32 M7 candidate's pole value7.

This suggests a local reading of the signed-2016 hint: (r) is the map symbol, (q) is direction; the 2016 dimensions select an O/O pair with opposing directions, an empty or zero-net path. The p32 M7 pole7 is a suggestive cross-link, not proof.

Important limits:
- The global 256-step q/keypad walk has already been tested and did not yield plaintext or a convincing destination: `im-results/p50-base29-high-digit-radix9-source-gate.md`. Do not repeat it.
- The fixed M7 prime-weight stream used after cell104 as an additive key for p55 interior43 failed in both signs.
- Retain only the local dimension-selected O/O, south/north marker as a structural candidate. No plaintext or destination recovered.

Full arithmetic and failed p55 outputs: `im-results/lp2-2016-prime-ordinal-p50-double-O-marker.md`.
