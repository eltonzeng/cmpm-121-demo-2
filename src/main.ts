import "./style.css";

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
    canvas.style.border = '1px solid black'; // You can add the rest of the styling in CSS
    document.body.appendChild(canvas);

    // Create a "Clear" button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Canvas';
    document.body.appendChild(clearButton);

    document.title = APP_NAME;
    app.innerHTML = APP_NAME;

    // Get 2D drawing context
    const ctx = canvas.getContext('2d')!;
    let isDrawing = false;

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY); // Start the path at mouse position
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY); // Draw a line to the mouse position
            ctx.stroke(); // Actually draw it
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        ctx.closePath(); // Close the path when the mouse is released
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        ctx.closePath(); // Stop drawing if the mouse leaves the canvas
    });

    // Clear button event listener
    clearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    });
});