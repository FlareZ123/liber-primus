/*
 * Original LP2 Q92 source-image pairwise stencil census, C99 + libjpeg.
 * From the repo root:
 * cc -O2 -std=c99 sims/lp2_jpeg_pairwise_margin_sft.c -ljpeg -o lp2_jpeg_pairwise_sft
 * Run: lp2_jpeg_pairwise_sft
 * Exact original blocks come directly from JPEG quantized DCT, not pixels.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <jpeglib.h>
#define LP2_PAGES 58
#define STENCIL_W 128
#define STENCIL_H 336
#define STENCIL_N (STENCIL_W * STENCIL_H)
static uint64_t blockhash[LP2_PAGES][STENCIL_N];
static unsigned nonzero_ac[LP2_PAGES];

typedef struct {
    struct jpeg_decompress_struct info;
    struct jpeg_error_mgr err;
    FILE *file;
    jvirt_barray_ptr *coefs;
} Original;
static void open_original(Original *o, int page) {
    char name[128];
    snprintf(name, sizeof name, "resources/liber-primus/%02d.jpg", page + 17);
    memset(o, 0, sizeof *o);
    o->info.err = jpeg_std_error(&o->err);
    jpeg_create_decompress(&o->info);
    o->file = fopen(name, "rb");
    if (!o->file) { perror(name); exit(EXIT_FAILURE); }
    jpeg_stdio_src(&o->info, o->file);
    jpeg_read_header(&o->info, TRUE);
    o->coefs = jpeg_read_coefficients(&o->info);
    if (o->info.comp_info[0].width_in_blocks != 300 ||
        o->info.comp_info[0].height_in_blocks != 450) {
        fprintf(stderr, "Unexpected DCT dimensions for page %d\n", page);
        exit(EXIT_FAILURE);
    }
}
static void close_original(Original *o) {
    jpeg_destroy_decompress(&o->info);
    fclose(o->file);
}
static int nonzero(const JCOEF *v) {
    for (int k=1;k<64;k++) if(v[k] != 0) return 1;
    return 0;
}
static uint64_t fingerprint(const JCOEF *v) {
    uint64_t h = UINT64_C(1469598103934665603);
    for(int k=0;k<64;k++) {
        uint16_t a=(uint16_t)v[k];
        h ^= (uint8_t)a; h *= UINT64_C(1099511628211);
        h ^= (uint8_t)(a>>8); h *= UINT64_C(1099511628211);
    }
    return h;
}
static void census_page(int page) {
    Original o; open_original(&o,page);
    for (int y=64;y<400;y++) {
        JBLOCKARRAY row = (*o.info.mem->access_virt_barray)(
            (j_common_ptr)&o.info, o.coefs[0], (JDIMENSION)y, 1, FALSE);
        for(int ix=0;ix<STENCIL_W;ix++) {
            int x=ix<64 ? ix : ix+172;
            const JCOEF *v=row[0][x];
            if (!nonzero(v)) continue;
            blockhash[page][(y-64)*STENCIL_W+ix]=fingerprint(v);
            nonzero_ac[page]++;
        }
    }
    close_original(&o);
}
static unsigned hash_pair(int p,int q) {
    unsigned count=0;
    for (int k=0;k<STENCIL_N;k++)
        if(blockhash[p][k] != 0 && blockhash[p][k] == blockhash[q][k]) count++;
    return count;
}
/* Full 64-coefficient equality check independent of the discovery hash. */
static unsigned exact_pair(int p,int q) {
    Original a,b; open_original(&a,p);open_original(&b,q);
    unsigned count=0;
    for (int y=64;y<400;y++) {
        JBLOCKARRAY aa = (*a.info.mem->access_virt_barray)(
            (j_common_ptr)&a.info,a.coefs[0],(JDIMENSION)y,1,FALSE);
        JBLOCKARRAY bb = (*b.info.mem->access_virt_barray)(
            (j_common_ptr)&b.info,b.coefs[0],(JDIMENSION)y,1,FALSE);
        for(int ix=0;ix<STENCIL_W;ix++) {
            int x=ix<64 ? ix : ix+172;
            if(nonzero(aa[0][x]) && memcmp(aa[0][x],bb[0][x],sizeof(JBLOCK)) == 0) count++;
        }
    }
    close_original(&a);close_original(&b);return count;
}
int main(void) {
    for(int p=0;p<LP2_PAGES;p++)census_page(p);
    const int checks[][3]={{1,2,3877},{3,4,1674},{8,10,276},{24,25,348},{24,26,10805},{25,26,348},{40,41,7741}};
    printf("SOURCE TEST: all 58 original JPEGs, exterior luma DCT x<512 or x>=1888; 512<=y<3200\n");
    printf("POSITIVE PAIR CHECKS: 64-entry exact coefficient equality and nonzero AC\n");
    for(size_t i=0;i<sizeof(checks)/sizeof(checks[0]);i++) {
        int p=checks[i][0],q=checks[i][1],expect=checks[i][2];
        unsigned fast=hash_pair(p,q), exact=exact_pair(p,q);
        printf("p%02d/p%02d nonzero-AC identical: hash %u, byte-exact %u (expected %d)\n",
               p,q,fast,exact,expect);
        if (fast != exact || fast != (unsigned)expect) return EXIT_FAILURE;
    }
    unsigned new_pairs=0, all_pairs=0;
    for(int p=0;p<LP2_PAGES;p++) for(int q=p+1;q<LP2_PAGES;q++) {
        unsigned c=hash_pair(p,q);
        if(c>=50)all_pairs++;
        if(c>=1000 && (p<4 || p==8 || p==24 || p==26)) {
           printf("PAIR-EXTRA p%02d/p%02d shared=%u\n",p,q,c);new_pairs++;
        }
    }
    printf("pairs with >=50 identical nonzero-AC blocks: %u; large source-marginal edges: %u\n",all_pairs,new_pairs);
    if(all_pairs != 143 || new_pairs != 6) return EXIT_FAILURE;
    puts("PASS; source equality is not an authenticated F5 detector or LP2 decryption.");
    return EXIT_SUCCESS;
}
