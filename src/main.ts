document.addEventListener("DOMContentLoaded", () => {
    const APP_NAME = "Sticker Sketchpad";
    const appContainer = document.querySelector<HTMLDivElement>("#app")!;

    const title = document.createElement('h1');
    title.textContent = APP_NAME;
    document.body.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.style.border = '1px solid black';
    document.body.appendChild(canvas);

    const createButton = (text: string, onClick: () => void) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
        button.classList.add('toolButton');
        document.body.appendChild(button);
        return button;
    };

    const clearCanvas = () => {
        drawingCommands = [];
        redoStack = [];
        dispatchCustomEvent('drawing-changed');
    };

    const undoLastAction = () => {
        if (drawingCommands.length > 0) {
            const lastCommand = drawingCommands.pop();
            if (lastCommand) redoStack.push(lastCommand);
            dispatchCustomEvent('drawing-changed');
        }
    };

    const redoLastAction = () => {
        if (redoStack.length > 0) {
            const redoCommand = redoStack.pop();
            if (redoCommand) drawingCommands.push(redoCommand);
            dispatchCustomEvent('drawing-changed');
        }
    };

    const addCustomSticker = () => {
        const customSticker = prompt("Enter your custom sticker:", "🌟");
        if (customSticker) {
            stickers.push(customSticker);
            renderStickerButtons();
        }
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const getRandomRotation = () => Math.floor(Math.random() * 360);

    const selectTool = (tool: 'marker' | 'sticker', thickness?: number, selectedButton?: HTMLButtonElement, otherButton?: HTMLButtonElement) => {
        activeTool = tool;
        if (tool === 'marker' && thickness !== undefined) {
            markerThickness = thickness;
            markerColor = getRandomColor();
            selectedButton?.classList.add("selectedTool");
            otherButton?.classList.remove("selectedTool");
            toolPreview = new ToolPreview(markerThickness, markerColor);
        } else if (tool === 'sticker' && activeSticker) {
            stickerRotation = getRandomRotation();
            toolPreview = new StickerPreview(activeSticker, stickerRotation);
        }
        dispatchCustomEvent('tool-moved');
    };

    const exportHighResolution = () => {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 1024;
        exportCanvas.height = 1024;
        const exportCtx = exportCanvas.getContext('2d')!;

        exportCtx.scale(4, 4);

        drawingCommands.forEach(command => command.draw(exportCtx));

        const anchor = document.createElement("a");
        anchor.href = exportCanvas.toDataURL("image/png");
        anchor.download = "sketchpad.png";
        anchor.click();
    };


    createButton('Clear Canvas', clearCanvas);
    createButton('Undo', undoLastAction);
    createButton('Redo', redoLastAction);
    const thinButton = createButton('Thin Marker', () => selectTool('marker', 4, thinButton, thickButton)); // Adjusted thickness
    const thickButton = createButton('Thick Marker', () => selectTool('marker', 10, thickButton, thinButton)); // Adjusted thickness
    createButton('Add Custom Sticker', addCustomSticker);
    createButton('Export', exportHighResolution);

    thinButton.classList.add("toolButton");
    thickButton.classList.add("toolButton");

    document.title = APP_NAME;
    appContainer.innerHTML = APP_NAME;

    const ctx = canvas.getContext('2d')!;
    let isDrawing = false;
    let markerThickness = 4;
    let markerColor = getRandomColor(); // Start with a random color
    let stickerRotation = getRandomRotation(); // Start with a random rotation
    let activeTool: 'marker' | 'sticker' = 'marker';
    let activeSticker: string | null = null;

    const stickers = ["🥥", "🥭", "🍉"];

    const stickerButtonsContainer = document.createElement('div');
    document.body.appendChild(stickerButtonsContainer);

    const renderStickerButtons = () => {
        stickerButtonsContainer.innerHTML = '';
        stickers.forEach(sticker => {
            createButton(sticker, () => selectSticker(sticker));
        });
    };

    renderStickerButtons();

    let drawingCommands: (MarkerLine | Sticker)[] = [];
    let redoStack: (MarkerLine | Sticker)[] = [];
    let activeLine: MarkerLine | null = null;
    let toolPreview: Preview | null = null;

    const dispatchCustomEvent = (eventType: string) => {
        const event = new CustomEvent(eventType);
        canvas.dispatchEvent(event);
    };

    const selectSticker = (sticker: string) => {
        activeTool = 'sticker';
        activeSticker = sticker;
        stickerRotation = getRandomRotation();
        toolPreview = new StickerPreview(sticker, stickerRotation);
        dispatchCustomEvent('tool-moved');
    };

    interface Preview {
        updatePosition(x: number, y: number): void;
        draw(ctx: CanvasRenderingContext2D): void;
    }

    class MarkerLine {
        private points: { x: number; y: number }[];
        private thickness: number;
        private color: string;

        constructor(initialX: number, initialY: number, thickness: number, color: string) {
            this.points = [{ x: initialX, y: initialY }];
            this.thickness = thickness;
            this.color = color;
        }

        addPoint(x: number, y: number) {
            this.points.push({ x, y });
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.lineWidth = this.thickness;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            this.points.forEach((point, index) => {
                if (index > 0) ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
    }

    class ToolPreview implements Preview {
        protected x: number;
        protected y: number;
        protected thickness: number;
        protected color: string;

        constructor(thickness: number, color: string) {
            this.x = 0;
            this.y = 0;
            this.thickness = thickness;
            this.color = color;
        }

        updatePosition(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    class StickerPreview implements Preview {
        private x: number;
        private y: number;
        private sticker: string;
        private rotation: number;

        constructor(sticker: string, rotation: number) {
            this.x = 0;
            this.y = 0;
            this.sticker = sticker;
            this.rotation = rotation;
        }

        updatePosition(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillText(this.sticker, 0, 0);
            ctx.restore();
        }
    }

    class Sticker {
        private x: number;
        private y: number;
        private sticker: string;
        private rotation: number;

        constructor(x: number, y: number, sticker: string, rotation: number) {
            this.x = x;
            this.y = y;
            this.sticker = sticker;
            this.rotation = rotation;
        }

        reposition(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        if (activeTool === 'marker') {
            isDrawing = true;
            activeLine = new MarkerLine(e.offsetX, e.offsetY, markerThickness, 'red');
            dispatchCustomEvent('drawing-changed');
        } else if (activeTool === 'sticker' && activeSticker) {
            const newSticker = new Sticker(e.offsetX, e.offsetY, activeSticker, 0);
            drawingCommands.push(newSticker);
            redoStack = [];
            dispatchCustomEvent('drawing-changed');
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing && activeLine) {
            activeLine.addPoint(e.offsetX, e.offsetY);
            dispatchCustomEvent('drawing-changed');
        } else if (!isDrawing) {
            if (activeTool === 'marker') {
                if (!toolPreview) toolPreview = new ToolPreview(markerThickness, 'black');
                toolPreview.updatePosition(e.offsetX, e.offsetY);
            } else if (activeTool === 'sticker' && activeSticker) {
                toolPreview = new StickerPreview(activeSticker, 10);
                toolPreview.updatePosition(e.offsetX, e.offsetY);
            }
            dispatchCustomEvent('tool-moved');
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing && activeLine) {
            drawingCommands.push(activeLine);
            activeLine = null;
            redoStack = [];
            isDrawing = false;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        activeLine = null;
        toolPreview = null;
        dispatchCustomEvent('drawing-changed');
    });

    canvas.addEventListener('drawing-changed', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingCommands.forEach(command => command.draw(ctx));
        if (activeLine) activeLine.draw(ctx);
    });

    canvas.addEventListener('tool-moved', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingCommands.forEach(command => command.draw(ctx));
        if (toolPreview && !isDrawing) toolPreview.draw(ctx);
    });
});
