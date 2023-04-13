class Odometer {
  constructor(min, max, width, height, orientation, label) {
    this.min = min;
    this.max = max;
    this.width = width;
    this.height = height;
    this.label = label;
    this.orientation = orientation;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height / 1.5;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(width / 2, height / 2);
    this.ctx.rotate(Math.PI);
    this.drawTicks();
    this.drawNeedle(0);
  }

  drawTicks() {
    const tickWidth = 2;
    const bigTickHeight = 10;
    const smallTickHeight = 5;
    const tickCount = 10;
    const tickSpacing = Math.PI / tickCount;
    const gradient = this.ctx.createLinearGradient(
      -this.width / 2,
      0,
      this.width / 2,
      0
    );

    this.ctx.strokeStyle = "#333333";
    for (let i = 0; i <= tickCount * 5; i++) {
      const angle = tickSpacing * (i / 5);
      const x1 = Math.cos(angle) * (this.width / 2 - tickWidth / 2);
      const y1 = Math.sin(angle) * (this.width / 2 - tickWidth / 2);
      const x2 =
        Math.cos(angle) * (this.width / 2 - smallTickHeight - tickWidth / 2);
      const y2 =
        Math.sin(angle) * (this.width / 2 - smallTickHeight - tickWidth / 2);
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    if (this.orientation) {
      gradient.addColorStop(0, "#ff0000");
      gradient.addColorStop(0.5, "#ffff00");
      gradient.addColorStop(1, "#00ff00");
    } else {
      gradient.addColorStop(0, "#00ff00");
      gradient.addColorStop(0.5, "#ffff00");
      gradient.addColorStop(1, "#ff0000");
    }

    this.ctx.lineWidth = tickWidth;

    for (let i = 0; i <= tickCount; i++) {
      const angle = tickSpacing * i;
      const x1 = Math.cos(angle) * (this.width / 2 - tickWidth / 2);
      const y1 = Math.sin(angle) * (this.width / 2 - tickWidth / 2);
      const x2b =
        Math.cos(angle) * (this.width / 2 - bigTickHeight - tickWidth / 2);
      const y2b =
        Math.sin(angle) * (this.width / 2 - bigTickHeight - tickWidth / 2);
      const x2s =
        Math.cos(angle) * (this.width / 2 - smallTickHeight - tickWidth / 2);
      const y2s =
        Math.sin(angle) * (this.width / 2 - smallTickHeight - tickWidth / 2);
      this.ctx.beginPath();
      this.ctx.strokeStyle = gradient;
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2b, y2b);
      this.ctx.stroke();
    }
  }

  drawNeedle(value) {
    this.drawLabel(value);
    const needleWidth = 5;
    const needleHeight = this.height / 2 - 20;
    const angle = ((value - this.min) / (this.max - this.min)) * Math.PI;
    this.ctx.fillStyle = "#ff0000";
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(
      Math.cos(angle) * needleHeight,
      Math.sin(angle) * needleHeight
    );
    this.ctx.lineTo(
      Math.cos(angle + Math.PI / 2) * needleWidth,
      Math.sin(angle + Math.PI / 2) * needleWidth
    );
    this.ctx.lineTo(
      Math.cos(angle - Math.PI / 2) * needleWidth,
      Math.sin(angle - Math.PI / 2) * needleWidth
    );
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawLabel(value) {
    this.ctx.save();
    this.ctx.rotate(Math.PI);
    this.ctx.font = `${this.width / 14}px Arial`;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      this.label + ": " + value.toFixed(2),
      0,
      -this.height / 5
    );
    this.ctx.restore();
  }

  render(value) {
    this.ctx.clearRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    this.drawTicks();
    this.drawNeedle(value);
  }
}
