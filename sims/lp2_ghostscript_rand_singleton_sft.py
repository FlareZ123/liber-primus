"""Exact 31-bit Ghostscript 9.06 rand-key test on original LP2 singleton words.

Run: python sims/lp2_ghostscript_rand_singleton_sft.py
Dependency: numpy.

The 2012 Ghostscript 9.06 source (ArtifexSoftware/ghostpdl tag
ghostscript-9.06, gs/psi/zmath.c) specifies a Park-Miller generator:
state[n+1] = 16807 * state[n] modulo (2^31-1).
This read-only SFT tests two conventional GP29 projections, raw remainder
and 29-bin scaling, as an additive changing-state key. It allows three
arbitrary corrupted singleton words among 18 on physical LP2 pp15-22.
No literal-F key-skip, variable-rate key clock, unknown plaintext register,
or changed word boundaries are included in the tested architecture.
"""
import json
from pathlib import Path
from time import monotonic

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
M_INT = (1 << 31) - 1
M = np.uint64(M_INT)
A = 16807
MOD = np.uint64(29)
PLAINTEXT_A = 24
PLAINTEXT_I = 10
MAX_ERRORS = 3
CHAPTER_START = 15
CHAPTER_END_EXCLUSIVE = 23
EXPECTED_SINGLETONS = (
    (3738,26),(3783,23),(3881,9),(4006,10),(4142,17),(4148,28),
    (4176,10),(4217,16),(4233,4),(4358,16),(4474,13),(4633,7),
    (4699,4),(4751,2),(4794,17),(5253,28),(5319,25),(5336,9),
)


def extract_singletons():
    """Derive offsets from original-ordered plaintext segmentation and GP rune data."""
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    text = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8")
    original = "%".join(text.split("%")[:55])
    alphabet = {char: i for i, char in enumerate(corpus["runes"])}
    all_words = []
    word = []
    pos = 0
    page = 0
    start = 0
    start_page = 0

    def flush():
        nonlocal word
        if word:
            all_words.append((start, start_page, tuple(word)))
        word = []

    for char in original:
        if char in alphabet:
            if not word:
                start, start_page = pos, page
            word.append(alphabet[char])
            pos += 1
        elif char == "%":
            page += 1
        elif char in "-.$&§0123456789":
            flush()
    flush()

    assert pos == 12956, pos
    assert len(all_words) == 2896, len(all_words)
    singles = [(start, page, vals[0]) for start, page, vals in all_words if len(vals) == 1]
    assert len(singles) == 83, len(singles)
    selected = tuple((start, value) for start, page, value in singles
                     if CHAPTER_START <= (page if page < 50 else page + 1)
                     < CHAPTER_END_EXCLUSIVE)
    assert selected == EXPECTED_SINGLETONS
    return selected


def times_constant(values, constant):
    """Exact Mersenne reduction for uint64 products below (2^31)^2."""
    prod = values * np.uint64(constant)
    red = (prod & M) + (prod >> np.uint64(31))
    return (red & M) + (red >> np.uint64(31))


def projected(values, mode):
    return values % MOD if mode == "mod" else (values * MOD) // M


def scan(entries, mode, max_errors=MAX_ERRORS):
    """Exhaust all nonzero generator states, allowing <=max_errors misses.

    Because at most max_errors of the FIRST max_errors+1 singleton readings
    can be bad, each valid candidate satisfies one tested anchor. Enumerate
    every possible generator state at those anchors, then use modular powers
    to jump directly to all other singleton positions. No seed guess list,
    heuristic score, key phase or interpolation is involved.
    """
    assert len(entries) > max_errors
    offsets = [offset for offset, _ in entries]
    values = np.array([value for _, value in entries], dtype=np.int64)
    key_a = (values - PLAINTEXT_A) % 29
    key_i = (values - PLAINTEXT_I) % 29
    originals = set()
    visited = 0
    anchor_survivors = []
    start_time = monotonic()
    for anchor in range(max_errors + 1):
        powers = [
            pow(A, (offset - offsets[anchor]) % (M_INT - 1), M_INT)
            for offset in offsets
        ]
        choices = {int(key_a[anchor]), int(key_i[anchor])}
        regions = []
        for key in sorted(choices):
            if mode == "mod":
                regions.append((key or 29, M_INT, 29))
            else:
                low = max(1, (key * M_INT + 28) // 29)
                high = min(M_INT, ((key + 1) * M_INT + 28) // 29)
                regions.append((low, high, 1))
        anchor_count = 0
        for start, end, step in regions:
            for base in range(start, end, step * 350_000):
                states = np.arange(
                    base, min(base + step * 350_000, end),
                    step, dtype=np.uint64
                )
                visited += len(states)
                errors = np.zeros(len(states), dtype=np.uint8)
                for j in range(len(entries)):
                    if j == anchor:
                        continue
                    key = projected(times_constant(states, powers[j]), mode)
                    errors += ((key != key_a[j]) & (key != key_i[j])).astype(np.uint8)
                    keep = errors <= max_errors
                    states, errors = states[keep], errors[keep]
                    if not len(states):
                        break
                for state in states:
                    x0 = int(times_constant(
                        np.array([state], dtype=np.uint64), powers[0]
                    )[0])
                    originals.add(x0)
                    anchor_count += 1
        anchor_survivors.append(anchor_count)
    return {
        "mode": mode, "singleton_count": len(entries),
        "allowed_bad_singletons": max_errors,
        "states_examined_with_anchor_overlap": visited,
        "unique_surviving_generator_states": len(originals),
        "survivor_at_first_singleton": sorted(originals)[:10],
        "anchor_survivors": anchor_survivors,
        "elapsed_seconds": round(monotonic() - start_time, 3),
    }


def synthetic_control(entries, seed, mode):
    """Plant 18 known A/I singleton words under a known full-range seed."""
    planted = []
    for j, (offset, _) in enumerate(entries):
        state = seed * pow(A, offset + 1, M_INT) % M_INT
        key = state % 29 if mode == "mod" else state * 29 // M_INT
        plain = PLAINTEXT_A if j % 2 == 0 else PLAINTEXT_I
        encrypted = (plain + key) % 29
        if j in (0, 4, 12):
            encrypted = (encrypted + 3) % 29
        planted.append((offset, encrypted))
    first_state = seed * pow(A, entries[0][0] + 1, M_INT) % M_INT
    return tuple(planted), first_state


def grid_views(grid):
    """Six source-geometry-respecting views of the 32x8 printed byte grid."""
    assert len(grid) == 256
    columns = [grid[row * 8 + col] for col in range(8) for row in range(32)]
    page_columns = []
    start = 0
    for rows in (10, 13, 9):
        page_columns.extend(grid[start + row * 8 + col]
                            for col in range(8) for row in range(rows))
        start += rows * 8
    assert start == 256
    return (
        ("row-major", grid),
        ("reverse-row-major", grid[::-1]),
        ("column-major", columns),
        ("reverse-column-major", columns[::-1]),
        ("page-column-major", page_columns),
        ("reverse-page-column-major", page_columns[::-1]),
    )


def prefix_states(data, mode, prefix=4):
    """Enumerate every first-output state compatible with N full PRNG bytes."""
    assert prefix >= 2
    first = data[0]
    if mode == "mod256":
        states = np.arange(first or 256, M_INT, 256, dtype=np.uint64)
    else:
        lo = max(1, (first * M_INT + 255) // 256)
        hi = min(M_INT, ((first + 1) * M_INT + 255) // 256)
        states = np.arange(lo, hi, dtype=np.uint64)
    first_states = states
    stage_counts = []
    for target in data[1:prefix]:
        state_next = times_constant(states, A)
        value = (state_next % np.uint64(256) if mode == "mod256"
                 else state_next * np.uint64(256) // M)
        keep = value == target
        first_states = first_states[keep]
        states = state_next[keep]
        stage_counts.append(len(states))
        if not len(states):
            break
    return first_states, stage_counts


def filtered_prefix_states(data, mode, max_skips=2):
    """Allow skips only when a candidate PRNG byte has forbidden base60 low f.

    First displayed byte is the unrestricted initial generator state; all
    subsequent missing emissions require projected_byte % 60 == 41.
    Return first-output states and exact prefix survivor counts. This covers
    any earlier seed phase by allowing all nonzero first-output states.
    """
    first = data[0]
    if mode == "mod256":
        current = np.arange(first or 256, M_INT, 256, dtype=np.uint64)
    else:
        lo = max(1, (first * M_INT + 255) // 256)
        hi = min(M_INT, ((first + 1) * M_INT + 255) // 256)
        current = np.arange(lo, hi, dtype=np.uint64)
    first_states = current
    used = np.zeros(len(current), dtype=np.uint8)
    counts = []
    for target in data[1:]:
        accepted_first = []
        accepted_current = []
        accepted_used = []
        intermediate = current
        seed_state = first_states
        skips_so_far = used
        for add in range(max_skips + 1):
            if not len(intermediate):
                break
            next_state = times_constant(intermediate, A)
            symbol = (next_state % np.uint64(256) if mode == "mod256"
                      else next_state * np.uint64(256) // M)
            matches = symbol == target
            if matches.any():
                accepted_first.append(seed_state[matches])
                accepted_current.append(next_state[matches])
                accepted_used.append(skips_so_far[matches] +
                                     np.uint8(add))
            if add < max_skips:
                skip_ok = (symbol % np.uint64(60) == 41) & (
                    skips_so_far + add < max_skips)
                seed_state = seed_state[skip_ok]
                skips_so_far = skips_so_far[skip_ok]
                intermediate = next_state[skip_ok]
        if accepted_first:
            first_states = np.concatenate(accepted_first)
            current = np.concatenate(accepted_current)
            used = np.concatenate(accepted_used)
        else:
            first_states = np.empty(0, dtype=np.uint64)
            current = first_states
            used = np.empty(0, dtype=np.uint8)
        counts.append(len(first_states))
        if not len(first_states):
            break
    return first_states, counts


def check_grid_full_output():
    """Exact first-four-byte gate on the 256-number printed table, both projections."""
    table = json.loads((ROOT / "resources/liber-primus/lp2-grid-256.json")
                       .read_text(encoding="utf-8"))
    grid = table["bytes"]
    assert len(grid) == 256
    assert len(table["pages"]) == 3
    assert [p["rows"] for p in table["pages"]] == [10, 13, 9]
    for name, view in grid_views(grid):
        for mode in ("mod256", "scaled256"):
            states, counts = prefix_states(view, mode, prefix=4)
            print("GRID", name, mode, "survivors-after-2/3/4", counts,
                  flush=True)
            assert len(states) == 0, (name, mode, states)
            filtered, fs_counts = filtered_prefix_states(
                view[:8], mode, max_skips=2)
            print("GRID F-SKIP", name, mode,
                  "survivors-after-2/3/4", fs_counts, flush=True)
            assert len(filtered) == 0, (name, mode, filtered)
    planted_fskip = [2, 84, 32, 116, 250, 210, 195, 0]
    filtered, filtered_counts = filtered_prefix_states(
        planted_fskip, "mod256", max_skips=2)
    assert filtered.tolist() == [773122], filtered.tolist()
    print("GRID F-SKIP planted, seed=46, two rejected f bytes:",
          filtered.tolist(), flush=True)
    seed = 3301
    stream = []
    for _ in range(8):
        seed = int(times_constant(np.array([seed], dtype=np.uint64), A)[0])
        stream.append(seed % 256)
    positive, counts = prefix_states(stream, "mod256", prefix=8)
    assert positive.tolist() == [stream_state_after_first(3301)]
    print("GRID planted full 8-byte stream: recovered unique first-state seed",
          positive.tolist(), flush=True)


def stream_state_after_first(seed):
    return (seed * A) % M_INT


def main():
    data = extract_singletons()
    assert int(times_constant(np.array([M-1], np.uint64), 16807)[0]) == (
        (M_INT-1)*16807 % M_INT
    )
    for mode in ("mod", "scaled"):
        result = scan(data, mode)
        print("ORIGINAL", result, flush=True)
        assert result["unique_surviving_generator_states"] == 0

    check_grid_full_output()

    plant, expected = synthetic_control(data, seed=3301, mode="mod")
    result = scan(plant, "mod")
    print("PLANT: 3 altered words, seed=3301", result, flush=True)
    assert expected in result["survivor_at_first_singleton"]
    print("PASS: all 2^31-2 states exhausted with 3-edit allowance; planted seed recovered")


if __name__ == "__main__":
    main()
