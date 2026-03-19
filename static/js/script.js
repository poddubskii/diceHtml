        const box = document.getElementById("tableBox");
        const handle = document.getElementById("dragHandle");
        const resize = document.getElementById("resizeHandle");
        const rollButton = document.getElementById("rollButton");
        const dies = document.querySelectorAll(".die");

        let offsetX, offsetY = false;
        let isDown=false;
        let startW, startH, startX, startY, isResize=false;
        const folder = "white"; // Change this to "modern" for modern dice images
        // ---------- LOAD STATE ----------
        const saved = JSON.parse(localStorage.getItem("tableState"));
        if(saved){
            box.style.top = saved.top;
            box.style.left = saved.left;
            box.style.width = saved.width;
            box.style.height = saved.height;
        }

        // ---------- DRAG ----------
        handle.addEventListener("mousedown", e=>{
            isDown = true;
            offsetX = e.clientX - box.offsetLeft;
            offsetY = e.clientY - box.offsetTop;
        });


        document.addEventListener("mouseup", ()=>{
            isDown=false;
            isResize=false;
        // saveState();
        });

        document.addEventListener("mousemove", e=>{
            if(isDown){
                box.style.left = (e.clientX - offsetX) + "px";
                box.style.top  = (e.clientY - offsetY) + "px";
            }

            if(isResize){
                box.style.width  = startW + (e.clientX - startX) + "px";
                box.style.height = startH + (e.clientY - startY) + "px";
            }
        });

        // ---------- RESIZE ----------
        resize.addEventListener("mousedown", e=>{
            isResize = true;
            startW = box.offsetWidth;
            startH = box.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
            e.stopPropagation();
        });

        // ---------- SAVE ----------
        /*function saveState(){
            localStorage.setItem("tableState", JSON.stringify({
                top: box.style.top,
                left: box.style.left,
                width: box.style.width,
                height: box.style.height
            }));
        }*/

        const gameArea = document.getElementById("gameArea");
        let isDragging = false;


        rollButton.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - gameArea.offsetLeft;
            offsetY = e.clientY - gameArea.offsetTop;
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
            gameArea.style.left = (e.clientX - offsetX) + "px";
            gameArea.style.top = (e.clientY - offsetY) + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

        //------------------Roll Button ----------------
        rollButton.addEventListener("click", ()=>{
            rollButton.classList.add("roll");
            setTimeout(() => {
                rollButton.classList.remove("roll");
            }, 200);
            rollDie();


        });

        async function rollDie(){
                var selectedDies = 0;
                dies.forEach(die => {
                    if(die.classList.contains("selected")){
                        selectedDies++;
                    }
                });
                // if (selectedDies.length === 0) return; // No dies selected, do nothing
                const response = await fetch('/api/roll-dice',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ dice: 5-selectedDies })
                });
                const data = await response.json();
                const res = data.results;
                let index = 0;
                let sum=0;
                dies.forEach(die => {
                    if (!die.classList.contains("selected")){
                        let val = res[index];
                        sum += val;
                        let img = document.createElement("img");
                        img.src = `static/img/dice/${folder}/die${val}.png`;
                        img.classList.add("die-img");
                        die.innerHTML = ""; // Clear existing content
                        die.appendChild(img);
                        index++;
                        };
                    });
                const resultMessage = document.getElementById("resultArea");
                resultMessage.textContent = `${sum}`;
        }
dies.forEach(die => {
                    die.addEventListener("click", () => {
                        die.classList.toggle("selected");
                    });
        });