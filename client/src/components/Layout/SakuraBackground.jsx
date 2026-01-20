import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

const fall = keyframes`
  0% { opacity: 0; top: -10%; transform: translateX(0) rotate(0deg); }
  10% { opacity: 1; }
  20% { transform: translateX(-20px) rotate(45deg); }
  40% { transform: translateX(-20px) rotate(90deg); }
  60% { transform: translateX(-20px) rotate(135deg); }
  80% { transform: translateX(-20px) rotate(180deg); }
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
  z-index: 0;
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

const VideoBackground = styled.video`
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  z-index: -1;
  object-fit: cover;
  opacity: 0.4; /* Dimmed to not distract */
  filter: brightness(0.6) contrast(1.1); /* Slightly dark for contrast */
`;

const SakuraBackground = () => {
  const screens = useBreakpoint();
  // We'll treat "desktop" as md and up, but user specifically asked for desktop video.
  const isDesktop = screens.lg;

  // CSS Petals (Mobile / Fallback)
  const petals = Array.from({ length: 30 }).map((_, i) => ({
    left: Math.random() * 100,
    size: Math.random() * 10 + 10, // 10px to 20px
    duration: Math.random() * 10 + 10, // 10s to 20s
    delay: Math.random() * 5,
    blur: Math.random() * 2,
  }));

  if (isDesktop) {
    return (
      <Container>
        <VideoBackground autoPlay loop muted playsInline>
          <source src="/cherry_blossom.mp4" type="video/mp4" />
        </VideoBackground>
        {/* Optional: Add a few petals over the video for depth if desired, 
                    but usually video is enough. Let's keep it clean. */}
      </Container>
    );
  }

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
