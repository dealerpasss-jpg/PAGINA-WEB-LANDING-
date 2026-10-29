export const handPoses = [
  { name: 'open', at: 0 }, { name: 'eighth', at: .125 },
  { name: 'quarter', at: .25 }, { name: 'half', at: .5 },
  { name: 'three-quarter', at: .75 }, { name: 'closed', at: 1 },
] as const;
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export function smooth(value: number) { const t=clamp(value);return t*t*t*(t*(t*6-15)+10); }
export function scrollProgress(scrollY: number, top: number, trackHeight: number, stageHeight: number) {
  return clamp((scrollY-top)/Math.max(1,trackHeight-stageHeight));
}
export function dampProgress(current: number, target: number, elapsed: number) {
  const next=current+(target-current)*(1-Math.exp(-Math.min(64,Math.max(0,elapsed))/120));
  return Math.abs(next-target)<.0001?target:next;
}
export function filmState(progress: number) {
  const p=clamp(progress),close=smooth((p-.04)/.38),leave=smooth((p-.37)/.3),drive=smooth((p-.48)/.52);
  const right=Math.max(0,handPoses.findIndex(pose=>pose.at>=close)),left=Math.max(0,right-1);
  const interval=handPoses[right].at-handPoses[left].at;
  const phase=interval?(close-handPoses[left].at)/interval:1;
  // Continuous interpolation avoids the pause/jump at each of the six existing drawings.
  const blend=smooth(phase);
  const poses=handPoses.map((_,index)=>left===right?(index===right?1:0):index===left?1-blend:index===right?blend:0);
  return {p,close,leave,drive,poses,chapter:p<.27?0:p<.56?1:2,
    copyFade:smooth((p-.43)/.13),arrivalFade:smooth((p-.59)/.15),
    handX:Math.pow(leave,1.35)*82-close*1.5,handY:leave*leave*55-Math.sin(close*Math.PI)*1.5,handAngle:leave*19-close*3,
    carX:2+(1-drive)*28-Math.sin(drive*Math.PI)*4,carY:-4+(1-drive)*-15,carAngle:-3*(1-drive),carScale:.26+drive*.52,carOpacity:smooth((p-.49)/.14)};
}
