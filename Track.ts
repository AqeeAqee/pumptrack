// Add your code here
enum TrackSectionType{
    line,
    bank,
    arc,
    sin,
}

namespace PumpTrack{
    export class Track{
        public sections:BaseTrackSection[]
        public getForce(x: number, y: number, radial: number): number {
            for(let sec of this.sections){
                if(sec.rangeX1<x&&x<sec.rangeX2){
                    y = sec.fixPosition(x, y, radial)
                    let degree = sec.getTangentDegree(x,y,radial)
                    if(degree)
                        return degree
                }
            }
            return null
        }

    }

    export class BaseTrackSection{
        public sectionType: TrackSectionType
        public rangeX1:number
        public rangeX2:number
        
        public constructor() {
        }

        public setRange(x1:number,x2:number){
            this.rangeX1=x1
            this.rangeX2=x2
        }
        public draw(img: Image) {}

        public fixPosition(x: number, y: number, radial: number): number { return null }
        public getTangentDegree(x:number,y:number, radial:number): number{return null}
    }
    
    export class arcTrackSection extends BaseTrackSection{
        public centerX: number
        public centerY:number
        public radial: number
        public topHalf:boolean
        public constructor(rangeX1: number, rangeX2: number, centerX: number, centerY: number, radial: number,topHalf:boolean){
            super()
            this.sectionType=TrackSectionType.arc
            this.setRange(rangeX1,rangeX2)
            this.radial=radial
            this.topHalf=topHalf
        }

        public draw(img: Image){
            img.drawCircle(this.centerX,this.centerY,this.radial, 1)
        }

        public fixPosition(x: number, y: number, radial: number) {
            const xDeltaSquare=(this.centerX-x)**2
            const yDeltaSquare = (this.centerY - y) ** 2
            if(this.topHalf){
                const rDeltaSquare = (this.radial+radial)**2
                if (xDeltaSquare + yDeltaSquare < rDeltaSquare){
                    //fix upward
                    return this.centerY - Math.sqrt(rDeltaSquare - xDeltaSquare)
                }
            }else{
                const rDeltaSquare = (this.radial-radial)**2
                if (xDeltaSquare + yDeltaSquare > rDeltaSquare) {
                    //fix upward
                    return this.centerY + Math.sqrt(rDeltaSquare - xDeltaSquare)
                }
            }
            return y
        }

        public getTangentDegree(x: number, y: number, radial: number): number {
            return Math.atan2(this.centerX -x,this.centerY-y) //swap x & y for turned 90°
        }
    }

    export class vector{
        public degree:number
        public magnitude:number
    }


}