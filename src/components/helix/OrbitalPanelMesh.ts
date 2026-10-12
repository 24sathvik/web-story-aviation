import * as THREE from "three";
import { PanelData, PanelTransformState } from "./HelixChoreography";

/**
 * Creates a substantial, visually dominant 3D content panel with aeronautical casing,
 * ultra-high-resolution canvas texture surface (2560x1600), verified photography,
 * and emissive champagne-gold rim lighting.
 */
export class OrbitalPanelMesh {
  public group: THREE.Group;
  public data: PanelData;
  public index: number;

  private casingMesh: THREE.Mesh;
  private faceMesh: THREE.Mesh;
  private rimMesh: THREE.LineSegments;
  private canvasTexture: THREE.CanvasTexture | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private loadedImage: HTMLImageElement | null = null;
  private faceMaterial: THREE.MeshBasicMaterial;
  private rimMaterial: THREE.MeshBasicMaterial;
  private casingMaterial: THREE.MeshPhysicalMaterial;

  constructor(data: PanelData, index: number) {
    this.data = data;
    this.index = index;
    this.group = new THREE.Group();
    this.group.name = `OrbitalPanel-${data.id}`;

    // Substantial, balanced editorial dimensions (10.2m x 6.4m)
    const width = 10.2;
    const height = 6.4;
    const depth = 0.22;

    // 1. Backing Composite Casing
    const casingGeo = new THREE.BoxGeometry(width, height, depth);
    this.casingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x080d16,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.45,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.98,
    });
    this.casingMesh = new THREE.Mesh(casingGeo, this.casingMaterial);
    this.group.add(this.casingMesh);

    // 2. High-Resolution Dynamic Canvas Texture Surface (Front)
    this.canvas = document.createElement("canvas");
    this.canvas.width = 2560;
    this.canvas.height = 1600;
    this.ctx = this.canvas.getContext("2d");

    // Draw initial placeholder
    this.renderCanvasTexture(null);

    this.canvasTexture = new THREE.CanvasTexture(this.canvas);
    this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
    this.canvasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.canvasTexture.generateMipmaps = true;

    const faceGeo = new THREE.PlaneGeometry(width * 0.985, height * 0.975);
    this.faceMaterial = new THREE.MeshBasicMaterial({
      map: this.canvasTexture,
      transparent: true,
      opacity: 0.98,
      side: THREE.FrontSide,
    });
    this.faceMesh = new THREE.Mesh(faceGeo, this.faceMaterial);
    this.faceMesh.position.z = depth * 0.5 + 0.015;
    this.group.add(this.faceMesh);

    // 3. Glowing Emissive Rim Border
    const rimGeo = new THREE.BoxGeometry(width + 0.15, height + 0.15, depth * 0.7);
    const rimEdges = new THREE.EdgesGeometry(rimGeo);
    this.rimMaterial = new THREE.MeshBasicMaterial({
      color: 0xdfbc75,
      transparent: true,
      opacity: 0.85,
    });
    this.rimMesh = new THREE.LineSegments(rimEdges, this.rimMaterial);
    this.rimMesh.position.z = 0;
    this.group.add(this.rimMesh);

    // 4. Load Verified Aviation Photo
    this.loadImage(data.imagePath);
  }

  private loadImage(url: string) {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      this.loadedImage = img;
      this.renderCanvasTexture(img);
      if (this.canvasTexture) {
        this.canvasTexture.needsUpdate = true;
      }
    };
    img.src = url;
  }

  /**
   * Renders the complete luxury editorial aviation panel onto the offscreen canvas
   */
  private renderCanvasTexture(img: HTMLImageElement | null) {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background base
    ctx.fillStyle = "#060a12";
    ctx.fillRect(0, 0, w, h);

    // If photograph is available, render it covering the right 60% of the card
    if (img) {
      ctx.save();
      const imgX = w * 0.36;
      const imgW = w - imgX;

      // Draw image scaled to cover
      const imgAspect = img.width / img.height;
      const targetAspect = imgW / h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) * 0.5;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) * 0.5;
      }

      ctx.drawImage(img, sx, sy, sw, sh, imgX, 0, imgW, h);

      // Deep cinematic gradient transition from card body into photo
      const gradH = ctx.createLinearGradient(imgX - 80, 0, imgX + 460, 0);
      gradH.addColorStop(0, "#060a12");
      gradH.addColorStop(0.32, "rgba(6, 10, 18, 0.98)");
      gradH.addColorStop(0.72, "rgba(6, 10, 18, 0.55)");
      gradH.addColorStop(1, "rgba(6, 10, 18, 0.12)");
      ctx.fillStyle = gradH;
      ctx.fillRect(imgX - 80, 0, imgW + 80, h);

      // Vignette
      const gradV = ctx.createLinearGradient(0, 0, 0, h);
      gradV.addColorStop(0, "rgba(6, 10, 18, 0.7)");
      gradV.addColorStop(0.2, "transparent");
      gradV.addColorStop(0.8, "transparent");
      gradV.addColorStop(1, "rgba(6, 10, 18, 0.88)");
      ctx.fillStyle = gradV;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else {
      // Tech grid backdrop placeholder
      ctx.strokeStyle = "rgba(0, 210, 255, 0.15)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    }

    // Outer gold frame inside canvas
    ctx.strokeStyle = "rgba(223, 188, 117, 0.45)";
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // Aeronautical HUD Corner Accents
    const cornerSize = 56;
    ctx.strokeStyle = "#dfbc75";
    ctx.lineWidth = 8;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(28, 28 + cornerSize);
    ctx.lineTo(28, 28);
    ctx.lineTo(28 + cornerSize, 28);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - 28 - cornerSize, 28);
    ctx.lineTo(w - 28, 28);
    ctx.lineTo(w - 28, 28 + cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(28, h - 28 - cornerSize);
    ctx.lineTo(28, h - 28);
    ctx.lineTo(28 + cornerSize, h - 28);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - 28 - cornerSize, h - 28);
    ctx.lineTo(w - 28, h - 28);
    ctx.lineTo(w - 28, h - 28 - cornerSize);
    ctx.stroke();

    // Text Content Area (Left 50%)
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // 1. Chapter and Badge Header
    ctx.font = "bold 38px 'Inter', sans-serif";
    ctx.fillStyle = "#dfbc75";
    ctx.fillText(`${this.data.chapter}  //  ${this.data.badge}`, 85, 85);

    // Glowing cyan accent divider line
    const divGrad = ctx.createLinearGradient(85, 0, 920, 0);
    divGrad.addColorStop(0, "#00d2ff");
    divGrad.addColorStop(0.7, "#dfbc75");
    divGrad.addColorStop(1, "transparent");
    ctx.fillStyle = divGrad;
    ctx.fillRect(85, 145, 820, 5);

    // 2. Main Title (Monumental & Bold)
    ctx.font = "900 128px 'Outfit', 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(this.data.title.toUpperCase(), 85, 175);

    // 3. Subtitle
    ctx.font = "600 52px 'Inter', sans-serif";
    ctx.fillStyle = "#38bdf8"; // Sky Blue
    ctx.fillText(this.data.subtitle, 85, 335);

    // 4. Description Paragraph
    ctx.font = "400 38px 'Inter', sans-serif";
    ctx.fillStyle = "#f1f5f9"; // Slate 100
    this.wrapText(ctx, this.data.description, 85, 435, 920, 56);

    // 5. Telemetry / Curriculum Metrics Bar at Bottom
    const boxY = h - 260;
    const boxW = 320;
    const boxH = 165;

    this.data.metrics.forEach((metric, idx) => {
      const boxX = 85 + idx * (boxW + 28);

      // Metric container background
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Label
      ctx.font = "600 24px 'Inter', sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(metric.label.toUpperCase(), boxX + 24, boxY + 26);

      // Value
      ctx.font = "bold 42px 'Outfit', 'Inter', sans-serif";
      ctx.fillStyle = idx === 1 ? "#dfbc75" : "#38bdf8";
      ctx.fillText(metric.value, boxX + 24, boxY + 78);
    });

    // 6. Live Telemetry coordinates stamp in top-right
    ctx.font = "400 26px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "right";
    ctx.fillText(`SYS.ORBIT_POS // ELEV:${this.data.elevationY}m`, w - 85, 85);
    ctx.fillText(`FAA.PART141 // VERIFIED`, w - 85, 124);
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

  /**
   * Updates panel's 3D position, orientation, scale, and lighting based on scroll choreography
   */
  public update(transform: PanelTransformState, _cameraPos: THREE.Vector3) {
    this.group.position.copy(transform.position);
    this.group.rotation.copy(transform.rotation);
    this.group.scale.copy(transform.scale);

    const prom = transform.prominence;

    // Emissive rim glow intensifies when panel is active in front
    if (prom > 0.4) {
      this.rimMaterial.color.setHex(0xdfbc75); // Champagne Gold glow
      this.rimMaterial.opacity = 0.7 + prom * 0.3;
    } else {
      this.rimMaterial.color.setHex(0x00d2ff); // Ambient electric cyan
      this.rimMaterial.opacity = Math.max(0.25, transform.opacity * 0.7);
    }

    // Fade casing and face opacity
    this.faceMaterial.opacity = transform.opacity;
    this.casingMaterial.opacity = Math.min(0.98, transform.opacity);
  }

  public dispose() {
    if (this.canvasTexture) this.canvasTexture.dispose();
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
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
