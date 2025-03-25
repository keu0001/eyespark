document.addEventListener('DOMContentLoaded', function() {
    // Category tabs functionality
    const categoryTabs = document.querySelectorAll('.category-tab');
    const articleCategories = document.querySelectorAll('.article-category');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all article categories
            articleCategories.forEach(category => category.classList.add('hidden'));
            // Show selected category
            const selectedCategory = document.getElementById(`${tab.dataset.category}-articles`);
            if (selectedCategory) {
                selectedCategory.classList.remove('hidden');
            }
        });
    });

    // Get DOM elements
    const ball = document.getElementById('ball');
    const trainingArea = document.getElementById('training-area');
    const timerElement = document.getElementById('timer');
    const setCounterElement = document.getElementById('set-counter').querySelector('span');
    const restIndicator = document.getElementById('rest-indicator');
    const restTimerElement = document.getElementById('rest-timer');
    const speedControl = document.getElementById('speed-control');
    const patternControl = document.getElementById('pattern-control');
    
    // Article related elements
    const articleModal = document.getElementById('article-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');
    const readMoreButtons = document.querySelectorAll('.read-more');
    
    // Training parameters
    let currentSet = 1;
    const totalSets = 3;
    let trainingTime = 25; // Training time in seconds
    let restTime = 10; // Rest time in seconds
    let timeLeft = trainingTime;
    let isResting = false;
    let animationId = null;
    
    // Ball movement parameters
    let ballX = 50;
    let ballY = 50;
    let targetX, targetY;
    let speedMultiplier = 1; // Speed multiplier
    let currentPattern = 'random';
    let infinityT = 0; // Infinity pattern parameter
    let circleAngle = 0; // Circle pattern parameter
    
    // Initialize ball position
    updateBallPosition();
    
    // Set new target position
    setNewTarget();
    
    // Start training loop
    startTraining();
    
    // Speed control
    speedControl.addEventListener('change', function() {
        switch(this.value) {
            case 'slow':
                speedMultiplier = 0.5;
                break;
            case 'medium':
                speedMultiplier = 1;
                break;
            case 'fast':
                speedMultiplier = 2;
                break;
        }
    });
    
    // Trajectory control
    patternControl.addEventListener('change', function() {
        currentPattern = this.value;
        // Reset parameters
        infinityT = 0;
        circleAngle = 0;
    });
    
    // Article modal related functionality
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article');
            openArticle(articleId);
        });
    });
    
    closeModalBtn.addEventListener('click', function() {
        articleModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    articleModal.addEventListener('click', function(e) {
        if (e.target === articleModal) {
            articleModal.classList.add('hidden');
        }
    });
    
    // Training related functions
    function startTraining() {
        // Start timer
        const timer = setInterval(() => {
            if (isResting) {
                timeLeft--;
                restTimerElement.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    // End rest period
                    isResting = false;
                    restIndicator.classList.add('hidden');
                    timeLeft = trainingTime;
                    
                    // Check if all sets are completed
                    if (currentSet > totalSets) {
                        clearInterval(timer);
                        endTraining();
                        return;
                    }
                    
                    // Start next training set
                    moveBall();
                }
            } else {
                timeLeft--;
                timerElement.textContent = `${timeLeft}s`;
                
                if (timeLeft <= 0) {
                    // End training, start rest
                    isResting = true;
                    cancelAnimationFrame(animationId);
                    restIndicator.classList.remove('hidden');
                    timeLeft = restTime;
                    restTimerElement.textContent = timeLeft;
                    
                    // Update set counter
                    currentSet++;
                    setCounterElement.textContent = Math.min(currentSet, totalSets);
                }
            }
        }, 1000);
        
        // Start ball movement
        moveBall();
    }
    
    function moveBall() {
        // Cancel previous animation
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // Move ball based on selected pattern
        function animate() {
            if (!isResting) {
                switch (currentPattern) {
                    case 'random':
                        moveRandomly();
                        break;
                    case 'infinity':
                        moveInInfinityPattern();
                        break;
                    case 'circle':
                        moveInCirclePattern();
                        break;
                }
                updateBallPosition();
                animationId = requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    function moveRandomly() {
        // Set new target when ball gets close to current target
        const dx = targetX - ballX;
        const dy = targetY - ballY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            setNewTarget();
        }
        
        // Move ball toward target
        ballX += dx * 0.05 * speedMultiplier;
        ballY += dy * 0.05 * speedMultiplier;
    }
    
    function moveInInfinityPattern() {
        // Infinity pattern movement
        const width = trainingArea.clientWidth - ball.clientWidth;
        const height = trainingArea.clientHeight - ball.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        
        infinityT += 0.01 * speedMultiplier;
        
        // Parametric equation: infinity shape
        ballX = centerX + (width / 3) * Math.sin(infinityT);
        ballY = centerY + (height / 4) * Math.sin(2 * infinityT);
    }
    
    function moveInCirclePattern() {
        // Circular movement
        const width = trainingArea.clientWidth - ball.clientWidth;
        const height = trainingArea.clientHeight - ball.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        circleAngle += 0.02 * speedMultiplier;
        
        ballX = centerX + radius * Math.cos(circleAngle);
        ballY = centerY + radius * Math.sin(circleAngle);
    }
    
    function setNewTarget() {
        // Set random target position
        const width = trainingArea.clientWidth - ball.clientWidth;
        const height = trainingArea.clientHeight - ball.clientHeight;
        
        targetX = Math.random() * width;
        targetY = Math.random() * height;
    }
    
    function updateBallPosition() {
        // Update ball CSS position
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
    }
    
    function endTraining() {
        // Show completion message
        timerElement.innerHTML = '<span class="text-[#34C759]">Complete!</span>';
        
        // Create restart button and replace the right controls
        const controlBar = document.getElementById('control-bar');
        const rightControls = controlBar.querySelector('.flex.space-x-2');
        
        rightControls.innerHTML = ''; // Clear existing controls
        
        // Create and add the restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Start New Session';
        restartButton.className = 'mt-4 bg-[#34C759] text-white text-sm rounded-full py-2 px-4 hover:bg-opacity-90 transition-all';
        restartButton.addEventListener('click', function() {
            location.reload();
        });
        
        rightControls.appendChild(restartButton);
    }
    
    // Article content function
    function openArticle(id) {
        const articles = {
            "1": {
                title: "The Science Behind Eye Movement",
                content: `
                    <p>Our eyes are constantly at work, processing visual information from dawn to dusk. Like any other muscle in our body, the muscles surrounding our eyes need regular exercise to maintain their flexibility and functionality.</p>
                    
                    <h4>Why Eye Movement Matters</h4>
                    <ul>
                        <li>Strengthens eye muscles for better visual control</li>
                        <li>Reduces eye fatigue and dryness</li>
                        <li>Improves tracking ability for better reading and sports performance</li>
                        <li>Promotes better blood circulation around the eyes</li>
                    </ul>
                    
                    <p>Regular eye exercises can help reduce the symptoms of Computer Vision Syndrome. Just a few minutes daily can bring long-term benefits to your eye health.</p>
                `
            },
            "2": {
                title: "Digital Eye Strain Solutions",
                content: `
                    <p>In today's digital age, our eyes face unprecedented challenges. The average person spends nearly 7 hours daily looking at screens, putting immense strain on our visual system.</p>
                    
                    <h4>Impact of Digital Devices</h4>
                    <p>Extended screen time can lead to:</p>
                    <ul>
                        <li>Eye dryness and irritation</li>
                        <li>Blurred vision</li>
                        <li>Headaches</li>
                        <li>Poor sleep quality (due to blue light exposure)</li>
                        <li>Increased risk of myopia</li>
                    </ul>
                    
                    <h4>Digital Wellness Strategies</h4>
                    <ul>
                        <li>Follow the 20-20-20 rule</li>
                        <li>Use blue light filters</li>
                        <li>Adjust screen brightness and contrast</li>
                        <li>Maintain proper viewing distance (20-28 inches)</li>
                        <li>Practice regular eye exercises</li>
                        <li>Remember to blink frequently</li>
                    </ul>
                `
            },
            "3": {
                title: "The 20-20-20 Rule",
                content: `
                    <p>The 20-20-20 rule is a scientifically-backed method recommended by eye care professionals to reduce digital eye strain.</p>
                    
                    <h4>Understanding the Rule</h4>
                    <p>The rule is simple:</p>
                    <ul>
                        <li>Every <strong>20 minutes</strong> of screen time</li>
                        <li>Look at something <strong>20 feet</strong> away</li>
                        <li>For at least <strong>20 seconds</strong></li>
                    </ul>
                    
                    <h4>Why It Works</h4>
                    <p>Extended focus on close-up screens causes accommodative eye strain—keeping eye muscles in a constant state of tension. The 20-20-20 rule provides regular intervals for these muscles to relax and recover.</p>
                    
                    <h4>Implementation Tips</h4>
                    <ul>
                        <li>Set regular reminders</li>
                        <li>Use dedicated apps</li>
                        <li>Combine with stretch breaks</li>
                        <li>Look out a window when possible</li>
                    </ul>
                `
            }
        };
        
        modalTitle.textContent = articles[id].title;
        modalContent.innerHTML = articles[id].content;
        articleModal.classList.remove('hidden');
    }
}); 