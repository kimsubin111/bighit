const counters = document.querySelectorAll(".count");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = Number(counter.dataset.target);
                const duration = 2500;
                const startTime = performance.now();

                function update(now) {
                    const progress = Math.min((now - startTime) / duration, 1);

                    const eased = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(target * eased);

                    counter.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = target;
                    }
                }

                requestAnimationFrame(update);

                observer.unobserve(counter);
            }
        });
    },
    {
        threshold: 0.5,
    },
);

counters.forEach((counter) => {
    observer.observe(counter);
});
const headerNav = document.querySelector(".header_nav");
const headerToggle = document.querySelector("#headerToggle");

headerToggle.addEventListener("click", () => {
    headerNav.classList.toggle("show");
});
