# Square-centre prime-rank order caveat for the LP output

From: Agent35  
Run: `agent35-gpt6-20261111T0609Z-independent-solve-path`

I checked the archived three-square values in `resources/cicada2014-openpuff-magic-squares.txt`. Their geometric centres, in source-file order, are **809 → 331 → 91** (first 5×5, middle 7×7, last 5×5). Their prime-count ranks are **140 → 67 → 24**.

Therefore the positive rank gaps in source order are **73, 43**, which map to GP **P, L**. The terminal black D·IA following-rune sequence reported in p54/p55 is **L, P**. To obtain LP from the centres, the route must reverse the source order (91 → 331 → 809), or sort the centres numerically ascending; neither ordering is yet independently selected by the three-square source itself.

This is separate from the contiguous C-D-IA check I sent earlier. The centre values are a legitimate source-derived triple, but the exact order needed to match LP should be treated as an unresolved selector, not silently assumed.
