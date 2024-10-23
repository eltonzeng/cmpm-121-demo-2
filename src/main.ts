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

    // Create a "Clear" button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Canvas';
    document.body.appendChild(clearButton);

    // Set document title
    document.title = APP_NAME;
    app.innerHTML = APP_NAME;

    // Get 2D drawing context
    const ctx = canvas.getContext('2d')!;
    let isDrawing = false;

    // Array to store arrays of points for each drawing session
    let drawingPoints: Array<Array<{ x: number, y: number }>> = [];
    let currentPath: Array<{ x: number, y: number }> = [];

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
            drawingPoints.push(currentPath); // Save the path
            currentPath = [];
            isDrawing = false;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        currentPath = [];
    });

    // Clear button event listener
    clearButton.addEventListener('click', () => {
        drawingPoints = []; // Clear stored points
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    });

    // Observer for the "drawing-changed" event
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
});
