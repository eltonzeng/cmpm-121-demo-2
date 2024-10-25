document.addEventListener("DOMContentLoaded", () => {
    const APP_NAME = "Sticker Sketchpad";
    const app = document.querySelector<HTMLDivElement>("#app")!;

    const appTitle = document.createElement('h1');
    appTitle.textContent = 'Sticker Sketchpad';
    document.body.appendChild(appTitle);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.style.border = '1px solid black';
    document.body.appendChild(canvas);

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Canvas';
    document.body.appendChild(clearButton);

    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    document.body.appendChild(undoButton);

    const redoButton = document.createElement('button');
    redoButton.textContent = 'Redo';
    document.body.appendChild(redoButton);

    const thinButton = document.createElement('button');
    thinButton.textContent = 'Thin Marker';
    thinButton.classList.add("toolButton");
    document.body.appendChild(thinButton);

    const thickButton = document.createElement('button');
    thickButton.textContent = 'Thick Marker';
    thickButton.classList.add("toolButton");
    document.body.appendChild(thickButton);

    document.title = APP_NAME;
    app.innerHTML = APP_NAME;

    const ctx = canvas.getContext('2d')!;
    let isDrawing = false;
    let markerThickness = 2;

    thinButton.addEventListener('click', () => {
        markerThickness = 2;
        thinButton.classList.add("selectedTool");
        thickButton.classList.remove("selectedTool");
    });

    thickButton.addEventListener('click', () => {
        markerThickness = 6;
        thickButton.classList.add("selectedTool");
        thinButton.classList.remove("selectedTool");
    });

    let drawingCommands: MarkerLine[] = [];
    let redoStack: MarkerLine[] = [];
    let currentCommand: MarkerLine | null = null;
    let toolPreview: ToolPreview | null = null;

    const dispatchDrawingChangedEvent = () => {
        const event = new CustomEvent('drawing-changed');
        canvas.dispatchEvent(event);
    };

    class MarkerLine {
        private points: { x: number; y: number }[];
        private thickness: number;

        constructor(initialX: number, initialY: number, thickness: number) {
            this.points = [{ x: initialX, y: initialY }];
            this.thickness = thickness;
        }

        drag(x: number, y: number) {
            this.points.push({ x, y });
        }

        display(ctx: CanvasRenderingContext2D) {
            ctx.lineWidth = this.thickness;
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.stroke();
        }
    }

    class ToolPreview {
        private x: number;
        private y: number;
        private thickness: number;

        constructor(thickness: number) {
            this.x = 0;
            this.y = 0;
            this.thickness = thickness;
        }

        updatePosition(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        currentCommand = new MarkerLine(e.offsetX, e.offsetY, markerThickness);
        dispatchDrawingChangedEvent();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing && currentCommand) {
            currentCommand.drag(e.offsetX, e.offsetY);
            dispatchDrawingChangedEvent();
        } else if (!isDrawing) {
            if (!toolPreview) {
                toolPreview = new ToolPreview(markerThickness);
            }
            toolPreview.updatePosition(e.offsetX, e.offsetY);
            dispatchToolMovedEvent();
        }
    });

    const dispatchToolMovedEvent = () => {
        const event = new CustomEvent('tool-moved');
        canvas.dispatchEvent(event);
    };

    canvas.addEventListener('mouseup', () => {
        if (isDrawing && currentCommand) {
            drawingCommands.push(currentCommand);
            currentCommand = null;
            redoStack = [];
            isDrawing = false;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        currentCommand = null;
        toolPreview = null;
        dispatchDrawingChangedEvent();
    });

    canvas.addEventListener('drawing-changed', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingCommands.forEach(command => command.display(ctx));
        if (currentCommand) currentCommand.display(ctx);
    });

    canvas.addEventListener('tool-moved', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingCommands.forEach(command => command.display(ctx));
        if (toolPreview && !isDrawing) toolPreview.draw(ctx);
    });

    clearButton.addEventListener('click', () => {
        drawingCommands = [];
        redoStack = [];
        dispatchDrawingChangedEvent();
    });

    undoButton.addEventListener('click', () => {
        if (drawingCommands.length > 0) {
            const lastCommand = drawingCommands.pop();
            if (lastCommand) {
                redoStack.push(lastCommand);
                dispatchDrawingChangedEvent();
            }
        }
    });

    redoButton.addEventListener('click', () => {
        if (redoStack.length > 0) {
            const redoCommand = redoStack.pop();
            if (redoCommand) {
                drawingCommands.push(redoCommand);
                dispatchDrawingChangedEvent();
            }
        }
    });
});
