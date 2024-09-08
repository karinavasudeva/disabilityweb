from gtts import gTTS
import os

def generate_speech(text):
    tts = gTTS(text)
    audio_file = "output.mp3"
    tts.save(audio_file)
    return audio_file