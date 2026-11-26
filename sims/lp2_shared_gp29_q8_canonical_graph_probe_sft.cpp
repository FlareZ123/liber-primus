// Exact graph signatures in a deterministic actual-key coordinate basis.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_pair_cover_sft.cpp"

string canonicalSig(const Graph&g){
 array<Vec,Q+N> a{};array<int,N>root;root.fill(-1);
 string s;s+=char(g.k.d);
 for(int j=0;j<Q;j++)a[j]=g.k.a[j];
 for(int x=0;x<N;x++){if(root[g.r[x]]<0)root[g.r[x]]=x;s+=char(root[g.r[x]]);a[Q+x]=g.k.project(minusv(g.off[x],g.off[root[g.r[x]]]));}
 for(int j=0;j<g.k.d;j++){
  int row=0,p=-1;for(;row<Q;row++){for(int k=j;k<g.k.d;k++)if(a[row][k]){p=k;break;}if(p>=0)break;}
  fixed::require(p>=0,"rank deficient key parameter map");
  s+=char(row);
  for(auto&v:a)swap(v[j],v[p]);
  Vec old=a[row];int inv=aff::inv[old[j]];
  for(auto&v:a){int f=aff::mul[v[j]][inv];if(!f)continue;
   for(int k=0;k<g.k.d;k++)if(k!=j)v[k]=aff::sub[v[k]][aff::mul[f][old[k]]];
   v[L]=aff::sub[v[L]][aff::mul[f][old[L]]];v[j]=f;
  }
 }
 for(auto&v:a)s.append((char*)v.data(),Q);
 return s;
}
int main(){try{
 aff::init();fixed::dictionary();mt19937 rng(272202);
 size_t rawVariants=0,canonicalVariants=0;
 for(int t=0;t<120;t++){
  array<int,N> pi{},inv{};iota(pi.begin(),pi.end(),0);shuffle(pi.begin()+1,pi.end(),rng);
  for(int x=0;x<N;x++)inv[pi[x]]=x;
  fixed::Key k{};k[0]=1;k[4]=2;for(int j=1;j<Q;j++)if(j!=4)k[j]=rng()%N;
  vector<GEdge> e;
  for(int i=0;i<12+t%29;i++){int p=1+rng()%(N-1),j=rng()%Q,c=inv[(pi[p]+k[j])%N];e.push_back({uint8_t(c),uint8_t(p),uint8_t(j)});}
  set<string> raw,can;
  for(int u=0;u<12;u++){shuffle(e.begin(),e.end(),rng);Graph g;
   for(auto&x:e)fixed::require(g.edge(x),"planted constraints inconsistent");
   fixed::require(g.valid(),"planted graph invalid");raw.insert(g.sig());can.insert(canonicalSig(g));
  }
  fixed::require(can.size()==1,"canonical signature changed under edge shuffle");
  rawVariants+=raw.size();canonicalVariants+=can.size();
 }
 cout<<"CANONICAL PLANTS 120x12 raw="<<rawVariants<<" canonical="<<canonicalVariants<<endl;
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 fixed::require(train.size()==48&&join(train).size()==223,"profile");
 GSearch search(train);fixed::require(search.seeds.size()==93,"seed count");set<string> cs;for(auto&g:search.seeds)cs.insert(canonicalSig(g));
 cout<<"CANONICAL CARRY raw=93 canonical="<<cs.size()<<endl;
 size_t totalRaw=0,totalCan=0,states=0;double elapsed=0;
 for(int sid:{0,1,5,9,12,18,23,31,44,60,75,92}){
  const auto&g=search.seeds[sid];GFilter f(g);if(f.saturated)continue;
  for(int q=0;q<3;q++){
   int id=search.order[q];GStats c;auto ids=search.domain(id,f,SIZE_MAX,c);set<string>raw,can;size_t valid=0;
   auto t=Clock::now();for(int opt:ids){Graph x;if(!extend(g,search.ds[id].opts[opt],x))continue;valid++;raw.insert(x.sig());can.insert(canonicalSig(x));}
   double ms=chrono::duration<double,milli>(Clock::now()-t).count();elapsed+=ms;
   cout<<"CANONICAL DOMAIN seed="<<sid<<" group="<<id<<" exact="<<valid<<" raw="<<raw.size()<<" canonical="<<can.size()<<" ms="<<ms<<endl;
   totalRaw+=raw.size();totalCan+=can.size();states++;
  }
 }
 cout<<"CANONICAL ORIGINAL domains="<<states<<" raw="<<totalRaw<<" canonical="<<totalCan<<" total_ms="<<elapsed<<endl;
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
