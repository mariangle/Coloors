class ColorPicker {
    constructor() {
      this.colorDivs = document.querySelectorAll(".color");
      this.currentHexes = document.querySelectorAll(".color h2");
      this.initialColors;
      this.generateBtn = document.querySelector(".generate");
      this.sliders = document.querySelectorAll('input[type="range"]');
      this.popup = document.querySelector(".copy-container");
      this.adjustButton = document.querySelectorAll(".adjust");
      this.lockButton = document.querySelectorAll(".lock");
      this.closeAdjustments = document.querySelectorAll(".close-adjustment");
      this.sliderContainers = document.querySelectorAll(".sliders");
      this.savedPalettes = [];
      this.saveBtn = document.querySelector(".save");   
      this.submitSave = document.querySelector(".submit-save");
      this.closeSave = document.querySelector(".close-save");
      this.saveContainer = document.querySelector(".save-container");
      this.saveInput = document.querySelector(".save-container input");
      this.libraryContainer = document.querySelector('.library-container');
      this.libraryBtn = document.querySelector(".library");
      this.closeLibraryBtn = document.querySelector(".close-library");
  
      // BIND METHODS TO ENSURE 'THIS' INSIDE THE METHOD REFERS TO COLORPICKER INSTANCE
      this.hslControls = this.hslControls.bind(this);
      this.lockColor = this.lockColor.bind(this);
      this.randomColors = this.randomColors.bind(this);
      this.copyToClipboard = this.copyToClipboard.bind(this);
      this.openAdjustmentPanel = this.openAdjustmentPanel.bind(this);
      this.closeAdjustmentsPanael = this.closeAdjustmentsPanael.bind(this);
      this.savePalette = this.savePalette.bind(this);
      this.openPalette = this.openPalette.bind(this);
      this.closePalette = this.closePalette.bind(this);
      this.openLibrary = this.openLibrary.bind(this);
      this.closeLibrary = this.closeLibrary.bind(this);
  
      // EVENT LISTENERS
      this.lockButton.forEach((button, index) => {
        button.addEventListener("click", () => {
          this.lockColor(index);
        });
      });
  
      this.generateBtn.addEventListener("click", () => {
        this.randomColors();
      });
  
      this.sliders.forEach((slider) => {
        slider.addEventListener("input", (e) => {
          this.hslControls(e);
        });
      });
  
      this.colorDivs.forEach((colorDiv, index) => {
        colorDiv.addEventListener("change", () => {
          this.updateTextUI(index);
        });
      });
  
      this.currentHexes.forEach((hex) => {
        hex.addEventListener("click", () => {
          this.copyToClipboard(hex);
        });
      });
  
      this.popup.addEventListener("transitionend", () => {
        const popupBox = this.popup.children[0];
        this.popup.classList.remove("active");
        popupBox.classList.remove("active");
      });
  
      this.adjustButton.forEach((button, index) => {
        button.addEventListener("click", () => {
          this.openAdjustmentPanel(index);
        });
      });
  
      this.closeAdjustments.forEach((button, index) => {
        button.addEventListener("click", () => {
          this.closeAdjustmentsPanael(index);
        });
      });
  
      this.saveBtn.addEventListener("click", this.openPalette);
      this.closeSave.addEventListener("click", this.closePalette);
      this.submitSave.addEventListener("click", this.savePalette);
      this.libraryBtn.addEventListener("click", this.openLibrary);
      this.closeLibraryBtn.addEventListener("click", this.closeLibrary);
    }  
    // METHODS
    generateHex(){
    const letters = "0123456789abcdef";
    let hash = '#';
    for(let i = 0; i < 6; i++){
        hash += letters[Math.floor(Math.random()*16)]
    }
    return hash; 
    }  
    randomColors(){
        // INITIAL COLORS
        this.initialColors = [];
        this.colorDivs.forEach((div) => {
            const hexText = div.children[0];
            const randomColor = this.generateHex();
            // ADD TO ARRAY
            if(div.classList.contains("locked")){
                this.initialColors.push(hexText.innerText)
                return;
            }else{
                this.initialColors.push(chroma(randomColor).hex());
            }
            // ADD COLOR TO BACKGROUND
            div.style.backgroundColor = randomColor;
            hexText.innerText = randomColor;
            // CHECK CONTRAST
            this.checkTextContrast(randomColor, hexText);
            // INITIALIZE COLORIZE SLIDERS
            const color = chroma(randomColor);
            const sliders = div.querySelectorAll(".sliders input");
            const hue = sliders[0];
            const brightness = sliders[1];
            const saturation = sliders[2];

            this.colorizeSliders(color, hue, brightness, saturation);
        });
        // RESET INPUTS TO CORRESPONDING ONES
        this.resetInputs();
        // CHECK BUTTON CONTRAST
        this.adjustButton.forEach((button, index) =>{
            this.checkTextContrast(this.initialColors[index], button);
            this.checkTextContrast(this.initialColors[index], this.lockButton[index]);
        })
    }
    checkTextContrast(color,text){
        // USE CHROMA TO GET LUMINANCE VALUE
        const luminance = chroma(color).luminance();
        if(luminance > 0.5)
        {
            text.style.color = "black";
        } else{
            text.style.color = "white";
        }
    }
    colorizeSliders(color, hue, brightness, saturation){
        // SCALE SATURATION
        const noSat = color.set("hsl.s", 0);
        const fullSat = color.set("hsl.s", 1);
        const scaleSat = chroma.scale([noSat,color, fullSat]);

        // SCALE BRIGHTNESS
        const midBright = color.set('hsl.l', 0.5);
        const scaleBright = chroma.scale(["black", midBright, "white"]);

        // UPDATE INPUT OF COLORS
        saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)} )`;
        brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
        hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
    }

    hslControls(e){
        const index = e.target.getAttribute("data-bright") ||  e.target.getAttribute("data-sat") ||  e.target.getAttribute("data-hue");
    
        let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
    
        const bgColor = this.initialColors[index];
    
        let color = chroma(bgColor)
        .set("hsl.s", saturation.value)
        .set("hsl.l", brightness.value)
        .set("hsl.h", hue.value);
    
        this.colorDivs[index].style.backgroundColor = color;
        // COLORIZE SLIDERS / INPUTS
        this.colorizeSliders(color,hue,brightness,saturation);
    
    }
    updateTextUI(index){
        const activeDiv = this.colorDivs[index];
        const color = chroma(activeDiv.style.backgroundColor);
        const textHex = activeDiv.querySelector("h2");
        const icons = activeDiv.querySelectorAll(".controls button");
        textHex.innerText = color.hex();
        // CHECK CONTRAST
        this.checkTextContrast(color, textHex);
        for(let i of icons){
            this.checkTextContrast(color, i);
        }
    }
    resetInputs(){
        const sliders = document.querySelectorAll(".sliders input");
        sliders.forEach(slider => {
            if(slider.name === "hue"){
                const hueColor = this.initialColors[slider.getAttribute("data-hue")];
                const hueValue = chroma(hueColor).hsl()[0]
                slider.value = Math.floor(hueValue);
            }
            if(slider.name === "brightness"){
                const brightColor = this.initialColors[slider.getAttribute("data-bright")];
                const brightValue = chroma(brightColor).hsl()[2]
                slider.value = Math.floor(brightValue * 100) / 100;
            }
            if(slider.name === "saturation"){
                const satColor = this.initialColors[slider.getAttribute("data-sat")];
                const satValue = chroma(satColor).hsl()[1]
                slider.value = Math.floor(satValue * 100) / 100;
            }
        })
    }
    copyToClipboard(hex){
        const el = document.createElement("textarea");
        el.value = hex.innerText;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        // POP UP
        const popupBox = this.popup.children[0]
        this.popup.classList.add("active");
        popupBox.classList.add("active");
    }
    openAdjustmentPanel(index){
        this.sliderContainers[index].classList.toggle("active");
    }
    closeAdjustmentsPanael(index){
        this.sliderContainers[index].classList.remove("active");
    }
    lockColor(index){
        this.colorDivs[index].classList.toggle("locked");
        this.lockButton[index].children[0].classList.toggle("fa-lock-open");
        this.lockButton[index].children[0].classList.toggle("fa-lock");
    }
    openPalette(e){
        const popup = this.saveContainer.children[0];
        this.saveContainer.classList.add("active");
        popup.classList.add("active");
    }
    closePalette(e){
        const popup = this.saveContainer.children[0];
        this.saveContainer.classList.remove("active");
        popup.classList.remove("active");
    }
    savePalette(e){
        this.saveContainer.classList.remove("active");
        this.popup.classList.remove("active");
        const name = this.saveInput.value;
        const colors = [];
        this.currentHexes.forEach(hex => {
            colors.push(hex.innerText);
        });
        // GENERATE OBJECT
        let paletteNr;
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        if(paletteObjects){
            paletteNr = paletteObjects.length;
        } else{
            paletteNr = this.savedPalettes.length; 
        }
        const paletteObj = {name, colors, nr: paletteNr};
        this.savedPalettes.push(paletteObj);
        // SAVE TO LOCAL STORAGE
        this.saveToLocal(paletteObj);
        this.saveInput.value = "";
        // GENERATE PALETTE FOR LIBRARY
        const palette = document.createElement("div");
        palette.classList.add("custom-palette");
        const title = document.createElement("h4");
        title.innerText =  paletteObj.name;
        const preview = document.createElement("div");
        preview.classList.add("small-preview");
        paletteObj.colors.forEach(smallColor =>{
            const smallDiv = document.createElement("div");
            smallDiv.style.backgroundColor = smallColor;
            preview.appendChild(smallDiv);
        });
        const paletteBtn = document.createElement("button");
        paletteBtn.classList.add("pick-palette-btn");
        paletteBtn.classList.add(paletteObj.nr);
        paletteBtn.innerText = "Select";
        // ATTACH EVENT TO BUTTON
        paletteBtn.addEventListener("click", e =>{
            this.closeLibrary();
            const paletteIndex = e.target.classList[1];
            this.initialColors = [];
            this.savedPalettes[paletteIndex].colors.forEach((color, index) =>{
                this.initialColors.push(color);
                this.colorDivs[index].style.backgroundColor = color;
                const text = colorPicker.colorDivs[index].children[0];
                this.checkTextContrast(color, text);
                this.updateTextUI(index);
            });
            this.resetInputs();
        })
        // APPEND TO LIBRARY
        palette.appendChild(title);
        palette.appendChild(preview);
        palette.appendChild(paletteBtn); 
        this.libraryContainer.children[0].appendChild(palette);
    }
    saveToLocal(paletteObj){
        let localPalettes;
        if(localStorage.getItem("palettes") === null){
            localPalettes = [];
        } else{
            localPalettes = JSON.parse(localStorage.getItem("palettes"));
        }
        localPalettes.push(paletteObj);
        localStorage.setItem("palettes", JSON.stringify(localPalettes));
    } 
    openLibrary(){
        const popup = this.libraryContainer.children[0];
        this.libraryContainer.classList.add("active");
        popup.classList.add("active");
    }
    closeLibrary(){
        const popup = this.libraryContainer.children[0];
        this.libraryContainer.classList.remove("active");
        popup.classList.remove("active");
    }
    getLocal(){
        if(localStorage.getItem("palettes") === null){
            this.localPalettes = [];
        } else{
            const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
            this.savedPalettes = [...paletteObjects];
            paletteObjects.forEach(paletteObj =>{
                // GENERATE PALETTE FOR LIBRARY
                const palette = document.createElement("div");
                palette.classList.add("custom-palette");
                const title = document.createElement("h4");
                title.innerText =  paletteObj.name;
                const preview = document.createElement("div");
                preview.classList.add("small-preview");
                paletteObj.colors.forEach(smallColor =>{
                    const smallDiv = document.createElement("div");
                    smallDiv.style.backgroundColor = smallColor;
                    preview.appendChild(smallDiv);
                });
                const paletteBtn = document.createElement("button");
                paletteBtn.classList.add("pick-palette-btn");
                paletteBtn.classList.add(paletteObj.nr);
                paletteBtn.innerText = "Select";
                // ATTACH EVENT TO BUTTON
                paletteBtn.addEventListener("click", e =>{
                    this.closeLibrary();
                    const paletteIndex = e.target.classList[1];
                    this.initialColors = [];
                    paletteObjects[paletteIndex].colors.forEach((color, index) =>{
                        this.initialColors.push(color);
                        this.colorDivs[index].style.backgroundColor = color;
                        const text = this.colorDivs[index].children[0];
                        this.checkTextContrast(color, text);
                        this.updateTextUI(index);
                    });
                    this.resetInputs();
                })
                // APPEND TO LIBRARY
                palette.appendChild(title);
                palette.appendChild(preview);
                palette.appendChild(paletteBtn); 
                this.libraryContainer.children[0].appendChild(palette);
            })
        }
    }    
}

let colorPicker = new ColorPicker();
colorPicker.getLocal();
colorPicker.randomColors();
