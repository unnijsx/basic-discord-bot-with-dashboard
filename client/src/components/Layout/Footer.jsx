import React from 'react';
import styled from 'styled-components';
import { getSecureSupportLink } from '../../utils/secureLinks';

const FooterContainer = styled.footer`
  background: #000;
  padding: 20px 0;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SecureLink = styled.a`
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;

  &:hover {
    color: #5865F2;
  }
`;

const Footer = () => {
  const link = getSecureSupportLink();

  return (
    <FooterContainer>
      <div>
        &copy; {new Date().getFullYear()} <SecureLink href={link} target="_blank" rel="noopener noreferrer">Rheox</SecureLink>. All rights reserved.
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '0.85rem' }}>
        <SecureLink href="/terms">Terms</SecureLink>
        <SecureLink href="/privacy">Privacy</SecureLink>
      </div>
    </FooterContainer>
  );
};

export default Footer;
