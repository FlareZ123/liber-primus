#include <cstdint>
#include <vector>
#include <algorithm>
#include <cassert>
using U=uint32_t;
static int N;
static U ALL;
static std::vector<std::vector<int>> frames;
struct Segment {std::vector<int> d; std::vector<int> hold; U initial; int id;};
static std::vector<Segment> segs;
extern "C" void init(int n,const int* data,const int* lengths,int count,int minrun){
 N=n;ALL=(1u<<n)-1;frames.clear();segs.clear();int base=0;
 for(int p=0;p<count;p++){
  auto f=std::vector<int>(data+base,data+base+lengths[p]);base+=lengths[p];frames.push_back(f);
  Segment s; s.initial=1;s.id=p;
  for(int i=1;i<int(f.size());i++){s.d.push_back((f[i]-f[i-1]+N)%N);s.hold.push_back(f[i]==0);}segs.push_back(s);
  if(minrun<=0)continue;
  for(int i=1;i<int(f.size());){if(!f[i]){i++;continue;}int j=i;while(j<int(f.size())&&f[j])j++;
   if(i>1&&j-i>=minrun){Segment t;t.initial=ALL;t.id=count+p;for(int k=i;k<j;k++){t.d.push_back((f[k]-f[k-1]+N)%N);t.hold.push_back(0);}segs.push_back(t);}i=j;
  }
 }
}
static inline U rot(U mask,int d){return ((mask<<d)|(mask>>(N-d)))&ALL;}
// An unknown row can take ANY unused key label at each appearance. This
// relaxes global consistency but never removes a genuine key extension.
static bool fails(const Segment& f,const int* k,U assigned,U* visited=nullptr){
 U used=0;for(U b=assigned;b;b&=b-1)used|=1u<<k[__builtin_ctz(b)];U avail=ALL^used;
 U S=f.initial,seen=0;
 for(unsigned i=0;i<f.d.size();i++){
  seen|=S;
  U vals=(S&~assigned)?avail:0;
  for(U b=S&assigned;b;b&=b-1) vals|=1u<<k[__builtin_ctz(b)];
  U nxt=rot(vals,f.d[i])&~1u;
  if(f.hold[i])nxt|=S;
  if(!(S=nxt)){if(visited)*visited=seen;return true;}
 }
 return false;
}
extern "C" int full_fail_count(const int* k){int n=0;for(const auto& s:segs)if(s.initial==1&&fails(s,k,ALL))n++;return n;}
extern "C" int clauses(const int* k,U* masks,int* ids,int cap,int order){
 int n=0;
 for(const auto& f:segs){U seen=0;if(!fails(f,k,ALL,&seen))continue;U mask=seen|1u;
  assert(fails(f,k,mask));
  // Different deletion orders give independent, sound minimal clauses.
  for(int i=0;i<N-1;i++){
   int r=1+((i+order)%(N-1));U bit=1u<<r;
   if((mask&bit)&&fails(f,k,mask^bit))mask^=bit;
  }
  assert(fails(f,k,mask));
  if(n==cap)return n;masks[n]=mask;ids[n]=f.id;n++;
 }
 return n;
}
extern "C" int nsegments(){return segs.size();}
