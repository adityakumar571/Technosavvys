// import axios from 'axios';
// import { Platform } from 'react-native';

import axios from 'axios';
import { Platform } from 'react-native';

// ❌ REMOVE THIS - Local IP not accessible from Android Emulator
// const BASE_URL = 'http://192.168.1.53:5000/api';

// ✅ USE THIS - Production Backend URL
const BASE_URL = 'https://technosavvys.onrender.com/api';

console.log('🎯 Using BASE_URL:', BASE_URL);

// 🔹 Simple Upload Function (Same endpoint for Image & Audio)
export const uploadFile = async (filePath, fileType = 'image') => {
  console.log('🚀 UPLOAD START');
  console.log('📂 File Path:', filePath);
  console.log('📱 Platform:', Platform.OS);
  console.log('📄 File Type:', fileType);
  console.log('🎯 BASE_URL:', BASE_URL);

  try {
    // 1️⃣ Check if file exists
    if (!filePath) {
      throw new Error('File path is missing');
    }

    // 2️⃣ Prepare file details
    const fileName = filePath.split('/').pop();
    const extension = fileName.split('.').pop().toLowerCase();
    
    console.log('📄 File Name:', fileName);
    console.log('📄 Extension:', extension);

    // 3️⃣ Determine MIME type based on file extension
    let mimeType = 'application/octet-stream';
    if (fileType === 'audio') {
      if (extension === 'mp3') {
        mimeType = 'audio/mpeg';
      } else if (extension === 'wav') {
        mimeType = 'audio/wav';
      } else if (extension === 'm4a') {
        mimeType = 'audio/mp4';
      } else {
        mimeType = 'audio/mpeg';
      }
    } else if (fileType === 'image') {
      if (extension === 'png') {
        mimeType = 'image/png';
      } else if (extension === 'jpg' || extension === 'jpeg') {
        mimeType = 'image/jpeg';
      } else if (extension === 'gif') {
        mimeType = 'image/gif';
      } else {
        mimeType = 'image/jpeg';
      }
    }
    
    console.log('🎯 MIME Type:', mimeType);

    // 4️⃣ Prepare URI for Android/iOS
    let uri = filePath;
    if (Platform.OS === 'android') {
      // Android needs file:// prefix
      if (!uri.startsWith('file://')) {
        uri = `file://${filePath}`;
      }
    } else if (Platform.OS === 'ios') {
      // iOS needs file:// removed if present
      uri = uri.replace('file://', '');
    }
    
    console.log('🔗 Final URI:', uri);

    // 5️⃣ Create FormData
    const formData = new FormData();
    
    formData.append('file', {
      uri: uri,
      name: fileName,
      type: mimeType,
    });

    console.log('📦 FormData created successfully');

    // 6️⃣ Use SAME endpoint for both Image and Audio
    const endpoint = '/upload/uploadImage';
    const fullUrl = `${BASE_URL}${endpoint}`;
    
    console.log('🎯 Endpoint:', endpoint);
    console.log('🔗 Full URL:', fullUrl);

    // 7️⃣ Make the upload request
    console.log('📤 Sending request...');
    
    const response = await axios.post(fullUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 120000, // 2 minutes for large files
    });

    console.log('✅ UPLOAD SUCCESS!');
    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));

    // 8️⃣ Extract URL from response
    let fileUrl = null;
    
    if (response.data?.success && response.data?.data) {
      // Try different possible response structures
      fileUrl = response.data.data.imageUrl || 
                response.data.data.url || 
                response.data.data.audioUrl ||
                response.data.data.fileUrl ||
                response.data.data;
    } else if (response.data?.data?.imageUrl) {
      fileUrl = response.data.data.imageUrl;
    } else if (response.data?.url) {
      fileUrl = response.data.url;
    } else if (typeof response.data === 'string') {
      fileUrl = response.data;
    }

    console.log('🔗 Final File URL:', fileUrl);
    return fileUrl || response.data;

  } catch (error) {
    console.log('❌ UPLOAD ERROR');
    console.log('═══════════════════════════════════════');
    
    if (error.response) {
      // Server responded but with error
      console.log('📡 Server responded with error:');
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      console.log('   Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      // Request made but NO response received
  
    } else {
      // Something went wrong before request
      console.log('⚠️ Error before request:', error.message);
    }
    
    console.log('🔍 Full Error:', error.toJSON?.() || error);
    console.log('═══════════════════════════════════════');
    
    throw error;
  }
};

// 🔹 Wrapper functions for convenience
export const uploadImage = async (imagePath) => {
  console.log('🖼️ Uploading Image:', imagePath);
  return await uploadFile(imagePath, 'image');
};

export const uploadAudio = async (audioPath) => {
  console.log('🎤 Uploading Audio:', audioPath);
  return await uploadFile(audioPath, 'audio');
};

// 🔹 Test function to check server status
export const testServerConnection = async () => {
  try {
    console.log('🔍 Testing server connection...');
    console.log('🎯 URL:', BASE_URL);
    
    const response = await axios.get(`${BASE_URL}/`, {
      timeout: 10000,
    });
    
    console.log('✅ Server is reachable!');
    console.log('📊 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server connection failed');
    console.log('   Error:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
    }
    
    return false;
  }
};