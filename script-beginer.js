window.addEventListener('load', ()=>{
    const textInput = document.getElementById('textInput')
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.strokeStyle = 'red'; // 가로 줄
    ctx.beginPath();
    ctx.moveTo(canvas.width/2,0)
    ctx.lineTo(canvas.width/2, canvas.height)
    ctx.stroke()

    ctx.strokeStyle = 'green'; // 세로 줄
    ctx.beginPath();
    ctx.moveTo(0,canvas.height/2)
    ctx.lineTo(canvas.width,canvas.height/2)
    ctx.stroke()

    const text = 'Hello'
    const textX = canvas.width/2;
    const textY = canvas.height/2;

    const gradient = ctx.createLinearGradient(0,0,canvas.width, canvas.height)
    gradient.addColorStop(0.3, 'red')
    gradient.addColorStop(0.5, 'orange');
    gradient.addColorStop(0.7, 'fuchsia')
    ctx.fillStyle = gradient
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 3;
    ctx.font = '50px Helvetica'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // ctx.fillText(text, textX, textY)
    // ctx.strokeText(text,textX, textY)

    const maxTextWidth = canvas.width * 0.5;
    const lineHeight = 80;

    function wrapText(text) {
        let linesArray = []
        let lineCounter = 0 
        let line = ''
        let words = text.split(' ')
        for (let i= 0; i < words.length; i++){
            let testLine = line + words[i] + ' ';
            if (ctx.measureText(testLine).width > maxTextWidth) {
                line = words[i] + ' ';
                lineCounter++
            } else {
                line = testLine;
            }
            // ctx.measureText() 는 TextMetrics 은 width포함한 객체 출력
            // console.log(ctx.measureText(testLine));
            // 위 모든 단어들이 공백으로 나누어졌고, 같은 좌표에 찍힌다.
            // ctx.fillText(testLine, canvas.width/2, canvas.height/2)
           linesArray[lineCounter] = line 
            // ctx.fillText(testLine, canvas.width/2, canvas.height/2 + i * 70)
        }
        let textHeight = lineHeight * lineCounter;
        let textY = canvas.height/2 - textHeight/2

        linesArray.forEach((el, index) => {
            ctx.fillText(el, canvas.width/2, textY + (index * lineHeight))
        })
        console.log(linesArray)
        console.log(linesArray[1])
    }
    // wrapText('Hello, how are you? My old friend')
    textInput.addEventListener('keyup', function(e){
        // console.log(e.target.value)
        // ctx.clearRect(0,0,canvas.width, canvas.height)
        wrapText(e.target.value)
    })
})