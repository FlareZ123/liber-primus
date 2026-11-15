/*
 * Original LP2 JPEG canonical Huffman and entropy-stream test.
 * Build: cc -O2 -Wall -Wextra sims/lp2_jpeg_reencode_canonical_sft.c -ljpeg -o lp2_jpeg_reencode_canonical_sft
 * Run:   lp2_jpeg_reencode_canonical_sft resources/liber-primus
 * Reads original JPEGs. Writes no files and never requantizes image pixels.
 */
#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

static unsigned char *read_input(const char *path,size_t *n) {
    FILE *f=fopen(path,"rb");
    if(!f) return NULL;
    if(fseek(f,0,SEEK_END)!=0) {fclose(f);return NULL;}
    long z=ftell(f);
    if(z<=0 || fseek(f,0,SEEK_SET)!=0) {fclose(f);return NULL;}
    unsigned char *a=malloc((size_t)z);
    if(!a) {fclose(f);return NULL;}
    if(fread(a,1,(size_t)z,f)!=(size_t)z) {free(a);fclose(f);return NULL;}
    fclose(f);*n=(size_t)z;return a;
}

static int app2_profile_span(const unsigned char *bytes,size_t n,size_t *off,size_t *length) {
    if(n<4 || bytes[0]!=0xff || bytes[1]!=0xd8) return 0;
    size_t pos=2;
    int found=0;
    while(pos+4<n) {
        if(bytes[pos]!=0xff) return 0;
        const int marker=bytes[pos+1];
        if(marker==0xda) break;
        size_t data_len=((size_t)bytes[pos+2]<<8)|(size_t)bytes[pos+3];
        size_t segment_len=2+data_len;
        if(data_len<2 || pos+segment_len>n) return 0;
        if(marker==0xe2) {
            if(found || data_len<16 ||
               memcmp(bytes+pos+4,"ICC_PROFILE",11)!=0) return 0;
            *off=pos;*length=segment_len;
            found++;
        }
        pos+=segment_len;
    }
    return found==1 && *length==2594;
}

static int compare_without_profile(const unsigned char *orig,size_t orig_len,
                                   const unsigned char *rebuilt,size_t rebuilt_len) {
    size_t off=0,removed=0;
    if(!app2_profile_span(orig,orig_len,&off,&removed) ||
       orig_len!=rebuilt_len+removed || off>rebuilt_len) return 0;
    return memcmp(orig,rebuilt,off)==0 &&
           memcmp(orig+off+removed,rebuilt+off,rebuilt_len-off)==0;
}

static int reencode(const unsigned char *orig,size_t orig_len,int optimized,
                    unsigned char **out,unsigned long *out_len,int *components) {
    struct jpeg_decompress_struct in;
    struct jpeg_compress_struct destination;
    struct jpeg_error_mgr error_in,error_out;
    in.err=jpeg_std_error(&error_in);
    destination.err=jpeg_std_error(&error_out);
    jpeg_create_decompress(&in);
    jpeg_create_compress(&destination);
    jpeg_mem_src(&in,orig,(unsigned long)orig_len);
    jpeg_read_header(&in,TRUE);
    if(in.image_width!=2400 || in.image_height!=3600 ||
       (in.num_components!=1 && in.num_components!=3)) {
        jpeg_destroy_decompress(&in);jpeg_destroy_compress(&destination);
        return 0;
    }
    *components=in.num_components;
    jvirt_barray_ptr *coefficients=jpeg_read_coefficients(&in);
    jpeg_mem_dest(&destination,out,out_len);
    jpeg_copy_critical_parameters(&in,&destination);
    destination.optimize_coding=optimized?TRUE:FALSE;
    jpeg_write_coefficients(&destination,coefficients);
    jpeg_finish_compress(&destination);
    jpeg_finish_decompress(&in);
    jpeg_destroy_compress(&destination);
    jpeg_destroy_decompress(&in);
    return 1;
}

int main(int argc,char **argv) {
    if(argc!=2) {
        fprintf(stderr,"Usage: %s <original-image-folder>\n",argv[0]);
        return 2;
    }
    int count=0,gray=0,color=0,opt_control=0;
    for(int scan=17;scan<=74;scan++) {
        char path[512];
        if(snprintf(path,sizeof(path),"%s/%02d.jpg",argv[1],scan)>=(int)sizeof(path)) return 2;
        size_t len=0;
        unsigned char *src=read_input(path,&len);
        if(!src) {fprintf(stderr,"Cannot read: %s\n",path);return 1;}
        unsigned char *out=NULL;
        unsigned long output_len=0;
        int components=0;
        if(!reencode(src,len,1,&out,&output_len,&components) ||
           !compare_without_profile(src,len,out,(size_t)output_len)) {
            fprintf(stderr,"Source-exact optimized JPEG replay FAIL scan %d\n",scan);
            free(src);free(out);return 1;
        }
        printf("scan %02d LP2 p%02d: original=%zu canonical=%lu excluded-ICC=2594 components=%d exact=YES\n",
               scan,scan-17,len,output_len,components);
        if(components==1)gray++;else color++;
        count++;
        free(out);out=NULL;
        if(scan==57 || scan==58 || scan==73) {
            if(!reencode(src,len,0,&out,&output_len,&components) ||
               compare_without_profile(src,len,out,(size_t)output_len)) {
                fprintf(stderr,"No-optimization control failed scan %d\n",scan);
                free(src);free(out);return 1;
            }
            opt_control++;
            free(out);
        }
        free(src);
    }
    if(count!=58 || gray!=23 || color!=35 || opt_control!=3) return 1;
    printf("LP2 ORIGINAL JPEG CANONICAL REPLAY PASS: 58/58 exact; 35 color, 23 gray; 3/3 no-opt controls DIFFER\n");
    return 0;
}
