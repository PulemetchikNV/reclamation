import { ref, onUnmounted } from 'vue';
import { axiosInstance } from '../plugins/axios';
import { convertRequestStateToRefs, getRequestState } from '../utils/requests';

export function useSpeech() {
  const transribeRequestState = ref(getRequestState())
  const synthesizeRequestState = ref(getRequestState())
  const isRecording = ref(false);
  const mediaRecorder = ref<MediaRecorder | null>(null);
  const audioChunks = ref<Blob[]>([]);
  const isVoiceSupported = ref(!!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia);
  
  // Колбэк, который будет вызван при успешной транскрибации
  let onTranscriptionSuccess: ((text: string) => void) | null = null;

  function transcribeSpeech(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return axiosInstance.post('/api/transcription/transcribe', formData);
  }
  
  // Метод для синтеза речи из текста
  const synthesizeSpeech = async (text: string, seed: number = 42) => {
    try {
      synthesizeRequestState.value.isLoading = true;
      synthesizeRequestState.value.isError = null;
      
      const response = await axiosInstance.post('/api/synthesize', { 
        text,
        seed 
      });
      
      synthesizeRequestState.value.isLoading = false;
      return response.data.audioUrl;
    } catch (error) {
      console.error('Ошибка синтеза речи:', error);
      synthesizeRequestState.value.isError = error instanceof Error ? error.message : String(error);
      synthesizeRequestState.value.isLoading = false;
      throw error;
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;
    }
  };

  const startRecording = async (callback?: (text: string) => void) => {
    // Сохраняем колбэк, если он был передан
    if (callback) {
      onTranscriptionSuccess = callback;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.value = [];
      mediaRecorder.value = new MediaRecorder(stream);
      
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data);
        }
      };
      
      mediaRecorder.value.onstop = async () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        let res = await transcribeSpeech([audioFile]);
        
        onTranscriptionSuccess?.(res.data.text)
        
        // Остановить все треки в stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.value.start();
      isRecording.value = true;
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  const toggleVoiceRecording = (callback?: (text: string) => void) => {
    if (isRecording.value) {
      stopRecording();
    } else {
      startRecording(callback);
    }
  };

  onUnmounted(() => {
    if (isRecording.value) {
      stopRecording();
    }
  });

  return {
    isRecording,
    isVoiceSupported,
    toggleVoiceRecording,
    transcribeSpeech,
    synthesizeSpeech,
    ...convertRequestStateToRefs(transribeRequestState.value, 'transribe'),
    ...convertRequestStateToRefs(synthesizeRequestState.value, 'synthesize')
  };
} 