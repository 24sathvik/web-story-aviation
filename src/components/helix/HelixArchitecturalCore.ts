import * as THREE from "three";

/**
 * Creates the monumental architectural spiral centerpiece
 * Incorporates a sweeping sculptural ribbon band, intertwined luminous flight paths,
 * navigation altitude rings, and glowing edge accents.
 */
export class HelixArchitecturalCore {
  public group: THREE.Group;
  private primaryRibbonMesh: THREE.Mesh;
  private edgeTrimGroup: THREE.Group;
  private spineCoreMesh: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "HelixArchitecturalCore";

    // 1. Build Primary Architectural Sculptural Ribbon (Satin Titanium)
    const { mesh: primaryMesh, edgeGroup } = this.createSculpturalRibbon({
      radius: 13.0,
      radiusEnd: 14.5,
      heightStart: -35.0,
      heightEnd: 35.0,
      turns: 3.2,
      ribbonWidth: 0.75,
      ribbonThickness: 0.12,
      segments: 360,
      color: 0xc9c5bc, // Muted satin-metal / titanium
      emissive: 0x000000,
      roughness: 0.35,
      metalness: 0.88,
    });
    this.primaryRibbonMesh = primaryMesh;
    this.edgeTrimGroup = edgeGroup;
    this.group.add(this.primaryRibbonMesh);
    this.group.add(this.edgeTrimGroup);

    // 2. Central Axis Spine (Extremely thin)
    this.spineCoreMesh = this.createSpineCore();
    this.group.add(this.spineCoreMesh);
  }

  /**
   * Generates a thick sculptural ribbon band using a parametric quad strip
   */
  private createSculpturalRibbon(options: {
    radius: number;
    radiusEnd: number;
    heightStart: number;
    heightEnd: number;
    turns: number;
    ribbonWidth: number;
    ribbonThickness: number;
    segments: number;
    color: number;
    emissive: number;
    roughness: number;
    metalness: number;
    phaseOffset?: number;
  }): { mesh: THREE.Mesh; edgeGroup: THREE.Group } {
    const {
      radius,
      radiusEnd,
      heightStart,
      heightEnd,
      turns,
      ribbonWidth,
      ribbonThickness,
      segments,
      color,
      emissive,
      roughness,
      metalness,
      phaseOffset = 0,
    } = options;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const outerEdgePts: THREE.Vector3[] = [];
    const innerEdgePts: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const angle = u * Math.PI * 2 * turns + phaseOffset;
      const currentRadius = THREE.MathUtils.lerp(radius, radiusEnd, u);
      const currentY = THREE.MathUtils.lerp(heightStart, heightEnd, u);

      // Centerline of ribbon
      const cx = Math.sin(angle) * currentRadius;
      const cz = Math.cos(angle) * currentRadius;

      // Radial outward unit vector
      const rx = Math.sin(angle);
      const rz = Math.cos(angle);

      // Tangent vector along the helix
      const tx = Math.cos(angle);
      const tz = -Math.sin(angle);
      const ty = (heightEnd - heightStart) / (segments * (Math.PI * 2 * turns / segments));

      // Normal perpendicular to ribbon face (slightly tilted toward vertical)
      const nx = -rx * 0.3;
      const ny = 0.95;
      const nz = -rz * 0.3;

      const halfW = ribbonWidth * 0.5;
      const halfT = ribbonThickness * 0.5;

      // 4 corners of ribbon cross section at step i:
      // Outer Top (0), Outer Bottom (1), Inner Top (2), Inner Bottom (3)
      const pOuterTop = new THREE.Vector3(cx + rx * halfW, currentY + halfT, cz + rz * halfW);
      const pOuterBot = new THREE.Vector3(cx + rx * halfW, currentY - halfT, cz + rz * halfW);
      const pInnerTop = new THREE.Vector3(cx - rx * halfW, currentY + halfT, cz - rz * halfW);
      const pInnerBot = new THREE.Vector3(cx - rx * halfW, currentY - halfT, cz - rz * halfW);

      outerEdgePts.push(pOuterTop);
      innerEdgePts.push(pInnerTop);

      // Top face vertices
      positions.push(pOuterTop.x, pOuterTop.y, pOuterTop.z);
      normals.push(nx, ny, nz);
      uvs.push(0, u);

      positions.push(pInnerTop.x, pInnerTop.y, pInnerTop.z);
      normals.push(nx, ny, nz);
      uvs.push(1, u);

      // Bottom face vertices
      positions.push(pOuterBot.x, pOuterBot.y, pOuterBot.z);
      normals.push(-nx, -ny, -nz);
      uvs.push(0, u);

      positions.push(pInnerBot.x, pInnerBot.y, pInnerBot.z);
      normals.push(-nx, -ny, -nz);
      uvs.push(1, u);

      if (i < segments) {
        const base = i * 4;
        // Top face quad (0, 1 -> next step)
        indices.push(base + 0, base + 4, base + 1);
        indices.push(base + 1, base + 4, base + 5);

        // Bottom face quad
        indices.push(base + 2, base + 3, base + 6);
        indices.push(base + 3, base + 7, base + 6);

        // Outer edge quad
        indices.push(base + 0, base + 2, base + 4);
        indices.push(base + 2, base + 6, base + 4);

        // Inner edge quad
        indices.push(base + 1, base + 5, base + 3);
        indices.push(base + 3, base + 5, base + 7);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhysicalMaterial({
      color,
      emissive,
      emissiveIntensity: 0.0,
      roughness,
      metalness,
      clearcoat: 0.1,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Glowing edge lines along the border
    const edgeGroup = new THREE.Group();
    const outerCurve = new THREE.CatmullRomCurve3(outerEdgePts);
    const innerCurve = new THREE.CatmullRomCurve3(innerEdgePts);

    const edgeGeoOuter = new THREE.TubeGeometry(outerCurve, 200, 0.015, 6, false);
    const edgeGeoInner = new THREE.TubeGeometry(innerCurve, 200, 0.015, 6, false);

    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });

    edgeGroup.add(new THREE.Mesh(edgeGeoOuter, edgeMat));
    edgeGroup.add(new THREE.Mesh(edgeGeoInner, edgeMat));

    return { mesh, edgeGroup };
  }

  /**
   * Vertical core beacon spine running down the center
   */
  private createSpineCore(): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(0.04, 0.04, 75, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: 0x000000,
      metalness: 0.9,
      roughness: 0.4,
    });
    const spine = new THREE.Mesh(geo, mat);
    spine.position.y = 0;
    return spine;
  }



  /**
   * Smoothly updates architectural rotation and helical dynamics
   */
  public update(progress: number, time: number) {
    // Subtle architectural base rotation coordinated with user scroll
    // Central spiral turns slightly (30 degrees) across the whole journey
    this.group.rotation.y = progress * 0.55 + Math.sin(time * 0.3) * 0.02;

    // Gentle vertical floating breathe
    this.group.position.y = Math.sin(time * 0.8) * 0.25;
  }

  public dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      } else if (child instanceof THREE.Points) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) (child.material as THREE.Material).dispose();
      }
    });
  }
}
