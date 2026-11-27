document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // 1. ELEMENTS
    // ========================================

    const contents = document.querySelector("#contents");
    const header = document.querySelector("#contents .contents-header");

    const tabs = document.querySelectorAll(".artist-tab");
    const panels = document.querySelectorAll(".tab-panel");
    const bgTypos = document.querySelectorAll(".tab-panel .bg_typo");

    const waterPosition = document.querySelector("#waterPosition");
    const waterSpread = document.querySelector("#waterSpread");
    const waterShape = document.querySelector("#waterShape");

    if (!contents || !header || !tabs.length || !panels.length) return;

    const headerElements = header.querySelectorAll(
        ".contents-title h1, .filter-label, .artist-tab",
    );

    // ========================================
    // 2. WATER EFFECT
    // ========================================

    const water = {
        x: 0.5,
        y: 0.5,
        scale: 0,
    };

    // SVG 위치와 크기를 즉시 반영
    function updateWaterTransform() {
        if (!waterPosition || !waterSpread) return;

        waterPosition.setAttribute("transform", `translate(${water.x} ${water.y})`);

        waterSpread.setAttribute("transform", `scale(${water.scale})`);
    }

    // ========================================
    // 3. TRANSITION SETTINGS
    // ========================================

    const OUT_DURATION = 0.5;
    const BLACK_DURATION = 0.25;

    const ENTER_Y = 24;
    const EXIT_Y = 24;

    let isSwitching = false;
    let requestedTab = null;

    // ========================================
    // 4. INITIAL STATE
    // ========================================

    let currentPanel = document.querySelector(".tab-panel.active");

    if (!currentPanel) {
        currentPanel = panels[0];
        currentPanel.classList.add("active");
    }

    tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === currentPanel.id);
    });

    gsap.set(headerElements, {
        clearProps: "opacity,visibility,transform",
    });

    // ========================================
    // 5. GET PROJECT TEXT ELEMENTS
    // ========================================

    function getTextElements(panel) {
        return panel.querySelectorAll(".project .number, .project .info, .project .view");
    }

    // ========================================
    // 6. UPDATE ACTIVE TAB
    // ========================================

    function updateActiveTab(panel) {
        tabs.forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.tab === panel.id);
        });
    }

    // ========================================
    // 7. RESET PANEL
    // ========================================

    function resetPanel(panel) {
        const textElements = getTextElements(panel);

        gsap.set(textElements, {
            clearProps: "opacity,visibility,transform",
        });

        gsap.set(panel, {
            clearProps: "opacity,visibility,transform",
        });

        panel.classList.remove("line-leaving", "line-entering");
    }

    // ========================================
    // 8. WATER RESET
    // ========================================

    function hideWater() {
        bgTypos.forEach((bgTypo) => {
            bgTypo.classList.remove("active");
        });

        gsap.to(water, {
            scale: 0,
            duration: 0.4,
            ease: "power2.inOut",
            overwrite: "auto",
        });
    }

    // ========================================
    // 9. TAB TRANSITION
    // ========================================

    function switchTab(nextPanel) {
        if (!nextPanel || nextPanel === currentPanel) return;

        if (isSwitching) {
            requestedTab = nextPanel;
            return;
        }

        isSwitching = true;
        requestedTab = null;

        const oldPanel = currentPanel;
        const oldTextElements = getTextElements(oldPanel);

        const timeline = gsap.timeline({
            onComplete: () => {
                currentPanel = nextPanel;
                isSwitching = false;

                const target = requestedTab;
                requestedTab = null;

                if (target && target !== currentPanel) {
                    switchTab(target);
                }
            },
        });

        // ----------------------------------------
        // STEP 1. OLD SCREEN EXIT
        // ----------------------------------------

        hideWater();

        oldPanel.classList.add("line-leaving");

        timeline.to(
            headerElements,
            {
                autoAlpha: 0,
                y: EXIT_Y,
                duration: OUT_DURATION,
                stagger: 0.025,
                ease: "power2.in",
            },
            0,
        );

        timeline.to(
            oldTextElements,
            {
                autoAlpha: 0,
                y: EXIT_Y,
                duration: OUT_DURATION,
                stagger: 0.025,
                ease: "power2.in",
            },
            0,
        );

        // ----------------------------------------
        // STEP 2. SWITCH PANEL
        // ----------------------------------------

        timeline.add(() => {
            oldPanel.classList.remove("active", "line-leaving");
            resetPanel(oldPanel);

            nextPanel.classList.add("active");

            const newTextElements = getTextElements(nextPanel);

            gsap.set(headerElements, {
                autoAlpha: 0,
                y: ENTER_Y,
            });

            gsap.set(newTextElements, {
                autoAlpha: 0,
                y: ENTER_Y,
            });

            nextPanel.classList.add("line-entering");

            nextPanel.offsetWidth;

            nextPanel.classList.remove("line-entering");

            updateActiveTab(nextPanel);
        });

        // ----------------------------------------
        // STEP 2.5. BLACK SCREEN
        // ----------------------------------------

        timeline.to(
            {},
            {
                duration: BLACK_DURATION,
            },
        );

        // ----------------------------------------
        // STEP 3. NEW SCREEN ENTER
        // ----------------------------------------

        timeline.addLabel("enter");

        // CONTENTS TITLE
        timeline.to(
            headerElements[0],
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                ease: "power3.out",
                clearProps: "opacity,visibility,transform",
            },
            "enter",
        );

        // ARTIST LABEL
        timeline.to(
            headerElements[1],
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                ease: "power3.out",
                clearProps: "opacity,visibility,transform",
            },
            "enter+=0.12",
        );

        // ARTIST TABS
        const tabElements = header.querySelectorAll(".artist-tab");

        timeline.to(
            tabElements,
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: "power3.out",
                clearProps: "opacity,visibility,transform",
            },
            "enter+=0.2",
        );

        // PROJECT TEXT
        const newTextElements = getTextElements(nextPanel);

        timeline.to(
            newTextElements,
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.05,
                ease: "power3.out",
                clearProps: "opacity,visibility,transform",
            },
            "enter+=0.32",
        );
    }

    // ========================================
    // 10. TAB CLICK
    // ========================================

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const targetId = tab.dataset.tab;
            const nextPanel = document.getElementById(targetId);

            if (!nextPanel) return;

            if (isSwitching) {
                requestedTab = nextPanel;
                return;
            }

            if (nextPanel === currentPanel) return;

            switchTab(nextPanel);
        });
    });

    // ========================================
    // 11. WATER MASK MOUSE EFFECT
    // ========================================

    bgTypos.forEach((bgTypo) => {
        const panel = bgTypo.closest(".tab-panel");

        if (!panel) return;

        panel.addEventListener("pointermove", (e) => {
            if (isSwitching || !panel.classList.contains("active")) return;

            const rect = bgTypo.getBoundingClientRect();

            if (!rect.width || !rect.height) return;

            const x = gsap.utils.clamp(0, 1, (e.clientX - rect.left) / rect.width);

            const y = gsap.utils.clamp(0, 1, (e.clientY - rect.top) / rect.height);

            bgTypo.classList.add("active");

            water.x = 0.88 - x * 0.76;
            water.y = 0.75 - y * 0.5;
            water.scale = 1;

            updateWaterTransform();
        });

        panel.addEventListener("pointerleave", () => {
            bgTypo.classList.remove("active");

            gsap.to(water, {
                scale: 0,
                duration: 0.4,
                ease: "power2.inOut",
                overwrite: "auto",
            });
        });
    });

    // ========================================
    // 12. IRREGULAR WATER SHAPE
    // ========================================

    gsap.ticker.add((time) => {
        if (!waterShape || !waterPosition || !waterSpread) return;

        const points = [];
        const pointCount = 24;

        const radiusX = 0.29 * (1 + Math.sin(time * 0.71) * 0.23 + Math.cos(time * 1.37) * 0.12);

        const radiusY = 0.38 * (1 + Math.cos(time * 0.53) * 0.22 + Math.sin(time * 1.11) * 0.14);

        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;

            const wave =
                1 +
                Math.sin(angle * 2 + time * 0.65) * 0.22 +
                Math.cos(angle * 3 - time * 0.83) * 0.25 +
                Math.sin(angle * 5 + time * 1.17) * 0.15 +
                Math.cos(angle * 7 - time * 0.48) * 0.07;

            points.push({
                x: Math.cos(angle) * radiusX * wave,
                y: Math.sin(angle) * radiusY * wave,
            });
        }

        const first = points[0];
        const last = points[points.length - 1];

        let path = `M ${(last.x + first.x) / 2}
                    ${(last.y + first.y) / 2}`;

        points.forEach((point, i) => {
            const next = points[(i + 1) % points.length];

            const midX = (point.x + next.x) / 2;
            const midY = (point.y + next.y) / 2;

            path += ` Q ${point.x} ${point.y} ${midX} ${midY}`;
        });

        path += " Z";

        waterShape.setAttribute("d", path);

        updateWaterTransform();
    });
});
