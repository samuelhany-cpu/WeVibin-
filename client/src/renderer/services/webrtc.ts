import { socketService } from './socket';

const peerConnections = new Map<string, RTCPeerConnection>();
const audioElements = new Map<string, HTMLAudioElement>();

const configuration: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

let localStream: MediaStream | null = null;
let currentAudioInputId: string | null = null;
let currentAudioOutputId: string | null = null;

export async function initializeWebRTC(audioInputId?: string) {
  try {
    const constraints: MediaStreamConstraints = {
      audio: audioInputId ? { deviceId: { exact: audioInputId } } : true
    };
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (audioInputId) {
      currentAudioInputId = audioInputId;
    }
    console.log('Microphone access granted');
    return true;
  } catch (error) {
    console.error('Failed to get microphone access:', error);
    return false;
  }
}

export async function setAudioInputDevice(deviceId: string | null) {
  currentAudioInputId = deviceId;
  
  // Stop current stream
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  
  // Reinitialize with new device
  await initializeWebRTC(deviceId || undefined);
  
  // Update all peer connections with new track
  if (localStream) {
    const newAudioTrack = localStream.getAudioTracks()[0];
    peerConnections.forEach((pc) => {
      const senders = pc.getSenders();
      const audioSender = senders.find(sender => sender.track?.kind === 'audio');
      if (audioSender && newAudioTrack) {
        audioSender.replaceTrack(newAudioTrack);
      }
    });
  }
}

export async function setAudioOutputDevice(deviceId: string | null) {
  currentAudioOutputId = deviceId;
  
  // Update all audio elements
  audioElements.forEach(async (audioElement) => {
    if ('setSinkId' in audioElement && deviceId) {
      try {
        await (audioElement as any).setSinkId(deviceId);
      } catch (error) {
        console.error('Error setting audio output device:', error);
      }
    }
  });
}

export function getCurrentDevices() {
  return {
    audioInput: currentAudioInputId,
    audioOutput: currentAudioOutputId,
  };
}

export async function createPeerConnection(
  peerId: string,
  initiator: boolean = false
): Promise<RTCPeerConnection> {
  // Close existing connection if any
  closePeerConnection(peerId);

  const pc = new RTCPeerConnection(configuration);

  // Add local audio track
  if (localStream) {
    localStream.getTracks().forEach(track => {
      if (localStream) {
        pc.addTrack(track, localStream);
      }
    });
  }

  // Handle incoming tracks
  pc.ontrack = (event) => {
    console.log('Received remote track from', peerId);
    const audioElement = new Audio();
    audioElement.srcObject = event.streams[0];
    
    // Set output device if configured
    if (currentAudioOutputId && 'setSinkId' in audioElement) {
      (audioElement as any).setSinkId(currentAudioOutputId).catch((err: any) => {
        console.error('Error setting sink ID:', err);
      });
    }
    
    audioElement.play();
    audioElements.set(peerId, audioElement);
  };

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socketService.emit('ice-candidate', {
        to: peerId,
        candidate: event.candidate,
      });
    }
  };

  // Handle connection state changes
  pc.onconnectionstatechange = () => {
    console.log(`Connection state with ${peerId}:`, pc.connectionState);
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      closePeerConnection(peerId);
    }
  };

  peerConnections.set(peerId, pc);

  // If initiator, create and send offer
  if (initiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketService.emit('offer', { to: peerId, offer });
  }

  return pc;
}

export async function handleOffer(peerId: string, offer: RTCSessionDescriptionInit) {
  try {
    let pc = peerConnections.get(peerId);
    if (!pc) {
      pc = await createPeerConnection(peerId, false);
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketService.emit('answer', { to: peerId, answer });
  } catch (error) {
    console.error('Error handling offer:', error);
  }
}

export async function handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
  try {
    const pc = peerConnections.get(peerId);
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Error handling answer:', error);
  }
}

export function handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
  try {
    const pc = peerConnections.get(peerId);
    if (!pc) return;

    pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
}

export function closePeerConnection(peerId: string) {
  const pc = peerConnections.get(peerId);
  if (pc) {
    pc.close();
    peerConnections.delete(peerId);
  }

  const audioElement = audioElements.get(peerId);
  if (audioElement) {
    audioElement.pause();
    audioElement.srcObject = null;
    audioElements.delete(peerId);
  }
}

export function closeAllConnections() {
  peerConnections.forEach((pc, peerId) => {
    closePeerConnection(peerId);
  });
}

export function setMicrophoneEnabled(enabled: boolean) {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
}

export function cleanupWebRTC() {
  closeAllConnections();
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
}
