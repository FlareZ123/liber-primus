#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_map>
#include <vector>
#include <omp.h>
using namespace std;
constexpr uint32_t FULL=(1u<<29)-1;
using Dom=array<uint32_t,29>;
struct Entry{vector<vector<uint8_t>> rows;array<uint32_t,14> unary{};};
static uint64_t signature(const uint8_t *w,int n){uint8_t map[29];fill_n(map,29,255);int k=0;uint64_t s=n;for(int i=0;i<n;++i){int v=w[i];if(map[v]==255)map[v]=k++;s=(s<<4)|map[v];}return s;}
static int dec(char c){return c<='9'?c-'0':c-'a'+10;}
struct Lex{unordered_map<uint64_t,Entry> p;size_t n=0;Lex(const string& file){ifstream f(file);string w;while(f>>w){if(w.size()>14)continue;vector<uint8_t>a;for(char c:w)a.push_back(dec(c));auto &e=p[signature(a.data(),a.size())];for(size_t i=0;i<a.size();++i)e.unary[i]|=1u<<a[i];e.rows.push_back(move(a));n++;}}};
struct Word{int start,n;};struct Constraint{const uint8_t *w;const Entry*e;int n;};
struct Tape{
 vector<uint8_t> c;vector<Word> words;vector<int> first;uint32_t active=0;int n;bool hold;
 Tape(vector<string> ws,bool h):hold(h){for(auto&w:ws){assert(w.size()<=14);words.push_back({int(c.size()),int(w.size())});for(char v:w)c.push_back(dec(v));}n=c.size();for(int i=0;i<n;++i){int v=c[i];if(hold&&!v)continue;uint32_t b=1u<<v;if(!(active&b)){active|=b;first.push_back(i);}}sort(words.begin(),words.end(),[](auto a,auto b){if(a.n!=b.n)return a.n>b.n;return a.start<b.start;});}
 int inverse(uint32_t mask,uint8_t *out)const{int firstPos=first[0],a=c[firstPos],b=a,burn=firstPos+1;bool q0=mask&(1u<<a);for(int p:first)if(bool(mask&(1u<<c[p]))!=q0){burn=p+1;b=c[p];a=c[firstPos];for(int j=p-1;j>=firstPos;--j)if(!hold||c[j]){a=c[j];break;}break;}if(q0)swap(a,b);int piv[2]={a,b};uint8_t token[29];iota(token,token+29,0);for(int i=burn;i<n;++i){int v=c[i];if(hold&&!v){out[i]=0;continue;}int q=(mask>>v)&1;out[i]=token[v];swap(token[v],token[piv[q]]);piv[q]=v;}return burn;}
};
static bool propagate(Dom&dom,const Constraint *cs,int k){bool changed=true;while(changed){changed=false;uint32_t fixed=0;for(uint32_t d:dom)if(__builtin_popcount(d)==1){if(fixed&d)return false;fixed|=d;}for(auto&d:dom)if(__builtin_popcount(d)>1){uint32_t v=d&~fixed;if(!v)return false;changed|=v!=d;d=v;}for(int j=0;j<k;++j){auto [w,e,n]=cs[j];array<uint32_t,14>s{};bool any=false;for(auto&row:e->rows){bool ok=true;for(int i=0;i<n;++i)if(!(dom[w[i]]&(1u<<row[i]))){ok=false;break;}if(ok){any=true;for(int i=0;i<n;++i)s[i]|=1u<<row[i];}}if(!any)return false;for(int i=0;i<n;++i){auto&d=dom[w[i]];uint32_t v=d&s[i];if(!v)return false;changed|=v!=d;d=v;}}}return true;}
static bool matching(const Dom& d,array<int,29>&m){m.fill(-1);auto aug=[&](auto&&self,int i,uint32_t&seen)->bool{for(uint32_t k=d[i]&~seen;k;k&=k-1){int v=__builtin_ctz(k);uint32_t b=1u<<v;if(seen&b)continue;seen|=b;if(m[v]<0||self(self,m[v],seen)){m[v]=i;return true;}}return false;};for(int i=0;i<29;++i){uint32_t seen=0;if(!aug(aug,i,seen))return false;}return true;}
static bool dfs(Dom d,const Constraint *cs,int k,uint32_t used,array<int,29>&key,uint64_t&nodes){++nodes;if(!propagate(d,cs,k))return false;array<int,29> m;if(!matching(d,m))return false;int i=-1;for(uint32_t v=used;v;v&=v-1){int j=__builtin_ctz(v);if(__builtin_popcount(d[j])>1&&(i<0||__builtin_popcount(d[j])<__builtin_popcount(d[i])))i=j;}if(i<0){for(int j=0;j<29;++j)key[m[j]]=j;return true;}for(uint32_t v=d[i];v;v&=v-1){auto c=d;c[i]=v&-v;if(dfs(c,cs,k,used,key,nodes))return true;}return false;}
struct Found{uint32_t mask;int burn;array<int,29> key;};
int main(int argc,char**argv){if(argc<3)return 1;Lex lex(argv[1]);ifstream f(argv[2]);vector<string> ws;string w;while(f>>w)ws.push_back(w);bool hold=argc>3&&atoi(argv[3]);Tape t(ws,hold);vector<int> bits;for(uint32_t v=t.active&~(t.active&-t.active);v;v&=v-1)bits.push_back(__builtin_ctz(v));uint32_t total=1u<<bits.size(),limit=argc>4?min(total,uint32_t(strtoul(argv[4],nullptr,10))):total;vector<uint32_t>lo(1u<<min(size_t(14),bits.size())),hi(1u<<(bits.size()-min(size_t(14),bits.size())));for(uint32_t x=1;x<lo.size();++x)lo[x]=lo[x&(x-1)]|(1u<<bits[__builtin_ctz(x)]);for(uint32_t x=1;x<hi.size();++x)hi[x]=hi[x&(x-1)]|(1u<<bits[__builtin_ctz(x)+min(size_t(14),bits.size())]);uint64_t unary=0,prop=0,match=0,nodes=0,solved=0;vector<Found> found;const auto start=chrono::steady_clock::now();cerr<<"lex "<<lex.n<<" patterns "<<lex.p.size()<<" n "<<t.n<<" masks "<<total<<"\n";
 #pragma omp parallel
 {uint64_t u=0,p=0,m=0,nd=0,s=0;vector<Found> local;vector<uint8_t> out(t.n);vector<Constraint> cs(ws.size());
 #pragma omp for schedule(static)
 for(uint32_t x=0;x<limit;++x){uint32_t mask=lo[x&(lo.size()-1)]|hi[x>>min(size_t(14),bits.size())];int burn=t.inverse(mask,out.data());Dom d;d.fill(FULL);if(hold)d[0]=1;int k=0;bool ok=true;uint32_t used=0;for(auto w:t.words){if(w.start<burn)continue;const uint8_t* v=out.data()+w.start;auto it=lex.p.find(signature(v,w.n));if(it==lex.p.end()){ok=false;break;}auto&e=it->second;cs[k++]={v,&e,w.n};for(int j=0;j<w.n;++j){uint32_t b=d[v[j]]&e.unary[j];if(!b){ok=false;break;}d[v[j]]=b;used|=1u<<v[j];}if(!ok)break;}if(!ok)continue;u++;if(!propagate(d,cs.data(),k))continue;p++;array<int,29> key;if(!matching(d,key))continue;m++;if(dfs(d,cs.data(),k,used,key,nd)){s++;if(local.size()<100000)local.push_back({mask,burn,key});}}
 #pragma omp critical
 {unary+=u;prop+=p;match+=m;nodes+=nd;solved+=s;found.insert(found.end(),local.begin(),local.end());}}
 cout<<"{\"hold\":"<<hold<<",\"tested\":"<<limit<<",\"total\":"<<total<<",\"unary\":"<<unary<<",\"prop\":"<<prop<<",\"match\":"<<match<<",\"nodes\":"<<nodes<<",\"solved\":"<<solved<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<",\"found\":[";for(size_t i=0;i<found.size();++i){auto&f=found[i];cout<<(i?",":"")<<"["<<f.mask<<","<<f.burn<<",[";for(int j=0;j<29;++j)cout<<(j?",":"")<<f.key[j];cout<<"]]";}cout<<"]}\n";
}
