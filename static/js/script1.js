let isRolling = false;

// Создание кубиков при загрузке
document.addEventListener('DOMContentLoaded', () => {
    updateDiceCount();
});

// Обновление количества кубиков на странице
function updateDiceCount() {
    const count = parseInt(document.getElementById('diceCount').value) || 2;
    const container = document.getElementById('diceContainer');
    
    // Ограничиваем количество
    const validCount = Math.min(10, Math.max(1, count));
    if (validCount !== count) {
        document.getElementById('diceCount').value = validCount;
    }
    
    // Создаем кубики
    container.innerHTML = '';
    for (let i = 0; i < validCount; i++) {
        const dice = document.createElement('div');
        dice.className = 'dice';
        dice.id = `dice${i}`;
        dice.textContent = '⚪';
        container.appendChild(dice);
    }
    
    // Обновляем статистику
    document.getElementById('statCount').textContent = validCount;
    document.getElementById('statSides').textContent = 
        document.getElementById('diceSides').value;
}

// Бросок кубиков
async function rollDice() {
    if (isRolling) return;
    
    const rollButton = document.getElementById('rollButton');
    const resultMessage = document.getElementById('resultMessage');
    const totalDiv = document.getElementById('total');
    const statTotal = document.getElementById('statTotal');
    
    // Получаем параметры
    const diceCount = parseInt(document.getElementById('diceCount').value) || 2;
    const diceSides = parseInt(document.getElementById('diceSides').value) || 6;
    
    // Валидация
    const validCount = Math.min(10, Math.max(1, diceCount));
    const validSides = Math.min(100, Math.max(2, diceSides));
    
    if (validCount !== diceCount) {
        document.getElementById('diceCount').value = validCount;
    }
    if (validSides !== diceSides) {
        document.getElementById('diceSides').value = validSides;
    }
    
    try {
        isRolling = true;
        rollButton.disabled = true;
        
        // Обновляем текст кнопки
        rollButton.innerHTML = 'Бросок... <span class="loading"></span>';
        
        // Получаем все кубики
        const diceElements = document.querySelectorAll('.dice');
        
        // Запускаем анимацию для всех кубиков
        diceElements.forEach(dice => {
            dice.classList.add('rolling');
        });
        
        // Меняем значения во время анимации
        const animationInterval = setInterval(() => {
            if (isRolling) {
                diceElements.forEach(dice => {
                    dice.textContent = Math.floor(Math.random() * validSides) + 1;
                });
            }
        }, 50);
        
        // Отправляем запрос на сервер
        const response = await fetch('/api/roll-dice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                count: validCount,
                sides: validSides
            })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        
        const data = await response.json();
        
        // Даем анимации завершиться
        setTimeout(() => {
            clearInterval(animationInterval);
            
            // Устанавливаем реальные значения с сервера
            diceElements.forEach((dice, index) => {
                if (index < data.values.length) {
                    dice.textContent = data.values[index];
                }
                dice.classList.remove('rolling');
            });
            
            // Показываем результаты
            resultMessage.textContent = data.message;
            totalDiv.textContent = `Сумма: ${data.total}`;
            statTotal.textContent = data.total;
            
            // Обновляем статистику
            document.getElementById('statCount').textContent = data.count;
            document.getElementById('statSides').textContent = data.sides;
            
            isRolling = false;
            rollButton.disabled = false;
            rollButton.innerHTML = 'Бросить кубики';
            
        }, 500); // Длительность анимации
        
    } catch (error) {
        console.error('Ошибка:', error);
        resultMessage.textContent = '❌ Произошла ошибка при броске кубиков';
        resultMessage.style.color = 'red';
        totalDiv.textContent = '';
        
        // Показываем ошибку на кубиках
        document.querySelectorAll('.dice').forEach(dice => {
            dice.classList.remove('rolling');
            dice.textContent = '❌';
        });
        
        isRolling = false;
        rollButton.disabled = false;
        rollButton.innerHTML = 'Бросить кубики';
        
        // Сбрасываем ошибку через 3 секунды
        setTimeout(() => {
            resultMessage.style.color = '#333';
            resultMessage.textContent = '👆 Попробуйте снова';
            updateDiceCount();
        }, 3000);
    }
}

// Добавляем эффекты при наведении
document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('dice') && !isRolling) {
        e.target.style.transform = 'scale(1.1)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('dice')) {
        e.target.style.transform = 'scale(1)';
    }
});

// Обновление количества кубиков при изменении
document.getElementById('diceCount').addEventListener('change', updateDiceCount);
document.getElementById('diceSides').addEventListener('change', () => {
    document.getElementById('statSides').textContent = 
        document.getElementById('diceSides').value;
});

// Блокировка ввода некорректных значений
document.getElementById('diceCount').addEventListener('input', function() {
    let value = parseInt(this.value);
    if (value < 1) this.value = 1;
    if (value > 10) this.value = 10;
    updateDiceCount();
});

document.getElementById('diceSides').addEventListener('input', function() {
    let value = parseInt(this.value);
    if (value < 2) this.value = 2;
    if (value > 100) this.value = 100;
    document.getElementById('statSides').textContent = this.value;
});