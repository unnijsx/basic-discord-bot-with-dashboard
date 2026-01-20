import React from 'react';
import styled, { keyframes } from 'styled-components';

const fall = keyframes`
  0% { opacity: 0; top: -10%; transform: translateX(0) rotate(0deg); }
  10% { opacity: 1; }
  20% { transform: translateX(-20px) rotate(45deg); }
  40% { transform: translateX(-20px) rotate(90deg); }
  60% { transform: translateX(-20px) rotate(135deg); }
  80% { transform: translateX(-20px) rotate(180deg); }
  100% { top: 110%; transform: translateX(-20px) rotate(225deg); }
`;

const backFall = keyframes`
  0% { opacity: 0; top: -10%; transform: translateX(0) rotate(0deg); }
  100% { top: 110%; transform: translateX(-20px) rotate(225deg); }
`;

const Petal = styled.div`
  position: fixed;
  top: -10%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: linear-gradient(135deg, #ffb7c5, #ff9eb5);
  border-radius: 100% 0% 100% 0%;
  z-index: 0; /* Behind everything */
  pointer-events: none;
  animation: ${fall} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  opacity: 0.8;
  filter: blur(${props => props.blur}px);
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const SakuraBackground = () => {
    const petals = Array.from({ length: 30 }).map((_, i) => ({
        left: Math.random() * 100,
        size: Math.random() * 10 + 10, // 10px to 20px
        duration: Math.random() * 10 + 10, // 10s to 20s
        delay: Math.random() * 5,
        blur: Math.random() * 2,
    }));

    return (
        <Container>
            {petals.map((p, i) => (
                <Petal
                    key={i}
                    left={p.left}
                    size={p.size}
                    duration={p.duration}
                    delay={p.delay}
                    blur={p.blur}
                />
            ))}
        </Container>
    );
};

export default SakuraBackground;
