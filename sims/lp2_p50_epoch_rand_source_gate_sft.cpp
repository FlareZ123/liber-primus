// Original LP2 p50 table versus two period C rand implementations.
// SFT: compile with any C++17 compiler; GNU-libc host additionally checks glibc rand().
// No file writes, external dependencies or user-specified command arguments.
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>

static constexpr char DIGITS[] =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
static constexpr const char* ORIGINAL_TOKENS[4] = {"3N", "3p", "2l", "36"};
static constexpr std::uint32_t FIRST_SEED = 1356998400U; // 2013-01-01T00:00:00Z
static constexpr std::uint32_t LAST_SEED  = 1401580799U; // 2014-05-31T23:59:59Z

struct Totals {
    std::uint64_t prefix[5] = {};
    void match(int count) {
        for (int i = 1; i <= count; ++i) ++prefix[i];
    }
};

static std::uint8_t first_bytes[4];

static int matched(std::uint8_t b0, std::uint8_t b1,
                   std::uint8_t b2, std::uint8_t b3) {
    const std::uint8_t values[4] = {b0, b1, b2, b3};
    int n = 0;
    while (n < 4 && values[n] == first_bytes[n]) ++n;
    return n;
}

static void print(const char* name, const Totals& count) {
    std::printf("%s prefix1=%llu prefix2=%llu prefix3=%llu prefix4=%llu\n",
        name,
        static_cast<unsigned long long>(count.prefix[1]),
        static_cast<unsigned long long>(count.prefix[2]),
        static_cast<unsigned long long>(count.prefix[3]),
        static_cast<unsigned long long>(count.prefix[4]));
}

int main() {
    if (std::strlen(DIGITS) != 60) return 2;
    for (int i = 0; i < 4; ++i) {
        const char* high = std::strchr(DIGITS, ORIGINAL_TOKENS[i][0]);
        const char* low = std::strchr(DIGITS, ORIGINAL_TOKENS[i][1]);
        if (!high || !low) return 3;
        first_bytes[i] = static_cast<std::uint8_t>(
            60 * (high - DIGITS) + (low - DIGITS));
    }
    const std::uint8_t expected[4] = {203, 231, 167, 186};
    if (std::memcmp(first_bytes, expected, sizeof expected) != 0) return 4;
    std::printf("P50 original source prefix: %u %u %u %u\n",
        first_bytes[0], first_bytes[1], first_bytes[2], first_bytes[3]);

    Totals msvc_low, msvc_high;
    for (std::uint32_t seed = FIRST_SEED; seed <= LAST_SEED; ++seed) {
        std::uint32_t state = seed;
        std::uint8_t low[4], high[4];
        for (int i = 0; i < 4; ++i) {
            state = state * 214013U + 2531011U;
            const std::uint32_t output = (state >> 16) & 32767U;
            low[i] = static_cast<std::uint8_t>(output);
            high[i] = static_cast<std::uint8_t>(output >> 7);
        }
        msvc_low.match(matched(low[0], low[1], low[2], low[3]));
        msvc_high.match(matched(high[0], high[1], high[2], high[3]));
    }
    print("MSVC-rand-low8", msvc_low);
    print("MSVC-rand-high8", msvc_high);
    if (msvc_low.prefix[2] != 695 || msvc_low.prefix[3] != 2
        || msvc_low.prefix[4] != 0 || msvc_high.prefix[2] != 678
        || msvc_high.prefix[3] != 2 || msvc_high.prefix[4] != 0) return 5;

#if defined(__GLIBC__)
    Totals glibc_low, glibc_high;
    for (std::uint32_t seed = FIRST_SEED; seed <= LAST_SEED; ++seed) {
        std::srand(static_cast<unsigned int>(seed));
        const std::uint32_t a = static_cast<std::uint32_t>(std::rand());
        const bool l = static_cast<std::uint8_t>(a) == first_bytes[0];
        const bool h = static_cast<std::uint8_t>(a >> 23) == first_bytes[0];
        if (l) ++glibc_low.prefix[1];
        if (h) ++glibc_high.prefix[1];
        if (!l && !h) continue;
        const std::uint32_t b = static_cast<std::uint32_t>(std::rand());
        const bool l2 = l && static_cast<std::uint8_t>(b) == first_bytes[1];
        const bool h2 = h && static_cast<std::uint8_t>(b >> 23) == first_bytes[1];
        if (l2) ++glibc_low.prefix[2];
        if (h2) ++glibc_high.prefix[2];
        if (!l2 && !h2) continue;
        const std::uint32_t c = static_cast<std::uint32_t>(std::rand());
        const bool l3 = l2 && static_cast<std::uint8_t>(c) == first_bytes[2];
        const bool h3 = h2 && static_cast<std::uint8_t>(c >> 23) == first_bytes[2];
        if (l3) ++glibc_low.prefix[3];
        if (h3) ++glibc_high.prefix[3];
        if (!l3 && !h3) continue;
        const std::uint32_t d = static_cast<std::uint32_t>(std::rand());
        if (l3 && static_cast<std::uint8_t>(d) == first_bytes[3])
            ++glibc_low.prefix[4];
        if (h3 && static_cast<std::uint8_t>(d >> 23) == first_bytes[3])
            ++glibc_high.prefix[4];
    }
    print("glibc-rand-low8", glibc_low);
    print("glibc-rand-high8", glibc_high);
    if (glibc_low.prefix[2] != 694 || glibc_low.prefix[3] != 3
        || glibc_low.prefix[4] != 0 || glibc_high.prefix[2] != 702
        || glibc_high.prefix[3] != 1 || glibc_high.prefix[4] != 0) return 6;
#else
    std::puts("GNU-libc rand mode skipped: only reproducible on GNU-libc hosts.");
#endif
    std::printf("PASS: %u timestamp seeds per mode, no four-byte original match.\n",
        LAST_SEED - FIRST_SEED + 1);
}
