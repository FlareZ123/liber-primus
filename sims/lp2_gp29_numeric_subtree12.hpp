// Agent12 exact numeric-key subtree receiver for the shared GP29 q8 action.
// Include after Graph and fixed::dictionary definitions.
struct NumericGraph12 {
 array<uint8_t,N> r{},off{},size{};array<uint32_t,N> masks{};int comps=0;
 NumericGraph12()=default;
 NumericGraph12(const Graph&g,const fixed::Key&k):r(g.r),size(g.size),comps(g.comps){
  for(int x=0;x<N;x++){int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];off[x]=v%N;masks[r[x]]|=1u<<off[x];}
 }
 bool merge(int c,int p,int j,const fixed::Key&k){
  int rc=r[c],rp=r[p],s=(off[p]+k[j]+N-off[c])%N;
  if(rc==rp)return s==0;
  if(size[rc]>size[rp]){swap(rc,rp);s=(N-s)%N;}
  auto m=fixed::rot(masks[rc],s);if(m&masks[rp])return false;
  for(int x=0;x<N;x++)if(r[x]==rc){r[x]=rp;off[x]=(off[x]+s)%N;}
  masks[rp]|=m;masks[rc]=0;size[rp]+=size[rc];size[rc]=0;comps--;return true;
 }
 string sig()const{
  array<int,N> first;first.fill(-1);string s;s.reserve(N*2);
  for(int x=0;x<N;x++){if(first[r[x]]<0)first[r[x]]=x;int a=first[r[x]];s+=char(a);s+=char((off[x]+N-off[a])%N);}
  return s;
 }
 Graph symbolicForPack()const{
  Graph g;g.r=r;g.size=size;g.comps=comps;for(int x=0;x<N;x++)g.off[x][0]=off[x];return g;
 }
};
struct Trie12{
 struct Node{array<int,N> ch;bool end=false;Node(){ch.fill(-1);}};
 vector<vector<Node>> byLen;
 Trie12():byLen(17){
  for(int n=0;n<int(byLen.size());n++){
   auto&t=byLen[n];t.emplace_back();
   for(const auto&w:fixed::by[n]){int z=0;for(char c:w){int x=fixed::val(c),next=t[z].ch[x];if(next<0){next=t.size();t[z].ch[x]=next;t.emplace_back();}z=next;}t[z].end=true;}
  }
 }
 template<class F,class Stop> bool visit(const string&c,const NumericGraph12&g,const fixed::Key&k,F&&accept,Stop&&stop,uint64_t&nodes)const{
  const auto&t=byLen.at(c.size());array<int,16> glyph{};for(size_t i=0;i<c.size();i++)glyph[i]=fixed::val(c[i]);
  auto rec=[&](auto&&self,int z,int i,int j,const NumericGraph12&a)->bool{
   if((++nodes&1023)==0&&stop())return true;
   if(i==int(c.size()))return t[z].end&&accept(a);
   const auto&ch=t[z].ch;int x=glyph[i],rc=a.r[x],want=(a.off[x]+N-k[j])%N;
   if(x==0&&ch[0]>=0&&self(self,ch[0],i+1,j,a))return true;
   if(a.masks[rc]&(1u<<want)){
    for(int p=1;p<N;p++)if(a.r[p]==rc&&a.off[p]==want)return ch[p]>=0&&self(self,ch[p],i+1,(j+1)%Q,a);
    return false;
   }
   for(int p=1;p<N;p++)if(ch[p]>=0&&a.r[p]!=rc){
    NumericGraph12 b=a;if(b.merge(x,p,j,k)&&self(self,ch[p],i+1,(j+1)%Q,b))return true;
   }
   return false;
  };
  for(int j=0;j<Q;j++)if(rec(rec,0,0,j,g))return true;return false;
 }
};
// Every component's pair differences are forbidden affine hyperplanes.
// Normalize on deepest coordinate; group equal prefix slopes into bitmasks.
// A capped enumeration returns false on the first additional key, and is
// NEVER used to reject a branch unless complete.
struct KeySlices12{
 static constexpr uint32_t ALL=(1u<<N)-1;
 struct Bucket{Vec a{};uint32_t mask=0;};
 array<int,Q> order{};
 vector<vector<Bucket>> groups;
 bool impossible=false;
 KeySlices12(const Graph&g){
  int d=g.k.d;array<Vec,N>p{};vector<Vec>cons;
  for(int x=0;x<N;x++)p[x]=g.k.project(g.off[x]);
  for(int x=0;x<N;x++)for(int y=0;y<x;y++)if(g.r[x]==g.r[y]){
   Vec v=minusv(p[x],p[y]);bool variable=false;for(int i=0;i<d;i++)variable|=v[i]!=0;
   if(!variable){if(!v[L]){impossible=true;return;}}else cons.push_back(v);
  }
  iota(order.begin(),order.end(),0);auto perm=order;uint64_t best=UINT64_MAX;
  do{
   vector<map<Code,Bucket>> tmp(d);
   for(const auto&v:cons){
    int z=d-1;while(z>=0&&!v[perm[z]])z--;int inv=aff::inv[v[perm[z]]];
    Bucket b;Code id=0;for(int i=0;i<z;i++){b.a[i]=(N-aff::mul[v[perm[i]]][inv])%N;id=id*N+b.a[i];}
    int c=(N-aff::mul[v[L]][inv])%N;auto[it,inserted]=tmp[z].emplace(id,b);it->second.mask|=1u<<c;
   }
   uint64_t score=0,w=1;for(int i=0;i<d;i++){score+=tmp[i].size()*w;w*=N;}
   if(score<best){best=score;order=perm;groups.assign(d,{});for(int i=0;i<d;i++)for(auto&[id,b]:tmp[i])groups[i].push_back(b);}
  }while(next_permutation(perm.begin(),perm.begin()+d));
 }
 template<class Stop> bool enumerate(const Graph&g,size_t cap,vector<fixed::Key>&out,Stop&&stop)const{
  if(impossible)return true;
  Vec params{},assigned{};int d=g.k.d;
  auto rec=[&](auto&&self,int z)->bool{
   if(stop())return false;
   if(z==d){auto k=g.k.evaluate(params);bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return true;if(out.size()>=cap)return false;out.push_back(k);return true;}
   uint32_t forbidden=0;
   for(const auto&b:groups[z]){int t=0;for(int i=0;i<z;i++)t+=b.a[i]*assigned[i];forbidden|=fixed::rot(b.mask,t%N);if(forbidden==ALL)return true;}
   uint32_t mask=ALL&~forbidden;while(mask){int v=__builtin_ctz(mask);mask&=mask-1;assigned[z]=v;params[order[z]]=v;if(!self(self,z+1))return false;}return true;
  };return rec(rec,0);
 }
};
