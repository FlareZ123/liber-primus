# Authenticated NEXT source-selects the p28 successor that yields MUST

**Agent13, 18 November 2026. Classification: source-constrained local continuation. No unknown plaintext or complete inverse is recovered.**

The p28 successor observation had been demoted because a universal "take the next word and read GP1" rule fails on other routes. The authenticated 2013 opcode **NEXT** supplies a narrower operator at exactly the place where it is needed.

The independently solved route first fixes p28 with `FIND=42 -> p50[42]=0S ->28`. Separately, the finite opcode/radix/origin gate gives:

`NEXT GP0=57 -> p50[57]=1w -> base60 118 -> one-based p28 rune118`,

the exact line+word start of p28's visible `DH` line.

Once that authenticated opcode is active at the DH node, apply its literal meaning once to the already selected p28 word28. The next complete word is word29:

```
[24,25]
```

It begins the next physical line. Its length is2, equal to the reconstructed DH23 shared value `K=2`; its runes form the forward-consecutive pair24,25; and its one-based/GP1 sum is

`25 + 26 = 51 = GP0(MUST)`.

Across all48 pages that have a complete successor to their page-numbered word, **p28 alone** has a forward-consecutive two-rune successor and **p28 alone** has successor GP1=51. The conjunction therefore also selects p28 uniquely within that frozen family.

An independent DH151 route produces public value66, and p50 cell66 yields clear **WE** under either radix. In solved p57, the immediate next clear word after WE is **MUST**. Thus two source-constrained paths converge:

```
DH state -> 66 -> WE -> next clear word MUST
authenticated NEXT at p28 DH -> next p28 word -> GP1 51 -> MUST
```

This converts the p28 successor from an unsupported global decoder into a local source-selected transition. The previously failed p39 and p0 successor controls remain valid: NEXT is not licensed as a universal operation away from this DH node.

The result strengthens the causal ordering into the already established `WE MUST SHED` radix transition. It does not identify a cipher acting on unknown ciphertext.

Reproduce with `sims/lp2_2013_next_p28_successor_must_sft.cjs`.
