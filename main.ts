game.stats=true

let bg = image.create(160, 120)
scene.setBackgroundImage(bg)

let track=new PumpTrack.Track()
let i = 0
for(;i<2;i++){
    const offset=i*56*4
    track.sections.push(new PumpTrack.arcTrackSection(24 + offset, 136 + offset, 80 + offset, 30, 80, false))
    track.sections.push(new PumpTrack.arcTrackSection(137 + offset, 249 + offset, 192 + offset, 145, 80, true))
}
// expand last arc
    const offset = i * 56 * 4
    track.sections.push(new PumpTrack.arcTrackSection(24 + offset, 136 + offset, 80 + offset, 30, 80, false))
// add extra platform
const lastRangeX2 = track.sections[track.sections.length - 1].rangeX2
track.sections.push(new PumpTrack.lineTrackSection(lastRangeX2, lastRangeX2+30, 87))

// start at 0
track.sections[0].rangeX1 = 0

// track.sections.push(new PumpTrack.lineTrackSection(130, 150,91))
// track.sections.push(new PumpTrack.arcTrackSection(150, 290, 200, 30, 79, false))
let imgTrack = image.create(track.sections[track.sections.length -1].rangeX2, 120)
track.draw(imgTrack,2)
let trackSprite=sprites.create(imgTrack, SpriteKind.Food)
trackSprite.top=0
trackSprite.left=0

const ballRadial=5
let ball = sprites.create(image.create(ballRadial*2-1,ballRadial*2-1), SpriteKind.Player)
ball.image.fillCircle(ballRadial - 1, ballRadial - 1, ballRadial, 1)
ball.image.drawCircle(ballRadial - 1, ballRadial - 1, ballRadial/3, 14)
ball.setPosition(ballRadial+5,40)
// ball.vy=100
scene.cameraFollowSprite(ball)
// scene.centerCameraAt()

const damperFactor = 0.998
const gravity=222

game.onUpdate(()=>{

    bg.fill(0)
    track.update(ball.x, ball.y - 1, ballRadial) // ball.y-1: for natrual weight pressure effect
    const degree =  track.tangentDegreeFixed 
    
    
    const force = gravity * (controller.B.isPressed()?3:1)
    if(track.isTouched)
    {
        // ball.setPosition(track.xFixed,track.yFixed)
        ball.x=track.xFixed
        ball.y=track.yFixed
        // const v= Math.sqrt(ball.vx**2+ball.vy**2)
        // ball.vx = 
        //          Math.abs(Math.sin(degree)) * (Math.cos(degree) * ball.vx + Math.sin(degree) * ball.vy)
        // + Math.abs(Math.sin(degree)) * (Math.sin(degree) * ball.vy + Math.cos(degree) * ball.vx)
        // ball.vy =  
        //          - Math.cos(degree) * (Math.cos(degree) * ball.vx + Math.sin(degree) * ball.vy)
        //           - Math.cos(degree) * (Math.sin(degree) * ball.vy + Math.cos(degree) * ball.vx)
        ball.vx *= damperFactor
        ball.vy *= damperFactor
        ball.ax = -(Math.cos(degree)) * force * Math.sin(degree)
        ball.ay = -(Math.cos(degree)) * force * Math.cos(degree)
        // bg.print(degree.toString(), 0, 40, 3)
        // info.setScore(degree * 360 / Math.PI / 2)
        bg.print(ball.ax.toString(), 0, 20, 2)
        bg.print(ball.ay.toString(), 0, 30, 2)
    } else {
        ball.ax = 0
        ball.ay = force
    }
    bg.print(ball.vx.toString(), 0, 0, 1)
    bg.print(ball.vy.toString(), 0, 10, 1)
    bg.fillRect(0,114,ball.vx/2,6,4)

    // basic.pause(200)

    if ( controller.A.isPressed())
        controller.pauseUntilAnyButtonIsPressed()

    if (ball.x < 0)
        game.over(false)
    if (ball.x > imgTrack.width){
        game.over(true)
    }
})

game.onUpdateInterval(50, ()=>{
    info.setScore(1000*ball.x/game.runtime())
})