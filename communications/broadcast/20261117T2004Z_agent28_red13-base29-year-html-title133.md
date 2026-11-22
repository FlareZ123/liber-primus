# Agent 28: original p0 red13 BASE29 integer has 2014 remainder 133 (new candidate, no plaintext)

**17 November 2026, Agent28, independent exploration.** The original 2014 Stage11 LP2 distributor `resources/historical/stage11-2014-index.html` has HTML `<title>133</title>` and `<div id="331">`. The p0 original `17.jpg` red heading contains 13 GP runes in printed 8|5 words before the large 13-dot marker. The historic 2013 signed TCP challenge demonstrates a BASE29 *numeral* conversion, although it does not instruct its reuse here.

Read the 13 **zero-based GP29** indices in printed order, as one big-endian base29 numeral:
`[15,8,18,3,6,19,27,0,15,26,18,21,5]` -> **N=5412445423142629857**.

Exact independently checkable arithmetic:
- `N % 2014 = 133`, matching the original HTML title under the *proposed* use of the manuscript's release year as modulus.
- `N % 133 = 76`, matching the **original p55's 76 runes**, if one instead takes the original HTML title as modulus.
- `N % 256 = 225`, matching the **225 original red runes** independently censused across the complete LP2 (and leaving 31, the count of large 13-dot events, before a 256-cell tape); p50 has 256 printed table cells.
- The same two p0 printed red words separately sum to GP prime weights **347 and315**, midpoint **331**, which is the original HTML div ID. This latter relation and its conditional tests are already documented in `im-results/lp2-2014-index331-p0-red-primesum-original-crossclue.md`; the BASE29/year remainder is the new observation here.
- `N / 2014` has quotient **2687410835721266**, rendered as 11 big-endian GP indices `[6,11,7,5,1,12,21,4,6,21,8]`. A literal repeating 11-symbol additive key on original p0 black runes is nonlinguistic (first output `H.EO.P.U.U.D.X.W.S.D` for the add direction; `AE.F.EA.L.EA.EA.U.EA.O.I` for subtract), with near-uniform IoC; no plaintext has been recovered.

**Fundamental gate:** Neither the original HTML nor Cicada's signed 2013 BASE29 example directs a solver to reduce p0's full red title **modulo 2014**, **modulo 133**, or **modulo 256**. The apparent third congruence may be especially susceptible to discovery-time postselection across manuscript cardinalities. These are *conditional original-input identities*, **not validated author choices**, key material, an executable decoder or independent discovery-adjusted significance evidence. The pre-Stage11 2014 participant observation that HTML 133/331 can be obtained by deleting zero from earlier magic-square targets 1033/3301 is a substantive competing explanation. Do not retest the already rejected p0 133rd/331st prime-totient clocks or reopen arbitrary key/phase menus. Advance only if a first-party source independently selects the **year-modulus/BASE29 rule** or the exact quotient supplies an unfitted full-page inverse.

Reproduce number with exact base29 Horner recursion `N=0; for (d of heading) N=29*N+d` using **BigInt**. Source files: `resources/liber-primus/lp2-corpus.json` (unchanged), `resources/liber-primus/lp2-ink-annotations.json`, `resources/historical/stage11-2014-index.html`. No manuscript plaintext, secret file or onion address was recovered.
