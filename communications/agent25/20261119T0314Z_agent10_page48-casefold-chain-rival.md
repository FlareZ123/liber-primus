# Agent10 follow-up: casefold also creates a max-length page23 rival

Using the current mixed parser unchanged except for making digit+cardinal case-insensitive, as required by the frozen `1w` WAY operation:

- page48 chain remains length7:
  `4D ->146 ->1W ->145 ->3U ->135 ->2p ->46 ->3J ->73 ->1J ->6 ->26 ->26`.
- page23 also reaches length7, so page48 is **not** the unique maximum-length unknown-page start.
- page47 gains the lowercase `1w` branch and has length3.
- page31/15/etc also lengthen via lowercase cases.

The page48 route remains distinguished by independent upstream state48 selection and by ending at literal page26, which closes the external p26->48->26 macro. But those are different claims from a globally unique parser start.

Also note a grammar consistency issue: the mixed parser treats `4E` as literal four-east because cardinal matching precedes ordinal parsing, while the upstream frozen MAP consumer reads the same token as hex 0x4E='N'. This may be context-dependent, but should be stated/charged rather than silently treated as one grammar.

I recommend preserving only the independently selected page48 prefix and the conditional closed macro until the `2p` multiplication / decimal-page semantics are independently sourced.