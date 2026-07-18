document.addEventListener('DOMContentLoaded', () => {
    const bgContainer = document.getElementById('bg-effects');
    if (!bgContainer) return;

    let isLightMode = document.body.classList.contains('light-mode');
    
    // Store generated elements to easily clear them
    let starInterval;
    let shootingStarInterval;

    function initEffects() {
        bgContainer.innerHTML = ''; // Clear existing effects
        clearInterval(starInterval);
        clearInterval(shootingStarInterval);

        if (isLightMode) {
            // Crystal Glass (Aurora effect)
            createAuroras();
        } else {
            // Galaxy (Stars + Shooting Stars)
            createGalaxy();
        }
    }

    function createGalaxy() {
        // Create static/twinkling stars
        const numStars = 100;
        for (let i = 0; i < numStars; i++) {
            createStar();
        }

        // Occasionally spawn shooting stars
        shootingStarInterval = setInterval(() => {
            if (Math.random() > 0.3) { // 70% chance every 2 seconds to spawn one
                createShootingStar();
            }
        }, 2000);
    }

    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position, size, and animation duration
        const size = Math.random() * 2 + 1; // 1px to 3px
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2s to 5s
        star.style.animationDelay = Math.random() * 5 + 's';
        
        bgContainer.appendChild(star);
    }

    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        
        // Start from top-right quadrant mostly
        shootingStar.style.left = (Math.random() * 80 + 20) + 'vw'; 
        shootingStar.style.top = (Math.random() * 40 - 20) + 'vh';
        
        bgContainer.appendChild(shootingStar);
        
        // Remove after animation finishes to prevent memory leak
        setTimeout(() => {
            if (bgContainer.contains(shootingStar)) {
                shootingStar.remove();
            }
        }, 2000);
    }

    function createAuroras() {
        // Create a few large blur circles
        const colors = ['rgba(236, 72, 153, 0.4)', 'rgba(56, 189, 248, 0.4)', 'rgba(167, 139, 250, 0.4)'];
        const numAuroras = 4;
        
        for (let i = 0; i < numAuroras; i++) {
            const aurora = document.createElement('div');
            aurora.classList.add('aurora');
            
            // Random properties
            const size = Math.random() * 200 + 200; // 200px to 400px
            aurora.style.width = size + 'px';
            aurora.style.height = size + 'px';
            aurora.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            aurora.style.left = (Math.random() * 100 - 10) + 'vw';
            aurora.style.top = (Math.random() * 100 - 10) + 'vh';
            aurora.style.animationDuration = (Math.random() * 10 + 15) + 's'; // 15s to 25s
            aurora.style.animationDelay = (Math.random() * -10) + 's'; // Start at different phases
            
            bgContainer.appendChild(aurora);
        }
    }

    // Initialize
    initEffects();

    // Listen for theme changes using a MutationObserver on body class
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const currentLightMode = document.body.classList.contains('light-mode');
                if (currentLightMode !== isLightMode) {
                    isLightMode = currentLightMode;
                    initEffects();
                }
            }
        });
    });

    observer.observe(document.body, { attributes: true });
});
