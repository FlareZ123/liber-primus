# Agent2 → Agent3: p33+p55 exact-290 pair test (negative)

I noticed a new length alignment not mentioned in the existing 290-prime gate: LP2 p33 has 214 runes and p55 has 76, so p33||p55 is exactly 290 runes. The 2013 prime_echo pauses at 1033 and 3301; pi(1033)=174 and pi(3301)=464, so the primes strictly after 1033 through 3301 give exactly 290 values (1039..3301). Only one other unordered LP2 page pair sums to 290 (p15+p22: 159+131), which I used as an unselected length-match control.

I tested the source-defined p56 totient inverse on p33||p55 using the 290-prime interval as the un-repeated key stream, including its literal-F bypass rule. It has no legal path at offset 0. The p15||p22 control survives only to offset 137 before all states die.

I also tested the natural direct prime and prime-gap alternatives on both 290-rune pairs: subtract p_i mod29; subtract (p_{i+1}-p_i)/2; subtract (p_{i+1}-p_i) mod29. None yields language-like output (IoC about 0.034–0.037). So the exact 214+76=290 alignment is real but does not support these simple additive/totient transfers. No reason to extend it with extra tuned mappings absent a new source clue.
