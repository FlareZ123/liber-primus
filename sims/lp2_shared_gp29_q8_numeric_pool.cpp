// Exact known numeric q8 shifts, unknown shared GP29 permutation, literal-F holds.
#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <numeric>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;using U64=uint64_t;using u8=uint8_t;
constexpr uint32_t MASK=(1u<<29)-1;const string alphabet="0123456789abcdefghijklmnopqrs";
static inline int md(int x){return (x%29+29)%29;}
static inline uint32_t rot(uint32_t m,int d){return d?((m<<d)|(m>>(29-d)))&MASK:m;}
struct Edge{u8 c,p,j;};struct Option{string word;vector<Edge>e;};struct EdgeMask{Edge e;vector<U64>mask;};struct Group{string cipher;vector<Option>opts;vector<EdgeMask>masks;};
static vector<Group> groups;static vector<int>order;static int maxOOV=0;static atomic<bool>stopFlag{false},found{false};static atomic<U64>nodes{0},extensions{0},enumKeys{0},residual{0},filterChecks{0};static chrono::steady_clock::time_point startTime,endTime;
static double elapsed(){return chrono::duration<double>(chrono::steady_clock::now()-startTime).count();}
static bool timeout(){if(stopFlag.load(memory_order_relaxed))return true;if(chrono::steady_clock::now()>endTime){stopFlag=true;return true;}return false;}
struct State{array<u8,29>comp{},coord{},sz{};array<uint32_t,29>mask{};int ncomp=29;State(){for(int i=0;i<29;i++){comp[i]=i;sz[i]=1;mask[i]=1;}}
 bool allow(Edge e,int phase,const array<int,8>&k)const{int c=e.c,p=e.p,d=k[(e.j+phase)&7],a=comp[c],b=comp[p];if(a==b)return md(coord[c]-coord[p])==d;int shift=md(coord[p]+d-coord[c]);return !(rot(mask[a],shift)&mask[b]);}
 bool impose(Edge e,int phase,const array<int,8>&k){int c=e.c,p=e.p,d=k[(e.j+phase)&7],a=comp[c],b=comp[p];if(a==b)return md(coord[c]-coord[p])==d;int shift=md(coord[p]+d-coord[c]);if(sz[a]>sz[b]){swap(a,b);shift=md(-shift);}uint32_t m=rot(mask[a],shift);if(m&mask[b])return false;for(int i=0;i<29;i++)if(comp[i]==a){comp[i]=b;coord[i]=md(coord[i]+shift);}mask[b]|=m;sz[b]+=sz[a];mask[a]=0;sz[a]=0;ncomp--;return true;}
 bool extend(const Option&o,int j,const array<int,8>&k){for(auto e:o.e)if(!impose(e,j,k))return false;
 for(int a=0;a<29;a++)if(sz[a]>1)for(int b=a+1;b<29;b++)if(sz[b]>1&&sz[a]*sz[b]>=29){bool ok=false;for(int s=0;s<29;s++)if(!(mask[a]&rot(mask[b],s))){ok=true;break;}if(!ok)return false;}return true;}
};
static void build_masks(Group&g){int n=(g.opts.size()+63)/64;array<int,29*29*8>idx;idx.fill(-1);for(int i=0;i<(int)g.opts.size();i++)for(auto e:g.opts[i].e){int k=(e.c*29+e.p)*8+e.j;if(idx[k]<0){idx[k]=g.masks.size();g.masks.push_back({e,vector<U64>(n)});}g.masks[idx[k]].mask[i/64]|=1ULL<<(i%64);}}
struct Filter{const State&st;const array<int,8>&k;array<int8_t,29*29*8>cache;Filter(const State&s,const array<int,8>&key):st(s),k(key){cache.fill(-1);}bool allow(Edge e,int phase){int j=(e.j+phase)&7,i=(e.c*29+e.p)*8+j;auto&v=cache[i];if(v<0)v=st.allow(e,phase,k);return v;}};
struct Domain{vector<pair<int,int>>entries;bool cutoff=false;};
static Domain domain(const Group&g,Filter&f,size_t cap){Domain ret;int n=g.opts.size(),nw=(n+63)/64;if(!nw)return ret;vector<U64>bits(nw);for(int j=0;j<8;j++){fill(bits.begin(),bits.end(),~0ULL);if(n%64)bits.back()=(1ULL<<(n%64))-1;for(auto&e:g.masks)if(!f.allow(e.e,j))for(int k=0;k<nw;k++)bits[k]&=~e.mask[k];for(int k=0;k<nw;k++){U64 b=bits[k];while(b){int i=__builtin_ctzll(b);ret.entries.push_back({k*64+i,j});if(ret.entries.size()>=cap){ret.cutoff=true;return ret;}b&=b-1;}}}return ret;}
static bool contains(const Group&g,const string&w){auto p=lower_bound(g.opts.begin(),g.opts.end(),w,[](const Option&a,const string&b){return a.word<b;});return p!=g.opts.end()&&p->word==w;}
static bool support_rec(const Group&g,const int*maps,int i,int j,string&w){if(i==(int)g.cipher.size())return contains(g,w);int c=alphabet.find(g.cipher[i]);if(!c){w[i]='0';if(support_rec(g,maps,i+1,j,w))return true;}int p=maps[29*j+c];if(!p)return false;w[i]=alphabet[p];return support_rec(g,maps,i+1,(j+1)&7,w);}
static bool support(const Group&g,const int*maps){string w(g.cipher.size(),'0');for(int j=0;j<8;j++)if(support_rec(g,maps,0,j,w))return true;return false;}
static bool check_key(const int*pi,const array<int,8>&k){enumKeys++;int inv[29],maps[8*29];for(int x=0;x<29;x++)inv[pi[x]]=x;for(int j=0;j<8;j++)for(int c=0;c<29;c++)maps[29*j+c]=inv[md(pi[c]-k[j])];int oov=0;for(int g:order)if(!support(groups[g],maps)&&++oov>maxOOV)return false;bool exp=false;if(found.compare_exchange_strong(exp,true)){
#pragma omp critical
 {cout<<"KEY pi";for(int x=0;x<29;x++)cout<<' '<<pi[x];cout<<"\nKEY k";for(int x:k)cout<<' '<<x;cout<<"\nOOV "<<oov<<"\n"<<flush;}}
 stopFlag=true;return true;}
static bool pack(const State&s,const array<int,8>&k){vector<int>roots;int fixed=s.comp[0];for(int r=0;r<29;r++)if(s.sz[r]&&r!=fixed)roots.push_back(r);sort(roots.begin(),roots.end(),[&](int a,int b){return s.sz[a]>s.sz[b];});int shift[29]{};shift[fixed]=md(-s.coord[0]);auto rec=[&](auto&&self,int i,uint32_t used)->bool{if(stopFlag.load(memory_order_relaxed))return false;if(i==(int)roots.size()){int pi[29];for(int x=0;x<29;x++)pi[x]=md(s.coord[x]+shift[s.comp[x]]);return check_key(pi,k);}int r=roots[i];for(int d=0;d<29;d++){uint32_t m=rot(s.mask[r],d);if(m&used)continue;shift[r]=d;if(self(self,i+1,used|m))return true;}return false;};return rec(rec,0,rot(s.mask[fixed],shift[fixed]));}
struct Count{U64 n=0,e=0,f=0;};static void flush(Count&c){nodes+=c.n;extensions+=c.e;filterChecks+=c.f;c={};}
static void dfs(const State&s,const array<int,8>&k,vector<int>rem,int budget,Count&cnt,int level){if(stopFlag.load(memory_order_relaxed))return;if((++cnt.n&1023)==0){flush(cnt);if(timeout())return;}
 // At most four components yields <=29^3 candidate placements; earlier large
 // components often make this far smaller. Every packing is exact.
 if(s.ncomp<=4){pack(s,k);return;}if((int)rem.size()<=budget){residual++;return;}
 Filter f(s,k);int choice=-1;Domain best;size_t cap=numeric_limits<size_t>::max();int ntry=min((int)rem.size(),level<2?8:16);
 for(int i=0;i<ntry;){Domain d=domain(groups[rem[i]],f,cap);if(!d.cutoff&&d.entries.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(choice>i)choice--;continue;}if(choice<0||(!d.cutoff&&d.entries.size()<best.entries.size())){best=move(d);choice=i;cap=best.entries.size();}i++;}
 if(choice<0){residual++;return;}int gid=rem[choice];rem.erase(rem.begin()+choice);auto&g=groups[gid];cnt.f+=best.entries.size();for(auto[i,j]:best.entries){if(stopFlag.load(memory_order_relaxed))return;cnt.e++;State n=s;if(n.extend(g.opts[i],j,k))dfs(n,k,rem,budget,cnt,level+1);}if(budget>0)dfs(s,k,rem,budget-1,cnt,level+1);
}
int main(int argc,char**argv){if(argc<5){cerr<<"usage: solver domain_input keyword_file seconds threads [OOV budget] [shard] [shards]\n";return 2;}ifstream in(argv[1]);int n;in>>n;groups.resize(n);for(int i=0;i<n;i++){int m;in>>groups[i].cipher>>m;for(int a=0;a<m;a++){Option op;in>>op.word;int j=0;for(int b=0;b<(int)op.word.size();b++){int p=alphabet.find(op.word[b]),c=alphabet.find(groups[i].cipher[b]);if(!p)continue;op.e.push_back({u8(c),u8(p),u8(j)});j=(j+1)&7;}groups[i].opts.push_back(move(op));}sort(groups[i].opts.begin(),groups[i].opts.end(),[](auto&a,auto&b){return a.word<b.word;});build_masks(groups[i]);}
 order.resize(n);iota(order.begin(),order.end(),0);sort(order.begin(),order.end(),[](int a,int b){auto score=[](int g){return log2(double(max<size_t>(1,groups[g].opts.size())))/max<int>(1,groups[g].cipher.size()-count(groups[g].cipher.begin(),groups[g].cipher.end(),'0'));};return score(a)<score(b);});vector<string>keys;{ifstream in(argv[2]);string w;while(in>>w)if(w.size()==8)keys.push_back(w);}int secs=stoi(argv[3]),threads=stoi(argv[4]),shard=argc>6?stoi(argv[6]):0,shards=argc>7?stoi(argv[7]):1;maxOOV=argc>5?stoi(argv[5]):0;omp_set_num_threads(threads);startTime=chrono::steady_clock::now();endTime=startTime+chrono::seconds(secs);atomic<int>finished{0};
#pragma omp parallel for schedule(dynamic,1)
 for(int a=0;a<(int)keys.size();a++){if(a%shards!=shard||timeout())continue;array<int,8>k;for(int j=0;j<8;j++)k[j]=alphabet.find(keys[a][j]);bool prim=false;for(int j=0;j<4;j++)prim|=k[j]!=k[j+4];Count c;if(prim)dfs(State{},k,order,maxOOV,c,0);flush(c);int f=++finished;
#pragma omp critical
 {cout<<"KEYWORD "<<keys[a]<<" finished="<<f<<" nodes="<<nodes<<" extends="<<extensions<<" enum="<<enumKeys<<" t="<<elapsed()<<"\n"<<flush;}}
 cout<<"DONE found="<<found<<" timed="<<(chrono::steady_clock::now()>endTime)<<" nodes="<<nodes<<" extends="<<extensions<<" enum="<<enumKeys<<" residual="<<residual<<" finished="<<finished<<" total="<<keys.size()<<" t="<<elapsed()<<" maxOOV="<<maxOOV<<"\n"<<flush;
}
