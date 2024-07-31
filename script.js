window.addEventListener("load", () => {
  const textInput = document.getElementById("textInput");
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.canvasWidth; 
      // this.y =Math.random() * this.effect.canvasHeight;
      this.y =this.effect.canvasHeight;// 밑에서만 올라옴
      // this.y = 0 // y가 0이면 파티클이 위에서 만 내려옴
      this.color = color;
      this.originX = x;
      this.originY = y;
      this.size = this.effect.gap; // -1 하면 사각무늬 생김
      this.dx = 0;
      this.dy = 0;
      this.vx = 0;
      this.vy = 0;
      this.forse = 0;
      this.angle = 0;
      this.distance = 0;
      this.friction = Math.random() * 0.6 * 1; //  변화가능
      this.ease = Math.random() * 0.05 + 0.005; // 변화가능
    }
    draw() {
      this.effect.context.fillStyle = this.color;
      this.effect.context.fillRect(this.x, this.y, this.size, this.size)
    }
    update() {
      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;
      //  Math.sqrt()없이 radius를 키워서 컴 부담 줄임
      // this.distance = Math.sqrt(this.dx*this.dx + this.dy*this.dy)
      this.distance = this.dx*this.dx + this.dy*this.dy;
      this.force = -this.effect.mouse.radius / this.distance;

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle)
        this.vy += this.force * Math.sin(this.angle);
      }
      this.x +=(this.vx *= this.friction) + (this.originX - this.x)* this.ease
      this.y +=(this.vy *= this.friction) + (this.originY - this.y) * this.ease
    }
  }

  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.fontSize = 130;
      this.lineHeight = this.fontSize * 1.1;
      this.maxTextWidth = this.canvasWidth * 0.8;
      this.textInput = textInput;
      this.verticalOffset = 0; // 텍스트를 위(-) 아래(+)로 옮길 수 있음
      // function(e) {}는 바인딩문제 생기므로 그냥 arrow 함수 쓰면 됨
      this.textInput.addEventListener('keyup', (e)=> {
        if (e.key !==' ') {
          this.context.clearRect(0,0, this.canvasWidth, this.canvasHeight)
          this.wrapText(e.target.value)
        }
      })
      // 텍스트 분해
      this.particle = []
      this.gap = 2;
      this.mouse = {
        radius: 15000,
        x: 0,
        y: 0,
      }
      window.addEventListener('mousemove', (e)=>{
        this.mouse.x = e.x;
        this.mouse.y = e.y
        // console.log(this.mouse.x, this.mouse.y)
      })
    }
    wrapText(text) {
      // 칼라와 폰트 설정
      const gradient = this.context.createLinearGradient(0,0,this.canvasWidth,this.canvasHeight);
      gradient.addColorStop(0.3, "red");
      gradient.addColorStop(0.5, "orange");
      gradient.addColorStop(0.7, "violet");
      this.context.fillStyle = gradient;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.lineWidth = 1;
      this.context.strokeStyle = "yellow";
      this.context.letterSpacing = '5px'
      this.context.font = `${this.fontSize}px Bangers`;
      // this.context.font = `${this.fontSize}px Impact`;
      // this.context.font = `${this.fontSize}px Helvetica`;
      // this.context.fillText(text, this.textX, this.textY);
      // this.context.strokeText(text, this.textX, this.textY);
      // 여러 라인으로 나누기
      let linesArray = [];
      let words = text.split(" ");
      let lineCounter = 0;
      let line = "";
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
          line = words[i] + " ";
          lineCounter++;
        } else {
          line = testLine;
        }
        linesArray[lineCounter] = line;
      }
      let textHeight = this.lineHeight * lineCounter;
      this.textY = this.canvasHeight /2 - textHeight/2 + this.verticalOffset;
      // this.textY = this.canvasHeight /2 - textHeight/2 ;

      linesArray.forEach((el, index) => {
        this.context.fillText(el, this.textX, this.textY + ( index * this.lineHeight ));
        this.context.strokeText(el,this.textX, this.textY + ( index * this.lineHeight ))
      })
      this.convertToParticles();
    }
    convertToParticles() {
      this.particles = []
      const pixels = this.context.getImageData(0,0, this.canvasWidth, this.canvasHeight).data;
      // console.log(pixels)
      // 기존 것 지우기
      this.context.clearRect(0,0, this.canvasWidth, this.canvasHeight)
      for (let y = 0 ; y < this.canvasHeight ; y+= this.gap){
        for (let x = 0; x < this.canvasWidth ; x+= this.gap) {
          const index = (y*this.canvasWidth + x)*4;
          const alpha = pixels[index + 3];
          if (alpha > 0 ) {
            const red = pixels[index];
            const green = pixels[index + 1]
            const blue = pixels[index + 2]
            const color = `rgb(${red}, ${green}, ${blue})`;
            // console.log(color)
            this.particles.push(new Particle(this, x, y, color)) 
          }
        }
      }
      // console.log(this.particles)
    }
    render() {
      this.particles.forEach(particle => {
        particle.update();
        particle.draw();
      })
    }
    resize(width, height){
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.maxTextWidth = this.canvasWidth * 0.8;
    }
  }

  const effect = new Effect(ctx, canvas.width, canvas.height);
  // console.log(effect)
  /** 
   * 여기서 시작합니다. 현재는 index.html 의 input의 value="xx"값이 들어옵니다. 
   * 아래 것을 활성화 시키면 input에 입력되는 내용이 나타납니다.
   * 마우스를 움직여 분산시킬 수 있어요
   * */
  effect.wrapText(effect.textInput.value);
  // effect.wrapText(textInput.value);
  // effect.wrapText(effect.textInput.value);
  // effect.wrapText("기본 텍스트");
  // effect.render()

  function animate() {
    ctx.clearRect(0,0,canvas.width, canvas.height)
    effect.render()
    requestAnimationFrame(animate)
  }
  animate()

  window.addEventListener('resize', ()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height)
    effect.wrapText(effect.textInput.value);
  })
});
