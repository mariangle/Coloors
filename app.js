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
            this.checkTextContrast(randomColor, hexText);
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
}

let colorPicker = new ColorPicker();
colorPicker.randomColors();