/**
 * Procedural Canvas Texture Generators for Gully Rush
 * Zero external image dependencies - all generated dynamically!
 */

import * as THREE from 'three';

export class TextureGenerator {
  private static maxAnisotropy: number = 4;

  public static setMaxAnisotropy(val: number) {
    this.maxAnisotropy = Math.max(1, val);
  }

  /**
   * Road asphalt with yellow dashed lane markings and curbs
   */
  public static createRoadTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Asphalt dark slate
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt grain noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(25 + Math.random() * 25);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Lane dividing dashed lines (2 lane dividers separating 3 lanes)
    // Canvas width is mapped across 3 lanes:
    // Left lane boundary at ~170px, Right lane boundary at ~342px
    ctx.strokeStyle = '#facc15'; // Vibrant Mumbai yellow
    ctx.lineWidth = 10;
    ctx.setLineDash([36, 24]);

    // Left dashed divider
    ctx.beginPath();
    ctx.moveTo(170, 0);
    ctx.lineTo(170, 512);
    ctx.stroke();

    // Right dashed divider
    ctx.beginPath();
    ctx.moveTo(342, 0);
    ctx.lineTo(342, 512);
    ctx.stroke();

    // Solid white shoulder edge lines
    ctx.setLineDash([]);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 12;

    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(16, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(496, 0);
    ctx.lineTo(496, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * Shop billboard / awning sign texture
   */
  public static createShopSignTexture(
    shopName: string,
    tagline: string,
    bgColor: string = '#b91c1c',
    textColor: string = '#fef08a'
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 128);

    // Decorative golden border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 488, 104);

    // Text styling
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 38px "Anton", "Arial Black", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    ctx.fillText(shopName, 256, 48);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = 'bold 20px "Outfit", "Arial", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagline, 256, 92);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * Hazard stripes (Police barricade / road safety barrier)
   */
  public static createHazardStripeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Yellow background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 64);

    // Diagonal black stripes
    ctx.fillStyle = '#0f172a';
    const stripeWidth = 24;
    for (let x = -64; x < 320; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x + stripeWidth + 64, 64);
      ctx.lineTo(x + 64, 64);
      ctx.closePath();
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * Gold Rupee Coin (₹) Texture
   */
  public static createCoinTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Outer gold medallion
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, '#fef08a'); // Bright gold highlight
    grad.addColorStop(0.7, '#eab308'); // Rich warm gold
    grad.addColorStop(1, '#a16207'); // Deep burnished edge

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    // Inner embossed ring
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.stroke();

    // Rupee symbol ₹
    ctx.fillStyle = '#713f12';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 54px "Outfit", sans-serif';
    ctx.fillText('₹', 64, 66);

    // Bevel highlight on symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillText('₹', 63, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * BEST Bus Front & Destination Board Texture
   */
  public static createBusFrontTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Crimson red base
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 256, 256);

    // Route Destination Box (Black illuminated LED/paper display)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 20, 216, 60);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 216, 60);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 22px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('123 DADAR -> CST', 128, 56);

    // Large Windshield Glass
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 90, 216, 85);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 90, 216, 85);

    // Chrome Radiator Grille
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, 190, 176, 45);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let y = 195; y < 235; y += 8) {
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.lineTo(211, y);
      ctx.stroke();
    }

    // BEST emblem
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.fillText('★ B.E.S.T. ★', 128, 184);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * Brick wall with colorful Bollywood posters & street graffitis
   */
  public static createBuildingWallTexture(tint: string = '#e2e8f0'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, 256, 256);

    // Brick pattern
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    const rowH = 16;
    const brickW = 32;
    for (let y = 0; y < 256; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();

      const offset = (Math.floor(y / rowH) % 2) * (brickW / 2);
      for (let x = offset; x < 256; x += brickW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    // Retro street poster sticker
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(30, 80, 85, 110);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 80, 85, 110);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 15px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHOLAY', 72, 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Outfit", sans-serif';
    ctx.fillText('HOUSEFULL', 72, 130);

    // Second music/event poster
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(140, 110, 85, 90);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px "Anton", sans-serif';
    ctx.fillText('DHOL NIGHT', 182, 140);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '8px "Outfit", sans-serif';
    ctx.fillText('MUMBAI BEATS', 182, 160);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }
}
