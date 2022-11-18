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

        //for output
        public xFixed=0
        public yFixed=0
        public tangentDegreeFixed=Math.PI

        public constructor(){
            this.sections=[]
        }

        public draw(img: Image, color: number){
            for(let sec of this.sections){
                sec.draw(img, color)
            }
        }

        public isTouching(x: number, y: number, radial: number): boolean {
            for(let sec of this.sections) {
                if (sec.rangeX1 <= x && x <= sec.rangeX2) {
                    return sec.isTouching(x, y, radial)
                }
            }
            return false
        }

        public update(x: number, y: number, radial: number) {
            this.xFixed = x
            this.yFixed = y
            this.tangentDegreeFixed = 0// Math.PI/2
            for(let sec of this.sections){
                if(sec.rangeX1<=x && x<=sec.rangeX2 && this.isTouching(x,y,radial)){
                    this.yFixed = sec.fixPosition(x, y, radial)
                    this.tangentDegreeFixed = sec.getTangentDegree(x,y,radial)
                }
            }
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
        public draw(img: Image, color: number) {}

        public isTouching(x: number, y: number, radial: number): boolean {return null}
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
            this.centerX=centerX
            this.centerY=centerY
            this.radial=radial
            this.topHalf=topHalf
        }

        public draw(img: Image, color: number){
            // img.drawCircle(this.centerX,this.centerY,this.radial, color)

            for(let x=this.rangeX1;x<=this.rangeX2;x++){
                const y= this.centerY + Math.sqrt(this.radial**2-(this.centerX-x)**2) * (this.topHalf?-1:1)
                img.drawLine(x, y, x, img.height, color)
            }
        }

        public isTouching(x: number, y: number, radial: number):boolean{
            const xDeltaSquare = (this.centerX - x) ** 2
            const yDeltaSquare = (this.centerY - y) ** 2
            if (this.topHalf) {
                const rDeltaSquare = (this.radial + radial) ** 2
                if (xDeltaSquare + yDeltaSquare <= rDeltaSquare) {
                    return true
                }
            } else {
                const rDeltaSquare = (this.radial - radial) ** 2
                if (xDeltaSquare + yDeltaSquare >= rDeltaSquare) {
                    return true
                }
            }
            return false
        }

        public fixPosition(x: number, y: number, radial: number):number {
            const xDeltaSquare=(this.centerX-x) ** 2
            const yDeltaSquare = (this.centerY - y) ** 2
            if(this.topHalf){
                const rDeltaSquare = (this.radial+radial) ** 2
                if (xDeltaSquare + yDeltaSquare <= rDeltaSquare){
                    //fix upward
                    return this.centerY - Math.sqrt(rDeltaSquare - xDeltaSquare)
                }
            }else{
                const rDeltaSquare = (this.radial-radial)**2
                if (xDeltaSquare + yDeltaSquare >= rDeltaSquare) {
                    //fix upward
                    return this.centerY + Math.sqrt(rDeltaSquare - xDeltaSquare)
                }
            }
            return y
        }

        public getTangentDegree(x: number, y: number, radial: number): number {
            return -Math.atan2(this.centerY - y, this.centerX - x) //swap x & y for turned 90°
        }
    }

    export class lineTrackSection extends BaseTrackSection {
        public height: number
        public constructor(rangeX1: number, rangeX2: number, height:number) {
            super()
            this.sectionType = TrackSectionType.line
            this.setRange(rangeX1, rangeX2)
            this.height = height
        }

        public draw(img: Image,color:number) {
            // img.drawLine(this.rangeX1,this.height,this.rangeX2,this.height,color)

            img.fillRect(this.rangeX1, this.height, this.rangeX2 - this.rangeX1, img.height - this.height, color)
        }

        public isTouching(x: number, y: number, radial: number): boolean {
            return (y + radial>=this.height)
        }

        public fixPosition(x: number, y: number, radial: number): number {
            return this.height-radial
        }

        public getTangentDegree(x: number, y: number, radial: number): number {
            return Math.PI/2
        }
    }

    export class vector{
        public degree:number
        public magnitude:number
    }


}