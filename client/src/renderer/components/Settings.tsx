import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onClose: () => void;
  onDevicesChanged: (audioOutput: string | null, audioInput: string | null) => void;
  currentAudioOutput: string | null;
  currentAudioInput: string | null;
}

export function Settings({ onClose, onDevicesChanged, currentAudioOutput, currentAudioInput }: SettingsProps) {
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string>(currentAudioOutput || 'default');
  const [selectedInputId, setSelectedInputId] = useState<string>(currentAudioInput || 'default');

  useEffect(() => {
    loadDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  const loadDevices = async () => {
    try {
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      setAudioOutputDevices(audioOutputs);
      setAudioInputDevices(audioInputs);
    } catch (error) {
      console.error('Error loading audio devices:', error);
    }
  };

  const handleSave = () => {
    onDevicesChanged(
      selectedOutputId === 'default' ? null : selectedOutputId,
      selectedInputId === 'default' ? null : selectedInputId
    );
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: '#374151',
        }}>
          Audio Settings
        </h2>

        {/* Audio Output Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
          }}>
            Audio Output (Speakers/Headphones)
          </label>
          <select
            value={selectedOutputId}
            onChange={(e) => setSelectedOutputId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
            }}
          >
            <option value="default">System Default</option>
            {audioOutputDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Audio Output ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Input Selection */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
          }}>
            Microphone Input
          </label>
          <select
            value={selectedInputId}
            onChange={(e) => setSelectedInputId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
            }}
          >
            <option value="default">System Default</option>
            {audioInputDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
