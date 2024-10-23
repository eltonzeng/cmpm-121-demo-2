import "./style.css";

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
    canvas.style.border = '1px solid black'; // You can add the rest of the styling in CSS
    document.body.appendChild(canvas);

    document.title = APP_NAME;
    app.innerHTML = APP_NAME;
});