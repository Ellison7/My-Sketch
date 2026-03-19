let ripples = [];
let sphereDetail = 80;
let radius = 160;

let stars = [];
let moonAngle = 0;
let sunAngle = 0;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
  noStroke();

  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(-2000, 2000),
      y: random(-2000, 2000),
      z: random(-2000, 2000),
      size: random(1, 3)
    });
  }
}

function draw() {
  background(5, 10, 25);
  orbitControl();

  drawStars();
  drawSun();
  drawMoon();

  rotateY(frameCount * 0.002);
  rotateX(frameCount * 0.0015);

  ambientLight(20, 40, 70);
  directionalLight(120, 180, 255, 0.5, 0.8, -1);
  pointLight(100, 160, 255, 0, 0, 300);

  let time = millis() * 0.001;

  beginShape(TRIANGLES);

  for (let i = 0; i < sphereDetail; i++) {
    let lat1 = map(i, 0, sphereDetail, -HALF_PI, HALF_PI);
    let lat2 = map(i + 1, 0, sphereDetail, -HALF_PI, HALF_PI);

    for (let j = 0; j < sphereDetail; j++) {
      let lon1 = map(j, 0, sphereDetail, -PI, PI);
      let lon2 = map(j + 1, 0, sphereDetail, -PI, PI);

      let v1 = getVertex(lat1, lon1, time);
      let v2 = getVertex(lat2, lon1, time);
      let v3 = getVertex(lat2, lon2, time);
      let v4 = getVertex(lat1, lon2, time);

      drawTri(v1, v2, v3);
      drawTri(v1, v3, v4);
    }
  }

  endShape();

  updateRipples();
}

function drawStars() {
  push();
  for (let s of stars) {
    push();
    translate(s.x, s.y, s.z);
    ambientMaterial(255);
    sphere(s.size);
    pop();
  }
  pop();
}

function drawSun() {
  push();
  sunAngle += 0.002;

  let dist = 1000;
  let x = cos(sunAngle) * dist;
  let z = sin(sunAngle) * dist;

  translate(x, 0, z);

  // Bright glowing sun
  emissiveMaterial(255, 180, 50);
  sphere(120);

  // Add glow layers
  for (let i = 1; i <= 3; i++) {
    push();
    scale(1 + i * 0.3);
    emissiveMaterial(255, 140, 30, 80);
    sphere(120);
    pop();
  }

  pop();
}

function drawMoon() {
  push();
  moonAngle += 0.001;

  let dist = 600;
  let x = cos(moonAngle) * dist;
  let z = sin(moonAngle) * dist;

  translate(x, -100, z);

  ambientMaterial(255);
  specularMaterial(255);
  shininess(15);

  sphere(60);

  pop();
}

function drawTri(a, b, c) {
  let n = p5.Vector.cross(
    p5.Vector.sub(b, a),
    p5.Vector.sub(c, a)
  ).normalize();

  ambientMaterial(10, 90, 180);
  specularMaterial(140, 220, 255);
  shininess(40);

  normal(n.x, n.y, n.z);

  vertex(a.x, a.y, a.z);
  vertex(b.x, b.y, b.z);
  vertex(c.x, c.y, c.z);
}

function getVertex(lat, lon, time) {
  let nx = cos(lat) * cos(lon);
  let ny = cos(lat) * sin(lon);
  let nz = sin(lat);

  let n1 = noise(nx * 1.5 + time * 0.3, ny * 1.5, nz * 1.5);
  let n2 = noise(nx * 3.0 - time * 0.2, ny * 3.0, nz * 3.0);
  let n3 = noise(nx * 6.0, ny * 6.0 + time * 0.4, nz * 6.0);

  let displacement = map(n1, 0, 1, -6, 6)
                   + map(n2, 0, 1, -3, 3)
                   + map(n3, 0, 1, -2, 2);

  for (let r of ripples) {
    let d = distOnSphere(lat, lon, r.lat, r.lon);
    let wave = sin(d * r.frequency - r.phase);
    let envelope = exp(-d * r.falloff);
    displacement += r.amp * wave * envelope;
  }

  let rFinal = radius + displacement;

  return createVector(
    rFinal * nx,
    rFinal * ny,
    rFinal * nz
  );
}

function distOnSphere(lat1, lon1, lat2, lon2) {
  let dLat = lat2 - lat1;
  let dLon = lon2 - lon1;
  return sqrt(dLat * dLat + dLon * dLon);
}

function mousePressed() {
  let lat = map(mouseY, 0, height, -HALF_PI, HALF_PI);
  let lon = map(mouseX, 0, width, -PI, PI);

  for (let i = 0; i < 3; i++) {
    ripples.push({
      lat: lat,
      lon: lon,
      amp: random(20, 35),
      phase: random(0, PI),
      life: 1.0,
      frequency: random(10, 18),
      falloff: random(2.0, 3.5)
    });
  }
}

function updateRipples() {
  for (let r of ripples) {
    r.phase += 0.5;
    r.amp *= 0.94;
    r.life *= 0.95;
  }

  ripples = ripples.filter(r => r.life > 0.05);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}