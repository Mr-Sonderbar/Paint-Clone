class App {
    #mouseX = 0;
    #mouseY = 0;
    #body = document.getElementById("body");
    #canvas = document.getElementById("canvas");
    /** @type {CanvasRenderingContext2D} */
    #context;
    #boundings;
    #isDrawing = false;
    #penTool;
    #bucketTool;
    #textTool;
    #strokebtn;
    #strokeContainer;
    #selectedStroke = 1;
    #lineWidth = 2;
    #clearBtn;
    #bucketBtn;
    #textBtn;
    #textInput;
    #fontInput;
    #fontSizeInput;
    #saveBtn;
    #penBtn;
    #eraserBtn;
    #rectBtn;
    #lineBtn;
    #color1;
    #color2;
    #selected = 0;
    #activeTool = "pen";
    #middleBox;
    #resizeObserver;

    constructor() {
        this.#context = this.#canvas.getContext("2d");
        this.#canvas.width = window.innerWidth-20;
        this.#canvas.height = window.innerHeight -100;
        this.#boundings = this.#canvas.getBoundingClientRect();

        this.#strokebtn = document.getElementById("stroke-btn");
        this.#strokeContainer = document.getElementById("stroke-dropdown");
        this.#clearBtn = document.getElementById("clear-btn");
        this.#penBtn = document.getElementById("pen-btn");
        this.#eraserBtn = document.getElementById("eraser-btn");
        this.#bucketBtn = document.getElementById("bucket-btn");
        this.#rectBtn = document.getElementById("rect-btn");
        this.#lineBtn = document.getElementById("line-btn");
        this.#textBtn = document.getElementById("text-btn");
        this.#saveBtn = document.getElementById("save-btn");
        this.#textInput = document.getElementById("text-input");
        this.#fontInput = document.getElementById("font-input");
        this.#fontSizeInput = document.getElementById("fontsize-input");
        this.#middleBox = document.getElementById("middle-block");

        this.#color1 = document.getElementById("pen-color1");
        this.#color2 = document.getElementById("pen-color2");

        //set color if input changed or user clicked
        this.#color1.addEventListener("input", () => {
            this.#penTool.setStroke(this.#color1.value);
        })
        this.#color1.addEventListener("click", () => {
            this.#penTool.setStroke(this.#color1.value);
            this.switchSelected(0);
        })

        this.#color2.addEventListener("input", () => {
            this.#penTool.setStroke(this.#color2.value);
        })
        this.#color2.addEventListener("click", () => {
            this.#penTool.setStroke(this.#color2.value);
            this.switchSelected(1);
        })

        // Show Dropdown and update Selected Stroke
        this.#strokebtn.addEventListener("click", () => {
            this.#strokeContainer.classList.toggle("show");
            let searchElements = this.#strokeContainer.children;
            for (let i=0; i < searchElements.length; i++) {
                if (this.#selectedStroke == i) {
                    searchElements[i].classList.add("selected");
                } else {
                    searchElements[i].classList.remove("selected");
                }
            }
            this.updateUI();
        })
        
        this.#penTool = new Pen(this.#context);
        this.#bucketTool = new Bucket();
        this.#textTool = new Text(this.#fontInput.value, this.#fontSizeInput.value);

        this.#resizeObserver = new ResizeObserver(this.outputSize).observe(this.#middleBox);

        this.#bucketTool.setCoord(0, 0);
        this.#bucketTool.draw(this.#canvas, this.#canvas.width, this.#canvas.height, "#ffffff", "#ffffff", this.#lineWidth);

        this.#penTool.setStroke(this.#color1.value); // set color from cache
        
        // Mousedown Event
        this.#canvas.addEventListener("mousedown", () => {
            this.handleMouseDown();
        });

        // Mouseup Event
        this.#canvas.addEventListener("mouseup", () => {
            this.handleMouseUp();
        });

        // Mousemove Event
        this.#canvas.addEventListener("mousemove", event => {
            this.handleMouseMove(event)
        });

        // Click Event
        this.#canvas.addEventListener("click", () => {
            this.handleMouseClick();
        })

        // Contextmenu Event
        this.#canvas.addEventListener("contextmenu", event => {
            this.handleMouseRightClick(event);
        })

        // Pen Button Event
        this.#penBtn.addEventListener("click", () => {
            this.#activeTool = "pen";
            this.#penTool.setStroke(this.#color1.value);
            this.switchSelected(0);
            this.updateUI();
        })

        // Eraser Button Event
        this.#eraserBtn.addEventListener("click", () => {
            this.#activeTool = "eraser";
            this.#penTool.setStroke(this.#color2.value);
            this.switchSelected(1);
            this.updateUI();
        })

        // Clear Button Event
        this.#clearBtn.addEventListener("click", () => {
            this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.updateUI();
        })

        // Bucket Button Event
        this.#bucketBtn.addEventListener("click", () => {
            this.#activeTool = "bucket";
            this.updateUI();
        })

        // Text Button Event
        this.#textBtn.addEventListener("click", () => {
            this.#activeTool = "text";
            this.updateUI();
        })

        // Rect Button Event
        this.#rectBtn.addEventListener("click", () => {
            this.#activeTool = "rect";
            this.updateUI();
        })

        // Line Button Event
        this.#lineBtn.addEventListener("click", () => {
            this.#activeTool = "line";
            this.#penTool.setStroke(this.#color1.value);
            this.updateUI();
        })

        // Save Button Event
        this.#saveBtn.addEventListener("click", () => {
            let imageName = prompt("Please enter a name:");
            let canvasDataURL = this.#canvas.toDataURL();
            let a = document.createElement("a");
            a.href = canvasDataURL;
            a.download = imageName || "Unbennant";
            a.click();
        })

        this.updateUI();
    }

    get mousePos() {
        return [this.#mouseX, this.#mouseY];
    }

    outputSize(){
        this.#canvas.width = this.#middleBox.offsetWidth;
        this.#canvas.height = this.#middleBox.offsetHeight;
        console.log("test");
    }

    handleMouseDown() {
        this.#isDrawing = true;
        this.#context.beginPath();
        switch (this.#activeTool) {
            case "pen":
            case "eraser":
            case "line":
                // this.#context.beginPath();
                this.#context.moveTo(this.#mouseX,this.#mouseY);
                break;
                // this.#context.beginPath();
                // break;
            case "rect":
                this.#bucketTool.setCoord(this.#mouseX, this.#mouseY);
                break;
            default:
                break;
        }
    }

    handleMouseUp() {
        this.#isDrawing = false;
        if (this.#activeTool == "line") {
            this.#penTool.draw(this.#mouseX, this.#mouseY);
        }
        if (this.#activeTool == "rect") {
            this.#bucketTool.draw(this.#canvas, this.#mouseX, this.#mouseY, this.#color2.value, this.#color1.value, this.#lineWidth);
        }
    }

    handleMouseMove(event) {
        this.setMousePos(event);
        if (this.#isDrawing) {
            switch (this.#activeTool) {
                case "pen":
                case "eraser":
                    this.#penTool.draw(this.#mouseX, this.#mouseY);
                    break;
                case "rect":
                    // this.#context.rect(this.#canvas, this.#mouseX, this.#mouseY, this.#color1.value);
                    break;
                default:
                    break;
                    }
        }
        this.updateCoords();
    }

    handleMouseClick() {
        switch (this.#activeTool) {
            case "bucket":
                this.#bucketTool.setCoord(0, 0);
                this.#bucketTool.draw(this.#canvas, this.#canvas.width, this.#canvas.height, this.#color1.value, this.#color1.value, this.#lineWidth);
                break;
            case "text":
                this.#textTool.setFont(this.#fontInput.value);
                this.#textTool.setFontSize(this.#fontSizeInput.value);
                this.#textTool.draw(this.#canvas, this.#textInput.value, this.#mouseX, this.#mouseY, this.#color1.value);
                break;
            default:
                break;
        }
    }

    handleMouseRightClick(event) {
        switch (this.#activeTool) {
            case "bucket":
                this.#bucketTool.setCoord(0, 0);
                this.#bucketTool.draw(this.#canvas, this.#canvas.width, this.#canvas.height, this.#color2.value, this.#color2.value, this.#lineWidth);
                event.preventDefault();
                break;
        
            default:
                break;
        }
    }

    // on Click Event Stroke Dropdown
    handleStrokeDropdown(element) {
        this.#penTool.setWidth(element.textContent);
        this.#lineWidth = element.textContent;
        element.classList.add("selected");
    }

    setMousePos(event) {
        let scaleX = this.#canvas.width / this.#boundings.width,
            scaleY = this.#canvas.height / this.#boundings.height;
        this.#mouseX = (event.clientX - this.#boundings.left) * scaleX;
        this.#mouseY = (event.clientY - this.#boundings.top) * scaleY;
    }

    updateCoords() {
        let p_coords = document.getElementById("coords");    
        p_coords.innerText = `${Math.round(this.#mouseX)}, ${Math.round(this.#mouseY)}px`;
    }

    updateUI() {
        let p_size = document.getElementById("canvas-size");
        p_size.innerText = `${this.#canvas.width} x ${this.#canvas.height}px`;

        // Close the dropdown menu if the user clicks outside of it
        window.onclick = function(event) {
            if (!event.target.matches('.dropbtn')) {
            let dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
                }
            }
            }
        }

        // Toggle Selected Stroke
        let searchElements = this.#strokeContainer.children;
        for (let i=0; i < searchElements.length; i++) {
            searchElements[i].addEventListener("click", () => {
                this.handleStrokeDropdown(searchElements[i]);
                this.#selectedStroke = i;
            })
        }

        let buttons = document.getElementsByClassName("buttons")[0].children;
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove("selected");
        }
        switch (this.#activeTool) {
            case "pen":
                this.#penBtn.classList.add("selected");
                break;
            case "bucket":
                this.#bucketBtn.classList.add("selected");
                break;        
            case "text":
                this.#textBtn.classList.add("selected");
                break;
            case "eraser":
                this.#eraserBtn.classList.add("selected");
                break;
            case "rect":
                this.#rectBtn.classList.add("selected");
                break;
            case "line":
                this.#lineBtn.classList.add("selected");
                break;
            default:
                break;
        }
    }

    switchSelected(button) {
        if (!this.#selected == button) {
            this.#color1.classList.toggle("selected");
            this.#color2.classList.toggle("selected");
            this.#selected = button;
        }
    }
}

class Pen {
    /** @type {CanvasRenderingContext2D} */
    #context;
    
    constructor(context) {   
        this.#context = context;
        this.#context.strokeStyle = "black"; // initial brush color
        this.#context.lineWidth = 2; // initial brush width
    }

    get stroke() {
        return this.#context.strokeStyle;
    }

    get lineWidth() {
        return this.#context.lineWidth;
    }

    setStroke(stroke) {
        this.#context.strokeStyle = stroke;
    }

    setWidth(width) {
        this.#context.lineWidth = width;
    }

    draw(x, y) {
        this.#context.lineTo(x,y);
        this.#context.stroke();
    }
}

class Bucket {
    #x;
    #y;

    setX(x){
        this.#x = x;
    }

    setY(y){
        this.#y = y;
    }

    setCoord(x,y) {
        this.#x = x;
        this.#y = y;
    }

    draw(canvas, x, y, colorFill, colorStroke, lineWidth) {
        let context = canvas.getContext("2d")
        context.lineWidth = lineWidth;
        context.strokeStyle = colorStroke;
        context.fillStyle = colorFill;
        context.rect(this.#x, this.#y, x - this.#x, y - this.#y);
        context.fill();
        context.stroke();
    }
}

class Text {
    #font = "sans serif";
    #fontsize = "10px";

    constructor(font, fontsize) {
        this.#font = font;
        this.#fontsize = fontsize;
    }

    setFont(font) {
        this.#font = font;
    }

    setFontSize(size) {
        this.#fontsize = `${size}px`;
    }

    draw(canvas, text, x, y, color){
        let context = canvas.getContext("2d");
        context.font = `${this.#fontsize} ${this.#font}`;
        context.fillStyle = color;
        context.fillText(text, x, y);
        console.log(`${text}, ${x}, ${y}, ${this.#fontsize} ${this.#font}, ${color}`)
    }
}

var start = function() {
    new App();
}
