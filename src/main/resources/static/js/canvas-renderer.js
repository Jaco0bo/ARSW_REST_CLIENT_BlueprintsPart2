class CanvasRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.drawTransform = null;
        this.blueprintManager = null;
    }

    initialize(blueprintManager) {
        this.blueprintManager = blueprintManager;
        this.canvas = document.getElementById("blueprintCanvas");

        if (!this.canvas) {
            console.error("Canvas element not found");
            return;
        }

        this.ctx = this.canvas.getContext("2d");
        this.setupEventListeners();
        this.clearCanvas();
    }

    setupEventListeners() {
        if (!this.canvas) return;

        // Remove existing listeners to prevent duplicates
        this.canvas.removeEventListener("pointerdown", this.handlePointerDown.bind(this));
        this.canvas.removeEventListener("click", this.handlePointerDown.bind(this));

        // Add single event listener
        this.canvas.addEventListener("pointerdown", this.handlePointerDown.bind(this));
    }

    handlePointerDown(e) {
        if (!this.blueprintManager.isCanvasActive || !this.blueprintManager.currentBlueprint) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const point = this.getCanvasCoordinates(e);
        if (point) {
            this.blueprintManager.addPointToCurrentBlueprint(point);
        }
    }

    getCanvasCoordinates(event) {
        if (!this.canvas) return null;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        // Convert to data coordinates if we have a transform
        if (this.drawTransform) {
            const dt = this.drawTransform;
            try {
                const xData = (canvasX - dt.padding) / dt.scale + dt.minX;
                const yData = dt.maxY - (canvasY - dt.padding) / dt.scale;
                return {
                    x: Math.round(xData * 100) / 100,
                    y: Math.round(yData * 100) / 100
                };
            } catch (error) {
                console.error("Coordinate conversion error:", error);
            }
        }

        // Fallback to canvas coordinates
        return {
            x: Math.round(canvasX),
            y: Math.round(canvasY)
        };
    }

    renderPoints(points, blueprintManager) {
        if (!this.canvas || !this.ctx) return;

        this.clearCanvas();

        if (!Array.isArray(points) || points.length === 0) {
            this.drawNoPointsMessage();
            this.drawTransform = null;
            return;
        }

        try {
            this.calculateTransform(points);
            this.drawPolyline(points);
            this.drawPoints(points);
        } catch (error) {
            console.error("Error rendering points:", error);
            this.drawErrorMessage();
        }
    }

    calculateTransform(points) {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const padding = 40;
        const dataW = Math.max((maxX - minX) || 1, 1);
        const dataH = Math.max((maxY - minY) || 1, 1);

        const scaleX = (this.canvas.width - 2 * padding) / dataW;
        const scaleY = (this.canvas.height - 2 * padding) / dataH;
        const scale = Math.min(scaleX, scaleY);

        this.drawTransform = {
            minX, maxX, minY, maxY,
            scale, padding,
            cw: this.canvas.width,
            ch: this.canvas.height
        };
    }

    drawPolyline(points) {
        const mappedPoints = points.map(p => this.mapPoint(p));

        this.ctx.beginPath();
        this.ctx.moveTo(mappedPoints[0].x, mappedPoints[0].y);

        for (let i = 1; i < mappedPoints.length; i++) {
            this.ctx.lineTo(mappedPoints[i].x, mappedPoints[i].y);
        }

        this.ctx.strokeStyle = "#007bff";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawPoints(points) {
        points.forEach((point, index) => {
            const mappedPoint = this.mapPoint(point);

            this.ctx.beginPath();
            this.ctx.arc(mappedPoint.x, mappedPoint.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = index === points.length - 1 ? "#ff0000" : "#ff5722";
            this.ctx.fill();
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    mapPoint(point) {
        if (!this.drawTransform) return point;

        const dt = this.drawTransform;
        const x = (point.x - dt.minX) * dt.scale + dt.padding;
        const y = (dt.maxY - point.y) * dt.scale + dt.padding;

        return { x, y };
    }

    drawNoPointsMessage() {
        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = "#666";
        this.ctx.fillText("No points to draw. Click to add points.", 10, 20);
    }

    drawErrorMessage() {
        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = "red";
        this.ctx.fillText("Error drawing points", 10, 20);
    }

    clearCanvas() {
        if (!this.canvas || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw initial message if canvas is empty
        if (!this.blueprintManager?.isCanvasActive) {
            this.ctx.font = "14px Arial";
            this.ctx.fillStyle = "#666";
            this.ctx.fillText("Select a blueprint to draw or create a new one", 10, 30);
        }
    }
}