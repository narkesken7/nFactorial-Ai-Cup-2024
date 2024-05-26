// visionApi.js
import axios from 'axios';

const API_KEY = 'AIzaSyDYiPdZ06LNvnrN9JHChY6TFjIQULMVtoE';
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

export const analyzeImage = async (base64Image) => {
  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image,
        },
        features: [
          {
            type: 'LABEL_DETECTION',
            maxResults: 10,
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(API_URL, requestBody);
    return response.data.responses[0].labelAnnotations;
  } catch (error) {
    console.error('Error calling Google Cloud Vision API:', error);
    throw error;
  }
};
