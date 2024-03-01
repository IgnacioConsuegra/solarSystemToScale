const main = document.getElementById("main");
const canvas = document.getElementById("canvas");


function showCanvas(){
  const time = 2;
  main.style.animation = `opaMain ${time}s 1 forwards`;
  setTimeout(() => {
    main.style.display = "none";
    canvas.style.display = "inline-block";
    canvas.style.animation = `opaCanvas ${time}s 1 forwards`;
  }, time * 1000);
}