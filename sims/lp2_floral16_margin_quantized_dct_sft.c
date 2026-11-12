/* Compare original JPEG quantized DCT in visually identical LP2 margins. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
    struct jpeg_decompress_struct decoder;
    struct jpeg_error_mgr error;
    FILE *file;
    jvirt_barray_ptr *coefficients;
} Page;

typedef struct {
    unsigned long long blocks;
    unsigned long long differences;
} Count;

static void open_page(Page *page, const char *name) {
    memset(page, 0, sizeof(*page));
    page->file = fopen(name, "rb");
    if (!page->file) { perror(name); exit(1); }
    page->decoder.err = jpeg_std_error(&page->error);
    jpeg_create_decompress(&page->decoder);
    jpeg_stdio_src(&page->decoder, page->file);
    jpeg_read_header(&page->decoder, TRUE);
    page->coefficients = jpeg_read_coefficients(&page->decoder);
    if (page->decoder.image_width != 2400 ||
        page->decoder.image_height != 3600) {
        fprintf(stderr, "Incorrect page geometry: %s\n", name);
        exit(1);
    }
}

static void close_page(Page *page) {
    jpeg_finish_decompress(&page->decoder);
    jpeg_destroy_decompress(&page->decoder);
    fclose(page->file);
}

static int same_quantization(Page *a, Page *b) {
    if (a->decoder.num_components != b->decoder.num_components) return 0;
    for (int i = 0; i < a->decoder.num_components; i++) {
        int qa = a->decoder.comp_info[i].quant_tbl_no;
        int qb = b->decoder.comp_info[i].quant_tbl_no;
        if (memcmp(a->decoder.quant_tbl_ptrs[qa]->quantval,
                   b->decoder.quant_tbl_ptrs[qb]->quantval,
                   sizeof(a->decoder.quant_tbl_ptrs[qa]->quantval))) return 0;
    }
    return 1;
}

static Count compare_region(Page *a, Page *b, int component,
                            int x0, int y0, int x1, int y1) {
    jpeg_component_info *info = &a->decoder.comp_info[component];
    int sw = 8 * a->decoder.max_h_samp_factor / info->h_samp_factor;
    int sh = 8 * a->decoder.max_v_samp_factor / info->v_samp_factor;
    int xa = (x0 + sw - 1) / sw, xb = x1 / sw;
    int ya = (y0 + sh - 1) / sh, yb = y1 / sh;
    Count count = {0, 0};
    for (int y = ya; y < yb; y++) {
        JBLOCKARRAY ra = (*a->decoder.mem->access_virt_barray)(
            (j_common_ptr)&a->decoder, a->coefficients[component], y, 1, FALSE);
        JBLOCKARRAY rb = (*b->decoder.mem->access_virt_barray)(
            (j_common_ptr)&b->decoder, b->coefficients[component], y, 1, FALSE);
        for (int x = xa; x < xb; x++) {
            count.blocks++;
            for (int k = 0; k < DCTSIZE2; k++) {
                if (ra[0][x][k] != rb[0][x][k]) count.differences++;
            }
        }
    }
    return count;
}

static unsigned long long test_region(Page *a, Page *b, const char *label,
                                      int x0, int y0, int x1, int y1,
                                      int should_match) {
    unsigned long long differences = 0, blocks = 0;
    for (int i = 0; i < a->decoder.num_components; i++) {
        Count c = compare_region(a, b, i, x0, y0, x1, y1);
        differences += c.differences;
        blocks += c.blocks;
    }
    printf(" %s: %llu changed coefficients in %llu blocks\n",
           label, differences, blocks);
    if ((differences == 0) != should_match) {
        fprintf(stderr, "Unexpected DCT comparison: %s\n", label);
        exit(1);
    }
    return blocks * DCTSIZE2;
}

int main(int argc, char **argv) {
    const char *folder = argc > 1 ? argv[1] : "resources/liber-primus";
    const int grayscale[] = {58, 59, 60, 61, 62, 63, 64, 65, 67, 68, 69};
    const int color[] = {57, 66, 70, 71, 72};
    char from[512], to[512];
    unsigned long long compared = 0, margins_compared = 0;
    for (int group = 0; group < 2; group++) {
        const int *pages = group ? color : grayscale;
        int n = group ? 5 : 11;
        Page baseline;
        snprintf(from, sizeof(from), "%s/%02d.jpg", folder, pages[0]);
        open_page(&baseline, from);
        if (baseline.decoder.num_components != (group ? 3 : 1)) {
            fprintf(stderr, "Unexpected component count\n");
            return 2;
        }
        for (int j = 1; j < n; j++) {
            Page second;
            snprintf(to, sizeof(to), "%s/%02d.jpg", folder, pages[j]);
            open_page(&second, to);
            if (!same_quantization(&baseline, &second)) {
                fprintf(stderr, "Quantization does not match\n");
                return 2;
            }
            printf("%02d.jpg versus %02d.jpg:\n", pages[0], pages[j]);
            unsigned long long l = test_region(
                &baseline, &second, "left floral", 70, 600, 550, 2950, 1);
            unsigned long long r = test_region(
                &baseline, &second, "right floral", 1850, 600, 2380, 2950, 1);
            margins_compared += l + r;
            compared += l + r;
            compared += test_region(
                &baseline, &second, "changing text positive",
                650, 650, 1750, 2850, 0);
            close_page(&second);
        }
        close_page(&baseline);
    }
    if (margins_compared != 37113344ULL || compared != 75271680ULL) {
        fprintf(stderr, "Unexpected comparison dimensions\n");
        return 1;
    }
    printf("PASS: %llu identical original floral-margin DCT coefficients,"
           " %llu total coefficients checked\n", margins_compared, compared);
    return 0;
}
