"""GP29 author's demonstrated IO/ING rune transliteration, independent of phase23's IA."""
import re
import unicodedata

import numpy as np

# 29 Gematria Primus symbols in canonical order, using original solved-page IO.
SYMBOLS = (
    "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
    "EO", "P", "X", "S", "T", "B", "E", "M", "L", "ING",
    "OE", "D", "A", "AE", "Y", "IO", "EA"
)
ORDER = tuple(sorted(range(29), key=lambda i: -len(SYMBOLS[i])))
ALIASES = {"V": 1, "K": 5, "Z": 15, "Q": 5}


def writer_to_runes(text, letters=False):
    """Text-to-runes using the solved-LP IO and ING spellings.

    The phase23 single-letter spelling remains unchanged when letters=True.
    """
    decomposed = unicodedata.normalize("NFKD", text)
    stripped = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    normalized = re.sub(r"[^A-Za-z ]", " ", stripped).upper().replace("QU", "CW")
    order = tuple(i for i in ORDER if len(SYMBOLS[i]) == 1) if letters else ORDER
    out = []
    for word in normalized.split():
        while word:
            index = next((i for i in order if word.startswith(SYMBOLS[i])), None)
            if index is None:
                out.append(ALIASES[word[0]])
                word = word[1:]
            else:
                out.append(index)
                word = word[len(SYMBOLS[index]):]
    return np.asarray(out, dtype=np.int64)
