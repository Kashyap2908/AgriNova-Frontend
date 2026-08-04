import axios from 'axios';

// Mock ML API calls for Crop Recommendation
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
    }, 2000);
  });
};

console.log("mlService Loaded");

// ================= Disease Detection =================

export const detectDisease = async (imageFile) => {
  console.log("detectDisease() Called");

  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const token = localStorage.getItem("access_token");

    console.log("JWT Token :", token);

    const response = await axios.post(
      "http://localhost:8000/api/disease/predict/",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Backend Response :", response.data);

    return {
      success: true,
      ...response.data,
    };

  } catch (error) {
    console.error("Disease API Error :", error);

    return {
      success: false,
      error:
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to connect to the prediction server.",
    };
  }
};