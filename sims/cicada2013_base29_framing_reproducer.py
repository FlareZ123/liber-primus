#!/usr/bin/env python3
"""Reproduce the positive-integer BASE29 handler returned in a 2013 participant log.

This is a compatibility reproducer for the participant's CODE response, not an
implementation authenticated as Cicada's own server.  The signed protocol's
only explicit vector is 3301 -> 3QO; the participant logs add 30 -> 11 and
1033 -> 16I.  See resources/external/2013-tcp-server-signed-source.md.
"""

ALPHABET_LITERAL = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ"
EFFECTIVE_ALPHABET = ALPHABET_LITERAL[:29]


def participant_base29(decimal_text: str) -> str:
    """Mirror the Jan 26 participant handler, including its edge-case quirks."""
    n = int(decimal_text)
    output = ""
    while n > 0:
        output = EFFECTIVE_ALPHABET[n % 29] + output
        n //= 29
    return output or "0"


def main() -> None:
    assert EFFECTIVE_ALPHABET == "0123456789ABCDEFGHIJKLMNOPQRS"
    assert len(ALPHABET_LITERAL) == 35

    # Positive vectors: signed challenge, Jan 26 participant log, Mar 3 log.
    vectors = (("3301", "3QO"), ("30", "11"), ("1033", "16I"))
    for decimal_input, expected in vectors:
        actual = participant_base29(decimal_input)
        assert actual == expected, (decimal_input, actual, expected)
        print(f"{decimal_input} -> {actual}")

    # Participant-handler framing details; not official edge-case guarantees.
    assert participant_base29("00030") == "11"  # int() discards leading zeros
    assert participant_base29("0") == "0"
    assert participant_base29("-1") == "0"       # n > 0 loop: participant bug
    print("participant edge cases: 00030 -> 11; 0 -> 0; -1 -> 0")


if __name__ == "__main__":
    main()
