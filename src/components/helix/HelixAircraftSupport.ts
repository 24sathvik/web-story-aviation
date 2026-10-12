import * as THREE from "three";

/**
 * Procedural 3D Training Aircraft with recognizable twin-engine silhouette,
 * aerodynamic fuselage, glass canopy, spinning prop discs, wingtip nav lights,
 * and illuminated banking flight paths.
 */
export class HelixAircraftSupport {
  public group: THREE.Group;
  private aircraftList: {
    mesh: THREE.Group;
    trail: THREE.Line;
    trailPositions: Float32Array;
    trailGeo: THREE.BufferGeometry;
    flightCurve: THREE.CatmullRomCurve3;
    speed: number;
    phase: number;
  }[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "HelixAircraftSupport";

    // Create 2 deliberate aircraft following distinct flight corridors
    const curve1 = this.createFlightPath(15.5, -28, 28, 2.5, 0);
    const curve2 = this.createFlightPath(18.0, 32, -22, -2.0, Math.PI);

    const ac1 = this.buildAircraft(0xdfbc75); // Gold trim
    const trail1 = this.buildTrail(0xdfbc75);
    this.group.add(ac1);
    this.group.add(trail1.line);

    const ac2 = this.buildAircraft(0x00d2ff); // Cyan trim
    const trail2 = this.buildTrail(0x00d2ff);
    this.group.add(ac2);
    this.group.add(trail2.line);

    this.aircraftList.push({
      mesh: ac1,
      trail: trail1.line,
      trailPositions: trail1.positions,
      trailGeo: trail1.geo,
      flightCurve: curve1,
      speed: 1.0,
      phase: 0.15,
    });

    this.aircraftList.push({
      mesh: ac2,
      trail: trail2.line,
      trailPositions: trail2.positions,
      trailGeo: trail2.geo,
      flightCurve: curve2,
      speed: 0.85,
      phase: 0.65,
    });
  }

  private createFlightPath(
    radius: number,
    yStart: number,
    yEnd: number,
    turns: number,
    phase: number
  ): THREE.CatmullRomCurve3 {
    const points: THREE.Vector3[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const angle = u * Math.PI * 2 * turns + phase;
      const r = radius + Math.sin(u * Math.PI * 4) * 2.0;
      const y = THREE.MathUtils.lerp(yStart, yEnd, u);
      points.push(new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }

  /**
   * Builds recognizable twin-engine trainer aircraft
   */
  private buildAircraft(accentColor: number): THREE.Group {
    const plane = new THREE.Group();

    // Fuselage (Length: 3.8m)
    const fuseGeo = new THREE.ConeGeometry(0.45, 3.8, 12);
    fuseGeo.rotateX(Math.PI * 0.5);
    const planeMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.25,
      clearcoat: 0.5,
    });
    const fuselage = new THREE.Mesh(fuseGeo, planeMat);
    plane.add(fuselage);

    // Glass Canopy Cockpit
    const canopyGeo = new THREE.SphereGeometry(0.32, 12, 12);
    canopyGeo.scale(1, 1.2, 2.2);
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d2ff,
      emissive: 0x002244,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.22, 0.3);
    plane.add(canopy);

    // Main Wings (Wingspan: 4.8m)
    const wingGeo = new THREE.BoxGeometry(4.8, 0.06, 0.85);
    const wing = new THREE.Mesh(wingGeo, planeMat);
    wing.position.set(0, -0.05, 0.2);
    plane.add(wing);

    // Twin Engine Nacelles on wings
    [-1.2, 1.2].forEach((xOff) => {
      const engGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.1, 10);
      engGeo.rotateX(Math.PI * 0.5);
      const nacelle = new THREE.Mesh(engGeo, planeMat);
      nacelle.position.set(xOff, -0.1, 0.3);
      plane.add(nacelle);

      // Spinning propeller disk
      const propGeo = new THREE.CircleGeometry(0.42, 16);
      const propMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(xOff, -0.1, 0.86);
      plane.add(prop);
    });

    // Vertical Stabilizer (Tail fin)
    const finGeo = new THREE.BoxGeometry(0.06, 0.9, 0.7);
    const fin = new THREE.Mesh(finGeo, planeMat);
    fin.position.set(0, 0.45, -1.4);
    plane.add(fin);

    // Horizontal Tailplanes
    const tailGeo = new THREE.BoxGeometry(1.6, 0.05, 0.45);
    const tail = new THREE.Mesh(tailGeo, planeMat);
    tail.position.set(0, 0.25, -1.5);
    plane.add(tail);

    // Navigation Lights: Red port (left), Green starboard (right), White beacon (tail)
    const navGeo = new THREE.SphereGeometry(0.08, 8, 8);

    const portLight = new THREE.Mesh(
      navGeo,
      new THREE.MeshBasicMaterial({ color: 0xff0044 })
    );
    portLight.position.set(-2.4, -0.05, 0.2);
    plane.add(portLight);

    const starLight = new THREE.Mesh(
      navGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ff66 })
    );
    starLight.position.set(2.4, -0.05, 0.2);
    plane.add(starLight);

    const beaconLight = new THREE.Mesh(
      navGeo,
      new THREE.MeshBasicMaterial({ color: accentColor })
    );
    beaconLight.position.set(0, 0.85, -1.4);
    plane.add(beaconLight);

    return plane;
  }

  private buildTrail(color: number) {
    const pointCount = 60;
    const positions = new Float32Array(pointCount * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geo, mat);
    return { line, positions, geo };
  }

  /**
   * Updates aircraft positions along the flight paths coordinated with scroll and time
   */
  public update(progress: number, time: number) {
    this.aircraftList.forEach((ac, idx) => {
      // Position advances with scroll progress + continuous flight time
      const u = (progress * 1.5 + time * 0.04 * ac.speed + ac.phase) % 1.0;
      const point = ac.flightCurve.getPointAt(u);
      const tangent = ac.flightCurve.getTangentAt(u);

      ac.mesh.position.copy(point);

      // Orientation: point aircraft forward along the tangent vector
      const lookTarget = point.clone().add(tangent);
      ac.mesh.lookAt(lookTarget);

      // Natural aerodynamic banking into turns:
      // Compute horizontal curvature to bank wings
      const nextU = (u + 0.02) % 1.0;
      const nextTangent = ac.flightCurve.getTangentAt(nextU);
      const turnRate = tangent.x * nextTangent.z - tangent.z * nextTangent.x;
      ac.mesh.rotateZ(-turnRate * 25.0);

      // Update light trail behind aircraft
      const trailLen = 60;
      for (let i = trailLen - 1; i > 0; i--) {
        ac.trailPositions[i * 3] = ac.trailPositions[(i - 1) * 3];
        ac.trailPositions[i * 3 + 1] = ac.trailPositions[(i - 1) * 3 + 1];
        ac.trailPositions[i * 3 + 2] = ac.trailPositions[(i - 1) * 3 + 2];
      }
      ac.trailPositions[0] = point.x;
      ac.trailPositions[1] = point.y;
      ac.trailPositions[2] = point.z;

      ac.trailGeo.attributes.position.needsUpdate = true;
    });
  }

  public dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
}
