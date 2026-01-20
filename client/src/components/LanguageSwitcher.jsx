import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Button, Modal, Space } from 'antd';
import { GlobalOutlined, DownOutlined, WarningOutlined } from '@ant-design/icons';

const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' }
];

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const [targetLang, setTargetLang] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleLanguageClick = ({ key }) => {
        if (key === 'en') {
            i18n.changeLanguage('en');
        } else {
            setTargetLang(key);
            setIsModalVisible(true);
        }
    };

    const confirmSwitch = () => {
        if (targetLang) {
            i18n.changeLanguage(targetLang);
        }
        setIsModalVisible(false);
    };

    const items = languages.map(lang => ({
        key: lang.code,
        label: (
            <Space>
                <span style={{ fontSize: 16 }}>{lang.flag}</span>
                {lang.label}
            </Space>
        )
    }));

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <>
            <Dropdown menu={{ items, onClick: handleLanguageClick }} placement="bottomRight" trigger={['click']}>
                <Button type="text" style={{ color: '#fff' }} icon={<GlobalOutlined />}>
                    {currentLang.label} <DownOutlined />
                </Button>
            </Dropdown>

            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: '#faad14' }} />
                        {t('warning.title')}
                    </Space>
                }
                open={isModalVisible}
                onOk={confirmSwitch}
                onCancel={() => setIsModalVisible(false)}
                okText={t('warning.confirm')}
                cancelText={t('warning.cancel')}
                centered
                styles={{ content: { background: '#1e1f22', border: '1px solid #2b2d31' }, header: { background: 'transparent' }, body: { color: '#b9bbbe' }, mask: { backdropFilter: 'blur(5px)' } }}
                bodyStyle={{ color: '#b9bbbe' }} // Legacy Antd prop fallback
            >
                <p>{t('warning.content')}</p>
            </Modal>
        </>
    );
};

export default LanguageSwitcher;
