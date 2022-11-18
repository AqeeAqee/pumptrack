game.stats=true

let bg = image.create(160, 120)
scene.setBackgroundImage(bg)

let track=new PumpTrack.Track()
track.sections.push(new PumpTrack.arcTrackSection(0, 130, 80, 30, 79, false))
track.sections.push(new PumpTrack.lineTrackSection(130, 150,91))
track.sections.push(new PumpTrack.arcTrackSection(150, 290, 200, 30, 79, false))
let imgTrack = image.create(300, 120)
track.draw(imgTrack,6)
let trackSprite=sprites.create(imgTrack, SpriteKind.Food)
trackSprite.top=0
trackSprite.left=0

const ballRadial=4
let ball = sprites.create(image.create(ballRadial*2-1,ballRadial*2-1), SpriteKind.Player)
ball.image.fillCircle(ballRadial - 1, ballRadial - 1, ballRadial, 1)
ball.image.drawCircle(ballRadial - 1, ballRadial - 1, ballRadial/3, 14)
ball.setPosition(ballRadial+1,20)
scene.cameraFollowSprite(ball)

const damperFactor = 0.998
const gravity=333

game.onUpdate(()=>{
    bg.fill(0)
    track.update(ball.x, ball.y, ballRadial)
    const degree =  track.tangentDegreeFixed //-Math.PI/2
        
        const v= Math.sqrt(ball.vx**2+ball.vy**2)
        // ball.vx = v * Math.sin(degree) 
        // ball.vy = v * Math.cos(degree)
        ball.setPosition(track.xFixed,track.yFixed)
        ball.vx *= damperFactor
        ball.vy *= damperFactor
        ball.ax = Math.cos(degree) * gravity * Math.sin(degree)
        ball.ay = Math.cos(degree) * gravity * Math.cos(degree)

        info.setScore(degree * 360 / Math.PI / 2)
        bg.print(ball.ax.toString(), 0, 20, 1)
        bg.print(ball.ay.toString(), 0, 30, 1)
        bg.print(ball.vx.toString(), 0, 0, 1)
        bg.print(ball.vy.toString(),0,10,1)
    // basic.pause(500)

    if(ball.x>imgTrack.width)
        controller.pauseUntilAnyButtonIsPressed()
})
