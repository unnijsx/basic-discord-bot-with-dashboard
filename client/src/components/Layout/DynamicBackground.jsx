import React from 'react';
import styled from 'styled-components';
import { useBranding } from '../../context/BrandingContext';
import SakuraBackground from './SakuraBackground';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  background-color: #0a0a0a; /* Fallback */
`;

const ImageBg = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
`;

const VideoBg = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4);
`;

const GradientBg = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.background};
`;

const DynamicBackground = () => {
    const { backgroundType, backgroundValue } = useBranding();

    const renderBackground = () => {
        switch (backgroundType) {
            case 'video':
                return (
                    <VideoBg autoPlay loop muted playsInline>
                        <source src={backgroundValue} type="video/mp4" />
                    </VideoBg>
                );
            case 'image':
                return <ImageBg src={backgroundValue} />;
            case 'gradient':
                return <GradientBg background={backgroundValue} />;
            case 'sakura':
            default:
                return <SakuraBackground />;
        }
    };

    return (
        <BackgroundContainer>
            {renderBackground()}
        </BackgroundContainer>
    );
};

export default DynamicBackground;
