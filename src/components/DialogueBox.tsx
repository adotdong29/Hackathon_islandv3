import React from 'react';

interface DialogueBoxProps {
  text: string;
  speaker: string;
  onAdvance: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ text, speaker, onAdvance }) => {

  return (
    <div className="dialogue-box" style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '80%',
      textAlign: 'center'
    }}>
      <p><strong>{speaker}:</strong> {text}</p>
      <button onClick={onAdvance} style={{
        marginTop: '8px',
        padding: '8px 16px',
        background: '#0f0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>▶ Next</button>
    </div>
  );
};

export default DialogueBox;
