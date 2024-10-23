document.addEventListener("DOMContentLoaded", () => {
    const APP_NAME = "Hello World";
    const app = document.querySelector<HTMLDivElement>("#app")!;

    // Add the app title
    const appTitle = document.createElement('h1');
    appTitle.textContent = 'Digital Content Creation App';
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

    // Arrays to store drawing paths and for undo/redo management
    let drawingPoints: Array<Array<{ x: number, y: number }>> = [];
    let currentPath: Array<{ x: number, y: number }> = [];
    let redoStack: Array<Array<{ x: number, y: number }>> = [];

    // Custom event to notify drawing change
    const dispatchDrawingChangedEvent = () => {
        const event = new CustomEvent('drawing-changed');
        canvas.dispatchEvent(event);
    };

    // Mouse event handlers to track points
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        currentPath = []; // Start a new path for this drawing session
        currentPath.push({ x: e.offsetX, y: e.offsetY });
        dispatchDrawingChangedEvent(); // Notify change
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            currentPath.push({ x: e.offsetX, y: e.offsetY });
            dispatchDrawingChangedEvent(); // Notify change after every new point
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing) {
            drawingPoints.push(currentPath); // Save the current path into drawingPoints
            currentPath = [];
            isDrawing = false;
            redoStack = []; // Clear redo stack when a new drawing is made
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        currentPath = [];
    });

    // Observer for the "drawing-changed" event to redraw the canvas
    canvas.addEventListener('drawing-changed', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Redraw all points from the stored paths
        drawingPoints.forEach(path => {
            if (path.length > 0) {
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);

                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i].x, path[i].y);
                }

                ctx.stroke();
            }
        });

        // Draw the currently active path
        if (currentPath.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentPath[0].x, currentPath[0].y);

            for (let i = 1; i < currentPath.length; i++) {
                ctx.lineTo(currentPath[i].x, currentPath[i].y);
            }

            ctx.stroke();
        }
    });

    // Clear button event listener
    clearButton.addEventListener('click', () => {
        drawingPoints = []; // Clear stored points
        redoStack = [];     // Clear the redo stack
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    });

    // Undo button event listener
    undoButton.addEventListener('click', () => {
        if (drawingPoints.length > 0) {
            const lastPath = drawingPoints.pop(); // Remove the last path
            if (lastPath) {
                redoStack.push(lastPath); // Push it to the redo stack
                dispatchDrawingChangedEvent(); // Notify change and redraw
            }
        }
    });

    // Redo button event listener
    redoButton.addEventListener('click', () => {
        if (redoStack.length > 0) {
            const redoPath = redoStack.pop(); // Remove the last path from redo stack
            if (redoPath) {
                drawingPoints.push(redoPath); // Push it back to the drawing list
                dispatchDrawingChangedEvent(); // Notify change and redraw
            }
        }
    });
});
