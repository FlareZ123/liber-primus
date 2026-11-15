# 2014 Stage10 filename triple: original LP2 whole-word boundary gate

**Decision, 15 November 2026.** The 13 February 2014 Stage10 response lists three original JPEGs as **107.jpg, 167.jpg, 229.jpg**; their source objects have already been identified as LP1 pp14–16. The exact ordered three-number run appears superficially in LP2 physical p26→p27 **only when a page-carried fragment is incorrectly counted as a complete word**. Restoring original words across printed line and page breaks eliminates that two-page route: **0 hits among all 55 consecutive pairs of physical p0–55 page slots** (p50 is rune-free). This excludes this narrow *complete-word source-filename route*, without excluding arbitrary numeric clues or recovering unknown plaintext.

## Why the candidate deserved a direct test

The 2014 names predate the LP2 release and therefore provide a finite, independently published set of three exact numbers. LP1 explicitly teaches summing Gematria Primus prime values of *complete printed words*, so scanning original LP2 printed words for their three sums is at least a motivated operation.

A page-fragment scanner initially gave the ordered sequence:
- p26 starts with one rune **IA**, valued **107**.
- p27 contains the actual complete word **OE.J.X** at rune offset95, sum **167**.
- p27 contains the actual complete word **Y.L.S** at rune offset163, sum **229**.

Under an erroneous “new word at each page” assumption, p26/p27 alone has all three values in order within a two-page span; this could falsely appear to corroborate the independent p55→p27 seven-rune seam. There is no such three-word sequence in the original unbroken text.

## Exact original boundary obstruction

The original physical p25 ends with **IA.E.T.EA.U** and no terminal separator. The very first rune on physical p26, **IA**, is immediately followed by a separator. These parts form **one six-rune printed word** across the physical page boundary:
\`IA.E.T.EA.U.IA\`, GP-prime sum **452**. Its tail alone has value107; it is **not a 107-valued word**.

The only other physical p0–55 page that begins with a standalone-looking IA fragment is p49. Original p48 ends with **EO.F.U.D.Y.A.L.F** and no separator; the initial p49 **IA** completes that nine-rune word, prime sum **517**, rather than forming a separate 107-word. Therefore the two apparently promising p26 and p49 page-initial 107 values share the same page-carried-fragment explanation.

The p27 **167** and **229** sums are authentic complete words, but neither is preceded by a complete source word of value107 in p26 or any other immediately preceding physical page. The source-valid two-page ordered-triple census is empty. The independent initial-page-filename route proposed in [the Stage10 original-object handoff](2014-stage10-three-images-lp1-source-handoff.md) remains unsupported.

## Exact read-only reproducer and scope

[Run the original-input SFT](../sims/lp2_stage10_filename_wholeword_boundary_sft.cjs): \`node sims/lp2_stage10_filename_wholeword_boundary_sft.cjs\`. It consumes the original transcribed rune stream and the repository's pinned GP29 rune/prime chart. Slash line breaks and physical page breaks are removed **without inventing word separators**; printed hyphens and punctuation remain word boundaries. It asserts **2,896 original complete unknown words**, **32 words physically carried across pages**, 13,136 GP29 runes including solved pp56–57, the two complete page-carried sums452/517, and absence of the exact 107→167→229 whole-word sequence in every source-valid two-page window.

The historic filename arithmetic is exact, yet this tested LP2 connection depends on a false boundary. A legitimate successor needs a **different source-authored selection** of the 2014 three original images and a complete ciphertext consumer producing continuous authentic plaintext with independent reencryption. No new plaintext, key, or established cipher mechanism is claimed.
