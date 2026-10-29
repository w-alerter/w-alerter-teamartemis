export function classifyPolygon(rings,x,y){
  let inside=false;for(const ring of rings){for(let i=1;i<ring.length;i++){const [ax,ay]=ring[i-1],[bx,by]=ring[i],dx=bx-ax,dy=by-ay,cross=(x-ax)*dy-(y-ay)*dx;
    // Numeric tolerance only; this is not a reported positional accuracy or a buffer.
    const eps=1e-12*Math.max(1,Math.abs(dx),Math.abs(dy));if(Math.abs(cross)<=eps&&x>=Math.min(ax,bx)-eps&&x<=Math.max(ax,bx)+eps&&y>=Math.min(ay,by)-eps&&y<=Math.max(ay,by)+eps)return 'boundary';
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  }}return inside?'inside':'outside';
}
