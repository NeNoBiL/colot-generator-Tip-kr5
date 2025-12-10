document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const generateRandomBtn = document.getElementById('generateRandom');
    const randomColorDisplay = document.getElementById('randomColorDisplay');
    const generateSchemeBtn = document.getElementById('generateScheme');
    const schemeDisplay = document.getElementById('schemeDisplay');
    const saveColorBtn = document.getElementById('saveColor');
    const loadColorsBtn = document.getElementById('loadColors');
    const savedColorsContainer = document.getElementById('savedColors');
    const colorPicker = document.getElementById('colorPicker');
    const baseColorInput = document.getElementById('baseColor');
    const colorCountInput = document.getElementById('colorCount');
    const countValue = document.getElementById('countValue');
    const colorNameInput = document.getElementById('colorName');
    const colorHexInput = document.getElementById('colorHex');
    
    // Обновление значения счетчика
    colorCountInput.addEventListener('input', function() {
        countValue.textContent = this.value;
    });
    
    // Синхронизация color picker и текстового поля
    colorPicker.addEventListener('input', function() {
        baseColorInput.value = this.value;
    });
    
    baseColorInput.addEventListener('input', function() {
        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
            colorPicker.value = this.value;
        }
    });
    
    // Генерация случайного цвета
    generateRandomBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/colors/random');
            const data = await response.json();
            
            if (data.success) {
                const color = data.color;
                const colorPreview = randomColorDisplay.querySelector('.color-preview');
                const hexCode = randomColorDisplay.querySelector('.hex-code');
                const rgbCode = randomColorDisplay.querySelector('.rgb-code');
                
                // Обновление отображения
                colorPreview.style.backgroundColor = color.hex;
                hexCode.textContent = color.hex;
                rgbCode.textContent = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                
                // Автозаполнение формы сохранения
                colorHexInput.value = color.hex;
                colorNameInput.value = `Случайный ${color.hex}`;
                
                showNotification('Случайный цвет сгенерирован!', 'success');
            }
        } catch (error) {
            console.error('Ошибка при генерации цвета:', error);
            showNotification('Ошибка при генерации цвета', 'error');
        }
    });
    
    // Генерация цветовой схемы
    generateSchemeBtn.addEventListener('click', async function() {
        const baseColor = baseColorInput.value;
        const colorCount = colorCountInput.value;
        
        try {
            const response = await fetch(`/api/colors/scheme?base=${encodeURIComponent(baseColor)}&count=${colorCount}`);
            const data = await response.json();
            
            if (data.success) {
                schemeDisplay.innerHTML = '';
                
                data.scheme.forEach(color => {
                    const colorElement = document.createElement('div');
                    colorElement.className = 'scheme-color';
                    colorElement.style.backgroundColor = color.hex;
                    colorElement.setAttribute('data-hex', color.hex);
                    colorElement.title = `HEX: ${color.hex}\nRGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`;
                    
                    // При клике на цвет копируем его код
                    colorElement.addEventListener('click', function() {
                        copyToClipboard(color.hex);
                        showNotification(`Цвет ${color.hex} скопирован в буфер`, 'success');
                    });
                    
                    schemeDisplay.appendChild(colorElement);
                });
                
                showNotification(`Цветовая схема из ${colorCount} цветов создана!`, 'success');
            }
        } catch (error) {
            console.error('Ошибка при генерации схемы:', error);
            showNotification('Ошибка при генерации схемы', 'error');
        }
    });
    
    // Сохранение цвета
    saveColorBtn.addEventListener('click', async function() {
        const name = colorNameInput.value.trim();
        const hex = colorHexInput.value.trim();
        
        if (!name) {
            showNotification('Введите название цвета', 'error');
            colorNameInput.focus();
            return;
        }
        
        if (!/^#[0-9A-F]{6}$/i.test(hex)) {
            showNotification('Неверный формат HEX-кода. Используйте формат #RRGGBB', 'error');
            colorHexInput.focus();
            return;
        }
        
        try {
            const response = await fetch('/api/colors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, hex })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(`Цвет "${name}" сохранен!`, 'success');
                colorNameInput.value = '';
                colorHexInput.value = '';
                
                // Загружаем обновленный список цветов
                loadSavedColors();
            } else {
                showNotification(data.error || 'Ошибка при сохранении цвета', 'error');
            }
        } catch (error) {
            console.error('Ошибка при сохранении цвета:', error);
            showNotification('Ошибка при сохранении цвета', 'error');
        }
    });
    
    // Загрузка сохраненных цветов
    loadColorsBtn.addEventListener('click', loadSavedColors);
    
    async function loadSavedColors() {
        try {
            const response = await fetch('/api/colors');
            const data = await response.json();
            
            if (data.success) {
                savedColorsContainer.innerHTML = '';
                
                if (data.colors.length === 0) {
                    savedColorsContainer.innerHTML = '<p>Нет сохраненных цветов</p>';
                    return;
                }
                
                data.colors.forEach(color => {
                    const colorCard = document.createElement('div');
                    colorCard.className = 'color-card';
                    
                    colorCard.innerHTML = `
                        <div class="color-card-preview" style="background-color: ${color.hex};"></div>
                        <div class="color-card-info">
                            <div class="color-card-name">${color.name}</div>
                            <div class="color-card-hex">${color.hex}</div>
                            <button class="btn-copy" data-hex="${color.hex}">Копировать</button>
                            <button class="btn-use" data-hex="${color.hex}">Использовать</button>
                        </div>
                    `;
                    
                    savedColorsContainer.appendChild(colorCard);
                });
                
                // Добавляем обработчики событий для кнопок копирования
                document.querySelectorAll('.btn-copy').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const hex = this.getAttribute('data-hex');
                        copyToClipboard(hex);
                        showNotification(`Цвет ${hex} скопирован в буфер`, 'success');
                    });
                });
                
                // Добавляем обработчики событий для кнопок использования
                document.querySelectorAll('.btn-use').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const hex = this.getAttribute('data-hex');
                        baseColorInput.value = hex;
                        colorPicker.value = hex;
                        showNotification(`Цвет ${hex} выбран как базовый`, 'success');
                    });
                });
                
                showNotification(`Загружено ${data.colors.length} цветов`, 'success');
            }
        } catch (error) {
            console.error('Ошибка при загрузке цветов:', error);
            showNotification('Ошибка при загрузке цветов', 'error');
        }
    }
    
    // Вспомогательные функции
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    function showNotification(message, type) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.animation = 'slideIn 0.3s ease';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#2ecc71';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#e74c3c';
        } else {
            notification.style.backgroundColor = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Добавляем CSS анимации
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Загружаем сохраненные цвета при загрузке страницы
    loadSavedColors();
    
    // Генерируем начальный случайный цвет
    generateRandomBtn.click();
});