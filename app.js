class ColorPicker{
    constructor(){
        // BIND METHOD ENSURE THIS INSIDE HSLCONTRORLS REFERS TO COLOR PICKER INSTANCE (NOT EVENT TARGET)
        this.hslControls = this.hslControls.bind(this);
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
    }


    generateHex(){
    const letters = "0123456789ABCDEF";
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
    }

    let colorPicker = new ColorPicker();


    colorPicker.lockButton.forEach((button, index) => {
        button.addEventListener("click", () => {
            colorPicker.lockColor(index);
        }); 
    })

colorPicker.generateBtn.addEventListener('click', () => {
    colorPicker.randomColors();
  });

colorPicker.sliders.forEach(slider => {
    slider.addEventListener("input", (e) => {
    // ENSURE HSLCONTROLS CALLS COLOR PICKER INSTANCE WITH CORRECT EVEN PARAMETER
        colorPicker.hslControls(e);
    });
});

colorPicker.colorDivs.forEach((colorDiv, index) => {
    colorDiv.addEventListener("change", () => {
        colorPicker.updateTextUI(index);
    });
});

colorPicker.currentHexes.forEach(hex =>{
    hex.addEventListener("click", () => {
        colorPicker.copyToClipboard(hex);
    })
})

colorPicker.popup.addEventListener("transitionend", () => {
    const popupBox = colorPicker.popup.children[0];
    colorPicker.popup.classList.remove("active");
    popupBox.classList.remove("active");
})

colorPicker.adjustButton.forEach((button, index) =>{
    button.addEventListener("click", () =>{
        colorPicker.openAdjustmentPanel(index);
    })
})
colorPicker.closeAdjustments.forEach((button, index) =>{
    button.addEventListener("click", () =>{
        colorPicker.closeAdjustmentsPanael(index);
    })
})



colorPicker.randomColors();
