/* Original LP2 final-16 ornament DCT identity gate.
   Build: cc -std=c11 -O2 -Wall -Wextra -o ornament_gate sims/jpeg_ornament_template_gate.c -ljpeg
   Run:   ornament_gate resources/liber-primus
   Compares source JPEGs 57..72. No stego decoder or plaintext claim. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

typedef struct {
  FILE *file;
  struct jpeg_decompress_struct decoder;
  struct jpeg_error_mgr errors;
  jvirt_barray_ptr *coefficients;
} JPEG;

static void load(JPEG *j,const char *path){
  memset(j,0,sizeof(*j));
  j->file=fopen(path,"rb");
  if(!j->file){perror(path);exit(2);}
  j->decoder.err=jpeg_std_error(&j->errors);
  jpeg_create_decompress(&j->decoder);
  jpeg_stdio_src(&j->decoder,j->file);
  if(jpeg_read_header(&j->decoder,TRUE)!=JPEG_HEADER_OK){fprintf(stderr,"bad JPEG header\n");exit(2);}
  j->coefficients=jpeg_read_coefficients(&j->decoder);
  if(j->decoder.image_width!=2400 || j->decoder.image_height!=3600){fprintf(stderr,"bad original geometry\n");exit(2);}
}

static void release(JPEG *j){
  jpeg_finish_decompress(&j->decoder);
  jpeg_destroy_decompress(&j->decoder);
  fclose(j->file);
}

typedef struct {unsigned long long compared, different; } Comparison;

/* Pixel-safe 16x16 MCU geometry: 400 <= y < 3192 and x <432 or x >=1960. */
static Comparison compare(const JPEG *reference, const JPEG *candidate, int component){
  const jpeg_component_info *a=&reference->decoder.comp_info[component];
  const jpeg_component_info *b=&candidate->decoder.comp_info[component];
  if(a->width_in_blocks != b->width_in_blocks || a->height_in_blocks != b->height_in_blocks ||
     reference->decoder.max_h_samp_factor*b->h_samp_factor != candidate->decoder.max_h_samp_factor*a->h_samp_factor ||
     reference->decoder.max_v_samp_factor*b->v_samp_factor != candidate->decoder.max_v_samp_factor*a->v_samp_factor){
    fprintf(stderr,"incompatible component dimensions\n");exit(2);
  }
  Comparison output={0,0};
  for(JDIMENSION y=0;y<a->height_in_blocks;y++){
    const int py=(int)(y*8*reference->decoder.max_v_samp_factor/a->v_samp_factor);
    if(py<400||py>=3192)continue;
    JBLOCKARRAY ar=(*reference->decoder.mem->access_virt_barray)((j_common_ptr)&reference->decoder,reference->coefficients[component],y,1,FALSE);
    JBLOCKARRAY br=(*candidate->decoder.mem->access_virt_barray)((j_common_ptr)&candidate->decoder,candidate->coefficients[component],y,1,FALSE);
    for(JDIMENSION x=0;x<a->width_in_blocks;x++){
      const int px=(int)(x*8*reference->decoder.max_h_samp_factor/a->h_samp_factor);
      if(px>=432 && px<1960)continue;
      for(int k=0;k<64;k++){
        output.compared++;
        output.different += (ar[0][x][k]!=br[0][x][k]);
      }
    }
  }
  return output;
}

int main(int argc,char **argv){
  if(argc!=2){fprintf(stderr,"Use: ornament_gate <original-jpg-directory>\n");return 2;}
  char path[4096];
  snprintf(path,sizeof(path),"%s/57.jpg",argv[1]);
  JPEG original;load(&original,path);
  unsigned long long totalY=0,totalChroma=0;
  for(int n=58;n<=72;n++){
    snprintf(path,sizeof(path),"%s/%02d.jpg",argv[1],n);
    JPEG item;load(&item,path);
    Comparison y=compare(&original,&item,0);
    if(y.different!=0){fprintf(stderr,"unexpected luma change at scan %d\n",n);return 1;}
    totalY+=y.compared;
    if(item.decoder.num_components==3){
      if(original.decoder.num_components!=3){fprintf(stderr,"bad reference\n");return 2;}
      for(int c=1;c<3;c++){
        Comparison z=compare(&original,&item,c);
        if(z.different!=0){fprintf(stderr,"unexpected chroma change at scan %d\n",n);return 1;}
        totalChroma+=z.compared;
      }
    }
    printf("scan%02d: Y %llu identical coefficients, components %d\n",n,y.compared,item.decoder.num_components);
    release(&item);
  }
  release(&original);
  printf("final16 original-source side-frame identity: Y=%llu chroma=%llu differing=0\n",totalY,totalChroma);
  /* Neighbor controls must NOT be assumed to have the same side artwork. */
  if(totalY==0){fprintf(stderr,"no luma coefficients tested\n");return 1;}
  return 0;
}
