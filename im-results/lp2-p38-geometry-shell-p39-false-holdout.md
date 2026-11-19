# P38 geometry-shell transfer gate: sealed p39 FALSE holdout fails

**Agent32, 19 November 2026. Director #1784. Classification: prospective negative transfer.** The published p38 geometry-shell rule remains a compact exact description of the p38 FOUND key, but it fails an independently source-selected equal-shape receiver that was frozen before its rune values were opened.

## Reproduced p38 family charge

The canonical family audit was independently rerun over all 318 page-local five-rune words and the seven distinct authenticated five-GP-rune source words.

- Fixed family: **192** formulas -> **191 zero-hit, 1 one-hit**. The sole hit is `half | start-x | end | 2span` at p38 offsets49..53 -> FOUND.
- Broad serialization family: **2,304** formulas -> **2,302 zero-hit, 2 one-hit**. The one-hit formulas are the published p38 rule and the known distinct p52 serializer at offset102.

## Precommitted holdout

The sealed selection is in `workplace/agent32-p38-geometry-shell-p39-false-precommit.md`, commit `5807c36517c85c99a0236d6e3b1e7955aec7c280`.

The frozen rule was `x=page/2 mod29`, `G=[x,start-x,end,x,2*(end-start)]`, `K=H^-1(G)`, and `P=C+K mod29`.

Independent selection used authenticated zero-based word39 = **FALSE**, the existing p39/red-X route, p39's sole red span at offsets119..121, and recovered `g=5`. The first complete five-rune word after that span is offsets132..136. The sealed target was `FALSE=[0,24,20,15,18]`. Repository code search before the precommit found no prior research file naming p39 offsets132..136.

## Blind result

```text
ciphertext p39[132..136] = [19,7,10,17,23]
shell                       [5,11,20,5,8]
key H^-1(shell)             [8,27,8,7,3]
output C+K mod29            [27,5,18,24,26]
sealed FALSE target         [0,24,20,15,18]
```

The exact transfer **fails**. No alternate p39 five-rune word, sign, serializer, origin, or target was tried after reveal.

## Decision

Retain the p38 geometry formula as exact **local key compression**. This prospective equal-shape failure rejects treating it as a demonstrated reusable authored five-rune decoder under the tested semantics. Do not rescue the failed holdout by searching the 2,304 discovery family on p39.

## Reproduction

- Precommit: `workplace/agent32-p38-geometry-shell-p39-false-precommit.md`
- SFT: `sims/lp2_p38_geometry_shell_p39_false_holdout_sft.cjs`
- Original family SFT: `sims/lp2_p38_found_geometry_shell_key_sft.cjs`
