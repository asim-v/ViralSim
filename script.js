var CONFIG = {
  COLORS: {
    healthy: "#00ffae",
    infected: "#ff0048",
    recovered: "#e6bf00",
    dead: "#9e9e9e"
  },
  INFECTIOUSNESS:30,
  SCREEN_WIDTH: 0,
  SCREEN_HEIGHT: 0,
  INITIAL_INFECTIONS: 0,
  SOCIAL_DISTANCING_RATE: 0.15,
  SOCIAL_DISTANCING_INTENSITY: 0.9,
  MORTALITY_RATE: 0.00015,
  PARTICLE_SPEED: 2,
  PARTICLE_SIZE: 20,
  TIME_TO_RECOVER: 1200,
  QUANTITY: 120
};

(function() {
  
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
   CONFIG.QUANTITY = 60;
   CONFIG.PARTICLE_SPEED = 1;
   CONFIG.PARTICLE_SIZE = 10;
  }
  
  var canvas;
  var context;
  var particles;

  var mouseX = (window.innerWidth - CONFIG.SCREEN_WIDTH);
  var mouseY = (window.innerHeight - CONFIG.SCREEN_HEIGHT);

  var targetX = 0;
  var targetY = 0;
  
  var animationRequest;
  var animationFrameCount;
  var playAnimation = true;
  
    
    
  function init(){
    myChart.data.labels = [];
    myChart.data.datasets.forEach((dataset) => {
        dataset.data = [];
    });
    myChart.update();
    animationFrameCount = 0;
    
    
    if (document.getElementById("world")) {
      document.getElementById("world").remove();
    }
    canvas = document.createElement("canvas");
    canvas.id = "world";
    document.body.appendChild(canvas);

    if(canvas && canvas.getContext) {
      playAnimation = true;
      context = canvas.getContext('2d');
      context.globalCompositeOperation = 'destination-over';
      window.addEventListener('resize', windowResizeHandler, false);
      windowResizeHandler();
      createParticles();
      loop();
    }
    document.getElementById("button").addEventListener("click", function(){
        menu = document.getElementById("menu");
        menu.style.display = "none";
        canvas = document.getElementById("world");
        canvas.style.removeProperty("filter");
        infectParticle(particles[0]);
    });            
  }
    
  function infectParticle(particle){
    if (particle.healthStatus == "healthy") {
      particle.healthStatus = "infected";
      particle.fillColor = CONFIG.COLORS.infected;
      particle.timeToRecover = CONFIG.TIME_TO_RECOVER;
    }
  }
  function recoverParticle(particle) {
    particle.healthStatus = "recovered";
    particle.fillColor = CONFIG.COLORS.recovered;
    particle.timeToRecover = 0;
  }
  function killParticle(particle) {
    particle.healthStatus = "dead";
    particle.fillColor = CONFIG.COLORS.dead;
    particle.directionX = particle.directionX * 0;
    particle.directionY = particle.directionY * 0;
    particle.speed = 0;
  }
  function socialDistancing(particle) {
    particle.directionX = particle.directionX * (1 - CONFIG.SOCIAL_DISTANCING_INTENSITY);
    particle.directionY = particle.directionY * (1 - CONFIG.SOCIAL_DISTANCING_INTENSITY);
    particle.speed = CONFIG.PARTICLE_SPEED * (1 - CONFIG.SOCIAL_DISTANCING_INTENSITY);
  }
  
  function createParticles(){
    particles = [];
    var depth = 0;

    for (var i = 0; i < CONFIG.QUANTITY; i++) {
      var posX = CONFIG.PARTICLE_SIZE/2 + Math.random() * (window.innerWidth - CONFIG.PARTICLE_SIZE/2)
      var posY = CONFIG.PARTICLE_SIZE/2 + Math.random() * (window.innerHeight - CONFIG.PARTICLE_SIZE/2);
      
      var directionX = -CONFIG.PARTICLE_SPEED + (Math.random() * (CONFIG.PARTICLE_SPEED * 2));
      var directionY = -CONFIG.PARTICLE_SPEED + (Math.random()* (CONFIG.PARTICLE_SPEED * 2));

      var particle = {
        position: { x: posX, y: posY },
        size: CONFIG.PARTICLE_SIZE,
        directionX: directionX,
        directionY: directionY,
        speed: CONFIG.PARTICLE_SPEED,
        targetX: posX,
        targetY: posY,
        depth: depth,
        index:i,
        fillColor: CONFIG.COLORS.healthy,
        healthStatus: "healthy",
        timeToRecover: 0
      };
      particles.push( particle );
    }
    
    //inital Infections
    for(var i = 0; (i < CONFIG.INITIAL_INFECTIONS && (i < particles.length - 1) ); i++ ) {
      infectParticle(particles[i]);
    }
    
    //Social Distancing Rate
    for(var i = 0; i < (CONFIG.SOCIAL_DISTANCING_RATE * particles.length); i++ ) {
      socialDistancing(particles[particles.length - (i + 1)]);
    }
  }

  function loop(){

    //Update Chart
    if (animationFrameCount % 10 == 0) {
      myChart.data.labels.push(animationFrameCount);
      myChart.data.datasets.forEach((dataset) => {
          switch(dataset.label) {
            case "Healthy":
              dataset.data.push(particles.filter(p => {return (p.healthStatus == "healthy")}).length);
              break;
            case "Infected":
              var infectedCount = particles.filter(p => {return (p.healthStatus == "infected")}).length
              dataset.data.push(infectedCount);
              console.log(infectedCount);
              if (infectedCount == 0) {
                playAnimation = true;
              }
              break;
            case "Recovered":
              dataset.data.push(particles.filter(p => {return (p.healthStatus == "recovered")}).length);
              break;
            case "Dead":
              dataset.data.push(particles.filter(p => {return (p.healthStatus == "dead")}).length);
              break;
          }
      });
      myChart.update();
    }
    animationFrameCount++;
    //Update Tabs htab, itab, rtab, dtab
    var PHP = (particles.filter(p => {return (p.healthStatus == "healthy")}).length / particles.length);
    a = Math.round(PHP*100)
    document.getElementById("htab").innerHTML = a.toString()+" %"
      
    var PIP = (particles.filter(p => {return (p.healthStatus == "infected")}).length / particles.length);
    b = Math.round(PIP*100)
    document.getElementById("itab").innerHTML = b.toString()+" %"
      
    var PRP = (particles.filter(p => {return (p.healthStatus == "recovered")}).length / particles.length);
    c = Math.round(PRP*100)
    document.getElementById("rtab").innerHTML = c.toString()+" %"
            
    var PDP = (particles.filter(p => {return (p.healthStatus == "dead")}).length / particles.length);
    d = Math.round(PDP*100)
    document.getElementById("dtab").innerHTML = d.toString()+" %"
            
      
    context.fillStyle = 'rgba(43, 43, 43,0.4)';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    var z = 0;
    var xdist = 0;
    var ydist = 0;
    var dist = 0;

    for (var i=0; i < particles.length; i++){

      var particle = particles[i];
      var lp = { x: particle.position.x, y: particle.position.y };

      if(particle.position.x <=particle.size/2 || particle.position.x >= CONFIG.SCREEN_WIDTH - CONFIG.PARTICLE_SIZE/2){
        particle.directionX *= -1;
      }

      if(particle.position.y <=particle.size/2 || particle.position.y >= CONFIG.SCREEN_HEIGHT - CONFIG.PARTICLE_SIZE/2){
        particle.directionY *= -1;
      }
      
      if (particle.healthStatus == "infected") {
        particle.timeToRecover--;
        if (particle.timeToRecover <= 0) {
          recoverParticle(particle);
        } else if (Math.random() <= CONFIG.MORTALITY_RATE) {
          killParticle(particle);
        }
      }

      for(var s=0; s < particles.length; s++) {
        var bounceParticle = particles[s];
          if(bounceParticle.index != particle.index) {
            //what are the distances
            z = CONFIG.PARTICLE_SIZE;
            xdist = Math.abs(bounceParticle.position.x - particle.position.x);
            ydist = Math.abs(bounceParticle.position.y - particle.position.y);
            dist = Math.sqrt(Math.pow(xdist, 2) + Math.pow(ydist, 2));
            if(dist < z) {
              randomiseDirection(particle);
              randomiseDirection(bounceParticle);
              if (particle.healthStatus == "infected" || bounceParticle.healthStatus == "infected") {

              chance = Math.random()
              if (chance < ((100-CONFIG.INFECTIOUSNESS)/100)){
                infectParticle(bounceParticle);
                infectParticle(particle);
              }
              }
            }
          }
        }

        particle.position.x -= particle.directionX;
        particle.position.y -= particle.directionY;

        context.beginPath();
        context.fillStyle = particle.fillColor;
        context.lineWidth = particle.size;
        context.moveTo(lp.x, lp.y);
        context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
        context.closePath();
        context.fill();
    }
    
    if (animationRequest) {
      window.cancelAnimationFrame(animationRequest);
    }
    
    if (playAnimation) {
      animationRequest = requestAnimationFrame(loop);
    }
  }

  function randomiseDirection (particle) {
    //pick a random deg
    var d = 0;
    while((d == 0) || (d == 90) || (d == 180) || (d == 360)) {
      d = Math.floor(Math.random() * 360);
    }

    var r = (d * 180)/Math.PI;
    particle.directionX = Math.sin(r) * particle.speed;
    particle.directionY = Math.cos(r) * particle.speed;

  }

  function windowResizeHandler() {
    CONFIG.SCREEN_WIDTH = window.innerWidth;
    CONFIG.SCREEN_HEIGHT = window.innerHeight;
    canvas.width = CONFIG.SCREEN_WIDTH;
    canvas.height = CONFIG.SCREEN_HEIGHT;
  }

  (function() {
    // Config-Menu
    var gui = new dat.GUI({width: 350});
    gui.close();
    gui.add(CONFIG, 'INFECTIOUSNESS').name("Higiene").min(0).step(1).max(100).onFinishChange(init);
    gui.add(CONFIG, 'QUANTITY').name("Población").min(15).step(1).max(1000).onFinishChange(init);
    gui.add(CONFIG, 'INITIAL_INFECTIONS').name("Infecciones Iniciales").min(0).step(1).max(15).onFinishChange(init);
    gui.add(CONFIG, 'SOCIAL_DISTANCING_RATE').name("SusanaDistancia").min(0).step(0.05).max(1).onFinishChange(init);
    gui.add(CONFIG, 'SOCIAL_DISTANCING_INTENSITY').name("Intensidad de dist. Social").min(0).step(0.05).max(1).onFinishChange(init);
    gui.add(CONFIG, 'TIME_TO_RECOVER').name("Tiempo de recuperación").min(300).step(100).max(5000).onFinishChange(init);
    gui.add(CONFIG, 'MORTALITY_RATE').name("Mortalidad").min(0).step(0.00005).max(0.01).onFinishChange(init);
    gui.add(CONFIG, 'PARTICLE_SPEED').name("Rapidez").min(0.5).step(0.5).max(10).onFinishChange(init);
    gui.add(CONFIG, 'PARTICLE_SIZE').name("Tamaño").min(1).step(1).max(30).onFinishChange(init);

    gui.domElement.id = 'gui';
  })();
  
  var ctx = document.getElementById('chart').getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: [],
          datasets: [
            {
              label: "Healthy",
              borderColor: CONFIG.COLORS.healthy,
              backgroundColor: "rgba(0,255,0,0.35)",
              pointRadius: 0,
              data: []
            },{
              label: "Infected",
              borderColor: CONFIG.COLORS.infected,
              backgroundColor: "rgba(255,0,0,0.35)",
              pointRadius: 0,
              data: []
            },{
              label: "Recovered",
              borderColor: CONFIG.COLORS.recovered,
              backgroundColor: "rgba(255,255,255,0.35)",
              pointRadius: 0,
              data: []
            },{
              label: "Dead",
              borderColor: CONFIG.COLORS.dead,
              backgroundColor: "rgba(255,255,255,0.35)",
              pointRadius: 0,
              data: []
            }
          ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            display: false
          }],
          xAxes: [{
            display: false
          }]
        },
        tooltips: {
          enabled: false
        }
      }
  });
  
  init();
canvas = document.getElementById("world")
canvas.style.filter = "blur(10px)";
    
}());