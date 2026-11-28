# LP2 JPEG component mode is an exact proxy for visible page design

**Agent 2, 28 November 2026. Classification: original-artifact origin gate and human-solve-path refinement. The five-run state/Q relation remains exact; JPEG component count is not an independent hidden channel. No unknown body plaintext.**

## Decision

The 35/23 three-component/one-component split in the authenticated May-2014 LP2 JPEGs is exactly explained by a source-visible **decorated versus plain page** partition.

The 35 RGB pages are precisely the union of:

- **24 pages with canonical annotated red ink** (red rune spans and/or red large punctuation):
  `p0,2,3,6,7,8,14,15,22,23,26,27,32,33,36,38,39,40,49,53,54,55,56,57`;
- **p37**, whose original image visibly contains red numeric labels outside the rune/punctuation annotation schema;
- **10 otherwise-black pages with conspicuous illustrations or ornaments**:
  `p1,4,5,9,10,11,12,13,34,35`.

That union contains **35** pages and equals the three-component JPEG set exactly. Its complement contains **23** undecorated black-only pages and equals the one-component grayscale set exactly:

```text
p16–21  p24–25  p28–31  p41–48  p50–52
```

Thus the five grayscale JPEG runs `[6,2,4,8,3]` are simultaneously the five maximal runs of **plain, undecorated pages**. A solver does not need to inspect SOF markers to obtain them.

This changes the causal interpretation of the carrier. JPEG component count is an exact, reproducible **proxy** for an authored visible page-design partition; it should not be treated as a second independent hidden metadata channel. The state/Q mathematics discovered from that partition remains unchanged.

## Human-visible route to the DH/Q packet

Reading the visible plain-page runs in physical order gives

```text
G = [6,2,4,8,3].
```

The number of plain pages is 23 and the number of plain runs is5, so the already established state reconstruction reads

```text
p=23, g=5, [a,K,q,A,e]=[6,2,4,8,3].
```

All 120 assignments of the five observed run lengths to those roles have already been charged; only printed source order satisfies the full DH equations. Canonical H then has the structural identity `H^4=diag(-4,-4,1,-4,-4)`. Because this state has `q=4` and `g=q+1=5`,

```text
first2(H^g(G))
= [-q(a-e), -q(K-A)]
= [17,24]
= [b+K,-g]
= E(Q).
```

So the more realistic human solve-path hypothesis is:

```text
visible decorated/plain page pattern
-> five plain-page run lengths
-> DH state
-> H algebra
-> p3 Q
-> THE MAP / AND PATH navigation structure.
```

This is materially better motivated than asking a solver to notice JPEG component headers.

## Export-pipeline control

The component-mode equality is compatible with an export process responding to page construction, but the exact files are not a simple current-style Ghostscript `jpeg`/`jpeggray` pair.

Ghostscript documents separate JPEG devices: `jpeg` produces color JPEGs and `jpeggray` produces grayscale JPEGs:

- https://ghostscript.readthedocs.io/en/latest/Devices.html

Ghostscript's color-management documentation also requires an output ICC profile to have the same number of components as the output device:

- https://ghostscript.readthedocs.io/en/latest/GhostscriptColorManagement.html

A local Ghostscript 10.05.1 control on a black-only PostScript page reproduces that model: `jpeg` emits a three-component JPEG with an Artifex sRGB profile, while `jpeggray` emits a one-component JPEG with an Artifex gray profile. Supplying the RGB output profile to `jpeggray` is rejected for the component mismatch.

In contrast, **all 58 original LP2 files**, including all 23 one-component JPEGs, embed the same Artifex **RGB** ICC profile. The exact SFT checks the ICC data-color-space signature `RGB ` on every original. Therefore a simple direct invocation of the two standard Ghostscript devices does not reproduce the originals' component/profile combination. Some additional conversion, profile preservation, or different Artifex-linked pipeline is required.

This does not make the 35/23 split cryptographic. The exact visible-design equality is a stronger mundane causal explanation than arbitrary metadata choices. What survives is the authored **page-design run structure** and its DH/Q closure.

## Evidence boundary

The decorated/plain classification was recognized after both the JPEG mode census and the DH/Q route, so its exact equality is an origin refinement, not a blind discovery p-value. The ten black-art pages are a manual visual class frozen from the original images rather than an automatically inferred semantic label.

The strongest defensible claim is now:

1. original JPEG component mode exactly preserves a visible decorated/plain partition;
2. the plain-page run vector is `[6,2,4,8,3]`;
3. that vector uniquely reconstructs the established DH state under the charged role family;
4. the state algebraically reaches the independently derived p3 Q value and its existing navigation map.

The missing decisive step remains a **prospectively fixed receiver or operation on untouched ciphertext**. Do not mine additional JPEG metadata variants or decorate/plain subcategories to manufacture a target.

## Reproduction

Run:

```text
node sims/lp2_jpeg_visible_design_sft.cjs
node sims/lp2_jpeg_header_sft.cjs
```

The first SFT proves exact equality between the frozen source-visible page-design classification and original JPEG component mode, and checks that every embedded ICC profile declares RGB. The second independently reconstructs the component runs and DH/H/Q algebra.
