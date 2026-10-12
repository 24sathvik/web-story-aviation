import * as THREE from "three";

/**
 * Creates the deep, rich atmospheric environment:
 * Layered midnight-blue twilight backdrop, volumetric fog, champagne gold & cyan lighting,
 * distant runway navigational beacon grid, and floating atmospheric dust particles.
 */
export class HelixEnvironment {
  public group: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private atmosphericDust: THREE.Points;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = "HelixEnvironment";

    // 1. Scene Fog & Background Atmosphere
    scene.background = new THREE.Color(0x020611); // Deep midnight navy
    scene.fog = new THREE.FogExp2(0x020611, 0.012);

    // 2. Cinematic Three-Point Aeronautical Lighting
    // Soft champagne/neutral key light
    this.keyLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
    this.keyLight.position.set(28, 42, 32);
    this.group.add(this.keyLight);

    // Restrained cool steel-blue rim light
    this.rimLight = new THREE.DirectionalLight(0x7a99b8, 1.2);
    this.rimLight.position.set(-32, 18, -26);
    this.group.add(this.rimLight);

    // Charcoal/graphite fill light from below
    this.fillLight = new THREE.DirectionalLight(0x111b2b, 1.0);
    this.fillLight.position.set(0, -36, 12);
    this.group.add(this.fillLight);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x060c17, 1.5);
    this.group.add(this.ambientLight);

    // 3. Distant Horizon Atmospheric Halo
    const horizonHalo = this.createHorizonAtmosphericHalo();
    this.group.add(horizonHalo);

    // 4. Very subtle Airborne Atmospheric Dust
    this.atmosphericDust = this.createAtmosphericDust();
    this.group.add(this.atmosphericDust);

    scene.add(this.group);
  }



  private createHorizonAtmosphericHalo(): THREE.Mesh {
    // Large hemisphere dome creating soft horizon glow
    const domeGeo = new THREE.SphereGeometry(95, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x040b17,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.2,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = -10;
    return dome;
  }

  private createAtmosphericDust(): THREE.Points {
    const count = 100; // Significantly reduced count
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const dustColor = new THREE.Color(0x4a5a6a); // Faint neutral dust
    const highlightColor = new THREE.Color(0x6b7b8a);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      const c = Math.random() > 0.8 ? highlightColor : dustColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.1, // Much smaller
      vertexColors: true,
      transparent: true,
      opacity: 0.3, // More transparent
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geo, mat);
  }

  public update(time: number) {
    // Subtle breathing drift of atmospheric particles
    const positions = this.atmosphericDust.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(time + i) * 0.008;
    }
    this.atmosphericDust.geometry.attributes.position.needsUpdate = true;
  }

  public dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
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
