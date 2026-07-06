// Mock ML API calls

export const predictCrop = async (features) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock ML Logic based loosely on NPK
      let crop = 'Soybean';
      let confidence = 92;
      
      if (features.N > 80 && features.rainfall > 100) {
        crop = 'Rice';
        confidence = 88;
      } else if (features.K > 50 && features.temperature > 25) {
        crop = 'Cotton';
        confidence = 85;
      } else if (features.P > 50 && features.ph < 6.5) {
        crop = 'Maize';
        confidence = 79;
      }
      
      resolve({
        success: true,
        crop: crop,
        confidence: confidence,
        details: `Based on your soil nutrients (N: ${features.N}, P: ${features.P}, K: ${features.K}) and environmental factors, our XGBoost model recommends planting ${crop}.`
      });
    }, 2000); // 2 second delay to simulate ML inference
  });
};

export const detectDisease = async (imageFile) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a random disease or healthy for mockup
      const outcomes = [
        { disease: 'Healthy', confidence: 98, treatment: 'Your crop is healthy! Maintain current irrigation and fertilizer schedule.' },
        { disease: 'Tomato Blight', confidence: 91, treatment: 'Remove infected leaves immediately. Apply copper-based fungicide.' },
        { disease: 'Powdery Mildew', confidence: 86, treatment: 'Improve air circulation. Apply sulfur or potassium bicarbonate fungicide.' },
        { disease: 'Leaf Rust', confidence: 89, treatment: 'Use rust-resistant varieties next season. Apply systemic fungicide early.' },
      ];
      
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      resolve({
        success: true,
        ...result
      });
    }, 3000); // 3 second delay to simulate image processing model
  });
};
