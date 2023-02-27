class ColorPicker{
    constructor(){
        this.colorDivs = document.querySelectorAll(".color");
        this.currentHexes = document.querySelectorAll(".color h2");
        this.initialColors;
        this.generateBtn = document.querySelector(".generate");
        this.sliders = document.querySelectorAll('input[type="range"');
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
        this.colorDivs.forEach((div) => {
            const hexText = div.children[0];
            const randomColor = this.generateHex();
    
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
}

let colorPicker = new ColorPicker();
colorPicker.randomColors();