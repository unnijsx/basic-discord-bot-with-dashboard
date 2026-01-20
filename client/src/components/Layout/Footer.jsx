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
            &copy; {new Date().getFullYear()} <SecureLink href={link} target="_blank" rel="noopener noreferrer">Rheox</SecureLink>. All rights reserved.
        </FooterContainer>
    );
};

export default Footer;
