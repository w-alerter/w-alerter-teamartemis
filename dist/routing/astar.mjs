/* 16-neighbour A* on a conservative, source-derived obstacle grid. Distance objective only. */
export const ENGINE_VERSION='hydra-geometric-astar-1.0.0';
export const MOVES=Object.freeze([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].map(Object.freeze));
const rad=Math.PI/180,R=3440.065;
export function distanceNM(a,b){const p=a[1]*rad,q=b[1]*rad,d=(b[1]-a[1])*rad,l=(b[0]-a[0])*rad,v=Math.sin(d/2)**2+Math.cos(p)*Math.cos(q)*Math.sin(l/2)**2;return 2*R*Math.atan2(Math.sqrt(Math.max(0,Math.min(1,v))),Math.sqrt(Math.max(0,1-v)));}
const wrap=x=>((x+180)%360+360)%360-180;
export class ObstacleGrid{
  constructor(manifest,bytes){const g=manifest?.grid;if(manifest?.format!=='w-alerter-obstacle-grid'||manifest.version!==1||!g||g.crs!=='EPSG:4326'||g.bitOrder!=='little'||g.rowOrder!=='south-to-north'||g.node!=='cell centre'||!Number.isInteger(g.rows)||!Number.isInteger(g.columns)||g.rows<1||g.columns<1||g.rows*g.columns>10000000||!Number.isFinite(g.stepDegrees)||g.stepDegrees<=0||Math.abs(g.columns*g.stepDegrees-360)>1e-9||!(bytes instanceof Uint8Array)||bytes.length!==Math.ceil(g.rows*g.columns/8))throw Error('topology_invalid');this.manifest=manifest;this.bytes=bytes;Object.assign(this,{west:g.west,south:g.south,step:g.stepDegrees,cols:g.columns,rows:g.rows});}
  blocked(x,y){if(y<0||y>=this.rows)return true;const col=((x%this.cols)+this.cols)%this.cols,index=y*this.cols+col;return !!(this.bytes[index>>3]&(1<<(index&7)));}
  xy([lon,lat]){return [((lon-this.west)/this.step%this.cols+this.cols)%this.cols,(lat-this.south)/this.step];}
  coordinate(x,y){return [wrap(this.west+(x+.5)*this.step),this.south+(y+.5)*this.step];}
  segmentClear(a,b){let [ax,ay]=this.xy(a),[bx,by]=this.xy(b);if(bx-ax>this.cols/2)bx-=this.cols;if(bx-ax< -this.cols/2)bx+=this.cols;return this.xyClear(ax,ay,bx,by);}
  xyClear(ax,ay,bx,by){
    if(![ax,ay,bx,by].every(Number.isFinite))return false;let x=Math.floor(ax),y=Math.floor(ay);const dx=bx-ax,dy=by-ay,sx=Math.sign(dx),sy=Math.sign(dy),eps=1e-10,horizontal=dy===0&&Math.abs(ay-Math.round(ay))<eps,vertical=dx===0&&Math.abs(ax-Math.round(ax))<eps;
    const free=(xx,yy)=>!this.blocked(xx,yy)&&(!horizontal||!this.blocked(xx,yy-1))&&(!vertical||!this.blocked(xx-1,yy));
    if(!free(x,y))return false;if(Math.abs(ax-Math.round(ax))<eps&&!free(x-1,y))return false;if(Math.abs(ay-Math.round(ay))<eps&&!free(x,y-1))return false;if(Math.abs(ax-Math.round(ax))<eps&&Math.abs(ay-Math.round(ay))<eps&&!free(x-1,y-1))return false;
    let tx=sx?((sx>0?x+1:x)-ax)/dx:Infinity,ty=sy?((sy>0?y+1:y)-ay)/dy:Infinity;const dtx=sx?1/Math.abs(dx):Infinity,dty=sy?1/Math.abs(dy):Infinity;
    for(let steps=0;steps<this.cols+this.rows+8;steps++){
      if(Math.min(tx,ty)>1+eps)return true;
      if(Math.abs(tx-ty)<eps){if(!free(x+sx,y)||!free(x,y+sy))return false;x+=sx;y+=sy;tx+=dtx;ty+=dty;}else if(tx<ty){x+=sx;tx+=dtx;}else{y+=sy;ty+=dty;}
      if(!free(x,y))return false;
    }return false;
  }
}
class Heap{
 constructor(){this.a=[];}
 push(v){const a=this.a;let i=a.length;a.push(v);while(i){const p=(i-1)>>1;if(a[p].f<=v.f)break;a[i]=a[p];i=p;}a[i]=v;}
 pop(){const a=this.a,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].f<a[c].f)c++;if(a[c].f>=last.f)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
}
function search(grid,start,end,margin,{maxExpansions=300000,maxCells=1500000,deadline=Infinity,dijkstra=false}={}){
 const [sx0,sy0]=grid.xy(start),[gx0,gy0]=grid.xy(end),sx=Math.floor(sx0),sy=Math.floor(sy0);let gx=Math.floor(gx0),gy=Math.floor(gy0);if(gx-sx>grid.cols/2)gx-=grid.cols;if(gx-sx< -grid.cols/2)gx+=grid.cols;
 const pad=Math.ceil(margin/grid.step),left=Math.min(sx,gx)-pad,right=Math.max(sx,gx)+pad,bottom=Math.max(0,Math.min(sy,gy)-pad),top=Math.min(grid.rows-1,Math.max(sy,gy)+pad),width=right-left+1,height=top-bottom+1,size=width*height;
 if(width>grid.cols||size>maxCells)return {status:'search_limit'};
 const index=(x,y)=>(y-bottom)*width+x-left,toXY=n=>[left+n%width,bottom+Math.floor(n/width)],gScore=new Float64Array(size).fill(Infinity),parent=new Int32Array(size).fill(-1),closed=new Uint8Array(size),open=new Heap(),startId=index(sx,sy),goalId=index(gx,gy),target=grid.coordinate(gx,gy);gScore[startId]=0;open.push({id:startId,g:0,f:dijkstra?0:distanceNM(grid.coordinate(sx,sy),target)});let expanded=0;
 while(open.a.length){const current=open.pop(),id=current.id;if(closed[id]||current.g!==gScore[id])continue;closed[id]=1;expanded++;if(expanded>maxExpansions||expanded%2048===0&&performance.now()>deadline)return {status:'search_limit',expanded};if(id===goalId){const cells=[];let n=id;while(n!==-1){const [x,y]=toXY(n);cells.push(grid.coordinate(x,y));n=parent[n];}cells.reverse();return {status:'found',coordinates:[start,...cells,end],gridDistanceNM:gScore[id],expanded,searchBounds:{left,right,bottom,top}};}
  const [x,y]=toXY(id),origin=grid.coordinate(x,y);
  for(const [dx,dy]of MOVES){const nx=x+dx,ny=y+dy;if(nx<left||nx>right||ny<bottom||ny>top||grid.blocked(nx,ny))continue;const next=index(nx,ny);if(closed[next]||!grid.xyClear(x+.5,y+.5,nx+.5,ny+.5))continue;const point=grid.coordinate(nx,ny),score=gScore[id]+distanceNM(origin,point);if(score<gScore[next]){gScore[next]=score;parent[next]=id;open.push({id:next,g:score,f:score+(dijkstra?0:distanceNM(point,target))});}}
 }return {status:'no_path',expanded};
}
function geodesic(a,b){const angle=distanceNM(a,b)/R,steps=Math.max(1,Math.ceil(angle/(.05*rad)));if(steps===1)return [a,b];const unit=p=>[Math.cos(p[1]*rad)*Math.cos(p[0]*rad),Math.cos(p[1]*rad)*Math.sin(p[0]*rad),Math.sin(p[1]*rad)],u=unit(a),v=unit(b),sin=Math.sin(angle),out=[a];if(Math.abs(sin)<1e-12)throw Error('ambiguous_geodesic');for(let i=1;i<steps;i++){const t=i/steps,x=Math.sin((1-t)*angle)/sin,y=Math.sin(t*angle)/sin,p=u.map((n,j)=>n*x+v[j]*y);out.push([wrap(Math.atan2(p[1],p[0])/rad),Math.atan2(p[2],Math.hypot(p[0],p[1]))/rad]);}out.push(b);return out;}
function arcClear(grid,a,b){const arc=geodesic(a,b);for(let i=1;i<arc.length;i++)if(!grid.segmentClear(arc[i-1],arc[i]))return false;return true;}
function densify(coordinates){const out=[coordinates[0]];for(let i=1;i<coordinates.length;i++)out.push(...geodesic(coordinates[i-1],coordinates[i]).slice(1));return out;}
function shorten(grid,coordinates){const out=[coordinates[0]];let i=0;while(i<coordinates.length-1){let j=Math.min(coordinates.length-1,i+64);while(j>i+1&&!arcClear(grid,coordinates[i],coordinates[j]))j--;if(!arcClear(grid,coordinates[i],coordinates[j]))throw Error('route_geometry_failed');if(distanceNM(out.at(-1),coordinates[j])>1e-9)out.push(coordinates[j]);i=j;}return out;}
export function planOceanRoute(grid,waypoints,{maxMilliseconds=20000,...options}={}){
 if(!Array.isArray(waypoints)||waypoints.length<2||waypoints.length>50)return {status:'invalid_waypoint_count',coordinates:[]};const points=waypoints.map(p=>Array.isArray(p)?p:[p.lon,p.lat]);
 for(let i=0;i<points.length;i++){const p=points[i];if(!Array.isArray(p)||p.length!==2||p.some(n=>typeof n!=='number'||!Number.isFinite(n))||Math.abs(p[0])>180||Math.abs(p[1])>90)return {status:'invalid_coordinates',pointIndex:i,coordinates:[]};const [x,y]=grid.xy(p);if(y<0||y>=grid.rows)return {status:'outside_topology',pointIndex:i,coordinates:[]};if(grid.blocked(Math.floor(x),Math.floor(y))||!grid.segmentClear(p,grid.coordinate(Math.floor(x),Math.floor(y))))return {status:'blocked_waypoint',pointIndex:i,coordinates:[]};}
 const deadline=performance.now()+maxMilliseconds,legs=[],all=[];let totalNM=0,directNM=0,expanded=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];if(distanceNM(a,b)<1e-9)return {status:'duplicate_waypoints',pointIndex:i,coordinates:[]};let result=search(grid,a,b,12,{...options,deadline});if(result.status==='no_path')result=search(grid,a,b,30,{...options,deadline});if(result.status!=='found')return {...result,legIndex:i-1,coordinates:[]};const coordinates=densify(options.shorten===false?result.coordinates:shorten(grid,result.coordinates)),distance=coordinates.slice(1).reduce((d,p,j)=>d+distanceNM(coordinates[j],p),0);for(let j=1;j<coordinates.length;j++)if(!grid.segmentClear(coordinates[j-1],coordinates[j]))return {status:'route_geometry_failed',legIndex:i-1,coordinates:[]};legs.push({fromIndex:i-1,toIndex:i,coordinates,distanceNM:distance,directDistanceNM:distanceNM(a,b),gridDistanceNM:result.gridDistanceNM,expanded:result.expanded,searchBounds:result.searchBounds});all.push(...(i===1?coordinates:coordinates.slice(1)));totalNM+=distance;directNM+=distanceNM(a,b);expanded+=result.expanded;
 }
 return {status:'found',inputWaypoints:points,engineVersion:ENGINE_VERSION,objective:'distance_only',topologyId:grid.manifest.id,topologySha256:grid.manifest.mask.sha256,coordinates:all,legs,totalNM,directNM,expanded,gridStepDegrees:grid.step,neighbours:16,segmentValidation:'geodesic_densification_max_0.05_degree_then_conservative_supercover_including_corner_contacts',optimality:'A* shortest grid path in searched bounds, then obstacle-checked visibility shortening; not a global maritime optimum',navigationallyValidated:false,ecologicalRisk:null,fuelSaving:null,seaIceDate:null,sources:grid.manifest.sources};
}
