#include <array>
#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <functional>
#include <unordered_map>
#include <set>
using namespace std;
using K8=array<int,8>;using K5=array<int,5>;struct Rune{int c;bool single;};
int dec(char c){return c<='9'?c-'0':c-'a'+10;}char enc(int x){return x<10?'0'+x:'a'+x-10;}int mod(int x){return (x+29)%29;}
vector<vector<int>> words(string s){istringstream in(s);string w;vector<vector<int>> a;while(in>>w){vector<int>v;for(char c:w)v.push_back(dec(c));a.push_back(v);}return a;}
vector<Rune> flatten(const vector<vector<int>>& w){vector<Rune> a;for(auto&v:w)for(int x:v)a.push_back({x,v.size()==1});return a;}
int reach(const vector<Rune>& c,const K8& k,const K5& l,bool ai,int anchor,int phase,const vector<int>* pword=nullptr){
 uint64_t s=(1ULL<<40)-1;int n=0;
 for(auto [x,single]:c){
  if(n==anchor)s&=1ULL<<phase;uint64_t t=0;
  int forced=pword&&n>=anchor&&n<anchor+(int)pword->size()?(*pword)[n-anchor]:-1;
  while(s){
   int j=__builtin_ctzll(s);s&=s-1;int a=j/5,b=j%5;
   auto inner=[&](int q,int bb){if(q==0&&forced<=0&&!(ai&&single))t|=1ULL<<(5*a+bb);int p=mod(q-k[a]);if(p&&(forced<0||forced==p)&&(!(ai&&single)||p==10||p==24))t|=1ULL<<(5*((a+1)%8)+bb);};
   if(x==0)inner(0,b);int q=mod(x-l[b]);if(q)inner(q,(b+1)%5);
  }
  s=t;if(!s)return ++n;++n;
 }
 return -1;
}
// The actual anchor path supplies both boundary phases. Test both halves from that path.
bool prefix(const vector<Rune>& c,const K8& k,const K5& l,int start,int b0){
 uint64_t s=1ULL<<b0;
 for(int i=start-1;i>=0;i--){int x=c[i].c;uint64_t t=0;
  while(s){int j=__builtin_ctzll(s);s&=s-1;int a=j/5,b=j%5,aa=(a+7)%8,bb=(b+4)%5;
   if(x==0){t|=1ULL<<j;if(k[aa])t|=1ULL<<(5*aa+b);}
   int q=mod(x-l[bb]);if(q&&q!=k[aa])t|=1ULL<<(5*aa+bb);
  }s=t;if(!s)return false;
 }return true;
}
bool suffix(const vector<Rune>& c,const K8& k,const K5& l,int start,int a0,int b0){
 uint64_t s=1ULL<<(5*a0+b0);
 for(int i=start;i<(int)c.size();i++){int x=c[i].c;uint64_t t=0;
  while(s){int j=__builtin_ctzll(s);s&=s-1;int a=j/5,b=j%5,aa=(a+1)%8,bb=(b+1)%5;
   if(x==0){t|=1ULL<<j;if(k[a])t|=1ULL<<(5*aa+b);}
   int q=mod(x-l[b]);if(q&&q!=k[a])t|=1ULL<<(5*aa+bb);
  }s=t;if(!s)return false;
 }return true;
}
struct Group{vector<int> pos;unordered_map<int,vector<const vector<int>*>> table;};
int signature(const vector<int>& q,const vector<int>& pos){int z=0;for(int j=8;j<(int)pos.size();j++)z=z*29+mod(q[pos[j]]-q[pos[j%8]]);return z;}
struct Stats{long long paths=0,candidates=0,distinct=0,anchor=0,native=0;};
int main(int argc,char**argv){
 assert(argc==5);
 ifstream file(argv[1]);string s((istreambuf_iterator<char>(file)),{});auto w=words(s);auto c=flatten(w);
 ifstream df(argv[3]);string d((istreambuf_iterator<char>(df)),{});auto dict=words(d);int len=atoi(argv[4]);assert(len>=8&&len<=14);
 unordered_map<int,Group> groups;int wd=0,low=0;
 for(auto &p:dict)if((int)p.size()==len){
  int mask=0;vector<int>pos;for(int j=0;j<len;j++)if(!p[j])mask|=1<<j;else pos.push_back(j);
  if(pos.size()<8){low++;if(pos.size()<7)continue;}auto &g=groups[mask];g.pos=pos;g.table[signature(p,pos)].push_back(&p);wd++;
 }
 cerr<<"length="<<len<<" words="<<wd<<" masks="<<groups.size()<<" low="<<low<<'\n';
 ifstream f(argv[2]);K5 l;Stats st;int total=0;set<string> full;vector<int> q(len);
 while(f>>l[0]>>l[1]>>l[2]>>l[3]>>l[4]){
  ++total;vector<int> back(c.size()+1),front(c.size()+1);back.back()=31;front[0]=31;
  for(int i=(int)c.size()-1;i>=0;i--){int x=c[i].c;for(int b=0;b<5;b++)if((x==0&&(back[i+1]&(1<<b)))||(mod(x-l[b])&&(back[i+1]&(1<<((b+1)%5)))))back[i]|=1<<b;}
  for(int i=0;i<(int)c.size();i++){int x=c[i].c;for(int b=0;b<5;b++)if(front[i]&(1<<b)){if(x==0)front[i+1]|=1<<b;if(mod(x-l[b]))front[i+1]|=1<<((b+1)%5);}}
  for(int start=0;start+len<=(int)c.size();start++){
   int mask=front[start]&back[start];set<pair<int,K8>> tested;
   for(int initial=0;initial<5;initial++)if(mask&(1<<initial)){
    function<void(int,int,int)> dfs=[&](int i,int b,int zeros){
     if(i==len){
      st.paths++;
      for(int sub=zeros;;sub=(sub-1)&zeros){
       auto git=groups.find(sub);
       if(git!=groups.end()){
        auto&g=git->second;auto it=g.table.find(signature(q,g.pos));
        if(it!=g.table.end())for(auto p:it->second){
         st.candidates++;K8 k{};for(int j=0;j<min(8,(int)g.pos.size());j++)k[j]=mod(q[g.pos[j]]-(*p)[g.pos[j]]);
         for(int missing=0;missing<(g.pos.size()==7?29:1);missing++){if(g.pos.size()==7)k[7]=missing;
         if(tested.insert({initial,k}).second)st.distinct++;
         if(prefix(c,k,l,start,initial)&&suffix(c,k,l,start+len,g.pos.size()%8,b)){
          assert(reach(c,k,l,false,start,initial,p)<0);
          st.anchor++;string key;for(int x:k)key+=enc(x);string canon=key;
          for(int j=1;j<8;j++)canon=min(canon,key.substr(j)+key.substr(0,j));for(int x:l)canon+=enc(x);full.insert(canon);
          bool native=reach(c,k,l,true,start,initial,p)<0;if(native)st.native++;
          cout<<"SURVIVOR "<<start<<' '<<initial<<' ';for(int x:k)cout<<enc(x);cout<<' ';for(int x:l)cout<<enc(x);cout<<' ';for(int x:*p)cout<<enc(x);cout<<' '<<native<<'\n';
         }
         }
        }
       }
       if(!sub)break;
      }
      return;
     }
     int x=c[start+i].c;
     if(x==0&&(back[start+i+1]&(1<<b))){q[i]=0;dfs(i+1,b,zeros|(1<<i));}
     int y=mod(x-l[b]),bb=(b+1)%5;if(y&&(back[start+i+1]&(1<<bb))){q[i]=y;dfs(i+1,bb,zeros);}
    };dfs(0,initial,0);
   }
  }
 }
 cerr<<"TOTAL "<<total<<" paths="<<st.paths<<" candidates="<<st.candidates<<" distinct="<<st.distinct<<" anchor="<<st.anchor<<" native="<<st.native<<" pairs="<<full.size()<<'\n';
}
