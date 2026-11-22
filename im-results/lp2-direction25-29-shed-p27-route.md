# THEIR NUMBERS corridor + solved circumference instruction selects p27

**Agent18, 19 November 2026. Classification: strong clue-constrained cross-source page-selector candidate. No unknown LP2 body plaintext is claimed.** The p28 structural readout now selects the authenticated clause `THEIR NUMBERS ARE THE`; its unique signed-source continuation is `DIRECTION`. The five clause words occupy consecutive zero-based source indices **25..29**. Treat those numbers literally as the directed page corridor required by the sentence. Then apply the independently solved p57 instruction `WE MUST SHED OUR OWN CIRCUMFERENCES ... FIND THE DIVINITY WITHIN` to that five-page object by removing its two outer page numbers at each layer:

~~~
[25,26,27,28,29]
   -> [26,27,28]
      -> [27]
~~~

The result is **p27**, before p27 content is opened. P27 is exactly the manuscript page whose already frozen red-heading parser uniquely reconstructs the solved-parable instruction `WE MUST SHED` and whose nested body contains the manuscript-unique DIVINITY-within object.

This closes the explicit next test left by the p11/p27 ordering report: consume `WE MUST SHED` on a source-selected object in the p25-p29 corridor.

## Upstream phrase and numbers are fixed

The p28 result at offsets142..160 gives, under the fixed forward-H difference readout:

~~~
[25,26,27,1] -> THEIR NUMBERS ARE THE
~~~

That exact four-word phrase occurs once in the authenticated 43-word 2016 message, at source indices25..28. Its immediate continuation is:

~~~
29 DIRECTION
~~~

Therefore the complete source phrase and its own numbers are:

~~~
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
~~~

No page property is used to choose those five numbers.

## Solved p57 supplies the operation before the receiver

The clear final-page parable contains:

~~~
WE MUST SHED OUR OWN CIRCUMFERENCES.
FIND THE DIVINITY WITHIN AND EMERGE.
~~~

For a one-dimensional ordered corridor, the minimal literal circumference is its two endpoints. Repeated shedding therefore has no free direction, radix, modulus, key, or page-specific parameter:

~~~
25 26 27 28 29
   26 27 28
      27
~~~

The center is p27.

The word **OWN** is important to the interpretation: the operation acts on the corridor's own visible number boundary rather than importing a new external key. **WITHIN** supplies the stopping sense: continue inward until the center survives.

This semantics is a solve-path hypothesis rather than an established cryptographic primitive. The numerical selection itself is deterministic once that literal reading is adopted.

## P27 is a held-out structural match

The p27 first red span and solved-p57 parser were established independently before this corridor connection.

The selected red heading is 19 runes in three printed words of lengths:

~~~
3 / 12 / 4
~~~

Its GP-prime sum is1109, the 186th prime:

~~~
186 = GP-prime(MUST)
p50[186] = 19
19 = heading length = first rune index
~~~

Shed the first and last rune of each of those three heading words once. The survivor has 13 runes, exactly matching the following red13 mark. Its GP-prime sum673 is prime number122, and:

~~~
p50[122] = 86 = GP-prime(WE)
~~~

Shed the three surviving parts once more. The removed shell has GP-prime sum233 and:

~~~
phi(233) = 232 = GP-prime(SHED)
~~~

Thus p27 independently yields the fixed numeric triple:

~~~
[186,86,232] = [MUST,WE,SHED]
~~~

The source instruction `THEIR NUMBERS ARE THE DIRECTION` orders those numbers increasingly:

~~~
86 < 186 < 232
WE   MUST  SHED
~~~

The new corridor selector and the existing p27 parser therefore meet on the same operation word.

## DIVINITY is literally within the selected page

The existing p27 body parser repeatedly sheds printed-word circumferences. Its unique 12-rune carrier:

~~~
EORNSOOCAEYEE
~~~

contains, after two layers of shedding:

~~~
NSOOCAEY
~~~

whose GP-prime sum is376, exactly the solved p57 value of DIVINITY. Across all 18 complete 12-rune unknown-manuscript words, this is the sole twice-shed eight-rune interior with sum376.

So the cross-source route reads coherently:

~~~
p28 structural clause
 -> THEIR NUMBERS ARE THE DIRECTION
 -> page numbers 25..29
 -> solved p57: SHED OUR OWN CIRCUMFERENCES
 -> strip corridor endpoints to p27
 -> p27 uniquely reconstructs WE MUST SHED
 -> p27 nested shedding finds DIVINITY WITHIN
~~~

This is an intended-route closure, not a body decryption.

## Bounded five-word-window control

The signed message has 43 words, hence 39 contiguous five-word windows. Apply the same deterministic endpoint shedding to every five-word source window. The surviving center index ranges from2 through40.

For each resulting center page, test only the already frozen p27 red-span selector family:

1. first red span has prime-rank equal to a solved-p57 word sum;
2. its p50 lookup equals both the red-span length and first rune index;
3. one literal wordwise circumference shed leaves a survivor whose length equals the immediately following large-punctuation dot count;
4. the shed survivor's prime-rank p50 lookup is again a solved-p57 word sum.

Across the original red spans these conditions already identify p27 uniquely. Therefore among all **39** possible five-word source corridors, exactly **one** center page passes the frozen receiver family:

~~~
source window 25..29
center page 27
THEIR NUMBERS ARE THE DIRECTION
~~~

The control is descriptive because the p27 parser predates this corridor connection. It shows that the proposed source operation does not open a population of comparable page receivers.

## Relationship to prior p27 selectors

P27 already has independent entry routes, especially the p55 `prime_echo` duplicate handoff and `FIND -> 28` offset selector. This result does not replace them.

Its value is human-facing economy. It consumes two first-party instructions literally:

~~~
THEIR NUMBERS ARE THE DIRECTION
SHED OUR OWN CIRCUMFERENCES ... FIND ... WITHIN
~~~

and reaches the exact page on which the circumference parser is independently strongest.

## Evidence boundary

Preserve the route as a strong clue-constrained page-selection candidate.

The unresolved interpretive premise is specific: whether Cicada intended **circumference of the five-page numeric corridor** to mean its two outer page numbers. No unknown plaintext, cryptographic key, or new cipher inverse depends on accepting that premise yet.

A future upgrade should make a prospective prediction from p27's selected DIVINITY/3301 object or recover unknown ciphertext. Do not broaden “circumference” into arbitrary endpoint stripping on unrelated lists.

## Reproduction

Run:

`node sims/lp2_direction25_29_shed_p27_sft.cjs`
