import React, { useState, useEffect , useRef } from 'react';
import { FaPlay, FaDownload   }  from 'react-icons/fa';
import { AiFillAudio   }  from 'react-icons/ai';
import './audio-recorder.css'


function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [savedAudios, setSavedAudios] = useState([]);

  useEffect(() => {
    const storedAudios = JSON.parse(localStorage.getItem('audios')) || [];
    setSavedAudios(storedAudios);
  }, []);

  const mediaRecorderRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.removeEventListener('dataavailable', handleDataAvailable);
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleDataAvailable = event => {
    if (event.data.size > 0) {
      setAudioChunks(prevChunks => [...prevChunks, event.data]);
    }
  };

  const handleSaveAudio = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    setAudioBlob(audioBlob);

    const newSavedAudios = [...savedAudios, audioBlob];
    setSavedAudios(newSavedAudios);

    localStorage.setItem('audios', JSON.stringify(newSavedAudios));

    setAudioChunks([]);
    setAudioBlob(null);
  };

  const handlePlayAudio = audio => {
    const audioUrl = URL.createObjectURL(audio);
    const audioElement = new Audio(audioUrl);
    audioElement.play();
  };
  

  const handleDownloadAudio = audio => {
    const audioUrl = URL.createObjectURL(audio);
    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    downloadLink.download = 'audio.webm';
    downloadLink.click();
  };

  return (
    <div className='top'>
      <button className='audio-recorder-btns audio-recorder-buttons' onClick={startRecording} disabled={recording}>
        <AiFillAudio  />
        Start Recording
      </button>
      <button className='audio-recorder-btns  audio-recorder-buttons' onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <button className=' audio-recorder-btns audio-recorder-buttons' onClick={handleSaveAudio} disabled={!audioChunks.length}>
        Save Audio
      </button>
      <h1>All Audios</h1>
      {savedAudios.map((audio, index) => (
        <div key={index}>
          <button className='audio-recorder-button audio-recorder-buttons' onClick={() => handlePlayAudio(audio)}>
            <FaPlay />
          </button>
          <button className='audio-recorder-button audio-recorder-buttons' onClick={() => handleDownloadAudio(audio)}>
            <FaDownload />
          </button>
        </div>
      ))}
      {audioBlob && (
        <audio controls>
          <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
        </audio>
      )}
    </div>
  );
}

export default AudioRecorder;
