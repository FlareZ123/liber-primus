# p27 DIVINITY serializer: 3301 terminal selector with 1033 negative control

**Agent27, 18 November 2026. Classification: source-constrained historical
selector. No unknown LP2 plaintext or cipher receiver is recovered.**

## Frozen serializer

The p27 Instar-parable parser independently selects the twice-shed eight-rune
interior `NSOOCAEY`, whose GP-index sum is **103**. Original p50 cell103 is
the literal token `3Q`. The independently recovered p27/DH23 server secret is
**6**, and the sixth rune of this eight-rune interior has GP index **24**.
Under the signed 2013 BASE29 alphabet
`0123456789ABCDEFGHIJKLMNOPQRS`, digit24 is `O`.

The frozen serializer is therefore:

`p50Token[indexSum(window)] || BASE29digit(window[6th])`.

For `NSOOCAEY` this gives `3QO`, and the signed 2013 protocol explicitly
states:

`BASE29 3301 -> 3QO`.

The serializer was defined before the control below.

## Canonical manuscript-wide control

Use the repository's canonical complete-word parser over unknown p0-p55:

- percent page breaks preserve a carried word;
- slash line breaks preserve a carried word;
- whitespace preserves a carried word;
- punctuation terminates a word.

This yields exactly **2,896 complete words** and **731 contiguous eight-rune
windows**. Apply the frozen serializer to every window whose GP-index sum is a
valid p50 address below256.

Results:

- target `3QO`: exactly **one** hit, p27 `NSOOCAEY`;
- target `16I`: **zero** hits.

The second target is the exact BASE29 rendering of **1033**. It is historically
relevant because the preserved March 2013 participant session contains
`BASE29 1033 -> 16I`. The signed protocol authenticates BASE29 semantics, but
the signed challenge's printed worked example is specifically
`BASE29 3301 -> 3QO`.

Thus the source-selected serializer is **selective for 3301** within its frozen
731-window search space. It does not generically reproduce both familiar
1033/3301 constants.

## Historical role of 3301

The original Cicada OS `prime_echo` artifact contains exactly **464 ordinary
primes from2 through3301**, pauses exceptionally after1033 and3301, and stops
after3301. Existing finite-exhaustion work uses the ordered pair of pause values
to select the p55 physical boundary300, whose first intact repeated pair maps to
p27.

The new p27 serializer returns **3301**, the terminal value of that same finite
historical object. This gives the p55 -> p27 route a coherent return marker:

`prime_echo ordered pauses -> boundary300 -> p27 -> DIVINITY serializer -> 3301 terminal`.

This does **not** independently re-select boundary300. Existing accounting
shows that every first-exhaustion history consumes terminal3301, while only the
three boundary300 histories also consume the earlier exceptional pause1033.
The discriminant remains the ordered 1033/3301 pause chain.

The absence of a frozen `16I` hit is therefore useful. It prevents turning
the p27 serializer into an ad hoc generator of both pause constants and keeps
the roles distinct:

- **1033** remains the earlier internal pause needed by the finite p55 selector;
- **3301** is reconstructed at p27 as the terminal historical value.

## Decision

Promote the p27 serializer as a strong **terminal selector/checksum** inside the
current solve-path hypothesis. Do not interpret 3301 by itself as a p55
boundary selector, a p56 key start, or a generic GP29 key. Direct p55 use of
prime3301 under the solved p56 receiver has already failed structurally.

A substantive successor must use the terminal state to select a new,
source-visible object or operation, or recover unknown plaintext. Searching for
a tunable 1033 serializer is specifically disfavored by the zero-hit control.

Reproduce with
`sims/lp2_p27_terminal3301_serializer_control_sft.cjs`.
