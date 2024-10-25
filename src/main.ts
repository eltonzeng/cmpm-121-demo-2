document.addEventListener("DOMContentLoaded", () => {
    const APP_NAME = "Hello World";
    const app = document.querySelector<HTMLDivElement>("#app")!;

    // Add the app title
    const appTitle = document.createElement('h1');
    appTitle.textContent = 'Sticker Sketchpad';
    document.body.appendChild(appTitle);

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.style.border = '1px solid black';
    document.body.appendChild(canvas);

    // Create "Clear", "Undo", and "Redo" buttons
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Canvas';
    document.body.appendChild(clearButton);

    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    document.body.appendChild(undoButton);

    const redoButton = document.createElement('button');
    redoButton.textContent = 'Redo';
    document.body.appendChild(redoButton);

    // Set document title
    document.title = APP_NAME;
    app.innerHTML = APP_NAME;

    // Get 2D drawing context
    const ctx = canvas.getContext('2d')!;
    let isDrawing = false;

    // Arrays to store command objects and for undo/redo management
    let drawingCommands: MarkerLine[] = [];
    let redoStack: MarkerLine[] = [];
    let currentCommand: MarkerLine | null = null;

    // Custom event to notify drawing change
    const dispatchDrawingChangedEvent = () => {
        const event = new CustomEvent('drawing-changed');
        canvas.dispatchEvent(event);
    };

    // MarkerLine command class
    class MarkerLine {
        private points: { x: number; y: number }[] = [];

        constructor(initialX: number, initialY: number) {
            this.points.push({ x: initialX, y: initialY });
        }

        // Adds a new point to the line
        drag(x: number, y: number) {
            this.points.push({ x, y });
        }

        // Renders the line onto the provided context
        display(ctx: CanvasRenderingContext2D) {
            if (this.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.points[0].x, this.points[0].y);
                for (let i = 1; i < this.points.length; i++) {
                    ctx.lineTo(this.points[i].x, this.points[i].y);
                }
                ctx.stroke();
            }
        }
    }

    // Mouse event handlers to create MarkerLine commands
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        currentCommand = new MarkerLine(e.offsetX, e.offsetY); // Start a new MarkerLine command
        dispatchDrawingChangedEvent();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing && currentCommand) {
            currentCommand.drag(e.offsetX, e.offsetY); // Extend the line
            dispatchDrawingChangedEvent();
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing && currentCommand) {
            drawingCommands.push(currentCommand); // Save the finished command to the display list
            currentCommand = null;
            redoStack = []; // Clear redo stack when a new drawing is made
            isDrawing = false;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        currentCommand = null;
    });

    // Observer for the "drawing-changed" event to redraw the canvas
    canvas.addEventListener('drawing-changed', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Redraw all commands from the drawingCommands array
        drawingCommands.forEach(command => command.display(ctx));

        // Draw the currently active command, if any
        if (currentCommand) {
            currentCommand.display(ctx);
        }
    });

    // Clear button event listener
    clearButton.addEventListener('click', () => {
        drawingCommands = []; // Clear stored commands
        redoStack = [];       // Clear the redo stack
        dispatchDrawingChangedEvent();
    });

    // Undo button event listener
    undoButton.addEventListener('click', () => {
        if (drawingCommands.length > 0) {
            const lastCommand = drawingCommands.pop(); // Remove the last command
            if (lastCommand) {
                redoStack.push(lastCommand); // Push it to the redo stack
                dispatchDrawingChangedEvent(); // Notify change and redraw
            }
        }
    });

    // Redo button event listener
    redoButton.addEventListener('click', () => {
        if (redoStack.length > 0) {
            const redoCommand = redoStack.pop(); // Remove the last command from redo stack
            if (redoCommand) {
                drawingCommands.push(redoCommand); // Push it back to the drawing list
                dispatchDrawingChangedEvent(); // Notify change and redraw
            }
        }
    });
});
