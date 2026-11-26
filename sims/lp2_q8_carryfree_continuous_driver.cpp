// Carry-free known-continuous-clock derivative of the exact affine graph solver.
using CFClock=vector<vector<int>>;
CFClock cfClock(const vector<string>&g,uint64_t mask,int start){CFClock out;int z=0,j=start;for(auto&w:g){vector<int>v;for(char x:w){if(x=='0'&&((mask>>z++)&1))v.push_back(-1);else{v.push_back(j);j=(j+1)%Q;}}out.push_back(move(v));}return out;}
void cfDictionary(){istringstream f(fixed::read("resources/control/english_wordfreq_textblob.txt"));string line;while(getline(f,line)){istringstream in(line);string w,n,extra;if(!(in>>w>>n)||in>>extra)continue;if(w.empty()||!all_of(w.begin(),w.end(),[](char c){return c>='a'&&c<='z';})||n.empty()||!all_of(n.begin(),n.end(),[](char c){return c>='0'&&c<='9';}))continue;fixed::addVariants(w);}fixed::require(fixed::dict.size()==38910,"base dictionary");for(auto&w:fixed::dict)fixed::by[w.size()].push_back(w);for(auto&v:fixed::by)sort(v.begin(),v.end());}
struct CFProp{array<vector<int>,48> dom;int forced=0,rounds=0;uint64_t before=0,after=0;bool impossible=false;};
CFProp cfProp(FastSearch&s,const Graph&g,int budget,const CFProp*parent=nullptr){
 CFProp a;GFilter f(g);if(f.saturated){a.impossible=true;return a;}
 for(int i=0;i<47;i++){if(parent){for(int j:parent->dom[i])if(f.allowed(s.ds[i].opts[j]))a.dom[i].push_back(j);}else{for(int j=0;j<int(s.ds[i].opts.size());j++)if(f.allowed(s.ds[i].opts[j]))a.dom[i].push_back(j);}a.before+=a.dom[i].size();}
 array<array<bool,Q>,Q>eq{},neq{};
 for(int j=0;j<Q;j++)for(int l=0;l<Q;l++){auto z=g.k.normalized(minusv(g.k.a[j],g.k.a[l]));eq[j][l]=z==0;neq[j][l]=z==IMP||f.forbidden.count(z);}
 constexpr int T=N*Q;array<uint64_t,T*N> blocked{};
 for(;;){a.forced=0;for(int i=0;i<47;i++)a.forced+=a.dom[i].empty();if(a.forced>budget){a.impossible=true;break;}a.rounds++;blocked.fill(0);
  for(int i=0;i<47;i++)if(!a.dom[i].empty()){array<uint32_t,T>support{};uint64_t bit=uint64_t(1)<<i;for(int id:a.dom[i]){auto&o=s.ds[i].opts[id];for(int e=0;e<o.n;e++){auto v=o.e[e];support[v.j*N+v.c]|=1u<<v.p;}}
   for(int j=0;j<Q;j++)for(int c=0;c<N;c++){uint32_t m=support[j*N+c];if(!m)continue;
    for(int l=0;l<Q;l++)if(eq[j][l])for(int p=1;p<N;p++)if(!(m&(1u<<p)))blocked[(l*N+c)*N+p]|=bit;
    if((m&(m-1))==0){int p=__builtin_ctz(m);for(int l=0;l<Q;l++){if(eq[j][l])for(int x=0;x<N;x++)if(x!=c)blocked[(l*N+x)*N+p]|=bit;if(neq[j][l])blocked[(l*N+c)*N+p]|=bit;}}
   }
  }
  uint64_t removed=0;
  for(int i=0;i<47;i++){auto&ids=a.dom[i];size_t old=ids.size();auto end=remove_if(ids.begin(),ids.end(),[&](int id){auto&o=s.ds[i].opts[id];uint64_t mask=0;for(int e=0;e<o.n;e++){auto v=o.e[e];mask|=blocked[(v.j*N+v.c)*N+v.p];}if(mask&(uint64_t(1)<<i))return true;return __builtin_popcountll(mask)>budget-a.forced;});ids.erase(end,ids.end());removed+=old-ids.size();}
  if(!removed)break;
 }
 for(auto&d:a.dom)a.after+=d.size();return a;
}
struct CFSeed{Graph g;uint64_t prior;int anchor;};
struct CFResult{bool found=false,timed=false;size_t total=0,complete=0;fixed::Perm pi{};fixed::Key key{};int oov=-1;};
CFResult cfSearch(const vector<string>&train,const CFClock&clock,int budget,int seconds,bool inventory=false){
 fixed::require(train.size()==47&&clock.size()==47,"47 complete training groups");
 // Dummy slot is not a constraint: prefixDict is empty and the generator
 // removes the final scheduled-prefix check. Original carry never enters fit.
 auto dummy=train;dummy.push_back("0000000000");auto dc=clock;dc.push_back(vector<int>(10,-1));
 FastSearch s(dummy,budget,dc);auto root=cfProp(s,s.base,budget);
 CFResult ans;cout<<"CF ROOT before="<<root.before<<" after="<<root.after<<" forced="<<root.forced<<" rounds="<<root.rounds<<" impossible="<<root.impossible<<endl;
 if(root.impossible)return ans;
 vector<int>ix;for(int i=0;i<47;i++)if(!root.dom[i].empty())ix.push_back(i);
 stable_sort(ix.begin(),ix.end(),[&](int a,int b){return train[a].size()>train[b].size();});
 int m=budget-root.forced+1;fixed::require(int(ix.size())>=m,"anchor count");ix.resize(m);
 vector<CFSeed>seeds;unordered_map<string,size_t>seen;
 for(int i:ix){size_t good=0;for(int id:root.dom[i]){Graph g;if(!extend(s.base,s.ds[i].opts[id],g))continue;good++;auto sig=g.sig();uint64_t prior=s.optionPrior[i][id];auto it=seen.find(sig);if(it==seen.end()){seen.emplace(move(sig),seeds.size());seeds.push_back({move(g),prior,i});}else seeds[it->second].prior=max(seeds[it->second].prior,prior);}cout<<"CF ANCHOR i="<<i<<" len="<<train[i].size()<<" legal="<<good<<endl;}
 stable_sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.prior!=b.prior?a.prior>b.prior:a.g.dimension()<b.g.dimension();});
 ans.total=seeds.size();cout<<"CF SEEDS count="<<ans.total<<endl;if(inventory)return ans;
 s.deadline=Clock::now()+chrono::seconds(seconds);atomic<size_t>next{0},done{0};atomic<uint64_t>propRejected{0},propAfter{0};
 unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
 for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{while(!s.stop()){size_t i=next.fetch_add(1);if(i>=seeds.size())break;auto&seed=seeds[i];auto a=cfProp(s,seed.g,budget,&root);propAfter+=a.after;
  if(a.impossible)propRejected++;else{DomainPointers ptr{};vector<int>rem;for(int j:s.order)if(!a.dom[j].empty()){ptr[j]=&a.dom[j];rem.push_back(j);}s.fastDfs(seed.g,rem,budget-a.forced,stats[t],ptr);}
  if(!s.found&&!s.timed){done++;lock_guard<mutex>l(s.checkpointMutex);cout<<"CF COMPLETE seed="<<i<<endl;}
 }});
 for(auto&t:pool)t.join();GStats sum;for(auto&c:stats){sum.nodes+=c.nodes;sum.joins+=c.joins;sum.perms+=c.perms;}
 ans.found=s.found;ans.timed=s.timed;ans.complete=done;ans.pi=s.answer;ans.key=s.answerKey;ans.oov=s.answerOov;
 cout<<"CF RESULT found="<<ans.found<<" timed="<<ans.timed<<" completed="<<ans.complete<<"/"<<ans.total<<" nodes="<<sum.nodes<<" joins="<<sum.joins<<" permutations="<<sum.perms<<" propRejected="<<propRejected<<" propAfter="<<propAfter<<" OOV="<<ans.oov<<endl;return ans;
}
string cfEncode(const string&w,const fixed::Perm&pi,const fixed::Key&k,int&phase,uint64_t&mask,int&z){fixed::Perm ip;for(int i=0;i<N;i++)ip[pi[i]]=i;string c;for(char a:w){int p=fixed::val(a);if(!p){c+='0';mask|=uint64_t(1)<<z++;}else{int x=ip[(pi[p]+k[phase])%N];c+=fixed::SYM[x];if(!x)z++;phase=(phase+1)%Q;}}return c;}
bool cfControl(int id,int seconds,const vector<string>&shape){
 mt19937 rng(id?0x92bc:0x71aa);vector<string>truth,held;string carry="d4ifi41ogr9";
 if(!id){
  for(auto&w:shape){auto&v=fixed::by[w.size()];vector<double>weight;for(auto&x:v)weight.push_back(pow(double(prior7(x,false)+1),0.4));discrete_distribution<size_t>d(weight.begin(),weight.end());truth.push_back(v[d(rng)]);}
  vector<int>ix(47);iota(ix.begin(),ix.end(),0);stable_sort(ix.begin(),ix.end(),[&](int a,int b){return shape[a].size()>shape[b].size();});
  for(int i:{ix[0],ix[20]}){string w;do{w.clear();for(size_t j=0;j<shape[i].size();j++)w+=fixed::SYM[1+rng()%28];}while(fixed::dict.count(w));truth[i]=w;}
  for(int n=0;n<16;n++){auto&v=fixed::by[2+n%7];held.push_back(v[rng()%v.size()]);}
 }else{
  auto s=fixed::read("sims/lp2_red8_carryfree_continuous_sft.cpp");auto a=s.find("NATIVE=\"");fixed::require(a!=string::npos,"native constant");a+=8;auto b=s.find('"',a);istringstream in(s.substr(a,b-a));vector<string>w;string x;while(in>>x)w.push_back(x);fixed::require(w.size()>=133,"native size");truth.assign(w.begin()+69,w.begin()+116);carry=w[116];held.assign(w.begin()+117,w.begin()+133);
 }
 fixed::require(truth.size()==47&&held.size()==16,"control shape");int oov=count_if(truth.begin(),truth.end(),[](auto&w){return !fixed::dict.count(w);});fixed::require(oov>0&&oov<=3,"control OOV");
 fixed::Perm pi{};iota(pi.begin(),pi.end(),0);shuffle(pi.begin()+1,pi.end(),rng);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;if(id)k[3]=0;
 vector<string>ct;int phase=0,z=0;uint64_t mask=0;for(auto&w:truth)ct.push_back(cfEncode(w,pi,k,phase,mask,z));fixed::require(z<63,"control mask");
 cout<<"CF CONTROL id="<<id<<" truthOOV="<<oov<<" runes="<<join(ct).size()<<" visibleF="<<z<<" mask="<<mask<<endl;
 auto ans=cfSearch(ct,cfClock(ct,mask,0),3,seconds);if(!ans.found){cout<<"CF CONTROL PASS=0 id="<<id<<endl;return false;}
 auto maps=fixed::maps(ans.pi,ans.key),actual=fixed::maps(pi,k);bool exact=maps==actual;int hit=0;auto clock=cfClock(ct,mask,0);for(int i=0;i<47;i++){string w;for(size_t j=0;j<ct[i].size();j++){int p=clock[i][j]<0?0:maps[clock[i][j]][fixed::val(ct[i][j])];w+=fixed::SYM[p];}hit+=w==truth[i];}
 vector<string>tail{carry};tail.insert(tail.end(),held.begin(),held.end());int p2=phase,z2=0,z3=0;uint64_t m2=0,m3=0;int replay=0;for(auto&w:tail){auto c1=cfEncode(w,pi,k,phase,m2,z2);auto c2=cfEncode(w,ans.pi,ans.key,p2,m3,z3);replay+=c1==c2;}
 bool pass=exact&&hit==47&&replay==17;cout<<"CF CONTROL PASS="<<pass<<" id="<<id<<" exact="<<exact<<" train="<<hit<<"/47 held_replay="<<replay<<"/17"<<endl;return pass;
}
int main(int argc,char**argv){try{fixed::require(argc>=2,"control|original|inventory");aff::init();cfDictionary();frequencyOrderEnabled=true;exactMrvEnabled=true;buildPrior7();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto g=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));fixed::require(g.size()==48,"source shape");g.pop_back();fixed::require(join(g).size()==213,"complete black groups");string mode=argv[1];int id=argc>2?stoi(argv[2]):0,seconds=argc>3?stoi(argv[3]):180;if(mode=="control")return cfControl(id,seconds,g)?0:2;fixed::require(mode=="original"||mode=="inventory","mode");fixed::require(id>=0&&id<64,"schedule id");auto c=cfClock(g,id/8,id%8);auto ans=cfSearch(g,c,3,seconds,mode=="inventory");if(ans.found){auto maps=fixed::maps(ans.pi,ans.key);cout<<"CF CANDIDATE scenario="<<id<<" pi";for(int p:ans.pi)cout<<" "<<p;cout<<" key";for(int k:ans.key)cout<<" "<<k;cout<<endl;for(int i=0;i<47;i++){string w;for(size_t j=0;j<g[i].size();j++)w+=fixed::SYM[c[i][j]<0?0:maps[c[i][j]][fixed::val(g[i][j])]];cout<<"TRAIN "<<i<<" "<<w<<endl;}}return ans.timed?3:0;}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 1;}}
