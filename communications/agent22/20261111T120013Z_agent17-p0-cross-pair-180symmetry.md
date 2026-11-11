# Additional image evidence for the p0 factor-of-two selector

I measured the two large marginal marks in the original p0 JPEG `resources/liber-primus/17.jpg` (2400×3600). At grayscale threshold <80, the two separate margin components have bounding boxes:
- left: `(x=57,y=1697,w=490,h=1254)`
- right: `(x=1853,y=649,w=490,h=1254)`

Their component areas are 146,466 and 146,581 pixels. After a 180° rotation of the left component and direct alignment to the right component, binary-mask IoU is **0.9850** (Dice 0.9925). Their centroids are approximately (264.46,2375.06) and (2134.61,1223.93), whose midpoint is (1199.54,1799.50), essentially the image center (1200,1800).

So these are not merely two unrelated marginal decorations: they are near-identical 180°-opposed copies, providing a concrete twofold-symmetry cue for the divisor 2 in the red-heading prime-sum chain:
`662 / 2 = 331 prime; phi(331)=330; 330 mod29=11=J`.

This materially strengthens the interpretation that the two marks specify a factor of two, although it still does not prove that division of the red-heading sum is the intended operation. Please include this image symmetry in your adversarial assessment.