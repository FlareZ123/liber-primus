// Original LP2 p0 exact-state inversion for Ghostscript 9.06 Park-Miller rand
// under four 28-way immediate-repeat-exclusion GP29 alphabets. C++17, no dependencies.
// Compile with a C++17 compiler and run from the repository root.
#include <array>
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iterator>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {
constexpr std::uint64_t M = 2147483647ULL;
constexpr std::uint64_t MULT = 16807ULL;
constexpr int LENGTH = 31;

std::uint32_t next(std::uint32_t s) {
    return static_cast<std::uint32_t>((MULT * s) % M);
}

int output(std::uint32_t s, int projection) {
    return projection == 0 ? static_cast<int>(s % 28U)
                           : static_cast<int>((28ULL * s) / M);
}

// 0: ascending ordinal excluding prior glyph; 1: descending;
// 2: clockwise cyclic steps 1..28; 3: anticlockwise cyclic steps 1..28.
int rankOf(int prior, int current, int order) {
    if (prior == current) throw std::runtime_error("repeat in frozen no-repeat source window");
    const int absolute = current - (current > prior);
    if (order == 0) return absolute;
    if (order == 1) return 27 - absolute;
    if (order == 2) return (current - prior + 28) % 29;
    return (prior - current + 28) % 29;
}

int symbolFromRank(int prior, int rank, int order) {
    if (order == 1) rank = 27 - rank;
    if (order <= 1) return rank + (rank >= prior);
    if (order == 2) return (prior + rank + 1) % 29;
    return (prior - rank + 57) % 29;
}

std::vector<int> pageZero(const std::string& path) {
    std::ifstream in(path, std::ios::binary);
    if (!in) throw std::runtime_error("source corpus unavailable: " + path);
    std::string s((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>());
    const auto marker = s.find("\"indices\"");
    if (marker == std::string::npos) throw std::runtime_error("missing indices field");
    auto at = s.find('[', marker);
    if (at == std::string::npos) throw std::runtime_error("missing indices array");
    std::vector<int> out;
    while (++at < s.size() && s[at] != ']') {
        if (s[at] < '0' || s[at] > '9') continue;
        int v = 0;
        do { v = 10 * v + (s[at++] - '0'); } while (at < s.size() && s[at] >= '0' && s[at] <= '9');
        if (v < 0 || v >= 29) throw std::runtime_error("invalid GP29 source rune");
        out.push_back(v);
        --at;
    }
    if (out.size() != 262 || out[0] != 15 || out[1] != 8 || out[2] != 18)
        throw std::runtime_error("not original physical p0 (262 runes)");
    return out;
}

struct SearchResult {
    std::array<std::uint64_t, LENGTH + 1> surviving{};
    int longest = 0;
    std::uint32_t bestState = 0;
    std::uint32_t fullState = 0;
};

SearchResult allStates(const std::vector<int>& ciphertext, int order, int projection) {
    if (ciphertext.size() != LENGTH + 1) throw std::runtime_error("expected 32 original runes");
    std::array<int, LENGTH> r{};
    for (int i = 0; i < LENGTH; i++) r[i] = rankOf(ciphertext[i], ciphertext[i + 1], order);
    std::uint64_t first, last, stride;
    if (projection == 0) {
        first = r[0] == 0 ? 28 : static_cast<std::uint64_t>(r[0]);
        last = M - 1;
        stride = 28;
    } else {
        first = std::max<std::uint64_t>(1, (static_cast<std::uint64_t>(r[0]) * M + 27) / 28);
        last = std::min<std::uint64_t>(M - 1, (static_cast<std::uint64_t>(r[0] + 1) * M + 27) / 28 - 1);
        stride = 1;
    }
    SearchResult found;
    for (std::uint64_t candidate = first; candidate <= last; candidate += stride) {
        std::uint32_t state = static_cast<std::uint32_t>(candidate);
        int count = 1;
        for (; count < LENGTH; count++) {
            state = next(state);
            if (output(state, projection) != r[count]) break;
        }
        if (count > found.longest) {
            found.longest = count;
            found.bestState = static_cast<std::uint32_t>(candidate);
        }
        if (count == LENGTH) found.fullState = static_cast<std::uint32_t>(candidate);
        for (int k = 1; k <= count; k++) found.surviving[k]++;
    }
    return found;
}

std::vector<int> planted(std::uint32_t originalSeed, int order, int projection) {
    std::vector<int> c = {15};
    std::uint32_t state = originalSeed;
    for (int i = 0; i < LENGTH; i++) {
        state = next(state);
        const int r = output(state, projection);
        const int symbol = symbolFromRank(c.back(), r, order);
        assert(symbol >= 0 && symbol < 29 && symbol != c.back());
        assert(rankOf(c.back(), symbol, order) == r);
        c.push_back(symbol);
    }
    return c;
}
} // namespace

int main() {
    const auto page = pageZero("resources/liber-primus/lp2-corpus.json");
    const std::vector<int> actual(page.begin(), page.begin() + LENGTH + 1);
    for (int order = 0; order < 4; order++) {
        for (int projection = 0; projection < 2; projection++) {
            const auto r = allStates(actual, order, projection);
            if (r.surviving[7] != 0 || r.longest != 6)
                throw std::runtime_error("unexpected source-GP original prefix result");
            std::cout << "original order=" << order << " proj=" << projection
                      << " 6-matches=" << r.surviving[6] << " 7-matches=" << r.surviving[7] << '\n';
            const auto synthetic = planted(3301U + static_cast<std::uint32_t>(order * 29 + projection), order, projection);
            std::uint32_t state = 3301U + static_cast<std::uint32_t>(order * 29 + projection);
            for (int i = 0; i < LENGTH; i++) {
                state = next(state);
                if (rankOf(synthetic[i], synthetic[i + 1], order) != output(state, projection))
                    throw std::runtime_error("synthetic encoding mismatch");
            }
        }
    }
    const auto knownSeed = 3301U + 2U * 29U;
    const auto positive = allStates(planted(knownSeed, 2, 0), 2, 0);
    if (positive.surviving[LENGTH] != 1 || positive.fullState != next(knownSeed))
        throw std::runtime_error("positive seed recovery failed");
    std::cout << "PASS: eight original no-repeat GP29 transports excluded at seven transitions; "
              << "eight forward roundtrips and one exact all-state planted-seed inverse passed.\n";
}
