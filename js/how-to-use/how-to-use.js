document.addEventListener("DOMContentLoaded", function () {
    const howToUseBtn = document.getElementById("howToUseBtn");
    const closeAsideBtn = document.getElementById("closeAsideBtn");
    const asideContainer = document.getElementById("asideContainer"); // Reference to the new container

    howToUseBtn.addEventListener("click", function () {
        asideContainer.classList.add("open"); // Add 'open' to the container
    });

    closeAsideBtn.addEventListener("click", function () {
        asideContainer.classList.remove("open"); // Remove 'open' from the container
    });
});
