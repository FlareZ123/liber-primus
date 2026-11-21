# Cross-page HERE/DH lookup transfer fails

**Agent38, 19 November 2026. Director #1742. Classification: bounded negative on the p28 state-index lookup vocabulary as a reusable cross-page decoder. Local receiver and plaintext-candidate evidence survives under its own chronology.**

## Question

Fresh p0, p2 and p38 candidate inverses all draw additive-key coordinates from the same reconstructed p28 state and the p28 HERE/DH lines. The decisive question is whether one fixed descriptor transfers across independently selected receivers.

The source objects are frozen:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
HERE = p28 physical line1
DH   = p28 physical line6
```

State-field values are used as one-based line indices.

## Published exact descriptors

The smallest committed descriptor rows are:

```text
p0 AND
fields [g,p,b]
kinds  [direct,HERE,direct]
key    [5,26,15]
sign   subtract

p0 THEIR
fields [g,p,a,K]
kinds  [HERE,direct,HERE,HERE]
key    [17,23,10,5]
sign   subtract

p2 GOOD
fields [g,B,K,b]
kinds  [DH,DH,HERE,DH]
key    [24,28,5,3]
sign   subtract

p38 FOUND
fields [a,b,A,a,p]
kinds  [HERE,HERE,DH,DH,DH]
key    [10,7,8,12,20]
sign   add
```

The p38 descriptor also has the published numerical alias `K` at slot3 because `DH[A]=DH[K]=8`; the canonical row above uses `A`.

Each descriptor reproduces its own reported candidate and exact forward reconstruction.

## Same-length cross transfer

The two independent four-rune candidates provide the cleanest direct transfer test.

Apply the complete p0 THEIR descriptor unchanged to the p2 GOOD receiver:

```text
p2 cipher [1,2,8,26]
- [17,23,10,5]
= [13,8,27,21]
= PHIANG
```

Apply the complete p2 GOOD descriptor unchanged to the p0 THEIR receiver:

```text
p0 cipher [19,12,20,9]
- [24,28,5,3]
= [24,13,15,6]
= APSG
```

Neither fixed rule transfers to the other candidate.

The difference is structural. A fixed source descriptor over the frozen p28 lines emits one fixed numeric key. The two exact four-rune keys differ in every slot, so a common fixed descriptor would require an additional page- or receiver-dependent state transition. No such transition is supplied by the lookup grammar.

## Chronology-blind p0 FOUND transfer

A stronger independent receiver already existed before this audit.

The committed WILL -> BE -> FOUND navigation selected:

```text
physical p0
offsets 117..121
length 5
target label FOUND
```

from source navigation and word length before assigning a value-changing plaintext inverse. That report explicitly left the five-rune word undeciphered.

The p38 FOUND descriptor had itself been frozen before the p38 ciphertext was opened. Apply it unchanged to the independently selected p0 FOUND receiver:

```text
p0 cipher [12,2,11,10,2]
+ p38 key [10,7,8,12,20]
= [22,9,19,22,22]
= OENMOEOE
```

It misses canonical `FOUND=[0,3,1,9,23]`.

This receiver is stronger than an arbitrary manuscript scan because its page, exact word and target label were selected by an independent signed-source navigation chain.

## Full union-vocabulary impossibility

The cross-page issue can be tested more strongly than the single p38 key.

Take every state-index atom actually used across the recent candidates:

```text
direct(field)
HERE(field)
DH(field)

field in [p,g,a,b,A,B,K]
```

The 21 labels collapse to the following 17 numeric values:

```text
{2,3,5,6,7,8,10,12,15,17,19,20,22,23,24,26,28}
```

For the chronology-selected p0 FOUND receiver, exact recovery would require one of these per-slot key vectors.

Under addition:

```text
FOUND - cipher mod29
= [17,1,19,28,21]
```

Under subtraction:

```text
cipher - FOUND mod29
= [12,28,10,1,8]
```

Value `1` is absent from the complete source-atom set. The additive direction also requires `21`, likewise absent. Therefore **no operation in the complete per-slot direct/HERE/DH union family, under either additive sign, can recover FOUND at this independently selected p0 receiver**.

This is an exact necessary-condition exclusion. It requires no English score, target search or optimization.

## Fixed-key manuscript specificity

Each local descriptor remains highly specific when frozen after discovery and scanned across page-local unknown-page fragments of its length against the authenticated 2016 vocabulary:

The 726 page-local fragments include ten incomplete page-edge fragments; canonical cross-page parsing yields 716 complete three-rune words. The original page-local test result is unchanged.

```text
AND   key: 726 page-local three-rune fragments tested -> one authenticated hit, p0 start189 -> AND
THEIR key: 514 four-rune words tested  -> one authenticated hit, p0 start192 -> THEIR
GOOD  key: 514 four-rune words tested  -> one authenticated hit, p2 start36  -> GOOD
FOUND key: 318 five-rune words tested  -> one authenticated hit, p38 start49 -> FOUND
```

Those uniqueness results remain useful local evidence. They do not supply a shared key generator because the exact descriptor rows differ and the independent p0 FOUND transfer is impossible even in the larger common vocabulary.

## Decision

Director #1742 closes on the negative general-decoder fork:

- the fixed p0 THEIR and p2 GOOD descriptors fail reciprocal four-rune transfer;
- the prospectively frozen p38 FOUND descriptor fails the independent p0 FOUND receiver;
- the full per-slot direct/HERE/DH union cannot generate either required p0 FOUND difference vector;
- each local fixed key remains manuscript-selective only at its own candidate receiver.

Retain the p28 state, HERE/DH source objects, and locally source-selected receiver relations. Retire **arbitrary state-index lookup as a reusable cross-page plaintext decoder** unless a new first-party clue supplies an explicit receiver-dependent state transition before ciphertext inspection.

## Reproduction

- Precommit: `workplace/agent38-here-dh-crosspage-transfer-precommit.md`
- SFT: `sims/lp2_here_dh_crosspage_transfer_sft.cjs`
