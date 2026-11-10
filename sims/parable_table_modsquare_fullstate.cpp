// Original LP2 32x8 grid versus every source-Parable modular-squaring state.
// C++17, standard library only. Run from the repository root.
// Tested source registers: 1259*1031 and 1259*1031*1229.
#include <algorithm>
#include <cctype>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

/** Read only the exact 32x8 original byte_rows array in the committed source. */
static std::vector<int> readGrid() {
    std::ifstream f("resources/liber-primus/base60-grid.json");
    if (!f) throw std::runtime_error("Cannot open original grid source");
    const std::string s((std::istreambuf_iterator<char>(f)), {});
    const auto name = s.find("\"byte_rows\"");
    const auto start = s.find('[', name);
    if (name == std::string::npos || start == std::string::npos)
        throw std::runtime_error("Missing byte_rows array");
    std::vector<int> values;
    int depth = 0;
    for (size_t i = start; i < s.size(); ++i) {
        if (s[i] == '[') { ++depth; continue; }
        if (s[i] == ']') { if (--depth == 0) break; continue; }
        if (std::isdigit(static_cast<unsigned char>(s[i]))) {
            int n = 0;
            do { n = n * 10 + (s[i] - '0'); ++i; }
            while (i < s.size() && std::isdigit(static_cast<unsigned char>(s[i])));
            --i;
            if (n < 0 || n > 255) throw std::runtime_error("Grid byte outside 0..255");
            values.push_back(n);
        }
    }
    if (values.size() != 256 || values[0] != 203 || values[255] != 80)
        throw std::runtime_error("Unexpected original grid length or source bytes");
    return values;
}

/** The first emitted state is unconstrained by any seed. */
static int output(uint64_t state, uint64_t modulus, bool high8) {
    return high8 ? static_cast<int>(state * 256 / modulus)
                 : static_cast<int>(state & 255);
}

struct Result { int longest; uint64_t exact, trueSeedRecovered; };

/** Exhaust every first-state value that produces the first target byte. */
static Result test(const std::vector<int>& target, uint64_t modulus, bool high8,
                   uint64_t controlSeed = UINT64_MAX) {
    if (target.empty()) throw std::runtime_error("Empty stream");
    const uint64_t lo = high8 ? (uint64_t(target[0]) * modulus + 255) / 256
                              : uint64_t(target[0]);
    const uint64_t hi = high8 ? (uint64_t(target[0] + 1) * modulus + 255) / 256
                              : modulus;
    const uint64_t stride = high8 ? 1 : 256;
    int longest = 0;
    uint64_t exact = 0, seedRecovered = 0;
    for (uint64_t initial = lo; initial < hi; initial += stride) {
        uint64_t x = initial;
        size_t i = 0;
        for (; i < target.size(); ++i) {
            if (output(x, modulus, high8) != target[i]) break;
            x = x * x % modulus; // maximum product < 2^62, fits uint64_t
        }
        longest = std::max(longest, static_cast<int>(i));
        if (i == target.size()) {
            ++exact;
            if (initial == controlSeed) ++seedRecovered;
        }
    }
    return {longest, exact, seedRecovered};
}

static std::vector<int> generate(uint64_t state, uint64_t modulus, bool high8) {
    std::vector<int> v;
    for (int i = 0; i < 32; ++i) {
        v.push_back(output(state, modulus, high8));
        state = state * state % modulus;
    }
    return v;
}

int main() {
    try {
        const std::vector<int> grid = readGrid();
        const uint64_t mods[] = {1259ULL * 1031, 1259ULL * 1031 * 1229};
        std::cout << "source=canonical 256-byte base60 grid; each stream=one of 8 complete original columns\n";
        for (uint64_t modulus : mods) for (bool high8 : {false, true})
            for (bool reverse : {false, true}) {
                int minLongest = 32, maxLongest = 0;
                uint64_t exactTotal = 0;
                std::cout << "M=" << modulus << " mode=" << (high8 ? "rescale8" : "low8")
                          << " direction=" << (reverse ? "reverse" : "forward") << " matches=";
                for (int col = 0; col < 8; ++col) {
                    std::vector<int> v;
                    for (int i = 0; i < 32; ++i)
                        v.push_back(grid[8 * (reverse ? 31 - i : i) + col]);
                    const Result result = test(v, modulus, high8);
                    minLongest = std::min(minLongest, result.longest);
                    maxLongest = std::max(maxLongest, result.longest);
                    exactTotal += result.exact;
                    std::cout << (col ? "," : "") << result.longest;
                }
                if (exactTotal != 0 || maxLongest >= 32)
                    throw std::runtime_error("A 32-byte original grid stream unexpectedly matches");
                std::cout << " minLongest=" << minLongest << " maxLongest=" << maxLongest
                          << " exact32=" << exactTotal << "\n";
            }
        for (uint64_t modulus : mods) for (bool high8 : {false, true}) {
            const uint64_t state = 3301;
            const std::vector<int> planted = generate(state, modulus, high8);
            const Result witness = test(planted, modulus, high8, state);
            if (witness.longest != 32 || witness.trueSeedRecovered != 1)
                throw std::runtime_error("Positive-control true state not recovered");
            std::cout << "positive M=" << modulus << " mode=" << (high8 ? "rescale8" : "low8")
                      << " matched32=" << witness.exact << " trueSeedRecovered="
                      << witness.trueSeedRecovered << "\n";
        }
        std::cout << "status=SOURCE-ORIGINAL BOUNDED EXCLUSION (no LP2 plaintext recovered)\n";
    } catch (const std::exception& e) {
        std::cerr << "FAIL " << e.what() << '\n';
        return 1;
    }
}
