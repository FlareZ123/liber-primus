// Exact affine-space search for common-cycle q8 with literal F holds.
// Input: n, then one ciphertext word / domain-size line, followed by domain words.
#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <cmath>
#include <fstream>
#include <iostream>
#include <limits>
#include <numeric>
#include <string>
#include <unordered_map>
#include <vector>
#include <immintrin.h>
#include <omp.h>
using namespace std;
using u8=uint8_t;using U64=uint64_t;
constexpr int V=37,Q=8,S=29,W=64;
const string alphabet="0123456789abcdefghijklmnopqrs";
static u8 mult[29][29],inv[29];
static inline int md(int x){return (x%29+29)%29;}
static inline __m256i modvec(__m256i x){const auto m=_mm256_set1_epi8(29),h=_mm256_set1_epi8(28);return _mm256_sub_epi8(x,_mm256_and_si256(m,_mm256_cmpgt_epi8(x,h)));}
static inline __m256i subvec(__m256i a,__m256i b){return modvec(_mm256_sub_epi8(_mm256_add_epi8(a,_mm256_set1_epi8(29)),b));}
struct alignas(32) State{int d=34;alignas(32) u8 a[V][W]{};State(){a[1][d]=1;for(int x=2;x<28;x++)a[x][x-2]=1;for(int x=0;x<26;x++)a[28][x]=28;a[28][d]=28;for(int j=0;j<Q;j++)a[29+j][26+j]=1;}};
struct Edge{u8 c,p,j;};
struct Option{string word;vector<Edge> e;};
struct EdgeMask{Edge e;vector<U64> mask;};
struct Group{string cipher;vector<Option> opts;vector<EdgeMask> masks;};
static vector<Group> groups;
static vector<int> order;
static int maxOOV=0;
static atomic<bool> stopFlag{false},found{false};
static atomic<U64> globalNodes{0},globalExtends{0},globalFilter{0},globalEnum{0},globalResidual{0};
static chrono::steady_clock::time_point endTime,startTime;
static double elapsed(){return chrono::duration<double>(chrono::steady_clock::now()-startTime).count();}
static bool timeout(){if(stopFlag.load(memory_order_relaxed))return true;if(chrono::steady_clock::now()>endTime){stopFlag=true;return true;}return false;}
static inline void edgeform(const State& st,int c,int p,int j,u8* e){
 for(int q=0;q<(st.d<32?1:2);q++){
  auto a=_mm256_load_si256((const __m256i*)(st.a[c]+q*32));auto b=_mm256_load_si256((const __m256i*)(st.a[p]+q*32));auto k=_mm256_load_si256((const __m256i*)(st.a[29+j]+q*32));
  auto r=subvec(subvec(a,b),k);_mm256_store_si256((__m256i*)(e+q*32),r);
 }
}
static bool alldiff(const State& st){for(int x=0;x<29;x++)for(int y=x+1;y<29;y++)if(!memcmp(st.a[x],st.a[y],st.d+1))return false;return true;}
static bool hyperplane_possible(const State& st){
 if(st.d>5)return true;
 struct H{array<u8,34> coeff{};uint32_t mask=0;};
 vector<H> h;h.reserve(406);
 for(int x=0;x<29;x++)for(int y=x+1;y<29;y++){
  H a;int p=-1;for(int j=0;j<st.d;j++){a.coeff[j]=md(st.a[x][j]-st.a[y][j]);if(a.coeff[j])p=j;}
  int b=md(st.a[x][st.d]-st.a[y][st.d]);if(p<0){if(!b)return false;continue;}
  int f=inv[a.coeff[p]];for(int j=0;j<st.d;j++)a.coeff[j]=mult[f][a.coeff[j]];
  a.mask=1u<<md(-mult[f][b]);h.push_back(a);
 }
 sort(h.begin(),h.end(),[](const H&a,const H&b){return a.coeff<b.coeff;});uint32_t m=0;
 for(size_t i=0;i<h.size();i++){if(i==0||h[i].coeff!=h[i-1].coeff)m=0;m|=h[i].mask;if(m==((1u<<29)-1))return false;}return true;
}
static bool primitive_possible(const State& st){for(int j=0;j<4;j++)if(memcmp(st.a[29+j],st.a[33+j],st.d+1))return true;return false;}
static bool impose(State& st,const Edge& ed,int phase){
 alignas(32) u8 e[W]{};edgeform(st,ed.c,ed.p,(ed.j+phase)&7,e);int d=st.d,p=-1;for(int i=d-1;i>=0;i--)if(e[i]){p=i;break;}
 if(p<0)return e[d]==0;
 int factor=inv[e[p]];for(int i=0;i<=d;i++)e[i]=mult[factor][e[i]];
 __m256i m0[29],m1[29],v0=_mm256_load_si256((const __m256i*)e),v1=_mm256_setzero_si256();
 if(d>=32)v1=_mm256_load_si256((const __m256i*)(e+32));m0[0]=m1[0]=_mm256_setzero_si256();
 for(int i=1;i<29;i++){m0[i]=modvec(_mm256_add_epi8(m0[i-1],v0));if(d>=32)m1[i]=modvec(_mm256_add_epi8(m1[i-1],v1));}
 for(int x=0;x<V;x++){
  int f=st.a[x][p];if(f){auto a=_mm256_load_si256((const __m256i*)st.a[x]);_mm256_store_si256((__m256i*)st.a[x],subvec(a,m0[f]));if(d>=32){a=_mm256_load_si256((const __m256i*)(st.a[x]+32));_mm256_store_si256((__m256i*)st.a[x]+32,subvec(a,m1[f]));}}
  if(p!=d-1)st.a[x][p]=st.a[x][d-1];st.a[x][d-1]=st.a[x][d];
 }
 st.d--;return true;
}
static bool extend(State& st,const Option& op,int phase){for(auto ed:op.e){if(!impose(st,ed,phase))return false;}return alldiff(st)&&primitive_possible(st)&&hyperplane_possible(st);}
struct Filter{
 const State& st;array<int8_t,29*29*8> cache;vector<pair<U64,array<u8,35>>> forbidden;
 static bool norm(u8* a,int d,U64& h){int p=-1;for(int j=d-1;j>=0;j--)if(a[j]){p=j;break;}if(p<0)return false;int f=inv[a[p]];h=1469598103934665603ULL;for(int j=0;j<=d;j++){a[j]=mult[f][a[j]];h=(h^a[j])*1099511628211ULL;}return true;}
 Filter(const State& s):st(s){cache.fill(-1);for(int x=0;x<29;x++)for(int y=x+1;y<29;y++){array<u8,35> z{};for(int j=0;j<=st.d;j++)z[j]=md(st.a[x][j]-st.a[y][j]);U64 h=0;if(norm(z.data(),st.d,h))forbidden.push_back({h,z});}sort(forbidden.begin(),forbidden.end(),[](auto&a,auto&b){return a.first<b.first;});}
 bool allow(const Edge& e,int phase){int j=(e.j+phase)&7,id=(e.c*29+e.p)*8+j;int8_t& v=cache[id];if(v>=0)return v;alignas(32) u8 z[W]{};edgeform(st,e.c,e.p,j,z);U64 h=0;if(!norm(z,st.d,h))return v=(z[st.d]==0);auto a=lower_bound(forbidden.begin(),forbidden.end(),h,[](const auto& x,U64 v){return x.first<v;});for(;a!=forbidden.end()&&a->first==h;a++)if(!memcmp(a->second.data(),z,st.d+1))return v=0;return v=1;}
 bool allow(const Option& o,int phase){for(auto e:o.e)if(!allow(e,phase))return false;return true;}
};
// Exact bitset filtering by each necessary affine edge.
static void build_masks(Group& g){int words=(g.opts.size()+63)/64;array<int,29*29*8> idx;idx.fill(-1);
 for(int i=0;i<(int)g.opts.size();i++)for(auto e:g.opts[i].e){int k=(e.c*29+e.p)*8+e.j;if(idx[k]<0){idx[k]=g.masks.size();g.masks.push_back({e,vector<U64>(words)});}g.masks[idx[k]].mask[i/64]|=1ULL<<(i%64);}
}
struct Domain{vector<pair<int,int>> entries;bool cutoff=false;};
static Domain domain(const Group&g,Filter& f,size_t cap){Domain ret;int n=g.opts.size(),nw=(n+63)/64;vector<U64> bits(nw);
 for(int j=0;j<8;j++){fill(bits.begin(),bits.end(),~0ULL);if(n%64)bits.back()=(1ULL<<(n%64))-1;
  for(auto& e:g.masks)if(!f.allow(e.e,j)){for(int k=0;k<nw;k++)bits[k]&=~e.mask[k];}
  for(int k=0;k<nw;k++){U64 b=bits[k];while(b){int i=__builtin_ctzll(b);ret.entries.push_back({64*k+i,j});if(ret.entries.size()>=cap){ret.cutoff=true;return ret;}b&=b-1;}}
 }return ret;}
static bool contains(const Group& g,const string& w){auto p=lower_bound(g.opts.begin(),g.opts.end(),w,[](auto& a,const string& b){return a.word<b;});return p!=g.opts.end()&&p->word==w;}
static bool support_rec(const Group& g,const int* map,int i,int j,string& w){if(i==(int)g.cipher.size())return contains(g,w);int c=alphabet.find(g.cipher[i]);if(c==0){w[i]='0';if(support_rec(g,map,i+1,j,w))return true;}int p=map[j*29+c];if(!p)return false;w[i]=alphabet[p];return support_rec(g,map,i+1,(j+1)&7,w);}
static bool support(const Group& g,const int* map){string w(g.cipher.size(),'0');for(int j=0;j<8;j++)if(support_rec(g,map,0,j,w))return true;return false;}
static bool check_key(const int* pi,const int* k){uint32_t seen=0;for(int x=0;x<29;x++){uint32_t b=1u<<pi[x];if(seen&b)return false;seen|=b;}bool prim=false;for(int j=0;j<4;j++)prim|=k[j]!=k[j+4];if(!prim)return false;int invpi[29],maps[8*29];for(int x=0;x<29;x++)invpi[pi[x]]=x;for(int j=0;j<8;j++)for(int c=0;c<29;c++)maps[j*29+c]=invpi[md(pi[c]-k[j])];int oov=0;for(int g:order)if(!support(groups[g],maps)&&++oov>maxOOV)return false;bool expected=false;if(found.compare_exchange_strong(expected,true)){
 #pragma omp critical
 {cout<<"KEY pi";for(int x=0;x<29;x++)cout<<' '<<pi[x];cout<<"\nKEY k";for(int j=0;j<8;j++)cout<<' '<<k[j];cout<<"\nOOV "<<oov<<"\n"<<flush;}
 }stopFlag=true;return true;}
static bool complete(const State& st){int d=st.d;if(d>2)return false;int total=d==0?1:d==1?29:841;for(int t=0;t<total;t++){int v[V];int f0=t%29,f1=t/29;for(int x=0;x<V;x++){int n=st.a[x][d];if(d>0)n+=st.a[x][0]*f0;if(d>1)n+=st.a[x][1]*f1;v[x]=n%29;}globalEnum++;if(check_key(v,v+29))return true;}return false;}
struct Count{U64 nodes=0,ext=0,filter=0;};
static void flushCount(Count& c){globalNodes+=c.nodes;globalExtends+=c.ext;globalFilter+=c.filter;c={};}
static void dfs(const State& st,int level,Count& cnt,vector<int> rem,int budget){
 if(stopFlag.load(memory_order_relaxed))return;
 if((++cnt.nodes&1023)==0){flushCount(cnt);if(timeout())return;}
 if(st.d<=2){complete(st);return;}
 if((int)rem.size()<=budget){globalResidual++;return;}
 Filter f(st);int choice=-1;Domain best;size_t cap=numeric_limits<size_t>::max();
 int ntry=level<=1?min((int)rem.size(),4):st.d>15?min((int)rem.size(),6):(int)rem.size();
 for(int i=0;i<ntry;){Domain d=domain(groups[rem[i]],f,cap);
  if(!d.cutoff&&d.entries.empty()){
   if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(choice>i)choice--;continue;
  }
  if(choice<0||(!d.cutoff&&d.entries.size()<best.entries.size())){best=move(d);choice=i;cap=best.entries.size();}
  i++;
 }
 if(choice<0){globalResidual++;return;}
 int gid=rem[choice];rem.erase(rem.begin()+choice);auto&g=groups[gid];
 cnt.filter+=best.entries.size();for(auto[i,j]:best.entries){if(stopFlag.load(memory_order_relaxed))return;cnt.ext++;State n=st;if(extend(n,g.opts[i],j))dfs(n,level+1,cnt,rem,budget);}
 if(budget>0)dfs(st,level+1,cnt,rem,budget-1);
}

int main(int argc,char** argv){if(argc<2){cerr<<"usage: solver input [seconds] [threads] [shard index] [shards] [info]\n";return 2;}for(int i=0;i<29;i++)for(int j=0;j<29;j++){mult[i][j]=i*j%29;if(i*j%29==1)inv[i]=j;}
 ifstream in(argv[1]);int n;in>>n;groups.resize(n);for(int i=0;i<n;i++){int m;in>>groups[i].cipher>>m;groups[i].opts.reserve(m);for(int a=0;a<m;a++){string w;in>>w;Option op;op.word=w;int j=0;for(int b=0;b<(int)w.size();b++){int c=alphabet.find(groups[i].cipher[b]),p=alphabet.find(w[b]);if(!p)continue;op.e.push_back({u8(c),u8(p),u8(j)});j=(j+1)&7;}groups[i].opts.push_back(move(op));}sort(groups[i].opts.begin(),groups[i].opts.end(),[](auto&a,auto&b){return a.word<b.word;});build_masks(groups[i]);}
 order.resize(n);iota(order.begin(),order.end(),0);sort(order.begin(),order.end(),[&](int a,int b){size_t x=groups[a].opts.size(),y=groups[b].opts.size();if(argc>6&&string(argv[6])=="info"){auto score=[&](int g){int ordinary=groups[g].cipher.size()-count(groups[g].cipher.begin(),groups[g].cipher.end(),'0');return log2(double(max<size_t>(1,groups[g].opts.size())))/max(1,ordinary);};double sa=score(a),sb=score(b);if(sa!=sb)return sa<sb;}if(x!=y)return x<y;return groups[a].cipher.size()>groups[b].cipher.size();});
 int secs=argc>2?stoi(argv[2]):180,threads=argc>3?stoi(argv[3]):1,shard=argc>4?stoi(argv[4]):0,shards=argc>5?stoi(argv[5]):1;maxOOV=argc>7?stoi(argv[7]):0;if(maxOOV<0||maxOOV>=n)return 2;omp_set_num_threads(threads);startTime=chrono::steady_clock::now();endTime=startTime+chrono::seconds(secs);cout<<"ORDER";for(int g:order)cout<<" "<<g<<":"<<groups[g].opts.size();cout<<"\n"<<flush;
 atomic<int> finished{0};int total=0;
 if(argc>8){
  vector<string> keys;{ifstream keyfile(argv[8]);string key;while(keyfile>>key)if(key.size()==8)keys.push_back(key);}
  total=keys.size();
  #pragma omp parallel for schedule(dynamic,1)
  for(int a=0;a<(int)keys.size();a++){
   if(a%shards!=shard||timeout())continue;
   Count cnt;State st;bool okay=true;
   for(int j=0;j<8;j++)if(!impose(st,Edge{u8(alphabet.find(keys[a][j])),0,u8(j)},0)){okay=false;break;}
   if(okay&&alldiff(st)&&primitive_possible(st))dfs(st,0,cnt,order,maxOOV);
   flushCount(cnt);int f=++finished;
   #pragma omp critical
   {cout<<"KEYWORD "<<keys[a]<<" finished="<<f<<" nodes="<<globalNodes<<" extends="<<globalExtends<<" filters="<<globalFilter<<" enum="<<globalEnum<<" t="<<elapsed()<<"\n"<<flush;}
  }
 }else{
  for(int skip=0;skip<=maxOOV&&!timeout();skip++){
   auto& anchor=groups[order[skip]];total+=anchor.opts.size();
   #pragma omp parallel for schedule(dynamic,1)
   for(int a=0;a<(int)anchor.opts.size();a++){if(a%shards!=shard||timeout())continue;Count cnt;State st;
    if(extend(st,anchor.opts[a],0))dfs(st,1,cnt,vector<int>(order.begin()+skip+1,order.end()),maxOOV-skip);
    flushCount(cnt);int f=++finished;
    #pragma omp critical
    {cout<<"ANCHOR "<<skip<<":"<<a<<" finished="<<f<<" nodes="<<globalNodes<<" extends="<<globalExtends<<" filters="<<globalFilter<<" enum="<<globalEnum<<" t="<<elapsed()<<"\n"<<flush;}
   }
  }
 }
 cout<<"DONE found="<<found<<" timed="<<(chrono::steady_clock::now()>endTime)<<" nodes="<<globalNodes<<" extends="<<globalExtends<<" filters="<<globalFilter<<" enum="<<globalEnum<<" residual="<<globalResidual<<" finished="<<finished<<" total="<<total<<" t="<<elapsed()<<" maxOOV="<<maxOOV<<"\n"<<flush;
}
