<template>
  <div id="p5-container" class="fixed inset-0 z-0 pointer-events-none"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import p5 from 'p5';

let myP5 = null;

const sketch = (p) => {
  let stars = [];
  let gridOffset = 0;

  p.setup = () => {
    const container = document.getElementById('p5-container');
    p.createCanvas(container.clientWidth, container.clientHeight).parent(container);
    p.frameRate(30);
    
    // Create initial stars
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: p.random(-p.width, p.width),
            y: p.random(-p.height, p.height),
            z: p.random(p.width)
        });
    }
  };

  p.draw = () => {
    p.background(15, 15, 26); // Dark blue-black (pixel-card color match)
    p.translate(p.width / 2, p.height / 2);
    
    // Draw Starfield
    p.fill(255);
    p.noStroke();
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z = star.z - 2; // Speed
        if (star.z < 1) {
            star.z = p.width;
            star.x = p.random(-p.width, p.width);
            star.y = p.random(-p.height, p.height);
        }
        
        let sx = p.map(star.x / star.z, 0, 1, 0, p.width);
        let sy = p.map(star.y / star.z, 0, 1, 0, p.height);
        let r = p.map(star.z, 0, p.width, 4, 0);
        
        // Parallax effect
        p.ellipse(sx, sy, r, r);
    }

    // Draw Retro Grid (Cyberpunk style)
    p.stroke(0, 255, 255, 50); // Neon Blue transparent
    p.strokeWeight(1);
    
    let horizon = 50; 
    let spacing = 40;
    
    // Moving horizontal lines
    gridOffset = (gridOffset + 1) % spacing;
    
    // Perspective part (bottom half)
    for (let y = 0; y < p.height / 2; y += spacing) {
        let yPos = y + horizon;
        // Horizontal lines get denser as they go up (perspective) - Simplified for retro feel
        // Actually simple moving lines are easier
    }
    
    // Let's do a simple 3D moving plane effect at bottom
    p.push();
    p.rotateX(p.PI / 2.5);
    p.translate(0, 200); // Push it down
    
    // Grid lines
    let cols = 40;
    let rows = 40;
    let w = 2000;
    let h = 2000;
    
    // Shift grid
    let shiftY = (p.frameCount * 2) % 100;

    for (let i = -cols/2; i < cols/2; i++) {
        p.line(i * 100, -h, i * 100, h);
    }
    for (let i = -rows/2; i < rows/2; i++) {
        let y = i * 100 + shiftY;
        p.line(-w, y, w, y);
    }
    p.pop();
  };

  p.windowResized = () => {
    const container = document.getElementById('p5-container');
    if(container) {
        p.resizeCanvas(container.clientWidth, container.clientHeight);
    }
  };
};

onMounted(() => {
  myP5 = new p5(sketch);
});

onUnmounted(() => {
  if (myP5) {
    myP5.remove();
  }
});
</script>

<style scoped>
#p5-container canvas {
  display: block;
}
</style>
