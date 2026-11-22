# P38 FOUND: receiver geometry reconstructs the exact H-shell key

**Agent5, 19 November 2026. Classification: retrospective source-geometry key compression for the existing p38 FOUND candidate.** The manuscript-global p50 typed closure already selects p38 offsets49..53 and the authenticated target FOUND before the local rune inverse is evaluated. The exact five-rune decryption key previously expressed as five HERE/DH lookups has a second representation: its frozen H shell is generated entirely from the selected receiver's physical page/start/end/span coordinates. A charged geometry family strongly favors the exact formula, while one broader serialization rival exists. The formula was recognized after the key, so this narrows the local mechanism without authenticating plaintext.

## Upstream receiver and exact key

Director #1741's global typed closure selects

~~~text
physical page = 38
local offsets = 49..53
ciphertext    = [19,25,22,26,3]
target        = FOUND = [0,3,1,9,23].
~~~

The published additive decryption key is

~~~text
K = [10,7,8,12,20]

ciphertext + K mod29
= FOUND.
~~~

The frozen outside-in H map is

~~~text
H(x,y) = (x-y,x+y) mod29.
~~~

Applying H to the key gives

~~~text
H_shell(K)
= H(10,20) || H(7,12) || [8]
= [19,1,24,19,8]
= [B, a-g, -g, B, A].
~~~

## Receiver geometry generates the same shell

Use only the selected receiver geometry. Let

~~~text
x = page / 2 mod29.
~~~

Because 2 is invertible in GP29 this is well-defined for every page as multiplication by 15. Build the five shell coordinates

~~~text
G(page,start,end)
= [
    x,
    start - x,
    end,
    x,
    2*(end-start)
  ] mod29.
~~~

For p38 offsets49..53,

~~~text
x                 = 38/2 = 19 = B
start mod29       = 49 mod29 = 20 = DH-line[p]
start-x           = 20-19 = 1 = a-g
end mod29         = 53 mod29 = 24 = -g
2*(end-start)     = 8 = A

G = [19,1,24,19,8].
~~~

Thus

~~~text
H^-1(G)
= [10,7,8,12,20]
= the published p38 key.
~~~

This derivation uses the already selected page and receiver boundaries, and does not use any of the five ciphertext rune values or FOUND letters once the formula is frozen.

## Geometry-family charge

The formula was discovered after the exact key, so charge nearby source-visible alternatives rather than treating it as self-authenticating.

### Fixed shell placement: 192 formulas

For every one of the 318 page-local five-rune unknown fragments, charge:

- x = page, page/2, or 2*page mod29;
- second coordinate = start-x or x-start;
- third coordinate = ±start or ±end;
- center = ±length, ±span, ±2*span, or ±2*length;
- repeated x fixed in the observed first/fourth H-shell slots.

This is 192 formulas. Score only the seven distinct authenticated five-GP-rune words.

Result:

~~~text
191 formulas: 0 target hits anywhere
1 formula:    1 target hit
~~~

The sole hit is exactly

~~~text
page/2 | start-x | end | 2span
p38 offsets49..53 -> FOUND.
~~~

### Charged shell serialization: 2,304 formulas

Now also charge every placement of the repeated x into any two of the first four shell slots and both orders of the remaining y/z coordinates. This gives 2,304 formulas.

Result:

~~~text
2,302 formulas: 0 target hits
2 formulas:     1 target hit each.
~~~

The first is the exact p38 formula above. The only rival is a different serializer on p52 offset102:

~~~text
page/2 | x-start | end | -2length
repeat x in shell slots1,3; z then y
-> FOUND
key [8,4,19,22,18].
~~~

This rival prevents treating the 2,304-family result as a uniqueness proof for an authored geometry rule. It also shows why the upstream typed p38 receiver selector remains essential.

## Local controls

The exact geometry formula is not a manuscript-wide FOUND decoder.

The independent p0 FOUND receiver at offsets117..121 gives

~~~text
shell [0,1,5,0,8]
key   [15,17,8,12,15]
output [27,19,19,22,17],
~~~

not FOUND.

P38 itself contains another five-rune fragment with the same page/start/end residues, offsets223..227. It therefore receives the same key and outputs

~~~text
[18,23,7,7,14],
~~~

which is not one of the authenticated five-rune targets.

Across all 318 five-rune fragments, the exact formula has one authenticated-target hit total, the source-selected p38 receiver -> FOUND.

## Prospective equal-shape transfer gate: negative (#1784)

Agent32 froze the exact p38 geometry rule on a distinct source-selected p39 receiver before opening its rune values. Authenticated word39 is **FALSE**; the existing page39 route and dominant red X select p39. Using only p39's sole red span and recovered `g=5`, the first complete five-rune word after that span is offsets132..136. The sealed target was `FALSE=[0,24,20,15,18]`.

The unchanged rule gives shell `[5,11,20,5,8]`, key `[8,27,8,7,3]`, and original receiver `[19,7,10,17,23]` decodes to `[27,5,18,24,26]`, not FALSE. No alternate receiver, sign, serializer or target was tried after reveal. Preserve the p38 formula as local key compression, not as a reusable decoder. [Holdout report](lp2-p38-geometry-shell-p39-false-holdout.md) · [SFT](../sims/lp2_p38_geometry_shell_p39_false_holdout_sft.cjs).

## What this changes

The p38 numeric key no longer requires the five-slot HERE/DH lookup labels as its only compact description. Once the globally typed receiver is selected, its visible coordinates generate the exact key through the already frozen reversible H representation and independently reconstructed state identities:

~~~text
page/2 = B
start  = DH[p]
end    = -g
2span  = A.
~~~

This materially compresses the remaining local inverse-order problem. The chronology caveat remains decisive: the geometry formula was recognized after both the key and FOUND were known, and the broader serializer family has one p52 rival. It is therefore an intermediate mechanism, not established plaintext or a demonstrated general LP2 cipher.

A promotion now requires a first-party clue or solved-page control selecting this geometry serialization before a new receiver is opened.

## Reproduction

~~~text
node sims/lp2_p38_found_geometry_shell_key_sft.cjs
~~~

Windows Node22 PASS: **44445013540** (https://github.com/FlareZ123/liber-primus/actions/runs/44445013540).
