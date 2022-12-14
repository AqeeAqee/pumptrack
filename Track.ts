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
        public isTouched=false
        public xFixed=0
        public yFixed=0
        public tangentDegreeFixed=Math.PI

        public constructor(){
            this.sections=[]
        }

        public draw(img: Image, color: number) {
            let c = color
            if (color == 0) c = 2
            for (let i = 0; i < this.sections.length; i++) {
                const sec = this.sections[i]
                sec.draw(img, c)
                if (color == 0 && ++c >= 15) c = 2
                //img.print((i).toString(),(sec.rangeX1+sec.rangeX2)/2, img.height-8,1)
            }
        }

        public drawFrame(offsetX: number, offsetY: number, img: Image, color: number) {
            img.fill(0)
            let c = color
            if (color == 0) c = 2
            for (let i = 0; i < this.sections.length; i++) {
                const sec = this.sections[i]
                if (offsetX+160 >= sec.rangeX1 && offsetX <= sec.rangeX2)
                    sec.drawFrame(offsetX, offsetY, img, c)
                if (color == 0 && ++c >= 15) c = 2
                //img.print((i).toString(),(sec.rangeX1+sec.rangeX2)/2, img.height-8,1)
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
                this.isTouched= this.isTouching(x, y, radial)
                if (sec.rangeX1 <= x && x <= sec.rangeX2 && this.isTouched){
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
        public drawFrame(offsetX: number, offsetY: number, img: Image, color: number) {}

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

        public drawFrame(offsetX: number, offsetY:number, img: Image, color: number){
            // img.drawCircle(this.centerX,this.centerY,this.radial, color)

            for (let x =this.rangeX1;x<=this.rangeX2;x++){
                const y= this.centerY + Math.sqrt(this.radial**2-(this.centerX-x)**2) * (this.topHalf?-1:1)
                img.drawLine(x - offsetX, y - offsetY, x - offsetX, img.height, color)
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
            return -Math.atan2(this.centerY - y, this.centerX - x) + Math.PI / 2 //swap x & y for turned 90??
        }
    }

    export class lineTrackSection extends BaseTrackSection {
        public height: number
        public constructor(rangeX1: number, rangeX2: number, height: number) {
            super()
            this.sectionType = TrackSectionType.line
            this.setRange(rangeX1, rangeX2)
            this.height = height
        }

        public draw(img: Image, color: number) {
            // img.drawLine(this.rangeX1,this.height,this.rangeX2,this.height,color)

            img.fillRect(this.rangeX1, this.height, this.rangeX2 - this.rangeX1, img.height, color)
        }

        public drawFrame(offsetX: number, offsetY: number, img: Image, color: number) {
            // img.drawLine(this.rangeX1,this.height,this.rangeX2,this.height,color)

            img.fillRect(this.rangeX1 - offsetX, this.height - offsetY, this.rangeX2 - this.rangeX1, img.height - this.height + offsetY, color)
        }

        public isTouching(x: number, y: number, radial: number): boolean {
            return (y + radial >= this.height)
        }

        public fixPosition(x: number, y: number, radial: number): number {
            return this.height - radial
        }

        public getTangentDegree(x: number, y: number, radial: number): number {
            return Math.PI
        }
    }

    export class bankTrackSection extends BaseTrackSection {
        public height: number
        public height2: number
        public tangentDegree: number
        public constructor(rangeX1: number, rangeX2: number, height: number,height2:number) {
            super()
            this.sectionType = TrackSectionType.bank
            this.setRange(rangeX1, rangeX2)
            this.height = height
            this.height2 = height2
            this.tangentDegree = Math.atan2(this.height2 - this.height, this.rangeX2 - this.rangeX1) + Math.PI / 2
        }

        public draw(img: Image, color: number) {
            // img.drawLine(this.rangeX1,this.height,this.rangeX2,this.height,color)
            for (let x = this.rangeX1; x <= this.rangeX2; x++) {
                img.drawLine(x, Math.map(x, this.rangeX1, this.rangeX2, this.height, this.height2), x, img.height, color)
            }
        }

        public drawFrame(offsetX:number, offsetY:number, img: Image, color: number) {
            // img.drawLine(this.rangeX1,this.height,this.rangeX2,this.height,color)
            for (let x = this.rangeX1; x <= this.rangeX2; x++) {
                img.drawLine(x - offsetX, Math.map(x, this.rangeX1, this.rangeX2, this.height, this.height2) - offsetY, x - offsetX, img.height, color)
            }
        }

        public isTouching(x: number, y: number, radial: number): boolean {
            return (y + radial >= Math.map(x, this.rangeX1, this.rangeX2, this.height, this.height2))
        }

        public fixPosition(x: number, y: number, radial: number): number {
            return Math.map(x, this.rangeX1, this.rangeX2, this.height, this.height2)-radial
        }

        public getTangentDegree(x: number, y: number, radial: number): number {
            return this.tangentDegree
        }
    }

    export class vector{
        public degree:number
        public magnitude:number
    }


}