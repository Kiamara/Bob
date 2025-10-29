console.log("kms");
const numbers = [10, 3, 15, 8];

const bars = document.getElementById("bars");

for (let i = 0; i < numbers.length; i++) {
  const height = numbers[i];

  const bar = document.createElement("div");
  bar.className = "bar"; 
  bar.style.height = `${height * 20}px`;
  bars.appendChild(bar);
}
