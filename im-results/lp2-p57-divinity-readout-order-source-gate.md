# DIUINITY inner→outer order is independently selected by p50 physical reading order

**Director task:** #1565  
**Classification:** positive source-order discriminator inside the still-conditional GP-prime-sum→p50-address route. No unknown plaintext or new key recovered.

The remaining symmetry from #1540 was `2800` versus `0028`. Both use the same already-fixed zero-based row-major addresses, but prior synthesis chose inner→outer because the retained 2013 participant transcript contains the historical value 2800. That made the final ordering target-assisted.

The original p50 layout supplies an independent graphical order.

## Source-only geometry

The fixed DIUINITY operands are:

- strict-interior GP-prime sum: **184**;
- shed-endpoint GP-prime sum: **192**.

With the already-discriminated zero-based row-major 32×8 address grammar:

- address **184 = row23, column0**, token **`28`**;
- address **192 = row24, column0**, token **`00`**.

They are therefore in the **same first column on consecutive printed rows**. More strongly, these are the first two rows of original physical image **68.jpg**:

```text
28 2a 0J 1L 0c 3C 2o 0X
00 2Z 2d 1T 2u 1t 1j 0l
...
```

No token meaning is needed to choose their order. Ordinary top-to-bottom reading of two vertically adjacent table cells selects address184 before address192 and therefore produces:

```text
28
00
=> 2800
```

The reverse `0028` requires reading this two-cell vertical pair bottom-to-top.

This selector exists entirely in the original LP2 object and is visible before consulting the March-2013 DH transcript.

## Relation to the p57 wording

The clear source text ends:

```text
WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN AND EMERGE
```

That sentence motivates constructing the shed circumference and strict interior. Its **action sequence** names shedding before finding the interior, so the prose alone does not justify inner→outer numeric concatenation and should not be cited as doing so. In fact, if action order were mechanically converted into output order it would point the other way.

The order selector instead comes from the **receiver object**: once the two already-fixed addresses land on p50, their physical table geometry gives a canonical top-to-bottom readout. This is stronger than forcing the prose to order two derived numeric operands it never explicitly presents.

## Decision

**Positive for #1565.** Conditional on the still-unproven step “use the two GP-prime sums as literal zero-based row-major p50 addresses,” the final token order no longer needs the historical target:

1. inner sum184 selects the first cell of original image68 row1;
2. outer sum192 selects the first cell of the immediately following row;
3. ordinary top-to-bottom reading yields `28 00`;
4. only after that source-fixed readout is formed does the historical participant transcript provide the independent `2800` match.

This removes the target-assisted **ordering** objection from the DIUINITY bridge. It does **not** remove the larger causal gap identified by #1566: no source rule has yet proved that unreduced GP-prime sums should be treated as p50 addresses at all.

## Reproduction

- `sims/lp2_p57_divinity_readout_order_source_sft.cjs`
- `.github/workflows/agent5-divinity-readout-order-manual.yml`
- source inputs: `resources/liber-primus/lp2-grid-256.json`, `resources/liber-primus/lp1-plaintext-reference.txt`, original `68.jpg` / `74.jpg` from the project source corpus.
