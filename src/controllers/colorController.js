// Хранилище цветов (в реальном приложении была бы база данных)
let savedColors = [
  { id: 1, name: 'Ярко-синий', hex: '#1E90FF' },
  { id: 2, name: 'Теплый красный', hex: '#FF6B6B' },
  { id: 3, name: 'Сочный зеленый', hex: '#51CF66' }
];

class ColorController {
  // Генерация случайного цвета
  static generateRandomColor(req, res) {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    res.json({
      success: true,
      color: {
        hex,
        rgb: ColorController.hexToRgb(hex),
        hsl: ColorController.hexToHsl(hex)
      },
      message: 'Случайный цвет успешно сгенерирован'
    });
  }

  // Генерация цветов по схеме
  static generateColorScheme(req, res) {
    const { base } = req.query;
    const count = parseInt(req.query.count) || 5;
    
    let baseHex;
    
    if (base && /^#[0-9A-F]{6}$/i.test(base)) {
      baseHex = base;
    } else {
      baseHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }
    
    const colors = [];
    const baseHsl = ColorController.hexToHsl(baseHex);
    
    for (let i = 0; i < count; i++) {
      const hue = (baseHsl.h + (i * 60)) % 360;
      const hex = ColorController.hslToHex(hue, baseHsl.s, baseHsl.l);
      
      colors.push({
        hex,
        rgb: ColorController.hexToRgb(hex),
        hsl: { h: hue, s: baseHsl.s, l: baseHsl.l }
      });
    }
    
    res.json({
      success: true,
      base: baseHex,
      scheme: colors,
      message: `Цветовая схема из ${count} цветов успешно сгенерирована`
    });
  }

  // Получение всех сохраненных цветов
  static getAllColors(req, res) {
    res.json({
      success: true,
      count: savedColors.length,
      colors: savedColors
    });
  }

  // Сохранение цвета
  static saveColor(req, res) {
    const { name, hex } = req.body;
    
    if (!name || !hex) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать имя и hex-код цвета'
      });
    }
    
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат hex-кода. Используйте формат #RRGGBB'
      });
    }
    
    const newColor = {
      id: savedColors.length > 0 ? Math.max(...savedColors.map(c => c.id)) + 1 : 1,
      name,
      hex: hex.toUpperCase()
    };
    
    savedColors.push(newColor);
    
    res.status(201).json({
      success: true,
      color: newColor,
      message: 'Цвет успешно сохранен'
    });
  }

  // Получение цвета по ID
  static getColorById(req, res) {
    const id = parseInt(req.params.id);
    const color = savedColors.find(c => c.id === id);
    
    if (!color) {
      return res.status(404).json({
        success: false,
        error: `Цвет с ID ${id} не найден`
      });
    }
    
    res.json({
      success: true,
      color: {
        ...color,
        rgb: ColorController.hexToRgb(color.hex),
        hsl: ColorController.hexToHsl(color.hex)
      }
    });
  }

  // Утилитарные методы для преобразования цветов
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static hexToHsl(hex) {
    const rgb = ColorController.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  static hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
}

module.exports = ColorController;