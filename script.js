const coupleImg = document.getElementById("img-couple");
const weddingImg = document.getElementById("img-wedding");
const partyImg = document.getElementById("img-party");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  /* HOME + PROFILE */
  if (scrollY < vh * 1.2) {
    coupleImg.style.opacity = "0.25";
    coupleImg.style.transform = "scale(1)";
  } else {
    coupleImg.style.opacity = "0";
  }

  /* WEDDING */
  if (scrollY >= vh * 1.2 && scrollY < vh * 2.4) {
    weddingImg.style.opacity = "0.35";
    weddingImg.style.transform = "scale(1)";
  } else {
    weddingImg.style.opacity = "0";
    weddingImg.style.transform = "scale(0.85)";
  }

  /* RECEPTION (ERASE STYLE) */
  if (scrollY >= vh * 2.4) {
    partyImg.style.opacity = "0.4";
    partyImg.style.transform = "scale(1)";
    partyImg.style.clipPath = "circle(150% at center)";
  } else {
    partyImg.style.opacity = "0";
    partyImg.style.clipPath = "circle(0% at center)";
  }
});
