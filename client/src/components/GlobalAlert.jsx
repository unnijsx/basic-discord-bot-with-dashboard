import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';
import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const AlertWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  animation: ${slideDown} 0.5s ease-out;
  pointer-events: none; /* Let clicks pass through, but Alert itself needs pointer-events: auto */

  .ant-alert {
      pointer-events: auto;
      border-radius: 0;
      border: none;
      text-align: center;
      font-weight: 600;
  }
`;

const GlobalAlert = ({ alertData }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (alertData?.active) {
            setVisible(true);

            // Auto close after 10 seconds
            const timer = setTimeout(() => {
                setVisible(false);
            }, 10000);

            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [alertData]);

    if (!visible || !alertData?.active) return null;

    return (
        <AlertWrapper>
            <Alert
                message={alertData.message}
                type={alertData.type || 'info'}
                banner
                closable
                onClose={() => setVisible(false)}
            />
        </AlertWrapper>
    );
};

export default GlobalAlert;
