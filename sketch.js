const w = 800,
  h = 800;

const LR_gravity = 6;

//gravity object that houses the gravity vector
const gravity = {
  grav_x: 0,
  grav_y: -9.81, // m/s^2
  calcMag() {
    //calculate the gravity magnitude based on the components
    this.grav_mag = Math.sqrt(
      this.grav_x * this.grav_x + this.grav_y * this.grav_y
    );
  },
};


//uneccessary environment object defining air density, and uses the gravity object
const environment = {
  gravity: gravity,
  air_density: 1.293, // kg/m^3
};

//A pendulum object with a bunch of parameters and state variables.
const pendulum = {
  col: "magenta",
  last_flipped: 0,
  environment: environment,
  restitution: -0.5,
  pivotPoint: [w / 2, 0],
  len: (h * 2) / 3,
  mass: 0.1, // kg
  angle: 0, // radians
  angular_v: 0, // radians/s
  mom_inert: 12, // Moment of inertia, assuming a point mass at the end of the rod
  endpoint: [0, 0],
  maxAngle: Math.PI / 6, // 30 degrees in radians
  lastUpdated: 0,
  air_resistance_coef: 0.2, // Adjust this value for realistic air resistance
  calcEndpoint() {
    //calculates the cartesian endpoint locations of the line representing the pendulum
    let dx = this.len * Math.sin(this.angle);
    let dy = this.len * Math.cos(this.angle);
    this.endpoint[0] = this.pivotPoint[0] + dx;
    this.endpoint[1] = this.pivotPoint[1] + dy;
  },
  draw() {
    //draw the line using its two endpoints
    stroke(this.col);
    strokeWeight(10);
    line(
      this.pivotPoint[0],
      this.pivotPoint[1],
      this.endpoint[0],
      this.endpoint[1]
    );
  },
  randomize() {
    //randomize the starting state of the pendulum
    this.angular_v = -0.5 + Math.random() * 1; // Random angular velocity between -0.5 and 0.5 rad/s
    this.angle = -this.maxAngle + Math.random() * this.maxAngle * 2; // Random angle between -maxAngle and maxAngle
  },
  update() {
    //update the angle and angular velocity, based on air resistance and forces applied on the line
    //need dt to figure out how much velocity has changed since last update
    let currentTime = millis();
    let dt = (currentTime - this.lastUpdated) / 1000; // Convert milliseconds to seconds
    this.lastUpdated = currentTime;

    // Calculate torque based on gravity components and angular acceleration
    let grav_force_x = this.mass * this.environment.gravity.grav_x;
    let grav_force_y = this.mass * this.environment.gravity.grav_y;
    let torque =
      this.len *
      (grav_force_y * Math.sin(this.angle) -
        grav_force_x * Math.cos(this.angle));
    let alpha = torque / this.mom_inert; // Angular acceleration (F=ma, but T=Ia)

    // Update angular velocity and angle
    this.angular_v += alpha * dt;
    this.angle += this.angular_v * dt;

    // Simulate air resistance or other damping effects, proportional to v^2
    let air_resistance_torque = this.air_resistance_coef * this.angular_v * this.angular_v;
    if (this.angular_v > 0) {
      this.angular_v -= air_resistance_torque * dt;
    } else {
      this.angular_v += air_resistance_torque * dt;
    }

    // Ensure pendulum bounces back at the bounds, ensuring this can only happen once every x ms
    if (
      (this.angle >= this.maxAngle || this.angle <= -this.maxAngle) &&
      millis() - this.last_flipped > 100
    ) {
      //if we're at the bounds, reset the angle to the limit
      this.angle = (this.angle / Math.abs(this.angle)) * this.maxAngle;
      //reverse the velocity and reduce it by a little (COR)
      this.angular_v *= this.restitution;
      this.col = "green";
      this.last_flipped = millis();
    } else {
      this.col = "magenta";
    }

    this.calcEndpoint(); // Update the endpoint
  },
};

function setup() {
  frameRate(120)
  createCanvas(w, h);
  gravity.calcMag();
  pendulum.randomize();
  pendulum.calcEndpoint();
  pendulum.lastUpdated = millis(); // Initialize lastUpdated
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function draw() {
  background(220);

  // Update gravity direction based on key input
  if (keyIsDown(LEFT_ARROW)) {
    pendulum.environment.gravity.grav_x = LR_gravity;
    textSize(24);
    text("👈", w / 2, (h * 7) / 8);
  } else if (keyIsDown(RIGHT_ARROW)) {
    textSize(24);
    text("👉", w / 2, (h * 7) / 8);
    pendulum.environment.gravity.grav_x = -LR_gravity;
  } else if (keyIsDown(DOWN_ARROW)) {
    textSize(36);
    text("🌍", (w * getRandomArbitrary(0.98, 1.02)) / 2, (h * 7) / 8);
    pendulum.environment.gravity.grav_y = -20;
  } else if (keyIsDown(UP_ARROW)) {
    //pendulum.maxAngle = 50000;
    pendulum.environment.gravity.grav_y = 9.81;
  } else {
    pendulum.environment.gravity.grav_x = 0;
    pendulum.environment.gravity.grav_y = -9.81;
    pendulum.maxAngle = Math.PI / 6;
    //pendulum.maxAngle = 50000;
  }
  
  if(keyIsDown(32)){
    pendulum.angular_v += getRandomArbitrary(0, 1);
  }
  pendulum.environment.gravity.calcMag(); // Recalculate gravity magnitude

  pendulum.update();
  pendulum.draw();
}
