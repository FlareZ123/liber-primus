/*
 * Native OutGuess JPEG-6b usable-coefficient capacity, read-only original SFT.
 * Compile this C11 source against libjpeg. Default JPEG directory:
 * resources/liber-primus; pass one directory argument to override.
 * Source criterion: steg_use_bit() skips only DCT coefficient 0 and +1.
 */
#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>

typedef struct { int scan; unsigned long long bits; } page_t;

static unsigned long long usable(const char *filename) {
    FILE *file = fopen(filename, "rb");
    if (!file) { perror(filename); exit(EXIT_FAILURE); }
    struct jpeg_decompress_struct jpeg = {0};
    struct jpeg_error_mgr error;
    jpeg.err = jpeg_std_error(&error);
    jpeg_create_decompress(&jpeg);
    jpeg_stdio_src(&jpeg, file);
    if (jpeg_read_header(&jpeg, TRUE) != JPEG_HEADER_OK) {
        fprintf(stderr, "Unreadable source JPEG: %s\n", filename);
        exit(EXIT_FAILURE);
    }
    jvirt_barray_ptr *planes = jpeg_read_coefficients(&jpeg);
    unsigned long long bits = 0;
    for (int c = 0; c < jpeg.num_components; ++c) {
        const jpeg_component_info *component = jpeg.comp_info + c;
        for (JDIMENSION y = 0; y < component->height_in_blocks; ++y) {
            const JBLOCKARRAY row = jpeg.mem->access_virt_barray(
                (j_common_ptr)&jpeg, planes[c], y, 1, FALSE);
            for (JDIMENSION x = 0; x < component->width_in_blocks; ++x)
                for (int k = 0; k < DCTSIZE2; ++k) {
                    const JCOEF v = row[0][x][k];
                    if (v != 0 && v != 1) ++bits;
                }
        }
    }
    jpeg_destroy_decompress(&jpeg);
    fclose(file);
    return bits;
}

static int cmp_capacity(const void *a, const void *b) {
    const page_t *x = a, *y = b;
    if (x->bits < y->bits) return 1;
    if (x->bits > y->bits) return -1;
    return x->scan - y->scan;
}

static int has_modern_header(int scan) {
    const int values[] = {17,21,43,57,58,59,60,61,62,63,64,65,68,69,70,71};
    for (unsigned i = 0; i < sizeof(values)/sizeof(values[0]); ++i)
        if (scan == values[i]) return 1;
    return 0;
}

int main(int argc, char **argv) {
    if (argc > 2) { fprintf(stderr, "Usage: capacity_sft [JPEG_directory]\n"); return 2; }
    const char *root = argc == 2 ? argv[1] : "resources/liber-primus";
    const int controls[] = {6,7,8,9};
    const unsigned long long historical[] = {800881,804376,578114,704507};
    char filename[4096];
    for (unsigned i=0; i<4; ++i) {
        snprintf(filename, sizeof(filename), "%s/%02d.jpg", root, controls[i]);
        const unsigned long long bits = usable(filename);
        printf("2014 scan %02d: %llu bits (source transcript: %llu)\n",
               controls[i], bits, historical[i]);
        if (bits != historical[i]) return 1;
    }
    page_t pages[58];
    for (int i=0; i<58; ++i) {
        const int scan=i+17;
        snprintf(filename, sizeof(filename), "%s/%02d.jpg", root, scan);
        pages[i]=(page_t){scan,usable(filename)};
    }
    qsort(pages, 58, sizeof(pages[0]), cmp_capacity);
    for (int i=0; i<58; ++i) {
        const int observed=has_modern_header(pages[i].scan);
        if (observed != (i<16)) {
            fprintf(stderr, "Capacity/header disagreement: %02d rank %d\n",
                    pages[i].scan, i+1);
            return 1;
        }
        if (i<18) printf("rank %2d original %02d.jpg p%02d: %llu bits, %s\n",
                        i+1, pages[i].scan, pages[i].scan-17, pages[i].bits,
                        observed?"41408/58152":"no matching output");
    }
    if (pages[15].bits != 692043 || pages[16].bits != 687226 ||
        pages[15].scan != 68 || pages[16].scan != 18) return 1;
    printf("PASS: modern nominal positives are exactly the top 16 DCT-capacity scans.\n");
    printf("Rank16/rank17 capacity gap: %llu bits.\n",
           pages[15].bits-pages[16].bits);
    puts("The observed selection and header length do not authenticate payload bytes.");
    return 0;
}
